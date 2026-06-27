<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sourcing_campaigns', function (Blueprint $table) {
            $table->dropColumn(['target_urls', 'poll_attempts']);
            $table->json('search_queries')->after('id');
            $table->json('author_urls')->nullable()->after('search_queries');
        });
    }

    public function down(): void
    {
        Schema::table('sourcing_campaigns', function (Blueprint $table) {
            $table->dropColumn(['search_queries', 'author_urls']);
            $table->json('target_urls')->after('id');
            $table->unsignedInteger('poll_attempts')->default(0);
        });
    }
};
