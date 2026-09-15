export interface EnderecoObra {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep?: string;
  pontoReferencia?: string;
}

export interface Cliente {
  id: string; // UUID v4
  nome: string;
  telefoneWhatsApp: string;
  email?: string;
  documento?: string; // CPF ou CNPJ
  enderecoObra: EnderecoObra;
  observacoesAcesso?: string; // Ex: 'Portão estreito, instalação no 3º andar'
  dataCadastro: string; // ISO 8601
  dataAtualizacao: string; // ISO 8601
}
