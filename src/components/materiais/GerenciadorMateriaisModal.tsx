import React, { useState, useMemo } from 'react';
import { MaterialPerfil, TipoPerfil } from '../../types/material';
import { storageRepository } from '../../storage/storageRepository';
import { 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RotateCcw, 
  Filter, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface GerenciadorMateriaisModalProps {
  materiais: MaterialPerfil[];
  onClose: () => void;
  onMateriaisAlterados: () => void;
}

const TIPOS_LABELS: Record<TipoPerfil, string> = {
  tubo_retangular: 'Metalon Retangular',
  tubo_quadrado: 'Metalon Quadrado',
  tubo_redondo: 'Tubo Redondo',
  cantoneira: 'Cantoneira',
  barra_chata: 'Barra Chata',
  perfil_u: 'Perfil U',
  ferro_t: 'Ferro T'
};

export const GerenciadorMateriaisModal: React.FC<GerenciadorMateriaisModalProps> = ({
  materiais,
  onClose,
  onMateriaisAlterados
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [editandoPrecoId, setEditandoPrecoId] = useState<string | null>(null);
  const [valorPrecoEditado, setValorPrecoEditado] = useState<string>('');
  const [modoNovoPerfil, setModoNovoPerfil] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Formulário de Novo Perfil
  const [novoTipo, setNovoTipo] = useState<TipoPerfil>('tubo_retangular');
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaLargura, setNovaLargura] = useState<number>(50);
  const [novaAltura, setNovaAltura] = useState<number>(30);
  const [novaEspessura, setNovaEspessura] = useState<number>(1.20);
  const [novoPreco, setNovoPreco] = useState<number>(75.00);
  const [novoPeso, setNovoPeso] = useState<number>(8.5);

  // Auto-calcular estimativa de peso nominal
  const calcularPesoEstimado = (tipo: TipoPerfil, L: number, H: number, e: number): number => {
    let perimetroMm = 0;
    if (tipo === 'tubo_retangular' || tipo === 'tubo_quadrado') {
      perimetroMm = 2 * (L + H);
    } else if (tipo === 'cantoneira') {
      perimetroMm = L + H;
    } else if (tipo === 'barra_chata') {
      perimetroMm = L;
    } else if (tipo === 'tubo_redondo') {
      perimetroMm = Math.PI * L;
    } else {
      perimetroMm = 2 * L + H;
    }
    const areaSecaoMm2 = perimetroMm * e;
    const pesoKg = (areaSecaoMm2 * 6000 * 0.00000785);
    return Number(pesoKg.toFixed(2));
  };

  const handleMudarDimensoesNovo = (L: number, H: number, e: number, tipo: TipoPerfil = novoTipo) => {
    setNovaLargura(L);
    setNovaAltura(H);
    setNovaEspessura(e);
    const pesoEst = calcularPesoEstimado(tipo, L, H, e);
    setNovoPeso(pesoEst);

    // Sugerir descrição se estiver vazia ou padrão
    let descSugerida = '';
    if (tipo === 'tubo_retangular' || tipo === 'tubo_quadrado') {
      descSugerida = `Metalon ${L}x${H} Chapa ${e === 1.2 ? '18' : e === 1.5 ? '16' : e} (${e}mm)`;
    } else if (tipo === 'cantoneira') {
      descSugerida = `Cantoneira ${L}x${H} (${e}mm)`;
    } else if (tipo === 'barra_chata') {
      descSugerida = `Barra Chata ${L}x${e}mm`;
    } else if (tipo === 'tubo_redondo') {
      descSugerida = `Tubo Redondo Ø ${L}mm (${e}mm)`;
    }
    if (descSugerida) {
      setNovaDescricao(descSugerida);
    }
  };

  // Filtragem de Perfis
  const perfisFiltrados = useMemo(() => {
    return materiais.filter(m => {
      const matchTexto = m.descricao.toLowerCase().includes(busca.toLowerCase()) || 
                         m.codigo.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo;
      return matchTexto && matchTipo;
    });
  }, [materiais, busca, filtroTipo]);

  // Ações
  const handleIniciarEdicaoPreco = (m: MaterialPerfil) => {
    setEditandoPrecoId(m.id);
    setValorPrecoEditado(m.precoBarra6m.toFixed(2));
  };

  const handleSalvarPreco = async (m: MaterialPerfil) => {
    const precoNum = parseFloat(valorPrecoEditado);
    if (isNaN(precoNum) || precoNum <= 0) {
      alert('Informe um preço válido maior que zero.');
      return;
    }

    const atualizado: MaterialPerfil = {
      ...m,
      precoBarra6m: precoNum
    };

    await storageRepository.saveMaterial(atualizado);
    setEditandoPrecoId(null);
    setMensagemSucesso(`Preço de "${m.descricao}" atualizado para R$ ${precoNum.toFixed(2)}.`);
    setTimeout(() => setMensagemSucesso(null), 3000);
    onMateriaisAlterados();
  };

  const handleAlternarAtivo = async (m: MaterialPerfil) => {
    const atualizado: MaterialPerfil = {
      ...m,
      ativo: !m.ativo
    };
    await storageRepository.saveMaterial(atualizado);
    onMateriaisAlterados();
  };

  const handleExcluirPerfil = async (m: MaterialPerfil) => {
    if (confirm(`Deseja realmente excluir o perfil "${m.descricao}" da lista de materiais?`)) {
      await storageRepository.deleteMaterial(m.id);
      setMensagemSucesso(`Perfil "${m.descricao}" excluído.`);
      setTimeout(() => setMensagemSucesso(null), 3000);
      onMateriaisAlterados();
    }
  };

  const handleCriarNovoPerfil = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaDescricao.trim()) {
      alert('Informe a descrição do perfil.');
      return;
    }

    const idGerado = 'perfil-' + Date.now();
    const codigoGerado = novoCodigo.trim() || 'MT-' + novaLargura + novaAltura;

    const novoMaterial: MaterialPerfil = {
      id: idGerado,
      codigo: codigoGerado,
      descricao: novaDescricao.trim(),
      tipo: novoTipo,
      dimensoesMm: {
        largura: Number(novaLargura),
        altura: Number(novaAltura),
        espessuraChapaMm: Number(novaEspessura)
      },
      comprimentoBarraMm: 6000,
      pesoNominalKgPorBarra: Number(novoPeso) || 5,
      precoBarra6m: Number(novoPreco),
      ativo: true
    };

    await storageRepository.saveMaterial(novoMaterial);
    setModoNovoPerfil(false);
    setMensagemSucesso(`Novo perfil "${novoMaterial.descricao}" cadastrado com sucesso!`);
    setTimeout(() => setMensagemSucesso(null), 3000);
    onMateriaisAlterados();
  };

  const handleRestaurarPadroes = async () => {
    if (confirm('Atenção: Deseja restaurar a lista padrão de fábrica de materiais brasileiros? Os preços customizados poderão ser sobrescritos pelos padrões de fábrica.')) {
      await storageRepository.restaurarMateriaisPadrao();
      setMensagemSucesso('Catálogo padrão de materiais restaurado.');
      setTimeout(() => setMensagemSucesso(null), 3000);
      onMateriaisAlterados();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                Tabela de Materiais & Perfis de Aço (Barras de 6m)
                <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-full">
                  {materiais.length} perfis
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre e edite o preço da barra comercial de 6 metros de Metalons, Cantoneiras, Chapas e Tubos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestaurarPadroes}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 text-xs transition"
              title="Recarregar tabela padrão de bitolas brasileiras"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrão
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {mensagemSucesso && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Barra de Filtros e Ações */}
        <div className="p-6 border-b border-slate-800/80 space-y-4 shrink-0 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Campo de Busca */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por medida (50x30), chapa ou nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Botão Novo Perfil */}
            <button
              type="button"
              onClick={() => setModoNovoPerfil(!modoNovoPerfil)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg shadow-amber-950 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {modoNovoPerfil ? 'Cancelar Cadastro' : 'Cadastrar Novo Perfil de Aço'}
            </button>
          </div>

          {/* Filtros Rápidos de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Tipo:
            </span>
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'todos'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todos ({materiais.length})
            </button>
            <button
              onClick={() => setFiltroTipo('tubo_retangular')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'tubo_retangular'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Metalon Retangular
            </button>
            <button
              onClick={() => setFiltroTipo('tubo_quadrado')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'tubo_quadrado'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Metalon Quadrado
            </button>
            <button
              onClick={() => setFiltroTipo('tubo_redondo')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'tubo_redondo'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Tubo Redondo
            </button>
            <button
              onClick={() => setFiltroTipo('cantoneira')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'cantoneira'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Cantoneiras
            </button>
            <button
              onClick={() => setFiltroTipo('barra_chata')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                filtroTipo === 'barra_chata'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Barras Chatas
            </button>
          </div>
        </div>

        {/* Painel Expansível de Formulário para Novo Perfil */}
        {modoNovoPerfil && (
          <form onSubmit={handleCriarNovoPerfil} className="p-6 bg-amber-500/5 border-b border-amber-500/20 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Cadastrar Novo Perfil ou Metalon
              </h4>
              <span className="text-[11px] text-slate-400">Padrão comercial: barra de 6,00 metros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tipo de Perfil *</label>
                <select
                  value={novoTipo}
                  onChange={(e) => {
                    const t = e.target.value as TipoPerfil;
                    setNovoTipo(t);
                    handleMudarDimensoesNovo(novaLargura, novaAltura, novaEspessura, t);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                >
                  {Object.entries(TIPOS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-400 mb-1">Descrição Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Metalon 60x40 Chapa 16 (1.50mm)"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Código / Ref. (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: MT-6040-16"
                  value={novoCodigo}
                  onChange={(e) => setNovoCodigo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Largura / Base (mm)</label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={novaLargura}
                  onChange={(e) => handleMudarDimensoesNovo(parseFloat(e.target.value) || 0, novaAltura, novaEspessura)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Altura / Aba (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={novaAltura}
                  onChange={(e) => handleMudarDimensoesNovo(novaLargura, parseFloat(e.target.value) || 0, novaEspessura)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Espessura Chapa (mm)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="20"
                  value={novaEspessura}
                  onChange={(e) => handleMudarDimensoesNovo(novaLargura, novaAltura, parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-400 font-bold mb-1">Preço da Barra 6m (R$) *</label>
                <input
                  type="number"
                  step="0.10"
                  min="1"
                  required
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Peso estimado por barra: <strong className="text-slate-200 font-mono">{novoPeso} kg</strong> (base aço 7.85g/cm³)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModoNovoPerfil(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded text-xs transition"
                >
                  <Check className="w-3.5 h-3.5" /> Salvar Perfil no Catálogo
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tabela de Materiais com Rolagem */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 backdrop-blur-sm z-10">
                <tr>
                  <th className="py-3 px-4">Código / Perfil</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4 text-center">Dimensões (L x H)</th>
                  <th className="py-3 px-4 text-center">Espessura</th>
                  <th className="py-3 px-4 text-right">Preço Barra 6m</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {perfisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Nenhum perfil encontrado para o termo pesquisado.
                    </td>
                  </tr>
                ) : (
                  perfisFiltrados.map((m) => {
                    const emEdicao = editandoPrecoId === m.id;
                    return (
                      <tr 
                        key={m.id} 
                        className={`hover:bg-slate-900/70 transition-colors ${!m.ativo ? 'opacity-50 bg-slate-950/30' : ''}`}
                      >
                        {/* Descrição */}
                        <td className="py-3 px-4 font-semibold text-slate-100">
                          <div>{m.descricao}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{m.codigo}</span>
                        </td>

                        {/* Tipo */}
                        <td className="py-3 px-4 text-slate-400">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                            {TIPOS_LABELS[m.tipo] || m.tipo}
                          </span>
                        </td>

                        {/* Dimensões */}
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {m.dimensoesMm.largura} x {m.dimensoesMm.altura} mm
                        </td>

                        {/* Espessura */}
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {m.dimensoesMm.espessuraChapaMm} mm
                        </td>

                        {/* Preço Barra 6m com Edição Rápida */}
                        <td className="py-3 px-4 text-right">
                          {emEdicao ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-slate-400 text-xs font-mono">R$</span>
                              <input
                                type="number"
                                step="0.10"
                                min="1"
                                autoFocus
                                value={valorPrecoEditado}
                                onChange={(e) => setValorPrecoEditado(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSalvarPreco(m);
                                  if (e.key === 'Escape') setEditandoPrecoId(null);
                                }}
                                className="w-20 bg-slate-950 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono font-bold text-right focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSalvarPreco(m)}
                                className="p-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 rounded border border-emerald-500/30"
                                title="Confirmar preço"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditandoPrecoId(null)}
                                className="p-1 text-slate-400 hover:text-slate-200"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 group">
                              <span className="font-mono font-bold text-amber-400 text-sm">
                                R$ {m.precoBarra6m.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIniciarEdicaoPreco(m)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 transition"
                                title="Editar preço da barra"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status Ativo/Inativo */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleAlternarAtivo(m)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                              m.ativo 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'
                            }`}
                            title={m.ativo ? 'Clique para desativar do orçamento' : 'Clique para ativar no orçamento'}
                          >
                            {m.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleExcluirPerfil(m)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Excluir perfil do catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Preços refletem automaticamente em todos os orçamentos e listas de compra de barras de 6m.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            Fechar Tabela
          </button>
        </div>
      </div>
    </div>
  );
};
