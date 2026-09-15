# Quickstart & Roteiro de Validação: Travessas Paramétricas

**Feature**: `002-adicionar-numero-travessas`  
**Date**: 2026-09-15  

---

## 1. Como Validar via Testes Automatizados

Execute os testes unitários do motor de cálculo paramétrico:

```bash
npm test
```

Os testes devem cobrir:
- Criação de portão basculante com 0, 1, 2 e 3 travessas intermediárias.
- Validação do comprimento e quantidade gerados na lista de peças lineares.
- Garantia de que a lista de compras de barras de 6 metros e o plano de corte aumentam proporcionalmente ao número de travessas.

---

## 2. Como Validar Visualmente no Navegador

1. Inicie o servidor local:
   ```bash
   npm run dev
   ```
2. Abra `http://localhost:5173` e clique em **Novo Orçamento** ou vá na aba de orçamentos.
3. No formulário **Adicionar Produto / Estrutura ao Orçamento**:
   - Selecione **Portão Basculante** (dimensões: Largura 3.00m, Altura 2.20m).
   - Observe o campo **Travessas Intermediárias**: o valor inicial padrão será `1`.
   - Altere o campo para `3`:
     - O resumo prévio de peças deve mostrar `3` travessas de 3000mm.
     - A estimativa de barras comerciais de 6m é recalculada instantaneamente.
   - Altere para `0`:
     - Nenhuma travessa central deve constar nas peças (apenas os 2 montantes laterais e 2 horizontais de contorno).
4. Alterne para **Corrimão**:
   - O campo de travessas deve mudar automaticamente para `2` (linhas intermediárias de proteção).
5. Clique em **Adicionar Item** e confirme que o item entra na proposta com o número correto de barras de 6m calculadas.
