# A Botija de Santa Isabel

Aventura de ação 2D em tempo real, com visão de cima e pixel art. Você troca de personagem na hora e o jogo é cheio de comédia absurda do Sertão Central do Ceará.

Roda no navegador e é feito só com HTML, CSS e JavaScript, sem instalar nada. Para jogar, **dê dois cliques no `index.html`**.

> **Estado atual: Atualização final pré-1.0 — Etapas 1 a 4 de 5 prontas** (mapas, luz, minimapa, grupo, gráficos, combate e **diálogos: falas de combate, conversas de estrada, fofocas, chefes falando e cutscenes expandidas**). Falta a Etapa 5 (polimento e v1.0).

O jogo é **para PC** (Windows, no navegador, teclado e mouse). Controle de videogame é opcional.

---

## Como jogar

### Teclado e mouse (tudo pode ser trocado em Pausa → Opções → Controles)
| Tecla | Ação |
|---|---|
| WASD ou setas | andar |
| Shift | correr |
| Clique esquerdo (ou J) | atacar / atirar (cliques seguidos = combo de 3 golpes) |
| Clique direito (segurar) | mira de precisão (anda devagar, leque fechado, linha de mira) |
| R | recarregar |
| C | esquiva / rolamento (invencível por um instante) |
| Roda do mouse | trocar de arma (principal / secundária / arremesso) |
| Z (segurar) | roda de armas, com o tempo lento |
| X | travar a mira no inimigo mais perto do cursor |
| I | equipamento do grupo |
| F | habilidade de quem você controla |
| **1 a 6** | **pedir a habilidade de cada companheiro sem trocar** (mira no mouse) |
| Q ou Tab / Shift+Tab | trocar quem você controla |
| T | ordem pro grupo: ME SEGUE → AVANÇAR → SEGURAR POSIÇÃO |
| G | poder de grupo (quando a barra roxa enche) |
| E ou Espaço | falar / interagir / avançar diálogo |
| M | mapa completo |
| Esc (ou P) | pausa |
| F1 | modo debug |



### Gamepad (opcional)
| Botão | Ação |
|---|---|
| Analógico | andar |
| RT / LT | correr |
| A | atacar |
| X | habilidade |
| Y | poder |
| B | falar |
| RB | trocar de personagem |
| LB | ordem pro grupo |
| Back | mapa |
| Start | pausa |

### O grupo que se vira sozinho
Não precisa ficar trocando de personagem toda hora:
- **O especialista vem sozinho.** Interagiu com o cabo da caixa de som, o gerador do palanque ou a botija? O Hugo ou o Miguel vem correndo e faz a parte dele. Se ele não estiver no grupo, aparece um aviso.
- **Teclas 1 a 6:** o companheiro daquele número (veja nos rostinhos no canto) usa a habilidade na direção do mouse. O Zé Neto corre até quem está mais machucado.
- **Habilidade sozinho:** os companheiros usam a habilidade quando faz sentido (o João Vitor levanta o escudo quando vem tiro, o Daniel só bota fogo se não tiver amigo perto...). Em Opções dá pra mudar pra "só quando eu pedir".
- **Ordens (T):** ME SEGUE (padrão), AVANÇAR (vão pra cima dos inimigos mais longe) e SEGURAR POSIÇÃO (ficam numa bandeirinha onde você estava).
- **Rostinhos no canto:** número, vida, recarga da habilidade (o rosto vai clareando; quadradinho amarelo = pronta) e um tracinho verde quando estão indo fazer uma tarefa.
- Diálogos especiais (o Miguel vendo os desenhos, o Davi traduzindo o bode...) acontecem se a pessoa estiver **no grupo**, não precisa estar no controle.

### Luz, mapas e minimapa
- **Horário por fase:** noite enluarada no prólogo, madrugada roxa na serra, fim de tarde dourado na cidade, noite de festa no Ato III. Ficou bem mais claro: sempre existe um **luar mínimo**. Só a luta com a alma é "terror" (bem escuro, mas os inimigos ainda aparecem).
- **Mapas:** telhado de telha nas casas, janela azul, copa do juazeiro e mandacaru alto (quem passa por trás some atrás da copa, que fica transparente), chão com manchas e transição entre terra e piçarra, miudezas, **placas engraçadas** (aperte E nelas) e objetos (bicicleta, mesa de plástico, varal, cocho...).
- **Sertão vivo:** galinha ciscando, calango, urubu rodando com sombra no chão, jumento passando, folha no vento, fumaça de chaminé e eventos à toa (redemoinho, moto passando lá longe, vizinho gritando).
- **Minimapa** (canto de cima à direita): só mostra o que o grupo já viu. Estrela = objetivo; se ele estiver longe, uma seta na borda diz a distância. **M** abre o mapa completo: roda do mouse dá zoom, arrastar move, clique marca um ponto.
- **Opções (Pausa → Opções):** brilho, escuridão normal/reduzida, minimapa (ligar, posição, tamanho, transparência), companheiros com habilidade sozinhos ou não, som, volume e controles.

