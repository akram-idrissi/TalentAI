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
            // 1. Beddlna unsignedBigInteger b UUID
            $table->uuid('brief_id');
            $table->uuid('candidat_id');

            $table->float('score')->nullable();
            $table->json('score_breakdown')->nullable();
            $table->timestamp('sourced_at')->nullable();

            // 2. Primary key using both UUIDs
            $table->primary(['brief_id', 'candidat_id']);

            // 3. Constraints match with UUID parents
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
