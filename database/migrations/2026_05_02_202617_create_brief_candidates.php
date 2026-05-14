<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('brief_candidat', function (Blueprint $table) {
            $table->unsignedBigInteger('brief_id');
            $table->unsignedBigInteger('candidat_id');

            $table->float('score')->nullable();
            $table->json('score_breakdown')->nullable();
            $table->timestamp('sourced_at')->nullable();

            $table->primary(['brief_id', 'candidat_id']);

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->cascadeOnDelete();

            $table->foreign('candidat_id')
                ->references('id')
                ->on('candidats')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brief_candidat');
    }
};
