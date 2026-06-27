<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSourcingCampaignRequest;
use App\Models\Brief;
use App\Models\Candidat;
use App\Models\SocialComment;
use App\Models\SocialPost;
use App\Models\SourcingCampaign;
use App\Services\ActivityLogger;
use App\Services\ParameterService;
use App\Services\SocialSourcing\SourcingCampaignService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SourcingCampaignController extends Controller
{
    public function __construct(private readonly ParameterService $params) {}

    public function index(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.view');

            $sourcingCampaigns = SourcingCampaign::with('brief')
                ->withCount(['posts', 'comments'])
                ->latest()
                ->paginate(15);

            $logger->log('sourcing_campaign.index', 'Consultation de la liste des sourcing campaigns.', [], [SourcingCampaign::class]);

            return Inertia::render('SourcingCampaigns/Index', [
                'sourcingCampaigns' => $sourcingCampaigns,
            ]);

        } catch (\Throwable $e) {
            $logger->log('sourcing_campaign.index.error', $e->getMessage(), [], [SourcingCampaign::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de charger la liste des sourcing campaigns.']);
        }
    }

    public function create(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.create');

            $briefs = Brief::select('id', 'title')->orderBy('title')->get();

            $logger->log('sourcing_campaign.create', 'Affichage du formulaire de création.', [], [SourcingCampaign::class]);

            return Inertia::render('SourcingCampaigns/Create', [
                'briefs' => $briefs,
                'params' => $this->params->getAll(['sourcing_social_platforms']),
            ]);

        } catch (\Throwable $e) {
            $logger->log('sourcing_campaign.create.error', $e->getMessage(), [], [SourcingCampaign::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible d\'afficher le formulaire de création.']);
        }
    }

    public function store(StoreSourcingCampaignRequest $request, SourcingCampaignService $service): RedirectResponse|Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.create');

            $data = $request->validated();

            $sourcingCampaign = SourcingCampaign::create([
                'search_queries' => $data['search_queries'],
                'author_urls' => $data['author_urls'] ?? [],
                'max_posts' => $data['max_posts'] ?? 0,
                'posted_limit_date' => $data['posted_limit_date'] ?? null,
                'brief_id' => $data['brief_id'] ?? null,
                'status' => 'pending',
            ]);

            $run = $service->startRun(
                $data['search_queries'],
                $data['author_urls'],
                $data['max_posts'] ?? 0,
                $data['posted_limit_date'] ?? null,
            );

            $sourcingCampaign->update([
                'apify_run_id' => $run['data']['id'] ?? null,
                'apify_dataset_id' => $run['data']['defaultDatasetId'] ?? null,
                'status' => 'running',
            ]);

            $logger->log(
                'sourcing_campaign.store',
                "Création du sourcing campaign (ID : {$sourcingCampaign->id}).",
                ['sourcing_campaign_id' => $sourcingCampaign->id, 'search_queries' => $data['search_queries']],
                [SourcingCampaign::class]
            );

            return redirect()->route('dashboard.sourcing-campaigns.show', $sourcingCampaign);

        } catch (\Throwable $e) {
            $logger->log('sourcing_campaign.store.error', $e->getMessage(), ['exception' => $e->getMessage()], [SourcingCampaign::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible de créer le sourcing campaign.']);
        }
    }

    public function show(SourcingCampaign $sourcingCampaign): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.show');

            $sourcingCampaign->load(['brief', 'posts' => function ($q) {
                $q->with(['comments' => function ($q) {
                    $q->with('candidat')->orderBy('commented_at');
                }])->latest()->take(100);
            }]);

            $commentUrls = $sourcingCampaign->posts
                ->flatMap(fn ($post) => $post->comments->pluck('commenter_linkedin_url'))
                ->filter()
                ->unique()
                ->values();

            $totalCommenters = $commentUrls->count();
            $enrichedCount = $totalCommenters > 0
                ? Candidat::whereIn('linkedin_url', $commentUrls)->count()
                : 0;

            $logger->log('sourcing_campaign.show', "Consultation du sourcing campaign (ID : {$sourcingCampaign->id}).", ['sourcing_campaign_id' => $sourcingCampaign->id], [SourcingCampaign::class]);

            return Inertia::render('SourcingCampaigns/Show', [
                'sourcingCampaign' => $sourcingCampaign,
                'enrichment' => [
                    'total' => $totalCommenters,
                    'enriched' => $enrichedCount,
                    'done' => $totalCommenters > 0 && $enrichedCount >= $totalCommenters,
                ],
            ]);

        } catch (\Throwable $e) {
            $logger->log('sourcing_campaign.show.error', $e->getMessage(), ['sourcing_campaign_id' => $sourcingCampaign->id], [SourcingCampaign::class]);

            return Inertia::render('Fallback', ['error' => 'Impossible d\'afficher ce sourcing campaign.']);
        }
    }

    public function stream(Request $request, SourcingCampaignService $service): StreamedResponse
    {
        $this->authorize('sourcing-campaigns.show');

        $campaignId = (int) $request->query('campaign_id');

        $request->session()->save();

        return response()->stream(function () use ($campaignId, $service) {
            $emit = function (string $event, array $data) {
                echo "event: {$event}\n";
                echo 'data: '.json_encode($data)."\n\n";
                ob_flush();
                flush();
            };

            set_time_limit(600);

            $campaign = SourcingCampaign::find($campaignId);

            if (! $campaign || ! $campaign->apify_run_id) {
                $emit('error', ['message' => 'Campaign introuvable ou run non démarré.']);
                $emit('done', []);

                return;
            }

            if (in_array($campaign->status, ['completed', 'failed'])) {
                $emit('status', ['message' => $campaign->status]);
                $emit('done', ['status' => $campaign->status]);

                return;
            }

            $pollIntervalSeconds = 5;
            $maxPolls = (int) (600 / $pollIntervalSeconds);

            for ($i = 0; $i < $maxPolls; $i++) {
                sleep($pollIntervalSeconds);

                if (connection_aborted()) {
                    break;
                }

                $run = $service->getRun($campaign->apify_run_id);
                $status = $run['status'] ?? 'UNKNOWN';

                if (in_array($status, ['FAILED', 'ABORTED', 'TIMED-OUT'])) {
                    $campaign->update([
                        'status' => 'failed',
                        'error_message' => "Apify run ended with status: {$status}",
                    ]);
                    $emit('error', ['message' => "Run ended with status: {$status}"]);
                    $emit('done', ['status' => 'failed']);
                    break;
                }

                if ($status === 'SUCCEEDED') {
                    $datasetId = $run['defaultDatasetId'] ?? $campaign->apify_dataset_id;

                    if (! $datasetId) {
                        $campaign->update(['status' => 'failed', 'error_message' => 'Run succeeded but no dataset id returned.']);
                        $emit('error', ['message' => 'No dataset id returned.']);
                        $emit('done', ['status' => 'failed']);
                        break;
                    }

                    $campaign->update(['apify_dataset_id' => $datasetId]);

                    $items = $service->getDatasetItems($datasetId);

                    // Separate posts and comments (Apify returns a flat array)
                    $postItems = array_filter($items, fn ($i) => ($i['type'] ?? '') === 'post');
                    $commentItems = array_filter($items, fn ($i) => ($i['type'] ?? '') === 'comment');

                    // First pass: store all posts, build postId → SocialPost map
                    $postMap = [];
                    $stored = 0;
                    foreach ($postItems as $item) {
                        $post = $this->storeSocialPost($campaign, $item);
                        $postMap[$item['id']] = $post;
                        $stored++;
                        if ($stored % 10 === 0) {
                            $emit('progress', ['stored' => $stored, 'total' => count($postItems)]);
                        }
                    }

                    // Second pass: store all comments linked to their parent post
                    foreach ($commentItems as $comment) {
                        $postId = $comment['postId'] ?? null;
                        $parentPost = $postId ? ($postMap[$postId] ?? null) : null;

                        // If parent post not in map (e.g. post was filtered out), skip
                        if (! $parentPost) {
                            continue;
                        }

                        $this->storeSocialComment($parentPost, $comment);
                    }

                    $campaign->update(['status' => 'completed']);
                    $emit('done', ['status' => 'completed', 'posts_stored' => $stored]);
                    break;
                }

                // Still running — emit a heartbeat every ~30s
                if ($i % 6 === 5) {
                    $emit('status', ['message' => 'running']);
                }
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function addMentionedCandidat(Request $request): RedirectResponse
    {
        $this->authorize('sourcing-campaigns.show');

        $name = $request->input('name');
        $linkedinUrl = $request->input('linkedin_url');
        $campaignId = $request->input('sourcing_campaign_id');
        $postId = $request->input('post_id');

        if (! $name && ! $linkedinUrl) {
            return back()->withErrors(['mention' => 'Not enough data to create a candidate.']);
        }

        $campaign = $campaignId ? SourcingCampaign::with('brief')->find($campaignId) : null;
        $post = $postId ? SocialPost::find($postId) : null;
        $brief = $campaign?->brief;

        $candidat = Candidat::firstOrCreate(
            ['linkedin_url' => $linkedinUrl ?: null],
            [
                'full_name' => $name,
                'source' => 'sourcing_campaign_mention',
                'source_url' => $linkedinUrl,
                'status' => 'sourced',
                'source_context' => [
                    'type' => 'mention',
                    'sourcing_campaign_id' => $campaign?->id,
                    'brief_id' => $brief?->id,
                    'brief_title' => $brief?->title,
                    'post_id' => $post?->id,
                    'post_url' => $post?->linkedin_url,
                    'post_author' => $post?->author_name,
                ],
            ]
        );

        $name = $candidat->full_name ?? $name;
        $message = $candidat->wasRecentlyCreated
            ? "{$name} ajouté à la base candidats."
            : "{$name} existe déjà dans la base candidats.";

        return back()->with('success', $message);
    }

    public function addCandidat(SocialComment $comment): RedirectResponse
    {
        $this->authorize('sourcing-campaigns.show');

        if (! $comment->commenter_linkedin_url && ! $comment->commenter_name) {
            return back()->withErrors(['comment' => 'Not enough data to create a candidate.']);
        }

        $comment->load('post.sourcingCampaign.brief');
        $post = $comment->post;
        $campaign = $post?->sourcingCampaign;
        $brief = $campaign?->brief;

        $candidat = Candidat::firstOrCreate(
            ['linkedin_url' => $comment->commenter_linkedin_url],
            [
                'full_name' => $comment->commenter_name,
                'current_title' => $comment->commenter_position,
                'source' => 'sourcing_campaign',
                'source_url' => $comment->commenter_linkedin_url,
                'status' => 'sourced',
                'source_context' => [
                    'type' => 'comment',
                    'sourcing_campaign_id' => $campaign?->id,
                    'brief_id' => $brief?->id,
                    'brief_title' => $brief?->title,
                    'post_id' => $post?->id,
                    'post_url' => $post?->linkedin_url,
                    'post_author' => $post?->author_name,
                    'comment_id' => $comment->id,
                    'comment_text' => $comment->commentary,
                ],
            ]
        );

        $name = $candidat->full_name ?? 'Candidat';
        $message = $candidat->wasRecentlyCreated
            ? "{$name} ajouté à la base candidats."
            : "{$name} existe déjà dans la base candidats.";

        return back()->with('success', $message);
    }

    private function storeSocialPost(SourcingCampaign $campaign, array $item): SocialPost
    {
        $author = $item['author'] ?? [];

        return SocialPost::updateOrCreate(
            [
                'sourcing_campaign_id' => $campaign->id,
                'linkedin_post_id' => $item['id'] ?? $item['linkedinUrl'] ?? md5(($item['content'] ?? '').($item['postedAt']['date'] ?? '')),
            ],
            [
                'linkedin_url' => $item['linkedinUrl'] ?? null,
                'content' => $item['content'] ?? null,
                'author_name' => $author['name'] ?? null,
                'author_public_identifier' => $author['publicIdentifier'] ?? null,
                'author_linkedin_url' => $author['linkedinUrl'] ?? null,
                'author_info' => $author['info'] ?? null,
                'posted_at' => isset($item['postedAt']['date']) ? Carbon::parse($item['postedAt']['date']) : null,
            ]
        );
    }

    private function storeSocialComment(SocialPost $post, array $comment): void
    {
        $actor = $comment['actor'] ?? [];

        // Extract structured profile mentions from commentaryAttributes
        $mentions = [];
        foreach ($comment['commentaryAttributes'] ?? [] as $attr) {
            if (($attr['type'] ?? '') === 'PROFILE_MENTION' && isset($attr['profile'])) {
                $profile = $attr['profile'];
                $name = trim(($profile['firstName'] ?? '').' '.($profile['lastName'] ?? ''));
                if ($name) {
                    $mentions[] = [
                        'name' => $name,
                        'linkedinUrl' => $profile['linkedinUrl'] ?? null,
                    ];
                }
            }
        }

        SocialComment::updateOrCreate(
            [
                'social_post_id' => $post->id,
                'linkedin_comment_id' => $comment['id'] ?? null,
            ],
            [
                'commenter_name' => $actor['name'] ?? null,
                'commenter_linkedin_url' => $actor['linkedinUrl'] ?? null,
                'commenter_position' => $actor['position'] ?? null,
                'commentary' => $comment['commentary'] ?? null,
                'mentions' => ! empty($mentions) ? $mentions : null,
                'commented_at' => isset($comment['createdAt']) ? Carbon::parse($comment['createdAt']) : null,
            ]
        );
    }
}
