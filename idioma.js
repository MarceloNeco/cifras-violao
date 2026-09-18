/* ============================================================
   idioma.js — Português e Inglês em todo o site.

   Como funciona: qualquer pedaço de texto da interface ganha uma
   etiqueta no HTML, assim:  <h1 data-i18n="inicio.titulo">…</h1>
   Aqui embaixo ficam as duas versões de cada etiqueta. Trocar de
   idioma é só percorrer a página de novo — nada recarrega.

   Datas: PT = 17/Set/2026   ·   EN = Sep/17/2026
   ============================================================ */

const IDIOMA_CHAVE = 'cifras:idioma';

const MESES = {
  pt: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};

const TEXTOS = {
/* ---------------------------------------------------------- */
pt: {
  'html.lang': 'pt-BR',
  'idioma.botao': 'PT',
  'idioma.titulo': 'Mudar para inglês',

  /* cabeçalho, em todas as páginas */
  'topo.marca': 'Cifras de Violão',
  'topo.acordes': 'Acordes',
  'topo.importar': 'Importar',
  'topo.foto': 'Foto',
  'topo.conta': 'Conta',
  'topo.voltar': 'Voltar',
  'topo.fundo': 'Imagem de fundo',
  'topo.tema': 'Mudar o tema',
  'topo.instalar': 'Instalar o app',
  'topo.config': 'Configurações',

  /* anúncio */
  'anuncio.fechar': 'Fechar o anúncio',
  'anuncio.selo': 'Publicidade',
  'anuncio.semAnuncio': 'Assine para navegar sem anúncios',

  /* página inicial */
  'inicio.titulo': 'Minhas cifras',
  'inicio.sub': 'Busque pelo nome da música, pelo artista ou pelo trecho da letra.',
  'inicio.busca': 'Buscar música, artista ou tom…',
  'inicio.buscaAria': 'Buscar',
  'inicio.limpar': 'Limpar busca',
  'inicio.filtros': 'Filtrar por categoria',
  'inicio.rodape': 'Feito para tocar violão. As cifras são de uso pessoal.',
  'lista.todas': 'Todas',
  'lista.prontas': 'Prontas',
  'lista.semCifra': 'Sem cifra',
  'lista.favoritas': 'Favoritas',
  'lista.selo': 'sem cifra',
  'lista.uma': '1 música',
  'lista.varias': '{n} músicas',
  'lista.vazioTitulo': 'Nenhuma música encontrada',
  'lista.vazioFav': 'Toque na estrelinha de uma música para guardá-la aqui.',
  'lista.vazioOutro': 'Tente outra palavra ou mude a categoria.',
  'lista.favoritar': 'Favoritar',
  'lista.erroTitulo': 'Não consegui carregar as músicas',
  'lista.erroAjuda': 'Se você abriu o arquivo direto do computador (com dois cliques), isso é normal: o navegador bloqueia a leitura dos arquivos. Publique no GitHub Pages que funciona.',

  /* página da cifra */
  'cifra.carregando': 'Carregando…',
  'cifra.tom': 'Tom',
  'cifra.capo': 'Capo',
  'cifra.letra': 'Letra',
  'cifra.abaixar': 'Abaixar meio tom',
  'cifra.subir': 'Subir meio tom',
  'cifra.tomOriginal': 'Voltar ao tom original',
  'cifra.capoMenos': 'Menos uma casa',
  'cifra.capoMais': 'Mais uma casa',
  'cifra.velocidade': 'Velocidade da rolagem',
  'cifra.guia': '◉ Guia',
  'cifra.guiaTitulo': 'Bolinha que acompanha a cifra conforme ela rola',
  'cifra.guiaSom': 'Ligar o som da bolinha',
  'cifra.menor': 'Diminuir a letra',
  'cifra.maior': 'Aumentar a letra',
  'cifra.caber': 'Ajustar para caber na tela',
  'cifra.soCifra': '▤ Só a cifra',
  'cifra.mostrarTudo': '▥ Mostrar tudo',
  'cifra.soCifraTitulo': 'Esconder o cabeçalho e os desenhos, e deixar só a cifra',
  'cifra.palco': '📱 Modo celular',
  'cifra.palcoTitulo': 'Tela cheia para tocar',
  'cifra.sairPalco': 'Sair do modo celular',
  'cifra.favoritar': 'Favoritar',
  'cifra.afinador': 'Afinador',
  'cifra.compartilhar': 'Compartilhar',
  'cifra.dicionario': 'Dicionário de acordes',
  'cifra.spotify': 'Ouvir no Spotify',
  'cifra.youtube': 'Ver no YouTube',
  'cifra.procurar': '🔎 Procurar a cifra',
  'cifra.rodape': 'Espaço = Play/Pause · setas ↑ ↓ = velocidade · + e − = tom',
  'cifra.acordesUsados': 'Acordes usados',
  'cifra.acordesCapo': 'formatos com o capotraste na {n}ª casa',
  'cifra.toqueDesenho': 'toque num desenho para ouvir',
  'cifra.capoMeta': 'capotraste na {n}ª casa (você faz o formato de {forma})',
  'cifra.semTitulo': 'Esta música ainda não tem cifra',
  'cifra.semTexto': 'Ela já está na sua lista, mas falta criar o arquivo {arquivo}.',
  'cifra.semPasso1': 'Use o botão <b>Procurar a cifra</b> aqui em cima e copie a cifra de onde você preferir.',
  'cifra.semPasso2': 'Cole na página <a href="importar.html">Importar cifra</a> — ela arruma o texto e monta o arquivo pronto. Ou tire uma <a href="ocr.html">foto da cifra</a>.',
  'cifra.semPasso3': 'No GitHub: <b>Add file → Create new file</b>, nome do arquivo <b>{arquivo}</b>, e cole o que a página gerou.',
  'cifra.semFim': 'Assim que o arquivo existir, esta página passa a mostrar a cifra com rolagem, tom e desenhos.',
  'cifra.erroTitulo': 'Não deu certo',
  'cifra.dicaBarra': 'Toque na cifra para a barra voltar',

  /* afinador */
  'afinador.titulo': 'Afinador',
  'afinador.texto': 'Toque numa corda para ouvir a nota certa e afinar de ouvido. Da mais grossa para a mais fina.',
  'afinador.fechar': 'Fechar',
  'afinador.grossa': '6ª (mais grossa)',
  'afinador.fina': '1ª (mais fina)',

  /* dicionário de acordes */
  'acordes.titulo': 'Dicionário de acordes',
  'acordes.sub': 'Digite qualquer acorde para ver como se faz no braço do violão.',
  'acordes.entrada': 'Am7, C7M, F#m, G/B, Eº…',
  'acordes.nota': 'Nota',
  'acordes.tipo': 'Tipo',
  'acordes.campo': 'Acordes do tom de',
  'acordes.campoDica': 'São os acordes que costumam aparecer juntos numa música nesse tom. Toque em qualquer um para ver as posições.',
  'acordes.rodape': 'Toque em qualquer desenho para ouvir o acorde.',
  'acordes.naoReconheci': 'Não reconheci “{acorde}”',
  'acordes.comoEscrever': 'Escreva a nota em letra (C, D, E, F, G, A, B) e o tipo depois: <b>Am7</b>, <b>C7M</b>, <b>F#m</b>, <b>G/B</b>.',
  'acordes.ouvir': '▶ Ouvir',
  'acordes.notas': 'Notas',
  'acordes.maisFacil': 'Posição mais fácil',
  'acordes.posicao': '{n}ª posição',
  'acordes.aPartir': 'a partir da {n}ª casa',
  'acordes.dedos': 'Os números dentro das bolinhas são os dedos: <b>1</b> indicador, <b>2</b> médio, <b>3</b> anular, <b>4</b> mínimo. A barra laranja é a pestana.',

  /* conta */
  'conta.titulo': 'Sua conta',
  'conta.sub': 'Escolha como você quer usar o site.',
  'conta.visitante': 'Visitante',
  'conta.visitanteTexto': 'Entra sem senha. Nada seu fica guardado depois que você fecha o navegador. Mostra anúncios.',
  'conta.assinante': 'Assinante',
  'conta.assinanteTexto': 'Entra com senha. Favoritos, tons e a fila ficam guardados. Sem anúncios.',
  'conta.anunciante': 'Anunciante',
  'conta.anuncianteTexto': 'Área para acompanhar os anúncios publicados no site.',
  'conta.entrar': 'Entrar',
  'conta.sair': 'Sair',
  'conta.criar': 'Criar',
  'conta.nome': 'Nome',
  'conta.senha': 'Senha',
  'conta.senhaDica': 'Mínimo de 4 caracteres.',
  'conta.entrando': 'Entrando…',
  'conta.ola': 'Olá, {nome}',
  'conta.perfil': 'Perfil',
  'conta.desde': 'Entrou em',
  'conta.biometria': 'Entrar pela digital ou pelo rosto',
  'conta.biometriaSem': 'Este aparelho não oferece digital nem reconhecimento facial para sites.',
  'conta.google': 'Entrar com Google',
  'conta.googleSem': 'O login com Google ainda não foi configurado. O passo a passo está no README.',
  'conta.erroSenha': 'Senha incorreta.',
  'conta.erroCurta': 'A senha precisa de pelo menos 4 caracteres.',
  'conta.erroNome': 'Escreva um nome.',
  'conta.jaExiste': 'Já existe uma conta com esse nome neste aparelho. Escreva a senha para entrar.',
  'conta.honesto': 'Importante: este site não tem servidor. A conta e a senha ficam só neste navegador, e servem para separar seus dados e tirar os anúncios — não são segurança de verdade. Não use uma senha que você usa em outro lugar.',
  'conta.painel': 'Painel do anunciante',
  'conta.painelTexto': 'Enquanto não há servidor, este painel mostra o que está no ar e quantas vezes o anúncio apareceu neste aparelho.',
  'conta.exibicoes': 'Vezes que o anúncio apareceu',
  'conta.cliques': 'Cliques no anúncio',
  'conta.anuncioAtual': 'Anúncio no ar',
  'conta.zerar': 'Zerar a contagem',
  'conta.nuvem': 'Nuvem',
  'conta.nuvemTexto': 'Guardar uma cópia das suas cifras no seu próprio drive.',
  'conta.drive': 'Google Drive',
  'conta.onedrive': 'OneDrive',
  'conta.nuvemSem': 'Ainda não configurado. O passo a passo está no README do repositório.',
  'conta.instalar': 'Instalar como aplicativo',
  'conta.instalarTexto': 'Coloca um ícone na tela inicial e faz o site abrir sem barra de navegador, funcionando até sem internet.',
  'conta.instalado': 'Já instalado neste aparelho.',

  /* foto / OCR */
  'ocr.titulo': 'Foto vira cifra',
  'ocr.sub': 'Fotografe uma cifra no papel, num livro ou numa tela. O site lê o texto e manda para a fila da página Importar.',
  'ocr.camera': '📷 Usar a câmera',
  'ocr.arquivo': '🖼 Escolher uma imagem',
  'ocr.tirar': 'Tirar a foto',
  'ocr.trocar': 'Virar a câmera',
  'ocr.parar': 'Fechar a câmera',
  'ocr.idiomaOcr': 'Idioma da cifra',
  'ocr.portugues': 'Português',
  'ocr.ingles': 'Inglês',
  'ocr.ambos': 'Português e inglês',
  'ocr.ler': 'Ler a imagem',
  'ocr.lendo': 'Lendo a imagem…',
  'ocr.baixando': 'Preparando o motor de leitura (só na primeira vez)…',
  'ocr.pronto': 'Pronto. Confira e corrija o que tiver saído torto.',
  'ocr.nada': 'Não consegui ler nada nessa imagem. Tente com mais luz, de frente e sem sombra.',
  'ocr.erro': 'Deu problema ao ler a imagem.',
  'ocr.resultado': 'O que eu li',
  'ocr.mandar': 'Mandar para a fila do Importar',
  'ocr.mandado': 'Mandado. Abra a página Importar para conferir e baixar.',
  'ocr.limpar': 'Limpar',
  'ocr.dicaTitulo': 'Para sair bom',
  'ocr.dica1': 'Luz de frente, sem sombra da sua mão nem brilho do flash.',
  'ocr.dica2': 'A folha o mais reta possível, preenchendo a tela.',
  'ocr.dica3': 'Uma página por foto. Se a cifra tem duas colunas, fotografe uma coluna de cada vez.',
  'ocr.dica4': 'A primeira leitura demora mais, porque o motor está sendo preparado. Depois fica rápido.',
  'ocr.semCamera': 'Não consegui abrir a câmera. Você pode escolher uma foto da galeria no botão ao lado.',
  'ocr.semMotor': 'Os arquivos do motor de leitura não foram encontrados no site. Veja no README como subi-los.',
  'ocr.tudoAqui': 'A foto não sai do seu aparelho: a leitura acontece dentro do próprio navegador.',
  'ocr.titulo2': 'Título da música',
  'ocr.girar': 'Girar',
  'ocr.contraste': 'Contraste',

  /* importar */
  'importar.sub': 'Cole a cifra copiada de qualquer site. Esta página arruma o texto e monta o arquivo pronto para você subir no GitHub.',
  'importar.modoUma': 'Uma música por vez',
  'importar.modoVarias': 'Um arquivo com várias',
  'importar.varias': 'Arquivo com várias cifras',
  'importar.variasDica': 'Monte um arquivo de texto com todas as cifras, separando cada música por uma linha que comece com <b>===</b> seguida do título:',
  'importar.pdfDica': '<b>Tem uma coletânea de cifras em PDF?</b> Abra o PDF pelo botão abaixo: a página separa as músicas sozinha, uma por uma, e já monta este formato.',
  'importar.barrasDica': 'Só o título é obrigatório — se ele bater com uma música da sua lista, o artista, a categoria e o nome do arquivo vêm sozinhos. Se quiser mandar tudo na mão, use barras: <b>=== Título | Artista | Categoria | tom: G | capo: 2</b>',
  'importar.abrirArquivo': '📂 Abrir um arquivo .txt ou .pdf',
  'importar.colarLote': 'Cole aqui o arquivo inteiro, ou use o botão acima para abrir um .txt',
  'importar.separar': 'Separar e mandar tudo para a fila',
  'importar.modelo': 'Ver o modelo',
  'importar.p1': 'Que música é?',
  'importar.escolher': 'Escolha da sua lista',
  'importar.titulo2': 'Título',
  'importar.artista': 'Artista',
  'importar.categoria': 'Categoria',
  'importar.tom': 'Tom',
  'importar.capo': 'Capo',
  'importar.ritmo': 'Ritmo (opcional)',
  'importar.nomeArquivo': 'Nome do arquivo',
  'importar.p2': 'Cole a cifra aqui',
  'importar.p2dica': 'Copie a cifra inteira do site (letra com os acordes em cima) e cole no quadro. Pode colar com a bagunça de espaços que vier — eu arrumo.',
  'importar.colar': '[Intro] G  D  Em  C\n\n G              D\nCole a cifra aqui…',
  'importar.arrumar': 'Arrumar e conferir',
  'importar.limpar': 'Limpar',
  'importar.p3': 'Confira como ficou',
  'importar.p4': 'Guardar esta música',
  'importar.addFila': '+ Adicionar à fila',
  'importar.verUm': 'Ver o arquivo desta música',
  'importar.p4dica': 'O jeito rápido é ir empilhando as músicas na fila e baixar tudo de uma vez no fim — assim você faz um upload só no GitHub.',
  'importar.a': 'a) O arquivo da cifra',
  'importar.adica': 'Crie no repositório um arquivo com o nome abaixo (<b>Add file → Create new file</b>) e cole este conteúdo dentro:',
  'importar.copiar': 'Copiar o conteúdo',
  'importar.baixarTxt': 'Baixar o arquivo .txt',
  'importar.b': 'b) O índice',
  'importar.opcional': 'opcional',
  'importar.baixarJson': 'Baixar o indice.json',
  'importar.copiarJson': 'Copiar o índice inteiro',
  'importar.conferir': 'Conferir a lista',
  'importar.conferirDica': 'Procura cifras que estão no repositório mas ficaram de fora do <b>indice.json</b> — por isso não aparecem no site — e devolve a lista corrigida. Vale rodar sempre que uma música sumir da página inicial.',
  'importar.conferirAgora': 'Conferir agora',
  'importar.fila': 'Fila',
  'importar.filaDica': 'As cifras ficam guardadas aqui no seu navegador — pode fechar a página e voltar depois que elas continuam aqui.',
  'importar.baixarZip': '⬇ Baixar tudo num .zip',
  'importar.esvaziar': 'Esvaziar a fila',
  'importar.comoSubir': '<b>Como subir:</b> abra o .zip, selecione tudo (<b>Ctrl+A</b>), e arraste para <b>Add file → Upload files</b> no GitHub. O <b>indice.json</b> vem junto, já atualizado, e substitui o antigo.',
  'importar.veioDaFoto': 'Este texto veio de uma foto. Confira os acordes e os espaços antes de guardar.',
  'importar.titulo': 'Importar cifra',
  'importar.rodape': 'O texto colado aqui não sai do seu navegador.',
  'importar.foto': 'Ou tire uma foto da cifra',

  /* aviso e rodapé */
  'config.titulo': 'Configurações',
  'config.idioma': 'Idioma do site',
  'avisos.titulo': 'Avisos',
  'avisos.texto': 'Escolha o que o site pode te avisar. Você pode desligar tudo a qualquer momento, aqui ou nas configurações do aparelho.',
  'avisos.permitir': 'Permitir avisos',
  'avisos.permitido': 'Avisos permitidos neste aparelho.',
  'avisos.negado': 'Você bloqueou os avisos para este site. Para voltar atrás, mude nas configurações do navegador, na parte de permissões deste endereço.',
  'avisos.semSuporte': 'Este navegador não oferece avisos.',
  'avisos.estudo': 'Lembrete de tocar',
  'avisos.estudoTexto': 'Um toque por dia, no horário escolhido, para você não deixar o violão parado.',
  'avisos.versao': 'Novidades do site',
  'avisos.versaoTexto': 'Avisa quando o site ganhar uma versão nova.',
  'avisos.hora': 'Hora do lembrete',
  'avisos.testar': 'Ver como fica',
  'avisos.testeTitulo': 'Cifras de Violão',
  'avisos.testeCorpo': 'É assim que um aviso vai aparecer no seu aparelho.',
  'avisos.estudoTitulo': 'Hora do violão',
  'avisos.estudoCorpo': 'Que tal uns minutos com as suas cifras?',
  'avisos.versaoTitulo': 'O site mudou',
  'avisos.versaoCorpo': 'A versão {v} está no ar. Abra para ver o que chegou.',
  'avisos.local': 'Com o site fechado: por enquanto os avisos só aparecem quando você abre o site. Para chegarem com ele fechado é preciso um servidor — a parte do navegador já está pronta, falta ligar o servidor no config.js.',
  'avisos.pushSem': 'Push com o site fechado ainda não foi configurado. O passo a passo está no README.',
  'avisos.pushLigar': 'Ligar o push',
  'avisos.pushDesligar': 'Desligar o push',
  'rodape.versao': 'versão',
  'rodape.aviso': 'Aviso',
  'geral.fechar': 'Fechar',
  'geral.cancelar': 'Cancelar',
  'geral.salvar': 'Salvar',
  'geral.sim': 'Sim',
  'geral.nao': 'Não'
},

/* ---------------------------------------------------------- */
en: {
  'html.lang': 'en',
  'idioma.botao': 'EN',
  'idioma.titulo': 'Switch to Portuguese',

  'topo.marca': 'Guitar Chords',
  'topo.acordes': 'Chords',
  'topo.importar': 'Import',
  'topo.foto': 'Photo',
  'topo.conta': 'Account',
  'topo.voltar': 'Back',
  'topo.fundo': 'Background image',
  'topo.tema': 'Switch theme',
  'topo.instalar': 'Install the app',
  'topo.config': 'Settings',

  'anuncio.fechar': 'Close the ad',
  'anuncio.selo': 'Advertisement',
  'anuncio.semAnuncio': 'Subscribe to browse without ads',

  'inicio.titulo': 'My chords',
  'inicio.sub': 'Search by song title, artist or a line of the lyrics.',
  'inicio.busca': 'Search song, artist or key…',
  'inicio.buscaAria': 'Search',
  'inicio.limpar': 'Clear search',
  'inicio.filtros': 'Filter by category',
  'inicio.rodape': 'Made for playing guitar. These chords are for personal use.',
  'lista.todas': 'All',
  'lista.prontas': 'Ready',
  'lista.semCifra': 'No chords yet',
  'lista.favoritas': 'Favorites',
  'lista.selo': 'no chords',
  'lista.uma': '1 song',
  'lista.varias': '{n} songs',
  'lista.vazioTitulo': 'No song found',
  'lista.vazioFav': 'Tap the star on a song to keep it here.',
  'lista.vazioOutro': 'Try another word or change the category.',
  'lista.favoritar': 'Add to favorites:',
  'lista.erroTitulo': 'I could not load the songs',
  'lista.erroAjuda': 'If you opened the file straight from your computer (by double-clicking), this is normal: the browser blocks reading the files. It works once published on GitHub Pages.',

  'cifra.carregando': 'Loading…',
  'cifra.tom': 'Key',
  'cifra.capo': 'Capo',
  'cifra.letra': 'Text',
  'cifra.abaixar': 'Down a semitone',
  'cifra.subir': 'Up a semitone',
  'cifra.tomOriginal': 'Back to the original key',
  'cifra.capoMenos': 'One fret down',
  'cifra.capoMais': 'One fret up',
  'cifra.velocidade': 'Scrolling speed',
  'cifra.guia': '◉ Guide',
  'cifra.guiaTitulo': 'A dot that follows the chords as the page scrolls',
  'cifra.guiaSom': 'Turn the guide sound on',
  'cifra.menor': 'Smaller text',
  'cifra.maior': 'Bigger text',
  'cifra.caber': 'Fit to the screen',
  'cifra.soCifra': '▤ Chords only',
  'cifra.mostrarTudo': '▥ Show everything',
  'cifra.soCifraTitulo': 'Hide the header and the diagrams, keep only the chords',
  'cifra.palco': '📱 Phone mode',
  'cifra.palcoTitulo': 'Full screen for playing',
  'cifra.sairPalco': 'Leave phone mode',
  'cifra.favoritar': 'Add to favorites',
  'cifra.afinador': 'Tuner',
  'cifra.compartilhar': 'Share',
  'cifra.dicionario': 'Chord dictionary',
  'cifra.spotify': 'Listen on Spotify',
  'cifra.youtube': 'Watch on YouTube',
  'cifra.procurar': '🔎 Look for the chords',
  'cifra.rodape': 'Space = Play/Pause · arrows ↑ ↓ = speed · + and − = key',
  'cifra.acordesUsados': 'Chords used',
  'cifra.acordesCapo': 'shapes with the capo on fret {n}',
  'cifra.toqueDesenho': 'tap a diagram to hear it',
  'cifra.capoMeta': 'capo on fret {n} (you play the shape of {forma})',
  'cifra.semTitulo': 'This song has no chords yet',
  'cifra.semTexto': 'It is already on your list, but the file {arquivo} has not been created.',
  'cifra.semPasso1': 'Use the <b>Look for the chords</b> button above and copy the chords from wherever you prefer.',
  'cifra.semPasso2': 'Paste them on the <a href="importar.html">Import</a> page — it tidies the text and builds the file. Or take a <a href="ocr.html">photo of the chords</a>.',
  'cifra.semPasso3': 'On GitHub: <b>Add file → Create new file</b>, file name <b>{arquivo}</b>, and paste what the page produced.',
  'cifra.semFim': 'As soon as the file exists, this page shows the chords with scrolling, key change and diagrams.',
  'cifra.erroTitulo': 'That did not work',
  'cifra.dicaBarra': 'Tap the chords to bring the bar back',

  'afinador.titulo': 'Tuner',
  'afinador.texto': 'Tap a string to hear the right note and tune by ear. From the thickest to the thinnest.',
  'afinador.fechar': 'Close',
  'afinador.grossa': '6th (thickest)',
  'afinador.fina': '1st (thinnest)',

  'acordes.titulo': 'Chord dictionary',
  'acordes.sub': 'Type any chord to see how to play it on the neck.',
  'acordes.entrada': 'Am7, Cmaj7, F#m, G/B, Edim…',
  'acordes.nota': 'Note',
  'acordes.tipo': 'Type',
  'acordes.campo': 'Chords in the key of',
  'acordes.campoDica': 'These are the chords that usually show up together in a song in this key. Tap any of them to see the shapes.',
  'acordes.rodape': 'Tap any diagram to hear the chord.',
  'acordes.naoReconheci': 'I did not recognise “{acorde}”',
  'acordes.comoEscrever': 'Write the note as a letter (C, D, E, F, G, A, B) and the type after it: <b>Am7</b>, <b>Cmaj7</b>, <b>F#m</b>, <b>G/B</b>.',
  'acordes.ouvir': '▶ Play it',
  'acordes.notas': 'Notes',
  'acordes.maisFacil': 'Easiest shape',
  'acordes.posicao': 'Shape {n}',
  'acordes.aPartir': 'from fret {n}',
  'acordes.dedos': 'The numbers inside the dots are the fingers: <b>1</b> index, <b>2</b> middle, <b>3</b> ring, <b>4</b> little. The orange bar is the barre.',

  'conta.titulo': 'Your account',
  'conta.sub': 'Choose how you want to use the site.',
  'conta.visitante': 'Guest',
  'conta.visitanteTexto': 'No password. Nothing of yours is kept after you close the browser. Shows ads.',
  'conta.assinante': 'Subscriber',
  'conta.assinanteTexto': 'Password protected. Favorites, keys and the queue are kept. No ads.',
  'conta.anunciante': 'Advertiser',
  'conta.anuncianteTexto': 'An area to follow the ads running on the site.',
  'conta.entrar': 'Sign in',
  'conta.sair': 'Sign out',
  'conta.criar': 'Create',
  'conta.nome': 'Name',
  'conta.senha': 'Password',
  'conta.senhaDica': 'At least 4 characters.',
  'conta.entrando': 'Signing in…',
  'conta.ola': 'Hello, {nome}',
  'conta.perfil': 'Profile',
  'conta.desde': 'Joined on',
  'conta.biometria': 'Sign in with fingerprint or face',
  'conta.biometriaSem': 'This device does not offer fingerprint or face recognition to websites.',
  'conta.google': 'Sign in with Google',
  'conta.googleSem': 'Google sign-in has not been set up yet. The steps are in the README.',
  'conta.erroSenha': 'Wrong password.',
  'conta.erroCurta': 'The password needs at least 4 characters.',
  'conta.erroNome': 'Please type a name.',
  'conta.jaExiste': 'There is already an account with that name on this device. Type the password to sign in.',
  'conta.honesto': 'Important: this site has no server. The account and the password live only in this browser, and they exist to keep your data apart and remove the ads — they are not real security. Do not reuse a password from somewhere else.',
  'conta.painel': 'Advertiser dashboard',
  'conta.painelTexto': 'While there is no server, this dashboard shows what is running and how many times the ad was shown on this device.',
  'conta.exibicoes': 'Times the ad was shown',
  'conta.cliques': 'Clicks on the ad',
  'conta.anuncioAtual': 'Ad on air',
  'conta.zerar': 'Reset the count',
  'conta.nuvem': 'Cloud',
  'conta.nuvemTexto': 'Keep a copy of your chords in your own drive.',
  'conta.drive': 'Google Drive',
  'conta.onedrive': 'OneDrive',
  'conta.nuvemSem': 'Not set up yet. The steps are in the repository README.',
  'conta.instalar': 'Install as an app',
  'conta.instalarTexto': 'Puts an icon on your home screen and opens the site without the browser bar, working even offline.',
  'conta.instalado': 'Already installed on this device.',

  'ocr.titulo': 'Photo to chords',
  'ocr.sub': 'Photograph chords on paper, in a book or on a screen. The site reads the text and sends it to the Import queue.',
  'ocr.camera': '📷 Use the camera',
  'ocr.arquivo': '🖼 Choose an image',
  'ocr.tirar': 'Take the photo',
  'ocr.trocar': 'Flip the camera',
  'ocr.parar': 'Close the camera',
  'ocr.idiomaOcr': 'Language of the chords',
  'ocr.portugues': 'Portuguese',
  'ocr.ingles': 'English',
  'ocr.ambos': 'Portuguese and English',
  'ocr.ler': 'Read the image',
  'ocr.lendo': 'Reading the image…',
  'ocr.baixando': 'Getting the reading engine ready (first time only)…',
  'ocr.pronto': 'Done. Check it and fix anything that came out crooked.',
  'ocr.nada': 'I could not read anything in that image. Try with more light, straight on and without shadows.',
  'ocr.erro': 'Something went wrong reading the image.',
  'ocr.resultado': 'What I read',
  'ocr.mandar': 'Send to the Import queue',
  'ocr.mandado': 'Sent. Open the Import page to check it and download.',
  'ocr.limpar': 'Clear',
  'ocr.dicaTitulo': 'To get a good result',
  'ocr.dica1': 'Light from the front, no shadow of your hand and no flash glare.',
  'ocr.dica2': 'Keep the page as straight as possible, filling the screen.',
  'ocr.dica3': 'One page per photo. If the chords are in two columns, photograph one column at a time.',
  'ocr.dica4': 'The first reading takes longer because the engine is being prepared. After that it is fast.',
  'ocr.semCamera': 'I could not open the camera. You can pick a photo from your gallery with the button next to it.',
  'ocr.semMotor': 'The reading engine files were not found on the site. See the README for how to upload them.',
  'ocr.tudoAqui': 'The photo never leaves your device: the reading happens inside your own browser.',
  'ocr.titulo2': 'Song title',
  'ocr.girar': 'Rotate',
  'ocr.contraste': 'Contrast',

  'importar.sub': 'Paste chords copied from any website. This page tidies the text and builds the file ready to upload to GitHub.',
  'importar.modoUma': 'One song at a time',
  'importar.modoVarias': 'One file with several',
  'importar.varias': 'File with several songs',
  'importar.variasDica': 'Build a text file with all the chords, separating each song with a line starting with <b>===</b> followed by the title:',
  'importar.pdfDica': '<b>Got a chord collection as a PDF?</b> Open the PDF with the button below: the page splits the songs on its own, one by one, and builds this format for you.',
  'importar.barrasDica': 'Only the title is required — if it matches a song on your list, the artist, the category and the file name come along automatically. To fill everything in by hand, use pipes: <b>=== Title | Artist | Category | tom: G | capo: 2</b>',
  'importar.abrirArquivo': '📂 Open a .txt or .pdf file',
  'importar.colarLote': 'Paste the whole file here, or use the button above to open a .txt',
  'importar.separar': 'Split and send everything to the queue',
  'importar.modelo': 'See the template',
  'importar.p1': 'Which song is it?',
  'importar.escolher': 'Pick from your list',
  'importar.titulo2': 'Title',
  'importar.artista': 'Artist',
  'importar.categoria': 'Category',
  'importar.tom': 'Key',
  'importar.capo': 'Capo',
  'importar.ritmo': 'Rhythm (optional)',
  'importar.nomeArquivo': 'File name',
  'importar.p2': 'Paste the chords here',
  'importar.p2dica': 'Copy the whole chord sheet from the site (lyrics with the chords above) and paste it in the box. Messy spacing is fine — I tidy it up.',
  'importar.colar': '[Intro] G  D  Em  C\n\n G              D\nPaste the chords here…',
  'importar.arrumar': 'Tidy up and check',
  'importar.limpar': 'Clear',
  'importar.p3': 'Check how it came out',
  'importar.p4': 'Save this song',
  'importar.addFila': '+ Add to the queue',
  'importar.verUm': 'See this song’s file',
  'importar.p4dica': 'The quick way is to pile the songs into the queue and download everything at the end — that way you upload to GitHub only once.',
  'importar.a': 'a) The chord file',
  'importar.adica': 'Create a file in the repository with the name below (<b>Add file → Create new file</b>) and paste this content inside:',
  'importar.copiar': 'Copy the content',
  'importar.baixarTxt': 'Download the .txt file',
  'importar.b': 'b) The index',
  'importar.opcional': 'optional',
  'importar.baixarJson': 'Download indice.json',
  'importar.copiarJson': 'Copy the whole index',
  'importar.conferir': 'Check the list',
  'importar.conferirDica': 'Looks for chord files that are in the repository but were left out of <b>indice.json</b> — which is why they do not show up — and gives back the corrected list. Worth running whenever a song disappears from the home page.',
  'importar.conferirAgora': 'Check now',
  'importar.fila': 'Queue',
  'importar.filaDica': 'The chords are kept here in your browser — you can close the page and come back later, they stay.',
  'importar.baixarZip': '⬇ Download everything as a .zip',
  'importar.esvaziar': 'Empty the queue',
  'importar.comoSubir': '<b>How to upload:</b> open the .zip, select everything (<b>Ctrl+A</b>), and drag it into <b>Add file → Upload files</b> on GitHub. The <b>indice.json</b> comes along, already updated, and replaces the old one.',
  'importar.veioDaFoto': 'This text came from a photo. Check the chords and the spacing before saving.',
  'importar.titulo': 'Import chords',
  'importar.rodape': 'The text you paste here never leaves your browser.',
  'importar.foto': 'Or take a photo of the chords',

  'config.titulo': 'Settings',
  'config.idioma': 'Site language',
  'avisos.titulo': 'Notifications',
  'avisos.texto': 'Choose what the site may tell you about. You can switch it all off at any time, here or in your device settings.',
  'avisos.permitir': 'Allow notifications',
  'avisos.permitido': 'Notifications allowed on this device.',
  'avisos.negado': 'You have blocked notifications for this site. To undo it, change the permissions for this address in your browser settings.',
  'avisos.semSuporte': 'This browser does not offer notifications.',
  'avisos.estudo': 'Practice reminder',
  'avisos.estudoTexto': 'One nudge a day, at the time you pick, so the guitar does not gather dust.',
  'avisos.versao': 'Site news',
  'avisos.versaoTexto': 'Tells you when the site gets a new version.',
  'avisos.hora': 'Reminder time',
  'avisos.testar': 'See how it looks',
  'avisos.testeTitulo': 'Guitar Chords',
  'avisos.testeCorpo': 'This is how a notification will look on your device.',
  'avisos.estudoTitulo': 'Guitar time',
  'avisos.estudoCorpo': 'How about a few minutes with your chords?',
  'avisos.versaoTitulo': 'The site has changed',
  'avisos.versaoCorpo': 'Version {v} is live. Open it to see what arrived.',
  'avisos.local': 'With the site closed: for now, notifications only appear when you open the site. For them to arrive with it closed a server is needed — the browser side is already done, the server just has to be plugged into config.js.',
  'avisos.pushSem': 'Push with the site closed has not been set up yet. The steps are in the README.',
  'avisos.pushLigar': 'Turn push on',
  'avisos.pushDesligar': 'Turn push off',
  'rodape.versao': 'version',
  'rodape.aviso': 'Notice',
  'geral.fechar': 'Close',
  'geral.cancelar': 'Cancel',
  'geral.salvar': 'Save',
  'geral.sim': 'Yes',
  'geral.nao': 'No'
}
};

