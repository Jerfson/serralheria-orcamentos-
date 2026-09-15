import { BarraCorte, PecaAlocadaNaBarra, PlanoCortePorPerfil, PecaLinearDemanda } from '../types/orcamento';
import { MaterialPerfil } from '../types/material';

export interface DemandaCorteItem {
  pecaId: string;
  perfilId: string;
  descricao: string;
  comprimentoMm: number;
  quantidade: number;
  itemOrigemId: string;
  itemDescricao?: string;
}

export interface EntradaCorte1D {
  comprimentoBarraPadraoMm?: number;
  kerfPerdaCorteMm?: number;
  demandas: DemandaCorteItem[];
}

export interface SaidaCorte1D {
  totalBarras6m: number;
  comprimentoLinearTotalMm: number;
  aproveitamentoPercentual: number;
  barras: BarraCorte[];
  retalhosAproveitaveisMm: number[];
}

/**
 * Algoritmo de Otimização de Corte Linear 1D (First-Fit Decreasing)
 * Considera barras comerciais de 6.000 mm e perda física da serra (kerf) por corte.
 */
export function otimizarCorte1D(entrada: EntradaCorte1D): SaidaCorte1D {
  const L_BARRA = entrada.comprimentoBarraPadraoMm || 6000;
  const KERF = entrada.kerfPerdaCorteMm !== undefined ? entrada.kerfPerdaCorteMm : 3;

  // 1. Expandir todas as demandas em unidades individuais de peças
  interface PecaIndividual {
    pecaId: string;
    itemOrigemId: string;
    itemDescricao: string;
    descricaoPeca: string;
    tamanhoMm: number;
  }

  const pecasIndividuais: PecaIndividual[] = [];
  let comprimentoLinearTotalMm = 0;

  for (const dem of entrada.demandas) {
    if (dem.comprimentoMm <= 0 || dem.quantidade <= 0) continue;

    for (let q = 0; q < dem.quantidade; q++) {
      pecasIndividuais.push({
        pecaId: `${dem.pecaId}-${q + 1}`,
        itemOrigemId: dem.itemOrigemId,
        itemDescricao: dem.itemDescricao || 'Item',
        descricaoPeca: dem.descricao,
        tamanhoMm: dem.comprimentoMm
      });
      comprimentoLinearTotalMm += dem.comprimentoMm;
    }
  }

  if (pecasIndividuais.length === 0) {
    return {
      totalBarras6m: 0,
      comprimentoLinearTotalMm: 0,
      aproveitamentoPercentual: 0,
      barras: [],
      retalhosAproveitaveisMm: []
    };
  }

  // 2. Ordenação Decrescente (Heurística FFD)
  pecasIndividuais.sort((a, b) => b.tamanhoMm - a.tamanhoMm);

  // 3. Alocação em barras
  const barras: BarraCorte[] = [];

  for (const peca of pecasIndividuais) {
    let alocado = false;

    // Tentar encontrar uma barra já aberta com espaço
    for (const barra of barras) {
      const espacoNecessario = peca.tamanhoMm + KERF;
      const espacoDisponivel = L_BARRA - barra.espacoUtilizadoMm;

      if (espacoDisponivel >= espacoNecessario) {
        const posInicio = barra.espacoUtilizadoMm;
        const posFim = posInicio + peca.tamanhoMm;

        barra.pecas.push({
          pecaId: peca.pecaId,
          itemOrigemId: peca.itemOrigemId,
          itemDescricao: peca.itemDescricao,
          descricaoPeca: peca.descricaoPeca,
          tamanhoMm: peca.tamanhoMm,
          posicaoInicioMm: posInicio,
          posicaoFimMm: posFim
        });

        barra.espacoUtilizadoMm += espacoNecessario;
        barra.sobraMm = L_BARRA - barra.espacoUtilizadoMm;
        barra.aproveitavel = barra.sobraMm >= 1000;
        alocado = true;
        break;
      }
    }

    // Se não couber em nenhuma barra aberta, abrir uma nova barra de 6m
    if (!alocado) {
      const novaBarraNum = barras.length + 1;
      const posInicio = 0;
      const posFim = peca.tamanhoMm;
      const espacoUtilizado = peca.tamanhoMm + KERF;
      const sobra = L_BARRA - espacoUtilizado;

      const novaBarra: BarraCorte = {
        id: `barra-${novaBarraNum}`,
        numeroBarra: novaBarraNum,
        comprimentoTotalMm: L_BARRA,
        espacoUtilizadoMm: espacoUtilizado,
        sobraMm: sobra,
        aproveitavel: sobra >= 1000,
        pecas: [
          {
            pecaId: peca.pecaId,
            itemOrigemId: peca.itemOrigemId,
            itemDescricao: peca.itemDescricao,
            descricaoPeca: peca.descricaoPeca,
            tamanhoMm: peca.tamanhoMm,
            posicaoInicioMm: posInicio,
            posicaoFimMm: posFim
          }
        ]
      };

      barras.push(novaBarra);
    }
  }

  // 4. Calcular métricas consolidadas
  const totalBarras6m = barras.length;
  const capacidadeTotalMm = totalBarras6m * L_BARRA;
  const aproveitamentoPercentual = capacidadeTotalMm > 0
    ? Number(((comprimentoLinearTotalMm / capacidadeTotalMm) * 100).toFixed(1))
    : 0;

  const retalhosAproveitaveisMm = barras
    .filter(b => b.aproveitavel)
    .map(b => b.sobraMm);

  return {
    totalBarras6m,
    comprimentoLinearTotalMm,
    aproveitamentoPercentual,
    barras,
    retalhosAproveitaveisMm
  };
}

