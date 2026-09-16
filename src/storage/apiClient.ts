import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';

export interface SqliteStatus {
  status: 'conectado' | 'desconectado';
  driver?: string;
  caminhoArquivo?: string;
  tamanhoBytes?: number;
  contagens?: {
    orcamentos: number;
    clientes: number;
    materiais: number;
  };
}

export class ApiClient {
  private baseUrl = '/api';

  public async getStatus(): Promise<SqliteStatus | null> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Empresa
  public async getEmpresaConfig(): Promise<EmpresaConfig | null> {
    try {
      const res = await fetch(`${this.baseUrl}/empresa`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async saveEmpresaConfig(config: EmpresaConfig): Promise<EmpresaConfig | null> {
    try {
      const res = await fetch(`${this.baseUrl}/empresa`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Clientes
  public async getClientes(): Promise<Cliente[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/clientes`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async saveCliente(cliente: Cliente): Promise<Cliente | null> {
    try {
      const res = await fetch(`${this.baseUrl}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async deleteCliente(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/clientes/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Materiais
  public async getMateriais(): Promise<MaterialPerfil[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/materiais`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async saveMaterial(material: MaterialPerfil): Promise<MaterialPerfil | null> {
    try {
      const res = await fetch(`${this.baseUrl}/materiais`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async deleteMaterial(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/materiais/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Insumos
  public async getInsumos(): Promise<InsumoConsumivel[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/insumos`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async saveInsumo(insumo: InsumoConsumivel): Promise<InsumoConsumivel | null> {
    try {
      const res = await fetch(`${this.baseUrl}/insumos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insumo)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Orçamentos
  public async getOrcamentos(): Promise<Orcamento[] | null> {
    try {
      const res = await fetch(`${this.baseUrl}/orcamentos`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getOrcamentoById(id: string): Promise<Orcamento | null> {
    try {
      const res = await fetch(`${this.baseUrl}/orcamentos/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async saveOrcamento(orcamento: Orcamento): Promise<Orcamento | null> {
    try {
      const res = await fetch(`${this.baseUrl}/orcamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orcamento)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async deleteOrcamento(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/orcamentos/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
