import { MaterialPerfil } from '../types/material';

export const CATALOGO_PERFIS_PADRAO: MaterialPerfil[] = [
  // Metalons Retangulares mais populares
  {
    id: 'metalon-50-30-ch18',
    codigo: 'MT-5030-18',
    descricao: 'Metalon 50x30 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 50, altura: 30, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 8.82,
    precoBarra6m: 78.50,
    ativo: true
  },
  {
    id: 'metalon-50-30-ch16',
    codigo: 'MT-5030-16',
    descricao: 'Metalon 50x30 Chapa 16 (1.50mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 50, altura: 30, espessuraChapaMm: 1.50 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 10.92,
    precoBarra6m: 96.00,
    ativo: true
  },
  {
    id: 'metalon-40-20-ch18',
    codigo: 'MT-4020-18',
    descricao: 'Metalon 40x20 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 40, altura: 20, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 6.54,
    precoBarra6m: 59.90,
    ativo: true
  },
  {
    id: 'metalon-30-20-ch18',
    codigo: 'MT-3020-18',
    descricao: 'Metalon 30x20 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 30, altura: 20, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 5.40,
    precoBarra6m: 49.50,
    ativo: true
  },
  {
    id: 'metalon-80-40-ch16',
    codigo: 'MT-8040-16',
    descricao: 'Metalon 80x40 Chapa 16 (1.50mm) - Coluna/Viga',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 80, altura: 40, espessuraChapaMm: 1.50 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 16.50,
    precoBarra6m: 148.00,
    ativo: true
  },

  // Metalons Quadrados
  {
    id: 'metalon-20-20-ch18',
    codigo: 'MT-2020-18',
    descricao: 'Metalon 20x20 Chapa 18 (1.20mm) - Régua/Grade',
    tipo: 'tubo_quadrado',
    dimensoesMm: { largura: 20, altura: 20, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 4.26,
    precoBarra6m: 39.90,
    ativo: true
  },
  {
    id: 'metalon-30-30-ch18',
    codigo: 'MT-3030-18',
    descricao: 'Metalon 30x30 Chapa 18 (1.20mm)',
    tipo: 'tubo_quadrado',
    dimensoesMm: { largura: 30, altura: 30, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 6.54,
    precoBarra6m: 58.00,
    ativo: true
  },
  {
    id: 'metalon-50-50-ch16',
    codigo: 'MT-5050-16',
    descricao: 'Metalon 50x50 Chapa 16 (1.50mm) - Coluna de Portão',
    tipo: 'tubo_quadrado',
    dimensoesMm: { largura: 50, altura: 50, espessuraChapaMm: 1.50 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 13.68,
    precoBarra6m: 124.00,
    ativo: true
  },

  // Cantoneiras de Aço Carbono
  {
    id: 'cantoneira-3-4-ch1-8',
    codigo: 'CT-34-18',
    descricao: 'Cantoneira 3/4" x 1/8" (19 x 3.17mm)',
    tipo: 'cantoneira',
    dimensoesMm: { largura: 19.05, altura: 19.05, espessuraChapaMm: 3.17, polegada: '3/4" x 1/8"' },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 5.28,
    precoBarra6m: 48.00,
    ativo: true
  },
  {
    id: 'cantoneira-1-ch1-8',
    codigo: 'CT-10-18',
    descricao: 'Cantoneira 1" x 1/8" (25.4 x 3.17mm) - Guia/Trilho',
    tipo: 'cantoneira',
    dimensoesMm: { largura: 25.4, altura: 25.4, espessuraChapaMm: 3.17, polegada: '1" x 1/8"' },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 7.20,
    precoBarra6m: 65.00,
    ativo: true
  },

  // Barras Chatas
  {
    id: 'barra-chata-3-4-ch1-8',
    codigo: 'BC-34-18',
    descricao: 'Barra Chata 3/4" x 1/8" (19 x 3.17mm)',
    tipo: 'barra_chata',
    dimensoesMm: { largura: 19.05, altura: 3.17, espessuraChapaMm: 3.17, polegada: '3/4" x 1/8"' },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 2.84,
    precoBarra6m: 29.50,
    ativo: true
  },
  {
    id: 'barra-chata-1-ch1-8',
    codigo: 'BC-10-18',
    descricao: 'Barra Chata 1" x 1/8" (25.4 x 3.17mm)',
    tipo: 'barra_chata',
    dimensoesMm: { largura: 25.4, altura: 3.17, espessuraChapaMm: 3.17, polegada: '1" x 1/8"' },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 3.78,
    precoBarra6m: 38.00,
    ativo: true
  },

  // Tubos Redondos
  {
    id: 'tubo-redondo-2pol-ch16',
    codigo: 'TR-20-16',
    descricao: 'Tubo Redondo 2" Chapa 16 (50.8mm) - Corrimão',
    tipo: 'tubo_redondo',
    dimensoesMm: { largura: 50.8, altura: 50.8, espessuraChapaMm: 1.50, polegada: '2"' },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 10.98,
    precoBarra6m: 110.00,
    ativo: true
  }
];
