<?php

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

it('forbids a regular user from changing a ticket status', function () {
    $user = User::factory()->create();
    $ticket = Ticket::factory()->status(TicketStatus::Open)->create();

    $this->actingAs($user, 'sanctum')
        ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::InProgress->value,
        ])
        ->assertStatus(403);

    expect($ticket->fresh()->status)->toBe(TicketStatus::Open);
});

it('allows an admin to change a ticket status', function () {
    $admin = User::factory()->admin()->create();
    $ticket = Ticket::factory()->status(TicketStatus::Open)->create();

    $this->actingAs($admin, 'sanctum')
        ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::InProgress->value,
        ])
        ->assertStatus(200)
        ->assertJsonPath('data.status', 'in_progress');

    expect($ticket->fresh()->status)->toBe(TicketStatus::InProgress);
});

it('rejects an unauthenticated status change with 401', function () {
    $ticket = Ticket::factory()->status(TicketStatus::Open)->create();

    $this->patchJson("/api/v1/tickets/{$ticket->id}/status", [
        'status' => TicketStatus::InProgress->value,
    ])->assertStatus(401);
});

it('allows an admin to add a response but forbids a regular user', function () {
    $ticket = Ticket::factory()->create();
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/tickets/{$ticket->id}/responses", ['body' => 'nope'])
        ->assertStatus(403);

    $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/tickets/{$ticket->id}/responses", ['body' => 'On it — investigating now.'])
        ->assertStatus(201)
        ->assertJsonPath('data.body', 'On it — investigating now.');
});
