<?php

namespace App\Actions;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Validation\ValidationException;

class UpdateTicketStatus
{
    /**
     * Transition a ticket to a new status, enforcing the allowed
     * transition rules defined on the TicketStatus enum.
     *
     * @throws ValidationException when the transition is not allowed
     */
    public function handle(Ticket $ticket, TicketStatus $status): Ticket
    {
        if ($ticket->status !== $status && ! $ticket->status->canTransitionTo($status)) {
            throw ValidationException::withMessages([
                'status' => "Cannot change status from {$ticket->status->label()} to {$status->label()}.",
            ]);
        }

        $ticket->update(['status' => $status]);

        return $ticket;
    }
}
