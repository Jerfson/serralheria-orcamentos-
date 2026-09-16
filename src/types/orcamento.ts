import { Cliente } from './cliente';
import { AcessorioItem } from './material';

export type TipoEstrutura = 
  | 'portao_basculante' 
  | 'portao_deslizante' 
  | 'grade_tubo' 
  | 'grade_tela' 
  | 'corrimao' 
  | 'guarda_corpo' 
  | 'cobertura' 
  | 'personalizado'
  | 'fabricacao_especial';

export interface PecaLinearDemanda {
  id: string;
  descricao: string;
  perfilId: string;
  comprimentoMm: number;
  quantidade: number;
}

export interface ItemOrcamento {
  id: string;
  orcamentoId: string;
  descricao: string;
  tipoEstrutura: TipoEstrutura;
  medidas: {
    larguraM: number;
    alturaM: number;
    profundidadeM?: number;
  };
  quantidadeUnidades: number;
  acabamento: string;
  pecasDemandadas: PecaLinearDemanda[];
  acessorios: AcessorioItem[];
  horasFabricacao: number;
  horasInstalacao: number;
  ajustesManuais?: {
    custoMaterialManual?: number;
    custoMaoDeObraManual?: number;
    subtotalManual?: number;
    precoVendaManual?: number;
  };
  subtotalCustoDireto: number;
  subtotalPrecoVenda: number;
}

export interface PecaAlocadaNaBarra {
  pecaId: string;
  itemOrigemId: string;
  itemDescricao: string;
  descricaoPeca: string;
  tamanhoMm: number;
  posicaoInicioMm: number;
  posicaoFimMm: number;
}

export interface BarraCorte {
  id: string;
  numeroBarra: number;
  comprimentoTotalMm: number; // Sempre 6000
  espacoUtilizadoMm: number;
  sobraMm: number;
  aproveitavel: boolean; // Sobra >= 1000mm
  pecas: PecaAlocadaNaBarra[];
}

export interface PlanoCortePorPerfil {
  perfilId: string;
  descricaoPerfil: string;
  precoUnitarioBarra: number;
  totalPecas: number;
  comprimentoLinearTotalMm: number;
  totalBarras6mNecessarias: number;
  custoTotalPerfil: number;
  aproveitamentoPercentual: number;
  barras: BarraCorte[];
  retalhosAproveitaveisMm: number[];
}

export type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'em_producao' | 'concluido' | 'cancelado';

export interface CondicoesPagamento {
  tipo: 'a_vista_pix' | 'sinal_mais_saldo' | 'parcelado_cartao';
  percentualSinal?: number;
  valorSinal?: number;
  valorSaldoEntrega?: number;
  numeroParcelas?: number;
  valorParcela?: number;
  descricaoDetalhada: string;
}

export interface EmpresaConfig {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string;
  documento: string;
  telefoneWhatsApp: string;
  email?: string;
  endereco: string;
  cidadeUf: string;
  logoUrl?: string;
  chavePix: string;
  tipoChavePix: 'cpf' | 'cnpj' | 'celular' | 'email' | 'aleatoria';
  taxaHoraOficina: number;
  taxaHoraInstalacao: number;
  margemLucroPadrao: number;
  validadeDiasPadrao: number;
  garantiaMesesPadrao: number;
  termosCondicoesPadrao: string;
}

export interface Orcamento {
  id: string;
  numeroSequencial: number;
  dataCriacao: string;
  dataAtualizacao: string;
  validadeDias: number;
  status: StatusOrcamento;
  clienteId: string;
  clienteSnapshot: Cliente;
  itens: ItemOrcamento[];
  planoCorteConsolidado: PlanoCortePorPerfil[];

  // Custos Diretos
  custoAcoTotal: number;
  custoInsumosTotal: number;
  custoAcessoriosTotal: number;
  custoMaoDeObraTotal: number;
  custoFrete: number;
  outrosCustos: number;
  custoDiretoTotal: number;

  // Formação de Preço
  margemLucroPercentual: number;
  metodoMargem: 'sobre_receita' | 'sobre_custo';
  valorLucroEstimado: number;
  precoVendaBruto: number;
  descontoPercentual: number;
  descontoValor: number;
  precoVendaFinal: number;

  // Condições e Proposta
  condicoesPagamento: CondicoesPagamento;
  prazoEntregaDiasUteis: number;
  garantiaMeses: number;
  observacoesGerais?: string;
  textoWhatsAppFormatado: string;
}
