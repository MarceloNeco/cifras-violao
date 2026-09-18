# Cifras de Violão

Site de cifras com **rolagem automática**, **mudança de tom**, **capotraste**,
**posições dos acordes no braço do violão**, **categorias**, **busca**,
**favoritos**, **modo escuro**, **afinador**, **dicionário de acordes** e
**modo celular** para tocar com o aparelho apoiado na estante.

É um site estático: não precisa de servidor, banco de dados nem programa
nenhum instalado. Funciona no GitHub Pages de graça.

---

## As músicas que ainda não têm cifra

O `indice.json` já vem com a lista de músicas que você quer tocar. As que ainda
não têm o arquivo `.txt` aparecem com o selo **sem cifra** e ficam agrupadas no
filtro **Sem cifra** da página inicial.

Abrindo uma delas, a página mostra botões para ouvir no Spotify, ver no YouTube
e procurar a cifra — e o passo a passo para criar o arquivo. Quando o `.txt`
existir, a mesma página passa a mostrar a cifra normalmente. Não precisa mexer
no `indice.json` de novo: a música já está lá.

**Você não precisa editar o `indice.json` na mão.** Assim que o arquivo `.txt`
existir no repositório, a música passa a abrir normalmente, e o selo some
sozinho da lista em até meia hora (o site confere sozinho quais arquivos
existem). Se quiser atualizar o índice mesmo assim — para gravar o tom, por
exemplo — a página **Importar** monta o `indice.json` inteiro, já pronto:
baixe e suba por **Add file → Upload files**, que ele substitui o antigo.

> Editar o `indice.json` linha por linha é a receita para quebrar o site: são
> centenas de linhas e uma vírgula fora do lugar derruba tudo. Troque o arquivo
> inteiro em vez de caçar a linha.

---

## Como adicionar uma música nova

O jeito rápido é a página **Importar** (botão no topo do site): você cola a cifra
copiada de qualquer lugar, ela arruma o texto (tira tabulações, espaços
estranhos e linhas em branco a mais, separa acordes que vieram no meio da letra),
mostra uma prévia com os desenhos dos acordes e entrega o arquivo pronto.
Nada do que você cola sai do seu navegador.

### Uma coletânea em PDF (o mais rápido de todos)

Na página **Importar**, em **Um arquivo com várias**, clique em
**📂 Abrir um arquivo .txt ou .pdf** e escolha o PDF. A página lê o arquivo
inteiro dentro do navegador, separa cada música e já preenche título, artista
e tom.

Para o site reconhecer as músicas, o PDF precisa trazer, antes de cada cifra:
o título numa linha (em MAIÚSCULAS ou numerado, tipo `12. TÍTULO`), o artista
na linha seguinte e uma linha `Tom: X`. Depois é só conferir o texto que
apareceu no quadro e clicar em **Separar e mandar tudo para a fila**.

A leitura do PDF usa a biblioteca pdf.js, que está no próprio repositório
(`pdf-lib.mjs` e `pdf-worker.mjs`) — não depende de internet nem manda o
arquivo para lugar nenhum.

### Um arquivo com várias cifras

Na página **Importar**, escolha **Um arquivo com várias**. Monte um arquivo de
texto com todas as cifras, separando cada música por uma linha que comece com
`===` seguida do título:

```
=== Evidências
[Intro] Gm7  C7  F
 F                Dm
aqui vai a cifra inteira

=== Angie
[Intro] Am  E7
 Am              E7
aqui vai a outra cifra
```

Só o título é obrigatório: se ele bater com uma música da sua lista, o artista,
a categoria e o nome do arquivo vêm sozinhos. Para informar o resto na mão,
separe por barras, em qualquer ordem:

```
=== Título | Artista | Categoria | tom: G | capo: 2 | ritmo: Balada
```

Cole o arquivo (ou abra um `.txt` do computador com o botão) e clique em
**Separar e mandar tudo para a fila**. Ele avisa quantas entraram, qual tom
achou em cada uma e quais blocos ficaram de fora por não ter acordes.
O arquivo `MODELO-VARIAS.txt` no repositório é um exemplo pronto.

### Uma de cada vez

1. Cole a cifra, clique em **Arrumar e conferir** e depois em **+ Adicionar à fila**.
2. Os campos se limpam sozinhos — cole a próxima e repita quantas quiser.
   A fila fica guardada no navegador, então dá para parar e continuar outro dia.
