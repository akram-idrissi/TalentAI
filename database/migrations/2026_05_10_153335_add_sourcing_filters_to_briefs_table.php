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
        Schema::table('briefs', function (Blueprint $table) {
            $table->string('seniority_level')->nullable()->after('languages');
            $table->text('target_companies')->nullable()->after('seniority_level');
        });
    }

    public function down(): void
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->dropColumn(['seniority_level', 'target_companies']);
        });
    }
};
