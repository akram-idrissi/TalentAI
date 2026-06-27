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
        Schema::table('social_posts', function (Blueprint $table) {
            $table->text('linkedin_url')->nullable()->change();
            $table->text('author_linkedin_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('social_posts', function (Blueprint $table) {
            $table->string('linkedin_url')->nullable()->change();
            $table->string('author_linkedin_url')->nullable()->change();
        });
    }
};
