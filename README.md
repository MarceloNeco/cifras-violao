# Cifras de Violão

Site de cifras com **rolagem automática**, **mudança de tom**, **capotraste**,
**posições dos acordes no braço do violão**, **categorias**, **busca**,
**favoritos**, **modo escuro**, **afinador** e **modo celular** para tocar
com o aparelho apoiado na estante.

É um site estático: não precisa de servidor, banco de dados nem programa
nenhum instalado. Funciona no GitHub Pages de graça.

---

## Como adicionar uma música nova

São **dois passos**.

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

Tocando em qualquer acorde (no texto ou no desenho) você **ouve** como ele soa.

**Pelo teclado:** barra de espaço liga e desliga a rolagem, setas ↑ ↓ mudam a
velocidade, `+` e `−` mudam o tom, `Esc` sai do modo celular.

---

## Estrutura dos arquivos

Todos os arquivos ficam soltos na raiz do repositório, sem pasta nenhuma —
assim nada quebra na hora de subir os arquivos pelo site do GitHub.

```
index.html       página inicial: busca, categorias e favoritos
cifra.html       página que mostra uma cifra
estilo.css       as cores e o visual (as cores ficam no topo do arquivo)
acordes.js       entende, transpõe e desenha os acordes
comum.js         tema, favoritos e leitura dos arquivos de música
biblioteca.js    a busca e a lista da página inicial
leitor.js        rolagem, tom, capotraste, afinador, modo celular
indice.json      a lista de todas as músicas
MODELO.txt       modelo para copiar quando for criar uma cifra nova
*.txt            uma cifra por arquivo
```

---

## Sobre as músicas de exemplo

As seis cifras que vêm no site são de **domínio público** (folclore brasileiro
e obras de autores falecidos há mais de 70 anos). Podem ficar no ar sem
problema. As cifras que você acrescentar depois são de sua responsabilidade —
letras de música têm direito autoral, então o uso recomendado é pessoal.