3. Quando cansar, clique em **⬇ Baixar tudo num .zip**.
4. Abra o zip, selecione tudo (**Ctrl+A**) e arraste para
   **Add file → Upload files** no GitHub.

O zip já vem com todos os `.txt` **e** com o `indice.json` atualizado, então é um
upload só para quantas músicas você tiver feito.

Se preferir montar na mão, são **dois passos**.

### Passo 1 — criar o arquivo da cifra

1. Na página principal do repositório, clique em **Add file → Create new file**.
2. No nome do arquivo escreva algo curto, sem acento e sem espaço,
   terminando em `.txt`. Exemplo: `evidencias.txt`
3. Cole a cifra seguindo o formato do arquivo `MODELO.txt`:

```
titulo: Nome da música
artista: Nome do artista
tom: G
capo: 0
categoria: Sertanejo
ritmo: Balada
---
[Intro] G  D  Em  C

 G                D
Primeira linha da letra
 Em               C
Segunda linha da letra
```

O que vem antes da linha `---` é a ficha da música.
O que vem depois é a cifra: **uma linha de acordes, embaixo a linha da letra**.

4. Clique em **Commit changes**.

### Passo 2 — avisar o site que ela existe

1. Abra o arquivo `indice.json`.
2. Clique no lápis ✏️ para editar.
3. Acrescente um bloco novo, **com vírgula depois do bloco anterior**:

```json
  {
    "id": "evidencias",
    "titulo": "Evidências",
    "artista": "Chitãozinho & Xororó",
    "tom": "G",
    "categoria": "Sertanejo",
    "arquivo": "evidencias.txt"
  }
```

O `id` tem que ser igual ao nome do arquivo sem o `.txt`.

4. Clique em **Commit changes**.

Em um ou dois minutos a música aparece no site.

> ⚠️ Cuidado com as vírgulas: no `indice.json`, todo bloco tem vírgula
> depois dele, **menos o último**. Se o site ficar em branco, quase sempre
> é uma vírgula sobrando ou faltando aí.

---

## Como escrever os acordes

O site entende a notação que se usa no Brasil:

| Você escreve | Significa |
|---|---|
| `C` `G` `D` | maior |
| `Am` `Em` | menor |
| `G7` `A7` | com sétima |
| `C7M` ou `Cmaj7` | com sétima maior |
| `Dm7` | menor com sétima |
| `Csus4` ou `C4` | com quarta |
| `Eº` ou `Edim` | diminuto |
| `C+` ou `Caug` | aumentado |
| `G/B` | com baixo diferente |

Partes da música vão entre colchetes, sozinhas na linha ou antes dos acordes:
`[Intro]` `[Refrão]` `[Ponte]` `[Solo]` `[Final]`

---

## Dicionário de acordes

A página `acordes.html` (botão **Acordes** no topo) mostra qualquer acorde sem
precisar abrir música nenhuma:

- digite `Am7`, `C7M`, `F#m`, `G/B`, `Eº`… ou escolha nota + tipo nos botões
- aparecem até 3 posições no braço, com o número de cada dedo
- o nome por extenso (*Lá menor com sétima*) e as notas que formam o acorde
- **Acordes do tom de…** mostra os 7 acordes que costumam andar juntos em cada
  tom — útil para saber o que esperar de uma música

Tocar em qualquer desenho faz o acorde soar.

---

## O que dá para fazer na página da cifra

| Botão | O que faz |
|---|---|
| **− Tom +** | sobe ou desce a música de meio em meio tom |
| **↺** | volta para o tom original |
| **− Capo +** | diz em que casa está o capotraste; os acordes mudam para o formato que a mão faz |
| **▶ Play / ⏸ Pause** | a cifra desce sozinha; a barrinha do lado regula a velocidade |
| **A− A+** | tamanho da letra |
| **📱 Modo celular** | tela cheia, letra grande e controles embaixo, para tocar |
| **🎵** | afinador: toca a nota de cada corda |
| **⤴** | compartilha a música (WhatsApp e o que mais o aparelho tiver) |
| **☆** | guarda a música nos favoritos |
| **☾** | modo escuro |
| **▤ Só a cifra** | esconde o cabeçalho e os desenhos (só no computador) |
| **◉ Guia** | bolinha que acompanha os acordes conforme a cifra rola |
| **🔇 / 🔊** | liga o som da bolinha (aparece quando o Guia está ligado) |
| **Ouvir no Spotify** | abre a busca da música no Spotify |
| **Ver no YouTube** | abre a busca da música no YouTube |

