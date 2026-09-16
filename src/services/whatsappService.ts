import { Orcamento, EmpresaConfig } from '../types/orcamento';

/**
 * Gera mensagem estruturada em Markdown para envio via WhatsApp comercial
 */
export function gerarMensagemWhatsApp(orcamento: Orcamento, empresa: EmpresaConfig): string {
  const clienteNome = orcamento.clienteSnapshot?.nome || 'Cliente';
  const valorFinalFormatado = orcamento.precoVendaFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  
  let texto = `*PROPOSTA COMERCIAL - ${empresa.nomeFantasia.toUpperCase()}*\n`;
  texto += `📋 *Orçamento nº:* #${orcamento.numeroSequencial}\n`;
  texto += `👤 *Cliente:* ${clienteNome}\n`;
  texto += `📍 *Local da Obra:* ${orcamento.clienteSnapshot?.enderecoObra?.logradouro || 'Conforme combinado'}, ${orcamento.clienteSnapshot?.enderecoObra?.numero || ''} - ${orcamento.clienteSnapshot?.enderecoObra?.cidade || ''}\n\n`;

  texto += `🔧 *ITENS INCLUSOS:*\n`;
  orcamento.itens.forEach((item, index) => {
    texto += `${index + 1}. *${item.descricao}* (${item.quantidadeUnidades}x)\n`;
    texto += `   • Dimensões: ${item.medidas.larguraM}m de largura x ${item.medidas.alturaM}m de altura${item.medidas.profundidadeM ? ` x ${item.medidas.profundidadeM}m de profundidade` : ''}\n`;
    if (item.ajustesManuais?.precoVendaManual !== undefined) {
      const precoFmt = (item.ajustesManuais.precoVendaManual * item.quantidadeUnidades).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      texto += `   • Valor: R$ ${precoFmt}\n`;
    }
    texto += `   • Acabamento: ${item.acabamento}\n`;
  });

  texto += `\n💰 *CONDIÇÕES COMERCIAIS:*\n`;
  if (orcamento.descontoValor > 0) {
    texto += `• Valor original: ~R$ ${orcamento.precoVendaBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}~\n`;
    texto += `• Desconto aplicado: R$ ${orcamento.descontoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  }
  texto += `• *Valor Total:* R$ ${valorFinalFormatado}\n`;
  texto += `• *Forma de Pagamento:* ${orcamento.condicoesPagamento.descricaoDetalhada}\n`;
  texto += `• *Prazo de Fabricação/Instalação:* ${orcamento.prazoEntregaDiasUteis} dias úteis\n`;
  texto += `• *Garantia:* ${orcamento.garantiaMeses} meses em estrutura e solda\n`;

  if (empresa.chavePix) {
    texto += `\n🔑 *Chave PIX para Sinal:* ${empresa.chavePix} (${empresa.tipoChavePix.toUpperCase()})\n`;
    texto += `   Favorecido: ${empresa.razaoSocial || empresa.nomeFantasia}\n`;
  }

  texto += `\n⚠️ _Proposta válida por ${orcamento.validadeDias} dias corridos._\n`;
  texto += `Ficamos à disposição para agendar a visita de confirmação ou início da fabricação! 🤝`;

  return texto;
}

/**
 * Monta o link wa.me direto para o WhatsApp do cliente
 */
export function criarLinkWhatsApp(telefoneCliente: string, mensagem: string): string {
  const telLimpo = telefoneCliente.replace(/\D/g, '');
  const telCompleto = telLimpo.startsWith('55') ? telLimpo : `55${telLimpo}`;
  const textoCodificado = encodeURIComponent(mensagem);
  return `https://wa.me/${telCompleto}?text=${textoCodificado}`;
}
