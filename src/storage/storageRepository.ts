import { offlineDB, EMPRESA_CONFIG_PADRAO } from './db';
import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';
import { CATALOGO_PERFIS_PADRAO } from '../data/catalogoPerfis';
import { CATALOGO_INSUMOS_PADRAO } from '../data/catalogoInsumos';

export class StorageRepository {
  private initialized = false;

  public async ensureSeedData(): Promise<void> {
    if (this.initialized) return;

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
    const config = await offlineDB.getById<EmpresaConfig>('empresa', 'default');
    return config || EMPRESA_CONFIG_PADRAO;
  }

  public async saveEmpresaConfig(config: EmpresaConfig): Promise<EmpresaConfig> {
    return offlineDB.save('empresa', config);
  }

  // --- Clientes ---
  public async getClientes(): Promise<Cliente[]> {
    await this.ensureSeedData();
    return offlineDB.getStore<Cliente>('clientes');
  }

  public async getClienteById(id: string): Promise<Cliente | null> {
    await this.ensureSeedData();
    return offlineDB.getById<Cliente>('clientes', id);
  }

  public async saveCliente(cliente: Cliente): Promise<Cliente> {
    cliente.dataAtualizacao = new Date().toISOString();
    if (!cliente.dataCadastro) cliente.dataCadastro = cliente.dataAtualizacao;
    return offlineDB.save('clientes', cliente);
  }

  public async deleteCliente(id: string): Promise<void> {
    return offlineDB.delete('clientes', id);
  }

  // --- Materiais & Perfis ---
  public async getMateriais(): Promise<MaterialPerfil[]> {
    await this.ensureSeedData();
    return offlineDB.getStore<MaterialPerfil>('materiais');
  }

  public async saveMaterial(material: MaterialPerfil): Promise<MaterialPerfil> {
    return offlineDB.save('materiais', material);
  }

  public async restaurarMateriaisPadrao(): Promise<void> {
    for (const m of CATALOGO_PERFIS_PADRAO) {
      await offlineDB.save('materiais', m);
    }
  }

  // --- Insumos ---
  public async getInsumos(): Promise<InsumoConsumivel[]> {
    await this.ensureSeedData();
    return offlineDB.getStore<InsumoConsumivel>('insumos');
  }

  public async saveInsumo(insumo: InsumoConsumivel): Promise<InsumoConsumivel> {
    return offlineDB.save('insumos', insumo);
  }

  // --- Orçamentos ---
  public async getOrcamentos(): Promise<Orcamento[]> {
    await this.ensureSeedData();
    const lista = await offlineDB.getStore<Orcamento>('orcamentos');
    return lista.sort((a, b) => b.numeroSequencial - a.numeroSequencial);
  }

  public async getOrcamentoById(id: string): Promise<Orcamento | null> {
    await this.ensureSeedData();
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
    return offlineDB.save('orcamentos', orcamento);
  }

  public async deleteOrcamento(id: string): Promise<void> {
    return offlineDB.delete('orcamentos', id);
  }
}

export const storageRepository = new StorageRepository();
