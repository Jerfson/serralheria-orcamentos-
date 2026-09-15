import { InsumoConsumivel, AcessorioItem } from '../types/material';

export const CATALOGO_INSUMOS_PADRAO: InsumoConsumivel[] = [
  {
    id: 'eletrodo-e6013-25',
    descricao: 'Eletrodo Revestido OK 46 E6013 2.50mm',
    categoria: 'solda',
    unidade: 'kg',
    custoUnitario: 32.00,
    rendimentoEstimado: 'Aprox. 0.4 kg por metro quadrado de estrutura leve'
  },
  {
    id: 'arame-mig-08',
    descricao: 'Arame de Solda MIG ER70S-6 0.8mm',
    categoria: 'solda',
    unidade: 'kg',
    custoUnitario: 28.00,
    rendimentoEstimado: 'Aprox. 0.35 kg por metro quadrado'
  },
  {
    id: 'disco-corte-4-1-2',
    descricao: 'Disco de Corte Fino 4.1/2" x 1.0mm',
    categoria: 'abrasivo',
    unidade: 'disco',
    custoUnitario: 6.50,
    rendimentoEstimado: 'Aprox. 1 disco a cada 15 cortes de metalon'
  },
  {
    id: 'disco-desbaste-4-1-2',
    descricao: 'Disco de Desbaste 4.1/2" x 1/4" para Esmerilhadeira',
    categoria: 'abrasivo',
    unidade: 'disco',
    custoUnitario: 14.00,
    rendimentoEstimado: 'Aprox. 1 disco a cada 40 pontos de solda'
  },
  {
    id: 'primer-zarcao-cinza',
    descricao: 'Primer Zarcão Anticorrosivo Cinza Serralheiro (Lata 3.6L)',
    categoria: 'pintura',
    unidade: 'lata_3.6L',
    custoUnitario: 89.00,
    rendimentoEstimado: 'Rende de 25 a 30m² por demão'
  },
  {
    id: 'tinner-diluente',
    descricao: 'Diluente Thinner para Limpeza e Diluição (900ml)',
    categoria: 'pintura',
    unidade: 'lata_900ml',
    custoUnitario: 18.00
  },
  {
    id: 'lixa-ferro-80',
    descricao: 'Folha de Lixa para Ferro Grão 80',
    categoria: 'abrasivo',
    unidade: 'unidade',
    custoUnitario: 3.50
  }
];

export const CATALOGO_ACESSORIOS_PADRAO: AcessorioItem[] = [
  {
    id: 'fechadura-bico-papagaio-tetra',
    descricao: 'Fechadura Bico de Papagaio Tetra Stam (para portão de correr)',
    categoria: 'fechadura',
    quantidade: 1,
    custoUnitario: 85.00,
    precoVendaUnitario: 140.00
  },
  {
    id: 'fechadura-sobrepor-stam',
    descricao: 'Fechadura de Sobrepor para Portão Stam 701/100',
    categoria: 'fechadura',
    quantidade: 1,
    custoUnitario: 68.00,
    precoVendaUnitario: 115.00
  },
  {
    id: 'dobradica-gonzo-3-4',
    descricao: 'Dobradiça Gonzo com Aba 3/4" com Esfera',
    categoria: 'dobradica',
    quantidade: 3,
    custoUnitario: 12.50,
    precoVendaUnitario: 22.00
  },
  {
    id: 'kit-basculante-pesos-roldanas',
    descricao: 'Kit Basculante Completo (Caixas laterais, Cabos de Aço, Roldanas 4" e Contrapesos)',
    categoria: 'kit_basculante',
    quantidade: 1,
    custoUnitario: 380.00,
    precoVendaUnitario: 580.00
  },
  {
    id: 'roldana-canal-v-3pol',
    descricao: 'Roldana de Aço Canal V 3" com Rolamento Blindado',
    categoria: 'roldana',
    quantidade: 2,
    custoUnitario: 26.00,
    precoVendaUnitario: 45.00
  },
  {
    id: 'kit-motor-basculante-1-3hp',
    descricao: 'Kit Motor Basculante Fast 1/3 HP Rossi com 2 Controles e Braço',
    categoria: 'motor',
    quantidade: 1,
    custoUnitario: 540.00,
    precoVendaUnitario: 850.00
  },
  {
    id: 'trinco-porta-cadeado-reforcado',
    descricao: 'Trinco Ferrolho Reforçado Porta Cadeado',
    categoria: 'trinco',
    quantidade: 1,
    custoUnitario: 22.00,
    precoVendaUnitario: 40.00
  }
];
