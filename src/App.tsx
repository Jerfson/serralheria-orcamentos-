import React, { useState, useEffect, useMemo } from 'react';
import { Orcamento, ItemOrcamento, EmpresaConfig, CondicoesPagamento, StatusOrcamento } from './types/orcamento';
import { Cliente } from './types/cliente';
import { MaterialPerfil, InsumoConsumivel, AcessorioItem } from './types/material';
import { storageRepository } from './storage/storageRepository';
import { EMPRESA_CONFIG_PADRAO } from './storage/db';
import { processarPlanoCorteConsolidado } from './core/cuttingEngine';
import { calcularCustosDiretos, calcularPrecificacaoComercial } from './core/orcamentoCalculator';

// Componentes
import { ClientePicker } from './components/cliente/ClientePicker';
import { ItemBuilder } from './components/orcamento/ItemBuilder';
import { CustosMaoDeObra } from './components/orcamento/CustosMaoDeObra';
import { AcessoriosFrete } from './components/orcamento/AcessoriosFrete';
import { PainelPrecificacao } from './components/orcamento/PainelPrecificacao';
import { PlanoCorteVisual } from './components/planoCorte/PlanoCorteVisual';
import { VisaoOficina } from './components/orcamento/VisaoOficina';
import { PropostaClienteA4 } from './components/proposta/PropostaClienteA4';
import { ListaOrcamentos } from './components/orcamento/ListaOrcamentos';
import { ConfigEmpresaModal } from './components/config/ConfigEmpresaModal';
import { GerenciadorMateriaisModal } from './components/materiais/GerenciadorMateriaisModal';

// Ícones
import { 
  Hammer, 
  Scissors, 
  FileText, 
  History, 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Eye, 
  Building2,
  Layers
} from 'lucide-react';

