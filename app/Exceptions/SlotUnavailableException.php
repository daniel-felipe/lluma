<?php

declare(strict_types = 1);

namespace App\Exceptions;

use Exception;

final class SlotUnavailableException extends Exception
{
    public function __construct(string $message = 'The requested slot is no longer available.')
    {
        parent::__construct($message);
    }
}
