# Tasks: Banco de Dados SQLite Local com Node.js

**Feature Branch**: `005-banco-dados-sqlite`  
**Date**: 2026-09-16  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Phase 1: Setup & Foundation (Motor SQLite Nativo)

**Purpose**: Configurar o banco SQLite nativo e camada de dados persistente em arquivo no disco com zero dependências externas.

- [x] T001 [P] Criar `src/server/db.js` com inicialização de `data/serralheria.db` usando `node:sqlite`, criação das tabelas relacionais (`empresa`, `clientes`, `materiais`, `insumos`, `orcamentos`) e migração de seed data inicial
- [x] T002 [P] Implementar métodos CRUD em `src/server/db.js` para empresa, clientes, materiais, insumos e orçamentos
- [x] T003 [P] Criar testes unitários em `tests/unit/sqliteDatabase.test.ts` validando criação do schema, inserção, consulta e exclusão no SQLite

**Checkpoint**: Camada SQLite nativa 100% funcional e testada.

---

## Phase 2: API REST & Servidores (Vite Dev & Production)

**Purpose**: Expor a API REST na mesma porta em desenvolvimento e fornecer servidor de produção.

- [x] T004 [P] Criar `src/server/apiRouter.js` com o despachante de rotas REST `/api/*`
- [x] T005 [P] Configurar plugin de middleware no `vite.config.ts` para atender requisições `/api/*` durante `npm run dev`
- [x] T006 [P] Criar servidor de produção `server.js` e adicionar script `"server": "node server.js"` no `package.json`

**Checkpoint**: API REST respondendo em desenvolvimento e em produção.

---

## Phase 3: Integração no Frontend & Indicador de Status

**Purpose**: Conectar o frontend React ao SQLite com resiliência para IndexedDB e indicador visual no topo.

- [x] T007 [P] Criar cliente HTTP `src/storage/apiClient.ts` para comunicação com os endpoints da API
- [x] T008 [P] Atualizar `src/storage/storageRepository.ts` para gravar e ler no SQLite com fallback transparente para IndexedDB
- [x] T009 [P] Adicionar badge com status de conexão do banco no cabeçalho em `src/App.tsx` (`🟢 SQLite Conectado` / `🟠 Modo Local`)

**Checkpoint**: Frontend operando com persistência no SQLite e interface informativa.

---

## Phase 4: Validação & Build

**Purpose**: Certificar qualidade e ausência de regressões.

- [x] T010 Executar suíte completa de testes com `npm test`
- [x] T011 Executar `npm run build` para certificar integridade dos tipos TypeScript e bundle Vite
