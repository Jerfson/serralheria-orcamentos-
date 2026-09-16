import React, { useState } from 'react';
import { ItemOrcamento, TipoEstrutura } from '../../types/orcamento';
import { MaterialPerfil } from '../../types/material';
import { CATALOGO_MODELOS_PADRAO } from '../../data/catalogoModelos';
import { calcularPecasEstrutura } from '../../core/parametricModels';
import { Plus, Trash2, Sliders, Box, Ruler, Check, Flame, Sparkles, Clock, Hammer, DollarSign } from 'lucide-react';

const PRESETS_ESPECIAIS = [
  {
    titulo: 'Churrasqueira Parrilla',
    nome: 'Churrasqueira Parrilla em Aço Carbono com Grelha Inox e Caixa de Fogo',
    larguraM: 0.80,
    alturaM: 0.90,
    profundidadeM: 0.50,
    precoVenda: 1200.00,
    acabamento: 'Pintura para alta temperatura 600°C preto fosco'
  },
  {
    titulo: 'Churrasqueira Bafo',
    nome: 'Churrasqueira a Bafo com Grelha Dupla, Chaminé e Rodízios',
    larguraM: 0.90,
    alturaM: 1.10,
    profundidadeM: 0.60,
    precoVenda: 950.00,
    acabamento: 'Pintura para alta temperatura 600°C preto fosco'
  },
  {
    titulo: 'Bancada Industrial',
    nome: 'Bancada / Mesa Industrial em Metalon Reforçado com Pés Niveladores',
    larguraM: 1.50,
    alturaM: 0.85,
    profundidadeM: 0.70,
    precoVenda: 850.00,
    acabamento: 'Pintura primer zarcão cinza e esmalte sintético'
  },
  {
    titulo: 'Lixeira de Calçada',
    nome: 'Lixeira Reforçada de Calçada com Tampa Basculante e Pedestal',
    larguraM: 1.00,
    alturaM: 1.20,
    profundidadeM: 0.50,
    precoVenda: 480.00,
    acabamento: 'Pintura esmalte sintético preto brilhante'
  }
];

interface ItemBuilderProps {
  materiais: MaterialPerfil[];
  onAdicionarItem: (item: ItemOrcamento) => void;
  onAbrirGerenciadorMateriais?: () => void;
}

