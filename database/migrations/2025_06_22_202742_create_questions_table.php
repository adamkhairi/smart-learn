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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['MCQ', 'Essay'])->default('MCQ');
            $table->integer('question_number');
            $table->integer('points');
            $table->longText('question_text');
            $table->boolean('auto_graded')->default(false);
            $table->foreignId('assessment_id')->constrained('assessments')->cascadeOnDelete();
            $table->json('choices')->nullable(); // For MCQ questions
            $table->text('answer')->nullable(); // For correct answer
            $table->json('keywords')->nullable(); // For essay questions
            $table->boolean('text_match')->default(false);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('type');
            $table->index(['assessment_id', 'question_number']);
            $table->index('auto_graded');

            // Questions belong to assessments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
