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
  comprimentoBarraMm: number; // Sempre 6000 (6,00 metros)
  pesoNominalKgPorBarra: number;
  precoBarra6m: number;
  ativo: boolean;
}

export type UnidadeInsumo = 'kg' | 'unidade' | 'lata_3.6L' | 'lata_900ml' | 'disco' | 'rolo' | 'metro';

export interface InsumoConsumivel {
  id: string;
  descricao: string;
  categoria: 'solda' | 'abrasivo' | 'pintura' | 'fixacao' | 'outros';
  unidade: UnidadeInsumo;
  custoUnitario: number;
  rendimentoEstimado?: string;
}

export interface AcessorioItem {
  id: string;
  descricao: string;
  categoria: 'fechadura' | 'dobradica' | 'roldana' | 'kit_basculante' | 'motor' | 'trinco' | 'cremalheira' | 'outros';
  quantidade: number;
  custoUnitario: number;
  precoVendaUnitario?: number;
}
