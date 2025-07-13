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
        Schema::create('user_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('course_module_id')->nullable()->constrained('course_modules')->cascadeOnDelete();
            $table->foreignId('course_module_item_id')->nullable()->constrained('course_module_items')->cascadeOnDelete();

            // Progress tracking fields
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'failed'])->default('not_started');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();

            // Time tracking
            $table->integer('time_spent_seconds')->default(0); // Total time spent on this item
            $table->integer('view_count')->default(0); // Number of times viewed

            // Assessment/Assignment specific fields
            $table->decimal('score', 5, 2)->nullable(); // For assessments/assignments
            $table->decimal('max_score', 5, 2)->nullable();
            $table->boolean('is_graded')->default(false);

            // Additional metadata
            $table->json('metadata')->nullable(); // For storing additional progress data

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['user_id', 'course_id']);
            $table->index(['user_id', 'course_module_id']);
            $table->index(['user_id', 'course_module_item_id']);
            $table->index('status');
            $table->index('completed_at');

            // Unique constraint to prevent duplicate progress records
            $table->unique(['user_id', 'course_module_item_id'], 'unique_user_module_item_progress');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
