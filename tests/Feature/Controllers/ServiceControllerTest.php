<?php

declare(strict_types = 1);

use App\Actions\DeleteService;
use App\Enums\BarberOnboardingStep;
use App\Models\BarberProfile;
use App\Models\Service;
use App\Models\User;

// ─────────────────────────────────────────────────────────────
// US1 — index
// ─────────────────────────────────────────────────────────────

it('renders services page with correct component', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.services.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/services')
            ->has('services')
            ->has('is_onboarding')
            ->has('onboarding_step')
            ->has('steps'));
});

it('sends non-null templates prop when barber has zero services', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding.services.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/services')
            ->whereNot('templates', null));
});

it('sends null templates prop when barber already has services', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    Service::factory()->forProfile($profile)->create();

    $response = $this->actingAs($user)->get(route('onboarding.services.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding/services')
            ->where('templates', null));
});

it('redirects unauthenticated request to login for index', function (): void {
    $response = $this->get(route('onboarding.services.index'));

    $response->assertRedirectToRoute('login');
});

// ─────────────────────────────────────────────────────────────
// US1 — store
// ─────────────────────────────────────────────────────────────

it('creates a service with valid data and redirects', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->post(route('onboarding.services.store'), [
        'name'             => 'Corte Degradê',
        'price_cents'      => 4500,
        'duration_minutes' => 40,
    ]);

    $response->assertRedirect(route('onboarding.services.index'));
    expect($profile->services()->count())->toBe(1)
        ->and($profile->services()->first()->name)->toBe('Corte Degradê')
        ->and($profile->services()->first()->price_cents)->toBe(4500)
        ->and($profile->services()->first()->duration_minutes)->toBe(40);
});

it('validates required fields on store', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->post(route('onboarding.services.store'), []);

    $response->assertSessionHasErrors(['name', 'price_cents', 'duration_minutes']);
});

it('validates price_cents minimum of 1 on store', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->post(route('onboarding.services.store'), [
        'name'             => 'Corte',
        'price_cents'      => 0,
        'duration_minutes' => 30,
    ]);

    $response->assertSessionHasErrors('price_cents');
});

it('validates duration_minutes minimum of 1 on store', function (): void {
    $user = User::factory()->phoneVerified()->create();
    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->post(route('onboarding.services.store'), [
        'name'             => 'Corte',
        'price_cents'      => 3500,
        'duration_minutes' => 0,
    ]);

    $response->assertSessionHasErrors('duration_minutes');
});

it('assigns the created service to the authenticated barber', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $this->actingAs($user)->post(route('onboarding.services.store'), [
        'name'             => 'Corte',
        'price_cents'      => 3500,
        'duration_minutes' => 30,
    ]);

    $service = Service::query()->first();
    expect($service->barber_profile_id)->toBe($profile->id);
});

// ─────────────────────────────────────────────────────────────
// US2 — update
// ─────────────────────────────────────────────────────────────

it('updates a service with valid data and redirects', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($profile)->create();

    $response = $this->actingAs($user)->put(route('onboarding.services.update', $service), [
        'name'             => 'Corte Atualizado',
        'price_cents'      => 5000,
        'duration_minutes' => 45,
    ]);

    $response->assertRedirect(route('onboarding.services.index'));
    expect($service->fresh()->name)->toBe('Corte Atualizado')
        ->and($service->fresh()->price_cents)->toBe(5000)
        ->and($service->fresh()->duration_minutes)->toBe(45);
});

it('validates invalid fields on update', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($profile)->create();

    $response = $this->actingAs($user)->put(route('onboarding.services.update', $service), [
        'name'             => '',
        'price_cents'      => 0,
        'duration_minutes' => 0,
    ]);

    $response->assertSessionHasErrors(['name', 'price_cents', 'duration_minutes']);
});

it('returns 404 when updating service belonging to another barber', function (): void {
    $user         = User::factory()->phoneVerified()->create();
    $otherUser    = User::factory()->phoneVerified()->create();
    $otherProfile = BarberProfile::factory()->for($otherUser)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($otherProfile)->create();

    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->put(route('onboarding.services.update', $service), [
        'name'             => 'Invasão',
        'price_cents'      => 100,
        'duration_minutes' => 10,
    ]);

    $response->assertNotFound();
});

// ─────────────────────────────────────────────────────────────
// US2 — destroy
// ─────────────────────────────────────────────────────────────

it('removes service immediately when no future appointments', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($profile)->active()->create();
    Service::factory()->forProfile($profile)->active()->create();

    $response = $this->actingAs($user)->delete(route('onboarding.services.destroy', $service));

    $response->assertRedirect(route('onboarding.services.index'));

    expect(Service::query()->find($service->id))->toBeNull();
});

it('returns requires_confirmation false when stub futureAppointmentsCount returns 0', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    Service::factory()->forProfile($profile)->active()->create();
    $service = Service::factory()->forProfile($profile)->active()->create();

    /** @var DeleteService $deleteService */
    $deleteService = resolve(DeleteService::class);
    $result        = $deleteService->run($service, confirmed: false);

    /** @var array<string, mixed> $result */
    expect($result)->toHaveKey('requires_confirmation', false);
});

it('prevents deleting the last active service', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($profile)->active()->create();

    $response = $this->actingAs($user)->delete(route('onboarding.services.destroy', $service));

    $response->assertRedirect();
    $response->assertSessionHasErrors();

    expect(Service::query()->find($service->id))->not->toBeNull();
});

it('returns 404 when deleting service belonging to another barber', function (): void {
    $user         = User::factory()->phoneVerified()->create();
    $otherUser    = User::factory()->phoneVerified()->create();
    $otherProfile = BarberProfile::factory()->for($otherUser)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    $service = Service::factory()->forProfile($otherProfile)->create();

    BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);

    $response = $this->actingAs($user)->delete(route('onboarding.services.destroy', $service));

    $response->assertNotFound();
});

it('deletes service with confirm=1 query param', function (): void {
    $user    = User::factory()->phoneVerified()->create();
    $profile = BarberProfile::factory()->for($user)->create([
        'onboarding_step' => BarberOnboardingStep::Services,
    ]);
    Service::factory()->forProfile($profile)->active()->create();
    $service = Service::factory()->forProfile($profile)->active()->create();

    $response = $this->actingAs($user)->delete(
        route('onboarding.services.destroy', $service) . '?confirm=1',
    );

    $response->assertRedirect(route('onboarding.services.index'));

    expect(Service::query()->find($service->id))->toBeNull();
});
