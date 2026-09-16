# Data Model: Cadastro e Gestão de Materiais e Perfis

**Feature**: `003-cadastro-materiais-perfis`  
**Date**: 2026-09-16  

---

## 1. Entidades e Tipos TypeScript

### 1.1 Entidade de Perfil (`src/types/material.ts`)

```typescript
export type TipoPerfil = 
  | 'tubo_retangular' 
  | 'tubo_quadrado' 
  | 'tubo_redondo' 
  | 'cantoneira' 
  | 'barra_chata' 
  | 'perfil_u' 
  | 'ferro_t';

export interface MaterialPerfil {
  id: string;
  codigo: string;
  descricao: string;
  tipo: TipoPerfil;
  dimensoesMm: {
    largura: number;
    altura: number;
    espessuraChapaMm: number;
    polegada?: string;
  };
  comprimentoBarraMm: number; // 6000 (6,00 metros)
  pesoNominalKgPorBarra: number;
  precoBarra6m: number;
  ativo: boolean;
}
```

### 1.2 Métodos do Repositório (`src/storage/storageRepository.ts`)

```typescript
export class StorageRepository {
  // Obter todos os perfis cadastrados
  public async getMateriais(): Promise<MaterialPerfil[]>;
  
  // Salvar ou atualizar perfil existente/novo
  public async saveMaterial(material: MaterialPerfil): Promise<MaterialPerfil>;
  
  // Excluir perfil do catálogo
  public async deleteMaterial(id: string): Promise<void>;
  
  // Restaurar bitolas padrão de fábrica
  public async restaurarMateriaisPadrao(): Promise<void>;
}
```

---

## 2. Validações de Entrada para Novo Perfil

| Campo | Tipo | Regra de Validação | Exemplo |
| :--- | :--- | :--- | :--- |
| `descricao` | string | Obrigatório, mínimo 3 caracteres | "Metalon 60x40 Chapa 16 (1.50mm)" |
| `tipo` | TipoPerfil | Obrigatório, seleção entre os tipos válidos | "tubo_retangular" |
| `dimensoesMm.largura` | number | Maior que 0 | 60 |
| `dimensoesMm.altura` | number | Maior que 0 | 40 |
| `dimensoesMm.espessuraChapaMm` | number | Maior que 0 | 1.50 |
| `precoBarra6m` | number | Obrigatório, maior que 0 | 115.00 |
| `comprimentoBarraMm` | number | Fixo em 6000mm (6 metros) | 6000 |
| `ativo` | boolean | Padrão `true` | true |

---

## 3. Estimativa de Peso por Barra de 6m (Opcional Automático)

Para conveniência do usuário durante o cadastro, o sistema pode estimar o peso nominal da barra de aço carbono ($\approx 7,85 \text{ g/cm}^3$):
- **Tubo Retangular/Quadrado**: $\text{Peso} \approx 2 \times (L + H) \times e \times 7.85 \times 6 / 1000$ (kg)
- **Cantoneira**: $\text{Peso} \approx (L + H - e) \times e \times 7.85 \times 6 / 1000$ (kg)
- **Barra Chata**: $\text{Peso} \approx L \times e \times 7.85 \times 6 / 1000$ (kg)
O usuário pode aceitar a sugestão ou digitar o peso informado pelo fabricante.
