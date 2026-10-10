# ARQUITETURA — CifrasONE (`cifras-violao`)

Briefing para quem (pessoa ou IA) for mexer neste repositório. Leia antes de editar.

Site estático (GitHub Pages), sem framework nem build: HTML, CSS e JavaScript puros.
Publicado em `solverone.com.br/cifras-violao/` (antes `marceloneco.github.io/cifras-violao/`).
Todos os apps SolverONE moram na **mesma origem**: o cofre de IA, o idioma e o login
valem para todos. **Nunca fixe endereço no código** — links entre apps são relativos (`../rise-one/`).

## O que cada arquivo faz

| Arquivo | O que é | Pode mexer? |
|---|---|---|
| `diretrizes.js` | **Módulo comum SolverONE** (global `DGO`, versão em `DGO.versao`, hoje **1.9.0**, cópia exata do master do `rootify-one`). Idioma e datas, faixa de anúncios (carrossel + pop-up), conta/login, notificações, nuvem, OCR, níveis, rede, cofre de IA, wizard, interruptores e manutenção (`DGO.recursos`), trabalho em fundo (`DGO.fundo`), 💬 feedback (`DGO.feedback`), "O seu aparelho" (`DGO.compat`). **Não tem mais o AssistONE.** | **Não edite aqui por causa deste app.** É idêntico em todos os apps. Uma melhoria feita aqui deve ser copiada para os outros repositórios (o número de versão sobe). Ver "O que mudou no módulo" abaixo. |
| `assistone.js` | **AssistONE** (personagem, balão "📍 Você está em…", tour, busca, dicas, painel de comandos do modo celular, cartão em ⚙, 💬 no balão). Arquivo próprio, cópia exata do master do `rootify-one` (v1.0.0), igual em todos os apps. Registra `DGO.assistente` com os mesmos nomes do 1.1.4 e usa as mesmas chaves de preferência (`dgo:cifras-violao:pref:aone:*`): quem desligou continua desligado. O conteúdo vem do `assistente:` do `diretrizes-config.js`. | **Não edite** (copie de novo do master). |
| `recursos.js` | **Interruptores do RootifyONE** (Controle dos apps), cópia avulsa do master do `rootify-one` (global `SolverRecursos`; cópia de 10/Out/2026, com a manutenção). Lê `solverone-dados/recursos/global.json` e `…/cifras-violao.json` (o app vence o global); sem arquivo/sem rede vale ligado. Quem tem `data-recurso="<id>"` some sozinho. Recurso reservado `app` desligado = tela cheia "Em manutenção" (mensagem em `app.mensagem`) com "Tentar de novo". Com o módulo 1.9.0 ele só repassa para o `DGO.recursos`; o `<script>` leva `data-manutencao="nao"` porque ele carrega antes do módulo e, sem isso, punha uma segunda tela de manutenção que o "Tentar de novo" não tirava. | **Não edite** (copie de novo do master). |
| `recursos-do-app.json` | Diz ao RootifyONE o que este app obedece ("Quem obedece" e **⚡ Modo DEUS**), no formato detalhado `{id, nome{pt,en}, onde{pt,en}}`: `app` (manutenção), `assistone`, `feedback` (💬), `anuncios`, `ia`, `busca`, `filtros`, `favoritos`, `ouvir`, `tom`, `capo`, `rolagem`, `guia`, `voz`, `letra`, `so-cifra`, `palco`, `diagramas`, `afinador`, `compartilhar`, `acordes`, `campo-harmonico`, `importar`, `ocr`, `inbox` e o comportamento `assistone.dicas`. Ver "Modo DEUS" abaixo. | Sim — só liste o que o código obedece de verdade. |
| `diretrizes-config.js` | O **único** arquivo do módulo que é diferente por app: nome, cor, anúncios, IA, AssistONE (ajuda por tela, tour, dicas, busca), login, notificações, `fonteCentral`, `siteBase`, `compat.usa`, `supabase` (vazio por enquanto) e `feedback`. | Sim — é aqui que se configura o módulo. |
| `anuncios.json` | Lista dos anúncios (outros apps do portfólio) lida pelo módulo. | Sim. |
| `servicos.json` | Quem pode usar cada recurso (níveis Visitante/Membro/Premium), lido por `DGO.niveis`. | Sim. |
| `versoes.json` | Histórico de versões (PT/EN), a mais nova em cima. Vira a tela "Novidades". | Sim, a cada release. |
| `recados.json` | Avisos do administrador da plataforma para a **inbox** (`id`, `inicio`, `fim`, `nivel`: todos/membros/premium, texto PT/EN, `link`). Funciona sem servidor. | Sim. |
| `sw.js` | Service worker (offline e app instalável). Cache com o nome do app (`cifras-violao-vN`). | Só o `VERSAO` a cada release. |
| `manifest.json` | Nome, ícones e atalhos do app instalado. | Raramente. |
| `estilo.css` | Toda a aparência do site (cores em variáveis no topo; cantos em `--raio`, `--raio-m`, `--raio-p`). | Sim. |
| `idioma.js` | Tradutor **do site** (PT/EN): tabela `TEXTOS` + `data-i18n` no HTML. Coopera com o módulo: segue o idioma dele (`dgo:idioma`) e delega datas a `DGO.formatarData`. | Sim — todo texto novo nasce nas duas línguas. |
| `comum.js` | O que é igual em todas as páginas: versão, rodapé, **cabeçalho** (☰, nome do app = início, 🔍 📥 👤), **menu do 👤 perfil** (identidade conectada, Configurações, Tema, Imagem de fundo, Instalar, Sair), **📥 inbox**, **gaveta ☰**, **barra de baixo** do celular, `Camadas` (Voltar do celular), tema, imagem de fundo, favoritos, leitura de cifra. | Sim. |
| `biblioteca.js` | Página inicial: busca, categorias, favoritos, lista de músicas. | Sim. |
| `leitor.js` | Página da cifra: tom, capo, rolagem, guia de leitura, voz, modo celular, afinador. | Sim. |
| `acordes.js` / `dicionario.js` | Base de acordes e desenhos / página do dicionário. | Sim. |
| `importador.js`, `zip.js`, `leitor-pdf.js`, `pdf-*.mjs` | Página Importar (texto, .txt, .pdf, fila e .zip). A leitura do PDF roda pelo `DGO.fundo` (pílula com as páginas lidas). | Sim (os `.mjs` são biblioteca de PDF: não). |
| `ocr.js`, `ocr-worker.js`, `tesseract-core-*.wasm.js`, `*.traineddata.gz` | Página Foto: OCR **hospedado aqui** (≈11 MB), funciona offline. A leitura roda pelo `DGO.fundo` (pílula com andamento, tela acesa, aviso antes de fechar; o ↻ da pílula lê de novo). A câmera abre a **lente principal** (celular com várias câmeras às vezes abre a grande-angular, que não foca de perto), com foco contínuo, tocar para focar, 🔄 trocar de lente (guardada em `cifras:camera-lente`) e 🔦 lanterna. Por isso o OCR do módulo fica desligado no config. | `ocr.js` sim; o motor não. |
| `aviso.js`, `aviso.html` | Aviso legal e pedido de remoção (um texto só, usado na página e na janela). | Sim. |
| `*.txt` + `indice.json` | As cifras (uma por arquivo) e o índice. | Conteúdo. |
| `ajuda-botao.png` | Arte do AssistONE (a mesma nos apps). | Não. |
| `TESTE-cifras-violao.html` | Página de teste do módulo neste app. | Sim. |