Tocando em qualquer acorde (no texto ou no desenho) você **ouve** como ele soa.

O **Guia** mostra uma **régua** — dois traços nas laterais da tela, sem cruzar a
letra — que marca a altura em que os acordes entram. Arraste pela bolinha ↕ da
direita (ou use as setas ↑ ↓ com ela em foco) para escolher essa altura; a
posição fica guardada.

Conforme a cifra rola, a letra da linha na régua vai sendo **pintada da esquerda
para a direita**. Quando a tinta chega embaixo de um acorde, ele acende — e soa,
se o som estiver ligado. A bolinha viaja na frente da tinta.

A posição horizontal do acorde sobre a letra é o que define quando ele entra.
É a única pista de tempo que uma cifra tem: um acorde escrito sobre a última
palavra do verso entra no fim do verso. Continua não sendo compasso, mas é bem
mais fiel do que dividir a linha em partes iguais. Ele segue a **rolagem**, não a música: cifra
não guarda ritmo, então a bolinha anda quando a página anda e para quando a
rolagem para. Serve para não perder o lugar e para saber qual acorde vem a
seguir — não para marcar o compasso.

No computador, a barra de ferramentas e os desenhos dos acordes ficam **grudados
no topo** enquanto você rola a cifra. No celular, a barra do topo some sozinha
quando você rola para baixo, para devolver espaço à cifra, e os desenhos viram
uma faixa que corre para o lado.

**No modo celular, com o Play ligado:** depois de uns 3 segundos a barra de
controles e a faixa do título **se recolhem sozinhas** e fica só um botão
redondo de Play/Pause no canto de baixo — a cifra ocupa a tela inteira. Um
toque em qualquer lugar da cifra traz a barra de volta. E enquanto o seu dedo
está na tela, a rolagem automática **para de empurrar**, para não brigar com o
arrasto; assim que você solta, ela continua de onde estava.

**Pelo teclado:** barra de espaço liga e desliga a rolagem, setas ↑ ↓ mudam a
velocidade, `+` e `−` mudam o tom, `Esc` sai do modo celular.

---

## Estrutura dos arquivos

Todos os arquivos ficam soltos na raiz do repositório, sem pasta nenhuma —
assim nada quebra na hora de subir os arquivos pelo site do GitHub.

```
capa.jpg         a foto da faixa de cima da página inicial
fundo.jpg        imagem de fundo do site (telas grandes)
fundo-celular.jpg  imagem de fundo do site (celular)
index.html       página inicial: busca, categorias e favoritos
cifra.html       página que mostra uma cifra
acordes.html     dicionário de acordes
importar.html    cola uma cifra e gera o arquivo pronto
ocr.html         foto vira cifra (câmera + leitura de imagem)
conta.html       visitante, assinante, anunciante, nuvem e instalação
estilo.css       as cores e o visual (as cores ficam no topo do arquivo)
config.js        o painel de controle: anúncios, idioma, códigos da nuvem
idioma.js        todos os textos em português e em inglês
conta.js         perfis, senha local, faixa de anúncio, compartilhar
conta-pagina.js  a tela da página Conta
notificacoes.js  avisos: permissão, lembretes e a base do push
nuvem.js         Google Drive, OneDrive e cópia em .json
ocr.js           a página da foto
ocr-worker.js    quem conversa com o motor de leitura
manifest.json    o que faz o site virar aplicativo
sw.js            faz o site abrir sem internet (troque a versão ao publicar)
icone-192.png    ícone do aplicativo
icone-512.png    ícone do aplicativo (grande)
tesseract-core-simd-lstm.wasm.js   motor de leitura de imagem
tesseract-core-lstm.wasm.js        motor de leitura (aparelhos antigos)
por.traineddata.gz                 português, para a leitura
eng.traineddata.gz                 inglês, para a leitura
acordes.js       entende, transpõe e desenha os acordes
comum.js         tema, favoritos e leitura dos arquivos de música
biblioteca.js    a busca e a lista da página inicial
leitor.js        rolagem, tom, capotraste, afinador, modo celular
dicionario.js    a página do dicionário de acordes
importador.js    a limpeza e a formatação da cifra colada
zip.js           monta o .zip da fila dentro do próprio navegador
aviso.js         o texto do aviso e a janela que o mostra
leitor-pdf.js    lê coletâneas de cifras em PDF
pdf-lib.mjs      biblioteca pdf.js (não mexa)
pdf-worker.mjs   biblioteca pdf.js (não mexa)
indice.json      a lista de todas as músicas
MODELO.txt       modelo de uma cifra
MODELO-VARIAS.txt  modelo do arquivo com várias cifras de uma vez
*.txt            uma cifra por arquivo
```

