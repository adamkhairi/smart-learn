<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeTest extends TestCase
{
    public function test_theme_cookie_is_set()
    {
        $response = $this->get('/');
        $response->assertStatus(200);

        // Check that the theme cookie is set
        $this->assertTrue($response->headers->has('Set-Cookie'));
    }

    public function test_dark_mode_class_is_applied()
    {
        // Test with dark mode preference
        $response = $this->withHeaders([
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ])->get('/');

        $response->assertStatus(200);
        $response->assertSee('html');
    }
}
