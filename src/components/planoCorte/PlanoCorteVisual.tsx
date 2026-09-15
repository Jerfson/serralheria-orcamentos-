import React from 'react';
import { PlanoCortePorPerfil } from '../../types/orcamento';
import { Scissors, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';

interface PlanoCorteVisualProps {
  planoCorte: PlanoCortePorPerfil[];
}

export const PlanoCorteVisual: React.FC<PlanoCorteVisualProps> = ({ planoCorte }) => {
  if (!planoCorte || planoCorte.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
        <Scissors className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm">Nenhum perfil de aço registrado para cálculo de corte.</p>
      </div>
    );
  }

  // Paleta de cores para peças cortadas dentro da mesma barra
  const CORES_PECAS = [
    'bg-amber-500 text-slate-950 font-semibold',
    'bg-blue-500 text-white font-semibold',
    'bg-emerald-500 text-slate-950 font-semibold',
    'bg-purple-500 text-white font-semibold',
    'bg-cyan-500 text-slate-950 font-semibold',
    'bg-rose-500 text-white font-semibold'
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-500" />
            Plano de Corte 1D das Barras de 6,00m (First-Fit Decreasing)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulação de corte barra a barra considerando 3mm de perda de lâmina (kerf). Leve este mapa para a bancada.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          <PackageCheck className="w-4 h-4 text-emerald-400" />
          <span>Barras comerciais padronizadas de <strong>6.000 mm</strong></span>
        </div>
      </div>

      {planoCorte.map((perfil) => (
        <div key={perfil.perfilId} className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
          {/* Header do Perfil */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
            <div>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Perfil de Aço
              </span>
              <h4 className="text-base font-bold text-slate-100 mt-1">{perfil.descricaoPerfil}</h4>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="text-right">
                <div className="text-slate-400">Total a Comprar:</div>
                <div className="text-lg font-extrabold text-amber-400">
                  {perfil.totalBarras6mNecessarias} {perfil.totalBarras6mNecessarias === 1 ? 'barra' : 'barras'} de 6m
                </div>
              </div>

              <div className="text-right pl-4 border-l border-slate-800">
                <div className="text-slate-400">Aproveitamento:</div>
                <div className="text-sm font-bold text-emerald-400">
                  {perfil.aproveitamentoPercentual}%
                </div>
              </div>

              <div className="text-right pl-4 border-l border-slate-800">
                <div className="text-slate-400">Custo Total Aço:</div>
                <div className="text-sm font-bold text-slate-200">
                  R$ {perfil.custoTotalPerfil.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Barras de 6m */}
          <div className="space-y-3 pt-2">
            {perfil.barras.map((barra, bIdx) => {
              const sobraPercentual = Number(((barra.sobraMm / barra.comprimentoTotalMm) * 100).toFixed(1));

              return (
                <div key={barra.id} className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 text-xs">
                        #{barra.numeroBarra}
                      </span>
                      <span>Barra #{barra.numeroBarra} (6.000 mm)</span>
                      <span className="text-slate-500 font-normal">| {barra.pecas.length} peças cortadas</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {barra.aproveitavel ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <Sparkles className="w-3 h-3" />
                          Retalho Aproveitável: {barra.sobraMm} mm
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Sobra/Descarte: {barra.sobraMm} mm ({sobraPercentual}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra Visual Proporcional */}
                  <div className="w-full h-8 bg-slate-900 rounded-md overflow-hidden flex border border-slate-800 relative shadow-inner">
                    {barra.pecas.map((peca, pIdx) => {
                      const larguraPercentual = (peca.tamanhoMm / barra.comprimentoTotalMm) * 100;
                      const corClass = CORES_PECAS[pIdx % CORES_PECAS.length];

                      return (
                        <div
                          key={peca.pecaId}
                          style={{ width: `${larguraPercentual}%` }}
                          className={`${corClass} h-full flex items-center justify-center text-[11px] px-1 truncate border-r border-slate-950 relative group cursor-pointer transition-all hover:brightness-110`}
                          title={`${peca.descricaoPeca}: ${peca.tamanhoMm}mm (${peca.itemDescricao})`}
                        >
                          <span className="truncate">{peca.tamanhoMm}mm</span>
                        </div>
                      );
                    })}

                    {/* Espaço da Sobra */}
                    {barra.sobraMm > 0 && (
                      <div
                        style={{ width: `${sobraPercentual}%` }}
                        className={`h-full flex items-center justify-center text-[10px] px-1 font-mono ${
                          barra.aproveitavel
                            ? 'bg-emerald-950/70 text-emerald-300 border-l border-emerald-600/30'
                            : 'bg-slate-900/90 text-slate-500'
                        }`}
                        title={`Sobra: ${barra.sobraMm}mm`}
                      >
                        {barra.sobraMm > 200 ? `${barra.sobraMm}mm` : ''}
                      </div>
                    )}
                  </div>

                  {/* Detalhamento das peças da barra */}
                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {barra.pecas.map((peca, pIdx) => (
                      <span
                        key={peca.pecaId}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                      >
                        <span className={`w-2 h-2 rounded-full ${CORES_PECAS[pIdx % CORES_PECAS.length].split(' ')[0]}`} />
                        <span>{peca.descricaoPeca}: <strong>{peca.tamanhoMm}mm</strong></span>
                        <span className="text-slate-500">({peca.itemDescricao})</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