### Gráficos (Etapa 2)
Tudo continua sendo desenhado por código (nenhuma imagem baixada), agora com o **dobro de detalhe**:
- **Personagens novos:** 32×48 pixels de arte, proporção realista, 4 a 5 tons por cor, luz vinda da esquerda e contorno suave. Animações: parado respirando (4 quadros), andar e correr (8), atacar (6), atirar (4), levar dano, cair e a **mania de cada um** quando fica parado uns segundos (Helano no celular, Miguel desenhando, Daniel com fósforo, João Pedro limpando o escapamento, Davi falando com o nada, Zé Neto lendo bula).
- **Corpo e arma apontam pro mouse.** A arma aparece na mão (soca-tempo, calibre 20, peixeira, facão, maleta, chave inglesa), com clarão no tiro.
- **Cenário em 32×32:** terra com grão e rachadura, piçarra com cascalho, capim seco em tufos, pedra com volume, água com margem, espuma e brilho, telhado de telha, parede de taipa com reboco caído, piso vermelhão encerado, chão de tábua. Copa do juazeiro e mandacaru com volume de verdade.
- **Objetos e bichos** ganharam relevo e contorno fino automaticamente.
- **Retratos de diálogo 80×80** com 5 expressões (normal, rindo, bravo, assustado, desconfiado). A expressão é adivinhada pela fala ou marcada no diálogo: `['miguel:bravo', 'texto']`.
- **Luz e efeitos:** luz suave em resolução cheia, sombra projetada pela fogueira/lanterna, sombra de nuvem passando, brilho na água, mariposas nas lâmpadas, e pós-processamento (bloom, vinheta, granulado) que dá pra desligar.
- **Interface de cordel:** caixas de madeira entalhada com cravinhos de latão, retrato emoldurado, cursor próprio (retícula no jogo, mãozinha nos menus), tela de título animada (lua cheia, serra andando devagar, igrejinha, a rede balançando no alpendre, vagalumes) e transição de **página de cordel virando**.
- **Opções → Gráficos:** *Leve* (o visual antigo, pra PC fraco), *Médio* (padrão) ou *Bonito* (com bloom e granulado). **F1 → Galeria** mostra todos os sprites, retratos, objetos e tiles lado a lado.
- Comparação: imagens de antes/depois em `docs/`.

#### Arte extra de pacotes gratuitos (CC0)
Duas coisas vêm de pacotes da **Kenney (kenney.nl), licença CC0** (uso livre, crédito opcional — está nos créditos do jogo):
- **Particle Pack 1.1:** fumaça, chama da fogueira, clarão do tiro e risco do golpe (as texturas são brancas e o jogo pinta com a cor certa).
- **Input Prompts Pixel 1.0:** os ícones das teclas no HUD (1–6, F, G, T, E...). Os do mouse continuam desenhados por código.
Só 79 imagens foram usadas (as partículas reduzidas pra 64 px), embutidas em `js/data/imagens_kenney.js` (97 KB). Nos gráficos *Leve* o jogo não usa nada disso.

#### Trocar um desenho por uma imagem sua (PNG)
O jogo tem "encaixes": se existir uma imagem com o nome certo, ela é usada no lugar do desenho por código (ex.: `retrato:miguel:bravo`, `tecla:KeyF`, `part:fumaca1`). Como o jogo abre com dois cliques (`file://`), o navegador não deixa ler os pixels de um PNG solto: as imagens vão pra dentro de um `.js` com o conversor:

```
powershell -File tools\embutir_imagens.ps1 -Lista minha_lista.txt -Saida js\data\minhas_imagens.js
```
Cada linha da lista: `nome|caminho\da\imagem.png|tamanho` (tamanho 0 = não muda). Depois é só pôr o `.js` novo no `index.html`, logo depois de `imagens_kenney.js`.

