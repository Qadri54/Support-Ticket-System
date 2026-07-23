<?php

namespace App\Http\Controllers;

use App\Actions\CreateTicket;
use App\Actions\UpdateTicketStatus;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TicketController extends Controller
{
    /**
     * GET /api/v1/tickets?status=open&page=1
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $status = TicketStatus::tryFrom((string) $request->query('status'));

        $tickets = Ticket::query()
            ->with('user')
            ->withCount('responses')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return TicketResource::collection($tickets);
    }

    /**
     * POST /api/v1/tickets
     */
    public function store(StoreTicketRequest $request, CreateTicket $action): JsonResponse
    {
        $reporter = $request->user()
            ?? User::query()->where('role', UserRole::User)->firstOrFail();

        $ticket = $action->handle($reporter, $request->validated());
        $ticket->load('user');

        return TicketResource::make($ticket)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED)
            ->header('Location', url("/api/v1/tickets/{$ticket->id}"));
    }

    /**
     * GET /api/v1/tickets/{ticket}
     */
    public function show(Ticket $ticket): TicketResource
    {
        $ticket->load(['user', 'responses.user']);

        return TicketResource::make($ticket);
    }

    /**
     * PATCH /api/v1/tickets/{ticket}/status  (admin only)
     */
    public function updateStatus(
        UpdateTicketStatusRequest $request,
        Ticket $ticket,
        UpdateTicketStatus $action,
    ): TicketResource {
        $this->authorize('updateStatus', $ticket);

        $ticket = $action->handle($ticket, $request->status());
        $ticket->load('user');

        return TicketResource::make($ticket);
    }
}
