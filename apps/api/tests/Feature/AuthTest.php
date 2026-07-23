<?php

use App\Models\User;

it('issues a token and returns the user on valid login', function () {
    $user = User::factory()->admin()->create([
        'email' => 'admin@example.com',
    ]);

    $this->postJson('/api/v1/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ])
        ->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
        ->assertJsonPath('user.role', 'admin');
});

it('rejects invalid credentials with 422', function () {
    User::factory()->create(['email' => 'user@example.com']);

    $this->postJson('/api/v1/login', [
        'email' => 'user@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(422)->assertJsonValidationErrors(['email']);
});

it('returns the authenticated user from /me', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/me')
        ->assertStatus(200)
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

it('rejects /me without a token', function () {
    $this->getJson('/api/v1/me')->assertStatus(401);
});

it('revokes the current token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('web')->plainTextToken;

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/logout')
        ->assertStatus(200);

    // Token is deleted from storage.
    expect($user->tokens()->count())->toBe(0);
});
