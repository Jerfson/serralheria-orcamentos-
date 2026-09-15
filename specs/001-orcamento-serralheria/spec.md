# Feature Specification: Sistema de Geração de Orçamentos para Serralheria

**Feature Branch**: `001-orcamento-serralheria`  
**Created**: 2026-09-14  
**Status**: Draft  
**Input**: User description: "Sistema de geração de orçamentos para serralheria, permitindo cadastrar o cliente, selecionar ou cadastrar o produto/serviço, informar medidas e quantidades, calcular automaticamente materiais necessários incluindo perfis em barras de 6 metros e perdas de corte, adicionar consumíveis, mão de obra e outros custos, aplicar margem de lucro, desconto e condições de pagamento, permitir ajustes manuais dos valores e gerar uma proposta de orçamento pronta para envio ao cliente."

---

## Clarifications

### Session 2026-09-14
- Q: Como deve ser estruturada a persistência de dados e o modelo de execução da aplicação? → A: Option A: Offline-First Local (executa no navegador como SPA/PWA, persiste localmente via IndexedDB / LocalStorage, suporta exportação e importação de backups em JSON, funcionando 100% offline na oficina e na obra sem custos de servidor).
- Q: O sistema deve vir pré-carregado com uma base padrão de perfis metálicos, insumos e modelos estruturais da serralheria brasileira? → A: Option A: Base Padrão Brasileira Completa (pré-carregada com os perfis de metalon 50x30, 40x20, 30x20, 20x20 nas chapas 18 e 16, cantoneiras, barras chatas, insumos de solda/pintura e modelos paramétricos típicos com preços médios de referência editáveis e opção de restaurar padrões).
- Q: Como o motor de cálculo deve quantificar as barras de 6 metros e processar as perdas de corte (kerf)? → A: Option A: Otimizador 1D com Plano de Corte (First-Fit Decreasing com 3mm de perda de corte/kerf por secção em barras comerciais de 6 metros, gerando a quantidade exata de barras inteiras a comprar, a lista de corte de cada barra e a discriminação de retalhos aproveitáveis na Visão da Oficina).
- Q: Como o sistema deve processar o corte e a quantificação de barras quando o orçamento contiver múltiplos produtos que usam o mesmo perfil? → A: Option A: Otimização Global Unificada por Perfil (consolida todas as peças com perfis idênticos de todos os itens do orçamento em um único plano de corte 1D de barras de 6m, reaproveitando sobras entre itens distintos e gerando a lista consolidada de compras de aço).
- Q: Como deve ser a formatação, personalização da marca e exportação da proposta comercial destinada ao cliente? → A: Option A: Proposta Executiva Completa (cabeçalho configurável com logo e dados da oficina, chave PIX para pagamento do sinal, termos de garantia e prazos, layout A4 otimizado para impressão e download de PDF nativo via navegador, além de botão para envio direto e cópia de mensagem formatada para WhatsApp).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quantificação Paramétrica e Cálculo de Barras de 6m (Priority: P1)

Como serralheiro ou orçamentista de oficina metálica, quero selecionar um tipo de produto (ex.: portão basculante, grade de proteção, corrimão, cobertura) e informar as medidas (largura, altura) e quantidades, para que o sistema calcule automaticamente o consumo de aço em metros lineares, converta em barras comerciais inteiras de 6,00 metros considerando a perda de corte (kerf), e estime os insumos e mão de obra necessários.

**Why this priority**: É o núcleo de valor do negócio de serralheria. O erro humano mais frequente no setor é cobrar por metros fracionados e ter prejuízo ao comprar barras inteiras de 6m no fornecedor ou esquecer o custo de corte, solda e consumíveis.

**Independent Test**:
Pode ser testado de forma autônoma inserindo as dimensões de um portão de 3,00m x 2,20m e verificando se o sistema calcula o comprimento total dos tubos (quadro + travessas + réguas), aplica a perda de corte (5% a 10% ou 3mm por corte) e arredonda para cima a quantidade exata de barras de 6m a comprar, totalizando o custo direto.

