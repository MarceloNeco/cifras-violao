/* =====================================================================
   CifrasONE (antigo Cifras de Violão)  —  configuracao
   ---------------------------------------------------------------------
   ESTE e o unico arquivo diferente entre os seus apps.
   O diretrizes.js e identico em todos; aqui ficam o nome, a cor, as
   traducoes, os avisos, a IA e o AssistONE deste app. Para mudar
   qualquer ajuste, mude AQUI e suba este arquivo de novo. O index.html
   nao precisa ser tocado.
   ===================================================================== */
DGO.iniciar({

  /* ---------- identidade ---------- */
  app: 'cifras-violao',            /* NAO TROQUE. E o nome da gaveta onde este app
                                guarda os dados. Seus sites moram todos na mesma
                                origem, e e isto que impede os dados de um
                                vazarem para o outro. */
  nome: { pt: 'CifrasONE', en: 'CifrasONE' },
  versaoApp: '2.7.0',
  cor: '#a8501e',            /* o marrom-laranja do site de cifras */
  corFundoBarra: '#1a1614',

  /* ---------- idioma e datas ---------- */
  idiomaPadrao: 'pt',                    /* 'pt' ou 'en' */
  idiomaCompartilhado: true,             /* o idioma escolhido vale em todos os seus sites */
  /* O botao PT|EN e desenhado pelo proprio site (comum.js): no computador
     fica no cabecalho, no celular dentro do menu ☰ — como manda a diretriz.
     Por isso o seletor flutuante do modulo fica desligado. */
  seletorIdiomaVisivel: false,
  datasAutomaticas: true,

  /* ---------- faixa do topo: so anuncio ----------
     O carrossel e o pop-up (3, 2, 1 e ×) sao do modulo. A lista vem do
     anuncios.json na raiz (mesmo arquivo dos outros apps). */
  anuncios: {
    ativo: true,
    arquivo: 'anuncios.json',
    /* enquanto uma destas telas estiver aberta a faixa some sozinha,
       e volta quando ela fecha */
    esconderCom: ['body.modo-palco', '#afinador[aberta]'],
    popup: { ativo: true, antesDoLogin: true, depoisDoLogin: true, esperaSegundos: 3 }
  },

  /* ---------- IA (cofre de chaves compartilhado entre os apps) ----------
     O botao ✨ nao mora na faixa do topo (ela e so do anuncio): a IA fica em
     ⚙ Configuracoes → IA, e o cofre abre por DGO.ia.chaves(). */
  ia: {
    ativo: true,
    botaoNaFaixa: false,
    contexto: {
      pt: 'O app mostra cifras de violão com rolagem automática, troca de tom, capotraste, desenhos dos acordes, afinador e importação de cifras por texto ou foto.',
      en: 'The app shows guitar chord charts with auto-scroll, key change, capo, chord diagrams, a tuner, and imports charts from text or photos.'
    },
    sugestoes: [
      { pt: 'Como mudo o tom de uma música?', en: 'How do I change the key of a song?' },
      { pt: 'Que acordes formam o campo harmônico de G?', en: 'Which chords form the harmonic field of G?' },
      { pt: 'Como uso o capotraste para cantar mais baixo?', en: 'How do I use the capo to sing lower?' }
    ]
  },

  /* ---------- rede: Wi-Fi ou dados ---------- */
  rede: { pesado: 'wifi', ia: 'sempre' },

  /* ---------- trechos que o tradutor nao pode tocar ----------
     O modulo poe a marca sozinho nestes trechos; voce NAO precisa
     editar o index.html para isso. Para proteger mais alguma coisa,
     e so acrescentar o nome aqui. */
  ignorar: [
    /* Este app tem tradutor proprio (idioma.js): ele conhece as frases
       das cifras, dos acordes e do importador, e traduz o site INTEIRO,
       nao so as palavras soltas desta lista. Por isso o conteudo das
       paginas esta marcado com data-dgo-ignorar no HTML, e o modulo
       cuida do resto: anuncio, conta, avisos, nuvem, IA, AssistONE e
       instalacao. */
    '.conteudo',
    '.rodape',
    '#previa',
    '#saida',
    '#cifra',
    '#titulo',
    '#meta',
    '.cabecalho-musica',
    '#diagramas',
    '#lista',
    '#nome-palco',
    '#tom-palco'
  ],

  /* ---------- barras que ficam grudadas no topo ----------
     A faixa do anuncio empurra estas barras para baixo em vez de cobri-las. */
  seletoresTopoFixo: ['header.topo', '#fixavel', '#painel'],

  /* ---------- AssistONE ----------
     O personagem no canto de baixo. Aqui vai o que ele sabe DESTE app:
     a ajuda de cada tela, o tour, uma dica por tela e o indice da busca. */
  assistente: {
    ativo: true,
    imagem: 'ajuda-botao.png',
    /* some quando a pessoa esta tocando (modo celular) ou com o afinador aberto */
    esconderCom: ['body.modo-palco', '#afinador[aberta]', '.gaveta-menu.aberta', 'dialog[open]'],
    telas: {
      inicio: {
        titulo: { pt: 'Minhas cifras', en: 'My chords' },
        frase: { pt: 'Busque uma música, filtre por categoria e marque as favoritas com a ★.',
                 en: 'Search a song, filter by category and star your favorites.' },
        atalhos: [
          { rotulo: { pt: '🔍 Buscar uma música', en: '🔍 Search a song' }, acao: '#busca', principal: true },
          { rotulo: { pt: '🎼 Dicionário de acordes', en: '🎼 Chord dictionary' }, acao: 'acordes.html' },
          { rotulo: { pt: '📋 Importar uma cifra', en: '📋 Import a chart' }, acao: 'importar.html' }
        ]
      },
      cifra: {
        titulo: { pt: 'a cifra', en: 'the chord chart' },
        frase: { pt: 'Toque em ▶ para rolar sozinha, − e + mudam o tom, e o 📱 Modo celular deixa a tela só com a música.',
                 en: 'Tap ▶ to auto-scroll, − and + change the key, and 📱 Phone mode leaves only the song on screen.' },
        atalhos: [
          { rotulo: { pt: '▶ Rolar a cifra', en: '▶ Scroll the chart' }, acao: function () { var b = document.getElementById('btn-rolar'); if (b) b.click(); }, principal: true },
          { rotulo: { pt: '📱 Modo celular', en: '📱 Phone mode' }, acao: function () { var b = document.getElementById('btn-palco'); if (b) b.click(); } },
          { rotulo: { pt: '🎵 Afinador', en: '🎵 Tuner' }, acao: function () { var b = document.getElementById('btn-afinador'); if (b) b.click(); } }
        ]
      },
      acordes: {
        titulo: { pt: 'o dicionário de acordes', en: 'the chord dictionary' },
        frase: { pt: 'Digite um acorde (ex.: Am7) ou escolha a nota e o tipo. Toque no desenho para ouvir.',
                 en: 'Type a chord (e.g. Am7) or pick the note and type. Tap the diagram to hear it.' },
        atalhos: [
          { rotulo: { pt: '⌨ Digitar um acorde', en: '⌨ Type a chord' }, acao: '#entrada', principal: true },
          { rotulo: { pt: '🎼 Campo harmônico', en: '🎼 Harmonic field' }, acao: '#tom-campo' }
        ]
      },
      importar: {
        titulo: { pt: 'Importar cifra', en: 'Import chart' },
        frase: { pt: 'Cole a cifra copiada de qualquer site; o app arruma o texto e monta o arquivo pronto.',
                 en: 'Paste a chart copied from any site; the app tidies the text and builds the file.' },
        atalhos: [
          { rotulo: { pt: '📋 Colar a cifra', en: '📋 Paste the chart' }, acao: '#entrada', principal: true },
          { rotulo: { pt: '📷 Tirar uma foto', en: '📷 Take a photo' }, acao: 'ocr.html' }
        ]
      },
      ocr: {
        titulo: { pt: 'Foto vira cifra', en: 'Photo to chart' },
        frase: { pt: 'Fotografe a cifra (ou escolha uma imagem) e o app lê o texto aqui mesmo, sem sair do aparelho.',
                 en: 'Photograph the chart (or pick an image) and the app reads the text right here, on your device.' },
        atalhos: [
          { rotulo: { pt: '📷 Abrir a câmera', en: '📷 Open the camera' }, acao: function () { var b = document.getElementById('abrir-camera'); if (b) b.click(); }, principal: true }
        ]
      }
    },
    tour: [
      { seletor: '[data-botao-menu]', titulo: { pt: 'Menu ☰', en: 'Menu ☰' },
        texto: { pt: 'Todas as funções do app: cifras, acordes, importar, foto, ajustes e ajuda.', en: 'Every feature: charts, chords, import, photo, settings and help.' } },
      { seletor: '#busca', titulo: { pt: 'Busca', en: 'Search' },
        texto: { pt: 'Procure pelo nome da música, pelo artista ou por um trecho da letra.', en: 'Search by song title, artist or a line of the lyrics.' } },
      { seletor: '#filtros', titulo: { pt: 'Categorias', en: 'Categories' },
        texto: { pt: 'Filtre por estilo, veja só as prontas ou só as favoritas.', en: 'Filter by style, see only ready charts or only favorites.' } },
      { seletor: '#painel', titulo: { pt: 'Barra da cifra', en: 'Chart toolbar' },
        texto: { pt: 'Tom, capotraste, Play com velocidade, guia de leitura, tamanho da letra e modo celular.', en: 'Key, capo, Play with speed, reading guide, font size and phone mode.' } },
      { seletor: '[data-abre-config]', titulo: { pt: 'Configurações ⚙', en: 'Settings ⚙' },
        texto: { pt: 'Idioma, conta, IA, avisos, nuvem e a versão do app.', en: 'Language, account, AI, alerts, cloud and the app version.' } },
      { seletor: '[data-inicio]', titulo: { pt: 'Início 🏠', en: 'Home 🏠' },
        texto: { pt: 'Volta para a lista de músicas de qualquer lugar.', en: 'Back to the song list from anywhere.' } },
      { seletor: '.barra-baixo', titulo: { pt: 'Barra de baixo', en: 'Bottom bar' },
        texto: { pt: 'Os atalhos principais, sempre à mão no celular.', en: 'The main shortcuts, always at hand on the phone.' } }
    ],
    dicas: {
      inicio: { pt: 'Dica: toque na ★ de uma música para guardá-la em Favoritas.', en: 'Tip: tap a song’s ★ to keep it in Favorites.' },
      cifra: { pt: 'Dica: no celular, o 📱 Modo celular deixa só a música na tela e o ▶ rola sozinho.', en: 'Tip: on the phone, 📱 Phone mode leaves only the song on screen and ▶ scrolls by itself.' },
      acordes: { pt: 'Dica: toque em qualquer desenho para ouvir o acorde.', en: 'Tip: tap any diagram to hear the chord.' },
      importar: { pt: 'Dica: a fila junta várias cifras e baixa tudo num .zip de uma vez.', en: 'Tip: the queue gathers several charts and downloads them all in one .zip.' }
    },
    busca: [
      { termo: { pt: 'Minhas cifras (Início)', en: 'My chords (Home)' }, sinonimos: ['musicas', 'songs', 'lista', 'inicio', 'home'], destino: 'index.html', icone: '🏠' },
      { termo: { pt: 'Dicionário de acordes', en: 'Chord dictionary' }, sinonimos: ['acorde', 'chord', 'campo harmonico', 'harmonic field'], destino: 'acordes.html', icone: '🎼' },
      { termo: { pt: 'Importar cifra', en: 'Import chart' }, sinonimos: ['colar', 'paste', 'arquivo', 'txt', 'pdf', 'fila', 'zip'], destino: 'importar.html', icone: '📋' },
      { termo: { pt: 'Foto vira cifra (OCR)', en: 'Photo to chart (OCR)' }, sinonimos: ['camera', 'foto', 'photo', 'scan', 'ler foto'], destino: 'ocr.html', icone: '📷' },
      { termo: { pt: 'Afinador', en: 'Tuner' }, sinonimos: ['afinar', 'tune', 'cordas', 'strings'], destino: function () { var b = document.getElementById('btn-afinador'); if (b) b.click(); else location.href = 'index.html'; }, icone: '🎵' },
      { termo: { pt: 'Mudar o tom / capotraste', en: 'Change key / capo' }, sinonimos: ['tom', 'key', 'capo', 'transpor', 'transpose'], destino: '#painel', icone: '🎚' },
      { termo: { pt: 'Rolagem automática (Play)', en: 'Auto-scroll (Play)' }, sinonimos: ['rolar', 'scroll', 'velocidade', 'speed', 'play'], destino: '#btn-rolar', icone: '▶' },
      { termo: { pt: 'Modo celular (tela cheia)', en: 'Phone mode (full screen)' }, sinonimos: ['palco', 'stage', 'tela cheia', 'fullscreen'], destino: '#btn-palco', icone: '📱' },
      { termo: { pt: 'Ler a letra em voz alta', en: 'Read the lyrics aloud' }, sinonimos: ['voz', 'voice', 'falar', 'tts'], destino: '#btn-voz', icone: '🗣' },
      { termo: { pt: 'Favoritas', en: 'Favorites' }, sinonimos: ['estrela', 'star', 'favorito'], destino: 'index.html', icone: '★' },
      { termo: { pt: 'Configurações', en: 'Settings' }, sinonimos: ['ajustes', 'config', 'idioma', 'language', 'conta', 'account', 'ia', 'ai', 'chave', 'key'], destino: function () { DGO.abrirConfiguracoes(); }, icone: '⚙' },
      { termo: { pt: 'Chaves de IA (cofre)', en: 'AI keys (vault)' }, sinonimos: ['ia', 'ai', 'gemini', 'groq', 'chave', 'api key', 'cofre'], destino: function () { DGO.ia.chaves(); }, icone: '🔑' },
      { termo: { pt: 'Tema claro ou escuro', en: 'Light or dark theme' }, sinonimos: ['tema', 'theme', 'escuro', 'dark', 'claro', 'light'], destino: function () { var b = document.querySelector('[data-botao-tema]'); if (b) b.click(); }, icone: '☾' },
      { termo: { pt: 'Instalar o app / usar sem internet', en: 'Install the app / use offline' }, sinonimos: ['instalar', 'install', 'offline', 'atalho', 'tela inicial', 'home screen'], destino: function () { if (DGO.pwa) DGO.pwa.instalar(); }, icone: '📲' },
      { termo: { pt: 'Novidades de cada versão', en: 'What’s new in each version' }, sinonimos: ['versao', 'version', 'novidades', 'changelog'], destino: function () { if (typeof abrirNovidades === 'function') abrirNovidades(); }, icone: '🆕' },
      { termo: { pt: 'Aviso legal e pedido de remoção', en: 'Legal notice and removal request' }, sinonimos: ['aviso', 'legal', 'direitos', 'remover', 'notice'], destino: 'aviso.html', icone: '⚖' }
    ]
  },

  /* ---------- acesso ---------- */
  login: {
    ativo: true,
    exigirNaAbertura: false,    /* true = pede login antes de usar o app */
    permitirVisitante: true,
    permitirPagante: true,
    permitirAnunciante: true,
    exigirApelido: true,        /* conta = apelido + e-mail + senha */
    biometria: true,
    google: { clientId: '' },  /* preencha para ligar o login do Google */

    /* "esqueci a senha": enquanto nao houver servidor, funciona pelo codigo
       de recuperacao que aparece quando a conta e criada. Se voce criar um
       formulario (Formspree), o pedido tambem pode chegar para voce: */
    formularioRecuperacao: ''
  },

  /* ---------- e-mail ---------- */
  email: {
    formulario: '',      /* ex.: 'https://formspree.io/f/xxxxxxx' */
    deAvisos: '',        /* o e-mail que voce usa para responder */
    assuntoPadrao: 'CifrasONE'
  },

  /* ---------- nuvem ---------- */
  nuvem: {
    google: { clientId: '' },      /* mesma chave do login do Google */
    microsoft: { clientId: '' },   /* OneDrive, se um dia quiser */
    arquivo: 'cifras-violao.json'
  },

  /* ---------- OCR (ler texto de foto) ----------
     DESLIGADO de proposito, e so neste app.

     O leitor do modulo baixa o motor de um servidor publico na primeira
     vez. Aqui voce escolheu o contrario: o motor mora dentro do seu
     proprio repositorio (os arquivos tesseract-core-*.wasm.js e
     *.traineddata.gz), entao o site le foto sem depender de ninguem e
     funciona ate offline.

     Quem faz isso e a pagina Foto (ocr.html), que alem de ler ja
     conserta os acordes tortos e manda o texto para a fila do Importar.
     Deixar os dois ligados seria baixar duas vezes a mesma coisa.

     Nos seus outros apps, deixe ocr: { ativo: true }. */
  ocr: { ativo: false, idiomas: 'por+eng' },

  /* ---------- notificacoes ---------- */
  notificacoes: {
    ativo: true,
    pedirNaAbertura: false,     /* melhor pedir num botao, nao na abertura */
    horarioSilencioso: { ativo: false, inicio: '23:30', fim: '07:00' },
    vapidPublicKey: '',         /* so quando houver servidor de push */
    endpointInscricao: '',
    tipos: [
      { id: 'ensaio',
        nome: { pt: 'Lembrete de ensaio', en: 'Practice reminder' },
        descricao: { pt: 'Hora marcada por você para tocar', en: 'A time you set to play' },
        padrao: true },
      { id: 'musica-pendente',
        nome: { pt: 'Música ainda sem cifra', en: 'Song without a chart yet' },
        descricao: { pt: 'Lembra das músicas marcadas como pendente', en: 'Reminds you of songs marked pending' },
        padrao: false },
      { id: 'novidades',
        nome: { pt: 'Novidades do app', en: 'App news' },
        descricao: { pt: 'Versões novas e recursos', en: 'New versions and features' },
        padrao: false }
    ]
  },

  /* ---------- palavras deste app para o tradutor ----------
     Serve so para o que o MODULO desenha (as telas de conta, avisos e
     configuracoes). O texto das paginas do site e traduzido pelo
     idioma.js, que tem a lista completa nos dois idiomas. */
  traducoes: {
    'Rolagem automática': 'Auto scroll',
    'Dicionário de acordes': 'Chord dictionary',
    'Mudar o tom': 'Change key',
    'Capotraste': 'Capo',
    'Afinador': 'Tuner',
    'Tamanho da letra': 'Font size',
    'Importar': 'Import',
    'Pendente': 'Pending',
    'Minhas músicas': 'My songs',
    'Repertório': 'Repertoire',
    'Tom original': 'Original key'
  }

});
