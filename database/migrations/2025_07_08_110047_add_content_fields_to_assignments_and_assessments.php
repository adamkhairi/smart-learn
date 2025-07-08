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
        // Add content fields to assignments
        Schema::table('assignments', function (Blueprint $table) {
            $table->json('content_json')->nullable()->after('description');
            $table->longText('content_html')->nullable()->after('content_json');
            $table->json('instructions')->nullable()->after('content_html'); // Rich instructions
            $table->json('rubric')->nullable()->after('instructions'); // Grading rubric
        });

        // Add content fields to assessments
        Schema::table('assessments', function (Blueprint $table) {
            $table->json('content_json')->nullable()->after('visibility');
            $table->longText('content_html')->nullable()->after('content_json');
            $table->json('instructions')->nullable()->after('content_html'); // Exam instructions
            $table->integer('time_limit')->nullable()->after('instructions'); // Time limit in minutes
            $table->boolean('randomize_questions')->default(false)->after('time_limit');
            $table->boolean('show_results')->default(true)->after('randomize_questions');
            $table->datetime('available_from')->nullable()->after('show_results');
            $table->datetime('available_until')->nullable()->after('available_from');
        });

        // Add assignment_id to questions table (fix missing foreign key)
        Schema::table('questions', function (Blueprint $table) {
            $table->foreignId('assignment_id')->nullable()->after('assessment_id')->constrained('assignments')->cascadeOnDelete();

            // Make assessment_id nullable since questions can belong to either assessments or assignments
            $table->foreignId('assessment_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn(['content_json', 'content_html', 'instructions', 'rubric']);
        });

        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn([
                'content_json',
                'content_html',
                'instructions',
                'time_limit',
                'randomize_questions',
                'show_results',
                'available_from',
                'available_until'
            ]);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['assignment_id']);
            $table->dropColumn('assignment_id');
        });
    }
};
