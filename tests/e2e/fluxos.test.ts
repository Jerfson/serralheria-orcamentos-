import { describe, it, expect } from 'vitest';
import { calcularPecasEstrutura } from '../../src/core/parametricModels';
import { processarPlanoCorteConsolidado } from '../../src/core/cuttingEngine';
import { calcularCustosDiretos, calcularPrecificacaoComercial } from '../../src/core/orcamentoCalculator';
import { CATALOGO_PERFIS_PADRAO } from '../../src/data/catalogoPerfis';
import { EMPRESA_CONFIG_PADRAO } from '../../src/storage/db';
import { gerarMensagemWhatsApp } from '../../src/services/whatsappService';
import { Orcamento, ItemOrcamento } from '../../src/types/orcamento';

describe('Validação End-to-End do Guia Quickstart (Serralheria Pro)', () => {
  it('Cenário 1: Quantificação de Barras de 6m com Kerf de 3mm para Portão 3.00m x 2.20m', () => {
    const pecas = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 3.0,
      alturaM: 2.2
    });

    expect(pecas.pecasDemandadas.length).toBeGreaterThan(0);

    const item: ItemOrcamento = {
      id: 'item-portao-1',
      orcamentoId: 'orc-1',
      descricao: 'Portão Basculante Residencial',
      tipoEstrutura: 'portao_basculante',
      medidas: { larguraM: 3.0, alturaM: 2.2 },
      quantidadeUnidades: 1,
      acabamento: 'Primer zarcão cinza',
      pecasDemandadas: pecas.pecasDemandadas,
      acessorios: [],
      horasFabricacao: pecas.horasFabricacao,
      horasInstalacao: pecas.horasInstalacao,
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 0
    };

    const plano = processarPlanoCorteConsolidado([item], CATALOGO_PERFIS_PADRAO);

    // Deve ter plano para o metalon 50x30 (requadro) e para o 20x20 (réguas)
    const perfilRequadro = plano.find(p => p.perfilId === 'metalon-50-30-ch18');
    expect(perfilRequadro).toBeDefined();
    expect(perfilRequadro!.totalBarras6mNecessarias).toBeGreaterThanOrEqual(2);
    expect(perfilRequadro!.aproveitamentoPercentual).toBeGreaterThan(0);
  });

  it('Cenário 2 & 3: Composição de Custos, BDI de 35% e Condições de Pagamento', () => {
    const item: ItemOrcamento = {
      id: 'i1',
      orcamentoId: 'orc-1',
      descricao: 'Portão Basculante',
      tipoEstrutura: 'portao_basculante',
      medidas: { larguraM: 3.0, alturaM: 2.2 },
      quantidadeUnidades: 1,
      acabamento: 'Primer',
      pecasDemandadas: [],
      acessorios: [
        { id: 'ac1', descricao: 'Kit Basculante', categoria: 'kit_basculante', quantidade: 1, custoUnitario: 380 }
      ],
      horasFabricacao: 12,
      horasInstalacao: 4,
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 0
    };

    const custos = calcularCustosDiretos({
      itens: [item],
      custoAcoTotal: 600,
      custoFrete: 120,
      outrosCustos: 50,
      empresaConfig: EMPRESA_CONFIG_PADRAO
    });

    expect(custos.custoDiretoTotal).toBeGreaterThan(1500);

    const precificacao = calcularPrecificacaoComercial({
      custoDiretoTotal: 2400,
      margemLucroPercentual: 35,
      metodoMargem: 'sobre_receita',
      descontoValor: 100,
      condicoesPagamento: {
        tipo: 'sinal_mais_saldo',
        percentualSinal: 50,
        descricaoDetalhada: ''
      }
    });

    // 2400 / 0.65 = 3692.31
    expect(precificacao.precoVendaBruto).toBe(3692.31);
    expect(precificacao.precoVendaFinal).toBe(3592.31);
    expect(precificacao.condicoesPagamento.valorSinal).toBe(1796.15);
  });

  it('Cenário 4: Segregação e Mensagem WhatsApp sem Vazamento de Custos Internos', () => {
    const orcamentoMock: Orcamento = {
      id: 'orc-101',
      numeroSequencial: 101,
      dataCriacao: '2026-09-14T00:00:00.000Z',
      dataAtualizacao: '2026-09-14T00:00:00.000Z',
      validadeDias: 10,
      status: 'enviado',
      clienteId: 'c1',
      clienteSnapshot: {
        id: 'c1',
        nome: 'Carlos Mendes',
        telefoneWhatsApp: '11988887777',
        enderecoObra: { logradouro: 'Rua das Flores', numero: '50', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' },
        dataCadastro: '',
        dataAtualizacao: ''
      },
      itens: [
        {
          id: 'item-1',
          orcamentoId: 'orc-101',
          descricao: 'Portão Basculante com Social',
          tipoEstrutura: 'portao_basculante',
          medidas: { larguraM: 3, alturaM: 2.2 },
          quantidadeUnidades: 1,
          acabamento: 'Primer zarcão cinza',
          pecasDemandadas: [],
          acessorios: [],
          horasFabricacao: 12,
          horasInstalacao: 4,
          subtotalCustoDireto: 1200,
          subtotalPrecoVenda: 2500
        }
      ],
      planoCorteConsolidado: [],
      custoAcoTotal: 500,
      custoInsumosTotal: 150,
      custoAcessoriosTotal: 80,
      custoMaoDeObraTotal: 700,
      custoFrete: 100,
      outrosCustos: 0,
      custoDiretoTotal: 1530,
      margemLucroPercentual: 40,
      metodoMargem: 'sobre_receita',
      valorLucroEstimado: 1020,
      precoVendaBruto: 2550,
      descontoPercentual: 0,
      descontoValor: 0,
      precoVendaFinal: 2550,
      condicoesPagamento: {
        tipo: 'sinal_mais_saldo',
        percentualSinal: 50,
        valorSinal: 1275,
        valorSaldoEntrega: 1275,
        descricaoDetalhada: '50% entrada e saldo na instalação'
      },
      prazoEntregaDiasUteis: 15,
      garantiaMeses: 12,
      textoWhatsAppFormatado: ''
    };

    const msg = gerarMensagemWhatsApp(orcamentoMock, EMPRESA_CONFIG_PADRAO);

    // O texto deve conter dados comerciais e PIX
    expect(msg).toContain('PROPOSTA COMERCIAL');
    expect(msg).toContain('Carlos Mendes');
    expect(msg).toContain('2.550,00');
    expect(msg).toContain('Chave PIX');

    // NUNCA deve conter menção a margem de lucro ou custo interno
    expect(msg).not.toContain('Custo Direto');
    expect(msg).not.toContain('Lucro Estimado');
    expect(msg).not.toContain('1.530');
  });
});
