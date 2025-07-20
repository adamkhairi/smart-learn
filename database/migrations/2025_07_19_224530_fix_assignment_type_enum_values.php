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
        // Update all assignments with invalid 'assignment' type to 'essay'
        DB::table('assignments')
            ->where('assignment_type', 'assignment')
            ->update(['assignment_type' => 'essay']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the change - set back to 'assignment' (though this will cause enum errors)
        // This is mainly for completeness, as the old value was invalid
        DB::table('assignments')
            ->where('assignment_type', 'essay')
            ->update(['assignment_type' => 'assignment']);
    }
};
