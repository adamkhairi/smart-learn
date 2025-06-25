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
            $table->string('assignment_type')->default('assignment');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('total_points')->default(0);
            $table->string('status')->default('draft');
            $table->boolean('visibility')->default(true);
            $table->datetime('started_at')->nullable();
            $table->datetime('expired_at')->nullable();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->json('questions')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('assignment_type');
            $table->index('status');
            $table->index('visibility');
            $table->index(['course_id', 'status']);
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
