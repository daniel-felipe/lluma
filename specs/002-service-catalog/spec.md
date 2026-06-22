# Feature Specification: Service Catalog Management

**Feature Branch**: `002-service-catalog`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "F2 · Service Catalog Management — CRUD for barber services with name, price (BRL), duration, active/inactive toggle, default templates, reorder, and publishing rules."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar catálogo pela primeira vez (Priority: P1)

Um barbeiro recém-cadastrado acessa a seção de serviços e encontra três templates pré-definidos ("Corte", "Barba", "Combo") para aceitar ou personalizar. Ele confirma os templates e/ou adiciona seus próprios serviços, ficando pronto para publicar o perfil.

**Why this priority**: É o ponto de entrada obrigatório para novos barbeiros. Sem ao menos 1 serviço ativo, o perfil não pode ser publicado, bloqueando todo o fluxo de agendamento.

**Independent Test**: Pode ser testado criando uma conta de barbeiro zerada, acessando a tela de serviços e verificando que os templates aparecem, que é possível aceitar/editar cada um e que ao salvar o perfil pode ser publicado.

**Acceptance Scenarios**:

1. **Given** o barbeiro está acessando a tela de serviços pela primeira vez, **When** a tela carrega, **Then** três cards de template ("Corte", "Barba", "Combo") são exibidos com nome, preço sugerido e duração sugerida pré-preenchidos.
2. **Given** os templates estão exibidos, **When** o barbeiro aceita todos sem alteração, **Then** os três serviços são criados como ativos e o perfil pode ser publicado.
3. **Given** os templates estão exibidos, **When** o barbeiro edita o nome/preço/duração de um template antes de aceitar, **Then** o serviço é criado com os valores customizados.
4. **Given** os templates estão exibidos, **When** o barbeiro descarta um template, **Then** apenas os templates aceitos são criados como serviços.

---

### User Story 2 - Gerenciar serviços existentes (Priority: P1)

O barbeiro pode criar novos serviços, editar detalhes de serviços existentes e excluí-los quando necessário, mantendo o catálogo sempre atualizado para os clientes.

**Why this priority**: É a funcionalidade central — sem ela, o catálogo não pode ser mantido ao longo do tempo.

**Independent Test**: Pode ser testado criando, editando e excluindo serviços e verificando que as mudanças refletem na lista de serviços e na página pública.

**Acceptance Scenarios**:

1. **Given** o barbeiro está na tela de serviços, **When** ele cria um novo serviço com nome, preço e duração válidos, **Then** o serviço aparece na lista como ativo.
2. **Given** existe um serviço cadastrado, **When** o barbeiro edita nome, preço ou duração e salva, **Then** os novos valores ficam imediatamente visíveis na página pública de agendamento.
3. **Given** existe um serviço sem agendamentos futuros, **When** o barbeiro o exclui, **Then** o serviço é removido da lista e da página pública sem aviso adicional.
4. **Given** existe um serviço com agendamentos futuros, **When** o barbeiro tenta excluí-lo, **Then** um aviso é exibido informando quantos agendamentos serão afetados, e o barbeiro deve confirmar explicitamente antes de prosseguir.

---

### User Story 3 - Ativar e desativar serviços (Priority: P2)

O barbeiro pode pausar temporariamente um serviço sem excluí-lo, mantendo suas configurações para uso futuro.

**Why this priority**: Evita perda de dados ao suspender serviços sazonais ou temporariamente indisponíveis, sem impactar a continuidade do histórico.

**Independent Test**: Pode ser testado desativando um serviço e verificando que ele some da página pública mas permanece na lista interna com status "inativo".

**Acceptance Scenarios**:

1. **Given** existe um serviço ativo, **When** o barbeiro o desativa pelo toggle, **Then** o serviço some da página pública de agendamento mas permanece visível no painel do barbeiro como inativo.
2. **Given** existe um serviço inativo, **When** o barbeiro o reativa, **Then** o serviço volta imediatamente para a página pública.
3. **Given** há apenas 1 serviço ativo, **When** o barbeiro tenta desativá-lo, **Then** o sistema bloqueia a ação e exibe uma mensagem informando que pelo menos 1 serviço deve permanecer ativo para manter o perfil publicado.

---

### User Story 4 - Reordenar serviços (Priority: P3)

O barbeiro pode definir a ordem em que os serviços aparecem na página pública de agendamento, priorizando os mais procurados.

