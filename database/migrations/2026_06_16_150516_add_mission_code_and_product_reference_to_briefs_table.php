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
            $table->string('mission_code')->nullable()->after('id');
            $table->string('product_reference')->nullable()->after('mission_code');
        });
    }

    public function down(): void
    {
        Schema::table('briefs', function (Blueprint $table) {
            $table->dropColumn([
                'mission_code',
                'product_reference',
            ]);
        });
    }
};
