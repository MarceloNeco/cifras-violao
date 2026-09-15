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
| **▶ Rolar** | a cifra desce sozinha; a barrinha do lado regula a velocidade |
| **A− A+** | tamanho da letra |
| **📱 Modo celular** | tela cheia, letra grande e controles embaixo, para tocar |
| **🎵** | afinador: toca a nota de cada corda |
| **☆** | guarda a música nos favoritos |
| **☾** | modo escuro |
| **▤ Só a cifra** | esconde o cabeçalho e os desenhos (só no computador) |
| **◉ Guia** | bolinha que acompanha os acordes conforme a cifra rola |
| **🔇 / 🔊** | liga o som da bolinha (aparece quando o Guia está ligado) |
| **Ouvir no Spotify** | abre a busca da música no Spotify |
| **Ver no YouTube** | abre a busca da música no YouTube |

Tocando em qualquer acorde (no texto ou no desenho) você **ouve** como ele soa.

O **Guia** acende a linha de acordes que está na altura de leitura e põe uma
bolinha sobre o acorde do momento. Ele segue a **rolagem**, não a música: cifra
não guarda ritmo, então a bolinha anda quando a página anda e para quando a
rolagem para. Serve para não perder o lugar e para saber qual acorde vem a
seguir — não para marcar o compasso.

No computador, a barra de ferramentas e os desenhos dos acordes ficam **grudados
no topo** enquanto você rola a cifra. No celular, a barra do topo some sozinha
quando você rola para baixo, para devolver espaço à cifra, e os desenhos viram
uma faixa que corre para o lado.

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
estilo.css       as cores e o visual (as cores ficam no topo do arquivo)
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

## Versão do site

O rodapé de todas as páginas mostra a versão e a data. Para mudar, edite as
duas primeiras linhas do arquivo `comum.js`:

```js
const VERSAO = '1.0';
const VERSAO_DATA = '15/09/2026';
```

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