### Combate (Etapa 3)
- **27 armas** (config/weapons.js): 6 de fogo (soca-tempo, calibre 20, pressão, baladeira, pistola de prego, rojão), 11 corpo a corpo (peixeira, facão, foice, enxada, pá, relho, laço, maleta, chave inglesa, cadeira e taco de sinuca), 6 de arremesso (garrafa, traque, bomba de São João, pedra, farinha, pimenta) e **4 lendárias** que a história libera: a Chinela da Tia Zane, a Caixa de Som do Gojoba, o Braço do Paulo e o Lampião do Tio Ota (só os netos). Cada uma tem dano, cadência, alcance, pente, recarga, munição, espalhamento, empurrão, **barulho** (chama inimigo e, na mata, irrita a Caipora) e **raridade** com cor.
- **Cada um carrega 3 armas** (principal, secundária, arremesso). O inventário é do grupo, mas cada arma fica com uma pessoa só. Na **tela de equipamento (I)** é só arrastar; passando o mouse aparecem os atributos e a **afinidade**: ★ se a pessoa é boa com a arma, ✗ se é ruim (ex.: Lapuca é mestre das espingardas, o Zé Neto tem mira tremida mas é ótimo com pimenta e farinha, o Miguel é mestre da baladeira, o Hugo recarrega rápido e destrava a pistola na hora, o João Carlos manda bem com garrafa, cadeira e taco de sinuca).
- **Arma nova no chão:** aparece um cartão com nome, raridade e atributos, e você escolhe quem fica com ela.
- **Munição por tipo:** cartucho, chumbinho, prego, rojão, querosene e os arremessos. **Oficina do Hugo:** em qualquer fogueira acesa (E), melhora armas com **sucata** (que cai dos capangas ou sai cavando com a pá), e a arma ganha nome novo ("Soca-tempo turbinada"...). **Bodega da Dona Socorro:** prateleira de munição, com dinheiro achado ou no fiado.
- **Impacto:** pausinha no acerto, tremor, empurrão, partículas e onomatopeias de cordel (PÁ! TEI! VUPT! OXE!), cada golpe com seu som.
- **Mira:** retícula própria que abre depois do tiro, cone das espingardas, arco e ponto de queda dos arremessos, trava de alvo (X) e setas na borda pra inimigo vindo de fora. Em Opções: **assistência de mira** e **fogo amigo**.
- **8 inimigos novos:** capanga de peixeira, capanga de espingarda (mantém distância, mostra a linha vermelha antes de atirar), capanga de escudo (só toma por trás; fogo e explosão passam), cachorro bravo (em bando), cascavel (escondida no mato, chocalha antes do bote), abelha italiana (persegue até você entrar na água), alma menor (atravessa parede; só luz, reza e fogo) e bode endiabrado (raspa o casco e investe em linha reta; se bater na parede fica tonto). **No máximo 2 ou 3 atacam ao mesmo tempo**; os outros ficam rodeando.
- **Combos** (o nome aparece na tela): Parede de Fogo, Tiro Crítico no Atordoado, Tiro Perfurante, Churrasco Explosivo, Molotov do Daniel, Explosão de Poeira, Saideira e Muralha Amadeu.
- **Chefes:** barra de vida grande no topo, com o nome em letra de cordel.
- **Dificuldade:** Turista, Cabra da Peste ou Lapuca (escolhe no Novo Jogo; muda em Opções).
- **Debug (F1):** ARSENAL (todas as armas no bornal e munição cheia), Campo de Tiro (bonecos de palha) e Arena (chama qualquer inimigo ou chefe).

### Diálogos (Etapa 4)
- **Falas de combate:** os 12 têm as suas (quase 290 no total), por situação: começar a briga, acertar, apanhar, sem munição, recarregar, trocar arma, ser curado, habilidade, derrubar um e amigo caído. Nunca repete a mesma fala duas vezes seguidas.
- **49 conversas de estrada** em balão, sem pausar o jogo, conforme quem está no grupo: Davi e João Pedro no **idioma da família** (tudo com "-ôte"), os Amadeus brigando pelas regras da tribo, o Zé Neto diagnosticando todo mundo, o Lapuca encerrando discussão com uma frase.
- **Reações:** caça, fogo se espalhando, web namorada do Helano, Tia Zane chegando, fake news do Stelo, poder de grupo, Juízo baixo, arma lendária.
- **Listas sorteadas:** 32 fake news do Stelo, 32 frases do Lapuca, 22 diagnósticos do Zé Neto, 16 ofertas do Felipe, 16 planos infalíveis do Davi.
- **Fofocas:** Dona Socorro, o Padre, Dona Benedita, Stelo, Felipe e Seu Chico comentam o que vocês fizeram (Paulo aliado ou de olho roxo, a alma que sossegou, a Caipora zangada, o áudio dos reptilianos...).
- **Chefes falam durante a luta** (entrada, troca de fase, quando apanham, derrota) e a conversa depois muda se ele virou aliado.
- **Cutscenes maiores**, com reação de todo mundo e escolhas engraçadas com consequência: a vizinha da chinela no prólogo, o último pedaço da carne na Noite da Pipoca, o "teste do bode" na revelação dos irmãos, a distração dos capangas no roubo da botija e o leilão de galinha na festa.
- **Retratos com expressão:** cada fala pode marcar a expressão (`['miguel:bravo', 'texto']`); sem marca, o jogo adivinha pelo texto.
- **Onde fica cada coisa:** `js/story/data/` — diálogos por ato, `falas_combate.js`, `estrada.js`, `reacoes.js` (reações e fofocas), `listas.js`, `falas_chefe.js`. O validador confere personagem inexistente, flag desconhecida, expressão inválida, lista inexistente e nó quebrado.

