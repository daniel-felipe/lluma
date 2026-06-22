<?php

declare(strict_types = 1);

namespace App\Exceptions;

use Exception;

final class DuplicateBookingException extends Exception
{
    public function __construct(string $message = 'You already have a booking at this time with this barber.')
    {
        parent::__construct($message);
    }
}
