<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();

            $table->unsignedBigInteger('user_id');

            $table->enum('provider', [
                'linkedin',
                'indeed',
                'facebook',
                'whisper',
                'claude',
                'google_calendar',
            ]);

            $table->text('api_token');

            $table->integer('credits_used')->default(0);

            $table->integer('credits_limit')->nullable();

            $table->timestamp('token_expires_at')->nullable();

            $table->boolean('active')->default(true);

            $table->foreign('user_id')
                ->references('id')
                ->on('users');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
