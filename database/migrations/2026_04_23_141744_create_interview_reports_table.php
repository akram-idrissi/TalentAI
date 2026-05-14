<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_reports', function (Blueprint $table) {
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Foreign Keys match with UUIDs
            $table->uuid('interview_id');
            $table->uuid('candidate_id');
            $table->uuid('brief_id');

            $table->integer('score_global');
            $table->integer('score_communication');
            $table->integer('score_strategy');
            $table->integer('score_leadership');
            $table->integer('score_team_mgmt');
            $table->integer('score_culture_fit');
            $table->integer('score_salary_fit');

            $table->text('strengths');
            $table->text('watch_points')->nullable();
            $table->json('key_excerpts')->nullable();

            $table->enum('verdict', [
                'recommended',
                'solid',
                'to_deepen',
                'rejected',
            ]);

            $table->text('ai_recommendation');
            $table->timestamp('generated_at');

            // 3. Constraints (Rabt m3a ga3 l-tables UUID)
            $table->foreign('interview_id')
                ->references('id')
                ->on('interviews')
                ->onDelete('cascade');

            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats')
                ->onDelete('cascade');

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onDelete('cascade');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_reports');
    }
};