export const ItemBuilder: React.FC<ItemBuilderProps> = ({ 
  materiais, 
  onAdicionarItem,
  onAbrirGerenciadorMateriais 
}) => {
  const [modoConstrucao, setModoConstrucao] = useState<'parametrico' | 'especial'>('parametrico');

  // Estado de Esquadrias Paramétricas
  const [tipoEstrutura, setTipoEstrutura] = useState<TipoEstrutura>('portao_basculante');
  const [descricao, setDescricao] = useState('');
  const [larguraM, setLarguraM] = useState<number>(3.00);
  const [alturaM, setAlturaM] = useState<number>(2.20);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [acabamento, setAcabamento] = useState('Pintura primer anticorrosivo cinza zarcão');

  // Estado de Fabricação Especial (Churrasqueiras, Bancadas, etc. - Preço de Venda Direto)
  const [nomeEspecial, setNomeEspecial] = useState('Churrasqueira Parrilla em Aço Carbono com Grelha Inox');
  const [larguraEsp, setLarguraEsp] = useState<number>(0.80);
  const [alturaEsp, setAlturaEsp] = useState<number>(0.90);
  const [profundidadeEsp, setProfundidadeEsp] = useState<number>(0.50);
  const [precoVendaEsp, setPrecoVendaEsp] = useState<number>(1200.00);
  const [acabamentoEsp, setAcabamentoEsp] = useState('Pintura para alta temperatura 600°C preto fosco');
  const [quantidadeEsp, setQuantidadeEsp] = useState<number>(1);

  // Perfis selecionados
  const modeloAtual = CATALOGO_MODELOS_PADRAO.find(m => m.tipo === tipoEstrutura) || CATALOGO_MODELOS_PADRAO[0];
  const [perfilQuadroId, setPerfilQuadroId] = useState<string>(modeloAtual.perfilQuadroPadraoId);
  const [perfilPreenchimentoId, setPerfilPreenchimentoId] = useState<string>(modeloAtual.perfilPreenchimentoPadraoId);
  const [espacamentoCm, setEspacamentoCm] = useState<number>(modeloAtual.espacamentoReguasPadraoCm);
  const [numeroTravessas, setNumeroTravessas] = useState<number>(modeloAtual.numeroTravessasPadrao ?? 1);

  // Ao trocar modelo, sincronizar padrões
  const handleTrocaModelo = (novoTipo: TipoEstrutura) => {
    setTipoEstrutura(novoTipo);
    const m = CATALOGO_MODELOS_PADRAO.find(mod => mod.tipo === novoTipo) || CATALOGO_MODELOS_PADRAO[0];
    setPerfilQuadroId(m.perfilQuadroPadraoId);
    setPerfilPreenchimentoId(m.perfilPreenchimentoPadraoId);
    setEspacamentoCm(m.espacamentoReguasPadraoCm);
    setNumeroTravessas(m.numeroTravessasPadrao ?? 0);
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
    espacamentoReguasCm: espacamentoCm,
    numeroTravessas
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

  const handleAplicarPreset = (preset: typeof PRESETS_ESPECIAIS[0]) => {
    setNomeEspecial(preset.nome);
    setLarguraEsp(preset.larguraM);
    setAlturaEsp(preset.alturaM);
    setProfundidadeEsp(preset.profundidadeM);
    setPrecoVendaEsp(preset.precoVenda);
    setAcabamentoEsp(preset.acabamento);
  };

  const handleSalvarEspecial = (e: React.FormEvent) => {
    e.preventDefault();

    const qtd = Math.max(1, Number(quantidadeEsp));
    const precoUnit = Number(precoVendaEsp) || 0;
    const novoItem: ItemOrcamento = {
      id: 'item-esp-' + Math.random().toString(36).substring(2, 9),
      orcamentoId: '',
      descricao: nomeEspecial.trim() || 'Fabricação Especial Sob Medida',
      tipoEstrutura: 'fabricacao_especial',
      medidas: {
        larguraM: Number(larguraEsp),
        alturaM: Number(alturaEsp),
        profundidadeM: profundidadeEsp ? Number(profundidadeEsp) : undefined
      },
      quantidadeUnidades: qtd,
      acabamento: acabamentoEsp,
      pecasDemandadas: [],
      acessorios: [],
      horasFabricacao: 0,
      horasInstalacao: 0,
      ajustesManuais: {
        precoVendaManual: precoUnit
      },
      subtotalCustoDireto: 0,
      subtotalPrecoVenda: precoUnit * qtd
    };

    onAdicionarItem(novoItem);
  };

  return (
    <form 
      onSubmit={modoConstrucao === 'parametrico' ? handleSalvarItem : handleSalvarEspecial} 
      className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            {modoConstrucao === 'parametrico' ? (
              <Box className="w-5 h-5 text-amber-500" />
            ) : (
              <Flame className="w-5 h-5 text-amber-500" />
            )}
            Adicionar Produto / Estrutura ao Orçamento
          </h3>
          <span className="text-xs text-slate-400">
            {modoConstrucao === 'parametrico' 
              ? 'Cálculo paramétrico de barras comerciais de 6m automático'
              : 'Precificação de peças artesanais sob medida (churrasqueiras, bancadas, etc.)'
            }
          </span>
        </div>

        {/* Abas de Modo de Construção */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setModoConstrucao('parametrico')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              modoConstrucao === 'parametrico'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Esquadrias (Corte 1D)
          </button>
          <button
            type="button"
            onClick={() => setModoConstrucao('especial')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              modoConstrucao === 'especial'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Fabricação Especial
          </button>
        </div>
      </div>

      {modoConstrucao === 'parametrico' ? (
        <>
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

          {/* Perfis Selecionados, Travessas e Quantidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-400">
                  Perfil do Requadro / Quadro
                </label>
                {onAbrirGerenciadorMateriais && (
                  <button
                    type="button"
                    onClick={onAbrirGerenciadorMateriais}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline"
                    title="Cadastrar novo metalon ou atualizar preços"
                  >
                    + Gerenciar Perfis
                  </button>
                )}
              </div>
              <select
                value={perfilQuadroId}
                onChange={(e) => setPerfilQuadroId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {materiais.filter(m => m.ativo !== false || m.id === perfilQuadroId).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.descricao} (R$ {m.precoBarra6m.toFixed(2)}/barra 6m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs text-slate-400">
                  Perfil das Réguas / Preenchimento
                </label>
                {onAbrirGerenciadorMateriais && (
                  <button
                    type="button"
                    onClick={onAbrirGerenciadorMateriais}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline"
                    title="Cadastrar novo metalon ou atualizar preços"
                  >
                    + Gerenciar Perfis
                  </button>
                )}
              </div>
              <select
                value={perfilPreenchimentoId}
                onChange={(e) => setPerfilPreenchimentoId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {materiais.filter(m => m.ativo !== false || m.id === perfilPreenchimentoId).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.descricao} (R$ {m.precoBarra6m.toFixed(2)}/barra 6m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>Travessas Intermediárias</span>
                <span className="text-[10px] text-amber-500 font-mono">Reforço</span>
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setNumeroTravessas(prev => Math.max(0, prev - 1))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-l-lg border border-r-0 border-slate-700 text-xs font-bold transition-colors"
                  title="Diminuir travessas"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={numeroTravessas}
                  onChange={(e) => setNumeroTravessas(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
                  className="w-full bg-slate-950 border-y border-slate-800 py-1.5 text-center text-sm font-semibold text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setNumeroTravessas(prev => Math.min(20, prev + 1))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-r-lg border border-l-0 border-slate-700 text-xs font-bold transition-colors"
                  title="Aumentar travessas"
                >
                  +
                </button>
              </div>
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
        </>
      ) : (
        <div className="space-y-5">
          {/* Presets Rápidos */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Exemplos Prontos (Clique para carregar dimensões e preço sugerido)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS_ESPECIAIS.map((preset) => (
                <button
                  key={preset.titulo}
                  type="button"
                  onClick={() => handleAplicarPreset(preset)}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-amber-500/60 hover:bg-amber-500/5 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 block mb-1">
                    {preset.titulo}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {preset.larguraM}m x {preset.alturaM}m{preset.profundidadeM ? ` x ${preset.profundidadeM}m` : ''}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold mt-1 block">
                    Preço: R$ {preset.precoVenda.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nome e Dimensões 3D */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-5">
              <label className="block text-xs text-slate-400 mb-1">
                Nome / Descrição da Peça Sob Medida
              </label>
              <input
                type="text"
                required
                value={nomeEspecial}
                onChange={(e) => setNomeEspecial(e.target.value)}
                placeholder="Ex: Churrasqueira Parrilla em Aço Carbono com Grelha Inox"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Largura / Frente (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  max="20.00"
                  required
                  value={larguraEsp}
                  onChange={(e) => setLarguraEsp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">m</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Altura (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.10"
                  max="20.00"
                  required
                  value={alturaEsp}
                  onChange={(e) => setAlturaEsp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">m</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 flex items-center justify-between">
                <span>Profundidade (m)</span>
                <span className="text-[10px] text-amber-500 font-mono">3D</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10.00"
                  value={profundidadeEsp}
                  onChange={(e) => setProfundidadeEsp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">m</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantidadeEsp}
                onChange={(e) => setQuantidadeEsp(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Acabamento / Pintura
              </label>
              <input
                type="text"
                value={acabamentoEsp}
                onChange={(e) => setAcabamentoEsp(e.target.value)}
                placeholder="Ex: Pintura alta temp. 600°C"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Preço de Venda Direto */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Preço de Venda Unitário (R$)
                </label>
                <p className="text-xs text-slate-400">
                  Valor final cobrado ao cliente por unidade (sem exigir cálculo de custo de materiais nem horas de oficina).
                </p>
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-amber-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={precoVendaEsp}
                  onChange={(e) => setPrecoVendaEsp(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-lg pl-10 pr-3 py-2 text-base font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Resumo e Botão Adicionar Especial */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-lg">
            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <div>
                Dimensões: <strong>{larguraEsp}m x {alturaEsp}m{profundidadeEsp ? ` x ${profundidadeEsp}m` : ''}</strong>
              </div>
              <div>
                Qtd: <strong>{quantidadeEsp}x</strong>
              </div>
              <div className="text-amber-400 font-bold">
                Valor Total: <strong>R$ {(precoVendaEsp * Math.max(1, quantidadeEsp)).toFixed(2)}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer ml-auto"
            >
              <Flame className="w-4 h-4" />
              Adicionar ao Orçamento
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
