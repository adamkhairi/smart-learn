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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('photo')->nullable()->default('https://www.w3schools.com/howto/img_avatar.png');
            $table->string('mobile')->nullable();
            $table->enum('role', ['admin', 'student', 'instructor'])->default('student');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_email_registered')->default(false);
            $table->integer('code')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->string('password_reset_token')->nullable();
            $table->timestamp('password_reset_validity')->nullable();
            $table->json('invalidated_tokens')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['name', 'username']);
            $table->index('role');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
