<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sourcing_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('brief_id');
            $table->unsignedBigInteger('candidate_id');
            $table->enum('platform', ['linkedin', 'indeed', 'facebook']);
            $table->string('profile_url')->nullable();
            $table->integer('ai_score');
            $table->boolean('retained');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('sourced_at');

            $table->foreign('brief_id')
                ->references('id')
                ->on('briefs');

            $table->foreign('candidate_id')
                ->references('id')
                ->on('candidats');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sourcing_results');
    }
};
