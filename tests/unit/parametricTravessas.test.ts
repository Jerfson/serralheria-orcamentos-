import { describe, it, expect } from 'vitest';
import { calcularPecasEstrutura } from '../../src/core/parametricModels';

describe('Cálculo Paramétrico de Travessas Intermediárias', () => {
  it('deve gerar 1 travessa central no portão basculante quando padrão ou numeroTravessas = 1', () => {
    const resPadrao = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 3.0,
      alturaM: 2.2
    });

    const travPadrao = resPadrao.pecasDemandadas.filter(p => p.id === 'trav-central');
    expect(travPadrao.length).toBe(1);
    expect(travPadrao[0].quantidade).toBe(1);
    expect(travPadrao[0].comprimentoMm).toBe(3000);

    const res1 = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 3.0,
      alturaM: 2.2,
      numeroTravessas: 1
    });

    const trav1 = res1.pecasDemandadas.filter(p => p.id === 'trav-central');
    expect(trav1.length).toBe(1);
    expect(trav1[0].quantidade).toBe(1);
  });

  it('deve gerar 3 travessas intermediárias no portão basculante quando numeroTravessas = 3', () => {
    const res = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 3.2,
      alturaM: 2.5,
      numeroTravessas: 3
    });

    const trav = res.pecasDemandadas.filter(p => p.id === 'trav-central');
    expect(trav.length).toBe(1);
    expect(trav[0].quantidade).toBe(3);
    expect(trav[0].comprimentoMm).toBe(3200);
  });

  it('não deve gerar travessas centrais no portão basculante quando numeroTravessas = 0', () => {
    const res = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 2.5,
      alturaM: 2.0,
      numeroTravessas: 0
    });

    const trav = res.pecasDemandadas.filter(p => p.id === 'trav-central');
    expect(trav.length).toBe(0);
  });

  it('deve gerar travessas intermediárias em portão deslizante quando numeroTravessas > 0', () => {
    const resSem = calcularPecasEstrutura({
      tipo: 'portao_deslizante',
      larguraM: 4.0,
      alturaM: 2.2,
      numeroTravessas: 0
    });
    expect(resSem.pecasDemandadas.some(p => p.id === 'trav-deslizante')).toBe(false);

    const resCom = calcularPecasEstrutura({
      tipo: 'portao_deslizante',
      larguraM: 4.0,
      alturaM: 2.2,
      numeroTravessas: 2
    });
    const trav = resCom.pecasDemandadas.find(p => p.id === 'trav-deslizante');
    expect(trav).toBeDefined();
    expect(trav?.quantidade).toBe(2);
    expect(trav?.comprimentoMm).toBe(4000);
  });

  it('deve gerar travessas intermediárias em grade tubular quando numeroTravessas > 0', () => {
    const res = calcularPecasEstrutura({
      tipo: 'grade_tubo',
      larguraM: 2.0,
      alturaM: 1.8,
      numeroTravessas: 2
    });

    const trav = res.pecasDemandadas.find(p => p.id === 'trav-grade');
    expect(trav).toBeDefined();
    expect(trav?.quantidade).toBe(2);
    expect(trav?.comprimentoMm).toBe(2000);
  });

  it('deve permitir configurar quantidade de linhas no corrimão e respeitar padrão 2', () => {
    const resPadrao = calcularPecasEstrutura({
      tipo: 'corrimao',
      larguraM: 3.0,
      alturaM: 1.0
    });
    const linhasPadrao = resPadrao.pecasDemandadas.find(p => p.id === 'linhas-intermediarias');
    expect(linhasPadrao?.quantidade).toBe(2);

    const res4 = calcularPecasEstrutura({
      tipo: 'corrimao',
      larguraM: 3.0,
      alturaM: 1.0,
      numeroTravessas: 4
    });
    const linhas4 = res4.pecasDemandadas.find(p => p.id === 'linhas-intermediarias');
    expect(linhas4?.quantidade).toBe(4);
  });

  it('deve tratar valores negativos como 0 sem erros', () => {
    const res = calcularPecasEstrutura({
      tipo: 'portao_basculante',
      larguraM: 3.0,
      alturaM: 2.2,
      numeroTravessas: -2
    });
    const trav = res.pecasDemandadas.filter(p => p.id === 'trav-central');
    expect(trav.length).toBe(0);
  });
});
