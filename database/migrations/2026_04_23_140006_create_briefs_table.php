<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('briefs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by');
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
            $table->foreign('created_by')
                ->references('id')
                ->on('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('briefs');
    }
};
