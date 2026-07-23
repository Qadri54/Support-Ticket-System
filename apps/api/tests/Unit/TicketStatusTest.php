<?php

use App\Enums\TicketStatus;

it('exposes a human readable label', function () {
    expect(TicketStatus::InProgress->label())->toBe('In Progress');
    expect(TicketStatus::Open->label())->toBe('Open');
    expect(TicketStatus::Resolved->label())->toBe('Resolved');
});

it('allows valid status transitions', function (TicketStatus $from, TicketStatus $to) {
    expect($from->canTransitionTo($to))->toBeTrue();
})->with([
    'open -> in progress' => [TicketStatus::Open, TicketStatus::InProgress],
    'open -> resolved' => [TicketStatus::Open, TicketStatus::Resolved],
    'in progress -> resolved' => [TicketStatus::InProgress, TicketStatus::Resolved],
    'in progress -> open' => [TicketStatus::InProgress, TicketStatus::Open],
    'resolved -> in progress' => [TicketStatus::Resolved, TicketStatus::InProgress],
]);

it('rejects invalid status transitions', function (TicketStatus $from, TicketStatus $to) {
    expect($from->canTransitionTo($to))->toBeFalse();
})->with([
    'open -> open' => [TicketStatus::Open, TicketStatus::Open],
    'resolved -> open' => [TicketStatus::Resolved, TicketStatus::Open],
    'resolved -> resolved' => [TicketStatus::Resolved, TicketStatus::Resolved],
]);
