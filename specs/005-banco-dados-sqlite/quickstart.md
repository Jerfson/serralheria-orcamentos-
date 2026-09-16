# Quickstart: Banco de Dados SQLite Local

**Feature Branch**: `005-banco-dados-sqlite` | **Date**: 2026-09-16

---

## 1. Como Iniciar o Sistema com SQLite

### Modo Desenvolvimento:
```bash
npm run dev
```
O Vite iniciará na porta `5173`. O banco de dados SQLite local será criado automaticamente em `data/serralheria.db` e todas as rotas `/api/*` responderão instantaneamente.

### Modo Servidor de Produção:
```bash
npm run build
npm run server
```
O servidor Node.js iniciará na porta `3000` (ou `PORT`), servindo a aplicação web otimizada e o banco de dados SQLite.

---

## 2. Onde Ficam os Dados?

O arquivo de banco de dados fica localizado na raiz do projeto:
`data/serralheria.db`

Para fazer backup manual dos orçamentos e clientes, basta copiar o arquivo `serralheria.db` para um pen drive ou nuvem.

---

## 3. Endpoints Disponíveis da API

- `GET /api/status` - Retorna status de conexão e total de registros.
- `GET /api/empresa` / `PUT /api/empresa` - Dados da serralheria e termos comerciais.
- `GET /api/clientes` / `POST /api/clientes` / `DELETE /api/clientes/:id` - Gestão de clientes.
- `GET /api/materiais` / `POST /api/materiais` / `DELETE /api/materiais/:id` - Catálogo de perfis e preços de barras de 6m.
- `GET /api/orcamentos` / `POST /api/orcamentos` / `DELETE /api/orcamentos/:id` - Orçamentos salvos.
