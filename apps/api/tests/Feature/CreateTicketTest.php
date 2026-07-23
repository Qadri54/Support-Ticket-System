<?php

use App\Models\User;

it('creates a ticket with a valid payload', function () {
    User::factory()->create();

    $response = $this->postJson('/api/v1/tickets', [
        'subject' => 'Cannot log in to my account',
        'description' => 'I keep getting a 500 error when submitting the login form.',
    ]);

    $response->assertStatus(201)
        ->assertHeader('Location')
        ->assertJsonPath('data.subject', 'Cannot log in to my account')
        ->assertJsonPath('data.status', 'open');

    $this->assertDatabaseHas('tickets', [
        'subject' => 'Cannot log in to my account',
        'status' => 'open',
    ]);
});

it('defaults a new ticket to the open status', function () {
    User::factory()->create();

    $this->postJson('/api/v1/tickets', [
        'subject' => 'Feature request',
        'description' => 'Please add a dark mode toggle.',
    ])->assertStatus(201)
        ->assertJsonPath('data.status', 'open');
});
