<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Open       = 'open';
    case InProgress = 'in_progress';
    case Resolved   = 'resolved';

    public function label(): string
    {
        return match ($this) {
            self::Open       => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved   => 'Resolved',
        };
    }

    /**
     * Statuses this status may transition into.
     *
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Open       => [self::InProgress, self::Resolved],
            self::InProgress => [self::Open, self::Resolved],
            self::Resolved   => [self::InProgress],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
