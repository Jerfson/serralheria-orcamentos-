import React, { useState } from 'react';
import { AcessorioItem } from '../../types/material';
import { CATALOGO_ACESSORIOS_PADRAO } from '../../data/catalogoInsumos';
import { Truck, Plus, Trash2, KeyRound } from 'lucide-react';

interface AcessoriosFreteProps {
  acessorios: AcessorioItem[];
  custoFrete: number;
  outrosCustos: number;
  onAdicionarAcessorio: (ac: AcessorioItem) => void;
  onRemoverAcessorio: (id: string) => void;
  onAtualizarFrete: (frete: number) => void;
  onAtualizarOutrosCustos: (outros: number) => void;
}

export const AcessoriosFrete: React.FC<AcessoriosFreteProps> = ({
  acessorios,
  custoFrete,
  outrosCustos,
  onAdicionarAcessorio,
  onRemoverAcessorio,
  onAtualizarFrete,
  onAtualizarOutrosCustos
}) => {
  const [acessorioSelecionadoId, setAcessorioSelecionadoId] = useState<string>(CATALOGO_ACESSORIOS_PADRAO[0].id);
  const [qtd, setQtd] = useState<number>(1);

  const handleAdd = () => {
    const modelo = CATALOGO_ACESSORIOS_PADRAO.find(a => a.id === acessorioSelecionadoId);
    if (!modelo) return;

    onAdicionarAcessorio({
      ...modelo,
      id: `ac-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      quantidade: Math.max(1, qtd)
    });
  };

  const totalAcessorios = acessorios.reduce((acc, a) => acc + (a.custoUnitario * a.quantidade), 0);

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          Acessórios Especiais, Componentes & Frete
        </h3>
        <span className="text-xs text-slate-400">
          Total acessórios + logística: <strong>R$ {(totalAcessorios + custoFrete + outrosCustos).toFixed(2)}</strong>
        </span>
      </div>

      {/* Adicionar Acessório */}
      <div className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">
            Selecione o Componente / Ferragem
          </label>
          <select
            value={acessorioSelecionadoId}
            onChange={(e) => setAcessorioSelecionadoId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {CATALOGO_ACESSORIOS_PADRAO.map((a) => (
              <option key={a.id} value={a.id}>
                {a.descricao} (Custo fábrica: R$ {a.custoUnitario.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <label className="block text-xs text-slate-400 mb-1">Qtd</label>
          <input
            type="number"
            min="1"
            value={qtd}
            onChange={(e) => setQtd(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 text-center focus:border-amber-500"
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          Incluir
        </button>
      </div>

      {/* Lista de Acessórios Incluídos */}
      {acessorios.length > 0 && (
        <div className="space-y-2">
          {acessorios.map((ac) => (
            <div
              key={ac.id}
              className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-mono text-amber-400 text-[11px]">
                  {ac.quantidade}x
                </span>
                <span className="text-slate-200">{ac.descricao}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-mono font-medium">
                  R$ {(ac.custoUnitario * ac.quantidade).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoverAcessorio(ac.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                  title="Remover acessório"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Frete e Despesas Logísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/70">
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            Frete / Deslocamento até a Obra
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-500">R$</span>
            <input
              type="number"
              step="10"
              min="0"
              value={custoFrete}
              onChange={(e) => onAtualizarFrete(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            Outros Custos Operacionais / Alimentação
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-500">R$</span>
            <input
              type="number"
              step="10"
              min="0"
              value={outrosCustos}
              onChange={(e) => onAtualizarOutrosCustos(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              placeholder="0,00"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
