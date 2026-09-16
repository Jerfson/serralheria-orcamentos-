# Research & Análise Técnica: Cadastro e Gestão de Materiais e Perfis (Metalon, Cantoneiras, Barras Chatas e Tubos)

**Feature**: `003-cadastro-materiais-perfis`  
**Date**: 2026-09-16  

---

## 1. Contexto Técnico e Prática da Serralheria

Na rotina de uma oficina de serralheria, os materiais de aço comprados em barras comerciais de 6,00 metros representam a maior fatia dos custos diretos (geralmente entre 45% a 65% do custo total de fabricação).
Os tipos principais de perfis estruturais utilizados são:
1. **Tubos Retangulares (Metalon)**: 50x30, 40x20, 30x20, 80x40, etc. Utilizados em requadros, colunas e vigas.
2. **Tubos Quadrados (Metalon)**: 20x20, 30x30, 50x50, etc. Utilizados em réguas verticais, travessas e colunas.
3. **Tubos Redondos**: 1.1/4", 1.1/2", 2", 3". Utilizados em corrimãos, guarda-corpos e mastros.
4. **Cantoneiras de Abas Iguais**: 3/4", 1", 1.1/4", 1.1/2", 2". Utilizadas em trilhos de portões deslizantes, guias e reforços.
5. **Barras Chatas**: 1/2", 3/4", 1", 1.1/2" com espessuras de 1/8", 3/16", 1/4". Utilizadas em grades de segurança, frisos e fixações.
6. **Perfis U e Ferros T**: Estruturas de caixilho, guias de portão e reforço.

### Diagnóstico do Estado Atual no Código

- **Repositório de Dados**: A aplicação já possui a store `materiais` no IndexedDB gerenciada por `storageRepository.ts`, inicializada com sementes padrão de `catalogoPerfis.ts`.
- **Limitação Atual**: Não há nenhum componente de interface (UI) que permita ao serralheiro visualizar essa lista completa, pesquisar bitolas, alterar o preço da barra de 6m quando a distribuidora reajusta os valores, ou cadastrar novas bitolas que sua oficina precise comprar.

---

## 2. Decisões de Arquitetura e Componentização

### Decisão 1: Componente Dedicado `GerenciadorMateriaisModal.tsx` / `TabelaMateriais.tsx`
- Criaremos um modal moderno e responsivo (`GerenciadorMateriaisModal.tsx`) acessível tanto pelo cabeçalho da aplicação (botão com ícone de vigas/aço `Layers` ou `Package` e etiqueta "Perfis & Aço") quanto através de um botão de atalho rápido no próprio `ItemBuilder.tsx` ao lado da seleção de perfis de requadro/preenchimento ("Gerenciar Perfis e Preços").
- O componente oferece:
  - **Barra de pesquisa instantânea**: Busca por nome/descrição (ex: "50x30", "chapa 16", "cantoneira") ou código.
  - **Filtros por Tipo de Perfil**: Abas ou botões de filtro rápido ("Todos", "Metalon Retangular", "Metalon Quadrado", "Tubo Redondo", "Cantoneira", "Barra Chata", "Outros").
  - **Edição Direta de Preço na Tabela**: O usuário pode alterar o preço da barra de 6m com 1 clique e salvar em tempo real.
  - **Modal/Formulário de Cadastro de Novo Perfil**: Permite inserir um novo material com cálculo automático de peso nominal estimado ou digitação direta.
  - **Controle de Ativo/Inativo**: Permite desativar bitolas não utilizadas para não poluir os selects da aplicação.
  - **Botão de Restauração**: Restaura a tabela padrão do catálogo brasileiro em caso de necessidade.

### Decisão 2: Atualização Reativa no Estado Global da Aplicação
- Ao salvar alterações na tabela de materiais, a lista `materiais` no estado raiz (`App.tsx`) é recarregada via `storageRepository.getMateriais()`.
- Como `ItemBuilder.tsx` recebe `materiais` via props, os selects de perfis e o recálculo do custo de aço passam a refletir instantaneamente os novos preços e materiais cadastrados.

### Decisão 3: Integração no Backup JSON
- A exportação e restauração do backup via `backupService.ts` já suporta o nó `catalogoMateriais`. Garantiremos que novos perfis criados pelo usuário sejam serializados e restaurados sem nenhuma perda de dados.
