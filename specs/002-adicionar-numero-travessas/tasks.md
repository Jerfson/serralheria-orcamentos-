# Tasks: Configuração Paramétrica do Número de Travessas

**Feature Branch**: `002-adicionar-numero-travessas`  
**Date**: 2026-09-15  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Phase 1: Setup & Foundation (Modelagem e Tipos)

**Purpose**: Estender as interfaces TypeScript e o catálogo de dados para suportar a parametrização de travessas.

- [x] T001 [P] Atualizar interface `ModeloEstrutura` em `src/data/catalogoModelos.ts` com o campo `numeroTravessasPadrao: number` e definir os padrões recomendados de fábrica para cada modelo (Basculante: 1, Deslizante: 0, Grade: 0, Corrimão: 2, Cobertura: 0, Personalizado: 0)
- [x] T002 [P] Atualizar interface `ParametrosEstrutura` em `src/core/parametricModels.ts` para incluir a propriedade opcional `numeroTravessas?: number`

**Checkpoint**: Modelos de dados e tipos prontos para a implementação lógica e de testes.

---

## Phase 2: User Story 1 - Motor de Cálculo Paramétrico de Travessas (Priority: P1) 🎯 MVP

**Goal**: Permitir que o motor matemático puro gere dinamicamente a quantidade solicitada de travessas para qualquer estrutura.

**Independent Test**: Executar os testes em `tests/unit/parametricTravessas.test.ts` e verificar que para um portão basculante com 3 travessas são geradas exatamente 3 peças de travessa horizontal com $L_{mm}$.

### Tests for User Story 1 🧪
- [x] T003 [P] [US1] Criar testes unitários em `tests/unit/parametricTravessas.test.ts` testando a quantificação de travessas com valores 0, 1, 2, 3 e fallback em portão basculante, portão deslizante, grade tubular e corrimão

### Implementation for User Story 1
- [x] T004 [US1] Implementar a lógica de travessas dinâmicas na função `calcularPecasEstrutura` em `src/core/parametricModels.ts`, substituindo as peças fixas pelas peças geradas de acordo com `numeroTravessas`

**Checkpoint**: Motor paramétrico testado e validado de forma autônoma sem interface gráfica.

---

## Phase 3: User Story 2 & 3 - Controle Visual no ItemBuilder e Persistência (Priority: P2 / P3)

**Goal**: Permitir ao serralheiro ajustar o número de travessas visualmente no formulário, com reset automático ao trocar de modelo e integração em tempo real no corte de barras de 6m.

**Independent Test**: No navegador, alternar entre modelos e alterar o contador de travessas, observando o recálculo imediato da prévia de barras de 6m e a persistência do item salvo.

### Implementation for User Story 2 & 3
- [x] T005 [US2] Adicionar estado `numeroTravessas` e lógica de reset por modelo na função `handleTrocaModelo` em `src/components/orcamento/ItemBuilder.tsx`
- [x] T006 [US2] Implementar campo de controle numérico de travessas no formulário em `src/components/orcamento/ItemBuilder.tsx` com botões de incremento/decremento `[-]` e `[+]` e suporte a digitação direta (0 a 20)
- [x] T007 [US3] Conectar o estado `numeroTravessas` aos parâmetros de `calcularPecasEstrutura` no `ItemBuilder.tsx` para alimentar em tempo real a prévia de corte e persistir as peças no `novoItem`

**Checkpoint**: Interface gráfica integrada e reativa.

---

## Phase 4: Validação de Qualidade e Build

**Purpose**: Garantir integridade de todo o sistema sem regressões.

- [x] T008 Executar suíte completa de testes com `npm test` e verificar aprovação de 100% dos testes
- [x] T009 Executar `npm run build` para garantir tipagem TypeScript rigorosa e ausência de falhas no bundle Vite
