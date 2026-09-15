import React, { useState } from 'react';
import { EmpresaConfig } from '../../types/orcamento';
import { backupService } from '../../storage/backupService';
import { Settings, Download, Upload, Save, X, Building, DollarSign, Key, Check } from 'lucide-react';

interface ConfigEmpresaModalProps {
  empresaConfig: EmpresaConfig;
  onSalvarConfig: (novaConfig: EmpresaConfig) => void;
  onClose: () => void;
  onDadosRestaurados: () => void;
}

export const ConfigEmpresaModal: React.FC<ConfigEmpresaModalProps> = ({
  empresaConfig,
  onSalvarConfig,
  onClose,
  onDadosRestaurados
}) => {
  const [formData, setFormData] = useState<EmpresaConfig>({ ...empresaConfig });
  const [mensagemBackup, setMensagemBackup] = useState<string | null>(null);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfig(formData);
    onClose();
  };

  const handleExportar = () => {
    backupService.downloadBackupArquivo();
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const conteudo = event.target?.result as string;
      const res = await backupService.importarBackup(conteudo);
      setMensagemBackup(res.message);
      if (res.success) {
        onDadosRestaurados();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Configurações da Oficina & Backup
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mensagemBackup && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            {mensagemBackup}
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome Fantasia da Serralheria *</label>
              <input
                type="text"
                required
                value={formData.nomeFantasia}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Razão Social</label>
              <input
                type="text"
                value={formData.razaoSocial || ''}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">CNPJ ou CPF *</label>
              <input
                type="text"
                required
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">WhatsApp Comercial *</label>
              <input
                type="text"
                required
                value={formData.telefoneWhatsApp}
                onChange={(e) => setFormData({ ...formData, telefoneWhatsApp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Endereço da Oficina</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cidade / UF</label>
              <input
                type="text"
                value={formData.cidadeUf}
                onChange={(e) => setFormData({ ...formData, cidadeUf: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Taxas Horárias */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              Taxas Base da Mão de Obra
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Taxa Hora Bancada / Oficina (R$/h)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={formData.taxaHoraOficina}
                  onChange={(e) => setFormData({ ...formData, taxaHoraOficina: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Taxa Hora Instalação / Obra (R$/h)</label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={formData.taxaHoraInstalacao}
                  onChange={(e) => setFormData({ ...formData, taxaHoraInstalacao: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Dados PIX para Sinal */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              Chave PIX da Oficina (Para Recebimento de Sinal)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Chave PIX</label>
                <input
                  type="text"
                  value={formData.chavePix}
                  onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                  placeholder="CNPJ, Celular, E-mail ou Aleatória"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tipo de Chave</label>
                <select
                  value={formData.tipoChavePix}
                  onChange={(e) => setFormData({ ...formData, tipoChavePix: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                >
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="celular">Celular</option>
                  <option value="email">E-mail</option>
                  <option value="aleatoria">Aleatória</option>
                </select>
              </div>
            </div>
          </div>

          {/* Termos Padrão */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Termos e Condições Padrão da Proposta</label>
            <textarea
              rows={3}
              value={formData.termosCondicoesPadrao}
              onChange={(e) => setFormData({ ...formData, termosCondicoesPadrao: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
            />
          </div>

          {/* Gestão de Backup e Portabilidade */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportar}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Exportar Backup (.json)
              </button>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                Importar Backup
                <input type="file" accept=".json" onChange={handleImportar} className="hidden" />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs transition"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
