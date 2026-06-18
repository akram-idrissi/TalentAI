<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transcriptions', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('interview_id')->unique();

            $table->foreign('interview_id')
                ->references('id')
                ->on('interviews');

            $table->string('audio_path');
            $table->string('audio_url')->nullable();
            $table->string('status')->default('pending');
            $table->longText('transcript_text')->nullable();
            $table->longText('diarized_transcript')->nullable();
            $table->text('error')->nullable();

            $table->string('analysis_status')->default('pending');

            $table->unsignedTinyInteger('analysis_score')->nullable();
            $table->string('analysis_verdict')->nullable();
            $table->json('analysis_result')->nullable();
            $table->text('analysis_error')->nullable();
            $table->string('assemblyai_transcript_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcriptions');
    }
};
