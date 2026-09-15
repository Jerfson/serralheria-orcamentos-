import React from 'react';
import { Orcamento } from '../../types/orcamento';
import { PlanoCorteVisual } from '../planoCorte/PlanoCorteVisual';
import { ShieldAlert, DollarSign, Wrench, ShoppingBag, PieChart, Layers } from 'lucide-react';

interface VisaoOficinaProps {
  orcamento: Orcamento;
}

export const VisaoOficina: React.FC<VisaoOficinaProps> = ({ orcamento }) => {
  return (
    <div className="space-y-8">
      {/* Banner de Aviso de Confidencialidade Interna */}
      <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-amber-300 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <strong>Visão Exclusiva da Oficina (Confidencial):</strong> Esta tela reúne a lista de compras para a distribuidora de aço, custos reais de fábrica, margem líquida e mapa de corte de bancada. Nunca exiba esta tela diretamente ao cliente.
        </div>
      </div>

      {/* Cards de Métricas Financeiras Internas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            Compra de Aço (Barras 6m)
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            R$ {orcamento.custoAcoTotal.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {orcamento.planoCorteConsolidado.reduce((acc, p) => acc + p.totalBarras6mNecessarias, 0)} barras inteiras
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-amber-400" />
            Insumos & Mão de Obra
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            R$ {(orcamento.custoInsumosTotal + orcamento.custoMaoDeObraTotal).toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Solda, corte, primer e horas
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-400" />
            Custo Direto Total
          </span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-2">
            R$ {orcamento.custoDiretoTotal.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Ponto de equilíbrio (0 a 0)
          </span>
        </div>

        <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/40">
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <PieChart className="w-4 h-4" />
            Lucro Líquido Estimado
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            R$ {orcamento.valorLucroEstimado.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-500/90 mt-0.5 block">
            Margem real: {orcamento.precoVendaFinal > 0 ? ((orcamento.valorLucroEstimado / orcamento.precoVendaFinal) * 100).toFixed(1) : 0}% sobre venda
          </span>
        </div>
      </div>

      {/* Lista de Compras para o Distribuidor de Ferro */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Layers className="w-5 h-5 text-amber-500" />
          Lista Consolidada de Pedido para o Distribuidor de Aço
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Perfil / Material</th>
                <th className="py-2.5 px-3">Unidade Comercial</th>
                <th className="py-2.5 px-3 text-center">Barras a Comprar</th>
                <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                <th className="py-2.5 px-3 text-right">Subtotal Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {orcamento.planoCorteConsolidado.map((p) => (
                <tr key={p.perfilId} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{p.descricaoPerfil}</td>
                  <td className="py-2.5 px-3 text-slate-400">Barra de 6,00 metros</td>
                  <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                    {p.totalBarras6mNecessarias} {p.totalBarras6mNecessarias === 1 ? 'barra' : 'barras'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">R$ {p.precoUnitarioBarra.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">R$ {p.custoTotalPerfil.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plano de Corte Visual de Bancada */}
      <PlanoCorteVisual planoCorte={orcamento.planoCorteConsolidado} />
    </div>
  );
};