**Why this priority**: Melhora a experiência do cliente na página pública, mas não bloqueia o fluxo principal de agendamento.

**Independent Test**: Pode ser testado reordenando serviços e verificando que a nova ordem é refletida imediatamente na página pública.

**Acceptance Scenarios**:

1. **Given** o barbeiro tem múltiplos serviços, **When** ele arrasta um serviço para uma nova posição, **Then** a ordem é salva e a página pública reflete a nova ordenação.
2. **Given** o barbeiro reordena serviços, **When** um cliente acessa a página pública, **Then** os serviços aparecem na ordem definida pelo barbeiro.

---

### Edge Cases

- O que acontece se o barbeiro tentar publicar o perfil sem nenhum serviço ativo? → Publicação bloqueada com mensagem de erro clara.
- O que acontece se o preço for zero, negativo ou superior a R$ 99.999,99? → Campo inválido, salvar bloqueado com mensagem de validação.
- O que acontece se a duração for zero ou superior a 480 minutos? → Campo inválido, salvar bloqueado com mensagem de validação.
- O que acontece se o nome do serviço estiver vazio? → Campo obrigatório, salvar bloqueado.
- O que acontece ao excluir o único serviço ativo com agendamentos futuros? → Aviso de agendamentos afetados + bloqueio de desativação caso não reste nenhum serviço ativo após a exclusão. Se confirmado, os agendamentos futuros são cancelados automaticamente e os clientes são notificados.
- O que acontece se dois serviços tiverem o mesmo nome? → Permitido (barbeiros podem ter variações com preços diferentes), sem restrição de unicidade de nome.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que o barbeiro crie serviços informando nome (texto livre, obrigatório), preço em BRL (decimal positivo, máx R$ 99.999,99) e duração em minutos (inteiro positivo, máx 480 min / 8h).
- **FR-002**: O sistema DEVE exibir templates pré-definidos ("Corte", "Barba", "Combo") quando o barbeiro não possui nenhum serviço cadastrado (contagem = 0), com valores sugeridos para preço e duração. Nenhum campo extra é necessário no modelo do barbeiro para rastrear este estado.
- **FR-003**: O sistema DEVE permitir que o barbeiro edite qualquer campo (nome, preço, duração) de um serviço existente a qualquer momento.
- **FR-004**: O sistema DEVE permitir que o barbeiro exclua um serviço sem agendamentos futuros imediatamente, sem confirmação adicional.
- **FR-005**: O sistema DEVE exibir um aviso com o número de agendamentos futuros afetados e exigir confirmação explícita antes de excluir um serviço com agendamentos futuros. Após confirmação, os agendamentos futuros vinculados ao serviço DEVEM ser cancelados automaticamente; o **cliente** de cada agendamento DEVE ser notificado por email sobre o cancelamento; e o **barbeiro** DEVE receber um email consolidado listando todos os agendamentos cancelados.
- **FR-006**: O sistema DEVE permitir que o barbeiro ative ou desative qualquer serviço via toggle, sem excluí-lo.
- **FR-007**: O sistema DEVE bloquear a desativação ou exclusão de um serviço quando ele for o único ativo, exibindo mensagem explicando o requisito mínimo de 1 serviço ativo.
- **FR-008**: O sistema DEVE impedir a publicação do perfil do barbeiro enquanto não houver ao menos 1 serviço ativo.
- **FR-009**: O sistema DEVE permitir que o barbeiro reordene os serviços via drag-and-drop; a nova ordem DEVE ser salva automaticamente ao soltar o item (sem botão de confirmação) e refletida imediatamente na página pública de agendamento.
- **FR-010**: Qualquer alteração em serviços (criação, edição, ativação/desativação, exclusão, reordenação) DEVE ser refletida imediatamente na página pública de agendamento.
- **FR-011**: O preço DEVE ser exibido em formato monetário BRL (R$) na página pública.
- **FR-012**: A duração de cada serviço DEVE ser utilizada pelo módulo de disponibilidade (F4) no cálculo de slots de horário.
- **FR-013**: Qualquer tentativa de acessar ou modificar um serviço que não pertença ao barbeiro autenticado DEVE retornar 404 (recurso não encontrado), sem revelar a existência de dados de outros barbeiros.

### Key Entities