### Regras rápidas
- **Personagem:** você controla um por vez e os outros seguem atrás (IA), lutam e usam habilidade sozinhos. Cada um tem 3 corações.
- **Quedas:** quem cai volta de pé na próxima fogueira ou na entrada do próximo mapa. O Zé Neto também pode revivê-lo com a habilidade.
- **Fogueira:** é o checkpoint. Encostar nela salva o jogo.
- **Todo mundo caiu:** o grupo volta para a última fogueira.
- **Noite:** a lanterna enxerga mais longe, mas **a pilha acaba**. Pegue pilhas pelo caminho.
- **Fogo:** o mato seco pega fogo e o fogo se espalha. Ele abre caminho, mas também queima o grupo (menos o Daniel, que só sorri).
- **Caça:** caçar bicho sobe a **Raiva da Caipora**.

### O que tem até agora
| Fase | Onde | Grupo | O que acontece |
|---|---|---|---|
| **Prólogo — Duas da Manhã** | Terreiro do alpendre | João Pedro, Miguel, Daniel, Davi, Helano, Zé Neto | Pegar as espingardas e a cartucheira, chamar Trovão e Piaba, conversar com a turma. O Vander chega com o sonho da botija, e as escolhas mexem nas flags e na Desconfiança. |
| **Ato I — A Caçada que Dá Errado** | Trilha do pé da serra, a Serra e a Grota | o mesmo | Caça (sobe a Raiva da Caipora), cachorros latindo pro nada, o pé torcido do Davi com o boldo do Zé Neto, o Vander aparecendo e sumindo, a pedra com desenho do Miguel, o toco da Caipora (deixe o fumo de rolo do terreiro!) e o **golpe da web namorada nº 1** no alto da serra. Se o Helano cair no golpe, todo mundo vai parar na grota. |
| **Ato I — O Pedágio do Roma** | Terras do Paulo e campo do Roma | Tribo dos Amadeus + Helano, Miguel, João Pedro | Reencontro com a Tribo, torcedores bêbados, Seu Chico Vaqueiro, a porteira do pedágio (pagar, enrolar ou brigar) e o **BOSS Paulo do Zé Baixinho**. |
| **Interlúdio — A Noite da Pipoca** | Açudinho, curral do Tio Ota e casa do Dudu | Miguel, Daniel, João Pedro, Vander, Helano, Davi | Pipoca na fogueira (minigame de timing), as histórias do Tio Ota contadas pelos três netos, o silêncio... e o **BOSS Alma da Casa do Dudu**. |
| **Interlúdio — O Amanhecer** | Açudinho ao nascer do sol | o mesmo | O Dudu revela de quem é a alma. A Tia Zane chega atrás do ladrão de carne: o Miguel foge (perseguição com chinela teleguiada) ou se explica. Respeitada, ela conta o que o Tio Ota dizia da botija. |
| **Ato II — A Tapera** | Santa Isabel e o bar do Stelo | Hugo, João Carlos, Davi, João Pedro, Miguel, Zé Neto | A cidade ao fim da tarde: o **Stelo** e suas 3 teorias (uma é verdade, as outras são fake news que tiram Juízo e levam a um desvio cômico), a **bodega** (fiado no caderno), a **rezadeira** (cura e devolve Juízo), o **padre**, o **Felipe Parceiro** (atalho e moto baratinha) e o **BOSS Gojoba**. Depois, o Miguel acha o mapa da tapera no banheiro. |
| **Ato II — O Caminho da Tapera** | Caminho, tapera e porão | Davi, João Pedro, Vander, Hugo, Daniel, Helano | Capangas na trilha (ou o atalho do Felipe), a tapera com vela acesa sem ninguém, o **BOSS Gadernal**, o Diazepan dormindo, a revelação dos irmãos, o sonho do Vander, os três irmãos cavando a botija... e o roubo. |
| **Ato III — A Noite da Festa** | Praça da festa da padroeira | Miguel, Hugo, João Vitor, Helano, João Pedro, Davi (e depois o time da alma) | Quermesse, bandeirinhas, a igrejinha iluminada e o palanque gigante. **O plano:** Miguel rouba a botija no camarim, Hugo sabota o gerador, Stelo espalha um áudio, Tribo combina o ritual, Daniel combina a fogueira, e os aliados que vocês conquistaram (Tia Zane, Gojoba, Paulo) entram na história. O **golpe final da web namorada** pode deixar o Helano preso na sacristia. Depois, o **BOSS FINAL Rafael CDs** e o final. |