**Acceptance Scenarios**:
1. **Given** um portão de dimensões 3,00m de largura por 2,20m de altura com tubos 50x30mm no requadro e réguas 20x20mm a cada 10cm, **When** o usuário confirma as medidas, **Then** o sistema exibe o comprimento total linear de cada perfil, a quantidade convertida em barras de 6,00 metros (arredondadas para o próximo número inteiro) e o custo total de aço.
2. **Given** uma peça cujo comprimento individual calculado seja 2,50 metros, **When** o sistema calcula a divisão de barras de 6 metros, **Then** ele considera que cada barra de 6m rende no máximo 2 peças de 2,50m (gerando 1,00m de sobra/retalho), não permitindo a soma simplista de frações sem corte físico.
3. **Given** a quantificação das barras de metalon concluída, **When** o cálculo dos consumíveis é processado, **Then** o sistema estima automaticamente o consumo proporcional de eletrodos/arame MIG, discos de corte/desbaste, lixas e zarcão/primer anticorrosivo.

---

### User Story 2 - Composição de Custos, Mão de Obra e Ajustes Manuais (Priority: P2)

Como proprietário da serralheria, quero adicionar horas estimadas de fabricação e montagem/instalação, despesas de transporte/frete, acessórios especiais (fechaduras, dobradiças, kits de roldana/contrapeso, motor) e poder ajustar manualmente quaisquer valores de insumos ou do item, para refletir fielmente a realidade da oficina.

**Why this priority**: Orçamentos de serralheria envolvem especificidades como frete distante, subida em escadas na obra, ou peças já em estoque na oficina que o serralheiro quer precificar com custo zero ou desconto.

**Independent Test**:
Pode ser testado isoladamente adicionando 12 horas de oficina (R$ 45/h), 4 horas de instalação (R$ 55/h), frete de R$ 150 e um kit basculante de R$ 380, e em seguida alterando manualmente o custo de um dos tubos, validando que o custo direto total é recalculado imediatamente.

**Acceptance Scenarios**:
1. **Given** um orçamento em edição, **When** o serralheiro informa o tempo de oficina e tempo de instalação na obra, **Then** o sistema multiplica pelas taxas horárias configuradas e adiciona ao Custo Direto da proposta.
2. **Given** um insumo com valor calculado automaticamente, **When** o usuário clica no campo de valor e digita um valor customizado, **Then** o sistema adota o valor manual, sinaliza visualmente a sobreposição e recalcula o custo direto sem perder a fórmula original.
3. **Given** a necessidade de componentes de terceiros, **When** o usuário adiciona acessórios avulsos (fechadura tetra, dobradiça gonzo, motor para portão), **Then** os itens entram na listagem discriminada de custos com seus respectivos preços de aquisição.

---

### User Story 3 - Margem de Lucro (Markup/BDI), Desconto e Condições de Pagamento (Priority: P3)

Como gestor comercial, quero aplicar uma margem de lucro sobre o custo ou sobre a receita (BDI), definir descontos promocionais (em porcentagem ou valor em reais) e configurar formas de pagamento (ex.: Entrada de 50% + 50% na instalação, ou parcelado em até 12x no cartão), para formalizar a negociação com segurança financeira.

**Why this priority**: Garante a saúde financeira da serralheria, assegurando que o preço final cubra custos operacionais e gere o lucro esperado, além de viabilizar a flexibilidade de negociação comercial.

**Independent Test**:
Pode ser testado inserindo um custo direto de R$ 2.000,00, aplicando margem de lucro de 40%, desconto de 5% à vista e condição de "Sinal de 50% + 50% na entrega", validando se os valores parciais, totais e percentuais batem com a matemática financeira.

**Acceptance Scenarios**:
1. **Given** um Custo Direto de R$ 3.000,00 e uma Margem de Lucro configurada de 35% sobre a receita bruta (Markup divisor), **When** o cálculo é executado, **Then** o Preço de Venda Bruto calculado é de R$ 4.615,38 ($\frac{3000}{1 - 0.35}$).
2. **Given** um valor total de orçamento, **When** o usuário concede um desconto de R$ 200,00 ou 5%, **Then** o sistema atualiza o valor final a pagar e recalcula as parcelas conforme a condição de pagamento selecionada.
3. **Given** a condição de pagamento configurada como "50% de entrada no fechamento + saldo na conclusão da instalação", **When** o orçamento é visualizado, **Then** o detalhamento discrimina com precisão o valor do sinal a ser pago via PIX/Transferência e o saldo remanescente.

