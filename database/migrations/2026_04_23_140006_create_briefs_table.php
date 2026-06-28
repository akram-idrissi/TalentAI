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
            $table->string('mission_code')->nullable();
            $table->string('product_reference')->nullable();
            $table->string('title');
            $table->string('sector');
            $table->enum('contract_type', ['CDI', 'CDD', 'Freelance', 'Stage']);
            $table->string('location');
            $table->string('salary_range')->nullable();
            $table->integer('min_experience_years');
            $table->unsignedTinyInteger('min_years_at_current_company')->nullable();
            $table->string('education_level');
            $table->text('languages')->nullable();
            $table->string('seniority_level')->nullable();
            $table->text('target_companies')->nullable();
            $table->string('company_headcount')->nullable();
            $table->string('linkedin_function')->nullable();
            $table->enum('gender_pref', ['M', 'F', 'any'])->nullable();
            $table->string('age_range')->nullable();
            $table->text('mission_description');
            $table->text('required_skills');
            $table->text('soft_skills')->nullable();
            $table->text('search_prompt')->nullable();
            $table->text('current_query')->nullable();
            $table->unsignedSmallInteger('next_start_page')->default(1);
            $table->json('scoring_weights');
            $table->timestamp('date_lancement')->nullable();
            $table->timestamp('date_cloture')->nullable();
            $table->enum('status', ['draft', 'active', 'sourcing', 'interviews', 'closed', 'cloture', 'lancement']);
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
