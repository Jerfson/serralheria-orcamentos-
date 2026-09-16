# Implementation Plan: Cadastro e Gestão de Materiais e Perfis (Metalon, Cantoneira, etc.)

**Branch**: `003-cadastro-materiais-perfis` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md) | **Data Model**: [data-model.md](./data-model.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Summary

Implementação da interface e serviços de gestão completa do catálogo de materiais da oficina de serralheria (metalons retangulares/quadrados, cantoneiras, barras chatas, tubos redondos, perfis U e ferros T). A funcionalidade permite ao serralheiro:
1. Visualizar e filtrar todos os materiais cadastrados por categoria ou por busca de texto rápida.
2. Atualizar os preços de compra das barras comerciais de 6,00 metros com reflexo imediato nos orçamentos.
3. Cadastrar novos perfis e bitolas personalizadas no banco local Offline-First.
4. Ativar/desativar perfis para manter os selects de orçamento limpos e objetivos.
5. Restaurar os valores padrão do catálogo brasileiro quando necessário.

---

## Technical Context

**Language/Version**: TypeScript 5.4+  
**Frontend Framework**: React 18, Vite 5  
**Styling**: Tailwind CSS v3 (Tema Dark Industrial Slate/Amber)  
**Target Files**:
- `src/storage/storageRepository.ts`: Adicionar método `deleteMaterial(id: string)` e aprimorar `saveMaterial`.
- `src/components/materiais/GerenciadorMateriaisModal.tsx`: Novo componente com listagem, busca, filtros de categoria, edição rápida de preços e formulário de cadastro de novo perfil.
- `src/components/orcamento/ItemBuilder.tsx`: Adicionar atalho direto para abrir o gerenciador de materiais ao lado dos seletores de perfis.
- `src/App.tsx`: Adicionar botão de acesso rápido a "Perfis & Aço" no cabeçalho e sincronizar o estado `materiais` após alterações.
- `tests/unit/materiaisRepository.test.ts`: Testes unitários para persistência, criação e edição de perfis.

---

## Constitution Check

| Princípio da Governança | Status | Justificativa |
| :--- | :---: | :--- |
| **I. Library-First / Modularidade** | ✅ PASS | Camada de dados desacoplada em `storageRepository.ts` com store indexada independente. |
| **II. Test-First (TDD)** | ✅ PASS | Testes unitários garantem que inserção e edição de materiais mantêm integridade antes da UI. |
| **III. Simplicidade & Autonomia** | ✅ PASS | Utiliza a store de materiais já existente sem exigir quebra de compatibilidade. |
| **IV. Resiliência Operacional (Offline-First)** | ✅ PASS | Operação 100% no IndexedDB com suporte a backup JSON exportável. |

---

## Implementation Phases

### Phase 1: Repositório e Testes
- Adicionar `deleteMaterial(id: string)` em `src/storage/storageRepository.ts`.
- Criar testes unitários em `tests/unit/materiaisRepository.test.ts` cobrindo adição, alteração de preço e filtros.

### Phase 2: Componente `GerenciadorMateriaisModal.tsx`
- Desenvolver o modal com tabela industrial de perfis:
  - Cabeçalho com busca por texto e contadores por categoria.
  - Abas de filtros rápidos (Metalon Retangular, Quadrado, Redondo, Cantoneira, Barra Chata, Todos).
  - Tabela com colunas: Código, Descrição, Dimensões, Peso por barra 6m, Preço da Barra (R$), Status (Ativo/Inativo) e Ações.
  - Edição direta de preço na linha ou via modal de edição.
  - Formulário para inclusão de Novo Perfil com validação de dimensões e tipo.
  - Botão para restaurar catálogo padrão com aviso de confirmação.

### Phase 3: Integração no App e no ItemBuilder
- Adicionar botão no cabeçalho de `App.tsx` para abrir o gerenciador de materiais.
- Adicionar atalho sutil no `ItemBuilder.tsx` para gerenciar materiais sem sair do orçamento.
- Garantir que ao fechar ou salvar no modal, a lista `materiais` no estado global seja atualizada e repassada a todos os componentes.

### Phase 4: Validação de Qualidade
- Executar `npm test` e `npm run build` para garantir ausência de erros e conformidade completa.