---

## A imagem de fundo

O botão **▨** no topo liga e desliga a foto de fundo, e a sua escolha fica
guardada no navegador. São dois arquivos:

- `fundo.jpg` — telas grandes (deitada)
- `fundo-celular.jpg` — telas de celular (em pé, para a foto não ficar esticada)

Para trocar, suba outras imagens com esses mesmos nomes. Por cima da foto o
site aplica um véu claro ou escuro conforme o tema, para o texto continuar
legível — por isso a foto aparece bem mais forte no modo escuro. No **modo
celular** (o de tocar), o fundo some sozinho: ali o que importa é enxergar a cifra.

---

## Trocar a foto da capa

A faixa de cima da página inicial usa o arquivo **`capa.jpg`**. Para trocar:
suba outra imagem com esse mesmo nome (`capa.jpg`) e ela substitui a atual.
Funciona melhor com fotos largas e escuras, a partir de 1200 pixels de largura.
Se o arquivo não existir, a faixa continua funcionando, só com um fundo marrom.

---

## Conferir a lista

Se uma música sumir da página inicial, quase sempre é a linha dela no
`indice.json` que se perdeu — o arquivo `.txt` continua no repositório.

Na página **Importar** há o passo **Conferir a lista**: ele compara os arquivos
que estão no repositório com o que o índice conhece, lê a ficha de cada cifra
órfã e entrega o `indice.json` corrigido para baixar e subir.

> **Nunca substitua o `indice.json` por uma cópia antiga.** Ele é a sua lista de
> músicas, não faz parte do código do site. Os pacotes de atualização do site
> não devem trazer esse arquivo nem os `.txt` das cifras.

---

## Versão do site

O rodapé de todas as páginas mostra a versão e a data. Para mudar, edite as
duas primeiras linhas do arquivo `comum.js`:

```js
const VERSAO = '2.0';
const VERSAO_DATA = '2026-09-17';
```

A data é escrita no formato `aaaa-mm-dd` e o site a mostra sozinho como
`17/Set/2026` em português e `Sep/17/2026` em inglês.

Ao publicar uma mudança, troque **também** o número na primeira linha útil do
arquivo `sw.js`:

```js
const VERSAO_CACHE = 'cifras-v2.0';
```

É esse número que avisa os celulares que já têm o site instalado de que existe
uma versão nova. Sem trocá-lo, quem já usou o site pode continuar vendo a
versão antiga.

Sugestão de contagem: ajustes e recursos novos sobem a segunda casa — 1.0, 1.1,
1.2. Uma reformulação grande do site sobe a primeira — 2.0. Acrescentar cifras
não precisa mudar a versão.

---

## Aviso de uso

O link **Aviso**, no rodapé de todas as páginas, abre uma janela por cima da
página (não sai de onde se está; fecha no ✕, no botão, na tecla Esc ou clicando
fora). O endereço `index.html#aviso` também abre direto, se for preciso mandar
o link para alguém.

O texto fica em `aviso.js` e registra: acervo pessoal de estudo, sem finalidade
comercial; direitos das obras pertencem aos titulares; pedidos de remoção
atendidos de imediato; e o que o site faz — e não faz — com dados.

### Ligar o formulário de remoção

O aviso traz um formulário para pedidos de retirada. Enquanto não for
configurado, ele mostra um recado dizendo que o canal não está no ar. Para
ligar, são cinco minutos:

1. Entre em **formspree.io** e crie uma conta gratuita.
2. Crie um formulário novo (**+ New form**) e informe o e-mail que deve receber
   as mensagens.
3. O serviço devolve um endereço parecido com
   `https://formspree.io/f/abcdwxyz`. Copie.
4. Abra o `aviso.js` no GitHub, clique no lápis, e cole esse endereço entre as
   aspas da linha:

```js
const FORMULARIO_REMOCAO = '';
```

5. **Commit changes.** O formulário passa a funcionar, e o e-mail nunca aparece
   na página.