### Boss: Paulo do Zé Baixinho
- **Soco:** o braço gigante dá socos. Antes do golpe aparece um **círculo vermelho** no chão. Saia dele!
- **Garrafas:** ele arremessa garrafas. A **sombra vermelha** mostra onde cada uma vai cair, e a cachaça derramada deixa quem pisar zonzo.
- **Giro:** na fase 3 ele gira o braço (com aviso antes).
- **Tropeço:** quando ele tropeça, fica vulnerável e leva 50% a mais de dano.
- **Desafio:** quando a vida de uma fase zera, o Paulo chama pro desafio, e você escolhe qual:
  - **Queda de braço:** aperte ATACAR sem parar.
  - **Pênaltis no escuro:** chute quando a mira estiver longe do goleiro. Faça 2 gols.
  - **Rodada de cachaça:** mantenha o ponto dentro do círculo enquanto a mesa gira. Mexe no Juízo.

  Ganhar os 3 desafios derrota o Paulo. Perder um faz ele recuperar metade da vida.
- **Roubar a garrafa:** com o **Miguel** invisível (F), encoste no Paulo e roube a garrafa. Sem ela, ele para de arremessar e fica mais lento.
- **Fazer as pazes:** se você foi educado com ele e roubou a garrafa, aparece no desafio a opção de **fazer as pazes**.
- **Ritual dos Três Amadeus** (poder máximo da Tribo): pula uma fase inteira do boss.
- **Quem decide a luta:** os companheiros e os cachorros ajudam, mas o dano de verdade é o de quem você controla.

### Boss: A Alma da Casa do Dudu
- **Comportamento:** é uma luta de terror e sobrevivência. A alma atravessa parede, apaga a lanterna, tenta apagar as fogueiras, grita e espalha o grupo no escuro, e avança com os **olhos vermelhos** (esse é o aviso).
- **O que não funciona:** espingarda e peixeira quase não fazem efeito.
- **O que funciona:**
  - **Vander:** segure a habilidade para **rezar**. A aura afasta e machuca a alma.
  - **Daniel:** o fogo machuca muito. O galão também reacende as fogueiras.
  - **Miguel:** a habilidade deixa a **carne assada de isca**. A alma fica presa nela, comendo, e leva mais dano.
  - **Davi:** "Tirar o excesso" tem um efeito especial contra alma.
  - **Fogueiras acesas:** a alma não entra perto delas. Reacenda com Espaço.
  - **Sinais do Tio Ota:** são 4 ferraduras nos cantos do curral. Acenda as lamparinas com Espaço; elas afastam e machucam a alma.
- **Golpe final:** quando ela fica fraca, só **O Aboio do Tio Ota** acaba com ela (poder de grupo com os três netos juntos). Se demorar, o aboio vem sozinho lá do curral.
- **Se todo mundo cair:** o jogo volta direto para a luta.

### Boss: Gojoba e a caixa de som
- **Não é luta de bater:** dá pra bater no Gojoba, mas só atordoa um instante. O objetivo é **desligar a caixa** (volume 3 → 0).
- **A caixa de som:** solta ondas de notas no ritmo da batida, sempre com um buraco por onde dá pra passar. Cada nota que acerta tira **Juízo**, não vida. As mesas e o balcão seguram as notas.
- **Juízo baixo:** os controles ficam doidos. Com o **Juízo zerado**, as escolhas dos diálogos saem no impulso, sozinhas.
- **O abraço do Gojoba:** prende o herói e, quando ele solta, tira meio coração.
- **Como baixar o volume:**
  - **Hugo:** corta os 3 cabos, com Espaço ou com a habilidade perto de um cabo.
  - **Miguel:** invisível, rouba o pen drive.
  - **Davi:** "tira o excesso" do volume.
  - **Daniel:** põe fogo na caixa e desliga tudo de uma vez. O bar do Stelo não gosta nada.
- **João Carlos:** a habilidade distrai o Gojoba, a não ser que ele tenha escolhido ficar do lado do primo.
- **Final da luta:** trate bem o Gojoba e ele vira aliado na festa.

### Boss: Emanuel, o "Gadernal"
- **As regras mudam a cada pouco**, e a faixa no topo avisa qual é a nova:
  - **Briga:** ele joga cadeira.
  - **Controles invertidos.**
  - **A sala gira.**
  - **Cafezinho:** aceitar cura o grupo, mas ele ataca pelas costas.
  - **Telhado:** ele sobe e joga telhas. A sombra mostra onde cada uma vai cair.
  - **Choro:** ele senta e chora, e leva dano dobrado.
