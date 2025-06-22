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
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('follows_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Unique constraint to prevent duplicate follows
            $table->unique(['user_id', 'follows_id']);

            // Indexes
            $table->index('follows_id'); // For getting followers
            $table->index('user_id'); // For getting who user follows
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};
