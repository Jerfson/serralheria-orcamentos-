# Feature Specification: Banco de Dados SQLite Local com Node.js

**Feature Branch**: `005-banco-dados-sqlite`  
**Created**: 2026-09-16  
**Status**: Ready for Plan  
**Input**: Adicionar banco de dados SQLite local em arquivo .db gerenciado por servidor Node.js com persistência permanente no computador.

---

## Overview

Atualmente, o sistema de orçamentos de serralheria armazena dados primariamente no navegador do usuário via IndexedDB e LocalStorage. Para garantir que os orçamentos, clientes, perfis de metalon e configurações da oficina nunca sejam perdidos ao limpar o histórico do navegador ou trocar de aba, esta especificação introduz um **Banco de Dados SQLite Local** persistido em arquivo no disco (`data/serralheria.db`), acoplado a uma API REST local em Node.js (`node:sqlite`) que funciona 100% offline, com zero dependências externas pesadas e com sincronização automática com o frontend React.

---

## User Scenarios & Testing

### User Story 1 - Persistência Permanente de Orçamentos e Clientes no SQLite (Priority: P1) 🎯 MVP

Como serralheiro ou gestor da oficina, quero que todos os orçamentos que eu crio, duplico ou edito fiquem salvos em um banco de dados de verdade em arquivo no meu computador (`serralheria.db`), para que eu nunca corra risco de perder orçamentos importantes ao fechar o navegador ou limpar cookies.

**Why this priority**: É a garantia máxima de segurança dos dados de clientes, propostas e histórico de preços da serralheria.

**Independent Test**: Criar um orçamento no sistema, reiniciar o navegador, e verificar que o orçamento foi persistido fisicamente na tabela `orcamentos` do banco `data/serralheria.db`.

**Acceptance Scenarios**:
1. **Given** que o sistema está em execução com o banco SQLite ativo, **When** o usuário clica em "Salvar Orçamento", **Then** o registro completo com itens, valores, cliente e plano de corte é gravado na tabela `orcamentos` do SQLite.
2. **Given** que existem orçamentos gravados no SQLite, **When** a aplicação é aberta em qualquer navegador ou após limpar os dados de navegação, **Then** todos os orçamentos anteriores são carregados imediatamente da API SQLite.

---

### User Story 2 - API Local Integrada com Zero Configuração (Priority: P1)

Como usuário executando o sistema (`npm run dev` ou `npm start`), quero que o servidor do banco de dados SQLite inicie automaticamente sem exigir instalação de MySQL, PostgreSQL, Docker ou configurações complexas de rede.

**Why this priority**: Um sistema para serralheria deve ser ágil de instalar e rodar, aproveitando o motor nativo `node:sqlite` do Node.js.

**Independent Test**: Executar `npm run dev` e fazer requisições HTTP para `/api/orcamentos`, `/api/materiais` e `/api/clientes`, recebendo status `200 OK` com dados JSON.

**Acceptance Scenarios**:
1. **Given** a execução via `npm run dev`, **When** o Vite inicializa, **Then** os middlewares de API do SQLite são expostos na mesma porta (`/api/*`).
2. **Given** a execução via `node server.js` em modo de produção, **Then** o servidor atende tanto os arquivos estáticos compilados quanto os endpoints da API SQLite.

---

### User Story 3 - Resiliência e Fallback Offline (Priority: P2)

Como usuário operando em contingência, se o servidor Node estiver indisponível por qualquer razão no momento, o frontend deve continuar funcionando normalmente usando o IndexedDB local e alertar o usuário com um indicador visual.

**Why this priority**: Evita bloqueio da oficina ou perda de agilidade se o backend for reiniciado.

**Independent Test**: Desconectar ou parar o backend e verificar que o frontend continua permitindo calcular orçamentos e emitir propostas com aviso de "Modo Local".

**Acceptance Scenarios**:
1. **Given** que a API SQLite responde com sucesso, **Then** o cabeçalho exibe o status `🟢 SQLite Conectado`.
2. **Given** que a API SQLite não está acessível, **Then** o sistema utiliza o cache local do IndexedDB e exibe `🟠 Modo Local (Navegador)`.

---

### User Story 4 - Indicador Visual e Gerenciamento do Banco de Dados (Priority: P3)

Como gestor da serralheria, quero ver no cabeçalho ou rodapé o status do banco de dados e ter facilidade para visualizar o caminho do arquivo `.db`.

**Why this priority**: Traz transparência e confiança ao serralheiro sobre onde seus dados estão armazenados.

**Independent Test**: Olhar o topo da aplicação e ver a indicação clara do status do banco SQLite.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE criar e gerenciar um banco de dados SQLite no arquivo `data/serralheria.db`.
- **FR-002**: O esquema inicial do SQLite DEVE conter tabelas estruturadas:
  - `empresa`: id, dados da serralheria, chave PIX, taxas horárias e margem padrão (JSON/colunas).
  - `clientes`: id, nome, telefone, email, documento, endereco_obra (JSON), datas.
  - `materiais`: id, categoria, descricao, preco_barra_6m, peso, secao, espessura, ativo.
  - `insumos`: id, descricao, unidade, preco_unitario, categoria.
  - `orcamentos`: id, numero_sequencial, cliente_id, cliente_snapshot (JSON), itens (JSON), custos (JSON), preco_venda, status, datas.
- **FR-003**: O backend DEVE usar a biblioteca nativa `node:sqlite` do Node.js, dispensando compilação de pacotes C++ externos no Windows.
- **FR-004**: O sistema DEVE prover endpoints REST JSON:
  - `GET /api/status`: status de conexão, contagem de registros e versão do SQLite.
  - `GET /api/empresa` e `PUT /api/empresa`: leitura e atualização da empresa.
  - `GET /api/clientes`, `POST /api/clientes`, `DELETE /api/clientes/:id`.
  - `GET /api/materiais`, `POST /api/materiais`, `DELETE /api/materiais/:id`.
  - `GET /api/orcamentos`, `GET /api/orcamentos/:id`, `POST /api/orcamentos`, `DELETE /api/orcamentos/:id`.
- **FR-005**: O sistema DEVE popular automaticamente o banco com os materiais padrão de metalon/ferro e configurações da JRV no primeiro arranque se as tabelas estiverem vazias.
- **FR-006**: O `storageRepository.ts` no frontend DEVE conectar-se à API `/api/*` como fonte primária e manter sincronização com o banco local IndexedDB.
- **FR-007**: O sistema DEVE incluir no `package.json` script para rodar o servidor standalone (`npm run server`).

---

## Edge Cases

- **Primeira execução**: Se o diretório `data/` ou o arquivo `serralheria.db` não existirem, o sistema deve criá-los automaticamente.
- **Caracteres especiais e acentos**: Nomes como "São Paulo", "Churrasqueira a Bafo" e "primer anticorrosivo zarcão" devem ser tratados com encoding UTF-8 íntegro no SQLite.
- **Concorrência ou múltiplas abas**: O SQLite com WAL (Write-Ahead Logging) ativado suporta leituras e escritas concorrentes com segurança.
- **Tamanho de payload**: Orçamentos com dezenas de itens e plano de corte detalhado devem ser salvos sem limite restritivo de tamanho.
