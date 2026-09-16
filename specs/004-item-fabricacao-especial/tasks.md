# Tasks: Inclusão e Orçamento de Fabricação Especial (Churrasqueiras, Bancadas, etc.)

**Feature Branch**: `004-item-fabricacao-especial`  
**Date**: 2026-09-16  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Phase 1: Setup & Foundation (Modelagem e Motor de Cálculo)

**Purpose**: Estender o modelo de dados e o motor financeiro para suportar itens com custos diretos de materiais e sem exigência de barras lineares.

- [x] T001 [P] Adicionar `'fabricacao_especial'` ao tipo `TipoEstrutura` em `src/types/orcamento.ts`
- [x] T002 [P] Atualizar a função `calcularCustosDiretos` em `src/core/orcamentoCalculator.ts` para somar `item.ajustesManuais.custoMaterialManual` aos custos diretos de materiais

**Checkpoint**: Camada matemática pronta para processar churrasqueiras e itens especiais.

---

## Phase 2: User Story 1 - Testes Unitários de Fabricação Especial (Priority: P1) 🎯 MVP

**Goal**: Validar com testes automatizados o cálculo de custo direto, margem BDI e preço final de uma churrasqueira sob medida.

**Independent Test**: Executar `npm test` e verificar que um item de churrasqueira (R$ 380 de material + 6h de bancada) calcula os custos e margens corretamente sem erros de barras de corte.

### Tests for User Story 1 🧪
- [x] T003 [P] [US1] Criar testes unitários em `tests/unit/fabricacaoEspecial.test.ts` cobrindo orçamento de churrasqueira com custo de materiais, horas de oficina, BDI e compatibilidade com plano de corte

**Checkpoint**: Suite de testes validando os cálculos de fabricação especial.

---

## Phase 3: User Story 1 & 2 - Interface do Usuário no ItemBuilder

**Goal**: Disponibilizar no construtor de itens a alternância intuitiva para o modo de fabricação especial com presets rápidos e pré-cálculo em tempo real.

**Independent Test**: Abrir o ItemBuilder, clicar na aba "Fabricação Especial", selecionar "Churrasqueira Parrilla", ajustar valores e clicar em adicionar ao orçamento.

### Implementation for User Story 1 & 2
- [x] T004 [US1] Implementar seletor de abas/modos no topo de `src/components/orcamento/ItemBuilder.tsx` ("Estruturas Paramétricas (Corte 1D)" vs "Fabricação Especial / Sob Medida")
- [x] T005 [US1] Implementar formulário de Fabricação Especial em `src/components/orcamento/ItemBuilder.tsx` com presets rápidos (Churrasqueira Parrilla, Churrasqueira Bafo, Bancada Industrial, Lixeira), campos para dimensões 3D (L x H x P), custo direto de materiais, horas de bancada, acabamento e cálculo prévio em tempo real

**Checkpoint**: Construtor de itens com suporte completo a produtos sob medida e esquadrias.

---

## Phase 4: User Story 3 - Exibição em Proposta, WhatsApp e Visão da Oficina

**Goal**: Exibir com fidelidade as dimensões 3D e acabamento da churrasqueira/peça na proposta do cliente e na mensagem do WhatsApp.

- [x] T006 [US3] Atualizar a exibição de dimensões 3D na lista de itens do `src/App.tsx`, na `src/components/proposta/PropostaClienteA4.tsx` e no `src/services/whatsappService.ts`

**Checkpoint**: Comunicação executiva para o cliente finalizada.

---

## Phase 5: Validação de Qualidade e Build

**Purpose**: Garantir integridade de todo o sistema sem regressões.

- [x] T007 Executar suíte completa de testes com `npm test`
- [x] T008 Executar `npm run build` para certificar integridade dos tipos TypeScript e bundle Vite
