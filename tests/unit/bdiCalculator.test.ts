import { describe, it, expect } from 'vitest';
import { calcularPrecificacaoComercial } from '../../src/core/orcamentoCalculator';

describe('Cálculos de BDI, Margem de Lucro e Condições Comerciais', () => {
  it('deve alertar venda com prejuízo se o desconto tornar o preço inferior ao custo', () => {
    const resultado = calcularPrecificacaoComercial({
      custoDiretoTotal: 1000,
      margemLucroPercentual: 20,
      descontoValor: 300, // Preço bruto 1250 - 300 = 950 (< 1000 custo)
      condicoesPagamento: {
        tipo: 'a_vista_pix',
        descricaoDetalhada: ''
      }
    });

    expect(resultado.precoVendaFinal).toBe(950);
    expect(resultado.vendaComPrejuizo).toBe(true);
    expect(resultado.valorLucroEstimado).toBe(-50);
  });

  it('deve calcular corretamente condições de entrada de 50% e saldo na instalação', () => {
    const resultado = calcularPrecificacaoComercial({
      custoDiretoTotal: 1500,
      margemLucroPercentual: 25,
      metodoMargem: 'sobre_custo', // 1500 * 1.25 = 1875
      condicoesPagamento: {
        tipo: 'sinal_mais_saldo',
        percentualSinal: 50,
        descricaoDetalhada: ''
      }
    });

    expect(resultado.precoVendaFinal).toBe(1875);
    expect(resultado.condicoesPagamento.valorSinal).toBe(937.5);
    expect(resultado.condicoesPagamento.valorSaldoEntrega).toBe(937.5);
    expect(resultado.condicoesPagamento.descricaoDetalhada).toContain('Entrada de R$ 937.50');
  });

  it('deve calcular parcelamento em até 12x no cartão de crédito', () => {
    const resultado = calcularPrecificacaoComercial({
      custoDiretoTotal: 1200,
      margemLucroPercentual: 40,
      metodoMargem: 'sobre_receita', // 1200 / 0.6 = 2000
      condicoesPagamento: {
        tipo: 'parcelado_cartao',
        numeroParcelas: 10,
        descricaoDetalhada: ''
      }
    });

    expect(resultado.precoVendaFinal).toBe(2000);
    expect(resultado.condicoesPagamento.valorParcela).toBe(200);
    expect(resultado.condicoesPagamento.descricaoDetalhada).toContain('10x de R$ 200.00');
  });
});
