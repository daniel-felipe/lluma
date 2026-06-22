# Data Model: Service Catalog Management (F2)

**Phase 1 Output** | Branch: `002-service-catalog`

## Entities

### Service

Representa um serviço oferecido pelo barbeiro. Pertence a um `BarberProfile`.

| Campo              | Tipo                   | Nullable | Default | Notas                                      |
|--------------------|------------------------|----------|---------|--------------------------------------------|
| `id`               | `uuid` (PK)            | No       | —       | UUID v4, gerado pelo Laravel               |
| `barber_profile_id`| `uuid` (FK)            | No       | —       | → `barber_profiles.id`, cascade delete     |
| `name`             | `string(255)`          | No       | —       | Nome do serviço (texto livre)              |
| `price_cents`      | `unsignedInteger`      | No       | —       | Preço em centavos (ex: 4500 = R$ 45,00)    |
| `duration_minutes` | `unsignedSmallInteger` | No       | —       | Duração em minutos, deve ser > 0           |
| `is_active`        | `boolean`              | No       | `true`  | Se aparece na página pública               |
| `sort_order`       | `unsignedInteger`      | No       | `0`     | Ordem de exibição definida pelo barbeiro   |
| `created_at`       | `timestamp`            | No       | —       | Gerado pelo Laravel                        |
| `updated_at`       | `timestamp`            | No       | —       | Gerado pelo Laravel                        |

**Índices**:
- PK em `id`
- FK em `barber_profile_id`
- Índice composto em `(barber_profile_id, sort_order)` — queries de listagem ordenada

**Validações de negócio**:
- `name`: obrigatório, não vazio, max 255 chars
- `price_cents`: obrigatório, inteiro, min: 1 (= R$ 0,01), max: 9999999 (= R$ 99.999,99)
- `duration_minutes`: obrigatório, inteiro, min: 1, max: 480
- Não há unicidade de `name` por barbeiro (assumption da spec)

**Invariantes**:
- Um barbeiro DEVE ter pelo menos 1 serviço ativo para publicar o perfil (verificado em `PublishBarberProfile`)
- Desativar ou excluir o único serviço ativo é proibido (verificado nas actions `ToggleService` e `DeleteService`)

---

### ServiceTemplate (Value Object — sem persistência)

Representa um template sugerido exibido na primeira configuração. **Não tem tabela no banco.**

| Campo              | Tipo      | Valor padrão          |
|--------------------|-----------|----------------------|
| `name`             | string    | "Corte" / "Barba" / "Combo" |
| `price_cents`      | int       | 3500 / 2500 / 5500          |
| `duration_minutes` | int       | 30 / 20 / 45         |

Enviado como prop Inertia `templates` apenas quando `barberProfile->services()->count() === 0`.

---

### Appointment (Entidade relacionada — F5)

Não implementada nesta feature. Referenciada em:
- `DeleteService`: verificar `appointments` futuros antes de excluir
- `ToggleService`: não bloqueado por agendamentos (apenas pela regra de "último ativo")

O model `Service` declara a relationship `hasMany(Appointment::class)` como stub. Enquanto a tabela `appointments` não existir, `$service->appointments()` retorna vazio → exclusão direta sem aviso.

---

## Relacionamentos

```
User (1) ────── (1) BarberProfile (1) ────── (N) Service
```

- `BarberProfile::services()` → `HasMany<Service, BarberProfile>` (já existe como stub em F1)
- `Service::barberProfile()` → `BelongsTo<BarberProfile, Service>`
- `Service::appointments()` → `HasMany<Appointment, Service>` (stub, implementado em F5)

---

## Migration

Expandir a migration stub `2026_04_06_213402_create_services_table.php`:

```php
Schema::create('services', function (Blueprint $table): void {
    $table->uuid('id')->primary();
    $table->foreignUuid('barber_profile_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->unsignedInteger('price_cents');
    $table->unsignedSmallInteger('duration_minutes');
    $table->boolean('is_active')->default(true);
    $table->unsignedInteger('sort_order')->default(0);
    $table->timestamps();

    $table->index(['barber_profile_id', 'sort_order']);
});
```

---

## Enums

### ServiceStatus (não necessário como Enum)

`is_active` é um boolean simples — não precisa de Enum. A lógica de "último ativo" é verificada via query count, não via cast de Enum.

---

## Factory

`ServiceFactory` expandida com estados:

- `->active()` — `is_active = true`
- `->inactive()` — `is_active = false`
- `->forProfile(BarberProfile $profile)` — seta `barber_profile_id`
- Defaults: nome fake, preço aleatório 2000–10000 centavos (R$ 20–100), duração 15–90 min, ativo, sort_order 0