O plano gratuito aceita 50 mensagens por mês, de sobra para o que esse canal
existe. Na primeira mensagem recebida, o Formspree pede uma confirmação por
e-mail — vale fazer um envio de teste logo depois de configurar.

---

## Sobre as músicas de exemplo

As seis cifras que vêm no site são de **domínio público** (folclore brasileiro
e obras de autores falecidos há mais de 70 anos). Podem ficar no ar sem
problema. As cifras que você acrescentar depois são de sua responsabilidade —
letras de música têm direito autoral, então o uso recomendado é pessoal.


---

## Versão 2.1 — o site e o módulo das diretrizes

A partir desta versão, tudo o que é **igual nos seus três apps** — idioma,
anúncio, conta, avisos, nuvem, compartilhar e instalação — deixou de ser código
deste site e passou a vir do **módulo das diretrizes** (`diretrizes.js`), o
mesmo arquivo nos três. O que é só das cifras continua aqui.

### Quem faz o quê

| Recurso | Quem cuida | Onde se mexe |
|---|---|---|
| Botão PT / EN | módulo | `diretrizes-config.js` |
| Texto do site nos dois idiomas | **este site** (`idioma.js`) | `idioma.js` |
| Formato das datas | módulo | `diretrizes-config.js` |
| Faixa de anúncio | módulo | `diretrizes-config.js` |
| Conta (visitante, assinante, anunciante) | módulo | `diretrizes-config.js` |
| Avisos / notificações | módulo | `diretrizes-config.js` |
| Nuvem (Drive, OneDrive, backup) | módulo | `diretrizes-config.js` |
| Compartilhar | módulo | — |
| Instalar como app | módulo | `manifest.json` (a cara) |
| Abrir sem internet | módulo (`sw.js`) | `sw.js` |
| **Cifra, tom, capo, rolagem, guia** | este site | `leitor.js` |
| **Dicionário de acordes** | este site | `acordes.js`, `dicionario.js` |
| **Importar e ler PDF** | este site | `importador.js` |
| **Foto vira cifra** | este site | `ocr.js`, `ocr-worker.js` |
| **Aviso de uso** | este site | `aviso.js` |

Há **duas** caixas de ajuste, e elas não se misturam:

- `diretrizes-config.js` — os ajustes do módulo, no mesmo formato dos seus
  outros apps.
- `idioma.js` — as frases deste site em português e em inglês.

### Por que a tradução continua sendo daqui

O módulo traduz por lista de frases. A lista dele cobre as palavras comuns de
qualquer app ("Configurações", "Voltar", "Início"), mas não as frases deste
site — "Busque pelo nome da música", a página Importar inteira, o dicionário de
acordes, o Aviso. Traduzidas pelo módulo, elas ficariam em português no modo EN.

Por isso o `idioma.js` continua aqui, com o site inteiro nos dois idiomas
(inclusive os nomes dos acordes: *Lá menor com sétima* vira *A minor seventh*).
Ele não tem mais botão próprio: quem manda no idioma é o botão do módulo, e o
`idioma.js` só obedece. Um botão, um idioma, o site todo traduzido.

No HTML, o conteúdo das páginas está marcado com `data-dgo-ignorar` — é o que
impede os dois tradutores de mexerem no mesmo texto. **Se você criar uma página
nova**, ponha `data-dgo-ignorar` no `<main>` dela e as frases no `idioma.js`.

### Por que o OCR deste app está com `ativo: false`

O leitor de foto do módulo baixa o motor de um servidor público na primeira vez.
Aqui você escolheu o contrário: o motor mora dentro do seu repositório, e o site
lê foto sem depender de ninguém, até sem internet.

Quem faz isso é a página **Foto** (`ocr.html`), que além de ler já conserta os
acordes que saíram tortos e manda o texto direto para a fila do Importar.
Deixar os dois ligados baixaria duas vezes a mesma coisa. Nos seus outros apps,
deixe `ocr: { ativo: true }`.

---

## O que mudou na cifra, nesta versão

### Play e Pause, e a barra que sai da frente

O botão agora diz **▶ Play** e **⏸ Pause**.

No modo celular, com o Play ligado, depois de uns 3 segundos a barra de
controles e a faixa do título **se recolhem sozinhas** e fica só um botão
redondo no canto de baixo — a cifra ocupa a tela inteira. Um toque em qualquer
lugar da cifra traz a barra de volta.

