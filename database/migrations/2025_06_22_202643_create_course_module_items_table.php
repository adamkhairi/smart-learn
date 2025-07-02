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
            $table->foreignId('course_module_id')->constrained('course_modules')->cascadeOnDelete();
            $table->morphs('itemable'); // Creates itemable_id and itemable_type columns for polymorphic relation
            $table->integer('order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->enum('status', ['draft', 'published'])->default('published');
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['course_module_id', 'order']);
            $table->index(['itemable_id', 'itemable_type']);
            $table->index('is_required');
            $table->index('status');
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
