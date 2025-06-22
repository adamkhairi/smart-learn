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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->json('files')->nullable();
            $table->enum('plagiarism_status', ['processing', 'unCalculated', 'none', 'med', 'high', 'veryHigh'])->default('unCalculated');
            $table->enum('auto_grading_status', ['processing', 'unGraded', 'Graded'])->default('unGraded');
            $table->boolean('finished')->default(false); // for exams only
            $table->decimal('score', 5, 2)->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->integer('number_of_exam_joins')->default(0);
            $table->json('answers')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['course_id', 'user_id']);
            $table->index(['assessment_id', 'user_id']);
            $table->index('auto_grading_status');
            $table->index('plagiarism_status');
            $table->index('graded_by');

            // Submissions belong to assessments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
