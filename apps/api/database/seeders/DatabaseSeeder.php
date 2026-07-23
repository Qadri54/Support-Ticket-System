<?php

namespace Database\Seeders;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketResponse;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
        ]);

        $primaryUser = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@example.com',
        ]);

        $otherUsers = User::factory(2)->create();
        $users = collect([$primaryUser])->merge($otherUsers);

        // ~15 tickets spread evenly across the three statuses (5 each).
        foreach (TicketStatus::cases() as $status) {
            Ticket::factory(5)
                ->status($status)
                ->recycle($users)
                ->create()
                ->each(function (Ticket $ticket) use ($admin): void {
                    // Roughly half of the tickets receive one or two responses.
                    if (fake()->boolean()) {
                        TicketResponse::factory(fake()->numberBetween(1, 2))
                            ->for($ticket)
                            ->create([
                                'user_id' => $admin->id,
                            ]);
                    }
                });
        }
    }
}
