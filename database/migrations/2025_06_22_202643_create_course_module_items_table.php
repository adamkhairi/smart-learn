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
        Schema::create('course_module_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['video', 'document', 'link', 'quiz', 'assignment']);
            $table->string('url')->nullable();
            $table->longText('content')->nullable();
            $table->foreignId('course_module_id')->constrained('course_modules')->cascadeOnDelete();
            $table->integer('order')->default(0);
            $table->integer('duration')->nullable(); // in seconds
            $table->boolean('is_required')->default(false);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['course_module_id', 'order']);
            $table->index('type');
            $table->index('is_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_module_items');
    }
};
