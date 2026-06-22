# Tasks: Service Catalog Management (F2)

**Input**: Design documents from `/specs/002-service-catalog/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Incluídos por exigência da constituição (Princípio IV — 100% coverage; Seção "Ordem de Implementação" — escrever testes PRIMEIRO, garantir que FALHEM antes de implementar).

**Organization**: Tarefas agrupadas por user story para implementação e teste independente.

## Format: `[ID] [P?] [Story] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências não resolvidas)
- **[Story]**: User story correspondente (US1–US4)
- Paths absolutos a partir da raiz do repositório

---

## Phase 1: Setup (Infraestrutura Stub → Completa)

**Purpose**: Expandir os stubs de migration e model deixados pelo F1 para a estrutura completa de dados que todas as stories precisam.

- [x] T001 Expandir migration stub em `database/migrations/2026_04_06_213402_create_services_table.php` com campos `name`, `price_cents` (unsignedInteger, centavos — Constituição VII), `duration_minutes` (unsignedSmallInteger), `is_active` (boolean default true), `sort_order` (unsignedInteger default 0) e índice composto `(barber_profile_id, sort_order)`
- [x] T002 Implementar `Service` model completo em `app/Models/Service.php` — `HasUuids`, `$fillable`, `casts()`, relationships `barberProfile()`, `appointments()` stub, `@property-read` PHPDoc, scope `active()`, scope `ordered()`, método `futureAppointmentsCount(): int` (retorna 0 — stub, ver `// F4`)
- [x] T003 Expandir `ServiceFactory` em `database/factories/ServiceFactory.php` com `definition()` completo (nome fake, `price_cents` 2000–10000 centavos, duração 15–90 min) e estados `active()`, `inactive()`, `forProfile(BarberProfile $profile)`
- [x] T003a [P] Executar `npm install @dnd-kit/core @dnd-kit/sortable` — dependência aprovada em 2026-04-08 para suporte a DnD com touch (mobile-first)
- [x] T003b [P] Criar `app/Exceptions/ServiceException.php` via `php artisan make:exception ServiceException --no-interaction` — exceção de domínio usada pelos guards de negócio (último serviço ativo, IDs fora do escopo do barbeiro)

---

## Phase 2: Foundational (Pré-requisitos que bloqueiam todas as stories)

**Purpose**: Atualizar o comportamento do fluxo de onboarding e de publicação para reconhecer o step de serviços.

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar antes desta fase estar completa.

- [x] T004 [P] Atualizar `EnsureBarberOnboarding` em `app/Http/Middleware/EnsureBarberOnboarding.php` — adicionar case `BarberOnboardingStep::Services => to_route('onboarding.services.index')` para redirecionar corretamente o step Services
- [x] T005 [P] Atualizar `PublishBarberProfile` em `app/Actions/PublishBarberProfile.php` — substituir `$profile->services()->count() === 0` por `$profile->services()->where('is_active', true)->count() === 0` para verificar serviços ativos (não apenas existentes)

**Checkpoint**: Foundation pronta — implementação das user stories pode começar.

---

## Phase 3: User Story 1 — Configurar catálogo pela primeira vez (Priority: P1) 🎯 MVP

**Goal**: Barbeiro recém-cadastrado acessa a tela de serviços, vê 3 templates pré-definidos ("Corte", "Barba", "Combo"), aceita/personaliza e cria seus primeiros serviços para poder publicar o perfil.

**Independent Test**: Criar conta zerada → acessar `GET onboarding/services` → confirmar que templates aparecem → aceitar → serviços criados → perfil publicável.

### Testes para User Story 1

> **ESCREVER PRIMEIRO — garantir que FALHEM antes de implementar**

- [x] T006 [P] [US1] Criar `tests/Feature/Controllers/ServiceControllerTest.php` via `php artisan make:test --pest Controllers/ServiceControllerTest` — escrever cenários: index retorna componente Inertia correto, index com zero serviços envia prop `templates` não-nula, index com serviços existentes envia `templates: null`, unauthenticated redireciona ao login
- [x] T007 [P] [US1] Adicionar ao `ServiceControllerTest` cenários de store: cria serviço com dados válidos e redireciona, valida campos obrigatórios (`name`, `price_cents`, `duration_minutes`), valida preço positivo (min:1), valida duração ≥ 1, serviço criado pertence ao barbeiro autenticado

### Implementação para User Story 1

