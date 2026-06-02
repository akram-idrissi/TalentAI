<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->unique();
            $table->string('label');
            $table->string('category');
            $table->string('icon');
            $table->text('description');
            $table->string('token_label');
            $table->string('placeholder')->nullable();
            $table->string('env_key')->nullable();
            $table->string('test_url')->nullable();
            $table->string('docs_url')->nullable();
            $table->boolean('oauth')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
