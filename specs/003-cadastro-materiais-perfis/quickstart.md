# Quickstart: Validação da Gestão de Materiais e Perfis

**Feature**: `003-cadastro-materiais-perfis`  
**Date**: 2026-09-16  

---

## 1. Como Validar via Testes Automatizados

Execute os testes unitários do repositório e manipulação de materiais:

```bash
npm test
```

Os testes devem cobrir:
- Listagem e recuperação de materiais cadastrados.
- Atualização do preço da barra de 6m de um perfil existente.
- Cadastro de um novo perfil (ex: Metalon 60x40 chapa 16) com validação de campos.
- Desativação de perfil e exclusão no IndexedDB/LocalStorage.

---

## 2. Como Validar Visualmente no Navegador

1. Inicie a aplicação local:
   ```bash
   npm run dev
   ```
2. Abra `http://localhost:5173`.
3. No topo da tela (ou no construtor de orçamentos), clique no botão **"Perfis & Aço"** (ou atalho *"Gerenciar Materiais"*).
4. O modal **Tabela de Materiais & Perfis de Aço** será aberto:
   - Filtre por **Metalon Retangular** ou pesquise por *"50x30"*.
   - Altere o preço da barra de 6m do Metalon 50x30 de R$ 78,50 para R$ 89,00 e clique em Salvar.
5. Clique em **"Novo Perfil de Aço"**:
   - Tipo: Tubo Retangular (Metalon).
   - Descrição: Metalon 60x40 Chapa 16 (1.50mm).
   - Dimensões: 60 x 40 x 1.50mm.
   - Preço da barra de 6m: R$ 125,00.
   - Salve o novo perfil.
6. Volte à aba **"1. Montar Orçamento"**:
   - No seletor de "Perfil do Requadro / Quadro", verifique que o **Metalon 60x40 Chapa 16** consta na lista com o preço de R$ 125,00.
   - Selecione-o e observe que o cálculo do aço e o plano de corte 1D passam a utilizar o novo perfil imediatamente.
