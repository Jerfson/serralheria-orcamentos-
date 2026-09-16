import React from 'react';
import { Orcamento, EmpresaConfig } from '../../types/orcamento';
import { Printer, MessageSquare, Copy, Check, ShieldCheck, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { gerarMensagemWhatsApp, criarLinkWhatsApp } from '../../services/whatsappService';

interface PropostaClienteA4Props {
  orcamento: Orcamento;
  empresaConfig: EmpresaConfig;
}

export const PropostaClienteA4: React.FC<PropostaClienteA4Props> = ({
  orcamento,
  empresaConfig
}) => {
  const [copiado, setCopiado] = React.useState(false);

  const mensagemWhatsApp = gerarMensagemWhatsApp(orcamento, empresaConfig);
  const linkWhatsApp = orcamento.clienteSnapshot?.telefoneWhatsApp
    ? criarLinkWhatsApp(orcamento.clienteSnapshot.telefoneWhatsApp, mensagemWhatsApp)
    : '#';

  const handleCopiarWhatsApp = () => {
    navigator.clipboard.writeText(mensagemWhatsApp);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações - Oculta na Impressão */}
      <div className="no-print bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Visão do Cliente: Folha A4 formatada sem exposição de custos de compras ou margens.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopiarWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copiado ? 'Texto Copiado!' : 'Copiar Mensagem WhatsApp'}
          </button>

          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950"
          >
            <MessageSquare className="w-4 h-4" />
            Abrir no WhatsApp
          </a>

          <button
            type="button"
            onClick={handleImprimir}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-950"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* Folha A4 Executiva da Proposta Comercial */}
      <div className="folha-a4 bg-white text-slate-900 p-10 sm:p-14 rounded-2xl sm:rounded-none shadow-2xl mx-auto max-w-4xl border border-slate-200">
        {/* Cabeçalho da Proposta */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-3">
              {empresaConfig.logoUrl ? (
                <img src={empresaConfig.logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center tracking-tighter">
                  JRV
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight uppercase text-slate-950">
                  {empresaConfig.nomeFantasia}
                </h1>
                <p className="text-xs text-slate-600 font-medium">{empresaConfig.razaoSocial}</p>
                <p className="text-xs text-slate-600">CNPJ: {empresaConfig.documento}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-3 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {empresaConfig.endereco}, {empresaConfig.cidadeUf}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp: {empresaConfig.telefoneWhatsApp}
              </span>
            </div>
          </div>

          <div className="text-right sm:self-center bg-slate-100 p-4 rounded-xl border border-slate-200 min-w-[200px]">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Proposta Comercial</div>
            <div className="text-2xl font-black text-slate-950 mt-0.5">#{orcamento.numeroSequencial}</div>
            <div className="text-xs text-slate-600 mt-1">
              Data: {new Date(orcamento.dataCriacao || Date.now()).toLocaleDateString('pt-BR')}
            </div>
            <div className="text-[11px] font-medium text-amber-700 mt-0.5">
              Válida por {orcamento.validadeDias} dias
            </div>
          </div>
        </div>

        {/* Dados do Cliente e Obra */}
        <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Cliente Contratante</div>
            <div className="text-sm font-bold text-slate-900">{orcamento.clienteSnapshot?.nome || 'Não informado'}</div>
            {orcamento.clienteSnapshot?.documento && (
              <div className="text-slate-600">CPF/CNPJ: {orcamento.clienteSnapshot.documento}</div>
            )}
            <div className="text-slate-600">Telefone: {orcamento.clienteSnapshot?.telefoneWhatsApp}</div>
          </div>

          <div>
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">Local da Obra / Instalação</div>
            <div className="text-slate-900 font-medium">
              {orcamento.clienteSnapshot?.enderecoObra?.logradouro}, {orcamento.clienteSnapshot?.enderecoObra?.numero}
            </div>
            <div className="text-slate-600">
              {orcamento.clienteSnapshot?.enderecoObra?.bairro} - {orcamento.clienteSnapshot?.enderecoObra?.cidade}/{orcamento.clienteSnapshot?.enderecoObra?.uf}
            </div>
            {orcamento.clienteSnapshot?.observacoesAcesso && (
              <div className="text-slate-500 italic mt-1 text-[11px]">
                Obs: {orcamento.clienteSnapshot.observacoesAcesso}
              </div>
            )}
          </div>
        </div>

        {/* Descrição dos Itens e Serviços */}
        <div className="space-y-4 my-8">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-2">
            Especificações dos Produtos e Serviços
          </h2>

          <div className="space-y-4">
            {orcamento.itens.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-950">{item.descricao}</h3>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Qtd: {item.quantidadeUnidades} {item.quantidadeUnidades > 1 ? 'unidades' : 'unidade'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-700">
                      <div>
                        <strong>Dimensões:</strong> {item.medidas.larguraM}m (L) x {item.medidas.alturaM}m (A){item.medidas.profundidadeM ? ` x ${item.medidas.profundidadeM}m (P)` : ''}
                      </div>
                      <div>
                        <strong>Acabamento:</strong> {item.acabamento}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo Financeiro & Condições */}
        <div className="my-8 pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3 text-xs text-slate-700">
            <h3 className="font-extrabold uppercase tracking-wider text-slate-950 text-xs">
              Condições Comerciais e Prazos
            </h3>
            <p className="leading-relaxed">
              <strong>Forma de Pagamento:</strong><br />
              {orcamento.condicoesPagamento.descricaoDetalhada}
            </p>
            <p>
              <strong>Prazo de Entrega:</strong> {orcamento.prazoEntregaDiasUteis} dias úteis a contar da aprovação e sinal.
            </p>
            <p className="flex items-center gap-1 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Garantia de {orcamento.garantiaMeses} meses contra defeitos de fabricação e soldas.
            </p>

            {empresaConfig.chavePix && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 mt-2">
                <strong>Chave PIX para Depósito do Sinal:</strong>
                <div className="font-mono text-xs font-bold text-slate-950 mt-0.5 select-all">
                  {empresaConfig.chavePix} ({empresaConfig.tipoChavePix.toUpperCase()})
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  Favorecido: {empresaConfig.razaoSocial || empresaConfig.nomeFantasia}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Valor Total da Proposta</span>
              {orcamento.descontoValor > 0 && (
                <div className="text-xs text-slate-400 line-through mt-1">
                  R$ {orcamento.precoVendaBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono mt-1">
                R$ {orcamento.precoVendaFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• Incluso material, montagem e frete até o endereço da obra.</div>
              <div>• Instalação executada por profissionais qualificados.</div>
            </div>
          </div>
        </div>

        {/* Termos e Assinatura */}
        <div className="pt-8 border-t border-slate-200 mt-10">
          <p className="text-[10px] text-slate-500 whitespace-pre-line leading-relaxed mb-10">
            {empresaConfig.termosCondicoesPadrao}
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-slate-900 pt-2">
              <strong className="block text-slate-900">{empresaConfig.nomeFantasia}</strong>
              <span className="text-slate-500 text-[11px]">Responsável Técnico</span>
            </div>
            <div className="border-t border-slate-900 pt-2">
              <strong className="block text-slate-900">{orcamento.clienteSnapshot?.nome || 'Cliente'}</strong>
              <span className="text-slate-500 text-[11px]">De Acordo / Assinatura do Contratante</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
