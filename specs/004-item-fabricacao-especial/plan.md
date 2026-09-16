# Implementation Plan: Inclusão e Orçamento de Fabricação Especial (Churrasqueiras, Bancadas, etc.)

**Branch**: `004-item-fabricacao-especial` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md) | **Data Model**: [data-model.md](./data-model.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Summary

Implementação do módulo de **Fabricação Especial e Peças Sob Medida** dentro do fluxo de orçamentos da aplicação. Permite ao serralheiro orçar produtos que não se limitam a perfis lineares de 6m (como churrasqueiras a carvão/bafo, parrillas, bancadas industriais, coifas, mesas e carrinhos), lançando dimensões 3D (Largura, Altura e Profundidade), custo direto de materiais/chapas, horas de mão de obra de solda/bancada e acabamentos especiais, com aplicação de BDI e formatação para propostas de clientes e WhatsApp.

---

## Technical Context

**Language/Version**: TypeScript 5.4+  
**Frontend Framework**: React 18, Vite 5  
**Styling**: Tailwind CSS v3  
**Target Files**:
- `src/types/orcamento.ts`: Adicionar `'fabricacao_especial'` ao tipo `TipoEstrutura`.
- `src/core/orcamentoCalculator.ts`: Considerar custos manuais de materiais em `calcularCustosDiretos`.
- `src/components/orcamento/ItemBuilder.tsx`: Adicionar seletor de modo (Esquadrias vs. Fabricação Especial), formulário dedicado com presets de churrasqueira, bancada, etc., e cálculo prévio em tempo real.
- `src/components/orcamento/CustosMaoDeObra.tsx`: Exibir badge e dados de itens especiais.
- `src/components/proposta/PropostaClienteA4.tsx` & `src/services/whatsappService.ts`: Formatar dimensões 3D (L x H x P) e especificações dos itens especiais.
- `tests/unit/fabricacaoEspecial.test.ts`: Testes unitários do cálculo financeiro e integração.

---

## Constitution Check

| Princípio da Governança | Status | Justificativa |
| :--- | :---: | :--- |
| **I. Library-First / Modularidade** | ✅ PASS | O motor de custos continua puro e desacoplado de UI. |
| **II. Test-First (TDD)** | ✅ PASS | Testes unitários validam a composição de custos da churrasqueira antes da interface. |
| **III. Simplicidade & Autonomia** | ✅ PASS | Reutiliza a entidade `ItemOrcamento` existente sem exigir schemas paralelos. |
| **IV. Resiliência Operacional (Offline-First)** | ✅ PASS | Funcionamento 100% no cliente sem chamadas de rede. |

---

## Implementation Phases

### Phase 1: Tipos e Motor de Custos
- Adicionar `'fabricacao_especial'` em `TipoEstrutura`.
- Ajustar `calcularCustosDiretos` em `orcamentoCalculator.ts` para somar `item.ajustesManuais.custoMaterialManual`.
- Criar testes unitários em `tests/unit/fabricacaoEspecial.test.ts`.

### Phase 2: Interface no Construtor de Itens (`ItemBuilder.tsx`)
- Adicionar abas de alternância de modo: `[Estruturas Paramétricas (Corte 1D)]` e `[Fabricação Especial (Churrasqueiras, etc.)]`.
- Criar presets de 1 clique (Churrasqueira Parrilla, Churrasqueira Bafo, Mesa Industrial, Lixeira).
- Campos de dimensões 3D (Largura, Altura, Profundidade), custo direto de materiais, horas de bancada/instalação e acabamento.
- Pré-cálculo de preço de venda em tempo real.

### Phase 3: Proposta do Cliente e WhatsApp
- Formatação de dimensões com profundidade (`L x H x P`) na lista de itens do `App.tsx`, na `PropostaClienteA4.tsx` e no `whatsappService.ts`.

### Phase 4: Validação
- Executar `npm test` e `npm run build`.
