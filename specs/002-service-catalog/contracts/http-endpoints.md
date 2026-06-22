# HTTP Contracts: Service Catalog (F2)

**Inertia + Laravel** — todas as rotas retornam Inertia responses (HTML + JSON via XHR) exceto as de mutation que redirecionam.

## Rotas

### Onboarding — Catálogo de Serviços

| Method   | Path                                   | Controller                          | Nome da Rota                     | Middleware                |
|----------|----------------------------------------|-------------------------------------|----------------------------------|---------------------------|
| `GET`    | `onboarding/services`                  | `ServiceController@index`           | `onboarding.services.index`      | `auth`                    |
| `POST`   | `onboarding/services`                  | `ServiceController@store`           | `onboarding.services.store`      | `auth`                    |
| `PUT`    | `onboarding/services/{service}`        | `ServiceController@update`          | `onboarding.services.update`     | `auth`                    |
| `DELETE` | `onboarding/services/{service}`        | `ServiceController@destroy`         | `onboarding.services.destroy`    | `auth`                    |
| `PATCH`  | `onboarding/services/{service}/toggle` | `ServiceToggleController`           | `onboarding.services.toggle`     | `auth`                    |
| `PATCH`  | `onboarding/services/order`            | `ServiceOrderController`            | `onboarding.services.order`      | `auth`                    |

> **Nota**: O controller `ServiceController` é reaproveitado tanto no onboarding quanto na gestão contínua (mesmas actions, layout diferente via prop). As rotas de gestão pós-onboarding são adicionadas no dashboard (escopo de F2 mas listadas aqui para referência).

---

## Payloads

### POST `onboarding/services` — Criar serviço

**Request Body** (JSON / form):
```json
{
  "name": "Corte Degradê",
  "price_cents": 4500,
  "duration_minutes": 40
}
```

**Validação**:
- `name`: required, string, max:255
- `price_cents`: required, integer, min:1, max:9999999
- `duration_minutes`: required, integer, min:1, max:480

**Resposta em sucesso**: `Redirect` → `onboarding.services.index` com flash  
**Resposta em erro**: `Redirect` com `errors` no session (Inertia validation)

---

### PUT `onboarding/services/{service}` — Editar serviço

**Request Body** (JSON / form): igual ao POST acima.

**Autorização**: 404 se `service.barber_profile_id !== auth()->user()->barberProfile->id`

**Resposta em sucesso**: `Redirect` → `onboarding.services.index`

---

### DELETE `onboarding/services/{service}` — Excluir serviço

**Request Body**: nenhum

**Query param opcional**: `confirm=1` — confirma exclusão quando há agendamentos futuros

**Resposta — sem agendamentos futuros**: `Redirect` → `onboarding.services.index`  
**Resposta — com agendamentos futuros, sem confirmação**: `Redirect back` com prop `appointments_count` e `requires_confirmation: true`  
**Resposta — com agendamentos futuros + `confirm=1`**: Exclui, cancela agendamentos, `Redirect`  
**Resposta — último serviço ativo**: `Redirect back` com erro explicando requisito mínimo

---

### PATCH `onboarding/services/{service}/toggle` — Ativar/Desativar

**Request Body**: nenhum (toggle do estado atual)

**Resposta em sucesso**: `Redirect` → `onboarding.services.index`  
**Resposta — último ativo tentando desativar**: `Redirect back` com erro

---

### PATCH `onboarding/services/order` — Reordenar

**Request Body**:
```json
{
  "order": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Validação**:
- `order`: required, array
- `order.*`: uuid, exists:services,id (scoped ao barbeiro autenticado)

**Resposta em sucesso**: `Redirect` → `onboarding.services.index`

---

## Inertia Props (GET `onboarding/services`)

```typescript
type ServiceProps = {
  services: Service[]
  templates: ServiceTemplate[] | null  // null se barbeiro já tem serviços
  is_onboarding: boolean               // true durante onboarding, false pós
  onboarding_step: string              // 'services' durante onboarding
  steps: string[]                      // ['profile', 'services', 'availability']
}

type Service = {
  id: string
  name: string
  price_cents: number        // 3500 (= R$ 35,00)
  duration_minutes: number
  is_active: boolean
  sort_order: number
}

type ServiceTemplate = {
  name: string
  price_cents: number
  duration_minutes: number
}
```