- [x] T008 [P] [US1] Criar `StoreServiceRequest` em `app/Http/Requests/StoreServiceRequest.php` via `php artisan make:request StoreServiceRequest --no-interaction` com regras: `name` required/string/max:255, `price_cents` required/integer/min:1/max:9999999, `duration_minutes` required/integer/min:1/max:480
- [x] T009 [P] [US1] Criar `CreateService` action em `app/Actions/CreateService.php` via `php artisan make:action "CreateService" --no-interaction` — recebe `BarberProfile $profile`, `string $name`, `int $priceCents`, `int $durationMinutes`; cria e retorna `Service` com `sort_order = $profile->services()->max('sort_order') + 1`; **não avança `onboarding_step`** (responsabilidade do controller)
- [x] T010 [US1] Criar `ServiceController` em `app/Http/Controllers/ServiceController.php` via `php artisan make:controller ServiceController --no-interaction` — método `index()`: carrega `$profile->services()->orderBy('sort_order')->get()`, envia prop `templates` (array com Corte/Barba/Combo) quando count=0 e null caso contrário, prop `services`, `is_onboarding`, `onboarding_step`, `steps`; método `store()`: chama `CreateService`, então se `$profile->onboarding_step === BarberOnboardingStep::Services` atualiza `onboarding_step` para `BarberOnboardingStep::Availability` (separação de responsabilidade: action apenas cria o serviço), redireciona para `onboarding.services.index`
- [x] T011 [US1] Adicionar rotas `GET onboarding/services` (→ `ServiceController@index`, nome `onboarding.services.index`) e `POST onboarding/services` (→ `ServiceController@store`, nome `onboarding.services.store`) em `routes/web.php` dentro do group `auth`
- [x] T012 [US1] Criar page `resources/js/pages/onboarding/services.tsx` — layout de onboarding (stepper idêntico ao de `onboarding/profile`), seção de templates (cards com nome/preço/duração pré-preenchidos, botão "Adicionar") quando `templates !== null`, lista de serviços criados, botão "Adicionar serviço" para formulário em branco, botão "Próximo passo" (habilitado quando `services.length > 0`)
- [x] T013 [US1] Executar `php artisan wayfinder:generate` e verificar que `resources/js/actions/ServiceController.ts` foi gerado
- [x] T014 [US1] Rodar `php artisan test --compact --filter=ServiceControllerTest` e confirmar que todos os testes de US1 passam

**Checkpoint**: `GET onboarding/services` exibe templates; `POST` cria serviço; US1 funcional de ponta a ponta.

---

## Phase 4: User Story 2 — Gerenciar serviços existentes (Priority: P1)

**Goal**: Barbeiro edita nome/preço/duração de serviços existentes e exclui serviços (com aviso para agendamentos futuros).

**Independent Test**: Criar serviço via API/UI → editar campo → confirmar novo valor na listagem → excluir → confirmar ausência na lista.

### Testes para User Story 2

> **ESCREVER PRIMEIRO — garantir que FALHEM antes de implementar**

- [x] T015 [P] [US2] Adicionar ao `ServiceControllerTest` cenários de update: atualiza campos e redireciona, valida campos inválidos, retorna 404 para serviço de outro barbeiro
- [x] T016 [P] [US2] Adicionar ao `ServiceControllerTest` cenários de destroy: (1) remove imediatamente quando sem agendamentos futuros, (2) retorna metadado `appointments_count` e `requires_confirmation: true` quando há agendamentos futuros sem `confirm=1`, (3) exclui com `confirm=1` quando há agendamentos futuros, (4) retorna 404 para serviço de outro barbeiro, **(5) retorna erro quando barbeiro tenta excluir o único serviço ativo** (FR-007)

### Implementação para User Story 2

