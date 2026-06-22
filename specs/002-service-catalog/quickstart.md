# Quickstart: Service Catalog (F2)

## Pré-requisitos

- F1 (Barber Onboarding Profile) implementado e testes passando
- Branch `002-service-catalog` a partir de `main`

## Ordem de Implementação

```
1.  Migration (expandir stub com name, price_cents, duration_minutes, is_active, sort_order)
2.  Model Service + Factory (estados: active, inactive, forProfile)
3.  Actions (CreateService, UpdateService, DeleteService, ToggleService, ReorderServices)
4.  Action CancelServiceAppointments (stub no-op para F2; conectar em F4)
5.  Notifications (AppointmentCancelledClientNotification, AppointmentCancelledBarberNotification)
6.  Form Requests (StoreServiceRequest, UpdateServiceRequest, ReorderServicesRequest)
7.  Controllers (ServiceController, ServiceToggleController, ServiceOrderController)
8.  Routes + update EnsureBarberOnboarding middleware (redirecionar step Services)
9.  Update PublishBarberProfile (verificar services()->where('is_active', true)->exists())
10. npm install @dnd-kit/core @dnd-kit/sortable  [✅ aprovado em 2026-04-08]
11. Frontend: página onboarding/services.tsx (templates + lista + DnD reorder)
12. Wayfinder: regenerar após controllers (php artisan wayfinder:generate)
13. Testes Pest (feature tests por controller + action unit tests)
14. Quality gates: Pint, Larastan, coverage
```

## Comandos Úteis

```bash
# Criar actions
php artisan make:action "CreateService" --no-interaction
php artisan make:action "UpdateService" --no-interaction
php artisan make:action "DeleteService" --no-interaction
php artisan make:action "ToggleService" --no-interaction
php artisan make:action "ReorderServices" --no-interaction

# Criar controllers
php artisan make:controller ServiceController --no-interaction
php artisan make:controller ServiceToggleController --no-interaction
php artisan make:controller ServiceOrderController --no-interaction

# Criar form requests
php artisan make:request StoreServiceRequest --no-interaction
php artisan make:request UpdateServiceRequest --no-interaction
php artisan make:request ReorderServicesRequest --no-interaction

# Criar testes
php artisan make:test --pest Controllers/ServiceControllerTest
php artisan make:test --pest Controllers/ServiceToggleControllerTest
php artisan make:test --pest Controllers/ServiceOrderControllerTest

# Rodar testes filtrados
php artisan test --compact --filter=ServiceController

# Regenerar Wayfinder após controllers
php artisan wayfinder:generate

# Quality gates
composer test:unit
composer test:types
composer test:type-coverage
vendor/bin/pint --dirty
```

## Estrutura de Arquivos Criados/Modificados

```text
# Modificados
database/migrations/2026_04_06_213402_create_services_table.php
app/Models/Service.php
app/Models/BarberProfile.php           (relationship já existe como stub — expandir)
app/Http/Middleware/EnsureBarberOnboarding.php  (adicionar redirect para Services step)
app/Actions/PublishBarberProfile.php    (verificar services()->where('is_active', true))
routes/web.php

# Criados — PHP
app/Actions/CreateService.php
app/Actions/UpdateService.php
app/Actions/DeleteService.php
app/Actions/ToggleService.php
app/Actions/ReorderServices.php
app/Actions/CancelServiceAppointments.php   (stub no-op para F2)
app/Http/Controllers/ServiceController.php
app/Http/Controllers/ServiceToggleController.php
app/Http/Controllers/ServiceOrderController.php
app/Http/Requests/StoreServiceRequest.php
app/Http/Requests/UpdateServiceRequest.php
app/Http/Requests/ReorderServicesRequest.php
app/Notifications/AppointmentCancelledClientNotification.php
app/Notifications/AppointmentCancelledBarberNotification.php
database/factories/ServiceFactory.php  (expandir stub)

# Criados — Frontend
resources/js/pages/onboarding/services.tsx

# Gerados automaticamente (não editar)
resources/js/actions/ServiceController.ts
resources/js/actions/ServiceToggleController.ts
resources/js/actions/ServiceOrderController.ts

# Testes
tests/Feature/Controllers/ServiceControllerTest.php
tests/Feature/Controllers/ServiceToggleControllerTest.php
tests/Feature/Controllers/ServiceOrderControllerTest.php
```

## Checklist Pré-Merge

- [ ] `composer test:unit` — 100% coverage
- [ ] `composer test:types` — zero erros Larastan
- [ ] `composer test:type-coverage` — 100% type coverage
- [ ] `vendor/bin/pint --dirty` — zero violações
- [ ] Nenhuma URL hardcoded no frontend (somente funções Wayfinder)
- [ ] UI revisada contra `design/design-system.html`
- [ ] Viewport 320px verificado na página `onboarding/services`
