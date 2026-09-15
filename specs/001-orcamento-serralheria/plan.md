# Implementation Plan: Sistema de Geração de Orçamentos para Serralheria

**Branch**: `001-orcamento-serralheria` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md) | **Data Model**: [data-model.md](./data-model.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Summary

Desenvolvimento de uma aplicação web client-side **Offline-First** especializada na orçamentação técnica e comercial de serralherias e estruturas metálicas. O sistema automatiza a quantificação de perfis em **barras comerciais inteiras de 6,00 metros** utilizando um motor de otimização de corte 1D (First-Fit Decreasing com kerf de 3mm), calcula insumos de solda/pintura, mão de obra produtiva e logística, aplica formação de preço de venda (Markup/BDI) e gera propostas comerciais executivas prontas para impressão A4/PDF e envio direto via WhatsApp, com segregação rígida entre a Visão da Oficina (custos internos) e a Visão do Cliente.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ / Modern JavaScript (ES2022+)  
**Frontend Framework & Tooling**: React 18+, Vite 5+ (SPA client-side com suporte a PWA)  
**Styling & Design System**: Tailwind CSS v3 com tema Industrial Slate & Amber (`#0f172a`, `#1e293b`, `#f59e0b`), com estilização `@media print` para folhas A4  
**UI Components & Icons**: `lucide-react` para iconografia industrial  
**Storage & Persistence**: IndexedDB encapsulado com fallback para LocalStorage (Offline-First local) com exportação/importação de backups em JSON  
**Calculation Engine**: Motor puro em TypeScript (`cuttingEngine.ts`, `orcamentoCalculator.ts`) desacoplado de UI  
**Export & Output**: Motor nativo do navegador via `window.print()` estilizado para PDF de alta fidelidade vetorial + link profundo e cópia para WhatsApp (`https://wa.me/...`)  
**Testing**: `vitest` para testes unitários do motor de corte 1D, fórmulas de BDI e rateios  
**Target Platform**: Navegadores modernos (Desktop e Mobile / Smartphone em campo na obra)  
**Project Type**: Web Application (Client-side SPA / PWA)  
**Performance Goals**: Tempo de cálculo e renderização do plano de corte $< 10\text{ms}$ para até 200 peças; carregamento offline $< 1\text{s}$  
**Constraints**: 100% autônomo offline (zero dependência de servidor ou banco remoto); sem vazamento de custos internos na proposta do cliente  
**Scale/Scope**: Gestão completa de clientes, catálogo pré-carregado de materiais brasileiros, modelos paramétricos de estruturas e geração ilimitada de orçamentos  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio da Governança | Status | Justificativa |
| :--- | :---: | :--- |
| **I. Library-First / Modularidade** | ✅ PASS | Motores de cálculo (`cuttingEngine`, `orcamentoCalculator`, `storageRepository`) são bibliotecas desacopladas e 100% testáveis sem UI. |
| **II. Test-First (TDD)** | ✅ PASS | Casos de teste automatizados definidos para o corte 1D e fórmulas de BDI antes da codificação visual. |
| **III. Simplicidade & Autonomia (YAGNI)** | ✅ PASS | Arquitetura client-side direta, sem sobrecarga de infraestrutura ou servidores desnecessários. |
| **IV. Resiliência Operacional (Offline-First)** | ✅ PASS | Persistência local no IndexedDB com backup JSON garantindo que o serralheiro nunca perca dados na obra. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-orcamento-serralheria/
├── spec.md                  # Especificação funcional e requisitos
├── plan.md                  # Este plano de implementação técnica
├── research.md              # Pesquisa técnica (Algoritmo 1D, Offline-First, PDF)
├── data-model.md            # Modelo de dados e interfaces TypeScript
├── quickstart.md            # Roteiro de validação ponta a ponta
├── contracts/
│   ├── cutting-engine.json  # Contrato JSON Schema do motor de corte 1D
│   └── orcamento-schema.json# Contrato JSON Schema de backup e orçamentos
└── checklists/
    └── requirements.md      # Checklist de qualidade de requisitos
```

### Source Code (repository root)

```text
src/
├── core/                    # Motores matemáticos puros (testáveis sem UI)
│   ├── cuttingEngine.ts     # Algoritmo First-Fit Decreasing 1D com kerf 3mm
│   ├── orcamentoCalculator.ts # Formação de BDI, insumos, mão de obra e totais
│   └── parametricModels.ts  # Fórmulas de portões, grades, corrimãos e coberturas
├── data/                    # Dados iniciais e catálogo padrão brasileiro
│   ├── catalogoPerfis.ts    # Metalons (50x30, 40x20...), cantoneiras, barras chatas
│   ├── catalogoInsumos.ts   # Eletrodos, discos, zarcão e consumíveis
│   └── catalogoModelos.ts   # Modelos pré-configurados de estruturas
├── storage/                 # Camada de persistência local
│   ├── db.ts                # Inicialização e schemas do IndexedDB
│   ├── storageRepository.ts # CRUD de orçamentos, clientes e materiais
│   └── backupService.ts     # Exportação e importação de arquivo JSON
├── types/                   # Definições de tipos TypeScript
│   ├── orcamento.ts         # Entidades de orçamento, itens e propostas
│   ├── cliente.ts           # Entidade de cliente e endereço
│   └── material.ts          # Perfis de 6m, insumos e acessórios
├── components/              # Componentes de interface do usuário
│   ├── common/              # Botões, inputs numéricos, modais, badges
│   ├── layout/              # Header com dados da oficina, abas de navegação
│   ├── orcamento/           # Formulário de medidas, itens e tabela de barras
│   ├── planoCorte/          # Mapa visual de corte das barras de 6m da oficina
│   ├── proposta/            # Layout executivo A4 para impressão e visualização
│   └── config/              # Configurações da oficina, taxas e catálogo
├── services/
│   └── whatsappService.ts   # Formatação de texto e links para WhatsApp
├── App.tsx                  # Componente raiz com roteamento de abas
├── main.tsx                 # Ponto de entrada da aplicação React
└── index.css                # Estilização Tailwind e regras @media print
tests/
├── unit/
│   ├── cuttingEngine.test.ts # Testes do otimizador 1D com kerf de 3mm
│   └── orcamentoCalculator.test.ts # Testes de BDI, descontos e rateios
└── e2e/
    └── fluxos.test.ts       # Validação de fluxos de criação e proposta
```

---

## Phases & Execution Milestones

### Phase 1: Core Engine & Data Models (Fundação Matemática)
- Implementar `types/` completos baseados em [`data-model.md`](./data-model.md).
- Implementar o motor de corte 1D `cuttingEngine.ts` com suporte a perda de corte de 3mm e consolidação multi-itens.
- Implementar a calculadora financeira `orcamentoCalculator.ts` (Markup divisor/multiplicador, horas de mão de obra e frete).
- Escrever testes unitários em `vitest` cobrindo 100% das regras de cálculo de barras e formação de preços.

### Phase 2: Camada de Persistência Offline & Catálogo Padrão
- Configurar base IndexedDB com repositório reativo.
- Pré-carregar o catálogo brasileiro padrão com metalons, cantoneiras, insumos e modelos de estruturas.
- Implementar rotinas de exportação e restauração de backup em JSON.

### Phase 3: Interface do Usuário (Modo Oficina / Edição)
- Painel de cadastro/seleção de clientes.
- Construtor paramétrico de produtos com seleção de medidas (largura e altura) e cálculo em tempo real.
- Visualizador do Plano de Corte 1D com barras de 6m e detalhamento de sobras/retalhos.
- Painel de composição de custos, mão de obra e controles de margem de lucro e desconto.

### Phase 4: Proposta Comercial, Impressão A4 & WhatsApp
- Desenvolver a **Visão do Cliente** com layout A4 executivo e estilização para `@media print` nativo.
- Ocultar 100% dos custos internos de fábrica na visualização comercial.
- Implementar gerador de mensagem estruturada e botão de disparo direto para o WhatsApp.
- Testar geração de PDF e impressão física.