## Como as páginas se montam

Cada página HTML tem só o conteúdo dela e, antes de `</body>`, a mesma sequência de scripts:
`idioma.js` → `recursos.js` → `diretrizes.js` → `diretrizes-config.js` → `assistone.js` → `acordes.js` → `comum.js` → `aviso.js` → o script da página.
O `<body data-pagina="…">` diz quem é a página; `comum.js` desenha o cabeçalho, a gaveta ☰ e a
barra de baixo a partir disso. O `main` leva `data-dgo-ignorar` para o tradutor do módulo não
mexer no texto que o `idioma.js` já traduz.

## Padrões que valem aqui (das diretrizes gerais)

- **Cabeçalho** (diretriz de 02/Out/2026, `DIRETRIZ-ASSISTONE-E-MENU.md`): ☰ na extrema esquerda e o
  nome do app logo depois (tocar = início; não existe mais 🏠); à direita, da extrema direita para a
  esquerda, só **👤 perfil · 📥 inbox · 🔍 busca** (na cifra também ☆ ⤴ 🎵 antes deles). Sem ⚙ fixo e
  sem PT|EN no topo: o idioma mora em **Configurações → Idioma** (desenhado pelo módulo).
- **👤 perfil** (`montarPerfil`/`pintarPerfil` em `comum.js`): foto ou iniciais + apelido no computador;
  o menu cresce a partir do botão (0,2 s, `prefers-reduced-motion` respeitado) com a identidade
  conectada no cabeçalho (nome, apelido · e-mail, plano, conectado desde, via) e, nesta ordem:
  Configurações, Tema (toggle), Imagem de fundo (toggle), Instalar o app, **Sair** (vermelho).
  Visitante vê "Visitante" e **Entrar**. Segue `dgo:entrou`/`dgo:saiu`.
