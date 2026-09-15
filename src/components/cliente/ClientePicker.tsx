import React, { useState } from 'react';
import { Cliente } from '../../types/cliente';
import { User, Phone, MapPin, Plus, Check, Search, X } from 'lucide-react';

interface ClientePickerProps {
  clientes: Cliente[];
  clienteSelecionado: Cliente | null;
  onSelecionarCliente: (cliente: Cliente) => void;
  onNovoClienteSalvo: (cliente: Cliente) => void;
}

export const ClientePicker: React.FC<ClientePickerProps> = ({
  clientes,
  clienteSelecionado,
  onSelecionarCliente,
  onNovoClienteSalvo
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');

  // Formulário de novo cliente
  const [nome, setNome] = useState('');
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState('');
  const [documento, setDocumento] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('SP');
  const [observacoesAcesso, setObservacoesAcesso] = useState('');

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefoneWhatsApp.includes(busca)
  );

  const handleSalvarNovo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefoneWhatsApp.trim()) return;

    const novo: Cliente = {
      id: 'cli-' + Date.now(),
      nome,
      telefoneWhatsApp,
      documento,
      enderecoObra: {
        logradouro,
        numero,
        bairro,
        cidade: cidade || 'São Paulo',
        uf: uf || 'SP'
      },
      observacoesAcesso,
      dataCadastro: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString()
    };

    onNovoClienteSalvo(novo);
    onSelecionarCliente(novo);
    setModalAberto(false);

    // Resetar
    setNome('');
    setTelefoneWhatsApp('');
    setDocumento('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setCidade('');
    setObservacoesAcesso('');
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-500" />
          Cliente & Local da Obra
        </h3>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Cliente
        </button>
      </div>

      {clienteSelecionado ? (
        <div className="p-4 bg-slate-950/70 rounded-lg border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">{clienteSelecionado.nome}</h4>
              {clienteSelecionado.documento && (
                <span className="text-[11px] text-slate-500 font-mono">({clienteSelecionado.documento})</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                {clienteSelecionado.telefoneWhatsApp}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                {clienteSelecionado.enderecoObra.logradouro}, {clienteSelecionado.enderecoObra.numero} - {clienteSelecionado.enderecoObra.bairro}, {clienteSelecionado.enderecoObra.cidade}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="text-xs text-slate-400 hover:text-amber-400 self-start sm:self-center transition underline underline-offset-4"
          >
            Trocar cliente
          </button>
        </div>
      ) : (
        <div
          onClick={() => setModalAberto(true)}
          className="p-4 bg-slate-950/40 rounded-lg border border-dashed border-slate-800 hover:border-amber-500/50 text-center cursor-pointer transition text-xs text-slate-400"
        >
          Nenhum cliente vinculado a este orçamento. <span className="text-amber-400 font-semibold">Clique para selecionar ou cadastrar.</span>
        </div>
      )}

      {/* Modal de Seleção / Cadastro de Cliente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Selecionar ou Cadastrar Cliente
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Busca Rápida de Clientes Existentes */}
            <div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou WhatsApp..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {clientesFiltrados.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-800/80 rounded-lg p-2 bg-slate-950/50">
                  {clientesFiltrados.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelecionarCliente(c);
                        setModalAberto(false);
                      }}
                      className="p-2.5 rounded-md hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition border border-transparent hover:border-slate-700"
                    >
                      <div>
                        <strong className="text-slate-200 block">{c.nome}</strong>
                        <span className="text-[11px] text-slate-400">{c.telefoneWhatsApp} | {c.enderecoObra.cidade}</span>
                      </div>
                      {clienteSelecionado?.id === c.id && (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Selecionado
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário Novo Cadastro */}
            <form onSubmit={handleSalvarNovo} className="space-y-4 pt-3 border-t border-slate-800">
              <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Ou Cadastre um Novo Cliente
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Carlos Roberto Mendes"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    value={telefoneWhatsApp}
                    onChange={(e) => setTelefoneWhatsApp(e.target.value)}
                    placeholder="Ex: 11999998888"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Logradouro / Rua da Obra</label>
                  <input
                    type="text"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Rua das Acácias"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Número</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bela Vista"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">UF</label>
                  <input
                    type="text"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    placeholder="SP"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded text-xs transition"
                >
                  Salvar e Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
