# Feature Specification: Cadastro e Tabela de Preços de Materiais e Perfis (Metalon, Cantoneiras, Barras Chatas e Tubos)

**Feature Branch**: `003-cadastro-materiais-perfis`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "os produto que me refiro e metalon barra chata cantoneira etc"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tabela e Gestão de Preços das Barras de 6 Metros (Priority: P1) 🎯 MVP

Como serralheiro ou gestor da oficina, desejo visualizar e atualizar os preços de compra das barras comerciais de 6,00 metros dos meus materiais (metalons, cantoneiras, barras chatas e tubos redondos), para que os cálculos de custos de aço e propostas comerciais reflitam imediatamente a tabela de preços atualizada dos meus distribuidores de ferro.

**Why this priority**: É a maior necessidade operacional da oficina. Os preços do aço oscilam com frequência e o serralheiro precisa ajustar rapidamente o valor da barra de 6m de um metalon 50x30, 40x20 ou cantoneira sem ter que mexer em código.

**Independent Test**: Acessar o Gerenciador de Materiais & Perfis, alterar o preço da barra de 6m do "Metalon 50x30 Chapa 18" de R$ 78,50 para R$ 85,00, salvar e confirmar que ao montar um orçamento o novo valor é aplicado instantaneamente no custo direto do aço.

**Acceptance Scenarios**:
1. **Given** a lista de materiais cadastrados,  
   **When** o usuário edita o campo de preço da barra de 6m e clica em salvar,  
   **Then** o novo valor é gravado no IndexedDB e refletido em todos os cálculos do sistema.
2. **Given** a tabela de materiais,  
   **When** o usuário busca por "40x20" ou filtra por "Tubo Retangular",  
   **Then** a listagem exibe apenas os perfis correspondentes com código, peso por barra e preço.

---

### User Story 2 - Cadastro de Novos Perfis de Aço (Priority: P2)

Como serralheiro, desejo cadastrar novas bitolas e tipos de perfis que não constavam na lista inicial (ex.: Metalon 60x40 chapa 16, Cantoneira de 2", Tubo redondo de 3", Perfil U ou Ferro T), informando suas dimensões em mm, peso aproximado por barra e preço da barra de 6 metros.

**Why this priority**: Permite flexibilidade para oficinas que trabalham com estruturas pesadas, perfis industriais ou bitolas sob encomenda.

**Independent Test**: Clicar em "Novo Perfil de Aço", preencher tipo ("tubo_retangular"), descrição ("Metalon 60x40 Chapa 16"), medidas (largura 60mm, altura 40mm, chapa 1.5mm), peso (13.5 kg) e preço (R$ 135,00). Salvar e verificar que o novo perfil já fica disponível para seleção nos campos de Requadro e Réguas do construtor de orçamento.

**Acceptance Scenarios**:
1. **Given** o formulário de cadastro de novo perfil,  
   **When** o usuário informa os dados válidos e clica em salvar,  
   **Then** o perfil é criado com ID exclusivo, persistido no banco local e adicionado aos seletores de materiais da aplicação.
2. **Given** que o usuário cadastra um novo perfil,  
   **When** abre a tela de montagem de orçamento (`ItemBuilder`),  
   **Then** o novo perfil aparece nas opções de seleção de perfil com sua descrição e preço atualizado.

---

### User Story 3 - Ativação/Desativação e Restauração de Padrões (Priority: P3)

Como usuário, desejo poder desativar perfis que minha oficina não costuma utilizar (para não poluir as listas de seleção) e ter a opção de "Restaurar Catálogo Padrão Brasileiro" caso precise recuperar as medidas e bitolas de fábrica.

**Why this priority**: Melhora a usabilidade no dia a dia, mantendo apenas os materiais relevantes visíveis na hora de orçar.

**Independent Test**: Desmarcar a opção "Ativo" de um perfil pouco usado e verificar que ele deixa de aparecer nos seletores do orçamento, mantendo-se disponível para reativação na tabela de gestão.

**Acceptance Scenarios**:
1. **Given** um perfil desativado,  
   **When** o usuário abre o construtor de orçamentos,  
   **Then** o perfil não é exibido nas opções de Requadro ou Preenchimento.
2. **Given** alterações manuais efetuadas,  
   **When** o usuário clica em "Restaurar Catálogo Padrão",  
   **Then** as bitolas originais do catálogo brasileiro são recarregadas mantendo integridade.

---

### Edge Cases

- **Preço zero ou negativo**: O sistema deve exigir que o preço da barra de 6m seja estritamente $> 0$.
- **Perfil em uso em orçamentos salvos**: Se um perfil for desativado ou editado, orçamentos legados salvos preservam seus dados calculados sem quebrar.
- **Medidas em polegadas e milímetros**: O formulário deve permitir informar as dimensões nominais em milímetros (ex.: 50x30mm) e opcionalmente em polegadas (ex.: 2" x 1" 1/4).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma interface visual (modal ou tela de gerenciamento) "Tabela de Materiais & Perfis de Aço".
- **FR-002**: A interface DEVE listar todos os materiais cadastrados agrupados ou filtráveis por categoria: Metalons Retangulares, Metalons Quadrados, Tubos Redondos, Cantoneiras, Barras Chatas, Perfis U e Ferros T.
- **FR-003**: O usuário DEVE poder editar diretamente o preço de compra da barra comercial de 6 metros (`precoBarra6m`) de qualquer material.
- **FR-004**: O usuário DEVE poder cadastrar novos materiais fornecendo: descrição, tipo de perfil, largura (mm), altura (mm), espessura da chapa (mm ou bitola) e preço da barra de 6m.
- **FR-005**: O sistema DEVE permitir ativar ou desativar perfis através de um toggle/checkbox `ativo`.
- **FR-006**: O `ItemBuilder` DEVE carregar reativamente os materiais atualizados do repositório, refletindo imediatamente novos perfis e preços alterados.
- **FR-007**: O sistema DEVE disponibilizar botão de atalho no cabeçalho ou junto ao seletor de perfis para abrir rapidamente o gerenciador de materiais.
- **FR-008**: Todas as alterações e novos materiais DEVEM ser persistidos no IndexedDB (`offlineDB.save('materiais', ...)`) e incluídos no backup JSON.

### Key Entities

- **MaterialPerfil**:
  - `id: string`
  - `codigo: string`
  - `descricao: string`
  - `tipo: TipoPerfil` ('tubo_retangular' | 'tubo_quadrado' | 'tubo_redondo' | 'cantoneira' | 'barra_chata' | 'perfil_u' | 'ferro_t')
  - `dimensoesMm: { largura: number, altura: number, espessuraChapaMm: number, polegada?: string }`
  - `comprimentoBarraMm: number` (6000mm)
  - `pesoNominalKgPorBarra: number`
  - `precoBarra6m: number`
  - `ativo: boolean`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O serralheiro consegue localizar e atualizar o preço de uma barra de 6m em menos de 5 segundos.
- **SC-002**: Novos perfis cadastrados ficam disponíveis instantaneamente em todos os formulários de orçamento sem recarregar a página.
- **SC-003**: 100% de persistência offline no IndexedDB local com suporte total no backup JSON.
- **SC-004**: 100% de aprovação nos testes automatizados para operações de consulta, criação e edição de perfis.

---

## Assumptions

- O comprimento comercial padrão de barras de serralheria no Brasil é de 6,00 metros (6.000 mm).
- O motor de corte linear 1D (*First-Fit Decreasing*) e a composição de custos diretos utilizam sempre o `precoBarra6m` cadastrado no material selecionado.
