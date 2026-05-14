<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('briefs', function (Blueprint $table) {
            // 1. Primary Key using UUID
            $table->uuid('id')->primary();

            // 2. Created by (User ID) - Often UUID in modern Laravel/Inertia apps
            // If your 'users' table still uses normal IDs, keep it as bigInteger,
            // but usually, it's better to use foreignUuid if users are also UUID.
            $table->foreignId('created_by')->constrained('users');

            $table->string('title');
            $table->string('sector');
            $table->enum('contract_type', ['CDI', 'CDD', 'Freelance', 'Stage']);
            $table->string('location');
            $table->string('salary_range')->nullable();
            $table->integer('min_experience_years');
            $table->string('education_level');
            $table->text('languages')->nullable();
            $table->string('seniority_level')->nullable();
            $table->text('target_companies')->nullable();
            $table->enum('gender_pref', ['M', 'F', 'any'])->nullable();
            $table->string('age_range')->nullable();
            $table->text('mission_description');
            $table->text('required_skills');
            $table->text('soft_skills')->nullable();
            $table->json('scoring_weights');
            $table->enum('status', ['draft', 'active', 'sourcing', 'interviews', 'closed']);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('briefs');
    }
};