- **Service** (Serviço): Representa um serviço oferecido pelo barbeiro. Atributos: nome, preço (BRL), duração (minutos), status (ativo/inativo), ordem de exibição, data de criação, data de atualização. Pertence a um barbeiro.
- **ServiceTemplate** (Template padrão): Sugestão de serviço pré-configurada exibida apenas na primeira configuração. Não é persistida; serve para popular o formulário de criação.
- **Appointment** (Agendamento): Entidade relacionada consultada para verificar existência de agendamentos futuros antes de excluir um serviço.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um barbeiro consegue configurar ao menos 3 serviços em menos de 2 minutos a partir do zero (usando os templates ou criando manualmente).
- **SC-002**: Qualquer alteração em um serviço é visível na página pública de agendamento em menos de 5 segundos após salvar.
- **SC-003**: 100% das tentativas de publicar um perfil sem serviços ativos são bloqueadas com mensagem de erro clara.
- **SC-004**: 100% das tentativas de excluir um serviço com agendamentos futuros exibem aviso antes de prosseguir.
- **SC-005**: A página pública exibe os serviços exatamente na ordem definida pelo barbeiro, sem desvios.

## Clarifications

### Session 2026-04-07

- Q: O que acontece com os agendamentos futuros quando o barbeiro confirma a exclusão de um serviço? → A: Agendamentos futuros são cancelados automaticamente e o cliente é notificado.
- Q: O que deve acontecer quando um barbeiro tenta acessar ou modificar serviços de outro barbeiro? → A: Retornar 404 (recurso não encontrado), sem revelar que o recurso pertence a outro usuário.
- Q: Serviços devem suportar uma foto/imagem opcional? → A: Não, fora do escopo desta feature.

### Session 2026-04-08

- Q: Qual é o canal de notificação para o cliente quando um agendamento é cancelado automaticamente pela exclusão do serviço? → A: Email (via sistema de mail do Laravel).
- Q: Como a reordenação de serviços deve ser persistida — auto-save ao soltar ou botão explícito? → A: Auto-save imediato ao soltar o item (PATCH silencioso, sem botão de confirmação).
- Q: Como o sistema determina que é a "primeira vez" que o barbeiro acessa a tela de serviços para exibir os templates? → A: Barbeiro não possui nenhum serviço cadastrado (contagem = 0); nenhum campo extra necessário.
- Q: O barbeiro também deve ser notificado por email quando agendamentos são cancelados automaticamente pela exclusão de um serviço? → A: Sim, barbeiro recebe email consolidado listando todos os agendamentos cancelados.
- Q: Devem existir limites máximos para preço e duração de um serviço? → A: Preço máx R$ 99.999,99 · Duração máx 480 min (8h).

## Assumptions

- Os templates pré-definidos são exibidos sempre que o barbeiro não possui nenhum serviço cadastrado (contagem = 0). Após criar ao menos um serviço (aceitando ou ignorando os templates), eles não reaparecem enquanto houver serviços. Se todos os serviços forem excluídos, os templates voltam a ser exibidos como sugestão.
- O preço é em Reais (BRL) com até 2 casas decimais, mínimo R$ 0,01 e máximo R$ 99.999,99; outras moedas estão fora do escopo.
- A duração é em minutos inteiros, mínimo 1 min e máximo 480 min (8h); durações fracionadas não são suportadas.
- O barbeiro autenticado gerencia apenas seus próprios serviços; não há compartilhamento entre barbeiros.
- Não há limite máximo de serviços por barbeiro.
- Serviços inativos não aparecem na página pública nem ficam disponíveis para agendamento, mas permanecem visíveis no painel do barbeiro.
- A verificação de agendamentos futuros considera apenas agendamentos com status não cancelado e data/hora futura ao momento da exclusão.
- A reordenação é feita por arrastar e soltar (drag-and-drop) na interface; a ordem é salva automaticamente ao soltar o item, sem botão de confirmação; a ordem padrão inicial é a de criação.
- A duração de cada serviço é consumida diretamente pelo módulo de disponibilidade (F4) para calcular os slots — nenhuma lógica adicional de agrupamento ou sobreposição é escopo deste feature.
- Imagens/fotos de serviços estão fora do escopo desta feature. Serviços possuem apenas nome, preço, duração e status.
- Valores sugeridos nos templates: Corte (R$ 35,00 / 30 min), Barba (R$ 25,00 / 20 min), Combo (R$ 55,00 / 45 min). Estes podem ser ajustados pelo barbeiro livremente.
