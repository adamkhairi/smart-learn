<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoTest extends TestCase
{
    public function test_logo_files_are_accessible()
    {
        // Test that both logo files are accessible
        $response = $this->get('/logo-black.svg');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/svg+xml');

        $response = $this->get('/logo-white.svg');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/svg+xml');
    }
}