---

### User Story 4 - Cadastro de Cliente e Emissão da Proposta Comercial Pronta (Priority: P4)

Como serralheiro, quero vincular os dados do cliente (nome, WhatsApp, endereço da obra) e gerar uma proposta comercial formal limpa e profissional (visão do cliente) pronta para impressão, PDF ou envio instantâneo no WhatsApp, sem exibir custos internos de barras ou margens de lucro.

**Why this priority**: A apresentação visual e agilidade para enviar a proposta pelo WhatsApp nos primeiros 30 minutos após a visita técnica é o fator que mais converte vendas no mercado de serralheria e transmite credibilidade.

**Independent Test**:
Pode ser testado vinculando um cliente, acionando o botão "Copiar Proposta para WhatsApp" e verificando se a mensagem contém a descrição clara dos itens, dimensões, acabamento, prazos, formas de pagamento e valor total, ocultando completamente o custo de compras de barras ou margem de lucro.

**Acceptance Scenarios**:
1. **Given** um orçamento finalizado, **When** o usuário gera a Proposta Comercial para o Cliente, **Then** a visualização exibe apenas o cabeçalho da serralheria, dados do cliente, itens descritivos, acabamento (ex.: pintura primer anticorrosivo cinza), garantia, prazos, formas de pagamento e valor final.
2. **Given** a Proposta Comercial do Cliente gerada, **Then** sob nenhuma hipótese devem ser exibidos preços de custo de fábrica, quantidade de barras de 6m compradas no atacado, margem percentual de lucro ou valor da hora técnica.
3. **Given** o clique no botão "Enviar via WhatsApp", **When** acionado, **Then** o sistema abre o WhatsApp Web/App com uma mensagem já estruturada com negritos, marcadores, resumo financeiro e link/chave PIX para sinal.

---

### Edge Cases