- **🔍 busca** (`abrirBusca`): no Início e nos Acordes vai para a caixa de busca da página; nas outras
  telas abre a busca do AssistONE (índice `busca` do `diretrizes-config.js`).
- **📥 inbox** (`abrirInbox`/`contarInbox`): avisos da plataforma (`recados.json`, filtrados por
  data e nível) + avisos do app (versão nova → Novidades; lembretes da agenda do módulo). Lidas e
  arquivadas em `localStorage` (`cifras:inbox-lidas`, `cifras:inbox-arquivo`); contador no botão
  (`aria-live`) e no ícone do app instalado (`DGO.notificacoes.distintivo`). Nada é apagado sozinho.
- **☰**: gaveta lateral em grupos (Tocar · Trazer cifras · Configurações · Ajuda e mais).
- **Palavras**: sempre "Configurações" (EN "Settings"); nunca "Ajustes".
- **Barra de baixo** (celular, menos na cifra): Início · Acordes · Importar · Foto.
- **Voltar do celular** fecha o que está aberto (☰, afinador, modo celular) — tudo passa por `Camadas` em `comum.js`.
- **AssistONE** (`assistone.js`): sempre visível, some com janela/menu/tela cheia; conteúdo em `diretrizes-config.js → assistente`.
  Personagem conforme a diretriz (seção 1): `ajuda-botao.png` (md5 `00d65eed…`), botão 58 px, fundo
  escuro nos dois temas, anel dourado, balanço −6 px / 3,2 s. No modo celular ele fica menor (46 px) e
  à esquerda, mas **continua balançando** (`estilo.css`); `prefers-reduced-motion` desliga.
- **Faixa do topo é só anúncio** (módulo). Nem idioma nem IA moram nela.
- **IA**: `DGO.ia.*`. A chave é da pessoa, fica só no navegador, vale em todos os apps. Se a IA escolhida
  falhar (cota, crédito, chave), o módulo passa sozinho para a próxima com chave e avisa (`dgo:ia-troca`).
- **💬 Feedback** (`DGO.feedback`, módulo 1.9.0): no balão do AssistONE, no ☰ → Ajuda e mais (`data-abre-feedback` em `comum.js`, com a tela de onde veio) e em ⚙ → Ajuda e opinião (desenhado pelo módulo). Pergunta do dia ligada, mas nunca no modo celular nem com o afinador aberto (`feedback.naoPerguntarAgora`). O app não tem tela de erro própria, então não há 💬 nela.
- **Release**: subir `versaoApp` (config), `VERSAO` (comum.js), `VERSAO` (sw.js) e uma entrada no `versoes.json` com data e hora.

## ⚡ Modo DEUS (2.10.0)

Cada função principal tem um id no `recursos-do-app.json` e obedece assim:

- **Some da tela:** `data-recurso="<id>"` no HTML (`index.html`, `cifra.html`, `acordes.html`, `importar.html`,
  `ocr.html`), no que o `comum.js` desenha (topo ☆ ⤴ 🎵 🔍 📥, ☰ e barra de baixo pelo campo `recurso` de
  `PAGINAS`) e na ★ da lista (`biblioteca.js`). Telas inteiras (`acordes`, `importar`, `ocr`): somem do ☰ e da
  barra de baixo, e o `<main>` da tela fica vazio.