- **O Diazepan:** quando a fúria cai pela metade, alguém tropeça nele, dormindo no meio da sala. Para acordar, fique perto dele 3 segundos sem levar dano. Acordado, ele acalma o Gadernal e acaba a luta.
- **Cavar a botija:** os três irmãos cavam juntos num minigame de ritmo. Aperte quando a pá chegar na linha amarela.
### Boss final: Rafael CDs (3 fases)
1. **Palanque**
   - O que ele faz: dispara balões de **PROMESSA**, como "açude de água mineral" e "metrô até Quixeramobim", em leque, chuva, espiral e anel. Bala e peixeira quase não pegam nele.
   - Como machucar:
     - **bata nas promessas** (ataque corpo a corpo) para rebatê-las nele;
     - **João Vitor** (habilidade) rebate todas as promessas perto;
     - **Helano** solta uma frase de profeta, que deixa o CDs mudo e tira muita vida;
     - **João Pedro** pergunta se ele é Lula ou Bolsonaro, porque ele é os dois. O CDs trava e leva dano dobrado.
   - O que o plano ajuda: com o gerador sabotado, o microfone falha. A caixa reserva do Gojoba deixa as promessas mais lentas. O áudio do Stelo tira vida do CDs antes da luta. A Tia Zane sobe no palanque e encerra a fase.
2. **Quermesse:** três ondas de capangas. Os aliados conquistados entram na briga:
   - o time do Roma;
   - a Tia Zane com a chinela;
   - a caixa do Gojoba, que ensurdece os capangas;
   - o ritual secreto da Tribo.
3. **A alma do coronel**
   - O que é: uma alma enorme que desce para proteger o neto.
   - Como vencer: os três irmãos, os três netos e a fé do Vander. Com os irmãos unidos, o Diazepan deixa a alma lenta. O golpe final é **O Aboio do Tio Ota**.
   - **A Grande Fogueira:** se a Desconfiança estiver baixa, o Daniel acende uma fogueira gigante no meio da praça e o poder de grupo fica **infinito** até o fim. Ela é obrigatória para o Final Heroico.

### Os finais
O primeiro da lista cuja condição bater é o que acontece:

| Final | Condição |
|---|---|
| Sobrenatural | Raiva da Caipora 90 ou mais |
| Traição | Desconfiança 90 ou mais (o traidor depende do segredo sorteado) |
| Absurdo | Acreditar em 2 ou mais fake news do Stelo |
| Trágico-cômico | Juízo 20 ou menos, ou o Daniel descontrolado (fogo demais no jogo) |
| Heroico | Botija recuperada + Raiva menor que 50 + Grande Fogueira |
| Família reunida | Irmãos unidos + Tia Zane respeitada |
| Meio-termo | Quando nenhum outro bate |

No fim vêm os **créditos**, com quantos finais você já descobriu. Os finais vistos ficam guardados mesmo começando um jogo novo.
### Poderes de grupo (G)
A barra roxa embaixo dos corações enche quando você causa dano, usa habilidade e revive alguém. Cheia, ela libera o poder do grupo que tem pelo menos 2 membros juntos; se houver mais de um disponível, um menu pergunta qual usar. O **★ poder máximo** exige o grupo completo e só pode ser usado 1 vez por fase. Com Desconfiança alta, o poder pode falhar.

| Grupo | Poder | ★ Poder máximo |
|---|---|---|
| Tribo dos Amadeus | Pacto Amadeu | Ritual dos Três Amadeus |
| Netos do Tio Ota | Herança do Tio Ota | O Aboio do Tio Ota (o gado atravessa a tela) |
| Família do Davi | Doideira de Sangue (dobra com lua cheia) | Caos e Calma (libera depois dos irmãos) |
| Turma do Alpendre | Conselho do Alpendre | Gambiarra Profética |

### Raiva da Caipora (na mata)
| Raiva | O que acontece |
|---|---|
| 30 ou mais | assobios |
| 50 ou mais | vulto na beira da luz, e a espingarda nega fogo |
| 70 ou mais | a lanterna apaga sozinha e aparecem arapucas |
| 90 ou mais | a trilha muda de lugar |

Deixar fumo no toco da Caipora baixa a raiva em 30.

