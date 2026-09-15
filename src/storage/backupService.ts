import { storageRepository } from './storageRepository';
import { offlineDB } from './db';
import { EmpresaConfig, Orcamento } from '../types/orcamento';
import { Cliente } from '../types/cliente';
import { MaterialPerfil, InsumoConsumivel } from '../types/material';

export interface BackupData {
  versaoBackup: string;
  dataGeracao: string;
  empresa: EmpresaConfig;
  clientes: Cliente[];
  catalogoMateriais: MaterialPerfil[];
  insumos: InsumoConsumivel[];
  orcamentos: Orcamento[];
}

export class BackupService {
  public async exportarBackup(): Promise<string> {
    const empresa = await storageRepository.getEmpresaConfig();
    const clientes = await storageRepository.getClientes();
    const catalogoMateriais = await storageRepository.getMateriais();
    const insumos = await storageRepository.getInsumos();
    const orcamentos = await storageRepository.getOrcamentos();

    const backup: BackupData = {
      versaoBackup: '1.0.0',
      dataGeracao: new Date().toISOString(),
      empresa,
      clientes,
      catalogoMateriais,
      insumos,
      orcamentos
    };

    return JSON.stringify(backup, null, 2);
  }

  public downloadBackupArquivo(): void {
    this.exportarBackup().then(json => {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dataStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `backup_serralheria_${dataStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  public async importarBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const data: BackupData = JSON.parse(jsonString);

      if (!data.versaoBackup || !data.empresa || !Array.isArray(data.orcamentos)) {
        return { success: false, message: 'Arquivo de backup inválido ou em formato incompatível.' };
      }

      // Restaurar Empresa
      if (data.empresa) {
        await storageRepository.saveEmpresaConfig(data.empresa);
      }

      // Restaurar Clientes
      if (Array.isArray(data.clientes)) {
        for (const c of data.clientes) {
          await offlineDB.save('clientes', c);
        }
      }

      // Restaurar Materiais
      if (Array.isArray(data.catalogoMateriais)) {
        for (const m of data.catalogoMateriais) {
          await offlineDB.save('materiais', m);
        }
      }

      // Restaurar Insumos
      if (Array.isArray(data.insumos)) {
        for (const i of data.insumos) {
          await offlineDB.save('insumos', i);
        }
      }

      // Restaurar Orçamentos
      if (Array.isArray(data.orcamentos)) {
        for (const o of data.orcamentos) {
          await offlineDB.save('orcamentos', o);
        }
      }

      return {
        success: true,
        message: `Backup restaurado com sucesso! ${data.orcamentos.length} orçamentos e ${data.clientes.length} clientes recuperados.`
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao processar backup: ${err.message || 'Falha de leitura'}` };
    }
  }
}

export const backupService = new BackupService();
