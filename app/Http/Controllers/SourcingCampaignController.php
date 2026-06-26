<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSourcingCampaignRequest;
use App\Jobs\SocialPostScrapePollerJob;
use App\Models\Brief;
use App\Models\Candidat;
use App\Models\SourcingCampaign;
use App\Services\ActivityLogger;
use App\Services\ParameterService;
use App\Services\SocialSourcing\SourcingCampaignService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SourcingCampaignController extends Controller
{
    public function __construct(private readonly ParameterService $params) {}

    /**
     * Display a paginated list of all sourcing campaigns with post and candidate counts.
     *
     * @return Response Inertia page — SourcingCampaigns/Index — or Fallback on failure
     */
    public function index(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.view');

            $sourcingCampaigns = SourcingCampaign::with([
                'brief',
            ])
                ->withCount(['posts', 'candidats'])
                ->latest()
                ->paginate(15);

            $logger->log(
                'sourcing_campaign.index',
                'Consultation de la liste des sourcing campaigns.',
                [],
                [SourcingCampaign::class]
            );

            return Inertia::render('SourcingCampaigns/Index', [
                'sourcingCampaigns' => $sourcingCampaigns,
            ]);

        } catch (\Throwable $e) {
            $logger->log(
                'sourcing_campaign.index.error',
                'Erreur lors de la récupération des sourcing campaigns : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [SourcingCampaign::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de charger la liste des sourcing campaigns.',
            ]);
        }
    }

    /**
     * Show the form for creating a new sourcing campaign.
     *
     * @return Response Inertia page — SourcingCampaigns/Create — or Fallback on failure
     */
    public function create(): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.create');

            $briefs = Brief::select('id', 'title')->orderBy('title')->get();

            $logger->log(
                'sourcing_campaign.create',
                'Affichage du formulaire de création d\'un sourcing campaign.',
                [],
                [SourcingCampaign::class]
            );

            return Inertia::render('SourcingCampaigns/Create', [
                'briefs' => $briefs,
                'params' => $this->params->getAll([
                    'sourcing_social_platforms',
                ]),
            ]);

        } catch (\Throwable $e) {
            $logger->log(
                'sourcing_campaign.create.error',
                'Erreur lors de l\'affichage du formulaire de création : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [SourcingCampaign::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher le formulaire de création.',
            ]);
        }
    }

    /**
     * Validate, persist a new sourcing campaign, trigger the Apify run, and dispatch the poller job.
     *
     * @param  StoreSourcingCampaignRequest  $request  Validated request containing target_urls, max_posts, posted_limit_date, brief_id
     * @param  SourcingCampaignService  $service  Service responsible for starting the Apify scrape run
     * @return RedirectResponse Redirects to the campaign show page on success, or Fallback on failure
     */
    public function store(StoreSourcingCampaignRequest $request, SourcingCampaignService $sourcingCampaignService): RedirectResponse|Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.create');

            $data = $request->validated();

            $sourcingCampaign = SourcingCampaign::create([
                'target_urls' => $data['target_urls'],
                'max_posts' => $data['max_posts'] ?? 0,
                'posted_limit_date' => $data['posted_limit_date'] ?? null,
                'brief_id' => $data['brief_id'],
                'status' => 'pending',
            ]);

            $run = $sourcingCampaignService->startRun(
                $data['target_urls'],
                $data['max_posts'] ?? 0,
                $data['posted_limit_date'] ?? null,
            );

            $sourcingCampaign->update([
                'apify_run_id' => $run['data']['id'] ?? null,
                'apify_dataset_id' => $run['data']['defaultDatasetId'] ?? null,
                'status' => 'running',
            ]);

            SocialPostScrapePollerJob::dispatch($sourcingCampaign->id)->delay(now()->addSeconds(10));

            try {
                $logger->log(
                    'sourcing_campaign.store',
                    "Création du sourcing campaign (ID : {$sourcingCampaign->id}) avec ".count($data['target_urls']).' URL(s) cible(s).',
                    ['sourcing_campaign_id' => $sourcingCampaign->id, 'target_urls' => $data['target_urls']],
                    [SourcingCampaign::class]
                );
            } catch (\Throwable) {
                // logging non bloquant
            }

            return redirect()->route('dashboard.sourcing-campaigns.show', $sourcingCampaign);

        } catch (\Throwable $e) {
            $logger->log(
                'sourcing_campaign.store.error',
                'Erreur lors de la création du sourcing campaign : '.$e->getMessage(),
                ['exception' => $e->getMessage()],
                [SourcingCampaign::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible de créer le sourcing campaign.',
            ]);
        }
    }

    /**
     * Display the specified sourcing campaign with its posts, comments, and candidate enrichment stats.
     *
     * @param  SourcingCampaign  $sourcingCampaign  Route-model-bound SourcingCampaign instance
     * @return Response Inertia page — SourcingCampaigns/Show — or Fallback on failure
     */
    public function show(SourcingCampaign $sourcingCampaign): Response
    {
        /** @var ActivityLogger $logger */
        $logger = app(ActivityLogger::class);

        try {
            $this->authorize('sourcing-campaigns.show');

            $sourcingCampaign->load([
                'posts.comments.candidat',
            ]);

            $commentUrls = $sourcingCampaign->posts
                ->flatMap(fn ($post) => $post->comments->pluck('commenter_linkedin_url'))
                ->filter()
                ->unique()
                ->values();

            $totalCommenters = $commentUrls->count();

            $enrichedCount = $totalCommenters > 0
                ? Candidat::whereIn('linkedin_url', $commentUrls)->count()
                : 0;

            $logger->log(
                'sourcing_campaign.show',
                "Consultation du sourcing campaign (ID : {$sourcingCampaign->id}).",
                ['sourcing_campaign_id' => $sourcingCampaign->id],
                [SourcingCampaign::class]
            );

            return Inertia::render('SourcingCampaigns/Show', [
                'sourcingCampaign' => $sourcingCampaign,
                'enrichment' => [
                    'total' => $totalCommenters,
                    'enriched' => $enrichedCount,
                    'done' => $totalCommenters > 0 && $enrichedCount >= $totalCommenters,
                ],
            ]);

        } catch (\Throwable $e) {
            $logger->log(
                'sourcing_campaign.show.error',
                "Erreur lors de la consultation du sourcing campaign (ID : {$sourcingCampaign->id}) : ".$e->getMessage(),
                ['sourcing_campaign_id' => $sourcingCampaign->id, 'exception' => $e->getMessage()],
                [SourcingCampaign::class]
            );

            return Inertia::render('Fallback', [
                'error' => 'Impossible d\'afficher ce sourcing campaign.',
            ]);
        }
    }
}
