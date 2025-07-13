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
        // Update course_module_items table
        Schema::table('course_module_items', function (Blueprint $table) {
            if (!Schema::hasColumn('course_module_items', 'content_json')) {
                $table->json('content_json')->nullable()->after('description');
            }
            if (!Schema::hasColumn('course_module_items', 'content_html')) {
                $table->longText('content_html')->nullable()->after('content_json');
            }
        });

        // Update lectures table
        Schema::table('lectures', function (Blueprint $table) {
            if (!Schema::hasColumn('lectures', 'content_json')) {
                $table->json('content_json')->nullable()->after('content');
            }
            if (!Schema::hasColumn('lectures', 'content_html')) {
                $table->longText('content_html')->nullable()->after('content_json');
            }
        });

        // Update articles table
        Schema::table('articles', function (Blueprint $table) {
            if (!Schema::hasColumn('articles', 'content_json')) {
                $table->json('content_json')->nullable()->after('text');
            }
            if (!Schema::hasColumn('articles', 'content_html')) {
                $table->longText('content_html')->nullable()->after('content_json');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_module_items', function (Blueprint $table) {
            $table->dropColumn(['content_json', 'content_html']);
        });

        Schema::table('lectures', function (Blueprint $table) {
            $table->dropColumn(['content_json', 'content_html']);
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['content_json', 'content_html']);
        });
    }
};
