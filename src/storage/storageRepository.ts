import { offlineDB, EMPRESA_CONFIG_PADRAO } from './db';
import { apiClient, SqliteStatus } from './apiClient';
import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';
import { CATALOGO_PERFIS_PADRAO } from '../data/catalogoPerfis';
import { CATALOGO_INSUMOS_PADRAO } from '../data/catalogoInsumos';

export class StorageRepository {
  private initialized = false;
  private sqliteAvailable: boolean | null = null;
  private lastSqliteStatus: SqliteStatus | null = null;

  public async checkSqliteConnection(): Promise<boolean> {
    try {
      const status = await apiClient.getStatus();
      if (status && status.status === 'conectado') {
        this.sqliteAvailable = true;
        this.lastSqliteStatus = status;
        return true;
      }
    } catch {
      // Ignora erro e assume offline
    }
    this.sqliteAvailable = false;
    this.lastSqliteStatus = null;
    return false;
  }

  public getSqliteStatus(): SqliteStatus | null {
    return this.lastSqliteStatus;
  }

  public isUsingSqlite(): boolean {
    return this.sqliteAvailable === true;
  }

  public async ensureSeedData(): Promise<void> {
    if (this.initialized) return;

    // Verificar se SQLite API está online
    await this.checkSqliteConnection();

    // 1. Empresa Config
    const empresa = await offlineDB.getById<EmpresaConfig>('empresa', 'default');
    if (!empresa) {
      await offlineDB.save('empresa', EMPRESA_CONFIG_PADRAO);
    }

    // 2. Materiais Perfis
    const materiais = await offlineDB.getStore<MaterialPerfil>('materiais');
    if (materiais.length === 0) {
      for (const m of CATALOGO_PERFIS_PADRAO) {
        await offlineDB.save('materiais', m);
      }
    }

    // 3. Insumos
    const insumos = await offlineDB.getStore<InsumoConsumivel>('insumos');
    if (insumos.length === 0) {
      for (const i of CATALOGO_INSUMOS_PADRAO) {
        await offlineDB.save('insumos', i);
      }
    }

    // 4. Cliente demonstrativo se banco novo
    const clientes = await offlineDB.getStore<Cliente>('clientes');
    if (clientes.length === 0) {
      const clienteDemo: Cliente = {
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
      await offlineDB.save('clientes', clienteDemo);
    }

    this.initialized = true;
  }

  // --- Empresa ---
  public async getEmpresaConfig(): Promise<EmpresaConfig> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remota = await apiClient.getEmpresaConfig();
      if (remota) {
        await offlineDB.save('empresa', remota);
        return remota;
      }
    }