Enquanto o seu dedo está na tela, a rolagem automática **para de empurrar**,
para não brigar com o arrasto; quando você solta, ela continua de onde estava.
E durante o Play a barra do topo fica quieta: antes ela reaparecia por cima da
cifra assim que você arrastava para cima, e era isso que ficava estranho.

O banner e o botão PT/EN do módulo também somem no modo celular.

### Foto vira cifra

A página **Foto** abre a câmera do celular ou do notebook, ou aceita uma imagem
da galeria. Você endireita, ajusta o contraste, toca em **Ler a imagem**, e o
texto sai numa caixa que dá para corrigir antes de mandar para o Importar.

Arquivos do motor, todos na raiz do repositório:

```
tesseract-core-simd-lstm.wasm.js   o motor (aparelhos modernos)
tesseract-core-lstm.wasm.js        o motor (aparelhos mais antigos)
por.traineddata.gz                 o português
eng.traineddata.gz                 o inglês
ocr-worker.js                      quem conversa com o motor
```

São uns 11 MB. Ficam guardados no aparelho depois da primeira leitura.

**Para sair bom:** luz de frente, sem sombra da mão nem brilho de flash; a folha
o mais reta possível preenchendo a tela; uma página por foto.

### O Aviso agora conta a verdade sobre o anúncio

O Aviso dizia que este acervo não tem publicidade nem monetização de espécie
alguma — e era nisso que ele se apoiava no art. 46 da Lei 9.610/1998, o artigo
da cópia particular para estudo. Com anúncio no ar, isso deixa de ser verdade, e
um acervo de letras e harmonias de terceiros **com publicidade** é uma situação
juridicamente bem mais frágil.

O texto agora acompanha o `diretrizes-config.js` sozinho: com
`anuncios: { ativo: false }` ele afirma que não há monetização nenhuma; com
`ativo: true` ele reconhece a publicidade e registra a consequência, em vez de
afirmar algo falso. A decisão é sua — mas é maior do que parece.

O Aviso continua só em português de propósito: cita leis brasileiras, e uma
tradução daria a impressão errada de valer em outro país. A janela abre com uma
linha em inglês explicando isso.

---

## Ao publicar uma versão nova

Troque o número em **dois** lugares, senão quem já abriu o site pode continuar
vendo a versão antiga:

```js
comum.js  ->  const VERSAO = '2.1';
sw.js     ->  var VERSAO = 'v1';     (suba para 'v2', 'v3'…)
```

---

## Estrutura dos arquivos

Todos soltos na raiz do repositório, sem pasta nenhuma.

**Do módulo das diretrizes (iguais ou quase iguais nos três apps)**

```
diretrizes.js          o módulo — idêntico nos três apps
diretrizes-config.js   os ajustes DESTE app
sw.js                  abrir sem internet e instalar como app
manifest.json          o nome, a cor e o ícone do app instalado
icone-192.png          ícone
icone-512.png          ícone
anuncie-aqui.png       o espaço de anúncio, nas cores deste site
```

**Do site de cifras**

```
index.html       busca, categorias e favoritos
cifra.html       a página que mostra uma cifra
acordes.html     dicionário de acordes
importar.html    cola uma cifra e gera o arquivo pronto
ocr.html         foto vira cifra
aviso.html       o aviso de uso em página inteira
estilo.css       as cores e o visual
comum.js         barra do topo, tema, fundo, favoritos, rodapé
idioma.js        todas as frases do site em português e em inglês
leitor.js        tom, capo, rolagem, guia, afinador, modo celular
biblioteca.js    a página inicial
acordes.js       o que o site sabe sobre acordes
dicionario.js    a página do dicionário
importador.js    arrumar a cifra colada e montar o arquivo
aviso.js         o texto do Aviso
ocr.js           a página da foto
ocr-worker.js    a leitura da imagem
tesseract-core-simd-lstm.wasm.js   motor de leitura
tesseract-core-lstm.wasm.js        motor de leitura (aparelhos antigos)
por.traineddata.gz                 português, para a leitura
eng.traineddata.gz                 inglês, para a leitura
TESTE-cifras-violao.html           página de conferência do módulo
```

**Já no repositório, não precisa subir de novo:** as cifras `.txt`,
`indice.json`, `capa.jpg`, `fundo.jpg`, `fundo-celular.jpg`, `zip.js`,
`leitor-pdf.js`, `pdf-lib.mjs`, `pdf-worker.mjs`, `MODELO.txt`,
`MODELO-VARIAS.txt`.