- **Peça individual maior que 6,00 metros lineares**: Quando o vão de uma viga ou trilho de portão for maior que o comprimento de uma barra comercial (ex.: vão de 7,50 metros), o sistema deve alertar que haverá necessidade de emenda com solda estrutural e contabilizar 2 barras de 6m para cobrir o comprimento com retalho restante.
- **Margem de lucro abusiva ou tendendo a 100%**: Se o usuário inserir margem de lucro sobre receita igual ou superior a 100% (o que causaria divisão por zero no cálculo de $\frac{\text{Custo}}{1 - \text{Margem}}$), o sistema deve impedir a operação e indicar o teto operacional ou alternar para margem sobre o custo (Markup multiplicador).
- **Desconto superior ao lucro**: Caso o operador aplique um desconto que resulte em preço de venda inferior ao custo direto total, o sistema deve emitir um aviso em vermelho alertando sobre "Venda com Prejuízo Operacional", requerendo confirmação explícita.
- **Medidas com casas decimais ou unidades mistas**: O sistema deve normalizar entradas tanto com vírgula quanto com ponto (ex.: `2,50` ou `2.50`), interpretando valores menores que 10 como metros (`2.5` = 2,5 metros) e valores maiores que 50 como centímetros ou milímetros conforme máscara de entrada.
- **Perda de conexão durante o atendimento na obra**: Toda a digitação de medidas, clientes e itens deve ser mantida em cache local resiliente para evitar perda de dados se o sinal 4G/Wi-Fi oscilar durante a medição.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir o cadastro e consulta de clientes contendo: Nome completo, Telefone/WhatsApp, Endereço completo da obra/instalação, CPF/CNPJ e Observações técnicas de acesso.
- **FR-002**: O sistema DEVE disponibilizar catálogo paramétrico pré-carregado com materiais padrão do mercado brasileiro (perfis de metalon 50x30, 40x20, 30x20, 20x20 nas chapas 18 e 16, cantoneiras e barras chatas), insumos de consumo (eletrodo, discos, primer) e modelos estruturais típicos (Portão Basculante, Portão Deslizante, Grade Residencial, Grade Tubo/Tela, Corrimão e Cobertura), com valores de referência pré-configurados, edição livre e opção de restaurar padrões de fábrica.
- **FR-003**: O sistema DEVE permitir o cadastro de produtos/serviços customizados caso o modelo solicitado não exista no catálogo pré-definido.
- **FR-004**: O sistema DEVE solicitar ao usuário dimensões em metros (Largura, Altura, e quando aplicável Comprimento/Profundidade) e quantidade de unidades a fabricar.
- **FR-005**: O sistema DEVE calcular a metragem linear total de cada tipo de perfil de aço (metalon, cantoneira, ferro chato, tubo) exigido para a estrutura do produto.
- **FR-006**: O sistema DEVE quantificar as barras de 6,00 metros utilizando algoritmo de corte linear 1D (First-Fit Decreasing) com 3mm de perda (kerf) por corte, consolidando todas as peças do mesmo perfil entre múltiplos itens do orçamento em um único plano de corte global, garantindo o máximo reaproveitamento de sobras e emitindo a lista unificada de compras de barras.
- **FR-007**: O sistema DEVE calcular automaticamente os custos de consumíveis básicos de serralheria proporcionais ao tamanho e peso da peça (eletrodos/arame MIG, discos de corte de 4.1/2" e 7", discos de desbaste, lixas e zarcão/primer).
- **FR-008**: O sistema DEVE permitir a inclusão de acessórios específicos do produto (fechaduras, dobradiças, kits de peso/roldana, cremalheiras, motores e chumbadores) com seus respectivos custos unitários.
- **FR-009**: O sistema DEVE calcular o custo de mão de obra a partir de horas estimadas de fabricação em bancada e horas de instalação externa multiplicadas pelas taxas horárias da oficina.
- **FR-010**: O sistema DEVE permitir a inclusão de despesas logísticas (frete de transporte da oficina até a obra, combustível, refeição em montagens longas).
- **FR-011**: O sistema DEVE permitir a sobreposição e edição manual de qualquer valor unitário, quantidade ou subtotal calculado pelo motor automático.
- **FR-012**: O sistema DEVE calcular o Custo Direto Total somando: Aço (barras de 6m) + Insumos + Acessórios + Mão de Obra + Frete.
- **FR-013**: O sistema DEVE permitir a aplicação de margem de lucro configurável (percentual padrão recomendável de 30% a 50%) calculada sobre a receita bruta ou sobre o custo.
- **FR-014**: O sistema DEVE permitir a aplicação de desconto em porcentagem (%) ou valor monetário fixo (R$).
- **FR-015**: O sistema DEVE permitir a configuração das condições de pagamento oferecidas (à vista no PIX com desconto, sinal de entrada + parcelas, ou cartão de crédito em N vezes).
- **FR-016**: O sistema DEVE possuir duas visões claramente segregadas:
  - **Visão da Oficina**: Detalha lista de compras de barras de 6m, plano/mapa visual de corte 1D consolidado (peças por barra e retalhos), horas de solda/montagem, custos unitários reais e margem líquida da empresa.
  - **Visão do Cliente**: Exibe apresentação comercial executiva contendo cabeçalho configurável com logotipo e contatos da oficina, dados do cliente, descrição dos produtos com dimensões e acabamento, prazos, termos de garantia, chave PIX para sinal e valor total, ocultando 100% dos custos internos.
- **FR-017**: O sistema DEVE disponibilizar layout de Proposta Comercial em folha A4 executiva, com estilização CSS `@media print` otimizada para impressão física de alta fidelidade e download direto em PDF através dos recursos nativos do navegador (`window.print()`).
- **FR-018**: O sistema DEVE gerar texto estruturado com formatação de negrito, tópicos claros e chave PIX para envio instantâneo via WhatsApp com 1 clique (geração de link `https://wa.me/...` e botão para copiar para a área de transferência).
- **FR-019**: O sistema DEVE permitir o salvamento, duplicação e alteração de status dos orçamentos (ex.: Rascunho, Enviado, Aprovado, Em Produção, Concluído, Cancelado).
- **FR-020**: O sistema DEVE persistir todos os orçamentos, cadastros de clientes e catálogo de materiais localmente no navegador do usuário utilizando arquitetura Offline-First (IndexedDB / LocalStorage), funcionando 100% autônomo e sem conexão à internet, disponibilizando ferramentas de exportação e restauração de backup completo em arquivo JSON.

