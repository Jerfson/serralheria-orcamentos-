# Tasks: Cadastro e Gestão de Materiais e Perfis (Metalon, Cantoneira, etc.)

**Feature Branch**: `003-cadastro-materiais-perfis`  
**Date**: 2026-09-16  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Phase 1: Setup & Foundation (Repositório e Suporte a Deleção)

**Purpose**: Garantir que o repositório de dados local ofereça todas as operações de CRUD para materiais e perfis de aço.

- [x] T001 [P] Adicionar método `deleteMaterial(id: string): Promise<void>` em `src/storage/storageRepository.ts`

**Checkpoint**: Camada de persistência pronta para todas as operações de manipulação de materiais.

---

## Phase 2: User Story 1 & 2 - Testes Unitários de Materiais (Priority: P1 / P2) 🎯 MVP

**Goal**: Garantir integridade da lógica de listagem, alteração de preços e cadastro de novos perfis com testes automatizados.

**Independent Test**: Executar `npm test` e verificar que a criação e alteração de preço de um Metalon 60x40 são persistidas e recuperadas com precisão.

### Tests for User Story 1 & 2 🧪
- [x] T002 [P] [US1] Criar testes unitários em `tests/unit/materiaisRepository.test.ts` cobrindo adição de novo metalon, edição de preço da barra de 6m e alternância de status ativo/inativo

**Checkpoint**: Suite de testes pronta validando as operações no repositório.

---

## Phase 3: User Story 1, 2 & 3 - Componente de Interface do Gerenciador de Materiais

**Goal**: Desenvolver o modal completo de gestão de perfis com tabela industrial, busca, filtros de categoria, edição rápida de preços e cadastro de novos perfis.

**Independent Test**: Abrir o modal, pesquisar "50x30", editar o preço da barra de 6m, adicionar um novo perfil "Metalon 60x40" e confirmar a visualização imediata.

### Implementation for User Story 1, 2 & 3
- [x] T003 [US1] Criar o componente `src/components/materiais/GerenciadorMateriaisModal.tsx` com visualização tabular, busca em tempo real, filtros por tipo (metalon, cantoneira, barra chata, tubo redondo) e edição rápida de preços das barras de 6m
- [x] T004 [US2] Implementar formulário de inclusão de Novo Perfil dentro de `GerenciadorMateriaisModal.tsx` com validação de dimensões em mm, cálculo estimado de peso e persistência no IndexedDB
- [x] T005 [US3] Implementar funcionalidade de alternância de status ativo/inativo e botão de restauração do catálogo padrão de fábrica

**Checkpoint**: Modal de gerenciamento visual de materiais e preços completo e testável.

---

## Phase 4: Integração na Aplicação (App e ItemBuilder)

**Goal**: Conectar o modal de materiais ao fluxo do usuário com botões de acesso no cabeçalho e dentro do construtor de orçamentos.

- [x] T006 Integrar o `GerenciadorMateriaisModal` em `src/App.tsx` com botão de acesso no cabeçalho ("Perfis & Aço") e sincronização de recarga de materiais
- [x] T007 Adicionar botão de atalho rápido no `src/components/orcamento/ItemBuilder.tsx` para abrir o gerenciador de materiais diretamente da área de seleção de perfis

**Checkpoint**: Gestão de materiais acessível de qualquer ponto do sistema com atualização reativa nos orçamentos.

---

## Phase 5: Validação de Qualidade e Build

**Purpose**: Garantir integridade de todo o sistema sem regressões.

- [x] T008 Executar suíte completa de testes com `npm test`
- [x] T009 Executar `npm run build` para certificar integridade dos tipos TypeScript e bundle Vite
