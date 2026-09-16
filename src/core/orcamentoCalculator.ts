import { ItemOrcamento, EmpresaConfig, CondicoesPagamento } from '../types/orcamento';

export interface EntradaCustosDiretos {
  itens: ItemOrcamento[];
  custoAcoTotal: number;
  custoFrete?: number;
  outrosCustos?: number;
  empresaConfig: EmpresaConfig;
}

export interface SaidaCustosDiretos {
  custoAcoTotal: number;
  custoInsumosTotal: number;
  custoAcessoriosTotal: number;
  custoMaoDeObraTotal: number;
  custoFrete: number;
  outrosCustos: number;
  custoDiretoTotal: number;
}

export interface EntradaPrecificacao {
  custoDiretoTotal: number;
  margemLucroPercentual: number;
  metodoMargem?: 'sobre_receita' | 'sobre_custo';
  descontoPercentual?: number;
  descontoValor?: number;
  condicoesPagamento: CondicoesPagamento;
  valorItensPrecoDireto?: number;
}

export interface SaidaPrecificacao {
  precoVendaBruto: number;
  descontoPercentual: number;
  descontoValor: number;
  precoVendaFinal: number;
  valorLucroEstimado: number;
  margemEfetivaPercentual: number;
  vendaComPrejuizo: boolean;
  condicoesPagamento: CondicoesPagamento;
}

/**
 * Calcula os custos diretos da oficina (aço, insumos de solda/pintura, mão de obra, acessórios e frete)
 */
export function calcularCustosDiretos(entrada: EntradaCustosDiretos): SaidaCustosDiretos {
  const { itens, custoAcoTotal, custoFrete = 0, outrosCustos = 0, empresaConfig } = entrada;

  let totalAcessorios = 0;
  let totalMaoDeObra = 0;
  let totalMateriaisManuais = 0;
  let areaTotalM2 = 0;

  for (const item of itens) {
    // 1. Acessórios
    if (item.acessorios && item.acessorios.length > 0) {
      for (const ac of item.acessorios) {
        totalAcessorios += (ac.custoUnitario || 0) * (ac.quantidade || 1);
      }
    }

    // 2. Mão de Obra (com suporte a ajuste manual)
    if (item.ajustesManuais?.custoMaoDeObraManual !== undefined) {
      totalMaoDeObra += item.ajustesManuais.custoMaoDeObraManual;
    } else {
      const custoFab = (item.horasFabricacao || 0) * (empresaConfig.taxaHoraOficina || 45);
      const custoInst = (item.horasInstalacao || 0) * (empresaConfig.taxaHoraInstalacao || 55);
      totalMaoDeObra += custoFab + custoInst;
    }

    // 3. Materiais diretos manuais (chapas, metalon avulso ou itens especiais)
    if (item.ajustesManuais?.custoMaterialManual !== undefined) {
      totalMateriaisManuais += item.ajustesManuais.custoMaterialManual * (item.quantidadeUnidades || 1);
    }

    // Área para cálculo de insumos proporcionais (não aplica a itens com preço de venda direto fixo)
    if (!item.ajustesManuais?.precoVendaManual) {
      const area = (item.medidas.larguraM || 1) * (item.medidas.alturaM || 1) * (item.quantidadeUnidades || 1);
      areaTotalM2 += area;
    }
  }

  // 4. Insumos automáticos de serralheria proporcionais à área total (~R$ 20,00 por m²)
  const custoInsumosEstimado = Number((areaTotalM2 * 20.0).toFixed(2));
  const custoAcoTotalFinal = Number((custoAcoTotal + totalMateriaisManuais).toFixed(2));

  const custoDiretoTotal = Number((
    custoAcoTotalFinal +
    custoInsumosEstimado +
    totalAcessorios +
    totalMaoDeObra +
    custoFrete +
    outrosCustos
  ).toFixed(2));

  return {
    custoAcoTotal: custoAcoTotalFinal,
    custoInsumosTotal: custoInsumosEstimado,
    custoAcessoriosTotal: Number(totalAcessorios.toFixed(2)),
    custoMaoDeObraTotal: Number(totalMaoDeObra.toFixed(2)),
    custoFrete: Number(custoFrete.toFixed(2)),
    outrosCustos: Number(outrosCustos.toFixed(2)),
    custoDiretoTotal
  };
}

