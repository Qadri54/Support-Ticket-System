<?php

namespace App\Http\Controllers;

use App\Actions\AddTicketResponse;
use App\Http\Requests\StoreTicketResponseRequest;
use App\Http\Resources\TicketResponseResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TicketResponseController extends Controller
{
    /**
     * POST /api/v1/tickets/{ticket}/responses  (admin only)
     */
    public function store(
        StoreTicketResponseRequest $request,
        Ticket $ticket,
        AddTicketResponse $action,
    ): JsonResponse {
        $this->authorize('addResponse', $ticket);

        $response = $action->handle($ticket, $request->user(), $request->validated());
        $response->load('user');

        return TicketResponseResource::make($response)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
