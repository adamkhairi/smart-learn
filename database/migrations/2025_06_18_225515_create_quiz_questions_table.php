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
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->onDelete('cascade');
            $table->longText('question_text');
            $table->enum('question_type', ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank'])->default('multiple_choice');
            $table->json('options')->nullable(); // For multiple choice options
            $table->json('correct_answer')->nullable(); // Store correct answers
            $table->text('explanation')->nullable();
            $table->integer('points')->default(1);
            $table->integer('order_index')->default(0);
            $table->boolean('is_required')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
