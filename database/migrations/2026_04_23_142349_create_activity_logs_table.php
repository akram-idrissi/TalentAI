<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('activity_logs');

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // Actor
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('user_role')->nullable();
            $table->boolean('is_authenticated')->default(false);

            // Action
            $table->string('action');
            $table->text('description')->nullable();

            // Origin
            $table->string('controller')->nullable();
            $table->string('controller_method')->nullable();
            $table->string('http_method', 10)->nullable();
            $table->text('url')->nullable();

            // Request context
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('request_data')->nullable();

            // Models touched (array of class names)
            $table->json('models')->nullable();

            // Extra arbitrary data
            $table->json('properties')->nullable();

            $table->timestamp('logged_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
