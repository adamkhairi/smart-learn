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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->longText('instructions')->nullable();
            $table->enum('type', ['essay', 'file_upload', 'text', 'url'])->default('text');
            $table->integer('max_points')->default(100);
            $table->timestamp('due_date')->nullable();
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->boolean('is_published')->default(false);
            $table->boolean('allow_late_submission')->default(true);
            $table->decimal('late_penalty_percentage', 5, 2)->default(0);
            $table->integer('max_file_size_mb')->default(10);
            $table->json('allowed_file_types')->nullable();
            $table->integer('max_attempts')->default(1);
            $table->boolean('show_grades_immediately')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
