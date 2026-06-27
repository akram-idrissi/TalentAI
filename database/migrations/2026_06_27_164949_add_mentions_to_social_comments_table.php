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
        Schema::table('social_comments', function (Blueprint $table) {
            $table->json('mentions')->nullable()->after('commentary');
        });
    }

    public function down(): void
    {
        Schema::table('social_comments', function (Blueprint $table) {
            $table->dropColumn('mentions');
        });
    }
};
