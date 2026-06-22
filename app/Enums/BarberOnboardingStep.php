<?php

declare(strict_types = 1);

namespace App\Enums;

enum BarberOnboardingStep: string
{
    case Profile      = 'profile';
    case Services     = 'services';
    case Availability = 'availability';
    case Complete     = 'complete';
}
