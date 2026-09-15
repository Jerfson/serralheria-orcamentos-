# Phase 0 Research: Sistema de Geração de Orçamentos para Serralheria

**Feature Branch**: `001-orcamento-serralheria`  
**Date**: 2026-09-14  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Algoritmo de Otimização de Corte 1D de Perfis (Barras de 6,00 metros)

### Contexto & Desafio
Tubos e perfis metálicos (metalons, cantoneiras, barras chatas, perfis U) são adquiridos em barras padronizadas de 6,00 metros (6.000 mm). Cada corte realizado por serra fita ou disco policorte desgasta material físico (perda de corte / *kerf* de ~3mm). Um orçamento pode conter dezenas de peças de medidas diversas (montantes, travessas, réguas, requadros). Cobrar por metragem linear fracionada simples causa prejuízo frequente por desconsiderar sobras não aproveitáveis.

### Decisão Técnica
- **Algoritmo**: Heurística **First-Fit Decreasing (FFD)** adaptada para corte de perfis metálicos com perda de corte (*kerf* de 3mm por corte) e consolidação multi-itens.
- **Estrutura**:
  1. Coleta todas as peças necessárias de todos os itens do orçamento que utilizam o mesmo perfil (ex.: Metalon 50x30 Chapa 18).
  2. Ordena as peças por comprimento em ordem decrescente ($L_1 \ge L_2 \ge \dots \ge L_n$).
  3. Para cada peça, tenta alocá-la na primeira barra de 6.000 mm que possua espaço livre suficiente considerando: $\text{Espaço Necessário} = \text{Comprimento da Peça} + \text{Kerf (3mm)}$.
  4. Se nenhuma barra aberta comportar a peça, abre uma nova barra comercial de 6.000 mm.
  5. Retorna:
     - Quantidade total de barras de 6m a comprar.
     - Mapa visual de corte de cada barra (ex.: *Barra 1: [2.200mm] + [2.200mm] + [1.500mm] | Sobra: 91mm*).
     - Lista de retalhos com classificação (aproveitável se $\ge 1.000\text{mm}$, sucata se $< 1.000\text{mm}$).

### Racionalidade
- Complexidade temporal $O(n \log n)$ com garantia teórica comprovada de no máximo $\frac{11}{9} \cdot \text{Ótimo} + \frac{6}{9}$ barras.
- Execução em $< 2\text{ms}$ no cliente para mais de 200 peças, fornecendo feedback instantâneo ao serralheiro enquanto digita as medidas.

### Alternativas Consideradas
- *Algoritmo Genético / Simplex Branch-and-Cut*: Custo computacional excessivo no navegador sem ganho prático significativo para lotes de serralheria (geralmente $< 100$ barras).
- *Cálculo por Metragem Linear Total + Margem %*: Rejeitado na sessão de esclarecimento por causar erros em peças grandes e não gerar o plano de corte para a bancada.

---

## 2. Arquitetura de Persistência Offline-First Local

### Contexto & Desafio
A aplicação deve funcionar em campo (visitas a obras com internet instável ou sem sinal) e na oficina física sem depender de servidores remotos ou pagamentos de hospedagem.

### Decisão Técnica
- **Armazenamento Primário**: **IndexedDB** encapsulado por uma camada de repositório reativo TypeScript (`StorageRepository`).
- **Camada de Cache Rápido / Fallback**: **LocalStorage** para configurações da oficina (taxas horárias, dados da empresa, chave PIX) e estado do rascunho ativo.
- **Portabilidade de Dados**: Exportação e importação completa em arquivo `.json` estruturado, permitindo backup manual, transferência entre dispositivos (celular e notebook) e restauração em 1 clique.

### Racionalidade
- IndexedDB suporta armazenamento de múltiplos megabytes de dados estruturados (centenas de orçamentos, histórico de clientes e catálogos de perfis) de forma assíncrona, sem bloquear a thread da interface.
- Garantia de custo zero de infraestrutura e privacidade total dos dados da serralheria e seus clientes.

### Alternativas Consideradas
- *SQLite WASM*: Excelente portabilidade, porém adiciona ~2MB de bundle inicial e complexidade desnecessária para o volume de dados da aplicação.
- *Banco de Dados em Nuvem (Supabase / Firebase)*: Rejeitado na sessão de esclarecimento pela exigência de internet contínua e custos recorrentes.

---

## 3. Emissão de Proposta Comercial e Envio WhatsApp

### Contexto & Desafio
A proposta deve ser emitida com agilidade máxima após a visita, transmitindo profissionalismo e credibilidade, separando rigorosamente a visão interna da oficina da visão externa do cliente.

### Decisão Técnica
- **Proposta Impressa / PDF**: Layout em página A4 utilizando classes CSS dedicadas com media queries `@media print`. Disparo via método nativo `window.print()` do navegador, permitindo tanto a impressão física direta em impressoras térmicas/jato de tinta quanto a geração de PDF vetorial cristalino.
- **Disparo WhatsApp**: Função que compõe uma mensagem estruturada com formatação rica (negrito, marcadores, emojis de identificação, valores discriminados e chave PIX para sinal) e gera links automáticos `https://wa.me/55DDDNUMERO?text=...`, com botão alternativo de cópia direta para a área de transferência.

### Racionalidade
- O uso de CSS Print nativo elimina dependências pesadas e instáveis (ex.: `html2pdf.js` ou `jsPDF`), garantindo renderização vetorial com fidelidade de fontes idêntica no celular e no computador.
- O WhatsApp é o principal canal de vendas e fechamento de contratos da serralheria no Brasil.

### Alternativas Consideradas
- *Geração de PDF via Canvas*: Frequentemente quebra textos entre páginas, gera arquivos pesados (>3MB) e desfoca fontes em telas de alta resolução.

---

## 4. Stack Tecnológica e Padrão de Interface

### Decisão Técnica
- **Ambiente**: React 18 + TypeScript + Vite.
- **Estilização**: Tailwind CSS v3 com tema customizado **Industrial Slate & Amber** (`#0f172a`, `#1e293b`, `#f59e0b`).
- **Ícones**: `lucide-react`.
- **Testes**: `vitest` para testes unitários do motor de corte 1D e funções de cálculo financeiro (BDI, margem e rateio de consumíveis).

### Racionalidade
- Vite proporciona compilação instantânea, bundling leve e suporte PWA pronto para instalação no smartphone do serralheiro.
- A paleta industrial de alto contraste e tipografia limpa facilita a leitura em ambientes de oficina e sob luz solar em obras externas.