/* ---------- qual idioma está valendo ---------- */
let IDIOMA = 'pt';

function idiomaDoAparelho(){
  const n = (navigator.language || 'pt').toLowerCase();
  return n.startsWith('pt') ? 'pt' : 'en';
}
function lerIdiomaSalvo(){
  try{ return localStorage.getItem(IDIOMA_CHAVE); }catch(e){ return null; }
}
function definirIdiomaInicial(){
  const salvo = lerIdiomaSalvo();
  if (salvo === 'pt' || salvo === 'en'){ IDIOMA = salvo; return; }
  const padrao = (typeof CONFIG === 'object' && CONFIG.idiomaPadrao) || 'auto';
  IDIOMA = padrao === 'auto' ? idiomaDoAparelho() : padrao;
}

/* t('chave') devolve o texto no idioma de agora.
   t('lista.varias', {n: 12}) troca o {n} por 12. */
function t(chave, dados){
  let texto = (TEXTOS[IDIOMA] && TEXTOS[IDIOMA][chave]);
  if (texto === undefined) texto = (TEXTOS.pt[chave] !== undefined ? TEXTOS.pt[chave] : chave);
  if (dados) Object.keys(dados).forEach(k=>{
    texto = texto.split('{' + k + '}').join(dados[k]);
  });
  return texto;
}

