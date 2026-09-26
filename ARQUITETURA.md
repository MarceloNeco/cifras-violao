# ARQUITETURA — CifrasONE (`cifras-violao`)

Briefing para quem (pessoa ou IA) for mexer neste repositório. Leia antes de editar.

Site estático (GitHub Pages), sem framework nem build: HTML, CSS e JavaScript puros.
Publicado em `solverone.com.br/cifras-violao/` (antes `marceloneco.github.io/cifras-violao/`).
Todos os apps SolverONE moram na **mesma origem**: o cofre de IA, o idioma e o login
valem para todos. **Nunca fixe endereço no código** — links entre apps são relativos (`../rise-one/`).

## O que cada arquivo faz

| Arquivo | O que é | Pode mexer? |
|---|---|---|
| `diretrizes.js` | **Módulo comum SolverONE** (global `DGO`, versão em `DGO.versao`). Idioma e datas, faixa de anúncios (carrossel + pop-up), conta/login, notificações, nuvem, OCR, níveis, rede, cofre de IA, wizard, **AssistONE**. | **Não edite aqui por causa deste app.** É idêntico em todos os apps. Uma melhoria feita aqui deve ser copiada para os outros repositórios (o número de versão sobe). |
| `diretrizes-config.js` | O **único** arquivo do módulo que é diferente por app: nome, cor, anúncios, IA, AssistONE (ajuda por tela, tour, dicas, busca), login, notificações. | Sim — é aqui que se configura o módulo. |
| `anuncios.json` | Lista dos anúncios (outros apps do portfólio) lida pelo módulo. | Sim. |
| `servicos.json` | Quem pode usar cada recurso (níveis Visitante/Membro/Premium), lido por `DGO.niveis`. | Sim. |
| `versoes.json` | Histórico de versões (PT/EN), a mais nova em cima. Vira a tela "Novidades". | Sim, a cada release. |
| `sw.js` | Service worker (offline e app instalável). Cache com o nome do app (`cifras-violao-vN`). | Só o `VERSAO` a cada release. |
| `manifest.json` | Nome, ícones e atalhos do app instalado. | Raramente. |
| `estilo.css` | Toda a aparência do site (cores em variáveis no topo; cantos em `--raio`, `--raio-m`, `--raio-p`). | Sim. |
| `idioma.js` | Tradutor **do site** (PT/EN): tabela `TEXTOS` + `data-i18n` no HTML. Coopera com o módulo: segue o idioma dele (`dgo:idioma`) e delega datas a `DGO.formatarData`. | Sim — todo texto novo nasce nas duas línguas. |
| `comum.js` | O que é igual em todas as páginas: versão, rodapé, **cabeçalho** (☰, marca, PT\|EN, ⚙ 🏠 ☺), **gaveta ☰**, **barra de baixo** do celular, `Camadas` (Voltar do celular), tema, imagem de fundo, favoritos, leitura de cifra. | Sim. |
| `biblioteca.js` | Página inicial: busca, categorias, favoritos, lista de músicas. | Sim. |
| `leitor.js` | Página da cifra: tom, capo, rolagem, guia de leitura, voz, modo celular, afinador. | Sim. |
| `acordes.js` / `dicionario.js` | Base de acordes e desenhos / página do dicionário. | Sim. |
| `importador.js`, `zip.js`, `leitor-pdf.js`, `pdf-*.mjs` | Página Importar (texto, .txt, .pdf, fila e .zip). | Sim (os `.mjs` são biblioteca de PDF: não). |
| `ocr.js`, `ocr-worker.js`, `tesseract-core-*.wasm.js`, `*.traineddata.gz` | Página Foto: OCR **hospedado aqui** (≈11 MB), funciona offline. Por isso o OCR do módulo fica desligado no config. | `ocr.js` sim; o motor não. |
| `aviso.js`, `aviso.html` | Aviso legal e pedido de remoção (um texto só, usado na página e na janela). | Sim. |
| `*.txt` + `indice.json` | As cifras (uma por arquivo) e o índice. | Conteúdo. |
| `ajuda-botao.png` | Arte do AssistONE (a mesma nos apps). | Não. |
| `TESTE-cifras-violao.html` | Página de teste do módulo neste app. | Sim. |

## Como as páginas se montam

Cada página HTML tem só o conteúdo dela e, antes de `</body>`, a mesma sequência de scripts:
`idioma.js` → `diretrizes.js` → `diretrizes-config.js` → `acordes.js` → `comum.js` → `aviso.js` → o script da página.
O `<body data-pagina="…">` diz quem é a página; `comum.js` desenha o cabeçalho, a gaveta ☰ e a
barra de baixo a partir disso. O `main` leva `data-dgo-ignorar` para o tradutor do módulo não
mexer no texto que o `idioma.js` já traduz.

## Padrões que valem aqui (das diretrizes gerais)

- **Cabeçalho**: ☰ e nome do app à esquerda; à direita `[PT|EN só no computador] ⚙ 🏠 ☺`
  (na cifra também ☆ ⤴ 🎵, e o ⚙ vai para o ☰ no celular para caber em 320 px).
- **☰**: gaveta lateral em grupos (Tocar · Trazer cifras · Ajustes · Ajuda e mais), PT|EN no topo dela no celular.
- **Barra de baixo** (celular, menos na cifra): Início · Acordes · Importar · Foto.
- **Voltar do celular** fecha o que está aberto (☰, afinador, modo celular) — tudo passa por `Camadas` em `comum.js`.
- **AssistONE** (módulo): sempre visível, some com janela/menu/tela cheia; conteúdo em `diretrizes-config.js → assistente`.
- **Faixa do topo é só anúncio** (módulo). Nem idioma nem IA moram nela.
- **IA**: `DGO.ia.*`. A chave é da pessoa, fica só no navegador, vale em todos os apps. Se a IA escolhida
  falhar (cota, crédito, chave), o módulo passa sozinho para a próxima com chave e avisa (`dgo:ia-troca`).
- **Release**: subir `versaoApp` (config), `VERSAO` (comum.js), `VERSAO` (sw.js) e uma entrada no `versoes.json` com data e hora.
