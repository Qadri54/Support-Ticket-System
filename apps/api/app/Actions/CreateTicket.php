<?php

namespace App\Actions;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class CreateTicket
{
    /**
     * Create a new ticket owned by the given reporter.
     *
     * @param  array{subject: string, description: string}  $data
     */
    public function handle(User $reporter, array $data): Ticket
    {
        return $reporter->tickets()->create([
            'subject' => $data['subject'],
            'description' => $data['description'],
            'status' => TicketStatus::Open,
        ]);
    }
}
