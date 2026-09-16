# Data Model: SQLite Local (`data/serralheria.db`)

**Feature Branch**: `005-banco-dados-sqlite` | **Date**: 2026-09-16

---

## 1. Esquema Relacional SQLite

O banco armazena entidades em tabelas relacionais com dados estruturados e suporte a colunas JSON para objetos complexos (como peças demandadas e snapshots de clientes):

### Tabela `empresa`
```sql
CREATE TABLE IF NOT EXISTS empresa (
  id TEXT PRIMARY KEY,
  dados_json TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
```

### Tabela `clientes`
```sql
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone_whatsapp TEXT,
  email TEXT,
  documento TEXT,
  dados_json TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
```

### Tabela `materiais`
```sql
CREATE TABLE IF NOT EXISTS materiais (
  id TEXT PRIMARY KEY,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco_barra_6m REAL NOT NULL,
  peso_barra_kg REAL,
  ativo INTEGER NOT NULL DEFAULT 1,
  dados_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria);
```

### Tabela `insumos`
```sql
CREATE TABLE IF NOT EXISTS insumos (
  id TEXT PRIMARY KEY,
  descricao TEXT NOT NULL,
  unidade TEXT NOT NULL,
  preco_unitario REAL NOT NULL,
  categoria TEXT NOT NULL,
  dados_json TEXT NOT NULL
);
```

### Tabela `orcamentos`
```sql
CREATE TABLE IF NOT EXISTS orcamentos (
  id TEXT PRIMARY KEY,
  numero_sequencial INTEGER NOT NULL UNIQUE,
  cliente_id TEXT,
  cliente_nome TEXT,
  preco_venda_final REAL NOT NULL,
  custo_direto_total REAL NOT NULL,
  status TEXT NOT NULL,
  dados_json TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orcamentos_numero ON orcamentos(numero_sequencial);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_id);
```

---

## 2. Padrão de Persistência Híbrido

- Cada tabela possui colunas indexadas para pesquisas rápidas (`nome`, `numero_sequencial`, `status`, etc.) e uma coluna `dados_json` contendo o payload completo tipado em TypeScript (`Orcamento`, `Cliente`, `MaterialPerfil`, `EmpresaConfig`).
- Isso garante máxima velocidade de leitura e escrita e compatibilidade total e imediata com os modelos de dados já desenvolvidos no frontend.