/**
 * Consolida e otimiza todas as peças de um orçamento agrupadas por tipo de perfil de aço
 */
export function processarPlanoCorteConsolidado(
  itens: { id: string; descricao: string; pecasDemandadas: PecaLinearDemanda[] }[],
  catalogoMateriais: MaterialPerfil[]
): PlanoCortePorPerfil[] {
  // 1. Agrupar demandas por perfilId
  const demandasPorPerfil = new Map<string, DemandaCorteItem[]>();

  for (const item of itens) {
    for (const peca of item.pecasDemandadas) {
      if (!demandasPorPerfil.has(peca.perfilId)) {
        demandasPorPerfil.set(peca.perfilId, []);
      }
      demandasPorPerfil.get(peca.perfilId)!.push({
        pecaId: peca.id,
        perfilId: peca.perfilId,
        descricao: peca.descricao,
        comprimentoMm: peca.comprimentoMm,
        quantidade: peca.quantidade,
        itemOrigemId: item.id,
        itemDescricao: item.descricao
      });
    }
  }

  const resultadoConsolidado: PlanoCortePorPerfil[] = [];

  for (const [perfilId, demandas] of demandasPorPerfil.entries()) {
    const perfil = catalogoMateriais.find(m => m.id === perfilId);
    const precoBarra = perfil ? perfil.precoBarra6m : 0;
    const descPerfil = perfil ? perfil.descricao : perfilId;

    const saida = otimizarCorte1D({
      comprimentoBarraPadraoMm: 6000,
      kerfPerdaCorteMm: 3,
      demandas
    });

    const totalPecas = demandas.reduce((acc, cur) => acc + cur.quantidade, 0);

    resultadoConsolidado.push({
      perfilId,
      descricaoPerfil: descPerfil,
      precoUnitarioBarra: precoBarra,
      totalPecas,
      comprimentoLinearTotalMm: saida.comprimentoLinearTotalMm,
      totalBarras6mNecessarias: saida.totalBarras6m,
      custoTotalPerfil: Number((saida.totalBarras6m * precoBarra).toFixed(2)),
      aproveitamentoPercentual: saida.aproveitamentoPercentual,
      barras: saida.barras,
      retalhosAproveitaveisMm: saida.retalhosAproveitaveisMm
    });
  }

  return resultadoConsolidado;
}
