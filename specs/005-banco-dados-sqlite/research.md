# Research: SQLite Local com Node.js no Windows

**Feature Branch**: `005-banco-dados-sqlite` | **Date**: 2026-09-16

---

## 1. Desafios de Drivers SQLite Tradicionais no Windows

Tradicionalmente, utilizar SQLite em Node.js exigia módulos nativos como `sqlite3` ou `better-sqlite3`. No Windows, esses módulos frequentemente causam falhas graves durante `npm install` caso a máquina do usuário não possua o compilador C++ (Visual Studio Build Tools) e Python instalados.

## 2. Decisão Arquitetural: Node.js Nativo `node:sqlite`

Desde o Node.js v22.5.0+, o runtime inclui o módulo oficial e nativo `node:sqlite` com suporte a `DatabaseSync`:
- **Zero dependências adicionais**: não necessita pacotes extras no `package.json`.
- **Zero compilação nativa no Windows**: binário C do SQLite já embutido no próprio executável `node.exe`.
- **Performance de ponta**: execução síncrona com WAL ativado (`PRAGMA journal_mode = WAL`), garantindo leituras concorrentes ultrarrápidas sem overhead de promessas desnecessárias no SQLite.
- **Armazenamento físico**: arquivo `data/serralheria.db`, facilmente copiável para backup e imune a limpezas de cache do navegador.

## 3. Integração com Vite em Desenvolvimento

Utilizando o hook `configureServer` em `vite.config.ts`, criamos um middleware que intercepta requisições iniciadas com `/api/`. Isso permite que o desenvolvedor execute apenas `npm run dev` e tenha tanto o bundle de frontend React quanto a API REST do SQLite respondendo na mesma porta (`localhost:5173`).
