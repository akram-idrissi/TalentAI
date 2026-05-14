<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transcriptions', function (Blueprint $table) {
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Foreign Key using UUID (darouri bach y-matchi Interviews)
            $table->uuid('interview_id')->unique();

            $table->longText('transcript_text')->nullable();
            $table->float('whisper_confidence')->nullable();
            $table->string('language')->nullable();
            $table->integer('progress_pct')->default(0);

            // 3. Constraints
            $table->foreign('interview_id')
                ->references('id')
                ->on('interviews')
                ->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcriptions');
    }
};