/* ---------- datas ----------
   PT: 17/Set/2026   EN: Sep/17/2026 */
function formatarData(data){
  /* o módulo das diretrizes formata igual nos três apps: se ele estiver
     aqui, a conta é dele, e este arquivo vira só uma reserva */
  if (window.DGO && typeof DGO.formatarData === 'function'){
    try{ return DGO.formatarData(data); }catch(e){}
  }
  /* '2026-09-17' sem hora é dia de calendário: o navegador entende
     como meia-noite em Londres e, no Brasil, mostraria o dia 16.
     Por isso a data pura é montada à mão, no fuso de quem lê. */
  let d;
  if (data instanceof Date) d = data;
  else if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.trim())){
    const [a, m, dia] = data.trim().split('-').map(Number);
    d = new Date(a, m - 1, dia);
  }
  else d = new Date(data);
  if (isNaN(d)) return '';
  const dia = String(d.getDate()).padStart(2,'0');
  const mes = MESES[IDIOMA][d.getMonth()];
  const ano = d.getFullYear();
  return IDIOMA === 'pt' ? `${dia}/${mes}/${ano}` : `${mes}/${dia}/${ano}`;
}
/* aceita também '2026-09-15' ou '15/09/2026' vindos de um arquivo */
function dataDeTexto(texto){
  if (!texto) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  if (m) return new Date(+m[1], +m[2]-1, +m[3]);
  m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texto);
  if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  const d = new Date(texto);
  return isNaN(d) ? null : d;
}

