<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_reports', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('interview_id');

            $table->unsignedBigInteger('candidate_id');

            $table->unsignedBigInteger('brief_id');

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

            $table->foreign('interview_id')
                ->references('id')
                ->on('interviews');

            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats');

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs');

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_reports');
    }
};
