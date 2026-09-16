import { describe, it, expect, beforeEach } from 'vitest';
import { storageRepository } from '../../src/storage/storageRepository';
import { MaterialPerfil } from '../../src/types/material';

describe('Repositório de Materiais & Perfis de Aço', () => {
  beforeEach(async () => {
    await storageRepository.ensureSeedData();
  });

  it('deve carregar os materiais padrão de fábrica com preços da barra de 6m', async () => {
    const materiais = await storageRepository.getMateriais();
    expect(materiais.length).toBeGreaterThan(5);

    const metalon5030 = materiais.find(m => m.id === 'metalon-50-30-ch18');
    expect(metalon5030).toBeDefined();
    expect(metalon5030?.precoBarra6m).toBeGreaterThan(0);
    expect(metalon5030?.comprimentoBarraMm).toBe(6000);
  });

  it('deve atualizar o preço da barra de 6m de um perfil existente', async () => {
    const materiais = await storageRepository.getMateriais();
    const perfil = materiais[0];
    const novoPreco = 99.50;

    const atualizado: MaterialPerfil = {
      ...perfil,
      precoBarra6m: novoPreco
    };

    await storageRepository.saveMaterial(atualizado);

    const materiaisApos = await storageRepository.getMateriais();
    const perfilSalvo = materiaisApos.find(m => m.id === perfil.id);
    expect(perfilSalvo?.precoBarra6m).toBe(novoPreco);
  });

  it('deve cadastrar um novo perfil de metalon com sucesso', async () => {
    const novoMetalon: MaterialPerfil = {
      id: 'metalon-60-40-ch16-teste',
      codigo: 'MT-6040-16',
      descricao: 'Metalon 60x40 Chapa 16 (1.50mm) Teste',
      tipo: 'tubo_retangular',
      dimensoesMm: { largura: 60, altura: 40, espessuraChapaMm: 1.50 },
      comprimentoBarraMm: 6000,
      pesoNominalKgPorBarra: 13.50,
      precoBarra6m: 125.00,
      ativo: true
    };

    await storageRepository.saveMaterial(novoMetalon);

    const materiais = await storageRepository.getMateriais();
    const encontrado = materiais.find(m => m.id === novoMetalon.id);
    expect(encontrado).toBeDefined();
    expect(encontrado?.descricao).toBe('Metalon 60x40 Chapa 16 (1.50mm) Teste');
    expect(encontrado?.precoBarra6m).toBe(125.00);

    // Limpar
    await storageRepository.deleteMaterial(novoMetalon.id);
    const materiaisFinais = await storageRepository.getMateriais();
    expect(materiaisFinais.some(m => m.id === novoMetalon.id)).toBe(false);
  });

  it('deve permitir desativar e reativar um material', async () => {
    const materiais = await storageRepository.getMateriais();
    const perfil = materiais[0];

    const desativado: MaterialPerfil = {
      ...perfil,
      ativo: false
    };

    await storageRepository.saveMaterial(desativado);
    let lista = await storageRepository.getMateriais();
    expect(lista.find(m => m.id === perfil.id)?.ativo).toBe(false);

    const reativado: MaterialPerfil = {
      ...perfil,
      ativo: true
    };
    await storageRepository.saveMaterial(reativado);
    lista = await storageRepository.getMateriais();
    expect(lista.find(m => m.id === perfil.id)?.ativo).toBe(true);
  });
});
