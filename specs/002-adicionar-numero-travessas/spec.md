# Feature Specification: Adicionar e Configurar Número de Travessas Paramétricas

**Feature Branch**: `002-adicionar-numero-travessas`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "adicionar uma função para adicionar o numero de travessas"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configuração Flexível de Travessas no Construtor de Itens (Priority: P1)

Como serralheiro orçamentista, desejo definir a quantidade exata de travessas intermediárias/reforços estruturais ao configurar um produto (portão, grade ou corrimão), para que a quantidade de peças lineares, o consumo de barras comerciais de 6m e o preço final reflitam a necessidade real do projeto do cliente.

**Why this priority**: É o valor central da funcionalidade. Sem poder ajustar o número de travessas no formulário, o serralheiro fica preso a quantidades fixas (ex.: apenas 1 travessa central no portão basculante) e tem que lançar barras manuais avulsas para compensar portões reforçados ou grades com múltiplas divisórias.

**Independent Test**: Pode ser testado abrindo o construtor de item no orçamento, selecionando qualquer modelo (ex.: Portão Basculante), alterando o campo "Número de Travessas" de 1 para 3 e verificando que a lista prévia de peças e o corte 1D passam a incluir 3 travessas horizontais com a largura do portão.

**Acceptance Scenarios**:
1. **Given** que o usuário está no formulário de inclusão de produto com o modelo "Portão Basculante" selecionado,  
   **When** altera o campo "Número de Travessas" para `2`,  
   **Then** a lista de peças demandadas pré-calculada exibe 2 travessas intermediárias de reforço além do requadro superior/inferior.
2. **Given** que o usuário altera o número de travessas para `0`,  
   **When** o pré-cálculo é executado,  
   **Then** nenhuma travessa intermediária é gerada (permanecendo apenas os montantes verticais e travessas de borda do requadro).
3. **Given** que o item com número customizado de travessas é adicionado ao orçamento,  
   **When** o usuário visualiza a lista de corte e a lista de compras da oficina,  
   **Then** as travessas constam agrupadas no plano de corte da barra de 6 metros.

---

### User Story 2 - Valores Padrão Inteligentes por Tipo de Estrutura (Priority: P2)

Como serralheiro, desejo que cada modelo de estrutura traga automaticamente um valor padrão coerente de travessas (ex.: 1 para portão basculante, 0 para portão deslizante convencional, 2 para linhas de corrimão, 0 para grade padrão), para que eu não precise digitar manualmente quando estiver orçando modelos convencionais.

**Why this priority**: Garante agilidade no atendimento e evita erros de cotação para usuários que trabalham com estruturas padronizadas.

**Independent Test**: Selecionar sucessivamente diferentes modelos no catálogo e confirmar que o campo "Número de Travessas" atualiza automaticamente para o valor recomendado de fábrica de cada tipo de modelo.

**Acceptance Scenarios**:
1. **Given** que o usuário troca o modelo de "Portão Basculante" para "Corrimão",  
   **When** a troca é efetuada,  
   **Then** o campo de travessas/linhas de proteção assume o valor padrão do corrimão (2).
2. **Given** que o usuário troca para "Grade Tubular",  
   **When** a troca é efetuada,  
   **Then** o campo de travessas intermediárias assume o padrão (0 travessas extras além do quadro).

---

### User Story 3 - Persistência e Transparência na Proposta e Oficina (Priority: P3)

Como usuário do sistema, desejo que o número de travessas escolhido fique salvo no orçamento (IndexedDB), para que ao editar o item ou imprimir o relatório técnico da oficina e a proposta do cliente, a especificação esteja preservada.

**Why this priority**: Evita inconsistências entre o orçamento calculado e a ordem de produção enviada à bancada de corte da serralheria.

**Independent Test**: Salvar um item com 3 travessas, recarregar a página, inspecionar os detalhes do orçamento e confirmar que o número de peças demandadas e o subtotal continuam exatamente iguais.

**Acceptance Scenarios**:
1. **Given** um item orçado com 3 travessas salvo no sistema,  
   **When** o usuário consulta os dados salvos ou o mapa de corte da oficina,  
   **Then** as 3 peças constam no resumo com seus respectivos comprimentos e perfis associados.

---

### Edge Cases

