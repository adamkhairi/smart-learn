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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grades_summary_id')->constrained('grades_summaries')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2);
            $table->decimal('weight', 5, 2);
            $table->string('type'); // Exam or Assignment
            $table->string('title');
            $table->timestamp('graded_at');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['grades_summary_id', 'student_id']);
            $table->index(['student_id', 'assessment_id']);
            $table->index('type');
            $table->index('graded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