- [x] T017 [P] [US2] Criar `UpdateServiceRequest` em `app/Http/Requests/UpdateServiceRequest.php` via `php artisan make:request UpdateServiceRequest --no-interaction` — mesmas regras de `StoreServiceRequest`: `name` required/string/max:255, `price_cents` required/integer/min:1/max:9999999, `duration_minutes` required/integer/min:1/max:480
- [x] T018 [P] [US2] Criar `UpdateService` action em `app/Actions/UpdateService.php` via `php artisan make:action "UpdateService" --no-interaction` — recebe `Service $service`, campos; atualiza e retorna service atualizado
- [x] T019 [P] [US2] Criar `CancelServiceAppointments` stub action em `app/Actions/CancelServiceAppointments.php` via `php artisan make:action "CancelServiceAppointments" --no-interaction` — recebe `Service $service`; retorna coleção vazia até F4 implementar o model `Appointment`; adicionar comentário `// F4 — conectar ao model Appointment quando disponível`
- [x] T019a [P] [US2] Criar `AppointmentCancelledClientNotification` em `app/Notifications/AppointmentCancelledClientNotification.php` via `php artisan make:notification AppointmentCancelledClientNotification --markdown=mail.service.appointment-cancelled-client --no-interaction` — implements `ShouldQueue`; recebe `$appointmentDate`, `$serviceName`, `$barberName` no construtor; `toMail()` com subject, linha explicativa e data do agendamento cancelado
- [x] T019b [P] [US2] Criar `AppointmentCancelledBarberNotification` em `app/Notifications/AppointmentCancelledBarberNotification.php` via `php artisan make:notification AppointmentCancelledBarberNotification --markdown=mail.service.appointment-cancelled-barber --no-interaction` — implements `ShouldQueue`; recebe `$serviceName` e `$cancelledCount` (int); `toMail()` com subject, linha informando quantos agendamentos foram cancelados e o nome do serviço
- [x] T019c [P] [US2] Criar `DeleteService` action em `app/Actions/DeleteService.php` via `php artisan make:action "DeleteService" --no-interaction` — injeta `CancelServiceAppointments $cancel` no construtor; verifica se é o único serviço ativo (lança `ServiceException`); conta `futureAppointmentsCount()` do service; se count > 0 e `$confirmed = false` retorna `['requires_confirmation' => true, 'appointments_count' => $count]`; se confirmado, executa em `DB::transaction()`: exclui service, chama `$cancel->run($service)` (stub), notifica cliente por appointment (`AppointmentCancelledClientNotification`) e barbeiro consolidado (`AppointmentCancelledBarberNotification`)
- [x] T020 [US2] Adicionar métodos `update()` e `destroy()` ao `ServiceController` — `update()`: resolve service scoped ao perfil do barbeiro autenticado (abort 404 se não encontrado), chama `UpdateService`, redireciona; `destroy()`: resolve service, chama `DeleteService` (injetado no construtor), trata retorno de `requires_confirmation` redirecionando back com `appointments_count`, ou redireciona ao index em sucesso
- [x] T021 [US2] Adicionar rotas `PUT onboarding/services/{service}` (→ `ServiceController@update`, nome `onboarding.services.update`) e `DELETE onboarding/services/{service}` (→ `ServiceController@destroy`, nome `onboarding.services.destroy`) em `routes/web.php`
- [x] T022 [US2] Atualizar `resources/js/pages/onboarding/services.tsx` — adicionar botão "Editar" em cada card (abre form inline ou modal com campos pré-preenchidos), botão "Excluir" com modal de confirmação quando `requires_confirmation: true` (exibindo `appointments_count`), formulário de edição usa `PUT` via Wayfinder
- [x] T023 [US2] Rodar `php artisan test --compact --filter=ServiceControllerTest` e confirmar que todos os testes de US1 + US2 passam

**Checkpoint**: CRUD completo funcional; segurança de escopo por barbeiro validada; US1 + US2 funcionam independentemente.

---

## Phase 5: User Story 3 — Ativar e desativar serviços (Priority: P2)

**Goal**: Barbeiro pausar/reativar serviços via toggle; sistema bloqueia desativação do último serviço ativo.

**Independent Test**: Criar 2 serviços ativos → desativar 1 → confirmar que some da "página pública" mas permanece no painel → reativar → confirmar retorno; tentar desativar o único ativo → confirmar bloqueio com mensagem.

### Testes para User Story 3

> **ESCREVER PRIMEIRO — garantir que FALHEM antes de implementar**

- [x] T024 [P] [US3] Criar `tests/Feature/Controllers/ServiceToggleControllerTest.php` via `php artisan make:test --pest Controllers/ServiceToggleControllerTest` — cenários: toggle desativa serviço ativo, toggle reativa serviço inativo, bloqueia desativação do último ativo com mensagem de erro, retorna 404 para serviço de outro barbeiro

### Implementação para User Story 3

- [x] T025 [P] [US3] Criar `ToggleService` action em `app/Actions/ToggleService.php` via `php artisan make:action "ToggleService" --no-interaction` — se `$service->is_active = true`: verifica `$profile->services()->where('is_active', true)->count() <= 1` (bloqueia com `ServiceException`); inverte `is_active`; salva e retorna
- [x] T026 [US3] Criar `ServiceToggleController` em `app/Http/Controllers/ServiceToggleController.php` via `php artisan make:controller ServiceToggleController --no-interaction` — single action `__invoke()`: resolve service scoped ao perfil (abort 404), chama `ToggleService`, trata `ServiceException` redirecionando com erro, redireciona ao index
- [x] T027 [US3] Adicionar rota `PATCH onboarding/services/{service}/toggle` (→ `ServiceToggleController`, nome `onboarding.services.toggle`) em `routes/web.php`
- [x] T028 [US3] Atualizar `resources/js/pages/onboarding/services.tsx` — adicionar toggle switch em cada card usando `PATCH` via Wayfinder; desabilitar toggle visualmente quando seria o último ativo
- [x] T029 [US3] Executar `php artisan wayfinder:generate` para gerar `resources/js/actions/ServiceToggleController.ts`
- [x] T030 [US3] Rodar `php artisan test --compact --filter=ServiceToggleControllerTest` e confirmar que todos os testes de US3 passam

