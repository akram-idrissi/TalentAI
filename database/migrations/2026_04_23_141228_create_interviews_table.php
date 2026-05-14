<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Foreign Keys (UUIDs to match Candidates and Briefs)
            $table->uuid('candidate_id');
            $table->uuid('brief_id')->nullable(); // Made nullable if brief is selected later

            // 3. Interviewer (User ID)
            $table->unsignedBigInteger('interviewer_id')->nullable(); // Nullable for automated uploads

            $table->enum('platform', ['zoom', 'meet', 'teams', 'presentiel'])->default('zoom');

            // Storage path for the recording file (MP4/MP3)
            $table->string('video_path')->nullable();

            $table->integer('duration_seconds')->nullable();

            /**
             * AI & Transcription Columns (Module 4.1 & 4.2)
             */
            // Output from OpenAI Whisper API
            $table->longText('transcription')->nullable();

            // AI Analysis Report from Claude API (Scores, Strengths, Verdict)
            $table->json('ai_report')->nullable();

            // Final Verdict based on functional specs
            $table->enum('verdict', ['recommended', 'solid', 'to_deepen', 'rejected'])->nullable();

            $table->enum('status', [
                'pending',
                'transcribing',
                'analyzing',
                'completed',
                'failed',
            ])->default('pending');

            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            // 4. Relations (Constraints)
            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats')
                ->onDelete('cascade');

            // Note: Ensure 'briefs' table exists before running this
            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