### Caderno de Pistas
Fica na pausa e anota as pistas da botija. A cada partida o jogo **sorteia um segredo**, e só aparecem as pistas daquele segredo. Para ver qual foi sorteado, abra o debug.
### Habilidades (F)
| Personagem | Habilidade |
|---|---|
| Helano "Lapuca" | **Tiro do Profeta**: o tempo desacelera e sai um tiro que atravessa vários inimigos. |
| Zé Neto | **Consulta Grátis**: cura ou revive quem está perto, mas tem 35% de chance de deixar a pessoa zonza. Ele próprio desmaia quando leva dano. |
| João Vitor "Miserável" | **Lábia**: o jagunço muda de lado ou paga um "pedágio" de munição. |
| João Luiz Amadeu | **Lealdade de Ferro**: escudo de tampa de panela que bloqueia tiro e golpe de frente. |
| Luiz Fernando Amadeu | **Ritual Amadeu**: desenha um círculo no chão; quem está dentro fica rápido e forte. |
| João Pedro | **Escapamento das 2h**: sobe na moto, o ronco atordoa quem está perto e chama quem está longe. |
| Davi | **TIRAR O EXCESSO!**: sorteia um efeito absurdo. |
| Vander | **Visão**: fica invisível e revela passagens escondidas. |
| Miguel | **Roubo da Madrugada**: fica invisível; encostar num inimigo rouba munição dele. |
| Hugo | **Gambiarra**: monta uma torre que atira prego. |
| Daniel | **Fogo**: joga querosene e fósforo. |
| João Carlos | **Conversa de Família**: acalma parente bêbado (útil contra o Gojoba) ou provoca os inimigos para atacarem ele. |

---

## Modo debug
Aperte **F1** ou abra com `index.html?debug=1`. O painel permite:
- **pular para qualquer fase** (Prólogo, Ato I caçada, Ato I Paulo, fim), barra de poder a 100%, tirar uma fase do boss, Raiva a 75;
- invencível, mostrar hitboxes (e a visão dos inimigos), sem recarga, munição infinita, luz total;
- mexer nos medidores **Caipora / Desconfiança / Juízo** (com Juízo baixo os controles ficam doidos);
- ir para qualquer mapa;
- **trocar o grupo ativo** com qualquer combinação dos 12 personagens;
- forçar um efeito específico do "TIRAR O EXCESSO!";
- +20 munição, curar/reviver, matar inimigos, chamar a web namorada, pilha a 10%, apagar o save;
- ver FPS, o segredo sorteado da partida, as flags e as estatísticas.

---

## Como editar (o conteúdo fica separado do motor)

| Quero mudar... | Arquivo |
|---|---|
| Falas dos diálogos e escolhas | `js/story/data/dialogos_ato1.js` (e `dialogos_proto.js`, onde o formato está explicado) |
| Fases (grupo ativo, mapa, objetivo, cartela) | `js/story/data/fases.js` |
| Cutscenes (eventos de zona) | `js/story/data/eventos_ato1.js`, `eventos_interludio.js` |
| Diálogos do Interlúdio e do Ato II | `js/story/data/dialogos_interludio.js`, `dialogos_ato2.js` (eventos em `eventos_ato2.js`) |
| Ato III, o plano e os finais | `js/story/data/dialogos_ato3.js`, `eventos_ato3.js`, `finais.js` (condições dos finais e créditos) |
| Rafael CDs | `js/entities/bosses/cds.js` (a alma do coronel usa `alma.js`) |
| Gojoba, Gadernal e o minigame de cavar | `js/entities/bosses/gojoba.js`, `gadernal.js`, `js/ui/minigames_ato2.js` |
| Alma, Tia Zane e a pipoca | `js/entities/bosses/alma.js`, `js/entities/tiazane.js`, `js/ui/minigames_interludio.js` |
| Pistas do Caderno | `js/story/data/pistas.js` |
| Boss Paulo e os desafios | `js/entities/bosses/paulo.js`, `js/ui/minigames_boss.js` |
| Poderes de grupo | `js/entities/grouppowers.js` |
| Frases curtas em balão e mensagens de web namorada | `js/story/data/falas.js` |
| Aparência, velocidade, arma e habilidade de cada um | `js/entities/characters.js` |
| Mapas | `js/world/maps/*.js` |
| Efeitos do "TIRAR O EXCESSO!" | `js/entities/excesso.js` (basta acrescentar um item na lista) |
| Inimigo | `js/entities/enemies.js` (`BSI.data.inimigos`) |
| Tipos de tile e como são desenhados | `js/render/tiles.js` |
| Cores | `js/render/palette.js` |
| Flags e medidores | `js/story/state.js` (toda flag nova precisa entrar em `flagsConhecidas`) |

**Mapas.** Cada mapa é uma lista de linhas de texto, e cada caractere é um tile:

| Caractere | Tile |
|---|---|
| `.` | terra |
| `^` | trilha |
| `,` | mato seco (pega fogo) |
| `#` | taipa |
| `p` | porta |
| `=` | alpendre |
| `T` | juazeiro |
| `M` | mandacaru |
| `x` | xique-xique |
| `P` | pedra |
| `D` | pedra com desenho |
| `G` | garrancheira (pega fogo) |
| `C` | cerca (pega fogo) |
| `~` | água |
| `B` | cinza |
| `_` | passagem escondida (o Vander revela) |
| `v` | grota (abismo) |
| `L` | linha de cal |
| `b` | arquibancada |
| `f` | chão de dentro de casa |
| `i` | parede caiada |
| `k` | balcão |
| `m` | mesa |
| `e` | escada |
| `q` | palanque |
| `n` | barraca da quermesse |

