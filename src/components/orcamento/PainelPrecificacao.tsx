import React from 'react';
import { CondicoesPagamento } from '../../types/orcamento';
import { DollarSign, TrendingUp, Percent, AlertTriangle, CreditCard, ShieldCheck } from 'lucide-react';

interface PainelPrecificacaoProps {
  custoDiretoTotal: number;
  margemLucroPercentual: number;
  metodoMargem: 'sobre_receita' | 'sobre_custo';
  descontoPercentual: number;
  descontoValor: number;
  precoVendaBruto: number;
  precoVendaFinal: number;
  valorLucroEstimado: number;
  vendaComPrejuizo: boolean;
  condicoesPagamento: CondicoesPagamento;
  prazoEntregaDiasUteis: number;
  garantiaMeses: number;
  onAtualizarMargem: (margem: number) => void;
  onAtualizarMetodoMargem: (metodo: 'sobre_receita' | 'sobre_custo') => void;
  onAtualizarDesconto: (valor: number, percentual: number) => void;
  onAtualizarCondicoes: (condicoes: CondicoesPagamento) => void;
  onAtualizarPrazo: (dias: number) => void;
  onAtualizarGarantia: (meses: number) => void;
}

export const PainelPrecificacao: React.FC<PainelPrecificacaoProps> = ({
  custoDiretoTotal,
  margemLucroPercentual,
  metodoMargem,
  descontoPercentual,
  descontoValor,
  precoVendaBruto,
  precoVendaFinal,
  valorLucroEstimado,
  vendaComPrejuizo,
  condicoesPagamento,
  prazoEntregaDiasUteis,
  garantiaMeses,
  onAtualizarMargem,
  onAtualizarMetodoMargem,
  onAtualizarDesconto,
  onAtualizarCondicoes,
  onAtualizarPrazo,
  onAtualizarGarantia
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Formação do Preço de Venda (BDI) & Condições Comerciais
        </h3>
        <span className="text-xs text-slate-400">
          Custo direto base da obra: <strong>R$ {custoDiretoTotal.toFixed(2)}</strong>
        </span>
      </div>

      {/* Alerta de Prejuízo */}
      {vendaComPrejuizo && (
        <div className="bg-rose-950/60 border border-rose-600/50 p-4 rounded-lg flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
          <div>
            <strong>Atenção: Venda com Prejuízo Operacional!</strong> O preço final de venda (R$ {precoVendaFinal.toFixed(2)}) é inferior ao Custo Direto (R$ {custoDiretoTotal.toFixed(2)}). Ajuste a margem ou reduza o desconto.
          </div>
        </div>
      )}

      {/* Controles de Margem e Método */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-300 font-semibold mb-1 flex items-center justify-between">
            <span>Margem de Lucro Desejada</span>
            <span className="text-amber-400 font-mono">{margemLucroPercentual}%</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={margemLucroPercentual}
              onChange={(e) => onAtualizarMargem(parseFloat(e.target.value) || 0)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <input
              type="number"
              min="0"
              max="90"
              value={margemLucroPercentual}
              onChange={(e) => onAtualizarMargem(parseFloat(e.target.value) || 0)}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-center text-slate-100 font-bold focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-semibold mb-1 block">
            Base de Cálculo do Lucro
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onAtualizarMetodoMargem('sobre_receita')}
              className={`p-2 rounded border text-center font-medium transition ${
                metodoMargem === 'sobre_receita'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Sobre a Receita (BDI)
            </button>
            <button
              type="button"
              onClick={() => onAtualizarMetodoMargem('sobre_custo')}
              className={`p-2 rounded border text-center font-medium transition ${
                metodoMargem === 'sobre_custo'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Sobre o Custo
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-semibold mb-1 block">
            Desconto Comercial
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-2 text-xs text-slate-500">R$</span>
              <input
                type="number"
                step="10"
                min="0"
                value={descontoValor || ''}
                onChange={(e) => onAtualizarDesconto(parseFloat(e.target.value) || 0, 0)}
                placeholder="0,00"
                className="w-full bg-slate-950 border border-slate-800 rounded px-7 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
            </div>
            <div className="relative w-20">
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={descontoPercentual || ''}
                onChange={(e) => onAtualizarDesconto(0, parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded pl-2 pr-6 py-1.5 text-xs text-slate-100 font-mono text-center focus:border-amber-500"
              />
              <span className="absolute right-2.5 top-2 text-xs text-slate-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Condições de Pagamento e Prazos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
        <div>
          <label className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            Condição de Pagamento Oferecida
          </label>
          <select
            value={condicoesPagamento.tipo}
            onChange={(e) =>
              onAtualizarCondicoes({
                ...condicoesPagamento,
                tipo: e.target.value as any
              })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="sinal_mais_saldo">Entrada (Sinal) + Saldo na Instalação</option>
            <option value="a_vista_pix">À Vista via PIX com Desconto</option>
            <option value="parcelado_cartao">Parcelado no Cartão de Crédito</option>
          </select>
        </div>

        {condicoesPagamento.tipo === 'sinal_mais_saldo' && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Percentual do Sinal de Entrada
            </label>
            <div className="relative">
              <input
                type="number"
                min="10"
                max="90"
                step="5"
                value={condicoesPagamento.percentualSinal || 50}
                onChange={(e) =>
                  onAtualizarCondicoes({
                    ...condicoesPagamento,
                    percentualSinal: parseInt(e.target.value, 10) || 50
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
            </div>
          </div>
        )}

        {condicoesPagamento.tipo === 'parcelado_cartao' && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Número de Parcelas
            </label>
            <select
              value={condicoesPagamento.numeroParcelas || 6}
              onChange={(e) =>
                onAtualizarCondicoes({
                  ...condicoesPagamento,
                  numeroParcelas: parseInt(e.target.value, 10) || 6
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {[2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                <option key={n} value={n}>{n}x sem juros</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Prazo Entrega</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={prazoEntregaDiasUteis}
                onChange={(e) => onAtualizarPrazo(parseInt(e.target.value, 10) || 15)}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-2 pr-8 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
              <span className="absolute right-2 top-2 text-[11px] text-slate-500">dias</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Garantia</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={garantiaMeses}
                onChange={(e) => onAtualizarGarantia(parseInt(e.target.value, 10) || 12)}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-2 pr-9 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
              <span className="absolute right-2 top-2 text-[11px] text-slate-500">meses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Totais e Resumo Executivo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider">Custo Direto Total</div>
          <div className="text-base font-bold text-slate-300 font-mono mt-1">
            R$ {custoDiretoTotal.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider">Lucro Estimado</div>
          <div className={`text-base font-bold font-mono mt-1 ${valorLucroEstimado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            R$ {valorLucroEstimado.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider">Preço Bruto</div>
          <div className="text-base font-bold text-slate-400 font-mono mt-1 line-through">
            R$ {precoVendaBruto.toFixed(2)}
          </div>
        </div>

        <div className="bg-amber-500/10 p-3.5 rounded-lg border border-amber-500/30">
          <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Valor Final Proposta</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">
            R$ {precoVendaFinal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