- **Painel do modo celular** (AssistONE, `diretrizes-config.js`): cada linha leva o `data-recurso` do comando.
- **Lógica:** teclas de espaço/↑/↓ (`rolagem`) e + − (`tom`) em `leitor.js` perguntam `recursoLigado()`;
  atalhos e itens da busca do AssistONE com `recurso` desligado saem da lista (`cifrasSo` no config, vale na
  próxima tela aberta).
- **Nunca somem:** ⚙ Configurações, o ✕ "Sair do modo celular", Novidades, Aviso legal e o perfil 👤.

## Módulo comum 1.9.0 + `assistone.js` 1.0.0 (CifrasONE 2.11.0, 10/Out/2026)

O app saiu do módulo 1.1.4 para o 1.9.0. Como o 1.9.0 não tem mais o AssistONE, ele veio no arquivo próprio
`assistone.js` (decisão do dono), carregado logo depois do config em todas as páginas. Conferido no Chromium,
tela por tela, antes e depois: personagem, "Olá", balão de cada tela, tour, busca, dica uma vez só, painel de
comandos do modo celular, cartão "💡 AssistONE" em ⚙ (depois de Idioma) e o aviso "desligado pela administração".

- **Config** (`diretrizes-config.js`): `fonteCentral: '/solverone-dados/'`, `siteBase: ''` (mesma origem dos apps),
  `compat.usa` (câmera, microfone, som, tela acesa, ler em voz alta, preferências, notificações), `supabase` **vazio**
  (o banco do feedback ainda não existe: o envio fica guardado no aparelho e a pessoa é avisada) e `feedback`.
- **Trabalho demorado**: Foto (OCR) e PDF do Importar rodam pelo `DGO.fundo`. O `tarefas.js` continua carregado na
  Foto, mas não faz nada (o módulo já traz `DGO.tarefa`).
- **Contorno no config** (`anuncios.imagem: true`): o 1.9.0, ao trocar o idioma com a faixa de anúncio na tela,
  chama `imagemPlaceholder()`, que não existe; a troca parava no meio e o site não mudava de língua. O campo só é
  lido nessa linha. Tirar quando o master for corrigido.

**Pendências** (fora do que foi pedido nesta versão):
1. Corrigir no master (`rootify-one/diretrizes.js`, `redesenharInterfaceDGO`) a chamada a `imagemPlaceholder()`
   (o 1.1.4 chamava `montarFaixa()`); depois, tirar o `anuncios.imagem: true` daqui.
2. `recursos.js` antes do módulo: o master poderia esconder a tela de manutenção dele quando o `DGO.recursos`
   aparece (hoje resolvido aqui com `data-manutencao="nao"`).
3. As escolhas do Controle dos apps guardadas pelo `recursos.js` (`dgo:cifras-violao:central:…`) não são lidas pelo
   módulo (`dgo:global:central:…`): na primeira abertura **sem internet** depois da atualização, o que o módulo
   decide (AssistONE, IA, anúncios, manutenção) pode aparecer ligado até a próxima abertura com rede.
4. Preencher `supabase: { url, anonKey }` (chave **pública**) quando o banco do feedback existir.
5. Sugestão: tirar o `tarefas.js` (sem uso desde o 1.9.0) da Foto, do `sw.js` e do repositório.

## O que mudou no módulo (`diretrizes.js`) neste repositório

Mudanças feitas aqui que precisam ser copiadas para os outros apps (o módulo deve ser idêntico):

- **1.1.4 (02/Out/2026, CifrasONE 2.8.0)** — AssistONE conforme `DIRETRIZ-ASSISTONE-E-MENU.md` §1:
  `.dgo-aone-bt` com `animation: dgo-aone-flutua 3.2s` e `@keyframes` até `translateY(-6px)` (antes 4,5 s / −4 px);
  `.dgo-aone-bt img` com `width/height: 100%`, `object-fit: cover`, `border-radius: 50%` (antes 82 % / contain
  com sombra); `#dgo-aone` em `right: 16px` e `bottom: calc(16px + …)` no celular e no computador (antes 12/22 px);
  o botão nasce com `aria-expanded="false"`. Só CSS e um atributo — nenhuma função mudou.
