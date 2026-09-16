# Data Model: Fabricação Especial e Peças Sob Medida

**Feature**: `004-item-fabricacao-especial`  
**Date**: 2026-09-16  

---

## 1. Entidades e Tipos Modificados

### 1.1 Extensão do Tipo de Estrutura (`src/types/orcamento.ts`)

```typescript
export type TipoEstrutura = 
  | 'portao_basculante' 
  | 'portao_deslizante' 
  | 'grade_tubo' 
  | 'grade_tela' 
  | 'corrimao' 
  | 'guarda_corpo' 
  | 'cobertura' 
  | 'personalizado'
  | 'fabricacao_especial'; // NOVO: Churrasqueiras, bancadas, mesas, coifas, etc.
```

### 1.2 Estrutura do Item de Orçamento Especial (`ItemOrcamento`)

Exemplo de objeto persistido para uma churrasqueira:

```json
{
  "id": "item-churras-17264890",
  "orcamentoId": "orc-101",
  "descricao": "Churrasqueira Parrilla em Aço Carbono com Grelha Inox",
  "tipoEstrutura": "fabricacao_especial",
  "medidas": {
    "larguraM": 0.80,
    "alturaM": 0.90,
    "profundidadeM": 0.50
  },
  "quantidadeUnidades": 1,
  "acabamento": "Pintura para alta temperatura 600°C preto fosco",
  "pecasDemandadas": [],
  "acessorios": [],
  "horasFabricacao": 6.0,
  "horasInstalacao": 1.0,
  "ajustesManuais": {
    "custoMaterialManual": 380.00
  },
  "subtotalCustoDireto": 745.00,
  "subtotalPrecoVenda": 1241.67
}
```

### 1.3 Modelos Sugeridos de Fábrica para Agilidade (Presets)

Criaremos uma lista de atalhos rápidos para pré-preenchimento no construtor:

```typescript
export interface SugestaoFabricacaoEspecial {
  id: string;
  nome: string;
  descricaoPadrao: string;
  larguraM: number;
  alturaM: number;
  profundidadeM: number;
  custoMaterialSugerido: number;
  horasFabricacaoSugeridas: number;
  horasInstalacaoSugeridas: number;
  acabamentoSugerido: string;
}
```

Exemplos de sugestões:
1. **Churrasqueira Parrilla em Aço**: 0,80m x 0,90m x 0,50m | R$ 380,00 mat. | 6h bancada | Pintura 600°C
2. **Churrasqueira Bafo em Tambor com Rodízios**: 0,90m x 1,00m x 0,60m | R$ 280,00 mat. | 5h bancada | Pintura alta temperatura
3. **Mesa / Bancada Industrial em Metalon**: 1,50m x 0,85m x 0,70m | R$ 220,00 mat. | 4h bancada | Pintura primer cinza
4. **Lixeira Reforçada de Calçada**: 1,00m x 1,20m x 0,50m | R$ 160,00 mat. | 3h bancada | Esmalte sintético preto