---

### Key Entities *(mandatory)*

- **Cliente**: Entidade que representa o tomador do serviço. Atributos: `id`, `nome`, `telefoneWhatsApp`, `email`, `documento` (CPF/CNPJ), `enderecoObra` (rua, número, bairro, cidade, CEP, ponto de referência), `dataCadastro`.
- **ItemOrcamento**: Representa cada estrutura ou serviço orçado. Atributos: `id`, `orcamentoId`, `descricao`, `tipoEstrutura` (portão basculante, grade, corrimão, etc.), `largura`, `altura`, `profundidade`, `quantidade`, `materiais` (lista de perfis e barras de 6m), `consumiveis` (solda, discos, primer), `acessorios` (fechaduras, roldanas), `horasFabricacao`, `horasInstalacao`, `ajustesManuais`, `custoDiretoTotal`, `precoVendaFinal`.
- **MaterialPerfil**: Catálogo de perfis metálicos. Atributos: `id`, `codigo`, `descricao` (ex.: Metalon 50x30 Chapa 18), `tipo` (quadrado, retangular, cantoneira, ferro chato, redondo), `comprimentoBarra` (sempre 6,00 metros), `precoUnitarioBarra`, `pesoNominalKg`.
- **Orcamento**: Registro mestre da cotação comercial. Atributos: `id`, `numeroSequencial`, `dataCriacao`, `validadePropostaDias` (padrão 10 dias), `clienteId`, `itens` (lista de `ItemOrcamento`), `custoFrete`, `custosAdicionais`, `custoDiretoTotal`, `margemLucroPercentual`, `descontoValor`, `descontoPercentual`, `precoFinalVenda`, `condicoesPagamento` (sinal, parcelas, prazos), `prazoEntregaDias`, `garantiaMeses`, `status`.
- **PropostaComercial**: Estrutura de exibição e comunicação para o cliente. Atributos: `orcamentoId`, `cabecalhoEmpresa`, `resumoItensVisaoCliente`, `condicoesComerciais`, `textoWhatsAppFormatado`, `versaoPdfGerada`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O serralheiro consegue quantificar as barras de 6m, insumos e custos de um portão ou grade padrão em **menos de 60 segundos** após inserir as medidas.
- **SC-002**: **100% dos perfis de aço** são orçados considerando barras inteiras de 6 metros com aplicação de margem técnica de perda de corte (kerf >= 5%), eliminando compras subdimensionadas.
- **SC-003**: A proposta comercial formatada para impressão/PDF e a mensagem para WhatsApp são geradas com **1 único clique** após o preenchimento das condições.
- **SC-004**: **0% de exposição** de custos internos de fábrica, margem de lucro ou custo unitário de barras na proposta e na mensagem enviada ao cliente.
- **SC-005**: O sistema permite a edição manual ágil de qualquer valor calculado em no máximo **2 cliques**, sem quebrar a consistência das fórmulas subjacentes.
- **SC-006**: Todos os dados do orçamento permanecem íntegros mesmo se a janela for recarregada ou houver oscilação de conexão na obra.

---

## Assumptions

- A unidade comercial de referência para tubos, metalons, cantoneiras e perfis estruturais de aço no mercado brasileiro é a barra inteira de 6,00 metros lineares.
- O padrão de perda de corte por lâmina de serra fita ou disco abrasivo adotado por padrão é de 3mm por corte, ou margem de segurança global de 5% a 10% sobre o comprimento linear total.
- O valor da hora técnica de oficina e hora de montagem externa pode ser customizado pelo serralheiro nas configurações da oficina.
- A validade padrão das propostas comerciais para serralheria é de 10 a 15 dias corridos devido à volatilidade de preços das usinas de aço.
