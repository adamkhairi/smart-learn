<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if the old column exists before attempting migration
        if (Schema::hasColumn('likes', 'article_id')) {
            // Migrate existing likes data to polymorphic structure
            DB::statement("
                UPDATE likes
                SET likeable_id = article_id,
                    likeable_type = 'App\\\\Models\\\\Article'
                WHERE article_id IS NOT NULL
            ");

            // Drop the old column
            Schema::table('likes', function (Blueprint $table) {
                $table->dropForeign(['article_id']);
                $table->dropColumn('article_id');
            });
        }

        // Check if the old column exists before attempting migration
        if (Schema::hasColumn('comments', 'article_id')) {
            // Migrate existing comments data to polymorphic structure
            DB::statement("
                UPDATE comments
                SET commentable_id = article_id,
                    commentable_type = 'App\\\\Models\\\\Article'
                WHERE article_id IS NOT NULL
            ");

            // Drop the old column
            Schema::table('comments', function (Blueprint $table) {
                $table->dropForeign(['article_id']);
                $table->dropColumn('article_id');
            });
        }

        // Check if the old column exists before attempting migration
        if (Schema::hasColumn('bookmarks', 'article_id')) {
            // Migrate existing bookmarks data to polymorphic structure
            DB::statement("
                UPDATE bookmarks
                SET bookmarkable_id = article_id,
                    bookmarkable_type = 'App\\\\Models\\\\Article'
                WHERE article_id IS NOT NULL
            ");

            // Drop the old column
            Schema::table('bookmarks', function (Blueprint $table) {
                $table->dropForeign(['article_id']);
                $table->dropColumn('article_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the old columns for rollback
        Schema::table('likes', function (Blueprint $table) {
            $table->foreignId('article_id')->nullable()->constrained('articles')->cascadeOnDelete();
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->foreignId('article_id')->nullable()->constrained('articles')->cascadeOnDelete();
        });

        Schema::table('bookmarks', function (Blueprint $table) {
            $table->foreignId('article_id')->nullable()->constrained('articles')->cascadeOnDelete();
        });

        // Migrate data back from polymorphic to specific columns
        DB::statement("
            UPDATE likes
            SET article_id = likeable_id
            WHERE likeable_type = 'App\\\\Models\\\\Article'
        ");

        DB::statement("
            UPDATE comments
            SET article_id = commentable_id
            WHERE commentable_type = 'App\\\\Models\\\\Article'
        ");

        DB::statement("
            UPDATE bookmarks
            SET article_id = bookmarkable_id
            WHERE bookmarkable_type = 'App\\\\Models\\\\Article'
        ");

        // Remove polymorphic columns
        Schema::table('likes', function (Blueprint $table) {
            $table->dropColumn(['likeable_id', 'likeable_type']);
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropColumn(['commentable_id', 'commentable_type']);
        });

        Schema::table('bookmarks', function (Blueprint $table) {
            $table->dropColumn(['bookmarkable_id', 'bookmarkable_type']);
        });
    }
};
