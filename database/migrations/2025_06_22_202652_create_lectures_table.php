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
        Schema::create('lectures', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->longText('content')->nullable(); // For lecture content/notes
            $table->string('video_url')->nullable(); // YouTube or other video URLs
            $table->string('youtube_id')->nullable(); // Extracted YouTube video ID
            $table->integer('duration')->nullable(); // in seconds
            $table->json('metadata')->nullable(); // Additional metadata
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('course_module_id')->nullable()->constrained('course_modules')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['course_id', 'order']);
            $table->index(['course_module_id', 'order']);
            $table->index('is_published');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lectures');
    }
};
