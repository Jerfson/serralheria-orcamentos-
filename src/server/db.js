import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');
import fs from 'node:fs';
import path from 'node:path';

const EMPRESA_PADRAO = {
  id: 'default',
  nomeFantasia: 'Serralheria & Estruturas JRV',
  razaoSocial: 'JRV Esquadrias Metálicas e Serralheria Ltda',
  documento: '12.345.678/0001-90',
  telefoneWhatsApp: '11999998888',
  email: 'contato@serralheriajrv.com.br',
  endereco: 'Rua dos Ferroviários, 150 - Distrito Industrial',
  cidadeUf: 'São Paulo - SP',
  logoUrl: '',
  chavePix: '12345678000190',
  tipoChavePix: 'cnpj',
  taxaHoraOficina: 45.00,
  taxaHoraInstalacao: 55.00,
  margemLucroPadrao: 40.0,
  validadeDiasPadrao: 10,
  garantiaMesesPadrao: 12,
  termosCondicoesPadrao: '• Pagamento: 50% de sinal no fechamento do pedido e saldo na conclusão da instalação.\n• A garantia cobre defeitos de fabricação e solda estrutural, não cobrindo danos por mau uso ou intempéries anormais.\n• O local de instalação deve estar livre e desimpedido na data agendada.'
};

