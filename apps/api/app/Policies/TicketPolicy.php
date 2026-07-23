<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Only administrators may change a ticket's status.
     */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }

    /**
     * Only administrators may add responses to a ticket.
     */
    public function addResponse(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }
}
