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
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Foreign Key using UUID (Match with Briefs)
            $table->uuid('brief_id');

            $table->string('run_id')->unique();
            $table->string('dataset_id')->nullable()->unique();
            $table->string('status')->default('pending');
            $table->json('meta')->nullable();
            $table->unsignedInteger('candidates_imported')->default(0);

            // 3. Constraint for Foreign Key
            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs')
                ->cascadeOnDelete();

            $table->timestamps();
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