**Checkpoint**: Toggle funcional com guard de "último ativo"; US3 testável independentemente.

---

## Phase 6: User Story 4 — Reordenar serviços (Priority: P3)

**Goal**: Barbeiro arrasta serviços para nova posição; `sort_order` é persistido e refletido na listagem.

**Independent Test**: Criar 3 serviços → arrastar serviço C para primeira posição → acessar `GET onboarding/services` → confirmar ordem [C, A, B] no array `services`.

### Testes para User Story 4

> **ESCREVER PRIMEIRO — garantir que FALHEM antes de implementar**

- [x] T031 [P] [US4] Criar `tests/Feature/Controllers/ServiceOrderControllerTest.php` via `php artisan make:test --pest Controllers/ServiceOrderControllerTest` — cenários: salva nova ordem corretamente, rejeita array com IDs de outros barbeiros (retorna 422), requer array não vazio, retorna 404 para barbeiro sem perfil

### Implementação para User Story 4

- [x] T032 [P] [US4] Criar `ReorderServicesRequest` em `app/Http/Requests/ReorderServicesRequest.php` via `php artisan make:request ReorderServicesRequest --no-interaction` — regras: `order` required/array/min:1, `order.*` required/uuid — validação de pertencimento ao barbeiro será feita na action
- [x] T033 [P] [US4] Criar `ReorderServices` action em `app/Actions/ReorderServices.php` via `php artisan make:action "ReorderServices" --no-interaction` — recebe `BarberProfile $profile`, `array $orderedIds`; verifica que todos os IDs pertencem ao perfil (lança `ServiceException` se não); usa `DB::transaction()` para atualizar `sort_order` de cada service em lote
- [x] T034 [US4] Criar `ServiceOrderController` em `app/Http/Controllers/ServiceOrderController.php` via `php artisan make:controller ServiceOrderController --no-interaction` — single action `__invoke()`: chama `ReorderServices`; captura `ServiceException` e redireciona back com erro de validação (422 via `back()->withErrors(['order' => $e->getMessage()])`); em sucesso redireciona ao index
- [x] T035 [US4] Adicionar rota `PATCH onboarding/services/order` (→ `ServiceOrderController`, nome `onboarding.services.order`) em `routes/web.php` **antes** da rota `PUT onboarding/services/{service}` para evitar conflito de routing
- [x] T036 [US4] Atualizar `resources/js/pages/onboarding/services.tsx` — implementar drag-and-drop com `@dnd-kit/sortable` (`SortableContext`, `useSortable`, `DndContext`); ao soltar (`onDragEnd`), aplicar optimistic update local imediatamente e disparar `router.patch` silencioso via Wayfinder para `onboarding.services.order` com o array de IDs reordenados (`preserveScroll: true, preserveState: true`); em caso de falha do servidor, Inertia reverte o estado automaticamente
- [x] T037 [US4] Executar `php artisan wayfinder:generate` para gerar `resources/js/actions/ServiceOrderController.ts`
- [x] T038 [US4] Rodar `php artisan test --compact --filter=ServiceOrderControllerTest` e confirmar que todos os testes de US4 passam

**Checkpoint**: Reordenação persistida e refletida na listagem; US4 testável independentemente.

---

## Phase 7: Polish & Quality Gates

**Purpose**: Garantir conformidade total com a constituição antes do merge.

- [x] T039 [P] Rodar suite completa `composer test:unit` — confirmar 100% code coverage
- [x] T040 [P] Rodar análise estática `composer test:types` — confirmar zero erros Larastan nível max
- [x] T041 [P] Rodar `composer test:type-coverage` — confirmar 100% type coverage
- [x] T042 [P] Rodar `vendor/bin/pint --dirty --format agent` — aplicar correções de estilo em todos os arquivos PHP modificados
- [x] T043 Revisar `resources/js/pages/onboarding/services.tsx` contra `design/design-system.html` — verificar tokens de cor, tipografia e espaçamento
- [x] T044 Verificar layout da página em viewport 320px — todos os elementos devem ser funcionais e visíveis na menor largura suportada
- [x] T045 Confirmar que nenhuma URL está hardcoded no frontend (somente funções Wayfinder de `@/actions/`)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup: T001–T003b)  [T003a e T003b paralelos com T001–T003]
  └── Phase 2 (Foundational: T004–T005) [T004, T005 paralelos entre si]
        └── Phase 3 (US1: T006–T014)  ← MVP mínimo viável
              └── Phase 4 (US2: T015–T023)
                    ├── Phase 5 (US3: T024–T030) [paralelo com Phase 6 se time suficiente]
                    └── Phase 6 (US4: T031–T038) [paralelo com Phase 5 se time suficiente]
                          └── Phase 7 (Polish: T039–T045)
