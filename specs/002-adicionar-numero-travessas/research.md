# Research & Análise Técnica: Configuração Paramétrica do Número de Travessas

**Feature**: `002-adicionar-numero-travessas`  
**Date**: 2026-09-15  

---

## 1. Contexto Técnico e Prática da Serralheria

Na fabricação de estruturas metálicas e esquadrias de aço (serralheria), as **travessas** desempenham papéis fundamentais:
1. **Reforço Estrutural Mecânico**: Em portões basculantes e deslizantes, as travessas horizontais evitam o empenamento e a torção da folha quando tracionada pelo motor ou contrapeso.
2. **Segurança contra Arrombamento / Flambagem**: Em grades de proteção e gradis tubulares, vãos verticais longos (> 1,20m) sofrem flambagem elástica se não houver travessas intermediárias de amarração.
3. **Adequação às Normas Técnicas (NBR 14718)**: Em corrimãos e guarda-corpos, a quantidade de linhas horizontais ou travessas de proteção intermediárias é estipulada para impedir a passagem de crianças (esferas de 110mm).

### Diagnóstico do Estado Atual no Código

No código atual ([`parametricModels.ts`](file:///C:/Users/jerfs/OneDrive/Área de Trabalho/antigravity-sdd7/src/core/parametricModels.ts)), as travessas estavam fixadas de maneira estática:
- `portao_basculante`: gerava sempre 1 travessa fixa (`id: 'trav-central'`, `quantidade: 1`).
- `portao_deslizante`: gerava 0 travessas intermediárias (apenas viga inferior e superior).
- `grade_tubo`: gerava apenas o quadro externo (2 travessas horizontais de contorno).
- `corrimao`: gerava sempre 2 linhas intermediárias fixas.

**Problema Identificado**: Quando o serralheiro constrói um portão mais alto (ex.: 2,80m ou 3,00m), ele frequentemente necessita de 2 ou 3 travessas horizontais de reforço. Sem um campo para configurar a quantidade, o consumo de barras comerciais de 6 metros ficava subdimensionado no orçamento, gerando prejuízo no custo do aço.

---

## 2. Decisões Arquiteturais e de Design

### Decisão 1: Extensão Não-Destrutiva dos Tipos (`orcamento.ts` e `catalogoModelos.ts`)
- Campo `numeroTravessas?: number` opcional em `ParametrosEstrutura`.
- Propriedade `numeroTravessasPadrao: number` em `ModeloEstrutura` dentro de `catalogoModelos.ts`.
- **Compatibilidade**: Se um orçamento legado ou chamada de teste não passar `numeroTravessas`, o valor padrão do modelo é utilizado transparentemente.

### Decisão 2: Comportamento por Modelo no Motor Paramétrico (`parametricModels.ts`)
| Modelo | Travessas Padrão | Descrição Gerada na Lista de Corte | Comprimento das Peças |
| :--- | :---: | :--- | :--- |
| **Portão Basculante** | 1 | "Travessa Intermediária / Reforço" | $L_{mm}$ (Largura da folha) |
| **Portão Deslizante** | 0 | "Travessa Intermediária de Reforço" | $L_{mm}$ (Largura da folha) |
| **Grade Tubular** | 0 | "Travessa Horizontal Intermediária" | $L_{mm}$ (Largura do vão) |
| **Corrimão** | 2 | "Linha Intermediária de Proteção" | $L_{mm}$ (Extensão do corrimão) |
| **Personalizado** | 0 | "Travessa / Divisória Horizontal" | $L_{mm}$ |

### Decisão 3: Experiência do Usuário (UI) no `ItemBuilder.tsx`
- Inclusão de um controle numérico com botões de incremento/decremento (`-` e `+`) e campo de texto direto no grid de especificações técnicas.
- Sincronização reativa instantânea: ao alterar a quantidade, o `preResultado` (e consequentemente o cálculo de barras de 6m) é reavaliado imediatamente.
- Reset inteligente: ao clicar em um tipo de estrutura diferente no catálogo, o campo de travessas assume automaticamente o padrão de fábrica daquele modelo.

---

## 3. Impacto no Motor de Corte 1D e Orçamento

1. **Agrupamento Automático**: As novas travessas possuem o mesmo `perfilId` do requadro (geralmente metalon 50x30, 40x20, etc.), sendo consolidadas no mesmo lote de corte.
2. **Perda de Serra (*Kerf*)**: Cada travessa adicionada contabiliza 3mm de perda de corte na serra fita/policorte em barras de 6m.
3. **Mão de Obra**: Cada travessa intermediária exige 2 juntas de corte e 2 nós de solda (4 cordões), o que é refletido proporcionalmente no tempo de bancada.
