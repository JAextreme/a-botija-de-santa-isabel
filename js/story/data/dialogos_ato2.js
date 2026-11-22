/* =========================================================
   dialogos_ato2.js — CONTEÚDO: Ato II, A Tapera.
   Formato: ver o topo de dialogos_proto.js e dialogos_ato1.js.
   Todos os políticos são fictícios. As músicas do Gojoba são
   inventadas (e ruins de propósito).
   ========================================================= */
(function () {
  'use strict';
  var D = BSI.data.dialogos;

  // =========================================================
  //  SANTA ISABEL
  // =========================================================
  D.ato2_abertura = {
    inicio: [
      ['narrador', 'Na tarde seguinte, Santa Isabel ferve: bandeirinhas na praça, a festa da padroeira chegando, e todo mundo falando de botija.'],
      ['hugo', 'Consertei a Bros. Corrente nova, vela nova e um arame onde antes tinha um parafuso.'],
      ['zeneto', 'Davi, teu olho ainda tá girando do boldo?'],
      ['davi', 'Só o esquerdo. O direito já parou.'],
      ['joaocarlos', 'Gente, um aviso: o Gojoba ganhou uma caixa de som. E disse que vem pro bar hoje.'],
      ['joaopedro', 'Caixa de som? Mais alta que meu escapamento?'],
      ['joaocarlos', 'Quinhentos watts, primo. Quinhentos.'],
      ['miguel', 'O Stelo sabe de tudo que acontece em Santa Isabel. Até do que não acontece.'],
      { fim: true }
    ]
  };

  D.stelo = {
    inicio: [
      { se: 'falou_stelo', vai: 'teorias' },
      ['stelo', 'CHEGARAM! Vocês viram no grupo "Família Santa Isabel Unida 2"? Botija na serra, macho! Tá todo mundo comentando!'],
      ['stelo', 'Eu tenho três teorias. Todas verdadeiras. Eu recebi de fonte segura: um áudio de um primo de um amigo.'],
      { flags: { falou_stelo: true } },
      { vai: 'teorias' }
    ],
    teorias: [
      { fofoca: 'stelo' },
      ['stelo', 'Qual vocês querem ouvir?'],
      { escolha: [
        { txt: 'O ouro da botija é de ET', vai: 'et' },
        { txt: 'O CDs é reptiliano', vai: 'reptil' },
        { txt: 'A Caipora trabalha pra CIA', vai: 'cia' },
        { txt: 'Tá bom de teoria, Stelo', vai: 'sair' }
      ] }
    ],
    et: [
      ['stelo', 'As luzes no céu, iguais às de Quixadá! O ouro da botija veio de um disco voador! Por isso brilha!'],
      ['davi', 'O bode também acha.'],
      { escolha: [
        { txt: 'Acreditar no Stelo', acao: 'steloET', vai: 'fim' },
        { txt: 'Desconfiar', vai: 'desconfia' }
      ] }
    ],
    reptil: [
      ['stelo', 'O Rafael CDs não pisca! Já reparou? Quem não pisca é reptiliano. E ele vai fazer um palanque gigante na festa pra mostrar "um tesouro histórico"!'],
      ['miguel', 'A parte do palanque é... estranhamente específica.'],
      { escolha: [
        { txt: 'Acreditar no Stelo', acao: 'steloReptil', vai: 'fim' },
        { txt: 'Desconfiar', vai: 'desconfia' }
      ] }
    ],
    cia: [
      ['stelo', 'A Caipora é agente secreta da CIA. O assobio é código morse. Cada peba que vocês caçam, ela manda relatório pros americanos.'],
      ['zeneto', 'Isso explica muita coisa. Não explica, mas explica.'],
      { escolha: [
        { txt: 'Acreditar no Stelo', acao: 'steloCIA', vai: 'fim' },
        { txt: 'Desconfiar', vai: 'desconfia' }
      ] }
    ],
    desconfia: [
      ['stelo', 'Desconfia, desconfia. Depois não diz que o Stelo não avisou.'],
      { vai: 'fim' }
    ],
    sair: [
      ['stelo', 'Quando quiserem mais verdade, é só voltar. Tenho um áudio de 40 minutos.'],
      { vai: 'fim' }
    ],
    fim: [
      { acao: 'gojobaChega' },
      { fim: true }
    ]
  };

  D.gojoba_chega = {
    inicio: [
      ['narrador', 'A porta do bar se abre com um chute. Um homem de chapéu de palha entra abraçado numa caixa de som do tamanho de uma geladeira.'],
      ['gojoba', 'PRIMOOOO! Olha o presente que eu ganhei! QUINHENTOS WATTS!'],
      ['joaocarlos', 'Ai, meu Deus.'],
      ['gojoba', 'Vou tocar a música nova: "O Refrão de 7 Horas"! Ninguém sai daqui até acabar!'],
      ['stelo', 'Gojoba, o bar fecha às dez.'],
      ['gojoba', 'A MÚSICA FECHA ÀS UMA DA MANHÃ! DE AMANHÃ!'],
      ['joaocarlos', '...E agora? Ele é da minha família. Mas isso aí é crime.'],
      { escolha: [
        { txt: 'João Carlos fica do lado do primo', vai: 'familia', flags: { jc_familia: true }, medidores: { desconfianca: 5 } },
        { txt: 'João Carlos fica do lado dos amigos', vai: 'amigos', flags: { jc_amigos: true } }
      ] }
    ],
    familia: [
      ['joaocarlos', 'Ele é meu primo. Não vou atrapalhar a festa dele. Se virem.'],
      { vai: 'dicas' }
    ],
    amigos: [
      ['joaocarlos', 'Primo, eu te amo. Mas essa música é crime. Eu distraio ele, vocês desligam essa coisa.'],
      { vai: 'dicas' }
    ],
    dicas: [
      ['narrador', 'Cada nota da caixa que acerta alguém tira JUÍZO (com o juízo zerado, as escolhas saem no impulso). As mesas e o balcão seguram as ondas.'],
      ['narrador', 'Pra desligar a caixa: o HUGO corta os 3 cabos (Espaço perto do cabo). O JOÃO CARLOS (habilidade) distrai o Gojoba. Miguel, Davi e Daniel também têm seus jeitos...'],
      { fim: true }
    ]
  };
  D.cabo_som = {
    inicio: [
      ['narrador', 'Um cabo grosso ligando a caixa de som numa gambiarra de tomada.'],
      { seGrupo: 'hugo', vai: 'tem_hugo' },
      ['lider', 'Isso aí é coisa do Hugo. Eu levo um choque só de olhar.'],
      { fim: true }
    ],
    tem_hugo: [
      { acao: 'sabotarCabo' },
      { fim: true }
    ]
  };
  D.gojoba_fim = {
    inicio: [
      ['narrador', 'Silêncio. Um silêncio lindo. O bar inteiro respira.'],
      ['gojoba', '*chorando* Minha caixinha... era a única coisa que me escutava...'],
      { se: 'queimou_caixa', vai: 'queimou' },
      { vai: 'escolha' }
    ],
    queimou: [
      ['stelo', 'E O MEU BAR?! Quem paga essa parede preta?!'],
      ['daniel', '*sorri*'],
      { vai: 'escolha' }
    ],
    escolha: [
      { escolha: [
        { txt: 'Abraçar o Gojoba e levar ele pra casa', vai: 'carinho', flags: { gojoba_bem_tratado: true } },
        { txt: 'Deixar ele chorando no bar', vai: 'largar' }
      ] }
    ],
    carinho: [
      ['joaocarlos', 'Vem, primo. Bora pra casa. Amanhã tem festa e tu precisa estar bonito.'],
      ['gojoba', 'Vocês são minha família... *soluço* Quando precisarem, me chama. Eu e a caixa reserva.'],
      ['hugo', 'CAIXA RESERVA?'],
      { fim: true }
    ],
    largar: [
      ['gojoba', '...Ninguém fica pra última música. Ninguém.'],
      { fim: true }
    ]
  };
  D.gojoba_depois = {
    inicio: [
      { se: 'gojoba_bem_tratado', vai: 'amigo' },
      ['gojoba:bravo', '*fungando* Pode ir. Pode. Eu fico aqui com o silêncio.'],
      ['gojoba', 'O silêncio é tão... silencioso. Como vocês aguentam?'],
      { escolha: [
        { txt: 'Assobiar uma musiquinha pra ele', vai: 'assobio', medidores: { desconfianca: -3 } },
        { txt: '"Aproveita pra dormir, Gojoba."', vai: 'fim' }
      ] }
    ],
    assobio: [
      ['gojoba:rindo', '*para de chorar* ...isso é forró? Vocês assobiam forró?'],
      ['gojoba', 'Primo... vocês são boa gente. Vou comprar uma caixa menor. Só de 300 watts.'],
      { fim: true }
    ],
    amigo: [
      ['gojoba:rindo', 'Primo! Amanhã na festa, se precisar de barulho, é só me chamar. BARULHO É COMIGO!'],
      ['joaocarlos', 'Gojoba, tu tem quantas caixas reserva?'],
      ['gojoba', 'Contando com a do banheiro? Sete.'],
      { fim: true }
    ],
    fim: [{ fim: true }]
  };

  D.banheiro_miguel = {
    inicio: [
      ['narrador', 'O banheiro do bar do Stelo. As paredes, cobertas de desenhos do Miguel, de anos e anos de visita.'],
      ['miguel', 'Peraí. PERAÍ. Olhando todos juntos...'],
      ['miguel', 'Os desenhos formam o MAPA DA SERRA! E o cubista, o meu primeiro, tá bem em cima da tapera do pé da serra!'],
      ['hugo', 'Tu desenhou um mapa do tesouro sem saber?'],
      ['miguel', 'Arte é isso. A gente desenha o que ainda não sabe.'],
      { flags: { mapa_tapera: true }, pista: 'mapa_banheiro' },
      { fim: true }
    ]
  };
  D.banheiro_outro = {
    inicio: [
      ['lider', 'Paredes do banheiro cheias de desenhos do Miguel. "Arte", segundo ele. O Miguel devia dar uma olhada nisso aqui.'],
      { fim: true }
    ]
  };
  D.sem_mapa_tapera = {
    inicio: [
      ['davi', 'Calma! Ninguém sabe onde fica a tapera de verdade. O bode sabe, mas não quer dizer.'],
      ['narrador', '(Vá ao bar do Stelo. O Miguel precisa ver uma coisa no banheiro.)'],
      { fim: true }
    ]
  };

  D.felipe = {
    inicio: [
      ['felipe', 'Parceiro! E aí, parceiro! Tô sabendo que vocês tão indo pra tapera, parceiro.'],
      { fofoca: 'felipe' },
      ['felipe', 'Tenho duas ofertas, parceiro: essa moto baratinha, parceiro... e um atalho pra tapera que só eu conheço, parceiro.'],
      { escolha: [
        { txt: 'Confiar no atalho do Felipe', vai: 'atalho', flags: { confiou_felipe: true } },
        { txt: 'Comprar a moto baratinha (10 cartuchos)', vai: 'moto', acao: 'comprarMoto' },
        { txt: 'Não confiar', vai: 'nao', flags: { recusou_felipe: true } }
      ] }
    ],
    atalho: [
      ['felipe', 'Isso, parceiro! Tem uma cerca no meio da trilha, parceiro. Já abri pra vocês. Confia, parceiro.'],
      ['hugo', 'Ele falou "parceiro" onze vezes. Contei.'],
      { fim: true }
    ],
    moto: [
      ['felipe', 'Negócio fechado, parceiro! A moto é tua. O motor... o motor é outro negócio, parceiro.'],
      ['hugo', 'Não tem motor. Nem roda de trás. Isso é um banco com guidão.'],
      { fim: true }
    ],
    nao: [
      ['felipe', 'Parceiro desconfiado é parceiro vivo, parceiro. Respeito.'],
      { fim: true }
    ]
  };
  D.moto_felipe = {
    inicio: [
      ['lider', 'A moto "baratinha" do Felipe. Falta o motor, a roda de trás e a vergonha.'],
      { fim: true }
    ]
  };

  D.bodega = {
    inicio: [
      ['socorro', 'Boa tarde, meus filhos. Querem alguma coisa? Fica no caderno, como sempre.'],
      { fofoca: 'socorro' },
      { escolha: [
        { txt: 'Ver a prateleira (munição e arremesso)', acao: 'abrirBodega', vai: 'nada2' },
        { txt: 'Uma pilha no fiado', acao: 'fiadoPilha', vai: 'fim' },
        { txt: '2 rapaduras no fiado', acao: 'fiadoRapadura', vai: 'fim' },
        { txt: 'Só olhando, Dona Socorro', vai: 'nada' }
      ] }
    ],
    fim: [
      ['socorro', 'Anotado. O caderno de vocês já tá na segunda página, viu?'],
      { fim: true }
    ],
    nada: [
      ['socorro', 'Olhar é de graça. Por enquanto.'],
      { fim: true }
    ],
    nada2: [{ fim: true }]
  };
  D.rezadeira = {
    inicio: [
      ['benedita', 'Chega aqui, meu filho. Tu tá com cara de quem viu alma.'],
      { fofoca: 'benedita' },
      ['benedita', '*reza baixinho com um raminho de arruda* ...sai quebranto, sai mau-olhado, sai juízo torto...'],
      { acao: 'rezaBenedita' },
      ['benedita', 'Pronto. E respeita a mata, que a mata respeita tu.'],
      { fim: true }
    ]
  };
  D.padre = {
    inicio: [
      { fofoca: 'padre' },
      ['padre', 'A festa da padroeira é amanhã, meus filhos. Quermesse, leilão de galinha, banda...'],
      ['padre', 'E um tal de Rafael CDs doou um palanque gigante. Disse que vai "revelar um tesouro histórico" pra cidade.'],
      ['padre', 'Essas luzes no céu de noite... Deus é grande. Ou é coisa de Quixadá. Ou as duas.'],
      { fim: true }
    ]
  };
  D.placa_festa = {
    inicio: [
      ['narrador', 'FESTA DA PADROEIRA SANTA ISABEL — Quermesse, leilão, banda e "UMA GRANDE REVELAÇÃO" (oferecimento: Rafael CDs).'],
      { fim: true }
    ]
  };
  D.bode_cidade_davi = {
    inicio: [
      ['davi', 'Bode! Tu veio pra cidade?'],
      ['bode', 'Méééé.'],
      ['davi', '(traduzindo) Ele disse que o Stelo acerta uma em cada três. O difícil é saber qual.'],
      { fim: true }
    ]
  };
  D.circulo_et = {
    inicio: [
      ['narrador', 'No meio da praça, um círculo de cinza no chão. O Stelo jurou que era pouso de disco voador.'],
      ['zeneto', 'Isso aqui é onde o Daniel fez fogueira semana passada.'],
      ['davi', 'A gente atravessou a cidade pra ver cinza.'],
      { medidores: { juizo: -5 } },
      { fim: true }
    ]
  };

  // =========================================================
  //  A TAPERA
  // =========================================================
  D.ato2_tapera_abertura = {
    inicio: [
      ['narrador', 'Com o mapa do banheiro na cabeça do Miguel (que ficou explicando o mapa pro Stelo), o grupo pega a estrada pro pé da serra.'],
      ['vander', 'Eu disse que ia encontrar vocês no caminho.'],
      ['daniel', 'Trouxe querosene. Muito querosene. *sorri*'],
      ['helano', 'Toda estrada leva pra casa. Algumas levam pra casa dos outros.'],
      { se: 'confiou_felipe', vai: 'atalho' },
      { fim: true }
    ],
    atalho: [
      ['hugo', 'A cerca do atalho do Felipe tá aberta mesmo. Que estranho ele cumprir o que promete.'],
      { fim: true }
    ]
  };
  D.placa_atalho = {
    inicio: [
      ['narrador', 'Uma placa pintada à mão: "ATALHO PRA TAPERA — PARCEIRO".'],
      { fim: true }
    ]
  };
  D.bode_tapera_davi = {
    inicio: [
      ['davi', 'Bode?! Tu chegou antes da gente?'],
      ['bode', 'Mé. Mé-mé.'],
      ['davi', '(traduzindo) Ele disse que tem gente morando na tapera. E que essa gente tem a minha cara.'],
      { fim: true }
    ]
  };
  D.vela_tapera = {
    inicio: [
      ['narrador', 'Uma vela acesa num pires. A tapera tá abandonada há décadas. Ninguém acendeu essa vela.'],
      ['vander', 'Alguém acendeu.'],
      { fim: true }
    ]
  };
  D.desenhos_tapera = {
    inicio: [
      ['narrador', 'Na parede, desenhos iguais aos do Miguel. E, embaixo, uma frase escrita a carvão: "J. B. — OS TRÊS JUNTOS".'],
      { pista: 'tres_irmaos_parede' },
      { fim: true }
    ]
  };

  D.gadernal_chega = {
    inicio: [
      ['narrador', 'Um grito sai da sala grande da tapera.'],
      ['gadernal', 'QUEM TÁ AÍ?! A TAPERA É DO VÔ JOAQUIM! O TESOURO É MEU DE GUARDAR!'],
      ['davi', 'Oxe. Esse cabra parece comigo.'],
      ['joaopedro', 'Parece com nós dois.'],
      ['gadernal', 'Eu me chamo Emanuel, mas me chamam de GADERNAL! E aqui as regras mudam quando EU quero!'],
      ['narrador', 'As regras da luta vão mudar a cada pouco. Fique de olho na faixa do topo.'],
      { fim: true }
    ]
  };
  D.gadernal_cafe = {
    inicio: [
      ['gadernal', '...Para tudo. Aceita um cafezinho? Passei agora. Coado no pano.'],
      { escolha: [
        { txt: 'Aceitar o café', vai: 'sim', flags: { aceitou_cafe: true } },
        { txt: 'Recusar o café', vai: 'nao' }
      ] }
    ],
    sim: [
      ['narrador', 'O café é bom. Muito bom. Todo mundo se sente melhor...'],
      { fim: true }
    ],
    nao: [
      ['gadernal', 'Ninguém nunca aceita o meu café!'],
      { fim: true }
    ]
  };
  D.diazepan_tropeco = {
    inicio: [
      ['narrador', 'No meio da briga, alguém tropeça num monte de sacos... e o monte de sacos RONCA.'],
      ['helano', 'Tem gente dormindo aí.'],
      ['narrador', 'É um rapaz dormindo profundamente. Há uns três dias, pelo jeito.'],
      ['gadernal', 'NÃO ACORDA ELE! ...Ninguém acorda ele. Quando ele acorda, eu fico... calmo.'],
      { fim: true }
    ]
  };
  D.diazepan_acorda = {
    inicio: [
      ['diazepan', '...Hm? ...Que zoada é essa?'],
      ['diazepan', 'Emanuel. Para de gritar. Senta.'],
      ['gadernal', '...Tá bom, Vinícius.'],
      ['narrador', 'E o Gadernal senta. Calmo como um açude em dia sem vento.'],
      ['davi', 'Vocês... se conhecem?'],
      ['diazepan', 'Ele é meu irmão. E tu... tu tem a cara do nosso pai.'],
      ['gadernal', 'A mesma testa. O mesmo olho de quem tem um plano infalível.'],
      ['narrador', 'Drama de novela total: três irmãos, separados quando eram crianças, bisnetos do velho Joaquim Bento. Davi, Emanuel e Vinícius.'],
      ['joaopedro:assustado', 'Então eu sou primo de TODO MUNDO aqui?!'],
      ['diazepan', 'A família não regula bem, mas é grande.'],
      ['davi:assustado', '...'],
      ['hugo', 'O Davi ficou calado. Isso nunca aconteceu.'],
      ['daniel', 'Hehe. Que bonito.'],
      ['vander', 'Eu sonhei com três sombras na mesma tapera. Achei que era o café.'],
      ['gadernal:bravo', 'Regra nova: ninguém chora!'],
      ['gadernal', '*chora*'],
      ['helano', 'O que o tempo separa, a terra junta. Mesmo que a terra seja uma tapera caindo aos pedaços.'],
      { pista: 'irmaos' },
      { escolha: [
        { txt: 'Davi abraça os irmãos', vai: 'abraco', flags: { irmaos_unidos: true } },
        { txt: 'Davi faz um teste: "Qual é o nome do bode?"', vai: 'teste', flags: { irmaos_unidos: true } },
        { txt: 'Davi desconfia: "Vocês querem é a botija!"', vai: 'desconfia', flags: { desconfiou_irmaos: true }, medidores: { desconfianca: 10 } }
      ] }
    ],
    teste: [
      ['davi:desconfiado', 'Se vocês são meus irmãos mesmo... qual é o nome do bode?'],
      ['gadernal', 'O bode não tem nome. A gente chama de "o bode".'],
      ['diazepan', '*sem abrir o olho* ...o bode.'],
      ['davi:rindo', 'CERTÍSSIMO! SÓ UM IRMÃO SABERIA!'],
      ['joaopedro', 'Davi, todo mundo chama ele de "o bode".'],
      ['davi', 'Silêncio, primo. Momento de família.'],
      { vai: 'abraco' }
    ],
    abraco: [
      ['davi', 'MEUS IRMÃOS! *chora* O bode tinha razão!'],
      ['gadernal', '*chora mais alto*'],
      ['diazepan', '*dorme no abraço*'],
      { fim: true }
    ],
    desconfia: [
      ['davi', 'Irmão que aparece na hora da botija... sei não.'],
      ['gadernal', 'EU GUARDEI ESSA TAPERA A VIDA INTEIRA!'],
      ['diazepan', 'Deixa, Emanuel. Ele vai entender. Ou não. Tanto faz. *boceja*'],
      { fim: true }
    ]
  };
  D.vander_sonho2 = {
    inicio: [
      ['narrador', 'O Vander dorme em pé por um instante. Quando acorda, está pálido de novo.'],
      ['vander', 'Sonhei. O "vai só" nunca foi do Joaquim Bento. Era a alma do coronel se metendo no sonho, pra ninguém achar a botija.'],
      ['vander', 'A condição verdadeira é outra: a botija só sai da terra pelas mãos de três irmãos do mesmo sangue. Juntos.'],
      ['helano', 'O que o ódio separou, a terra junta.'],
      { pista: 'condicao_tres' },
      { fim: true }
    ]
  };
  D.cavar_botija = {
    inicio: [
      ['narrador', 'O porão da tapera. Uma marca no chão de terra batida, do tamanho de um pote.'],
      ['davi', 'Irmãos. Pá na mão. No mesmo tempo.'],
      { acao: 'cavar' },
      { fim: true }
    ]
  };
  D.botija_achada = {
    inicio: [
      ['narrador', 'A pá bate em barro duro. Uma botija! E dentro dela: moedas de ouro... e um papel antigo, enrolado com fita.'],
      ['diazepan', '"Escritura das terras de Santa Isabel". Assinado... Joaquim Bento.'],
      ['davi', 'É do povo. A terra é do povo.'],
      { pista: 'escritura' },
      ['narrador', 'E nesse exato instante, as luzes no céu acendem todas de uma vez. Lá fora, motores. Vozes. Lanternas.'],
      ['narrador', 'CAPANGA: "Ninguém se mexe! Essa botija é do DOUTOR CDs!"'],
      ['hugo', 'Defende a tapera! Ninguém entra!'],
      { fim: true }
    ]
  };
  D.botija_roubada = {
    inicio: [
      ['narrador', 'O último capanga cai... e um ronco de motor some pela estrada.'],
      ['diazepan', '*voltando do porão* Gente... enquanto vocês brigavam lá fora...'],
      ['diazepan', 'Entrou um pela janela de trás. Levou a botija. E a escritura.'],
      ['gadernal', 'O TESOURO DO VÔ!'],
      { fim: true }
    ]
  };
  D.quem_trouxe = {
    inicio: [
      ['helano', 'Ninguém acha uma tapera escondida há cem anos por acaso. Alguém trouxe eles.'],
      { se: 'confiou_felipe', vai: 'felipe_atalho' },
      { seSegredo: 'joaovitor', vai: 'jv' },
      { seSegredo: 'vander', vai: 'vander' },
      { seSegredo: 'daniel', vai: 'daniel' },
      { seSegredo: 'felipe', vai: 'felipe' },
      { vai: 'fim' }
    ],
    felipe_atalho: [
      ['hugo', 'Eles vieram pelo atalho do Felipe. O mesmo atalho que ele "abriu" pra gente.'],
      { pista: 'felipe_atalho' },
      { vai: 'fim' }
    ],
    jv: [
      ['narrador', 'No chão, um bilhete que caiu do bolso de um capanga: "Info boa, doutor. Tapera, hoje à noite. Ass.: M."'],
      { pista: 'jv_bilhete_capanga' },
      { vai: 'fim' }
    ],
    vander: [
      ['narrador', 'Um capanga caído resmunga: "A gente só seguiu um rastro de chinelo que andava sozinho de madrugada..."'],
      ['vander', '...'],
      { pista: 'vander_rastro_capangas' },
      { vai: 'fim' }
    ],
    daniel: [
      ['narrador', 'Um capanga caído resmunga: "Foi fácil achar. Era só seguir a fumaça das fogueiras."'],
      ['daniel', '*não sorri*'],
      { pista: 'daniel_fumaca' },
      { vai: 'fim' }
    ],
    felipe: [
      ['narrador', 'Antes de sumir, um capanga gritou da estrada: "O PARCEIRO MANDOU AVISAR QUE TÁ TUDO CERTO!"'],
      { pista: 'felipe_avisou' },
      { vai: 'fim' }
    ],
    fim: [
      { fim: true }
    ]
  };
  D.gadernal_npc = {
    inicio: [
      ['gadernal', 'Desculpa a cadeira, irmão. E a telha. E o café. Principalmente o café.'],
      { fim: true }
    ]
  };
  D.diazepan_npc = {
    inicio: [
      ['diazepan', '...Zzz... Hm? Tô acordado. Tô. Pode falar. ...Zzz...'],
      { fim: true }
    ]
  };
})();
