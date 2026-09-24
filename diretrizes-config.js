/* =====================================================================
   CifrasONE (antigo Cifras de Violão)  —  configuracao
   ---------------------------------------------------------------------
   ESTE e o unico arquivo diferente entre os seus apps.
   O diretrizes.js e identico nos tres; aqui ficam o nome, a cor, as
   traducoes e os avisos deste app. Para mudar qualquer ajuste, mude AQUI
   e suba este arquivo de novo. O seu index.html nao precisa ser tocado.
   ===================================================================== */
DGO.iniciar({

  /* ---------- identidade ---------- */
  app: 'cifras-violao',            /* NAO TROQUE. E o nome da gaveta onde este app
                                guarda os dados. Seus sites moram todos em
                                marceloneco.github.io, e e isto que impede os
                                dados de um vazarem para o outro. */
  nome: { pt: 'CifrasONE', en: 'CifrasONE' },
  versaoApp: '2.3',
  cor: '#a8501e',            /* o marrom-laranja do site de cifras */
  corFundoBarra: '#1a1614',

  /* ---------- idioma e datas ---------- */
  idiomaPadrao: 'pt',                    /* 'pt' ou 'en' */
  idiomaCompartilhado: true,             /* o idioma escolhido vale nos seus 3 sites */
  seletorIdiomaVisivel: true,
  posicaoSeletorIdioma: 'baixo-esquerda', /* topo-direita, topo-esquerda,
                                            baixo-direita, baixo-esquerda

     Por que aqui embaixo e nao no topo: a barra deste site ja tem os
     botoes de favorito, compartilhar, afinador e menu, e o canto de
     BAIXO-DIREITA e do botao redondo de Play/Pause no modo celular.
     Em baixo-esquerda o botao PT/EN nao cobre nada. */
  datasAutomaticas: true,

  /* ---------- anuncio do topo ---------- */
  anuncios: {
    ativo: true,
    link: 'https://marceloneco.github.io/',
    imagem: 'anuncie-aqui.png',
    /* Este arquivo e so o ESPACO reservado, desenhado nas cores deste
       site (o placeholder que vem no modulo e azul-esverdeado e ficaria
       destoando do marrom). Quando voce vender o espaco, e so trocar
       esta linha pelo nome da imagem do anunciante, por exemplo
       'banner.jpg', e mudar o link logo acima. */

    /* enquanto uma destas telas estiver aberta o banner some sozinho,
       e volta quando ela fecha */
    esconderCom: ['#faixa-palco', '#afinador']
  },

  /* ---------- trechos que o tradutor nao pode tocar ----------
     O modulo poe a marca sozinho nestes trechos; voce NAO precisa
     editar o index.html para isso. Para proteger mais alguma coisa,
     e so acrescentar o nome aqui. */
  ignorar: [
    /* Este app tem tradutor proprio (idioma.js): ele conhece as frases
       das cifras, dos acordes e do importador, e traduz o site INTEIRO,
       nao so as palavras soltas desta lista. Por isso o conteudo das
       paginas esta marcado com data-dgo-ignorar no HTML, e o modulo
       cuida do resto: botao de idioma, anuncio, conta, avisos, nuvem
       e instalacao. Um botao so, um idioma so. */
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
     O banner empurra estas barras para baixo em vez de cobri-las. */
  seletoresTopoFixo: ['header.topo', '#fixavel', '#painel'],

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
