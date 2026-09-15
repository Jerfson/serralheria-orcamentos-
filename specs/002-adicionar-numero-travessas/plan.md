# Implementation Plan: Configuração Paramétrica do Número de Travessas

**Branch**: `002-adicionar-numero-travessas` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md) | **Data Model**: [data-model.md](./data-model.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Summary

Implementação da funcionalidade de ajuste dinâmico da quantidade de travessas intermediárias e reforços estruturais nos modelos paramétricos da aplicação (portões basculantes e deslizantes, grades tubulares, corrimãos e estruturas personalizadas). A funcionalidade permite ao serralheiro orçamentista indicar exatamente quantas travessas horizontais a peça terá, refletindo imediatamente no pré-cálculo de peças lineares, no consumo de barras comerciais de 6 metros, na perda de corte da serra (*kerf* de 3mm) e na formação do preço final.

---

## Technical Context

**Language/Version**: TypeScript 5.4+  
**Frontend Framework**: React 18, Vite 5  
**Styling**: Tailwind CSS v3 (Tema Dark Slate & Amber)  
**Target Files**:
- `src/data/catalogoModelos.ts`: Adicionar `numeroTravessasPadrao` a cada modelo.
- `src/core/parametricModels.ts`: Suportar `numeroTravessas` em `ParametrosEstrutura` e aplicar a lógica por tipo de estrutura.
- `src/components/orcamento/ItemBuilder.tsx`: Adicionar campo de entrada e controle de incremento/decremento reativo de travessas com reset dinâmico na troca de modelo.
- `tests/unit/parametricModels.test.ts`: Testes unitários para validar a geração das peças de travessas com 0, 1, 2 e N unidades.

---

## Constitution Check

| Princípio da Governança | Status | Justificativa |
| :--- | :---: | :--- |
| **I. Library-First / Modularidade** | ✅ PASS | O cálculo de peças em `parametricModels.ts` é uma função pura e desacoplada da interface gráfica. |
| **II. Test-First (TDD)** | ✅ PASS | Suite de testes em Vitest valida a contagem e medidas exatas das travessas antes da integração visual. |
| **III. Simplicidade & Autonomia** | ✅ PASS | Implementação direta, mantendo compatibilidade retroativa para itens antigos sem exigir migrações pesadas. |
| **IV. Resiliência Operacional (Offline-First)** | ✅ PASS | Sem novas dependências externas; cálculo 100% no cliente. |

---

## Implementation Phases

### Phase 1: Camada de Dados e Modelagem Técnica
- Atualizar interface `ModeloEstrutura` e definir `numeroTravessasPadrao` no catálogo (`catalogoModelos.ts`).
- Estender `ParametrosEstrutura` com `numeroTravessas?: number` em `parametricModels.ts`.

### Phase 2: Motor de Cálculo Paramétrico
- Ajustar `calcularPecasEstrutura` em `parametricModels.ts`:
  - Portão Basculante: gerar $N$ travessas com comprimento $L_{mm}$.
  - Portão Deslizante: gerar $N$ travessas intermediárias quando $N > 0$.
  - Grade Tubular: gerar $N$ travessas horizontais intermediárias quando $N > 0$.
  - Corrimão: gerar $N$ linhas de proteção (padrão 2).
  - Personalizado: gerar $N$ travessas extras.
  - Ajuste suave na estimativa de horas de bancada para cada travessa adicional.

### Phase 3: Interface do Usuário (ItemBuilder)
- Adicionar o estado `numeroTravessas` no componente `ItemBuilder.tsx`.
- Renderizar campo de controle numérico estilizado com botões intuitivos `[-]` e `[+]` e input direto.
- Conectar o estado à função `calcularPecasEstrutura` para visualização em tempo real das peças e barras de 6m.
- Atualizar o reset de campos ao trocar o tipo de estrutura selecionado.

### Phase 4: Testes e Validação
- Escrever testes em `tests/unit/parametricModels.test.ts` para verificar todos os tipos de estruturas com diferentes quantidades de travessas.
- Executar `npm test` e `npm run build` para certificar ausência de erros de tipos TypeScript ou quebras de regressão.
