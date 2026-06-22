# Research: Service Catalog Management (F2)

**Phase 0 Output** | Branch: `002-service-catalog`

## Decision Log

### D-001: Service Model — campos da migration stub

**Decision**: Expandir a migration stub existente (`create_services_table`) adicionando: `name` (string), `price_cents` (unsignedInteger, centavos), `duration_minutes` (unsignedSmallInteger), `is_active` (boolean default true), `sort_order` (unsignedInteger default 0).

**Rationale**: A migration stub já existe com `uuid` primary key e `barber_profile_id` FK. O modelo está documentado na spec: nome, preço, duração em minutos, status ativo/inativo, ordem de exibição.

**Alternatives considered**: Usar `price_brl decimal(10,2)` — rejeitado. A Constituição v1.1.0 (Princípio VII) exige armazenamento em centavos como inteiro para evitar erros de arredondamento de ponto flutuante em operações financeiras.

---

### D-002: ServiceTemplate — sem persistência

**Decision**: Templates pré-definidos ("Corte", "Barba", "Combo") são constantes PHP (array no controller ou em uma classe `ServiceTemplate` value object), não persistidos. Enviados para o frontend como prop Inertia quando o barbeiro não tem serviços.

**Rationale**: A spec e as assumptions explicitam: "Os templates pré-definidos são exibidos apenas uma vez. Não é persistida." Persistir adiciona complexidade desnecessária (YAGNI).

**Alternatives considered**: Seeder de tabela `service_templates` — rejeitado; adiciona tabela sem benefício real. Array em config/services.php — rejeitado; configuração de app, não de templates de usuário.

---

### D-003: Drag-and-drop (P3 — reordenação)

**Decision**: `@dnd-kit/core` + `@dnd-kit/sortable` — dois pacotes npm pequenos (~20 KB gzip total).

**Rationale**: O HTML5 DnD API não tem suporte a touch/mobile (nenhum evento de touch é disparado), violando diretamente o Princípio II da constituição (Mobile-First, 320 px+). `@dnd-kit` é acessível por teclado, funciona em mouse e touch, é bem mantida, e é o padrão de facto para sortable lists em React. A reordenação é P3 mas o requisito mobile-first é não-negociável.

**✅ Aprovado em 2026-04-08**: adicionar `@dnd-kit/core` + `@dnd-kit/sortable` ao `package.json` (Princípio VI). Justificativa: mobile-first compliance; nenhum pacote existente resolve DnD com touch.

**Alternatives considered**:

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| HTML5 DnD nativo | Sem suporte a touch → viola Mobile-First |
| `react-beautiful-dnd` | Depreciado pelo Atlassian |
| Radix UI | Nenhum primitivo DnD/sortable existe |

---

### D-004: Checagem de agendamentos futuros (FR-004, FR-005)

**Decision**: `DeleteService` action verifica `Appointment` future records via `$service->appointments()->where('starts_at', '>', now())->whereNotIn('status', ['cancelled'])->count()`. Como o modelo `Appointment` ainda não existe (F5), a action recebe um `AppointmentRepository` contract ou verifica diretamente pela relationship stub. Para F2, a relationship é declarada mas a tabela de appointments não existe — portanto `appointments()` retorna coleção vazia (count=0), permitindo exclusão direta sem aviso. Quando F5 implementar `Appointment`, o comportamento correto ativará automaticamente.

**Rationale**: Evita acoplamento prematuro com F5. A spec menciona `Appointment` como entidade relacionada mas não como pre-requisito de F2. O comportamento de "zero agendamentos → exclusão direta" é correto para um serviço recém-criado.

**Alternatives considered**: Lançar exceção se `appointments` table não existe — rejeitado; quebraria testes. Retornar `0` como stub hardcoded — rejeitado; mascara a integração real.

---

### D-005: Rotas — onboarding vs. gestão pós-onboarding

**Decision**: Um único `ServiceController` com rotas sob `onboarding/services` (para onboarding step 2) **e** `services` (para gestão pós-onboarding no dashboard). O middleware `EnsureBarberOnboarding` precisa ser atualizado para redirecionar o step `Services` para `onboarding.services.edit`.

**Rationale**: A spec abrange os dois contextos (US1: primeira vez; US2+: gestão contínua). Dois controllers seriam duplicação. Um controller reaproveitado com contexto diferente (prop `is_onboarding`) é a abordagem mais limpa.

**Alternatives considered**: Resource controller único em `/services` acessível de qualquer contexto — rejeitado porque o onboarding precisa de fluxo guiado (layout diferente, botão "Próximo passo"). Controller separado `OnboardingServiceController` — rejeitado; violaria DRY sem ganho real.

---

### D-006: Segurança — FR-013 (404 para serviços de outro barbeiro)

**Decision**: Usar Route Model Binding com policy. `ServicePolicy::view/update/delete` sempre retorna `false` se `$user->barberProfile->id !== $service->barber_profile_id`. O controller usa `$this->authorize(...)` ou `Gate::authorize(...)`. Retornar 403 seria semanticamente correto, mas a spec define 404 para não revelar existência — usar `abort(404)` nos gates que retornam false.

**Rationale**: A spec é explícita: "retornar 404 sem revelar que o recurso pertence a outro usuário". Laravel gates que retornam false geram 403 por padrão; precisamos de `$response->deny()` com código 404 ou middleware de conversão.

**Alternatives considered**: Scopear queries com `->where('barber_profile_id', $profile->id)` na route binding — **preferido** por ser mais simples que policy. Usar `resolveRouteBinding` customizado no model ou binding explícito na route com `whereHas`. Esta é a abordagem mais simples e direta: scope query no controller sem policy separada.

---

### D-007: Formato de preço no frontend

**Decision**: Armazenar como `decimal(10,2)` no banco, transmitir como string decimal via Inertia props, formatar no frontend com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

**Rationale**: Evita perda de precisão em JSON (floats JavaScript) e é idiomático para formatação de moeda no Brasil.

**Alternatives considered**: Transmitir como inteiro de centavos — rejeitado; mais complexo no frontend sem ganho.

---

### D-008: Canal de notificação — cancelamento de agendamentos (Clarificação 2026-04-08)

**Decision**: Email via Laravel Notifications (`ShouldQueue` + mail channel). Dois emails:
1. `AppointmentCancelledClientNotification` — um por cliente afetado.
2. `AppointmentCancelledBarberNotification` — um consolidado para o barbeiro listando todos os agendamentos cancelados.

**Rationale**: Clarificado na sessão de 2026-04-08 (Q1 + Q4). Email é o canal definido pelo usuário. Queued notifications garantem que a resposta HTTP não seja bloqueada pelo envio.

---

### D-009: Persistência da reordenação — auto-save (Clarificação 2026-04-08)

**Decision**: Auto-save imediato ao soltar o item (PATCH silencioso via `router.patch`). Sem botão "Salvar ordem".

**Rationale**: Clarificado na sessão de 2026-04-08 (Q2). Inertia v3 optimistic updates com rollback automático em falha.

---

### D-010: Limites de validação — preço e duração (Clarificação 2026-04-08)

**Decision**: `price_cents`: min 1 (= R$ 0,01), max 9999999 (= R$ 99.999,99). `duration_minutes`: min 1, max 480.

**Rationale**: Clarificado na sessão de 2026-04-08 (Q5). Previne erros de digitação absurdos; cobre todos os casos reais de barbearia (sessões de até 8h).
