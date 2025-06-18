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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('assignment_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('quiz_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('gradeable_type')->nullable(); // For polymorphic relations
            $table->unsignedBigInteger('gradeable_id')->nullable();
            $table->decimal('points_earned', 8, 2);
            $table->decimal('max_points', 8, 2);
            $table->decimal('percentage', 5, 2);
            $table->string('letter_grade', 3)->nullable();
            $table->longText('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('graded_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->decimal('late_penalty_applied', 5, 2)->default(0);
            $table->decimal('bonus_points', 8, 2)->default(0);
            $table->timestamps();

            $table->index(['gradeable_type', 'gradeable_id']);
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
