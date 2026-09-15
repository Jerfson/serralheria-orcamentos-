# Quickstart & Validation Guide: Sistema de Geração de Orçamentos para Serralheria

**Feature Branch**: `001-orcamento-serralheria`  
**Date**: 2026-09-14  
**Spec Reference**: [spec.md](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

---

## 1. Visão Geral e Pré-requisitos

Este guia fornece os passos e cenários de teste automatizados e manuais para validar que o sistema atende rigorosamente aos critérios de aceitação da serralheria:
1. Cálculo paramétrico de barras de 6m com otimizador 1D (kerf 3mm).
2. Composição de mão de obra e insumos de oficina.
3. Formação de preço de venda (BDI) e condições de pagamento.
4. Emissão da Proposta Comercial (folha A4 e WhatsApp).
5. Persistência Offline-First local com exportação JSON.

### Pré-requisitos de Ambiente
- **Node.js**: v18.0.0 ou superior.
- **Gerenciador de Pacotes**: `npm` ou `pnpm`.
- **Navegador Moderno**: Google Chrome, Edge, Safari ou Firefox.

---

## 2. Inicialização e Execução Rápida

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Executar a suíte de testes unitários automatizados (motor de cálculo e corte 1D)
npm test

# 3. Iniciar o servidor local de desenvolvimento
npm run dev
```

---

## 3. Roteiro de Validação Ponta a Ponta (E2E Scenarios)

### Cenário 1: Quantificação de Barras de 6m e Otimizador 1D (P1)
**Objetivo**: Validar a precisão física do motor de corte 1D.
- **Ação**:
  1. Abrir a aplicação e criar um novo orçamento.
  2. Selecionar o cliente de teste "João Silva".
  3. Adicionar o item "Portão Basculante" com medidas: Largura `3.00m` e Altura `2.20m`.
  4. Manter o perfil padrão de requadro: Metalon `50x30 Chapa 18` (preço base: R$ 78,50 / barra de 6m).
- **Resultado Esperado**:
  - O sistema identifica as peças necessárias (2 montantes de 2.200mm e 2 travessas de 3.000mm).
  - O motor 1D aloca as peças em barras de 6.000mm com 3mm de corte:
    - *Barra 1*: [3.000mm] + [2.200mm] (Ocupado: 5.203mm | Retalho: 797mm).
    - *Barra 2*: [3.000mm] + [2.200mm] (Ocupado: 5.203mm | Retalho: 797mm).
  - Quantidade total calculada: **2 barras inteiras de 6m** (Custo aço requadro: $2 \times R\$ 78,50 = R\$ 157,00$).
  - O mapa de corte de cada barra é exibido na **Visão da Oficina**.

---

### Cenário 2: Composição de Mão de Obra e Insumos (P2)
**Objetivo**: Validar inclusão de horas e sobreposição manual de valores.
- **Ação**:
  1. No mesmo portão, verificar a estimativa automática: 12 horas de bancada + 4 horas de instalação.
  2. Taxas da oficina: R$ 45,00/h bancada (R$ 540,00) e R$ 55,00/h instalação (R$ 220,00).
  3. Adicionar kit basculante no valor de R$ 380,00 e frete de R$ 120,00.
  4. Clicar no valor do frete e alterar manualmente para R$ 150,00.
- **Resultado Esperado**:
  - O Custo Direto Total é recalculado instantaneamente refletindo a alteração manual sem quebrar as fórmulas dos demais itens.

---

### Cenário 3: Aplicação de Margem de Lucro (BDI) e Condições de Pagamento (P3)
**Objetivo**: Validar a matemática comercial de formação de preço.
- **Ação**:
  1. Com Custo Direto total de R$ 2.400,00, aplicar margem de lucro de **35% sobre a receita bruta**.
  2. Aplicar desconto promocional à vista de R$ 100,00.
  3. Selecionar a condição de pagamento: "Sinal de 50% no fechamento + Saldo na instalação".
- **Resultado Esperado**:
  - Preço de Venda Bruto calculado: $\frac{2400}{1 - 0.35} = R\$ 3.692,31$.
  - Preço de Venda com Desconto: R$ 3.592,31.
  - Valor do Sinal (50%): R$ 1.796,15 (com indicação da chave PIX).
  - Valor do Saldo na Instalação: R$ 1.796,16.

---

### Cenário 4: Geração da Proposta Comercial e WhatsApp (P4)
**Objetivo**: Validar a segregação estrita entre Visão Oficina e Visão Cliente.
- **Ação**:
  1. Alternar para a aba **"Proposta Comercial (Visão do Cliente)"**.
  2. Verificar o conteúdo exibido na tela e acionar "Imprimir / Salvar PDF".
  3. Clicar no botão "Copiar Proposta para WhatsApp".
- **Resultado Esperado**:
  - **Zero vazamento**: Nenhum custo interno de barras de 6m compradas no fornecedor, valor da hora técnica ou margem percentual de lucro aparece na proposta do cliente.
  - O layout A4 renderiza perfeitamente com cabeçalho da serralheria, tabela limpa de produtos, garantia e chave PIX para sinal.
  - O texto do WhatsApp é copiado formatado com negritos (`*`), emojis e resumo comercial convidativo.

---

### Cenário 5: Persistência Offline e Exportação de Backup
**Objetivo**: Validar funcionamento sem internet e portabilidade de dados.
- **Ação**:
  1. No DevTools do navegador, desativar a rede (marcar modo *Offline*).
  2. Recarregar a página da aplicação.
  3. Criar e salvar um novo orçamento.
  4. Clicar em "Configurações > Exportar Backup (JSON)".
- **Resultado Esperado**:
  - A aplicação carrega e funciona 100% offline.
  - Os orçamentos persistem íntegros no IndexedDB.
  - O arquivo `.json` de backup é baixado contendo todos os clientes, materiais e propostas conforme o contrato [`contracts/orcamento-schema.json`](./contracts/orcamento-schema.json).
