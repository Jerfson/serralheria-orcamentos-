# Feature Specification: Inclusão e Orçamento de Fabricação Especial e Peças Sob Medida (Churrasqueiras, Bancadas, etc.)

**Feature Branch**: `004-item-fabricacao-especial`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "gostaria de cadastrar algo personalizado como churrasqueira etc - Opção 3: Item Avulso de Fabricação Especial (Preço / Custo Direto)"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro de Item de Fabricação Especial no Orçamento (Priority: P1) 🎯 MVP

Como serralheiro orçamentista, desejo lançar produtos especiais sob medida (como churrasqueiras, bancadas industriais, coifas, carrinhos ou lixeiras) informando suas dimensões (largura, altura, profundidade), custo direto de materiais/chapas, horas estimadas de solda/bancada e acabamento (ex.: pintura alta temperatura), para que eu possa orçar produtos complexos que não dependem apenas de barras lineares de 6 metros.

**Why this priority**: É o valor central da funcionalidade. Muitas oficinas faturam alto com churrasqueiras, mesas industriais e peças especiais que utilizam chapas dobradas, fundição e itens prontos, necessitando de uma forma direta de orçar sem ficar preso ao motor exclusivo de perfis lineares.

**Independent Test**: No construtor de orçamentos, alternar para a aba/modo "Fabricação Especial", informar: Descrição: "Churrasqueira Parrilla em Aço Carbono com Grelha Inox", Largura: 0.80m, Altura: 0.90m, Profundidade: 0.50m, Custo de Materiais: R$ 380,00, Horas de Oficina: 6h, Acabamento: "Pintura para alta temperatura 600°C". Adicionar ao orçamento e validar que o item compõe o custo direto, aplica o BDI/margem de lucro e é exibido na proposta comercial.

**Acceptance Scenarios**:
1. **Given** que o usuário está no construtor de itens na aba "Fabricação Especial",  
   **When** informa nome, dimensões 3D (L x H x P), custo de materiais e horas de fabricação,  
   **Then** o item é adicionado ao orçamento com os subtotais calculados corretamente.
2. **Given** um item de fabricação especial adicionado,  
   **When** o usuário visualiza o resumo de custos diretos da oficina,  
   **Then** o custo de material e as horas de bancada entram no custo direto total (`custoDiretoTotal`) para aplicação da margem de lucro.
3. **Given** a proposta comercial A4 do cliente e o WhatsApp,  
   **When** gerados para o cliente,  
   **Then** a descrição detalhada, dimensões (L x H x P) e acabamento da churrasqueira constam perfeitamente destacados.

---

### User Story 2 - Composição de Acessórios Dedicados por Peça (Priority: P2)

Como serralheiro, desejo vincular acessórios e insumos específicos à peça especial (ex.: Grelha Inox, Termômetro de Tampa, Rodízios Giratórios de Silicone, Puxadores de Madeira), para que seus custos individuais sejam somados ao item e descritos na proposta do cliente.

**Why this priority**: Uma churrasqueira ou móvel especial é altamente valorizada pelos acessórios agregados. Ter isso discriminado aumenta a taxa de fechamento da proposta com o cliente.

**Independent Test**: Ao montar a churrasqueira, adicionar 1x "Grelha Inox Moeda" (R$ 120,00) e 4x "Rodízios Giratórios" (R$ 25,00 cada) e verificar a soma de R$ 220,00 no custo de acessórios do produto.

**Acceptance Scenarios**:
1. **Given** a montagem de uma fabricação especial,  
   **When** o usuário adiciona acessórios no próprio item,  
   **Then** o custo total de acessórios é somado ao custo direto da estrutura.

---

### User Story 3 - Segregação de Visões (Oficina vs. Cliente) (Priority: P3)

Como gestor da serralheria, desejo que a proposta do cliente exiba apenas o preço de venda, dimensões e especificações técnicas da churrasqueira/peça, mantendo em sigilo o custo interno de chapas e horas de bancada na Visão da Oficina.

