import React, { useState } from 'react';
import { ItemOrcamento, TipoEstrutura } from '../../types/orcamento';
import { MaterialPerfil } from '../../types/material';
import { CATALOGO_MODELOS_PADRAO } from '../../data/catalogoModelos';
import { calcularPecasEstrutura } from '../../core/parametricModels';
import { Plus, Trash2, Sliders, Box, Ruler, Check } from 'lucide-react';

interface ItemBuilderProps {
  materiais: MaterialPerfil[];
  onAdicionarItem: (item: ItemOrcamento) => void;
}

export const ItemBuilder: React.FC<ItemBuilderProps> = ({ materiais, onAdicionarItem }) => {
  const [tipoEstrutura, setTipoEstrutura] = useState<TipoEstrutura>('portao_basculante');
  const [descricao, setDescricao] = useState('');
  const [larguraM, setLarguraM] = useState<number>(3.00);
  const [alturaM, setAlturaM] = useState<number>(2.20);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [acabamento, setAcabamento] = useState('Pintura primer anticorrosivo cinza zarcão');

  // Perfis selecionados
  const modeloAtual = CATALOGO_MODELOS_PADRAO.find(m => m.tipo === tipoEstrutura) || CATALOGO_MODELOS_PADRAO[0];
  const [perfilQuadroId, setPerfilQuadroId] = useState<string>(modeloAtual.perfilQuadroPadraoId);
  const [perfilPreenchimentoId, setPerfilPreenchimentoId] = useState<string>(modeloAtual.perfilPreenchimentoPadraoId);
  const [espacamentoCm, setEspacamentoCm] = useState<number>(modeloAtual.espacamentoReguasPadraoCm);

  // Ao trocar modelo, sincronizar padrões
  const handleTrocaModelo = (novoTipo: TipoEstrutura) => {
    setTipoEstrutura(novoTipo);
    const m = CATALOGO_MODELOS_PADRAO.find(mod => mod.tipo === novoTipo) || CATALOGO_MODELOS_PADRAO[0];
    setPerfilQuadroId(m.perfilQuadroPadraoId);
    setPerfilPreenchimentoId(m.perfilPreenchimentoPadraoId);
    setEspacamentoCm(m.espacamentoReguasPadraoCm);
    if (!descricao || CATALOGO_MODELOS_PADRAO.some(mod => mod.nome === descricao)) {
      setDescricao(m.nome);
    }
  };

  // Cálculo prévio em tempo real
  const preResultado = calcularPecasEstrutura({
    tipo: tipoEstrutura,
    larguraM,
    alturaM,
    perfilQuadroId,
    perfilPreenchimentoId,
    espacamentoReguasCm: espacamentoCm
  });

  const handleSalvarItem = (e: React.FormEvent) => {
    e.preventDefault();

    const novoItem: ItemOrcamento = {
      id: 'item-' + Math.random().toString(36).substring(2, 9),
      orcamentoId: '',
      descricao: descricao || modeloAtual.nome,
      tipoEstrutura,
      medidas: {
        larguraM: Number(larguraM),
        alturaM: Number(alturaM)
      },
      quantidadeUnidades: Math.max(1, Number(quantidade)),
      acabamento,
      pecasDemandadas: preResultado.pecasDemandadas,
      acessorios: [],
      horasFabricacao: preResultado.horasFabricacao * quantidade,
      horasInstalacao: preResultado.horasInstalacao * quantidade,
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: 0
    };

    onAdicionarItem(novoItem);

    // Resetar campos para próximo item
    setDescricao('');
  };

  return (
    <form onSubmit={handleSalvarItem} className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-500" />
          Adicionar Produto / Estrutura ao Orçamento
        </h3>
        <span className="text-xs text-slate-400">
          Cálculo paramétrico de barras de 6m automático
        </span>
      </div>

      {/* Seleção do Modelo */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          1. Selecione o Tipo de Estrutura
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATALOGO_MODELOS_PADRAO.map((m) => {
            const isSelected = tipoEstrutura === m.tipo;
            return (
              <button
                key={m.tipo}
                type="button"
                onClick={() => handleTrocaModelo(m.tipo)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold leading-tight line-clamp-2">{m.nome}</span>
                <span className="text-[10px] text-slate-500 mt-2 block">
                  {m.espacamentoReguasPadraoCm}cm eixos
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimensões e Descrição */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs text-slate-400 mb-1">
            Descrição do Item na Proposta
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={modeloAtual.nome}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Largura / Vão (metros)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.20"
              max="20.00"
              required
              value={larguraM}
              onChange={(e) => setLarguraM(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-500">m</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Altura / Queda (metros)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.20"
              max="20.00"
              required
              value={alturaM}
              onChange={(e) => setAlturaM(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-500">m</span>
          </div>
        </div>
      </div>

      {/* Perfis Selecionados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Perfil do Requadro / Quadro
          </label>
          <select
            value={perfilQuadroId}
            onChange={(e) => setPerfilQuadroId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {materiais.map((m) => (
              <option key={m.id} value={m.id}>
                {m.descricao} (R$ {m.precoBarra6m.toFixed(2)}/barra 6m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Perfil das Réguas / Preenchimento
          </label>
          <select
            value={perfilPreenchimentoId}
            onChange={(e) => setPerfilPreenchimentoId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {materiais.map((m) => (
              <option key={m.id} value={m.id}>
                {m.descricao} (R$ {m.precoBarra6m.toFixed(2)}/barra 6m)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Quantidade de Unidades
          </label>
          <input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Resumo Pré-cálculo e Botão Adicionar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4 text-xs text-slate-300">
          <div>
            Área total: <strong>{(larguraM * alturaM * quantidade).toFixed(2)} m²</strong>
          </div>
          <div>
            Peças lineares calculadas: <strong>{preResultado.pecasDemandadas.reduce((a, c) => a + c.quantidade * quantidade, 0)} peças</strong>
          </div>
          <div>
            Mão de obra estimada: <strong>{(preResultado.horasFabricacao * quantidade).toFixed(1)}h oficina + {(preResultado.horasInstalacao * quantidade).toFixed(1)}h obra</strong>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer ml-auto"
        >
          <Plus className="w-4 h-4" />
          Adicionar Estrutura
        </button>
      </div>
    </form>
  );
};
