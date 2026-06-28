<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::select("
            SELECT
                c.id AS candidat_id,
                sc.brief_id,
                NOW() AS sourced_at,
                NOW() AS created_at,
                NOW() AS updated_at
            FROM candidats c
            JOIN social_comments sco
                ON sco.id = JSON_UNQUOTE(JSON_EXTRACT(c.source_context, '$.comment_id'))
            JOIN social_posts sp ON sp.id = sco.social_post_id
            JOIN sourcing_campaigns sc ON sc.id = sp.sourcing_campaign_id
            WHERE c.source LIKE 'sourcing_campaign%'
              AND sc.brief_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM brief_candidat bc
                  WHERE bc.candidat_id = c.id AND bc.brief_id = sc.brief_id
              )
        ");

        if (! empty($rows)) {
            DB::table('brief_candidat')->insert(
                array_map(fn ($row) => (array) $row, $rows)
            );
        }
    }

    public function down(): void {}
};