    const config = await offlineDB.getById<EmpresaConfig>('empresa', 'default');
    return config || EMPRESA_CONFIG_PADRAO;
  }

  public async saveEmpresaConfig(config: EmpresaConfig): Promise<EmpresaConfig> {
    const salvaLocal = await offlineDB.save('empresa', config);
    if (this.sqliteAvailable) {
      const remota = await apiClient.saveEmpresaConfig(config);
      if (remota) return remota;
    }
    return salvaLocal;
  }

  // --- Clientes ---
  public async getClientes(): Promise<Cliente[]> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remotos = await apiClient.getClientes();
      if (remotos) {
        for (const c of remotos) {
          await offlineDB.save('clientes', c);
        }
        return remotos;
      }
    }

    return offlineDB.getStore<Cliente>('clientes');
  }

  public async getClienteById(id: string): Promise<Cliente | null> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remoto = await apiClient.getClientes().then(list => list?.find(c => c.id === id) || null);
      if (remoto) return remoto;
    }

    return offlineDB.getById<Cliente>('clientes', id);
  }

  public async saveCliente(cliente: Cliente): Promise<Cliente> {
    cliente.dataAtualizacao = new Date().toISOString();
    if (!cliente.dataCadastro) cliente.dataCadastro = cliente.dataAtualizacao;

    const salvoLocal = await offlineDB.save('clientes', cliente);
    if (this.sqliteAvailable) {
      const remoto = await apiClient.saveCliente(cliente);
      if (remoto) return remoto;
    }
    return salvoLocal;
  }

  public async deleteCliente(id: string): Promise<void> {
    await offlineDB.delete('clientes', id);
    if (this.sqliteAvailable) {
      await apiClient.deleteCliente(id);
    }
  }

  // --- Materiais & Perfis ---
  public async getMateriais(): Promise<MaterialPerfil[]> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remotos = await apiClient.getMateriais();
      if (remotos && remotos.length > 0) {
        for (const m of remotos) {
          await offlineDB.save('materiais', m);
        }
        return remotos;
      }
    }

    return offlineDB.getStore<MaterialPerfil>('materiais');
  }

  public async saveMaterial(material: MaterialPerfil): Promise<MaterialPerfil> {
    const salvoLocal = await offlineDB.save('materiais', material);
    if (this.sqliteAvailable) {
      const remoto = await apiClient.saveMaterial(material);
      if (remoto) return remoto;
    }
    return salvoLocal;
  }

  public async deleteMaterial(id: string): Promise<void> {
    await offlineDB.delete('materiais', id);
    if (this.sqliteAvailable) {
      await apiClient.deleteMaterial(id);
    }
  }

  public async restaurarMateriaisPadrao(): Promise<void> {
    for (const m of CATALOGO_PERFIS_PADRAO) {
      await this.saveMaterial(m);
    }
  }

  // --- Insumos ---
  public async getInsumos(): Promise<InsumoConsumivel[]> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remotos = await apiClient.getInsumos();
      if (remotos && remotos.length > 0) {
        for (const i of remotos) {
          await offlineDB.save('insumos', i);
        }
        return remotos;
      }
    }

    return offlineDB.getStore<InsumoConsumivel>('insumos');
  }

  public async saveInsumo(insumo: InsumoConsumivel): Promise<InsumoConsumivel> {
    const salvoLocal = await offlineDB.save('insumos', insumo);
    if (this.sqliteAvailable) {
      const remoto = await apiClient.saveInsumo(insumo);
      if (remoto) return remoto;
    }
    return salvoLocal;
  }

  // --- Orçamentos ---
  public async getOrcamentos(): Promise<Orcamento[]> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remotos = await apiClient.getOrcamentos();
      if (remotos) {
        for (const o of remotos) {
          await offlineDB.save('orcamentos', o);
        }
        return remotos.sort((a, b) => (b.numeroSequencial || 0) - (a.numeroSequencial || 0));
      }
    }

    const lista = await offlineDB.getStore<Orcamento>('orcamentos');
    return lista.sort((a, b) => (b.numeroSequencial || 0) - (a.numeroSequencial || 0));
  }

  public async getOrcamentoById(id: string): Promise<Orcamento | null> {
    await this.ensureSeedData();

    if (this.sqliteAvailable) {
      const remoto = await apiClient.getOrcamentoById(id);
      if (remoto) return remoto;
    }

    return offlineDB.getById<Orcamento>('orcamentos', id);
  }

  public async getProximoNumeroSequencial(): Promise<number> {
    const orcamentos = await this.getOrcamentos();
    if (orcamentos.length === 0) return 101;
    const maxNum = Math.max(...orcamentos.map(o => o.numeroSequencial || 100));
    return maxNum + 1;
  }

  public async saveOrcamento(orcamento: Orcamento): Promise<Orcamento> {
    orcamento.dataAtualizacao = new Date().toISOString();
    if (!orcamento.dataCriacao) orcamento.dataCriacao = orcamento.dataAtualizacao;
    if (!orcamento.numeroSequencial) {
      orcamento.numeroSequencial = await this.getProximoNumeroSequencial();
    }

    const salvoLocal = await offlineDB.save('orcamentos', orcamento);
    if (this.sqliteAvailable) {
      const remoto = await apiClient.saveOrcamento(orcamento);
      if (remoto) return remoto;
    }
    return salvoLocal;
  }

  public async deleteOrcamento(id: string): Promise<void> {
    await offlineDB.delete('orcamentos', id);
    if (this.sqliteAvailable) {
      await apiClient.deleteOrcamento(id);
    }
  }
}

export const storageRepository = new StorageRepository();
