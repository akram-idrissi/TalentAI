<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidats', function (Blueprint $table) {
            // 1. Primary Key using UUID as per project specs
            $table->uuid('id')->primary();

            // 2. Personal Info
            $table->string('full_name')->nullable();
            $table->string('email')->unique()->nullable(); // Added this for Module 4 reports
            $table->string('linkedin_url')->unique()->nullable();

            // 3. Professional Info
            $table->string('headline')->nullable();
            $table->string('location')->nullable();
            $table->text('summary')->nullable();
            $table->json('skills')->nullable();
            $table->string('current_company')->nullable();
            $table->string('current_title')->nullable();
            $table->float('experience_years')->nullable();
            $table->string('education_level')->nullable();
            $table->string('sector')->nullable();

            // 4. Status & Tracking
            $table->boolean('open_to_work')->default(false);
            $table->string('source')->default('apify');
            $table->json('raw_data')->nullable();
            $table->string('source_url')->nullable();
            $table->enum('status', [
                'sourced',
                'contacted',
                'interview',
                'recommended',
                'offer',
                'rejected',
            ])->default('sourced');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidats');
    }
};
