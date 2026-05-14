<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cv_analyses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('brief_id');
            $table->json('extracted_text');
            $table->integer('score_global');
            $table->integer('score_experience');
            $table->integer('score_education');
            $table->integer('score_sector');
            $table->integer('score_softskills');
            $table->integer('score_location');
            $table->text('ai_summary');
            $table->text('ai_summary_en');
            $table->string('cv_file_path');
            $table->json('ai_tags')->nullable();
            $table->timestamp('analyzed_at');
            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats');
            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cv_analyses');
    }
};
