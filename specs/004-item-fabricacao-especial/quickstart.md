# Quickstart: Validação de Fabricação Especial (Churrasqueiras, Bancadas, etc.)

**Feature**: `004-item-fabricacao-especial`  
**Date**: 2026-09-16  

---

## 1. Como Validar via Testes Automatizados

Execute a suíte de testes:

```bash
npm test
```

Os testes devem verificar:
- Adição de item `'fabricacao_especial'` ao orçamento.
- Cálculo de custos diretos considerando `ajustesManuais.custoMaterialManual` e horas de mão de obra.
- Garantia de que o motor de corte 1D processa o orçamento normalmente sem falhar na ausência de peças lineares.

---

## 2. Como Validar Visualmente no Navegador

1. Inicie a aplicação local:
   ```bash
   npm run dev
   ```
2. Abra `http://localhost:5173`.
3. Na aba **"1. Montar Orçamento"**:
   - No cabeçalho do construtor de itens, clique na aba **"🔥 Fabricação Especial / Peças Sob Medida"**.
   - Clique na sugestão rápida **"Churrasqueira Parrilla em Aço"**.
   - Observe os campos preenchidos:
     - Nome: *"Churrasqueira Parrilla em Aço Carbono com Grelha Inox"*
     - Dimensões: 0,80m (L) x 0,90m (A) x 0,50m (P)
     - Custo de Materiais: R$ 380,00
     - Horas de Oficina: 6h
     - Acabamento: Pintura alta temperatura 600°C
   - Clique no botão **"Adicionar Fabricação Especial"**.
4. Verifique:
   - O item aparece na lista de estruturas inclusas com a indicação de 3 dimensões (L x A x P).
   - O custo direto total e o preço de venda calculam imediatamente com a margem da oficina.
   - Na aba **"3. Proposta do Cliente"**, a churrasqueira consta com suas medidas e acabamento, sem expor os custos internos.
