import { TipoEstrutura, PecaLinearDemanda } from '../types/orcamento';
import { CATALOGO_MODELOS_PADRAO } from '../data/catalogoModelos';

export interface ParametrosEstrutura {
  tipo: TipoEstrutura;
  larguraM: number;
  alturaM: number;
  profundidadeM?: number;
  perfilQuadroId?: string;
  perfilPreenchimentoId?: string;
  espacamentoReguasCm?: number;
}

export interface ResultadoParametrico {
  pecasDemandadas: PecaLinearDemanda[];
  horasFabricacao: number;
  horasInstalacao: number;
  areaM2: number;
}

/**
 * Calcula a lista de corte de peças lineares de uma estrutura baseado em largura e altura
 */
export function calcularPecasEstrutura(params: ParametrosEstrutura): ResultadoParametrico {
  const modelo = CATALOGO_MODELOS_PADRAO.find(m => m.tipo === params.tipo) || CATALOGO_MODELOS_PADRAO[0];
  
  const L_mm = Math.round(params.larguraM * 1000);
  const H_mm = Math.round(params.alturaM * 1000);
  const areaM2 = Number((params.larguraM * params.alturaM).toFixed(2));

  const perfilQuadro = params.perfilQuadroId || modelo.perfilQuadroPadraoId;
  const perfilPreenchimento = params.perfilPreenchimentoId || modelo.perfilPreenchimentoPadraoId;
  const espacamentoCm = params.espacamentoReguasCm || modelo.espacamentoReguasPadraoCm;

  const pecas: PecaLinearDemanda[] = [];

  switch (params.tipo) {
    case 'portao_basculante': {
      // Requadro do portão (2 montantes verticais + 2 travessas horizontais)
      pecas.push({
        id: 'req-vert',
        descricao: 'Montante Lateral do Portão',
        perfilId: perfilQuadro,
        comprimentoMm: H_mm,
        quantidade: 2
      });
      pecas.push({
        id: 'req-horiz',
        descricao: 'Travessa Superior/Inferior do Portão',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 2
      });
      // Travessa central de reforço
      pecas.push({
        id: 'trav-central',
        descricao: 'Travessa Central de Reforço',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 1
      });

      // Réguas verticais de preenchimento (tubo 20x20)
      const numReguas = Math.max(1, Math.floor((params.larguraM * 100) / espacamentoCm) - 1);
      pecas.push({
        id: 'reguas-vert',
        descricao: 'Régua Tubular Vertical',
        perfilId: perfilPreenchimento,
        comprimentoMm: H_mm - 100, // Desconto das folgas do requadro
        quantidade: numReguas
      });
      break;
    }

    case 'portao_deslizante': {
      // Requadro externo (2 verticais + 2 horizontais)
      pecas.push({
        id: 'req-vert',
        descricao: 'Montante Vertical de Bordo',
        perfilId: perfilQuadro,
        comprimentoMm: H_mm,
        quantidade: 2
      });
      // Comprimento da base inclui rabo do portão (+ 30cm) para engate do motor
      pecas.push({
        id: 'req-base',
        descricao: 'Viga Inferior com Rabo de Motor',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm + 350,
        quantidade: 1
      });
      pecas.push({
        id: 'req-topo',
        descricao: 'Viga Superior de Fechamento',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 1
      });

      // Réguas verticais
      const numReguas = Math.max(1, Math.floor((params.larguraM * 100) / espacamentoCm) - 1);
      pecas.push({
        id: 'reguas-vert',
        descricao: 'Régua Tubular Vertical',
        perfilId: perfilPreenchimento,
        comprimentoMm: H_mm - 80,
        quantidade: numReguas
      });
      break;
    }

    case 'grade_tubo': {
      // Quadro da grade
      pecas.push({
        id: 'quadro-vert',
        descricao: 'Lateral do Quadro da Grade',
        perfilId: perfilQuadro,
        comprimentoMm: H_mm,
        quantidade: 2
      });
      pecas.push({
        id: 'quadro-horiz',
        descricao: 'Travessa Horizontal da Grade',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 2
      });

      // Barras verticais internas
      const numBarras = Math.max(1, Math.floor((params.larguraM * 100) / espacamentoCm));
      pecas.push({
        id: 'barras-vert',
        descricao: 'Barra Vertical de Segurança',
        perfilId: perfilPreenchimento,
        comprimentoMm: H_mm - 60,
        quantidade: numBarras
      });
      break;
    }

    case 'corrimao': {
      // Tubo principal superior de apoio
      pecas.push({
        id: 'tubo-apoio',
        descricao: 'Tubo de Apoio do Corrimão',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 1
      });
      // Montantes de fixação a cada 1 metro
      const numMontantes = Math.max(2, Math.ceil(params.larguraM) + 1);
      pecas.push({
        id: 'montantes-fixacao',
        descricao: 'Montante Vertical de Fixação',
        perfilId: perfilQuadro,
        comprimentoMm: 1000, // 1 metro de altura padrão NBR
        quantidade: numMontantes
      });
      // Travessas intermediárias de proteção (2 linhas)
      pecas.push({
        id: 'linhas-intermediarias',
        descricao: 'Linha Intermediária de Proteção',
        perfilId: perfilPreenchimento,
        comprimentoMm: L_mm,
        quantidade: 2
      });
      break;
    }

    case 'cobertura': {
      // Vigas principais de sustentação
      const numVigas = Math.max(2, Math.ceil(params.larguraM / 1.5) + 1);
      pecas.push({
        id: 'vigas-sustentacao',
        descricao: 'Viga Principal de Sustentação',
        perfilId: perfilQuadro,
        comprimentoMm: H_mm, // Comprimento/queda
        quantidade: numVigas
      });
      // Terças de apoio das telhas (a cada 80cm de caimento)
      const numTercas = Math.max(2, Math.ceil((params.alturaM * 100) / espacamentoCm) + 1);
      pecas.push({
        id: 'tercas-apoio',
        descricao: 'Terça de Apoio para Telhas',
        perfilId: perfilPreenchimento,
        comprimentoMm: L_mm,
        quantidade: numTercas
      });
      break;
    }

    default: {
      // Personalizado padrão: requadro de 4 lados
      pecas.push({
        id: 'quadro-vert',
        descricao: 'Perfil Vertical',
        perfilId: perfilQuadro,
        comprimentoMm: H_mm,
        quantidade: 2
      });
      pecas.push({
        id: 'quadro-horiz',
        descricao: 'Perfil Horizontal',
        perfilId: perfilQuadro,
        comprimentoMm: L_mm,
        quantidade: 2
      });
      break;
    }
  }

  // Horas estimadas
  const horasFabricacao = Number((areaM2 * modelo.horasFabricacaoBase).toFixed(1));
  const horasInstalacao = Number((areaM2 * modelo.horasInstalacaoBase).toFixed(1));

  return {
    pecasDemandadas: pecas,
    horasFabricacao: Math.max(2, horasFabricacao),
    horasInstalacao: Math.max(1, horasInstalacao),
    areaM2
  };
}