const MATERIAIS_PADRAO = [
  {
    id: 'metalon-50-30-ch18',
    codigo: 'MT-5030-18',
    descricao: 'Metalon 50x30 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 50, altura: 30, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 8.82,
    precoBarra6m: 78.50,
    ativo: true
  },
  {
    id: 'metalon-50-30-ch16',
    codigo: 'MT-5030-16',
    descricao: 'Metalon 50x30 Chapa 16 (1.50mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 50, altura: 30, espessuraChapaMm: 1.50 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 10.92,
    precoBarra6m: 96.00,
    ativo: true
  },
  {
    id: 'metalon-40-20-ch18',
    codigo: 'MT-4020-18',
    descricao: 'Metalon 40x20 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 40, altura: 20, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 6.54,
    precoBarra6m: 59.90,
    ativo: true
  },
  {
    id: 'metalon-30-20-ch18',
    codigo: 'MT-3020-18',
    descricao: 'Metalon 30x20 Chapa 18 (1.20mm)',
    tipo: 'tubo_retangular',
    dimensoesMm: { largura: 30, altura: 20, espessuraChapaMm: 1.20 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 5.40,
    precoBarra6m: 48.00,
    ativo: true
  },
  {
    id: 'cantoneira-1-18',
    codigo: 'CT-1-18',
    descricao: 'Cantoneira 1" x 1/8" (25.4 x 3.18mm)',
    tipo: 'cantoneira_abas_iguais',
    dimensoesMm: { largura: 25.4, altura: 25.4, espessuraChapaMm: 3.18 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 7.20,
    precoBarra6m: 64.00,
    ativo: true
  },
  {
    id: 'barra-chata-1-18',
    codigo: 'BC-1-18',
    descricao: 'Barra Chata 1" x 1/8" (25.4 x 3.18mm)',
    tipo: 'barra_chata',
    dimensoesMm: { largura: 25.4, altura: 3.18, espessuraChapaMm: 3.18 },
    comprimentoBarraMm: 6000,
    pesoNominalKgPorBarra: 3.80,
    precoBarra6m: 36.50,
    ativo: true
  }
];

const INSUMOS_PADRAO = [
  {
    id: 'eletrodo-6013-25',
    descricao: 'Eletrodo Revestido AWS E6013 2.50mm',
    unidade: 'kg',
    precoUnitario: 32.00,
    categoria: 'solda'
  },
  {
    id: 'disco-corte-45',
    descricao: 'Disco de Corte Fino 4.1/2" x 1.0mm Aço/Inox',
    unidade: 'unidade',
    precoUnitario: 4.50,
    categoria: 'abrasivo'
  },
  {
    id: 'primer-zarcao-cinza',
    descricao: 'Fundo Primer Anticorrosivo Zarcão Cinza 3.6L',
    unidade: 'galao_3.6l',
    precoUnitario: 89.00,
    categoria: 'pintura'
  }
];

const CLIENTE_PADRAO = {
  id: 'cliente-demo-1',
  nome: 'Marcos Roberto da Silva',
  telefoneWhatsApp: '11987654321',
  email: 'marcos.silva@email.com',
  documento: '284.912.438-10',
  enderecoObra: {
    logradouro: 'Alameda dos Ipês',
    numero: '340',
    bairro: 'Jardim Primavera',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '04500-120',
    pontoReferencia: 'Próximo à Padaria Central'
  },
  observacoesAcesso: 'Casa térrea, recuo de 5 metros para descarregamento das barras.',
  dataCadastro: new Date().toISOString(),
  dataAtualizacao: new Date().toISOString()
};

export class SerralheriaSqliteDB {
  constructor(dbPath) {
    this.dbPath = dbPath || process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), 'data', 'serralheria.db');
    
    // Garantir pasta data/
    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(this.dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS empresa (
        id TEXT PRIMARY KEY,
        dados_json TEXT NOT NULL,
        atualizado_em TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        telefone_whatsapp TEXT,
        email TEXT,
        documento TEXT,
        dados_json TEXT NOT NULL,
        criado_em TEXT NOT NULL,
        atualizado_em TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);

      CREATE TABLE IF NOT EXISTS materiais (
        id TEXT PRIMARY KEY,
        categoria TEXT NOT NULL,
        descricao TEXT NOT NULL,
        preco_barra_6m REAL NOT NULL,
        ativo INTEGER NOT NULL DEFAULT 1,
        dados_json TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_materiais_categoria ON materiais(categoria);

      CREATE TABLE IF NOT EXISTS insumos (
        id TEXT PRIMARY KEY,
        descricao TEXT NOT NULL,
        dados_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orcamentos (
        id TEXT PRIMARY KEY,
        numero_sequencial INTEGER NOT NULL UNIQUE,
        cliente_id TEXT,
        cliente_nome TEXT,
        preco_venda_final REAL NOT NULL,
        status TEXT NOT NULL,
        dados_json TEXT NOT NULL,
        criado_em TEXT NOT NULL,
        atualizado_em TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_orcamentos_numero ON orcamentos(numero_sequencial);
      CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
      CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos(cliente_id);
    `);

    this.ensureSeed();
  }

  ensureSeed() {
    // 1. Empresa
    const checkEmpresa = this.db.prepare('SELECT count(*) as total FROM empresa').get();
    if (checkEmpresa.total === 0) {
      this.saveEmpresaConfig(EMPRESA_PADRAO);
    }

    // 2. Materiais
    const checkMateriais = this.db.prepare('SELECT count(*) as total FROM materiais').get();
    if (checkMateriais.total === 0) {
      for (const m of MATERIAIS_PADRAO) {
        this.saveMaterial(m);
      }
    }

    // 3. Insumos
    const checkInsumos = this.db.prepare('SELECT count(*) as total FROM insumos').get();
    if (checkInsumos.total === 0) {
      for (const i of INSUMOS_PADRAO) {
        this.saveInsumo(i);
      }
    }

    // 4. Clientes
    const checkClientes = this.db.prepare('SELECT count(*) as total FROM clientes').get();
    if (checkClientes.total === 0) {
      this.saveCliente(CLIENTE_PADRAO);
    }
  }

  // --- EMPRESA ---
  getEmpresaConfig() {
    const row = this.db.prepare('SELECT dados_json FROM empresa WHERE id = ?').get('default');
    return row ? JSON.parse(row.dados_json) : EMPRESA_PADRAO;
  }

  saveEmpresaConfig(empresa) {
    const agora = new Date().toISOString();
    const dados = { ...EMPRESA_PADRAO, ...empresa, id: 'default' };
    const stmt = this.db.prepare(`
      INSERT INTO empresa (id, dados_json, atualizado_em)
      VALUES ('default', ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        dados_json = excluded.dados_json,
        atualizado_em = excluded.atualizado_em
    `);
    stmt.run(JSON.stringify(dados), agora);
    return dados;
  }

  // --- CLIENTES ---
  getClientes() {
    const rows = this.db.prepare('SELECT dados_json FROM clientes ORDER BY nome ASC').all();
    return rows.map(r => JSON.parse(r.dados_json));
  }

  getClienteById(id) {
    const row = this.db.prepare('SELECT dados_json FROM clientes WHERE id = ?').get(id);
    return row ? JSON.parse(row.dados_json) : null;
  }

  saveCliente(cliente) {
    const agora = new Date().toISOString();
    const id = cliente.id || 'cli-' + Math.random().toString(36).substring(2, 9);
    const atualizado = {
      ...cliente,
      id,
      dataCadastro: cliente.dataCadastro || agora,
      dataAtualizacao: agora
    };

    const stmt = this.db.prepare(`
      INSERT INTO clientes (id, nome, telefone_whatsapp, email, documento, dados_json, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nome = excluded.nome,
        telefone_whatsapp = excluded.telefone_whatsapp,
        email = excluded.email,
        documento = excluded.documento,
        dados_json = excluded.dados_json,
        atualizado_em = excluded.atualizado_em
    `);

    stmt.run(
      id,
      atualizado.nome || 'Sem Nome',
      atualizado.telefoneWhatsApp || '',
      atualizado.email || '',
      atualizado.documento || '',
      JSON.stringify(atualizado),
      atualizado.dataCadastro,
      agora
    );

    return atualizado;
  }

  deleteCliente(id) {
    this.db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
  }

  // --- MATERIAIS ---
  getMateriais() {
    const rows = this.db.prepare('SELECT dados_json FROM materiais ORDER BY descricao ASC').all();
    return rows.map(r => JSON.parse(r.dados_json));
  }

  getMaterialById(id) {
    const row = this.db.prepare('SELECT dados_json FROM materiais WHERE id = ?').get(id);
    return row ? JSON.parse(row.dados_json) : null;
  }

  saveMaterial(material) {
    const id = material.id || 'mat-' + Math.random().toString(36).substring(2, 9);
    const dados = { ...material, id };

    const stmt = this.db.prepare(`
      INSERT INTO materiais (id, categoria, descricao, preco_barra_6m, ativo, dados_json)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        categoria = excluded.categoria,
        descricao = excluded.descricao,
        preco_barra_6m = excluded.preco_barra_6m,
        ativo = excluded.ativo,
        dados_json = excluded.dados_json
    `);

    stmt.run(
      id,
      dados.tipo || 'tubo_retangular',
      dados.descricao || 'Material sem descrição',
      Number(dados.precoBarra6m || 0),
      dados.ativo !== false ? 1 : 0,
      JSON.stringify(dados)
    );

    return dados;
  }

  deleteMaterial(id) {
    this.db.prepare('DELETE FROM materiais WHERE id = ?').run(id);
  }

  // --- INSUMOS ---
  getInsumos() {
    const rows = this.db.prepare('SELECT dados_json FROM insumos ORDER BY descricao ASC').all();
    return rows.map(r => JSON.parse(r.dados_json));
  }

  saveInsumo(insumo) {
    const id = insumo.id || 'ins-' + Math.random().toString(36).substring(2, 9);
    const dados = { ...insumo, id };
    const stmt = this.db.prepare(`
      INSERT INTO insumos (id, descricao, dados_json)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        descricao = excluded.descricao,
        dados_json = excluded.dados_json
    `);
    stmt.run(id, dados.descricao, JSON.stringify(dados));
    return dados;
  }

  // --- ORÇAMENTOS ---
  getOrcamentos() {
    const rows = this.db.prepare('SELECT dados_json FROM orcamentos ORDER BY numero_sequencial DESC').all();
    return rows.map(r => JSON.parse(r.dados_json));
  }

  getOrcamentoById(id) {
    const row = this.db.prepare('SELECT dados_json FROM orcamentos WHERE id = ?').get(id);
    return row ? JSON.parse(row.dados_json) : null;
  }

  getProximoNumeroSequencial() {
    const row = this.db.prepare('SELECT COALESCE(MAX(numero_sequencial), 100) + 1 as proximo FROM orcamentos').get();
    return row ? row.proximo : 101;
  }

  saveOrcamento(orcamento) {
    const agora = new Date().toISOString();
    const id = orcamento.id || 'orc-' + Math.random().toString(36).substring(2, 9);
    
    let numeroSequencial = orcamento.numeroSequencial;
    if (!numeroSequencial || numeroSequencial <= 0) {
      numeroSequencial = this.getProximoNumeroSequencial();
    } else {
      const emUsoPorOutro = this.db.prepare('SELECT id FROM orcamentos WHERE numero_sequencial = ? AND id != ?').get(numeroSequencial, id);
      if (emUsoPorOutro) {
        numeroSequencial = this.getProximoNumeroSequencial();
      }
    }

    const dados = {
      ...orcamento,
      id,
      numeroSequencial,
      dataCriacao: orcamento.dataCriacao || agora,
      dataAtualizacao: agora
    };

    const stmt = this.db.prepare(`
      INSERT INTO orcamentos (id, numero_sequencial, cliente_id, cliente_nome, preco_venda_final, status, dados_json, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        numero_sequencial = excluded.numero_sequencial,
        cliente_id = excluded.cliente_id,
        cliente_nome = excluded.cliente_nome,
        preco_venda_final = excluded.preco_venda_final,
        status = excluded.status,
        dados_json = excluded.dados_json,
        atualizado_em = excluded.atualizado_em
    `);

    stmt.run(
      id,
      numeroSequencial,
      dados.clienteId || dados.clienteSnapshot?.id || '',
      dados.clienteSnapshot?.nome || 'Cliente',
      Number(dados.precoVendaFinal || 0),
      dados.status || 'rascunho',
      JSON.stringify(dados),
      dados.dataCriacao,
      agora
    );

    return dados;
  }

  deleteOrcamento(id) {
    this.db.prepare('DELETE FROM orcamentos WHERE id = ?').run(id);
  }

  // --- STATUS DO SISTEMA ---
  getStatus() {
    const orcCount = this.db.prepare('SELECT count(*) as total FROM orcamentos').get().total;
    const cliCount = this.db.prepare('SELECT count(*) as total FROM clientes').get().total;
    const matCount = this.db.prepare('SELECT count(*) as total FROM materiais').get().total;

    let tamanhoBytes = 0;
    if (this.dbPath !== ':memory:' && fs.existsSync(this.dbPath)) {
      tamanhoBytes = fs.statSync(this.dbPath).size;
    }

    return {
      status: 'conectado',
      driver: 'node:sqlite (nativo)',
      caminhoArquivo: this.dbPath,
      tamanhoBytes,
      contagens: {
        orcamentos: orcCount,
        clientes: cliCount,
        materiais: matCount
      }
    };
  }

  close() {
    this.db.close();
  }
}

// Instância singleton padrão para o servidor
let instance = null;
export function getSqliteDB(customPath) {
  if (!instance || customPath) {
    const db = new SerralheriaSqliteDB(customPath);
    if (!customPath) {
      instance = db;
    }
    return db;
  }
  return instance;
}
