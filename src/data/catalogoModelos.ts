import { TipoEstrutura } from '../types/orcamento';

export interface ModeloParametricoDef {
  tipo: TipoEstrutura;
  nome: string;
  descricao: string;
  icone: string;
  perfilQuadroPadraoId: string;
  perfilPreenchimentoPadraoId: string;
  espacamentoReguasPadraoCm: number;
  horasFabricacaoBase: number; // por m²
  horasInstalacaoBase: number; // por m²
  acabamentoPadrao: string;
  acessoriosInclusosIds: string[];
}

export const CATALOGO_MODELOS_PADRAO: ModeloParametricoDef[] = [
  {
    tipo: 'portao_basculante',
    nome: 'Portão Basculante Residencial',
    descricao: 'Portão elevadiço articulado com contrapesos laterais e requadro reforçado.',
    icone: 'DoorClosed',
    perfilQuadroPadraoId: 'metalon-50-30-ch18',
    perfilPreenchimentoPadraoId: 'metalon-20-20-ch18',
    espacamentoReguasPadraoCm: 10,
    horasFabricacaoBase: 1.8,
    horasInstalacaoBase: 0.7,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: ['kit-basculante-pesos-roldanas', 'fechadura-sobrepor-stam']
  },
  {
    tipo: 'portao_deslizante',
    nome: 'Portão Deslizante (De Correr)',
    descricao: 'Portão de correr com roldanas de aço blindadas sobre trilho cantoneira.',
    icone: 'MoveHorizontal',
    perfilQuadroPadraoId: 'metalon-50-30-ch18',
    perfilPreenchimentoPadraoId: 'metalon-20-20-ch18',
    espacamentoReguasPadraoCm: 10,
    horasFabricacaoBase: 1.4,
    horasInstalacaoBase: 0.6,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: ['fechadura-bico-papagaio-tetra', 'roldana-canal-v-3pol', 'cantoneira-1-ch1-8']
  },
  {
    tipo: 'grade_tubo',
    nome: 'Grade Residencial em Tubos',
    descricao: 'Grade tubular com requadro em metalon e réguas verticais de proteção.',
    icone: 'Grid',
    perfilQuadroPadraoId: 'metalon-40-20-ch18',
    perfilPreenchimentoPadraoId: 'metalon-20-20-ch18',
    espacamentoReguasPadraoCm: 11,
    horasFabricacaoBase: 1.2,
    horasInstalacaoBase: 0.5,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: []
  },
  {
    tipo: 'corrimao',
    nome: 'Corrimão e Guarda-Corpo Metálico',
    descricao: 'Corrimão de parede ou com montantes verticais em tubo redondo de 2".',
    icone: 'Milestone',
    perfilQuadroPadraoId: 'tubo-redondo-2pol-ch16',
    perfilPreenchimentoPadraoId: 'barra-chata-3-4-ch1-8',
    espacamentoReguasPadraoCm: 12,
    horasFabricacaoBase: 1.5,
    horasInstalacaoBase: 0.8,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: []
  },
  {
    tipo: 'cobertura',
    nome: 'Cobertura Metálica / Pergolado',
    descricao: 'Estrutura para telhas termoacústicas, policarbonato ou telhas galvanizadas.',
    icone: 'Warehouse',
    perfilQuadroPadraoId: 'metalon-80-40-ch16',
    perfilPreenchimentoPadraoId: 'metalon-50-30-ch18',
    espacamentoReguasPadraoCm: 80,
    horasFabricacaoBase: 1.1,
    horasInstalacaoBase: 0.9,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: []
  },
  {
    tipo: 'personalizado',
    nome: 'Estrutura Personalizada / Sob Medida',
    descricao: 'Defina manualmente os perfis, travessas e acessórios para projetos especiais.',
    icone: 'Wrench',
    perfilQuadroPadraoId: 'metalon-50-30-ch18',
    perfilPreenchimentoPadraoId: 'metalon-30-20-ch18',
    espacamentoReguasPadraoCm: 15,
    horasFabricacaoBase: 1.5,
    horasInstalacaoBase: 0.7,
    acabamentoPadrao: 'Pintura primer anticorrosivo cinza zarcão',
    acessoriosInclusosIds: []
  }
];
