# Implementation Plan: Banco de Dados SQLite Local com Node.js

**Branch**: `005-banco-dados-sqlite` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md) | **Data Model**: [data-model.md](./data-model.md) | **Quickstart**: [quickstart.md](./quickstart.md)

---

## Summary

Integração de um banco de dados relacional **SQLite local** persistente em arquivo de disco (`data/serralheria.db`), aproveitando o motor nativo `node:sqlite` do Node.js (disponível sem compilação nem dependências C++ externas). A solução inclui:
1. Módulo de acesso ao banco SQLite (`src/server/db.js`) com migração automática de tabelas e seed data.
2. Roteador de API REST (`src/server/apiRouter.js`) para operações CRUD de orçamentos, clientes, materiais e empresa.
3. Plugin de desenvolvimento no Vite (`vite.config.ts`) que atende `/api/*` em `npm run dev` de forma transparente na mesma porta.
4. Servidor de produção autônomo (`server.js`) para `npm run server` atendendo front compilado e API.
5. Camada cliente no frontend (`src/storage/apiClient.ts` e adaptação do `src/storage/storageRepository.ts`) com sincronização e fallback transparente para IndexedDB.
6. Badge visual no cabeçalho indicando a conexão com o SQLite.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node.js 24.x  
**Database**: SQLite nativo (`node:sqlite` - `DatabaseSync`)  
**Database File**: `data/serralheria.db`  
**API Layer**: REST JSON sobre `node:http` e middleware Vite  
**Frontend**: React 18, Vite 5, Tailwind CSS  
**Target Files**:
- `src/server/db.js`: Gerenciamento do arquivo SQLite, schemas das tabelas e operações síncronas/atômicas.
- `src/server/apiRouter.js`: Dispatcher de rotas REST `/api/*`.
- `server.js`: Servidor de produção Node.js atendendo frontend e API.
- `vite.config.ts`: Middleware de desenvolvimento integrado para `/api/*`.
- `src/storage/apiClient.ts`: Cliente HTTP frontend para falar com a API.
- `src/storage/storageRepository.ts`: Estratégia híbrida (SQLite API com fallback para IndexedDB).
- `src/App.tsx`: Exibição do indicador de status da conexão do banco.
- `package.json`: Script `"server": "node server.js"`.
- `tests/unit/sqliteDatabase.test.ts`: Testes unitários do schema e operações do SQLite.

---

## Constitution Check

| Princípio da Governança | Status | Justificativa |
| :--- | :---: | :--- |
| **I. Library-First / Modularidade** | ✅ PASS | Camada de banco `db.js` e `apiRouter.js` totalmente desacopladas do framework de visualização. |
| **II. Test-First (TDD)** | ✅ PASS | Testes unitários do SQLite e API executados com Vitest/Node. |
| **III. Simplicidade & Autonomia** | ✅ PASS | Zero dependências npm adicionais: usa `node:sqlite` e `node:http` nativos do Node 24. |
| **IV. Resiliência Operacional (Offline-First)** | ✅ PASS | Funciona 100% offline no computador do serralheiro e preserva fallback para IndexedDB. |

---

## Implementation Phases

### Phase 1: Módulo do Banco de Dados SQLite (`src/server/db.js`)
- Criar pasta `data/` para o arquivo `serralheria.db`.
- Implementar inicialização com `DatabaseSync` de `node:sqlite`.
- Criar tabelas `empresa`, `clientes`, `materiais`, `insumos`, `orcamentos`.
- Implementar seed data e métodos CRUD tipados.
- Criar testes unitários em `tests/unit/sqliteDatabase.test.ts`.

### Phase 2: Roteador da API e Integração no Vite / Server
- Implementar `src/server/apiRouter.js` para despachar rotas REST.
- Criar plugin Vite em `vite.config.ts` para servir `/api/*` em `npm run dev`.
- Criar script de produção `server.js` e adicionar comando no `package.json`.

### Phase 3: Integração no Frontend e Repositório
- Criar `src/storage/apiClient.ts`.
- Atualizar `src/storage/storageRepository.ts` para sincronizar prioritariamente com a API SQLite e manter cache em IndexedDB.
- Adicionar indicador de status de conexão no cabeçalho de `src/App.tsx`.

### Phase 4: Validação & Build
- Executar testes automatizados com `npm test`.
- Executar compilação com `npm run build`.
