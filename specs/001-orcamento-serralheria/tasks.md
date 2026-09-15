# Tasks: Sistema de Geração de Orçamentos para Serralheria

**Feature Branch**: `001-orcamento-serralheria`  
**Date**: 2026-09-14  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização do projeto, dependências base e ferramentas de build/teste.

- [x] T001 Criar a estrutura completa de pastas do projeto (`src/core`, `src/data`, `src/storage`, `src/types`, `src/components`, `src/services`, `tests/`)
- [x] T002 Inicializar projeto Vite + React + TypeScript com dependências Tailwind CSS e Lucide Icons (`package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`)
- [x] T003 [P] Configurar ambiente de testes unitários com Vitest em `vite.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de tipos, banco local Offline-First e catálogos padrão que bloqueiam as histórias de usuário.

**⚠️ CRITICAL**: Nenhuma história de usuário pode começar até que esta fundação esteja concluída.

- [x] T004 [P] Definir tipos e interfaces TypeScript em `src/types/orcamento.ts`, `src/types/cliente.ts` e `src/types/material.ts` conforme especificado em `data-model.md`
- [x] T005 [P] Criar catálogo padrão brasileiro pré-carregado de perfis metálicos em barras de 6m em `src/data/catalogoPerfis.ts` (metalons 50x30, 40x20, 30x20, 20x20 nas chapas 18 e 16, cantoneiras e barras chatas)
- [x] T006 [P] Criar catálogo padrão de insumos e consumíveis de serralheria em `src/data/catalogoInsumos.ts` (eletrodos, discos de corte/desbaste e zarcão/primer)
- [x] T007 [P] Criar catálogo de modelos estruturais paramétricos em `src/data/catalogoModelos.ts` (portão basculante, portão deslizante, grades, corrimão e cobertura)
- [x] T008 Implementar camada de persistência local IndexedDB e repositório em `src/storage/db.ts` e `src/storage/storageRepository.ts`
- [x] T009 [P] Implementar serviço de exportação e restauração de backup completo em JSON em `src/storage/backupService.ts` aderente a `contracts/orcamento-schema.json`

**Checkpoint**: Fundação pronta - a implementação das histórias de usuário pode prosseguir.

---

## Phase 3: User Story 1 - Quantificação Paramétrica e Cálculo de Barras de 6m (Priority: P1) 🎯 MVP

**Goal**: Motor de otimização de corte 1D (First-Fit Decreasing com kerf de 3mm) e conversão de peças em barras comerciais de 6,00 metros inteiras com plano de corte visual.

**Independent Test**: Inserir dimensões de um portão de 3,00m x 2,20m e verificar a quantificação exata das barras de 6m com 3mm de perda de corte e exibição do mapa de aproveitamento.

### Tests for User Story 1 🧪
- [x] T010 [P] [US1] Escrever testes unitários para o algoritmo de corte 1D em `tests/unit/cuttingEngine.test.ts` (testando alocação em barras de 6m, perda de kerf de 3mm e consolidação multi-itens)

### Implementation for User Story 1
- [x] T011 [US1] Implementar o motor de corte linear 1D (First-Fit Decreasing, kerf 3mm, consolidação multi-itens) em `src/core/cuttingEngine.ts` aderente ao contrato `contracts/cutting-engine.json`
- [x] T012 [P] [US1] Implementar gerador paramétrico de peças para estruturas (cálculo de vãos, montantes, travessas e réguas) em `src/core/parametricModels.ts`
- [x] T013 [US1] Implementar o componente visual do Plano de Corte de Barras de 6m em `src/components/planoCorte/PlanoCorteVisual.tsx` (barras com cores por peça, marcas de kerf e indicação de retalhos)
- [x] T014 [US1] Implementar o componente construtor de itens e entrada de medidas em `src/components/orcamento/ItemBuilder.tsx` com atualização de cálculo em tempo real

**Checkpoint**: Neste ponto, o cálculo paramétrico e o corte de barras de 6m estão 100% funcionais e testáveis de forma independente (MVP técnico).

---

## Phase 4: User Story 2 - Composição de Custos, Mão de Obra e Ajustes Manuais (Priority: P2)

**Goal**: Composição do custo direto (aço + horas de bancada/instalação + insumos de solda/pintura + acessórios e frete) com flexibilidade para ajustes manuais.

**Independent Test**: Informar 12 horas de oficina, kit de acessórios e frete, editar manualmente o custo de um perfil e validar o recálculo imediato do custo direto.

### Tests for User Story 2 🧪
- [x] T015 [P] [US2] Escrever testes unitários para composição de custos diretos, rateio de insumos e sobreposição manual em `tests/unit/orcamentoCalculator.test.ts`

### Implementation for User Story 2
- [x] T016 [US2] Implementar motor de cálculo de custos diretos, consumo proporcional de solda/primer e flags de ajuste manual em `src/core/orcamentoCalculator.ts`
- [x] T017 [US2] Implementar componente de Mão de Obra e Horas Técnicas em `src/components/orcamento/CustosMaoDeObra.tsx` com taxas configuráveis e alertas visuais de edição manual
- [x] T018 [US2] Implementar componente de Acessórios (fechaduras, motores, roldanas) e Custos Logísticos/Frete em `src/components/orcamento/AcessoriosFrete.tsx`

**Checkpoint**: Histórias 1 e 2 integradas - quantificação de aço e composição de custos diretos operando em conjunto.

---

## Phase 5: User Story 3 - Margem de Lucro (BDI), Desconto e Condições de Pagamento (Priority: P3)

**Goal**: Aplicação de margem de lucro sobre receita (Markup divisor), desconto em % ou R$ e definição de condições comerciais (sinal via PIX e parcelamento).

**Independent Test**: Aplicar 35% de margem sobre receita para custo de R$ 2.400,00, conceder desconto de R$ 100,00 e validar o cálculo do sinal de 50% e do saldo.

### Tests for User Story 3 🧪
- [x] T019 [P] [US3] Escrever testes unitários para cálculo de BDI, margem de lucro, teto de margem e regras de parcelamento em `tests/unit/bdiCalculator.test.ts`

### Implementation for User Story 3
- [x] T020 [US3] Implementar funções de precificação comercial, formação de BDI e cálculo de parcelas em `src/core/orcamentoCalculator.ts`
- [x] T021 [US3] Implementar painel de Precificação Comercial e Condições de Pagamento em `src/components/orcamento/PainelPrecificacao.tsx` com travas de segurança contra venda com prejuízo

**Checkpoint**: Histórias 1, 2 e 3 integradas - ciclo completo de custos e precificação comercial finalizado.

---

## Phase 6: User Story 4 - Cadastro de Clientes, Proposta Comercial A4 e Envio WhatsApp (Priority: P4)

**Goal**: Segregação absoluta entre Visão da Oficina (custos internos) e Visão do Cliente, layout executivo A4 para impressão/PDF nativo e mensagem para WhatsApp.

**Independent Test**: Gerar a proposta comercial do cliente, verificar zero exposição de custos internos/margens, testar impressão A4 via `window.print()` e disparar link de WhatsApp.

### Implementation for User Story 4
- [x] T022 [P] [US4] Implementar modal de cadastro e seleção de clientes em `src/components/cliente/ClientePicker.tsx`
- [x] T023 [P] [US4] Implementar serviço de formatação de mensagens ricas para WhatsApp em `src/services/whatsappService.ts` com gerador de link `https://wa.me/` e cópia em 1 clique
- [x] T024 [US4] Implementar componente de Proposta Comercial do Cliente em `src/components/proposta/PropostaClienteA4.tsx` com folha A4 executiva, dados da oficina, chave PIX e regras `@media print`
- [x] T025 [US4] Implementar componente de Visão Interna da Oficina em `src/components/orcamento/VisaoOficina.tsx` com lista consolidada de compras de barras de 6m e margem líquida
- [x] T026 [US4] Implementar painel de Gestão e Histórico de Orçamentos em `src/components/orcamento/ListaOrcamentos.tsx` com status (Rascunho, Enviado, Aprovado, Concluído) e duplicação

