<?php

declare(strict_types = 1);

use App\Http\Controllers\AppointmentCancellationController;
use App\Http\Controllers\AppointmentStatusController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BarberProfileController;
use App\Http\Controllers\BarberPublicProfileController;
use App\Http\Controllers\BarberScheduleController;
use App\Http\Controllers\BookingCancellationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DailyAgendaController;
use App\Http\Controllers\GoogleCallbackController;
use App\Http\Controllers\GoogleRedirectController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\ServiceToggleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\ShareLinkController;
use App\Http\Controllers\SlugAvailabilityController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserEmailResetNotificationController;
use App\Http\Controllers\UserEmailVerificationController;
use App\Http\Controllers\UserEmailVerificationNotificationController;
use App\Http\Controllers\UserPasswordController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserTwoFactorAuthenticationController;
use App\Http\Controllers\WalkInController;
use App\Http\Controllers\WeeklyAgendaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('welcome'))->name('home');

// Public availability endpoint (unauthenticated)
Route::get('barbers/{barberProfile}/slots', AvailabilityController::class)->name('barbers.slots');

// Public booking flow (unauthenticated)
Route::post('barbers/{barberProfile}/bookings', [BookingController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('barbers.bookings.store');
Route::get('bookings/{appointment}', [BookingController::class, 'show'])->name('bookings.show');
Route::post('bookings/{appointment}/cancel', BookingCancellationController::class)
    ->middleware('throttle:10,1')
    ->name('bookings.cancel');

Route::middleware(['auth', 'verified', 'onboarding'])->group(function (): void {
    Route::get('dashboard', DailyAgendaController::class)->name('dashboard');

    // Agenda...
    Route::get('agenda/week', WeeklyAgendaController::class)->name('agenda.week');
    Route::patch('appointments/{appointment}/status', AppointmentStatusController::class)
        ->name('appointments.status');
    Route::post('appointments/{appointment}/cancel', AppointmentCancellationController::class)
        ->name('appointments.cancel');
    Route::post('appointments/walk-in', WalkInController::class)
        ->name('appointments.walk-in');

    // Shareable link & QR code...
    Route::get('share', ShareLinkController::class)->name('share.show');
});

Route::middleware('auth')->group(function (): void {
    // Onboarding...
    Route::get('onboarding/profile', [BarberProfileController::class, 'edit'])
        ->name('onboarding.profile.edit');
    Route::post('onboarding/profile', [BarberProfileController::class, 'update'])
        ->name('onboarding.profile.update');

    // Services — literal routes before parameterized ones to avoid conflicts...
    Route::patch('onboarding/services/order', ServiceOrderController::class)
        ->name('onboarding.services.order');
    Route::get('onboarding/services', [ServiceController::class, 'index'])
        ->name('onboarding.services.index');
    Route::post('onboarding/services', [ServiceController::class, 'store'])
        ->name('onboarding.services.store');
    Route::put('onboarding/services/{service}', [ServiceController::class, 'update'])
        ->name('onboarding.services.update');
    Route::delete('onboarding/services/{service}', [ServiceController::class, 'destroy'])
        ->name('onboarding.services.destroy');
    Route::patch('onboarding/services/{service}/toggle', ServiceToggleController::class)
        ->name('onboarding.services.toggle');

    // Availability / Schedule...
    Route::get('onboarding/availability', [BarberScheduleController::class, 'show'])
        ->name('onboarding.availability.show');
    Route::put('onboarding/availability', [BarberScheduleController::class, 'update'])
        ->name('onboarding.availability.update');

    // Slug availability...
    Route::get('slug/available', [SlugAvailabilityController::class, 'show'])
        ->middleware('throttle:30,1')
        ->name('slug.available');
});

Route::middleware('auth')->group(function (): void {
    // User...
    Route::delete('user', [UserController::class, 'destroy'])->name('user.destroy');

    // User Profile...
    Route::redirect('settings', '/settings/profile');
    Route::get('settings/profile', [UserProfileController::class, 'edit'])->name('user-profile.edit');
    Route::patch('settings/profile', [UserProfileController::class, 'update'])->name('user-profile.update');

    // User Password...
    Route::get('settings/password', [UserPasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [UserPasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    // Appearance...
    Route::get('settings/appearance', fn () => Inertia::render('appearance/update'))->name('appearance.edit');

    // User Two-Factor Authentication...
    Route::get('settings/two-factor', [UserTwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});

// Google OAuth...
Route::get('auth/google', GoogleRedirectController::class)->name('auth.google');
Route::get('auth/google/callback', GoogleCallbackController::class)->name('auth.google.callback');

Route::middleware('guest')->group(function (): void {
    // Registration...
    Route::get('register', [UserController::class, 'create'])
        ->name('register');
    Route::post('register', [UserController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('register.store');

    // User Password...
    Route::get('reset-password/{token}', [UserPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('reset-password', [UserPasswordController::class, 'store'])
        ->name('password.store');

    // User Email Reset Notification...
    Route::get('forgot-password', [UserEmailResetNotificationController::class, 'create'])
        ->name('password.request');
    Route::post('forgot-password', [UserEmailResetNotificationController::class, 'store'])
        ->name('password.email');

    // Session...
    Route::get('login', [SessionController::class, 'create'])
        ->name('login');
    Route::post('login', [SessionController::class, 'store'])
        ->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    // User Email Verification...
    Route::get('verify-email', [UserEmailVerificationNotificationController::class, 'create'])
        ->name('verification.notice');
    Route::post('email/verification-notification', [UserEmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // User Email Verification...
    Route::get('verify-email/{id}/{hash}', [UserEmailVerificationController::class, 'update'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    // Session...
    Route::post('logout', [SessionController::class, 'destroy'])
        ->name('logout');
});

// Public barber page — catch-all by slug, must stay last...
Route::get('/{barberProfile}', BarberPublicProfileController::class)->name('barbers.show');
