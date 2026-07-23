<?php

use App\Models\User;

it('rejects a ticket without a subject', function () {
    User::factory()->create();

    $this->postJson('/api/v1/tickets', [
        'description' => 'A description without a subject.',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['subject']);
});

it('rejects a ticket without a description', function () {
    User::factory()->create();

    $this->postJson('/api/v1/tickets', [
        'subject' => 'A subject without a description',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['description']);
});
