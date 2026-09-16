# Research & Análise Técnica: Fabricação Especial e Peças Sob Medida (Churrasqueiras, Bancadas, Mesas, etc.)

**Feature**: `004-item-fabricacao-especial`  
**Date**: 2026-09-16  

---

## 1. Contexto de Negócio e Prática da Oficina de Serralheria

Além de esquadrias padrão (portões, grades, corrimãos), grande parte da receita de serralherias vem de **produtos especiais sob medida**:
1. **Churrasqueiras e Parrillas**: Fabricadas com chapas de aço carbono (chapa 14 ou 16), cantoneiras de suporte, grelhas em inox/moeda, gaveta de cinzas e acabamento em pintura eletrostática ou para alta temperatura (600°C).
2. **Mesas e Bancadas Industriais**: Estrutura em metalon reforçado (50x30, 50x50), com pés niveladores e suporte para tampos de madeira ou granito.
3. **Coifas e Dutos**: Estruturas de chapa galvanizada ou inox dobrada com flanges e solda TIG/MIG.
4. **Carrinhos Industriais e Lixeiras**: Peças funcionais com rodízios, telas e travas.

### Desafio Atual

O fluxo existente em `ItemBuilder.tsx` é estritamente **paramétrico-linear**: calcula requadros de barras de 6m a partir de largura e altura.
Para uma churrasqueira, o serralheiro compra chapas inteiras, grelhas prontas, roldanas e consome insumos e horas de solda. Ele precisa de um formulário onde possa:
- Lançar o custo direto do material/chapas em R$.
- Lançar as horas de solda e fabricação.
- Indicar as 3 dimensões (Largura x Altura x Profundidade).
- Especificar acabamento apropriado (ex: "Pintura alta temperatura 600°C preto fosco").
- E permitir que o BDI/margem de lucro calcule o preço final de venda automaticamente!

---

## 2. Decisões Técnicas e Arquitetura

### Decisão 1: Tipo de Estrutura `'fabricacao_especial'`
- Adicionamos `'fabricacao_especial'` no enum/union `TipoEstrutura` em `src/types/orcamento.ts`.
- Itens desse tipo possuem `pecasDemandadas: []` (sem exigir barras de corte 1D lineares, a menos que adicionadas), preservando a integridade do motor de corte 1D.

### Decisão 2: Composição de Custos em `orcamentoCalculator.ts`
- Atualizamos `calcularCustosDiretos`:
  - Se um item tiver `ajustesManuais?.custoMaterialManual`, esse valor é somado aos custos diretos de materiais.
  - As horas de fabricação do item continuam calculando a mão de obra conforme a taxa horária da oficina.
  - A área calculada ($L \times H \times P$ ou $L \times H$) inclui uma estimativa de insumos de solda/disco, garantindo que nenhum custo fique descoberto.
  - O BDI da empresa aplica a margem de lucro igualmente sobre o total.

### Decisão 3: Interface no `ItemBuilder.tsx`
- Adicionamos um seletor no topo do construtor:
  - `[🪟 Esquadrias & Portões (Corte 1D)]`
  - `[🔥 Fabricação Especial / Sob Medida (Churrasqueiras, etc.)]`
- Quando em modo "Fabricação Especial":
  - Oferecemos modelos sugeridos de 1 clique: *"Churrasqueira Parrilla em Aço"*, *"Bancada Industrial em Metalon"*, *"Lixeira de Calçada com Tampa"*, *"Carrinho de Carga Reforçado"*.
  - Campos de entrada:
    - Descrição da Peça
    - Dimensões: Largura (m), Altura (m) e Profundidade (m)
    - Custo Direto Estimado de Materiais & Chapas (R$)
    - Horas de Oficina / Bancada
    - Horas de Instalação / Entrega
    - Tipo de Acabamento (ex: Pintura Alta Temperatura, Zarcão, Galvanização)
    - Quantidade de unidades
  - Cálculo prévio instantâneo exibindo: Custo Direto + Estimativa de Preço de Venda com a margem atual.

### Decisão 4: Transparência nas Propostas e WhatsApp
- Na proposta do cliente (`PropostaClienteA4.tsx`) e mensagem de WhatsApp (`whatsappService.ts`), o item especial aparece com suas 3 dimensões (ex.: *0,80m (L) x 0,90m (A) x 0,50m (P)*) e seu acabamento exclusivo, sem expor os custos internos.
