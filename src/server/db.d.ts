import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';

export interface SqliteStatus {
  status: string;
  driver: string;
  caminhoArquivo: string;
  tamanhoBytes: number;
  contagens: {
    orcamentos: number;
    clientes: number;
    materiais: number;
  };
}

export class SerralheriaSqliteDB {
  constructor(dbPath?: string);
  init(): void;
  ensureSeed(): void;
  getEmpresaConfig(): EmpresaConfig;
  saveEmpresaConfig(empresa: Partial<EmpresaConfig>): EmpresaConfig;
  getClientes(): Cliente[];
  getClienteById(id: string): Cliente | null;
  saveCliente(cliente: Partial<Cliente>): Cliente;
  deleteCliente(id: string): void;
  getMateriais(): MaterialPerfil[];
  getMaterialById(id: string): MaterialPerfil | null;
  saveMaterial(material: any): MaterialPerfil;
  deleteMaterial(id: string): void;
  getInsumos(): InsumoConsumivel[];
  saveInsumo(insumo: any): InsumoConsumivel;
  getOrcamentos(): Orcamento[];
  getOrcamentoById(id: string): Orcamento | null;
  getProximoNumeroSequencial(): number;
  saveOrcamento(orcamento: any): Orcamento;
  deleteOrcamento(id: string): void;
  getStatus(): SqliteStatus;
  close(): void;
}

export function getSqliteDB(customPath?: string): SerralheriaSqliteDB;