/* ---------- percorre a página e troca os textos ---------- */
function aplicarIdioma(raiz){
  const area = raiz || document;
  document.documentElement.lang = t('html.lang');

  area.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.dataset.i18n);
  });
  area.querySelectorAll('[data-i18n-html]').forEach(el=>{
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  area.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder = t(el.dataset.i18nPh);
  });
  area.querySelectorAll('[data-i18n-title]').forEach(el=>{
    el.title = t(el.dataset.i18nTitle);
  });
  area.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  area.querySelectorAll('[data-i18n-data]').forEach(el=>{
    const d = dataDeTexto(el.dataset.i18nData);
    if (d) el.textContent = formatarData(d);
  });

  document.querySelectorAll('[data-botao-idioma]').forEach(b=>{
    b.textContent = t('idioma.botao');
    b.title = t('idioma.titulo');
  });

  if (!window.DGO) varrerDatas(area);   /* com o módulo, a varredura é dele */

  /* cada página avisa o resto do seu código que o idioma mudou */
  document.dispatchEvent(new CustomEvent('idioma-mudou', {detail:{idioma: IDIOMA}}));
}

/* ---------- varredura automática de datas ----------
   Percorre o texto da página e reescreve as datas que encontrar
   no formato do idioma de agora. Não entra na cifra, nem em
   caixas de texto, nem em blocos de exemplo — ali o texto é do
   usuário e não pode ser mexido. */
