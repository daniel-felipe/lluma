<?php

declare(strict_types = 1);

namespace App\Enums;

enum SmsVerificationPurpose: string
{
    case Registration  = 'registration';
    case OtpLogin      = 'otp_login';
    case PasswordReset = 'password_reset';
}