export default function App() {
  // Estado Global
  const [abaAtiva, setAbaAtiva] = useState<'edicao' | 'corte' | 'proposta' | 'historico'>('edicao');
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(EMPRESA_CONFIG_PADRAO);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [materiais, setMateriais] = useState<MaterialPerfil[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalMateriaisAberto, setModalMateriaisAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Orçamento em Edição
  const [orcamentoAtual, setOrcamentoAtual] = useState<Orcamento>({
    id: 'orc-' + Date.now(),
    numeroSequencial: 101,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    validadeDias: 10,
    status: 'rascunho',
    clienteId: '',
    clienteSnapshot: {
      id: '',
      nome: '',
      telefoneWhatsApp: '',
      enderecoObra: { logradouro: '', numero: '', bairro: '', cidade: 'São Paulo', uf: 'SP' },
      dataCadastro: '',
      dataAtualizacao: ''
    },
    itens: [],
    planoCorteConsolidado: [],
    custoAcoTotal: 0,
    custoInsumosTotal: 0,
    custoAcessoriosTotal: 0,
    custoMaoDeObraTotal: 0,
    custoFrete: 120,
    outrosCustos: 0,
    custoDiretoTotal: 0,
    margemLucroPercentual: 40,
    metodoMargem: 'sobre_receita',
    valorLucroEstimado: 0,
    precoVendaBruto: 0,
    descontoPercentual: 0,
    descontoValor: 0,
    precoVendaFinal: 0,
    condicoesPagamento: {
      tipo: 'sinal_mais_saldo',
      percentualSinal: 50,
      valorSinal: 0,
      valorSaldoEntrega: 0,
      descricaoDetalhada: 'Entrada de 50% no fechamento + Saldo na instalação.'
    },
    prazoEntregaDiasUteis: 15,
    garantiaMeses: 12,
    textoWhatsAppFormatado: ''
  });

  // Acessórios adicionais no orçamento global
  const [acessoriosGlobais, setAcessoriosGlobais] = useState<AcessorioItem[]>([]);

  // Carregar dados iniciais
  const recarregarDados = async () => {
    await storageRepository.ensureSeedData();
    const emp = await storageRepository.getEmpresaConfig();
    const clis = await storageRepository.getClientes();
    const mats = await storageRepository.getMateriais();
    const orcs = await storageRepository.getOrcamentos();

    setEmpresaConfig(emp);
    setClientes(clis);
    setMateriais(mats);
    setOrcamentos(orcs);

    // Se cliente demo existir, já vincular ao orçamento inicial
    if (clis.length > 0 && !orcamentoAtual.clienteId) {
      setOrcamentoAtual(prev => ({
        ...prev,
        clienteId: clis[0].id,
        clienteSnapshot: clis[0]
      }));
    }
  };

  useEffect(() => {
    recarregarDados();
  }, []);

  // 1. Recalcular Plano de Corte 1D das Barras de 6m sempre que os itens mudarem
  const planoCorteCalculado = useMemo(() => {
    if (orcamentoAtual.itens.length === 0) return [];
    return processarPlanoCorteConsolidado(orcamentoAtual.itens, materiais);
  }, [orcamentoAtual.itens, materiais]);

  // Custo Total de Compra do Aço
  const custoAcoTotal = useMemo(() => {
    return planoCorteCalculado.reduce((acc, p) => acc + p.custoTotalPerfil, 0);
  }, [planoCorteCalculado]);

  // 2. Recalcular Custos Diretos
  const custosDiretos = useMemo(() => {
    // Combinar itens com acessórios globais para cálculo
    const itensComAcessorios = orcamentoAtual.itens.map(item => ({
      ...item,
      acessorios: acessoriosGlobais
    }));

    return calcularCustosDiretos({
      itens: itensComAcessorios,
      custoAcoTotal,
      custoFrete: orcamentoAtual.custoFrete,
      outrosCustos: orcamentoAtual.outrosCustos,
      empresaConfig
    });
  }, [orcamentoAtual.itens, acessoriosGlobais, custoAcoTotal, orcamentoAtual.custoFrete, orcamentoAtual.outrosCustos, empresaConfig]);

  // 3. Recalcular Precificação Comercial (BDI)
  const precificacao = useMemo(() => {
    return calcularPrecificacaoComercial({
      custoDiretoTotal: custosDiretos.custoDiretoTotal,
      margemLucroPercentual: orcamentoAtual.margemLucroPercentual,
      metodoMargem: orcamentoAtual.metodoMargem,
      descontoPercentual: orcamentoAtual.descontoPercentual,
      descontoValor: orcamentoAtual.descontoValor,
      condicoesPagamento: orcamentoAtual.condicoesPagamento
    });
  }, [
    custosDiretos.custoDiretoTotal,
    orcamentoAtual.margemLucroPercentual,
    orcamentoAtual.metodoMargem,
    orcamentoAtual.descontoPercentual,
    orcamentoAtual.descontoValor,
    orcamentoAtual.condicoesPagamento
  ]);

  // Sincronizar cálculos no objeto de orçamento
  useEffect(() => {
    setOrcamentoAtual(prev => ({
      ...prev,
      planoCorteConsolidado: planoCorteCalculado,
      custoAcoTotal: custosDiretos.custoAcoTotal,
      custoInsumosTotal: custosDiretos.custoInsumosTotal,
      custoAcessoriosTotal: custosDiretos.custoAcessoriosTotal,
      custoMaoDeObraTotal: custosDiretos.custoMaoDeObraTotal,
      custoDiretoTotal: custosDiretos.custoDiretoTotal,
      precoVendaBruto: precificacao.precoVendaBruto,
      precoVendaFinal: precificacao.precoVendaFinal,
      valorLucroEstimado: precificacao.valorLucroEstimado,
      condicoesPagamento: precificacao.condicoesPagamento
    }));
  }, [planoCorteCalculado, custosDiretos, precificacao]);

  // Ações de Itens
  const handleAdicionarItem = (item: ItemOrcamento) => {
    setOrcamentoAtual(prev => ({
      ...prev,
      itens: [...prev.itens, item]
    }));
  };

  const handleRemoverItem = (id: string) => {
    setOrcamentoAtual(prev => ({
      ...prev,
      itens: prev.itens.filter(i => i.id !== id)
    }));
  };

  const handleAtualizarItem = (itemAtualizado: ItemOrcamento) => {
    setOrcamentoAtual(prev => ({
      ...prev,
      itens: prev.itens.map(i => i.id === itemAtualizado.id ? itemAtualizado : i)
    }));
  };

  // Salvar Orçamento
  const handleSalvarOrcamento = async () => {
    setSalvando(true);
    await storageRepository.saveOrcamento(orcamentoAtual);
    const orcs = await storageRepository.getOrcamentos();
    setOrcamentos(orcs);
    setSalvando(false);
  };

  // Criar Novo Orçamento em Branco
  const handleCriarNovoOrcamento = async () => {
    const proxNum = await storageRepository.getProximoNumeroSequencial();
    const novo: Orcamento = {
      id: 'orc-' + Date.now(),
      numeroSequencial: proxNum,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      validadeDias: empresaConfig.validadeDiasPadrao || 10,
      status: 'rascunho',
      clienteId: clientes[0]?.id || '',
      clienteSnapshot: clientes[0] || orcamentoAtual.clienteSnapshot,
      itens: [],
      planoCorteConsolidado: [],
      custoAcoTotal: 0,
      custoInsumosTotal: 0,
      custoAcessoriosTotal: 0,
      custoMaoDeObraTotal: 0,
      custoFrete: 120,
      outrosCustos: 0,
      custoDiretoTotal: 0,
      margemLucroPercentual: empresaConfig.margemLucroPadrao || 40,
      metodoMargem: 'sobre_receita',
      valorLucroEstimado: 0,
      precoVendaBruto: 0,
      descontoPercentual: 0,
      descontoValor: 0,
      precoVendaFinal: 0,
      condicoesPagamento: {
        tipo: 'sinal_mais_saldo',
        percentualSinal: 50,
        valorSinal: 0,
        valorSaldoEntrega: 0,
        descricaoDetalhada: 'Entrada de 50% + Saldo na instalação.'
      },
      prazoEntregaDiasUteis: 15,
      garantiaMeses: empresaConfig.garantiaMesesPadrao || 12,
      textoWhatsAppFormatado: ''
    };

    setAcessoriosGlobais([]);
    setOrcamentoAtual(novo);
    setAbaAtiva('edicao');
  };

  // Abrir Orçamento do Histórico
  const handleAbrirOrcamento = (id: string) => {
    const o = orcamentos.find(item => item.id === id);
    if (o) {
      setOrcamentoAtual(o);
      setAbaAtiva('edicao');
    }
  };

  // Duplicar Orçamento
  const handleDuplicarOrcamento = async (original: Orcamento) => {
    const proxNum = await storageRepository.getProximoNumeroSequencial();
    const duplicado: Orcamento = {
      ...original,
      id: 'orc-' + Date.now(),
      numeroSequencial: proxNum,
      status: 'rascunho',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };
    await storageRepository.saveOrcamento(duplicado);
    const orcs = await storageRepository.getOrcamentos();
    setOrcamentos(orcs);
    setOrcamentoAtual(duplicado);
    setAbaAtiva('edicao');
  };

  // Excluir Orçamento
  const handleExcluirOrcamento = async (id: string) => {
    if (confirm('Deseja realmente excluir este orçamento?')) {
      await storageRepository.deleteOrcamento(id);
      const orcs = await storageRepository.getOrcamentos();
      setOrcamentos(orcs);
    }
  };

  // Alterar Status
  const handleAlterarStatus = async (id: string, status: StatusOrcamento) => {
    const o = orcamentos.find(item => item.id === id);
    if (o) {
      const atualizado = { ...o, status };
      await storageRepository.saveOrcamento(atualizado);
      const orcs = await storageRepository.getOrcamentos();
      setOrcamentos(orcs);
      if (orcamentoAtual.id === id) {
        setOrcamentoAtual(atualizado);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Barra de Navegação Superior (Oculta na Impressão) */}
      <header className="no-print bg-[#101726] border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-950 font-black text-lg tracking-wider">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white uppercase">
                  {empresaConfig.nomeFantasia}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Corte 1D 6m
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Orçamento Ativo: <strong className="text-amber-400 font-mono">#{orcamentoAtual.numeroSequencial}</strong> | {orcamentoAtual.clienteSnapshot?.nome || 'Sem cliente'}
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setAbaAtiva('edicao')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                abaAtiva === 'edicao'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hammer className="w-4 h-4" />
              1. Montar Orçamento
            </button>

            <button
              onClick={() => setAbaAtiva('corte')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                abaAtiva === 'corte'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-4 h-4" />
              2. Plano de Corte 1D
              {orcamentoAtual.planoCorteConsolidado.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-900 text-amber-400 text-[10px] flex items-center justify-center font-mono">
                  {orcamentoAtual.planoCorteConsolidado.reduce((a, b) => a + b.totalBarras6mNecessarias, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('proposta')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                abaAtiva === 'proposta'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              3. Proposta do Cliente
            </button>

            <button
              onClick={() => setAbaAtiva('historico')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                abaAtiva === 'historico'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Histórico ({orcamentos.length})
            </button>
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalMateriaisAberto(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 hover:border-amber-500/40 transition"
              title="Tabela de Preços e Perfis de Aço (Metalon, Cantoneiras, etc.)"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Perfis & Aço</span>
            </button>

            <button
              type="button"
              onClick={handleSalvarOrcamento}
              disabled={salvando}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
              title="Salvar no IndexedDB local"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{salvando ? 'Salvando...' : 'Salvar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setModalConfigAberto(true)}
              className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition"
              title="Configurações da Oficina e Backup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas Mobile */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-800 gap-1 bg-slate-950 text-xs">
          <button
            onClick={() => setAbaAtiva('edicao')}
            className={`px-3 py-1 rounded whitespace-nowrap ${abaAtiva === 'edicao' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
          >
            1. Orçamento
          </button>
          <button
            onClick={() => setAbaAtiva('corte')}
            className={`px-3 py-1 rounded whitespace-nowrap ${abaAtiva === 'corte' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
          >
            2. Corte 1D ({orcamentoAtual.planoCorteConsolidado.reduce((a, b) => a + b.totalBarras6mNecessarias, 0)})
          </button>
          <button
            onClick={() => setAbaAtiva('proposta')}
            className={`px-3 py-1 rounded whitespace-nowrap ${abaAtiva === 'proposta' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
          >
            3. Proposta A4
          </button>
          <button
            onClick={() => setAbaAtiva('historico')}
            className={`px-3 py-1 rounded whitespace-nowrap ${abaAtiva === 'historico' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Histórico ({orcamentos.length})
          </button>
          <button
            onClick={() => setModalMateriaisAberto(true)}
            className="px-3 py-1 rounded whitespace-nowrap bg-slate-800 text-amber-300 font-semibold border border-slate-700"
          >
            ⚙️ Perfis
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABA 1: EDIÇÃO E MONTAGEM DO ORÇAMENTO */}
        {abaAtiva === 'edicao' && (
          <div className="space-y-8">
            {/* 1. Seleção / Cadastro do Cliente */}
            <ClientePicker
              clientes={clientes}
              clienteSelecionado={orcamentoAtual.clienteSnapshot}
              onSelecionarCliente={(cli) => {
                setOrcamentoAtual(prev => ({
                  ...prev,
                  clienteId: cli.id,
                  clienteSnapshot: cli
                }));
              }}
              onNovoClienteSalvo={async (novo) => {
                await storageRepository.saveCliente(novo);
                const clis = await storageRepository.getClientes();
                setClientes(clis);
              }}
            />

            {/* 2. Construtor de Itens Paramétricos */}
            <ItemBuilder
              materiais={materiais}
              onAdicionarItem={handleAdicionarItem}
              onAbrirGerenciadorMateriais={() => setModalMateriaisAberto(true)}
            />

            {/* Lista de Itens do Orçamento */}
            {orcamentoAtual.itens.length > 0 && (
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Estruturas Inclusas no Orçamento</span>
                    <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs">
                      {orcamentoAtual.itens.length} {orcamentoAtual.itens.length === 1 ? 'item' : 'itens'}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAbaAtiva('corte')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 underline"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Ver Plano de Corte das Barras
                  </button>
                </div>

                <div className="space-y-3">
                  {orcamentoAtual.itens.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">{item.descricao}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>Qtd: <strong>{item.quantidadeUnidades}x</strong></span>
                            <span>•</span>
                            <span>Dimensões: <strong>{item.medidas.larguraM}m x {item.medidas.alturaM}m</strong></span>
                            <span>•</span>
                            <span>Peças cortadas: <strong>{item.pecasDemandadas.reduce((a, b) => a + b.quantidade, 0)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition self-end sm:self-center"
                        title="Remover estrutura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Mão de Obra e Ajustes Manuais */}
            <CustosMaoDeObra
              itens={orcamentoAtual.itens}
              empresaConfig={empresaConfig}
              onAtualizarItem={handleAtualizarItem}
            />

            {/* 4. Acessórios e Frete */}
            <AcessoriosFrete
              acessorios={acessoriosGlobais}
              custoFrete={orcamentoAtual.custoFrete}
              outrosCustos={orcamentoAtual.outrosCustos}
              onAdicionarAcessorio={(ac) => setAcessoriosGlobais(prev => [...prev, ac])}
              onRemoverAcessorio={(id) => setAcessoriosGlobais(prev => prev.filter(a => a.id !== id))}
              onAtualizarFrete={(f) => setOrcamentoAtual(prev => ({ ...prev, custoFrete: f }))}
              onAtualizarOutrosCustos={(o) => setOrcamentoAtual(prev => ({ ...prev, outrosCustos: o }))}
            />

            {/* 5. Painel de Precificação Comercial e BDI */}
            <PainelPrecificacao
              custoDiretoTotal={orcamentoAtual.custoDiretoTotal}
              margemLucroPercentual={orcamentoAtual.margemLucroPercentual}
              metodoMargem={orcamentoAtual.metodoMargem}
              descontoPercentual={orcamentoAtual.descontoPercentual}
              descontoValor={orcamentoAtual.descontoValor}
              precoVendaBruto={orcamentoAtual.precoVendaBruto}
              precoVendaFinal={orcamentoAtual.precoVendaFinal}
              valorLucroEstimado={orcamentoAtual.valorLucroEstimado}
              vendaComPrejuizo={orcamentoAtual.precoVendaFinal < orcamentoAtual.custoDiretoTotal}
              condicoesPagamento={orcamentoAtual.condicoesPagamento}
              prazoEntregaDiasUteis={orcamentoAtual.prazoEntregaDiasUteis}
              garantiaMeses={orcamentoAtual.garantiaMeses}
              onAtualizarMargem={(m) => setOrcamentoAtual(prev => ({ ...prev, margemLucroPercentual: m }))}
              onAtualizarMetodoMargem={(met) => setOrcamentoAtual(prev => ({ ...prev, metodoMargem: met }))}
              onAtualizarDesconto={(val, pct) => setOrcamentoAtual(prev => ({ ...prev, descontoValor: val, descontoPercentual: pct }))}
              onAtualizarCondicoes={(cond) => setOrcamentoAtual(prev => ({ ...prev, condicoesPagamento: cond }))}
              onAtualizarPrazo={(p) => setOrcamentoAtual(prev => ({ ...prev, prazoEntregaDiasUteis: p }))}
              onAtualizarGarantia={(g) => setOrcamentoAtual(prev => ({ ...prev, garantiaMeses: g }))}
            />

            {/* Botão de Avanço para a Proposta */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setAbaAtiva('proposta')}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-amber-950 transition active:scale-95"
              >
                <FileText className="w-5 h-5" />
                Visualizar Proposta Comercial do Cliente
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: VISÃO DA OFICINA & PLANO DE CORTE 1D */}
        {abaAtiva === 'corte' && (
          <VisaoOficina orcamento={orcamentoAtual} />
        )}

        {/* ABA 3: PROPOSTA COMERCIAL A4 (CLIENTE) */}
        {abaAtiva === 'proposta' && (
          <PropostaClienteA4
            orcamento={orcamentoAtual}
            empresaConfig={empresaConfig}
          />
        )}

        {/* ABA 4: HISTÓRICO DE ORÇAMENTOS */}
        {abaAtiva === 'historico' && (
          <ListaOrcamentos
            orcamentos={orcamentos}
            onCriarNovo={handleCriarNovoOrcamento}
            onAbrirOrcamento={handleAbrirOrcamento}
            onDuplicarOrcamento={handleDuplicarOrcamento}
            onExcluirOrcamento={handleExcluirOrcamento}
            onAlterarStatus={handleAlterarStatus}
          />
        )}
      </main>

      {/* Modal de Configurações da Empresa */}
      {modalConfigAberto && (
        <ConfigEmpresaModal
          empresaConfig={empresaConfig}
          onSalvarConfig={async (nova) => {
            await storageRepository.saveEmpresaConfig(nova);
            setEmpresaConfig(nova);
          }}
          onClose={() => setModalConfigAberto(false)}
          onDadosRestaurados={recarregarDados}
        />
      )}

      {/* Modal de Gerenciamento de Materiais e Perfis (Metalon, Cantoneiras, etc.) */}
      {modalMateriaisAberto && (
        <GerenciadorMateriaisModal
          materiais={materiais}
          onClose={() => setModalMateriaisAberto(false)}
          onMateriaisAlterados={recarregarDados}
        />
      )}
    </div>
  );
}