```

### User Story Dependencies

- **US1 (P1)**: Requer Phase 1 + Phase 2. Nenhuma dependência de outras stories.
- **US2 (P1)**: Requer US1 (reutiliza `ServiceController` e `ServiceControllerTest`).
- **US3 (P2)**: Requer Phase 2. Independente de US1/US2 (controller separado).
- **US4 (P3)**: Requer Phase 2. Independente de US1/US2/US3 (controller separado).

### Within Each User Story

1. Escrever testes → confirmar que FALHAM
2. Criar Form Request / Action → executar testes novamente (ainda devem falhar)
3. Implementar controller + rotas → executar testes (devem passar)
4. Implementar frontend → teste manual
5. Regenerar Wayfinder → verificar tipos TypeScript

### Parallel Opportunities

**Dentro da Phase 1**: T001 → T002 → T003 (sequencial por dependência)

**Dentro da Phase 2**: T004 e T005 paralelos entre si (arquivos diferentes)

**Dentro da Phase 3**: T006, T007, T008, T009 paralelos entre si (arquivos diferentes)

**Fases 5 e 6** podem ser trabalhadas em paralelo por developers diferentes após Phase 4.

**Fase 7**: T039, T040, T041, T042 paralelos entre si.

---

## Parallel Example: User Story 1 (Phase 3)

```bash
# Batch 1 — Testes + Form Request + Action (arquivos diferentes, sem dependências):
Task T006: "Criar ServiceControllerTest com cenários de index"
Task T007: "Adicionar cenários de store ao ServiceControllerTest"
Task T008: "Criar StoreServiceRequest em app/Http/Requests/StoreServiceRequest.php"
Task T009: "Criar CreateService action em app/Actions/CreateService.php"

# Batch 2 — Controller + Routes + Frontend (após T008 e T009):
Task T010: "Implementar ServiceController (index + store)"
Task T011: "Adicionar rotas GET/POST onboarding/services"
Task T012: "Criar page resources/js/pages/onboarding/services.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Phase 3)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: US1 (T006–T014)
4. **STOP e VALIDE**: Conta zerada → templates → criar serviços → publicar perfil ✅
5. Demo/revisão antes de continuar

### Incremental Delivery

1. Setup + Foundational → infraestrutura pronta
2. US1 → templates e criação básica → **MVP!**
3. US2 → edição e exclusão → **CRUD completo**
4. US3 → toggle ativo/inativo → **controle de visibilidade**
5. US4 → reordenação → **experiência polida**
6. Polish → quality gates → **pronto para merge**

### Parallel Team Strategy

Com dois developers (após Phase 2 completa):
- **Dev A**: US1 → US2 (controller principal, templates, CRUD)
- **Dev B**: US3 → US4 (toggle controller, order controller — arquivos independentes)

---

## Notes

- `[P]` = arquivos diferentes, sem dependências não resolvidas no batch atual
- `[Story]` mapeia a tarefa à user story para rastreabilidade
- Cada story deve ser testável e demonstrável de forma independente
- **Convenção de escoping**: services são sempre filtrados por `barber_profile_id` do usuário autenticado; usar `abort(404)` para qualquer serviço não encontrado nesse escopo
- **ServiceException**: ver T003b (criação da classe na Phase 1)
- T035 é crítico: a rota `PATCH onboarding/services/order` deve ser registrada **antes** de `PUT onboarding/services/{service}` para evitar que "order" seja interpretado como um `{service}` ID
- **Notificações** (T019a, T019b): implementadas com `ShouldQueue`; em ambiente de testes usar `Notification::fake()` para assertar envio sem enviar emails de fato
- **DnD** (T036): usa `@dnd-kit/sortable` (aprovado 2026-04-08); HTML5 DnD nativo foi descartado por ausência de suporte touch
- **Auto-save reorder** (T036): `router.patch` disparado no `onDragEnd` com `preserveScroll: true` — sem botão "Salvar ordem"
