<?php

namespace App\Actions;

use App\Models\Ticket;
use App\Models\TicketResponse;
use App\Models\User;

class AddTicketResponse
{
    /**
     * Append a response to a ticket, authored by the given user.
     *
     * @param  array{body: string}  $data
     */
    public function handle(Ticket $ticket, User $author, array $data): TicketResponse
    {
        return $ticket->responses()->create([
            'user_id' => $author->id,
            'body' => $data['body'],
        ]);
    }
}