Todas as linhas precisam ter o mesmo tamanho. Entidades (inimigos, itens, NPCs) e portas usam coordenadas em tiles.

**Depois de editar, rode o validador:**
```powershell
node tools/validate.js
```
Ele confere:
- os scripts do `index.html`;
- os mapas: tamanho das linhas, tiles, portas, chegadas livres e se tudo é alcançável;
- os diálogos: nós, quem fala, flags e medidores;
- os personagens e as falas.

Depois ele **roda o jogo sem tela** por uns 7 mil passos. Nessa simulação usa todas as habilidades, todos os "excessos", todos os diálogos, troca de mapa, "todo mundo caiu", salvar e continuar, e a tela em retrato. Se algo quebrar, ele aponta o arquivo e a linha.

> Precisa do [Node.js](https://nodejs.org) instalado, mas só para o validador. O jogo em si não precisa de nada.

---

## Testar no celular pela rede de casa
```powershell
node tools/servidor.js
```
O comando mostra um endereço `http://192.168.x.x:8080`. Abra esse endereço no navegador do celular conectado ao mesmo Wi-Fi.

## Publicar de graça no GitHub Pages (jogar pelo celular com os amigos)
1. Crie uma conta em https://github.com e um repositório novo e **público** (por exemplo, `botija`).
2. Na página do repositório, clique em **Add file → Upload files**. Arraste **todo o conteúdo** da pasta do jogo (`index.html`, `css`, `js`, `tools`, `README.md`) e clique em **Commit changes**.
3. Vá em **Settings → Pages**. Em **Source**, escolha **Deploy from a branch**, depois a branch **main** e a pasta **/(root)**, e clique em **Save**.
4. Em 1 ou 2 minutos aparece o link `https://SEU-USUARIO.github.io/botija/`. Mande esse link para a turma.
5. **Dica:** no celular, use **"Adicionar à tela inicial"** no menu do navegador para abrir o jogo como se fosse um app.

Para atualizar, é só subir os arquivos de novo. O save de cada pessoa fica no navegador dela.

---

## Estrutura
```
index.html            ordem dos scripts (sem módulos: funciona em file://)
css/style.css         layout, controles de toque e painel de debug
js/config/            NÚMEROS AJUSTÁVEIS: visual.js (luz, horários, minimapa, decoração),
                      balance.js (grupo, ordens, combate, dificuldade) e weapons.js
                      (as 27 armas, munições, afinidades, oficina). Mexa sem medo.
js/core/              namespace, sorteio com semente, save, áudio sintetizado, input,
                      tela/escala, câmera, colisão, laço com passo fixo, debug
js/render/            paleta, boneco novo (boneco.js), retratos (retratos.js), cache de
                      sprites com relevo 2x, tiles e cenário em alta (tiles_hd.js),
                      partículas, luz, efeitos e pós-processamento (efeitos.js), texto
js/world/             mapa de tiles, fogo que se espalha, mapas, decoração (placas e
                      objetos), vida (bichinhos e eventos), mundo (junta tudo)
js/entities/          personagens, herói, IA dos companheiros, habilidades,
                      "tirar o excesso", inimigos, bichos, objetos
js/story/             estado/flags/medidores, executor de diálogos, data/ (conteúdo)
js/ui/                HUD, minimapa/mapa completo, opções e controles, caixa de diálogo,
                      menus, minigames, controles de toque (desligados no PC)
js/main.js            telas, checkpoint, troca de mapa, laço principal
tools/validate.js     validador + teste de fumaça
tools/servidor.js     servidor local opcional
```

## Próximas etapas
1. ~~Protótipo jogável~~ ✅
2. ~~Prólogo, Ato 1, poderes de grupo e boss Paulo do Zé Baixinho~~ ✅
3. ~~Interlúdio e boss Alma da Casa do Dudu~~ ✅
4. ~~Ato II, bosses Gojoba e Gadernal~~ ✅
5. ~~Ato III, boss Rafael CDs e os finais~~ ✅
6. Atualização final pré-1.0:
   1. ~~Mapas, iluminação, minimapa e o grupo que se vira sozinho~~ ✅
   2. ~~Gráficos: boneco novo, cenário 32×32, retratos, luz, interface de cordel~~ ✅
   3. ~~Combate: 27 armas, equipamento, mira, esquiva, impacto, 8 inimigos, combos, dificuldade~~ ✅
   4. ~~Diálogos: falas de combate, conversas de estrada, reações, fofocas, chefes e cutscenes~~ ✅
   5. Polimento e versão 1.0
