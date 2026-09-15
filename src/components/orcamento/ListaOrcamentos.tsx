import React, { useState } from 'react';
import { Orcamento, StatusOrcamento } from '../../types/orcamento';
import { FileText, Plus, Search, Eye, Copy, Trash2, CheckCircle2, Clock, Ban, CheckCheck } from 'lucide-react';

interface ListaOrcamentosProps {
  orcamentos: Orcamento[];
  onCriarNovo: () => void;
  onAbrirOrcamento: (id: string) => void;
  onDuplicarOrcamento: (orcamento: Orcamento) => void;
  onExcluirOrcamento: (id: string) => void;
  onAlterarStatus: (id: string, status: StatusOrcamento) => void;
}

export const ListaOrcamentos: React.FC<ListaOrcamentosProps> = ({
  orcamentos,
  onCriarNovo,
  onAbrirOrcamento,
  onDuplicarOrcamento,
  onExcluirOrcamento,
  onAlterarStatus
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const orcamentosFiltrados = orcamentos.filter((o) => {
    const matchBusca =
      o.numeroSequencial.toString().includes(busca) ||
      (o.clienteSnapshot?.nome || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || o.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const getStatusBadge = (status: StatusOrcamento) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Aprovado
          </span>
        );
      case 'em_producao':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Em Produção
          </span>
        );
      case 'concluido':
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
            <Ban className="w-3 h-3" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            Gerenciador de Orçamentos & Propostas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Histórico completo de cotações, controle de status e reemissão rápida.
          </p>
        </div>

        <button
          type="button"
          onClick={onCriarNovo}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-lg shadow-amber-950 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número do orçamento ou nome do cliente..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Status:</span>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="todos">Todos</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="em_producao">Em Produção</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      {orcamentosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-400 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm">Nenhum orçamento encontrado com os filtros atuais.</p>
          <button
            type="button"
            onClick={onCriarNovo}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
          >
            Criar meu primeiro orçamento agora
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Itens / Estruturas</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Valor Venda</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orcamentosFiltrados.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      #{o.numeroSequencial}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-100 block">{o.clienteSnapshot?.nome || 'Sem cliente'}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{o.clienteSnapshot?.telefoneWhatsApp}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {o.itens.map(i => `${i.quantidadeUnidades}x ${i.descricao}`).join(', ') || 'Nenhum item'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => onAlterarStatus(o.id, e.target.value as StatusOrcamento)}
                        className="bg-transparent border-0 cursor-pointer focus:outline-none"
                      >
                        <option value="rascunho" className="bg-slate-900 text-slate-300">Rascunho</option>
                        <option value="enviado" className="bg-slate-900 text-slate-300">Enviado</option>
                        <option value="aprovado" className="bg-slate-900 text-emerald-400">Aprovado</option>
                        <option value="em_producao" className="bg-slate-900 text-amber-400">Em Produção</option>
                        <option value="concluido" className="bg-slate-900 text-blue-400">Concluído</option>
                        <option value="cancelado" className="bg-slate-900 text-rose-400">Cancelado</option>
                      </select>
                      <div className="mt-1 flex justify-center">{getStatusBadge(o.status)}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      R$ {o.precoVendaFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onAbrirOrcamento(o.id)}
                          title="Abrir e Editar"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicarOrcamento(o)}
                          title="Duplicar Orçamento"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onExcluirOrcamento(o.id)}
                          title="Excluir"
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
