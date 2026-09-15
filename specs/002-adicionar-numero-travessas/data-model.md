# Data Model: Configuração Paramétrica do Número de Travessas

**Feature**: `002-adicionar-numero-travessas`  
**Date**: 2026-09-15  

---

## 1. Entidades Modificadas e Tipos TypeScript

### 1.1 Modelo de Estrutura do Catálogo (`src/data/catalogoModelos.ts`)

```typescript
export interface ModeloEstrutura {
  tipo: TipoEstrutura;
  nome: string;
  descricao: string;
  perfilQuadroPadraoId: string;
  perfilPreenchimentoPadraoId: string;
  espacamentoReguasPadraoCm: number;
  horasFabricacaoBase: number;
  horasInstalacaoBase: number;
  numeroTravessasPadrao: number; // NOVO: quantidade padrão recomendada de fábrica
}
```

### 1.2 Parâmetros da Estrutura (`src/core/parametricModels.ts`)

```typescript
export interface ParametrosEstrutura {
  tipo: TipoEstrutura;
  larguraM: number;
  alturaM: number;
  profundidadeM?: number;
  perfilQuadroId?: string;
  perfilPreenchimentoId?: string;
  espacamentoReguasCm?: number;
  numeroTravessas?: number; // NOVO: número configurado pelo usuário (>= 0)
}
```

### 1.3 Resultado Paramétrico (`src/core/parametricModels.ts`)

O contrato de saída permanece com a mesma estrutura estável, mas a lista `pecasDemandadas` conterá a peça de travessa correspondente quando `numeroTravessas > 0`:

```typescript
export interface ResultadoParametrico {
  pecasDemandadas: PecaLinearDemanda[];
  horasFabricacao: number;
  horasInstalacao: number;
  areaM2: number;
}
```

Exemplo de peça injetada em `pecasDemandadas`:
```json
{
  "id": "trav-intermediaria",
  "descricao": "Travessa Intermediária de Reforço",
  "perfilId": "metalon-50-30-18",
  "comprimentoMm": 2800,
  "quantidade": 3
}
```

---

## 2. Validações e Regras de Negócio

| Atributo | Tipo | Restrições | Padrão se Omitido |
| :--- | :--- | :--- | :--- |
| `numeroTravessas` | Inteiro | $\ge 0$ e $\le 20$ | `modelo.numeroTravessasPadrao` |
| `larguraM` | Float | $0.20 \le L \le 20.00$ | Obrigatório |
| `alturaM` | Float | $0.20 \le H \le 20.00$ | Obrigatório |

---

## 3. Compatibilidade e Migração de Dados

- **Compatibilidade Retroativa (Backward-Compatible)**: Como `numeroTravessas` é um campo opcional em `ParametrosEstrutura`, qualquer função ou item existente que não passe a propriedade usará como fallback o `numeroTravessasPadrao` do catálogo.
- **Armazenamento no IndexedDB**: Como `ItemOrcamento` persiste diretamente a lista `pecasDemandadas` já calculada, os orçamentos já gravados no banco continuarão idênticos e legíveis sem necessitar de scripts de migração de schema.
