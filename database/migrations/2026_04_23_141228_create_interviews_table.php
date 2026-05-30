<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('candidate_id');

            $table->unsignedBigInteger('brief_id');

            $table->unsignedBigInteger('interviewer_id');

            $table->enum('platform', ['zoom', 'meet', 'teams', 'presentiel']);

            $table->text('expectations')->nullable();

            $table->enum('status', [
                'scheduled',
                'recording_uploaded',
                'transcribing',
                'analyzed',
                'done',
            ]);

            $table->timestamp('scheduled_at')->nullable();

            $table->timestamp('completed_at')->nullable();

            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats');

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs');

            $table->foreign('interviewer_id')
                ->references('id')
                ->on('users');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
