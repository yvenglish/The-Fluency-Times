# Regras de Negócio - The Fluency Times / El Tiempo de Fluencia

Este documento consolida todas as regras de negócio, comportamentos do sistema e padrões de arquitetura implementados na plataforma.

## 1. Sistema Bilíngue e Temas (Inglês / Espanhol)
- **Idiomas:** A plataforma opera como "The Fluency News" (Inglês, `en`) e "El Tiempo de Fluencia" (Espanhol, `es`).
- **Persistência:** A preferência de idioma do usuário é salva no `localStorage` do navegador sob a chave `fluency_language`.
- **Tematização Dinâmica:** 
  - O tema padrão (Inglês) utiliza cores claras e tons de roxo (ex: `#F9F9F7`, `#6633aa`, `#3b254f`).
  - O tema Espanhol aplica a classe CSS `.theme-es` no `body`, ativando o Dark Mode com paleta de vinho, ameixa e terracota (ex: `#210E16`, `#351526`, `#D96745`, `#F09A4A`).
- **Logo e Ícones:** A logo e o favicon (ícone da aba do navegador) mudam dinamicamente dependendo do idioma ativo (Logo circular roxa para EN; Logo branca para ES).
- **Leitura de Áudio (TTS):** O sistema de Text-to-Speech nativo do navegador seleciona automaticamente a voz/sotaque correto baseado na linguagem da notícia (`en-US` para inglês, `es-ES` para espanhol).

## 2. Gestão e Exibição de Notícias (Articles)
- **Banco de Dados:** As notícias ficam salvas na coleção `articles` no Firebase Firestore.
- **Isolamento de Idioma:** 
  - Toda notícia recebe uma tag de idioma (`en` ou `es`) no momento da criação.
  - A página inicial (Home) filtra e exibe APENAS as notícias correspondentes ao idioma atual do usuário.
  - **Retrocompatibilidade:** Notícias antigas no banco que não possuem o campo `language` são assumidas por padrão como Inglês (`en`).
- **Agendamento de Posts:** 
  - As notícias possuem um campo `publishDate`.
  - Se a data/hora programada estiver no futuro, a notícia não será listada na página inicial (Home) até que o momento exato seja alcançado.
- **Estrutura por Níveis:** Cada notícia possui até 3 níveis de dificuldade. Cada nível contém:
  - **Texto:** Renderizado com `white-space: pre-wrap` para respeitar as quebras de linha e parágrafos colados pelo autor.
  - **Vocabulário:** Uma lista de termos e significados (traduções).
  - **Quiz:** Perguntas de múltipla escolha para testar a compreensão.

## 3. Sistema de Categorias (Tags)
- **Categorias Base:** Politics, Economy, Technology, Pop & Art.
- **Lógica Interna vs Visual:** No banco de dados e nos links (URL), a plataforma sempre utiliza os nomes das tags em Inglês como padrão absoluto (ex: `Pop & Art`). 
- No entanto, a interface (menu superior e títulos na página inicial) traduz as tags dinamicamente para exibição (ex: "Pop & Art" vira "Pop & Arte" no espanhol), sem quebrar o filtro de busca.

## 4. Captura de Leads (WhatsApp)
- **Segmentação por Idioma:** Quando um usuário se inscreve na newsletter do WhatsApp, o sistema salva o `language` (en ou es) em que o usuário estava navegando.
- **Dados Coletados:** DDI (Código do país), Número do Telefone, Nome e Sobrenome.
- **Armazenamento:** Salvos na coleção `leads` no Firebase Firestore.

## 5. Painel Administrativo (/admin3147)
- **Criação de Conteúdo:** O autor pode escolher o idioma da notícia na hora do cadastro para que o sistema saiba onde roteá-la.
- **Formatação de Texto:** Textareas no painel administrativo possuem um botão utilitário "Espaçar Parágrafos" que injeta quebras de linha duplas (`\n\n`) automaticamente para facilitar a vida do redator caso o texto colado venha de fontes sem espaçamento (como PDFs).
- **Gestão de Leads:**
  - A aba de Leads possui filtros rápidos para visualizar todos, apenas os de Inglês ou apenas os de Espanhol.
  - Visualização inteligente: O painel exibe o idioma de cada lead e o Nome/Sobrenome em destaque.
  - Exclusão: Existe um botão (✕) para excluir leads indesejados (com um alerta de confirmação prévio para evitar exclusões acidentais).
- **Responsividade do Tema:** O painel administrativo reage ao tema em que o redator estiver navegando, garantindo alto contraste e leitura em caixas de texto independentemente se o painel estiver no modo Claro (EN) ou Escuro (ES).