const RE_DATA = /\b(\d{4})-(\d{2})-(\d{2})\b|\b(\d{2})\/(\d{2})\/(\d{4})\b/g;
const FORA_DA_VARREDURA = 'textarea, input, pre, code, script, style, .cifra, .area, .previa, .exemplo, .fila';

function varrerDatas(raiz){
  const area = raiz || document;
  const alvo = area.querySelector ? area : document;
  const caixas = (alvo === document ? document : alvo).querySelectorAll('.conteudo, .rodape, .janela-texto, .faixa-anuncio');
  caixas.forEach(caixa=>{
    const passeador = document.createTreeWalker(caixa, NodeFilter.SHOW_TEXT, {
      acceptNode(no){
        if (!no.nodeValue || !/\d/.test(no.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (no.parentElement && no.parentElement.closest(FORA_DA_VARREDURA)) return NodeFilter.FILTER_REJECT;
        if (no.parentElement && no.parentElement.hasAttribute('data-i18n-data')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const achados = [];
    let no;
    while ((no = passeador.nextNode())) achados.push(no);
    achados.forEach(texto=>{
      const novo = texto.nodeValue.replace(RE_DATA, (tudo, a1, m1, d1, d2, m2, a2)=>{
        const d = a1 ? new Date(+a1, +m1 - 1, +d1) : new Date(+a2, +m2 - 1, +d2);
        return isNaN(d) ? tudo : formatarData(d);
      });
      if (novo !== texto.nodeValue) texto.nodeValue = novo;
    });
  });
}

function trocarIdioma(novo){
  IDIOMA = (novo === 'en') ? 'en' : 'pt';
  try{ localStorage.setItem(IDIOMA_CHAVE, IDIOMA); }catch(e){}
  aplicarIdioma();
}

function iniciarIdioma(){
  definirIdiomaInicial();

  /* ---------------------------------------------------------------
     Com o módulo das diretrizes na página, o botão PT/EN é o DELE —
     um só, igual nos três apps. Este arquivo continua sendo o
     tradutor DESTE site (ele conhece as frases das cifras, dos
     acordes e do importador); só deixa de ter botão próprio e passa
     a obedecer ao idioma que o módulo escolher.
     Sem o módulo, tudo continua funcionando sozinho.
     --------------------------------------------------------------- */
  if (window.DGO){
    seguirModulo();
  }else{
    document.querySelectorAll('[data-botao-idioma]').forEach(b=>{
      b.hidden = false;
      b.addEventListener('click', ()=> trocarIdioma(IDIOMA === 'pt' ? 'en' : 'pt'));
    });
  }
  aplicarIdioma();

  document.addEventListener('dgo:pronto', seguirModulo);
  document.addEventListener('dgo:idioma', e=>{
    const novo = (e.detail && e.detail.idioma) || (window.DGO && DGO.idioma());
    if (novo && novo !== IDIOMA){
      IDIOMA = (novo === 'en') ? 'en' : 'pt';
      try{ localStorage.setItem(IDIOMA_CHAVE, IDIOMA); }catch(err){}
      aplicarIdioma();
    }
  });
}

/* pega o idioma que o módulo está usando e some com o botão antigo */
function seguirModulo(){
  document.querySelectorAll('[data-botao-idioma]').forEach(b => b.remove());
  try{
    const dele = DGO.idioma();
    if (dele && dele !== IDIOMA){
      IDIOMA = (dele === 'en') ? 'en' : 'pt';
      aplicarIdioma();
    }
  }catch(e){}
}
