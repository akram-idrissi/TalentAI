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
        Schema::create('apify_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brief_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('run_id')->unique();
            $table->string('dataset_id')->nullable()->unique();
            $table->string('status')->default('pending');
            $table->unsignedInteger('candidates_imported')->default(0);
            $table->unsignedInteger('dataset_offset')->default(0);
            $table->unsignedInteger('total_items')->nullable();
            $table->json('search_params')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apify_runs');
    }
};
