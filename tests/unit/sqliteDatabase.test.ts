import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SerralheriaSqliteDB } from '../../src/server/db.js';
import { StatusOrcamento } from '../../src/types/orcamento';
import { TipoPerfil } from '../../src/types/material';

describe('Banco de Dados Relacional SQLite Local (node:sqlite)', () => {
  let db: SerralheriaSqliteDB;

  beforeEach(() => {
    // Usar banco em memória para isolar cada teste
    db = new SerralheriaSqliteDB(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('deve inicializar o schema com seed data padrão de empresa, materiais e clientes', () => {
    const status = db.getStatus();
    expect(status.status).toBe('conectado');
    expect(status.driver).toContain('node:sqlite');
    expect(status.contagens.materiais).toBeGreaterThan(0);
    expect(status.contagens.clientes).toBeGreaterThan(0);

    const empresa = db.getEmpresaConfig();
    expect(empresa.nomeFantasia).toContain('Serralheria');
  });

  it('deve salvar e listar novos clientes no SQLite', () => {
    const novoCliente = {
      id: 'cli-teste-1',
      nome: 'Carlos Eduardo Ferreira',
      telefoneWhatsApp: '11977776666',
      email: 'carlos@teste.com',
      documento: '123.456.789-00',
      enderecoObra: {
        logradouro: 'Rua das Indústrias',
        numero: '120',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01001-000'
      }
    };

    db.saveCliente(novoCliente);

    const clienteRecuperado = db.getClienteById('cli-teste-1');
    expect(clienteRecuperado).not.toBeNull();
    expect(clienteRecuperado?.nome).toBe('Carlos Eduardo Ferreira');

    const todos = db.getClientes();
    expect(todos.some((c: any) => c.id === 'cli-teste-1')).toBe(true);
  });

  it('deve salvar, consultar por id e gerar número sequencial de orçamento no SQLite', () => {
    const orcamentoTeste = {
      id: 'orc-sqlite-test',
      descricaoGeral: 'Portão e Churrasqueira',
      clienteId: 'cli-teste-1',
      clienteSnapshot: {
        id: 'cli-teste-1',
        nome: 'Carlos Eduardo Ferreira'
      },
      itens: [
        {
          id: 'item-1',
          descricao: 'Churrasqueira Parrilla',
          quantidadeUnidades: 1,
          tipoEstrutura: 'fabricacao_especial',
          medidas: { larguraM: 0.8, alturaM: 0.9, profundidadeM: 0.5 },
          acabamento: 'Pintura alta temp.',
          pecasDemandadas: [],
          acessorios: [],
          horasFabricacao: 0,
          horasInstalacao: 0,
          ajustesManuais: { precoVendaManual: 1200 },
          subtotalCustoDireto: 0,
          subtotalPrecoVenda: 1200
        }
      ],
      precoVendaFinal: 1200.00,
      custoDiretoTotal: 0,
      status: 'aprovado' as StatusOrcamento
    };

    const salvo = db.saveOrcamento(orcamentoTeste);
    expect(salvo.numeroSequencial).toBeGreaterThanOrEqual(101);

    const recuperado = db.getOrcamentoById('orc-sqlite-test');
    expect(recuperado).not.toBeNull();
    expect(recuperado?.precoVendaFinal).toBe(1200.00);
    expect(recuperado?.itens.length).toBe(1);
    expect(recuperado?.itens[0].descricao).toBe('Churrasqueira Parrilla');

    const proximoNum = db.getProximoNumeroSequencial();
    expect(proximoNum).toBe(salvo.numeroSequencial + 1);
  });

  it('deve excluir orçamento do SQLite sem afetar outros registros', () => {
    const orc = {
      id: 'orc-excluir',
      precoVendaFinal: 500,
      itens: []
    };
    db.saveOrcamento(orc);
    expect(db.getOrcamentoById('orc-excluir')).not.toBeNull();

    db.deleteOrcamento('orc-excluir');
    expect(db.getOrcamentoById('orc-excluir')).toBeNull();
  });

  it('deve cadastrar, atualizar e excluir novos materiais no SQLite', () => {
    const novoMaterial = {
      id: 'metalon-teste-60x40',
      codigo: 'MT-6040-18',
      descricao: 'Metalon 60x40 Chapa 18 (1.20mm)',
      tipo: 'tubo_retangular' as TipoPerfil,
      dimensoesMm: { largura: 60, altura: 40, espessuraChapaMm: 1.20 },
      comprimentoBarraMm: 6000,
      pesoNominalKgPorBarra: 10.5,
      precoBarra6m: 110.00,
      ativo: true
    };

    db.saveMaterial(novoMaterial);
    const salvo = db.getMaterialById('metalon-teste-60x40');
    expect(salvo).not.toBeNull();
    expect(salvo?.precoBarra6m).toBe(110.00);

    // Atualizar preço
    db.saveMaterial({ ...novoMaterial, precoBarra6m: 125.00 });
    const atualizado = db.getMaterialById('metalon-teste-60x40');
    expect(atualizado?.precoBarra6m).toBe(125.00);

    // Excluir
    db.deleteMaterial('metalon-teste-60x40');
    expect(db.getMaterialById('metalon-teste-60x40')).toBeNull();
  });

  it('deve evitar colisão de número sequencial ao salvar orçamentos com o mesmo número inicial', () => {
    const orc1 = db.saveOrcamento({ id: 'orc-colisao-1', numeroSequencial: 101, precoVendaFinal: 1000 });
    expect(orc1.numeroSequencial).toBe(101);

    // Salvar segundo orçamento com novo id mas com numeroSequencial 101 repetido
    const orc2 = db.saveOrcamento({ id: 'orc-colisao-2', numeroSequencial: 101, precoVendaFinal: 2500 });
    expect(orc2.numeroSequencial).toBe(102);

    expect(db.getOrcamentos().length).toBe(2);
  });
});
