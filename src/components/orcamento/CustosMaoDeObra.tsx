import React from 'react';
import { ItemOrcamento, EmpresaConfig } from '../../types/orcamento';
import { Clock, Hammer, Wrench, Edit3, RotateCcw } from 'lucide-react';

interface CustosMaoDeObraProps {
  itens: ItemOrcamento[];
  empresaConfig: EmpresaConfig;
  onAtualizarItem: (itemAtualizado: ItemOrcamento) => void;
}

export const CustosMaoDeObra: React.FC<CustosMaoDeObraProps> = ({
  itens,
  empresaConfig,
  onAtualizarItem
}) => {
  if (itens.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-500" />
            Mão de Obra e Horas Técnicas por Estrutura
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Taxas atuais da oficina: R$ {empresaConfig.taxaHoraOficina.toFixed(2)}/h (Bancada) | R$ {empresaConfig.taxaHoraInstalacao.toFixed(2)}/h (Obra)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {itens.map((item) => {
          const custoFabPadrao = item.horasFabricacao * empresaConfig.taxaHoraOficina;
          const custoInstPadrao = item.horasInstalacao * empresaConfig.taxaHoraInstalacao;
          const totalPadrao = custoFabPadrao + custoInstPadrao;

          const temAjusteManual = item.ajustesManuais?.custoMaoDeObraManual !== undefined;
          const valorMaoDeObraEfetivo = temAjusteManual 
            ? item.ajustesManuais!.custoMaoDeObraManual!
            : totalPadrao;

          const handleHorasFabChange = (h: number) => {
            onAtualizarItem({
              ...item,
              horasFabricacao: Math.max(0, h)
            });
          };

          const handleHorasInstChange = (h: number) => {
            onAtualizarItem({
              ...item,
              horasInstalacao: Math.max(0, h)
            });
          };

          const handleAjusteManual = (valor: number) => {
            onAtualizarItem({
              ...item,
              ajustesManuais: {
                ...item.ajustesManuais,
                custoMaoDeObraManual: Math.max(0, valor)
              }
            });
          };

          const handleResetarManual = () => {
            const ajustes = { ...item.ajustesManuais };
            delete ajustes.custoMaoDeObraManual;
            onAtualizarItem({
              ...item,
              ajustesManuais: Object.keys(ajustes).length > 0 ? ajustes : undefined
            });
          };

          return (
            <div
              key={item.id}
              className="bg-slate-950/60 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-200">{item.descricao}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Qtd: {item.quantidadeUnidades}</span>
                  <span>|</span>
                  <span>Medidas: {item.medidas.larguraM}m x {item.medidas.alturaM}m</span>
                </div>
              </div>

              {/* Controles de Horas */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    Horas Oficina
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={item.horasFabricacao}
                    onChange={(e) => handleHorasFabChange(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs text-center focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    = R$ {custoFabPadrao.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Horas Instalação
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={item.horasInstalacao}
                    onChange={(e) => handleHorasInstChange(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs text-center focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    = R$ {custoInstPadrao.toFixed(2)}
                  </span>
                </div>

                {/* Subtotal da Mão de Obra do Item com Override Manual */}
                <div className="pl-4 border-l border-slate-800 text-right">
                  <div className="text-slate-400 mb-1 flex items-center justify-end gap-1.5">
                    <span>Mão de Obra Total</span>
                    {temAjusteManual && (
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.2 rounded border border-amber-500/30 flex items-center gap-0.5">
                        <Edit3 className="w-2.5 h-2.5" /> Manual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1.5 text-xs text-slate-500">R$</span>
                      <input
                        type="number"
                        step="10"
                        value={valorMaoDeObraEfetivo}
                        onChange={(e) => handleAjusteManual(parseFloat(e.target.value) || 0)}
                        className={`w-28 pl-7 pr-2 py-1.5 text-xs font-bold rounded border text-right focus:outline-none ${
                          temAjusteManual
                            ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      />
                    </div>

                    {temAjusteManual && (
                      <button
                        type="button"
                        onClick={handleResetarManual}
                        title="Restaurar cálculo automático de horas"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