/**
 * Forma o Preço de Venda Comercial (Markup/BDI), aplica descontos e calcula parcelas
 */
export function calcularPrecificacaoComercial(entrada: EntradaPrecificacao): SaidaPrecificacao {
  const {
    custoDiretoTotal,
    margemLucroPercentual,
    metodoMargem = 'sobre_receita',
    descontoPercentual = 0,
    descontoValor = 0,
    condicoesPagamento,
    valorItensPrecoDireto = 0
  } = entrada;

  // Limitar margem sobre receita a no máximo 95% para evitar divisão por zero
  const margemLimitada = Math.min(95, Math.max(0, margemLucroPercentual));

  let precoVendaBrutoParametrico = 0;

  if (custoDiretoTotal > 0) {
    if (metodoMargem === 'sobre_receita') {
      // Preço = Custo / (1 - Margem/100)
      precoVendaBrutoParametrico = Number((custoDiretoTotal / (1 - margemLimitada / 100)).toFixed(2));
    } else {
      // Preço = Custo * (1 + Margem/100)
      precoVendaBrutoParametrico = Number((custoDiretoTotal * (1 + margemLimitada / 100)).toFixed(2));
    }
  }

  const precoVendaBruto = Number((precoVendaBrutoParametrico + valorItensPrecoDireto).toFixed(2));

  // Desconto
  let valorDescontoCalculado = 0;
  if (descontoValor > 0) {
    valorDescontoCalculado = descontoValor;
  } else if (descontoPercentual > 0) {
    valorDescontoCalculado = Number(((precoVendaBruto * descontoPercentual) / 100).toFixed(2));
  }

  const precoVendaFinal = Number(Math.max(0, precoVendaBruto - valorDescontoCalculado).toFixed(2));
  const valorLucroEstimado = Number((precoVendaFinal - custoDiretoTotal).toFixed(2));
  const margemEfetivaPercentual = precoVendaFinal > 0
    ? Number(((valorLucroEstimado / precoVendaFinal) * 100).toFixed(1))
    : 0;

  const vendaComPrejuizo = precoVendaFinal < custoDiretoTotal;

  // Atualizar condições de pagamento
  const condicoesAtualizadas: CondicoesPagamento = { ...condicoesPagamento };

  if (condicoesAtualizadas.tipo === 'sinal_mais_saldo') {
    const pctSinal = condicoesAtualizadas.percentualSinal || 50;
    const vSinal = Number(((precoVendaFinal * pctSinal) / 100).toFixed(2));
    const vSaldo = Number((precoVendaFinal - vSinal).toFixed(2));
    condicoesAtualizadas.valorSinal = vSinal;
    condicoesAtualizadas.valorSaldoEntrega = vSaldo;
    condicoesAtualizadas.descricaoDetalhada = `Entrada de R$ ${vSinal.toFixed(2)} (${pctSinal}%) no fechamento do pedido + Saldo de R$ ${vSaldo.toFixed(2)} na instalação.`;
  } else if (condicoesAtualizadas.tipo === 'parcelado_cartao') {
    const numParc = Math.max(1, condicoesAtualizadas.numeroParcelas || 1);
    const vParc = Number((precoVendaFinal / numParc).toFixed(2));
    condicoesAtualizadas.numeroParcelas = numParc;
    condicoesAtualizadas.valorParcela = vParc;
    condicoesAtualizadas.descricaoDetalhada = `Em até ${numParc}x de R$ ${vParc.toFixed(2)} sem juros no cartão de crédito.`;
  } else {
    condicoesAtualizadas.descricaoDetalhada = `Pagamento à vista via PIX com valor líquido de R$ ${precoVendaFinal.toFixed(2)}.`;
  }

  return {
    precoVendaBruto,
    descontoPercentual: descontoPercentual || 0,
    descontoValor: Number(valorDescontoCalculado.toFixed(2)),
    precoVendaFinal,
    valorLucroEstimado,
    margemEfetivaPercentual,
    vendaComPrejuizo,
    condicoesPagamento: condicoesAtualizadas
  };
}