**Checkpoint**: Todas as 4 histórias de usuário estão implementadas, integradas e testáveis de ponta a ponta.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Interface geral, identidade visual industrial e validação final de entrega.

- [x] T027 [P] Implementar modal de Configurações da Serralheria em `src/components/config/ConfigEmpresaModal.tsx` (logo, chave PIX, taxas horárias e dados cadastrais)
- [x] T028 [P] Configurar estilização visual Industrial Dark (Slate/Zinc com Amber) e regras de impressão A4 em `src/index.css`
- [x] T029 Integrar a aplicação principal com barra de navegação, abas e persistência em `src/App.tsx`
- [x] T030 Executar todos os cenários de teste do guia `specs/001-orcamento-serralheria/quickstart.md`
- [x] T031 Validar funcionamento 100% offline no navegador e ciclo de exportação/importação de backup JSON

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução concluída.
- **Foundational (Phase 2)**: Concluída — tipos, IndexedDB e catálogos estabelecidos.
- **User Story 1 (Phase 3)**: Concluída — MVP de corte 1D e barras de 6m operacional.
- **User Story 2 (Phase 4)**: Concluída — custos diretos e horas integrados.
- **User Story 3 (Phase 5)**: Concluída — BDI e precificação comercial validados.
- **User Story 4 (Phase 6)**: Concluída — proposta A4 e WhatsApp validados.
- **Polish (Phase 7)**: Concluída — testes unitários e E2E 100% aprovados.
