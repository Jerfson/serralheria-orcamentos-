# ⚙️ Serralheria Pro - Sistema de Orçamentos & Corte 1D (Barras de 6m)

Sistema web **Offline-First** completo para gestão técnica de orçamentos, quantificação paramétrica de estruturas metálicas e otimização de corte de barras comerciais de 6,00 metros para oficinas de serralheria.

---

## 🚀 Principais Funcionalidades

- **Otimizador Linear de Corte 1D**: Heurística *First-Fit Decreasing* com perda física de corte da serra (*kerf* de 3mm) em barras de 6,00 metros, gerando o plano visual de corte peça por peça e classificação de retalhos aproveitáveis.
- **Consolidação Multi-Itens**: Agrupa peças de perfis idênticos de múltiplos produtos em um único plano de corte global para máxima economia de aço.
- **Modelos Paramétricos Pré-Configurados**: Portão basculante, portão deslizante, grades tubulares, corrimãos e coberturas com cálculo automático de requadros e réguas a partir da largura e altura.
- **Composição de Custos Diretos**: Quantificação de perfis, rateio de insumos (eletrodos/MIG, discos e primer zarcão), horas de bancada/instalação e logística de frete, com suporte a ajustes manuais.
- **Formação de Preço de Venda (BDI)**: Margem de lucro sobre a receita bruta (Markup divisor), descontos em valor/porcentagem e parcelamento ou sinal via PIX.
- **Segregação Estrita de Visões**:
  - **Visão da Oficina**: Confidencial, com lista de compra de barras de 6m, mapa de corte e margem de lucro real.
  - **Visão do Cliente**: Proposta comercial executiva em folha A4 pronta para impressão/PDF (`window.print()`) e mensagem estruturada para envio com 1 clique no WhatsApp.
- **100% Offline-First**: Armazenamento local no navegador via IndexedDB com ferramenta completa de exportação e restauração de backups em arquivo `.json`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript 5, Vite 5
- **Estilização**: Tailwind CSS v3 (Tema Dark Industrial Slate/Amber) com CSS Print `@media print`
- **Ícones**: Lucide React
- **Testes**: Vitest (100% de cobertura nos motores de corte e cálculos financeiros)
- **Persistência**: IndexedDB (com fallback para LocalStorage)

---

## 📦 Como Rodar o Projeto Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git

# 2. Acesse a pasta do projeto
cd NOME_DO_REPOSITORIO

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

---

## 🧪 Como Rodar os Testes Automatizados

```bash
npm test
```

---

## 🏗️ Gerar Build de Produção

```bash
npm run build
```

Os arquivos estáticos prontos para publicação estarão disponíveis na pasta `dist/`.
