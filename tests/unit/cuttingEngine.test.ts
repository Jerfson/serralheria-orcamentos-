import { describe, it, expect } from 'vitest';
import { otimizarCorte1D } from '../../src/core/cuttingEngine';

describe('Motor de Otimização de Corte 1D (Barras de 6,00 metros)', () => {
  it('deve alocar peças menores que 6m em uma única barra quando couberem com kerf de 3mm', () => {
    // 2 peças de 2.000mm e 1 peça de 1.500mm = 5.500mm + (3 * 3mm kerf) = 5.509mm <= 6.000mm
    const resultado = otimizarCorte1D({
      comprimentoBarraPadraoMm: 6000,
      kerfPerdaCorteMm: 3,
      demandas: [
        { pecaId: 'p1', perfilId: 'mt-5030', descricao: 'Montante', comprimentoMm: 2000, quantidade: 2, itemOrigemId: 'item-1' },
        { pecaId: 'p2', perfilId: 'mt-5030', descricao: 'Travessa', comprimentoMm: 1500, quantidade: 1, itemOrigemId: 'item-1' }
      ]
    });

    expect(resultado.totalBarras6m).toBe(1);
    expect(resultado.barras.length).toBe(1);
    expect(resultado.barras[0].pecas.length).toBe(3);
    // Espaço utilizado: 2000 + 3 + 2000 + 3 + 1500 + 3 = 5509mm
    expect(resultado.barras[0].espacoUtilizadoMm).toBe(5509);
    expect(resultado.barras[0].sobraMm).toBe(6000 - 5509);
  });

  it('deve abrir uma segunda barra de 6m quando a soma das peças com kerf exceder 6.000mm', () => {
    // 2 peças de 3.200mm = 6.400mm > 6.000mm. Deve usar 2 barras de 6 metros.
    const resultado = otimizarCorte1D({
      comprimentoBarraPadraoMm: 6000,
      kerfPerdaCorteMm: 3,
      demandas: [
        { pecaId: 'p1', perfilId: 'mt-5030', descricao: 'Travessa grande', comprimentoMm: 3200, quantidade: 2, itemOrigemId: 'item-1' }
      ]
    });

    expect(resultado.totalBarras6m).toBe(2);
    expect(resultado.barras.length).toBe(2);
    expect(resultado.barras[0].pecas.length).toBe(1);
    expect(resultado.barras[1].pecas.length).toBe(1);
    expect(resultado.barras[0].sobraMm).toBe(6000 - (3200 + 3));
  });

  it('deve consolidar e ordenar decrescente peças de múltiplos itens para maximizar aproveitamento', () => {
    // Item 1: 1 peça de 3.000mm e 1 peça de 2.200mm
    // Item 2: 1 peça de 3.000mm e 1 peça de 2.200mm
    // FFD deve colocar 3.000mm + 2.200mm na barra 1 (5.203mm) e 3.000mm + 2.200mm na barra 2 (5.203mm)
    const resultado = otimizarCorte1D({
      comprimentoBarraPadraoMm: 6000,
      kerfPerdaCorteMm: 3,
      demandas: [
        { pecaId: 'p1', perfilId: 'mt-5030', descricao: 'Quadro 1', comprimentoMm: 3000, quantidade: 1, itemOrigemId: 'item-1' },
        { pecaId: 'p2', perfilId: 'mt-5030', descricao: 'Coluna 1', comprimentoMm: 2200, quantidade: 1, itemOrigemId: 'item-1' },
        { pecaId: 'p3', perfilId: 'mt-5030', descricao: 'Quadro 2', comprimentoMm: 3000, quantidade: 1, itemOrigemId: 'item-2' },
        { pecaId: 'p4', perfilId: 'mt-5030', descricao: 'Coluna 2', comprimentoMm: 2200, quantidade: 1, itemOrigemId: 'item-2' }
      ]
    });

    expect(resultado.totalBarras6m).toBe(2);
    expect(resultado.barras[0].pecas.length).toBe(2);
    expect(resultado.barras[1].pecas.length).toBe(2);
  });

  it('deve classificar retalhos como aproveitáveis se forem maiores ou iguais a 1.000mm', () => {
    // Peça de 4.500mm em barra de 6.000mm sobra 1.497mm (>= 1.000mm -> aproveitável)
    const resultado = otimizarCorte1D({
      comprimentoBarraPadraoMm: 6000,
      kerfPerdaCorteMm: 3,
      demandas: [
        { pecaId: 'p1', perfilId: 'mt-5030', descricao: 'Viga', comprimentoMm: 4500, quantidade: 1, itemOrigemId: 'item-1' }
      ]
    });

    expect(resultado.barras[0].aproveitavel).toBe(true);
    expect(resultado.barras[0].sobraMm).toBeGreaterThanOrEqual(1000);
  });
});
