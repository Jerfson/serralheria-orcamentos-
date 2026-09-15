import { describe, it, expect } from 'vitest';
import { calcularCustosDiretos, calcularPrecificacaoComercial } from '../../src/core/orcamentoCalculator';
import { ItemOrcamento, EmpresaConfig } from '../../src/types/orcamento';

const EMPRESA_TESTE: EmpresaConfig = {
  id: 'default',
  nomeFantasia: 'Serralheria Teste',
  documento: '00.000.000/0001-00',
  telefoneWhatsApp: '11999999999',
  endereco: 'Rua A',
  cidadeUf: 'SP',
  chavePix: 'teste@pix.com',
  tipoChavePix: 'email',
  taxaHoraOficina: 40.0,
  taxaHoraInstalacao: 50.0,
  margemLucroPadrao: 35.0,
  validadeDiasPadrao: 10,
  garantiaMesesPadrao: 12,
  termosCondicoesPadrao: 'Termos'
};

describe('Calculadora de Orçamentos e Custos de Serralheria', () => {
  it('deve somar custos de aço, insumos, mão de obra e frete no custo direto', () => {
    const item: ItemOrcamento = {
      id: 'i1',
      orcamentoId: 'o1',
      descricao: 'Portão',
      tipoEstrutura: 'portao_basculante',
      medidas: { larguraM: 3, alturaM: 2 },
      quantidadeUnidades: 1,
      acabamento: 'Primer',
      pecasDemandadas: [],
      acessorios: [
        { id: 'a1', descricao: 'Fechadura', categoria: 'fechadura', quantidade: 1, custoUnitario: 80 }
      ],
      horasFabricacao: 10, // 10 * 40 = 400
      horasInstalacao: 4,  // 4 * 50 = 200
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 0
    };

    const custoAco = 500; // 500
    const frete = 150;    // 150
    const outros = 50;    // 50
    // Mão de obra = 600
    // Acessórios = 80
    // Insumos automáticos (proporcional à área de 6m²) = ~120

    const custos = calcularCustosDiretos({
      itens: [item],
      custoAcoTotal: custoAco,
      custoFrete: frete,
      outrosCustos: outros,
      empresaConfig: EMPRESA_TESTE
    });

    expect(custos.custoAcoTotal).toBe(500);
    expect(custos.custoAcessoriosTotal).toBe(80);
    expect(custos.custoMaoDeObraTotal).toBe(600);
    expect(custos.custoFrete).toBe(150);
    expect(custos.outrosCustos).toBe(50);
    expect(custos.custoDiretoTotal).toBeGreaterThan(1300);
  });

  it('deve respeitar ajustes manuais de mão de obra ou material quando fornecidos', () => {
    const itemComAjuste: ItemOrcamento = {
      id: 'i2',
      orcamentoId: 'o1',
      descricao: 'Portão com Ajuste',
      tipoEstrutura: 'portao_basculante',
      medidas: { larguraM: 3, alturaM: 2 },
      quantidadeUnidades: 1,
      acabamento: 'Primer',
      pecasDemandadas: [],
      acessorios: [],
      horasFabricacao: 10,
      horasInstalacao: 4,
      ajustesManuais: {
        custoMaoDeObraManual: 350 // Fixado manualmente em R$ 350 em vez de R$ 600
      },
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 0
    };

    const custos = calcularCustosDiretos({
      itens: [itemComAjuste],
      custoAcoTotal: 300,
      custoFrete: 0,
      outrosCustos: 0,
      empresaConfig: EMPRESA_TESTE
    });

    expect(custos.custoMaoDeObraTotal).toBe(350);
  });

  it('deve calcular corretamente o preço de venda via Markup divisor (sobre a receita bruta)', () => {
    // Custo de R$ 2.000,00 com 40% de margem sobre a receita:
    // Preço = 2000 / (1 - 0.40) = 2000 / 0.60 = 3.333,33
    const precificacao = calcularPrecificacaoComercial({
      custoDiretoTotal: 2000,
      margemLucroPercentual: 40,
      metodoMargem: 'sobre_receita',
      descontoPercentual: 0,
      descontoValor: 0,
      condicoesPagamento: {
        tipo: 'sinal_mais_saldo',
        percentualSinal: 50,
        descricaoDetalhada: ''
      }
    });

    expect(precificacao.precoVendaBruto).toBe(3333.33);
    expect(precificacao.precoVendaFinal).toBe(3333.33);
    expect(precificacao.valorLucroEstimado).toBe(1333.33);
    expect(precificacao.condicoesPagamento.valorSinal).toBe(1666.66);
    expect(precificacao.condicoesPagamento.valorSaldoEntrega).toBe(1666.67);
  });

  it('deve aplicar descontos em reais ou porcentagem e recalcular as parcelas', () => {
    const precificacao = calcularPrecificacaoComercial({
      custoDiretoTotal: 2000,
      margemLucroPercentual: 40, // Preço bruto R$ 3.333,33
      metodoMargem: 'sobre_receita',
      descontoPercentual: 0,
      descontoValor: 333.33, // Desconto de R$ 333,33 -> Final R$ 3.000,00
      condicoesPagamento: {
        tipo: 'parcelado_cartao',
        numeroParcelas: 3,
        descricaoDetalhada: ''
      }
    });

    expect(precificacao.precoVendaFinal).toBe(3000.00);
    expect(precificacao.condicoesPagamento.valorParcela).toBe(1000.00);
  });
});