- **Entrada zero (`0`)**: O usuário pode querer um quadro livre sem nenhuma travessa interna. O sistema deve aceitar `0` sem erros de divisão ou peças nulas.
- **Entrada negativa (`< 0`)**: Se o usuário digitar um valor negativo acidentalmente, o sistema deve converter automaticamente para `0`.
- **Entrada excessiva (ex.: `> 20`)**: Para vãos comuns de serralheria residencial/comercial, um limite de segurança (ex.: máximo 20 travessas) deve ser aplicado para evitar consumo irracional de barras ou travamento de renderização.
- **Estruturas Personalizadas / Especiais**: No modelo personalizado, o campo de travessas deve permitir adicionar vigas ou divisórias intermediárias dinamicamente.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE estender a interface `ParametrosEstrutura` para incluir a propriedade opcional `numeroTravessas?: number`.
- **FR-002**: O catálogo de modelos padrão (`catalogoModelos.ts`) DEVE fornecer o campo `numeroTravessasPadrao` para cada estrutura cadastrada.
- **FR-003**: O motor paramétrico (`calcularPecasEstrutura`) DEVE gerar a quantidade especificada de travessas intermediárias com o comprimento nominal correspondente à largura (ou caimento) da estrutura.
- **FR-004**: O componente `ItemBuilder.tsx` DEVE renderizar um campo de controle numérico intuitivo com rótulo "Travessas Intermediárias" (com botões de ajuste rápido ou input numérico de 0 a 20).
- **FR-005**: Ao alternar o tipo de estrutura selecionada no `ItemBuilder`, o campo de travessas DEVE ser redefinido para o valor padrão daquele modelo.
- **FR-006**: As peças geradas pelas travessas DEVEM ser nomeadas de forma clara na listagem de peças (ex.: "Travessa de Reforço / Intermediária", quantidade: N, comprimento: L_mm).
- **FR-007**: As travessas DEVEM ser integradas automaticamente ao motor de corte 1D (*First-Fit Decreasing* com serra de 3mm) e ao cálculo de barras de 6 metros.
- **FR-008**: O tempo estimado de mão de obra (horas de bancada/solda) DEVE levar em consideração o acréscimo de pontos de solda e corte gerados por travessas adicionais.

### Key Entities

- **ParametrosEstrutura**:
  - `tipo: TipoEstrutura`
  - `larguraM: number`
  - `alturaM: number`
  - `numeroTravessas?: number` *(novo atributo)*: define a quantidade de travessas intermediárias/reforços solicitados pelo serralheiro.
  - `perfilQuadroId?: string`
  - `perfilPreenchimentoId?: string`
- **ModeloEstrutura (Catálogo)**:
  - `numeroTravessasPadrao: number` *(novo atributo)*: quantidade padrão adotada ao escolher o modelo (ex.: 1 para basculante, 2 para corrimão, 0 para deslizante/grade).
- **PecaLinearDemanda**:
  - Representação de cada peça gerada para a lista de corte contendo id, descrição, perfil, comprimento em mm e quantidade.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue visualizar e alterar a quantidade de travessas no construtor de itens em menos de 2 cliques.
- **SC-002**: O pré-cálculo de peças e a prévia de barras de 6 metros atualizam em tempo real (latência < 50ms) a cada digitação no campo de travessas.
- **SC-003**: 100% de aprovação na suite de testes automatizados (`npm test`) cobrindo cenários com 0, 1, 2 e N travessas em todos os modelos suportados.
- **SC-004**: Nenhuma quebra de compatibilidade com orçamentos legados existentes no IndexedDB (caso `numeroTravessas` esteja ausente, assume o valor padrão do modelo).

---

## Assumptions

- **Perfil Padrão das Travessas**: As travessas estruturais intermediárias utilizam por padrão o mesmo perfil selecionado para o requadro/quadro da estrutura (`perfilQuadroId`), pois servem de travamento mecânico.
- **Orientação das Travessas**: As travessas intermediárias em portões e grades acompanham a dimensão da largura (horizontal), enquanto em corrimãos representam as linhas horizontais de proteção da norma NBR 14718.
- **Interface Não-Bloqueante**: A alteração é totalmente reativa no cliente (React 18), sem dependência de requisições de rede (mantendo o princípio 100% offline-first).