**Why this priority**: Preserva o poder de barganha comercial da serralheria e profissionaliza o relacionamento com o cliente.

**Independent Test**: Alternar entre a aba "Visão da Oficina" e a aba "Proposta do Cliente", confirmando que os custos de material e horas só aparecem internamente.

**Acceptance Scenarios**:
1. **Given** a proposta A4 gerada,  
   **When** impressa ou exportada em PDF,  
   **Then** nenhum custo de chapa ou horas de fabricação vaza para o cliente.

---

### Edge Cases

- **Peça sem medidas de profundidade**: Se for um painel ou chapa reta, a profundidade pode ser opcional ou zero.
- **Peça sem consumo de barras de 6m**: Peças puramente de chapas ou com custo manual não quebram o motor de corte 1D; as barras comerciais de 6m continuam sendo calculadas apenas para os produtos que tiverem peças lineares demandadas.
- **Validação de custo**: O custo de materiais não pode ser negativo ($< 0$).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE suportar o tipo de estrutura `'fabricacao_especial'` no tipo TypeScript `TipoEstrutura`.
- **FR-002**: O `ItemOrcamento` DEVE permitir armazenar `medidas.profundidadeM?: number` e `ajustesManuais.custoMaterialManual?: number`.
- **FR-003**: A função `calcularCustosDiretos` em `orcamentoCalculator.ts` DEVE somar os custos manuais de materiais de itens de fabricação especial ao custo direto total.
- **FR-004**: O componente `ItemBuilder` DEVE oferecer abas ou alternância de modo:
  - Modo 1: **"Estruturas Paramétricas"** (Portões, Grades, Corrimãos, Cobertura).
  - Modo 2: **"Fabricação Especial / Sob Medida"** (Churrasqueiras, Mesas, Carrinhos, Coifas, etc.).
- **FR-005**: O formulário de Fabricação Especial DEVE conter campos para: Descrição/Nome, Largura (m), Altura (m), Profundidade (m), Custo Estimado de Materiais/Chapas (R$), Horas de Oficina (h), Horas de Instalação (h), Acabamento e Quantidade.
- **FR-006**: Sugestões rápidas de preenchimento DEVEM ser fornecidas para facilitar (ex.: modelos sugeridos como "Churrasqueira Parrilla", "Bancada Industrial", "Coifa Metálica").
- **FR-007**: Os itens de fabricação especial DEVEM ser renderizados com clareza na lista de itens, na proposta executiva A4 (`PropostaClienteA4.tsx`) e na mensagem para WhatsApp (`whatsappService.ts`).
- **FR-008**: O plano de corte 1D (`cuttingEngine.ts`) DEVE ignorar itens sem peças lineares de corte sem causar nenhum erro.

### Key Entities

- **ItemOrcamento**:
  - `tipoEstrutura: 'fabricacao_especial'`
  - `descricao: string`
  - `medidas: { larguraM: number; alturaM: number; profundidadeM?: number }`
  - `ajustesManuais: { custoMaterialManual?: number; custoMaoDeObraManual?: number }`
  - `horasFabricacao: number`
  - `horasInstalacao: number`
  - `acabamento: string`
  - `quantidadeUnidades: number`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue orçar uma churrasqueira sob medida completa com custos e acabamentos em menos de 45 segundos.
- **SC-002**: 100% de compatibilidade com o cálculo financeiro de BDI, margens de lucro, parcelamento e propostas existentes.
- **SC-003**: 100% de aprovação nos testes automatizados (`npm test`) cobrindo cálculo direto com fabricação especial.
- **SC-004**: Zero interferência no plano de corte de barras de 6m dos outros itens do orçamento.

---

## Assumptions

- Itens de fabricação especial podem conter custo direto de materiais informados em reais (R$) referentes a chapas, cortes a laser, inox ou ferro fundido, além de horas de mão de obra de solda e serralheiro.
- O BDI e margem de lucro incidem igualmente sobre todos os itens do orçamento para formação do preço de venda final.
