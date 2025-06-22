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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('max_score');
            $table->integer('weight')->default(1);
            $table->enum('questions_type', ['online', 'file'])->default('online');
            $table->enum('submission_type', ['online', 'written'])->default('online');
            $table->enum('visibility', ['published', 'unpublished'])->default('published');
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->json('files')->nullable();
            $table->timestamp('open_at');
            $table->timestamp('close_at');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('visibility');
            $table->index(['course_id', 'open_at']);
            $table->index(['open_at', 'close_at']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
