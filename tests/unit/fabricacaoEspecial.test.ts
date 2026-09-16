import { describe, it, expect } from 'vitest';
import { calcularCustosDiretos, calcularPrecificacaoComercial } from '../../src/core/orcamentoCalculator';
import { processarPlanoCorteConsolidado } from '../../src/core/cuttingEngine';
import { ItemOrcamento, EmpresaConfig } from '../../src/types/orcamento';
import { EMPRESA_CONFIG_PADRAO } from '../../src/storage/db';

describe('Cálculo de Custos e Precificação de Fabricação Especial (Churrasqueira, etc.)', () => {
  const empresa: EmpresaConfig = {
    ...EMPRESA_CONFIG_PADRAO,
    taxaHoraOficina: 50.00,
    taxaHoraInstalacao: 60.00
  };

  const itemChurrasqueira: ItemOrcamento = {
    id: 'item-churras-1',
    orcamentoId: 'orc-teste',
    descricao: 'Churrasqueira Parrilla em Aço Carbono com Grelha Inox',
    tipoEstrutura: 'fabricacao_especial',
    medidas: {
      larguraM: 0.80,
      alturaM: 0.90,
      profundidadeM: 0.50
    },
    quantidadeUnidades: 1,
    acabamento: 'Pintura para alta temperatura 600°C preto fosco',
    pecasDemandadas: [],
    acessorios: [
      {
        id: 'grelha-inox',
        descricao: 'Grelha Inox Moeda 75x40cm',
        categoria: 'outros',
        quantidade: 1,
        custoUnitario: 120.00
      }
    ],
    horasFabricacao: 6.0,
    horasInstalacao: 1.0,
    ajustesManuais: {
      custoMaterialManual: 380.00 // Chapas e cantoneiras
    },
    subtotalCustoDireto: 0,
    subtotalPrecoVenda: 0
  };

  it('deve calcular corretamente os custos diretos da churrasqueira considerando materiais manuais e mão de obra', () => {
    const res = calcularCustosDiretos({
      itens: [itemChurrasqueira],
      custoAcoTotal: 0, // Sem barras de corte 1D
      custoFrete: 50.00,
      outrosCustos: 0,
      empresaConfig: empresa
    });

    // Custo Material: 380.00
    expect(res.custoAcoTotal).toBe(380.00);

    // Mão de Obra: (6h * 50) + (1h * 60) = 300 + 60 = 360.00
    expect(res.custoMaoDeObraTotal).toBe(360.00);

    // Acessórios: 120.00
    expect(res.custoAcessoriosTotal).toBe(120.00);

    // Frete: 50.00
    expect(res.custoFrete).toBe(50.00);

    // Insumos: 0.80 * 0.90 = 0.72 m² * 20 = 14.40
    expect(res.custoInsumosTotal).toBe(14.40);

    // Custo Direto Total: 380 + 360 + 120 + 50 + 14.40 = 924.40
    expect(res.custoDiretoTotal).toBe(924.40);
  });

  it('deve formar preço de venda com BDI (Markup divisor) adequadamente para a churrasqueira', () => {
    const custos = calcularCustosDiretos({
      itens: [itemChurrasqueira],
      custoAcoTotal: 0,
      empresaConfig: empresa
    });

    const precificacao = calcularPrecificacaoComercial({
      custoDiretoTotal: custos.custoDiretoTotal,
      margemLucroPercentual: 40,
      metodoMargem: 'sobre_receita',
      condicoesPagamento: {
        tipo: 'a_vista_pix',
        descricaoDetalhada: 'À vista com 5% de desconto via PIX'
      }
    });

    // Preço de venda bruto: Custo / (1 - 0.40) = Custo / 0.60
    const precoEsperado = Number((custos.custoDiretoTotal / 0.60).toFixed(2));
    expect(precificacao.precoVendaBruto).toBe(precoEsperado);
    expect(precificacao.vendaComPrejuizo).toBe(false);
    expect(precificacao.valorLucroEstimado).toBeGreaterThan(0);
  });

  it('não deve falhar no processamento de corte 1D quando o item não tem barras lineares', () => {
    const plano = processarPlanoCorteConsolidado([itemChurrasqueira], []);
    expect(plano).toEqual([]);
  });

  it('deve permitir cadastrar churrasqueira com Preço Direto de Venda sem exigir cálculo de custos diretos', () => {
    const itemChurrasqueiraPrecoDireto: ItemOrcamento = {
      id: 'item-churras-direto',
      orcamentoId: 'orc-123',
      descricao: 'Churrasqueira Parrilla Sob Medida',
      tipoEstrutura: 'fabricacao_especial',
      medidas: {
        larguraM: 0.80,
        alturaM: 0.90,
        profundidadeM: 0.50
      },
      quantidadeUnidades: 1,
      acabamento: 'Pintura para alta temperatura 600°C',
      pecasDemandadas: [],
      acessorios: [],
      horasFabricacao: 0,
      horasInstalacao: 0,
      ajustesManuais: {
        precoVendaManual: 1200.00
      },
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 1200.00
    };

    const custos = calcularCustosDiretos({
      itens: [itemChurrasqueiraPrecoDireto],
      custoAcoTotal: 0,
      empresaConfig: empresa
    });

    // Sem custo direto exigido
    expect(custos.custoAcoTotal).toBe(0);
    expect(custos.custoMaoDeObraTotal).toBe(0);
    expect(custos.custoInsumosTotal).toBe(0);
    expect(custos.custoDiretoTotal).toBe(0);

    // Precificação comercial deve receber diretamente o preço de venda de R$ 1.200,00
    const precificacao = calcularPrecificacaoComercial({
      custoDiretoTotal: custos.custoDiretoTotal,
      margemLucroPercentual: 30,
      metodoMargem: 'sobre_receita',
      condicoesPagamento: {
        tipo: 'a_vista_pix',
        descricaoDetalhada: 'À vista'
      },
      valorItensPrecoDireto: 1200.00
    });

    expect(precificacao.precoVendaBruto).toBe(1200.00);
    expect(precificacao.precoVendaFinal).toBe(1200.00);
    expect(precificacao.vendaComPrejuizo).toBe(false);
  });
});
