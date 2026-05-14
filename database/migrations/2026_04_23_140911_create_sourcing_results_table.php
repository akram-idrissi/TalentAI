<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sourcing_results', function (Blueprint $table) {
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Foreign Keys (Beddlna BigInteger b UUID)
            $table->uuid('brief_id');
            $table->uuid('candidate_id');

            $table->enum('platform', ['linkedin', 'indeed', 'facebook']);
            $table->string('profile_url')->nullable();
            $table->integer('ai_score');
            $table->boolean('retained');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('sourced_at');

            // 3. Constraints (Rabt m3a l-ID dial briefs w candidats)
            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->onDelete('cascade');

            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats')
                ->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sourcing_results');
    }
};
