/* =========================================================
   dialogos_interludio.js — CONTEÚDO: Interlúdio, A Noite da Pipoca.
   Formato: ver o topo de dialogos_proto.js e dialogos_ato1.js.
   O Tio Ota é HOMENAGEM: memória respeitada, histórias com orgulho.
   ========================================================= */
(function () {
  'use strict';
  var D = BSI.data.dialogos;

  D.interludio_abertura = {
    inicio: [
      ['narrador', 'Depois do campo do Roma, o grupo desceu pro açudinho, ao lado do curral do Tio Ota.'],
      ['narrador', 'O açude tá quase seco. O curral, de pé. Do jeitinho que ele deixou.'],
      ['joaopedro', 'O curral do vô. Ninguém mexe num mourão daqui. É lei.'],
      ['vander', 'Eu disse que ia aparecer.'],
      ['miguel', 'Vander! Tu brotou da onde?'],
      ['vander', 'De onde eu tava.'],
      ['daniel', 'Deixa que eu acendo a fogueira. *sorri*'],
      ['davi', 'E eu trouxe o milho de pipoca. Plano infalível: carne, pipoca e história.'],
      { fim: true }
    ]
  };

  D.fogueira_pipoca = {
    inicio: [
      ['lider', 'A fogueira tá no ponto. Hora de assar a carne da Tia Zane e estourar a pipoca.'],
      { acao: 'removerAlvo' },
      { acao: 'noitePipoca' },
      { fim: true }
    ]
  };
  D.pipoca_boa = {
    inicio: [
      ['davi:rindo', 'Pipoca perfeita! O bode ia se orgulhar.'],
      ['miguel:rindo', 'E a carne assou bonito. Cheirinho de domingo.'],
      ['joaopedro', 'Cheiro de carne da Tia Zane... cheiro de problema amanhã.'],
      ['miguel:assustado', 'Não fala o nome dela perto da comida!'],
      ['vander', '...ela tá dormindo. Por enquanto.'],
      ['daniel', 'A brasa tá linda. Hehe.'],
      ['helano', 'Comida dividida é a única que não acaba.'],
      ['narrador', 'Sobrou um pedaço. Um só. O último pedaço da carne de sol da Tia Zane.'],
      { escolha: [
        { txt: 'Dividir em seis pedacinhos', vai: 'dividir', medidores: { desconfianca: -5 } },
        { txt: 'Dar pro Miguel, que roubou', vai: 'miguel', medidores: { desconfianca: 3 } },
        { txt: 'Deixar pro bode', vai: 'bode', medidores: { juizo: -2 } }
      ] }
    ],
    dividir: [
      ['davi', 'Seis pedaços do tamanho de uma unha. Justo.'],
      ['joaopedro:rindo', 'Esse foi o melhor pedaço de unha que eu já comi.'],
      ['narrador', 'Todo mundo comeu e recuperou a vida. E ninguém brigou. Milagre da padroeira, adiantado.'],
      { fim: true }
    ],
    miguel: [
      ['miguel:rindo', 'Justiça! O artista é recompensado!'],
      ['joaopedro:desconfiado', 'O artista é o LADRÃO, Miguel.'],
      ['miguel', 'Todo artista rouba um pouco. Picasso falava isso. Eu acho.'],
      ['narrador', 'Todo mundo comeu e recuperou a vida. Mas uns olharam meio torto pro Miguel.'],
      { fim: true }
    ],
    bode: [
      ['davi', 'O bode merece. Ele aguenta a gente.'],
      ['narrador', 'O bode cheirou a carne, olhou pra todo mundo e foi embora. Ofendido.'],
      ['davi:assustado', 'Ele é vegetariano. Esqueci.'],
      ['narrador', 'Todo mundo comeu e recuperou a vida.'],
      { fim: true }
    ]
  };
  D.pipoca_queimada = {
    inicio: [
      ['davi:assustado', 'A pipoca... virou carvão.'],
      ['daniel:rindo', 'Eu achei bonito.'],
      ['miguel:bravo', 'Daniel, tu tava tomando conta!'],
      ['daniel', 'Tava. Tomando conta do fogo. Ele tava ótimo.'],
      ['vander', 'O cheiro vai longe. Vai acordar quem não deve.'],
      ['joaopedro:assustado', 'Tu fala isso com uma calma que me dá medo, Vander.'],
      ['narrador', 'Comeram assim mesmo. O juízo de ninguém melhorou.'],
      { fim: true }
    ]
  };

  D.historias_tio_ota = {
    inicio: [
      ['narrador', 'Em volta do fogo, os três netos começam a falar do avô.'],
      ['joaopedro', 'O vô tocava o gado só no aboio. Sem chicote, sem grito. O boi obedecia a voz dele.'],
      ['miguel', 'Ele dizia que boi entende mais de gente do que gente.'],
      ['daniel', 'Uma vez ele apagou um fogo de mato só com o chapéu. Eu tinha seis anos. Nunca esqueci.'],
      ['helano', '*digitando* "...tô aqui na serra, morena, ouvindo história de vaqueiro..."'],
      ['vander', 'Lapuca. O celular.'],
      ['helano', '...Guardei.'],
      ['davi', 'O gado tá ouvindo também. Aquela vaca ali disse que o Tio Ota era o melhor.'],
      { escolha: [
        { txt: 'Pedir pra contar do dia em que o Tio Ota enfrentou o coronel', vai: 'coronel', flags: { ouviu_coronel: true } },
        { txt: 'Pedir uma história engraçada do Tio Ota', vai: 'engracada' }
      ] }
    ],
    coronel: [
      ['joaopedro', 'Foi na seca braba. O coronel Firmino CDs fechou o açude com arame e botou jagunço de guarda.'],
      ['joaopedro', 'Ninguém tinha água. Gente, bicho, criança.'],
      ['miguel', 'Aí o vô, rapazinho ainda, chegou com o gado todo, olhou pro coronel e disse:'],
      ['daniel', '"Água de Deus não tem dono."'],
      ['joaopedro', 'E abriu a porteira. O gado passou, o povo passou, e jagunço nenhum teve coragem de atirar.'],
      ['helano', 'Coragem é quando o medo perde a discussão.'],
      ['joaopedro', 'O coronel jurou vingança. Mas nunca mais pisou no curral do vô.'],
      { fim: true }
    ],
    engracada: [
      ['miguel', 'Uma vez o vô me pegou pequeno desenhando na parede do curral.'],
      ['miguel', 'Em vez de brigar, ele botou uma moldura de madeira em volta e disse: "Agora é arte."'],
      ['daniel', 'A moldura tá lá até hoje.'],
      ['davi', 'E o desenho? Era o que eu tô pensando?'],
      ['miguel', 'Era cubista.'],
      { fim: true }
    ]
  };

  D.silencio = {
    inicio: [
      ['narrador', 'E aí... a pipoca parou de estourar.'],
      ['davi', 'Ninguém mexeu na panela?'],
      ['narrador', 'O vento parou. Os vagalumes sumiram. No curral, o gado começou a bater os cascos.'],
      ['vander', '...Ele chegou.'],
      ['joaopedro', 'Quem, Vander? QUEM?'],
      { fim: true }
    ]
  };
  D.figura_dudu = {
    inicio: [
      ['miguel', 'Ali. Perto da casa do Dudu. Um homem de chapéu... flutuando.'],
      ['daniel', '*pela primeira vez na vida, parou de sorrir*'],
      ['helano', 'Nem toda alma descansa.'],
      { seSegredo: 'vander', vai: 'vander' },
      { seSegredo: 'daniel', vai: 'daniel' },
      { vai: 'dicas' }
    ],
    vander: [
      ['vander', 'É o coronel Firmino. Eu conheço essa voz... de um sonho andando.'],
      { pista: 'vander_nome_coronel' },
      { vai: 'dicas' }
    ],
    daniel: [
      ['daniel', 'Fogo espanta ela. Eu sempre soube.'],
      ['miguel', 'Sempre soube COMO, Daniel?'],
      { pista: 'daniel_fogo_alma' },
      { vai: 'dicas' }
    ],
    dicas: [
      ['narrador', 'Espingarda e peixeira quase não pegam em alma. O que funciona:'],
      ['narrador', 'VANDER: segure a habilidade pra REZAR. DANIEL: fogo. MIGUEL: a habilidade deixa a carne assada de isca. DAVI: tirar o excesso.'],
      ['narrador', 'Fogueiras acesas seguram a alma (reacenda com Espaço). Acenda os 4 sinais de proteção nos cantos do curral do Tio Ota.'],
      ['narrador', 'Quando ela enfraquecer, só O ABOIO DO TIO OTA acaba com ela: poder de grupo com os três netos juntos.'],
      { fim: true }
    ]
  };

  D.alma_derrota = {
    inicio: [
      ['narrador', 'O gado passa em disparada. A alma do coronel se desfaz no escuro, como fumaça de fogueira velha.'],
      ['joaopedro', 'Aquele aboio... era o vô.'],
      ['miguel', 'Era ele.'],
      ['daniel', '*sorri. Mas é um sorriso diferente.*'],
      ['narrador', 'E o sol começou a nascer atrás da serra.'],
      { fim: true }
    ]
  };

  D.sinal_protecao = {
    inicio: [
      ['narrador', 'Uma ferradura velha pregada no mourão, com uma lamparina apagada embaixo.'],
      ['narrador', 'O Tio Ota pregou uma em cada canto do curral, "pra coisa ruim não entrar".'],
      { escolha: [
        { txt: 'Acender a lamparina', acao: 'ativarSinal', vai: 'aceso' },
        { txt: 'Deixar quieto', vai: 'quieto' }
      ] }
    ],
    aceso: [
      ['narrador', 'A lamparina acende. Por um instante, dá pra ouvir um aboio bem baixinho, lá longe.'],
      { fim: true }
    ],
    quieto: [{ fim: true }]
  };
  D.fogueira_apagada = {
    inicio: [
      ['lider', 'A fogueira tá apagando! Risca o fósforo, ligeiro!'],
      { acao: 'reacenderFogueira' },
      ['narrador', 'O fogo pegou de novo.'],
      { fim: true }
    ]
  };
  D.boi_curral = {
    inicio: [
      ['boi', 'Muuuu.'],
      ['lider', 'O gado do curral do Tio Ota. Ainda tem a marca dele no couro.'],
      { fim: true }
    ]
  };
  D.rede_tio_ota = {
    inicio: [
      ['narrador', 'A rede do Tio Ota, ainda armada entre dois juazeiros. Ninguém tem coragem de tirar.'],
      { seGrupo: 'joaopedro', vai: 'jp' },
      { fim: true }
    ],
    jp: [
      ['joaopedro', 'Ele dormia aqui vigiando o gado. Dizia que o curral era a casa dele; a casa era só onde a Tia Zane mandava.'],
      { fim: true }
    ]
  };

  // ---------------- AMANHECER ----------------
  D.amanhecer_dudu = {
    inicio: [
      ['narrador', 'Amanhece. Da casa perto do curral, sai um homem de chapéu de palha. É o Dudu.'],
      ['dudu', 'Eu vi tudo da janela. Vocês enfrentaram ele.'],
      ['dudu', 'Aquela alma é do coronel Firmino CDs. Morreu sem achar a botija e ficou rondando a minha casa.'],
      { pista: 'alma_coronel' },
      ['dudu', 'E tem mais. Semana passada o neto dele, o tal Rafael CDs, bateu aqui perguntando da tapera do pé da serra.'],
      ['dudu', 'Ofereceu dinheiro pra eu esquecer o caminho. Eu não esqueci. Nem vendi.'],
      { pista: 'cedezzi_tapera' },
      { seSegredo: 'joaovitor', vai: 'jv' },
      { seSegredo: 'felipe', vai: 'felipe' },
      { vai: 'fim' }
    ],
    jv: [
      ['dudu', 'Ele veio com um rapaz de boné vermelho que falava pelos cotovelos e cobrava por tudo.'],
      ['miguel', '...Boné vermelho, é?'],
      { pista: 'jv_bone_vermelho' },
      { vai: 'fim' }
    ],
    felipe: [
      ['dudu', 'Quem ensinou o caminho daqui pra ele foi um rapaz que chamava todo mundo de "parceiro".'],
      { pista: 'felipe_caminho' },
      { vai: 'fim' }
    ],
    fim: [
      ['helano', 'O neto procura o que o avô perdeu.'],
      ['davi', 'Então a botija é real! Eu falei! O bode falou!'],
      { fim: true }
    ]
  };
  D.dudu_depois = {
    inicio: [
      ['dudu:rindo', 'Dormi pela primeira vez em anos sem ouvir aquele gemido. Obrigado, meninos.'],
      ['dudu', 'Até o café ficou mais gostoso. Ou eu que acordei de bom humor.'],
      ['miguel', 'Seu Dudu, posso pintar sua casa? Agora que ela não é mais assombrada?'],
      ['dudu:desconfiado', 'Pintar de quê?'],
      ['miguel', 'De cubismo.'],
      ['dudu', '...deixa ela assombrada mesmo.'],
      { fim: true }
    ]
  };

  D.tia_zane_chega = {
    inicio: [
      ['narrador', 'Lá na estrada, uma silhueta vem marchando. De chinela na mão.'],
      ['tiazane', 'QUEM FOI QUE ROUBOU A MINHA CARNE DE SOL ESSA MADRUGADA?!'],
      { se: 'zane_sentiu', vai: 'sentiu' },
      { vai: 'escolha' }
    ],
    sentiu: [
      ['tiazane', 'E não adianta mentir: eu SENTI que os três netos tavam juntos essa noite. Senti no osso.'],
      { vai: 'escolha' }
    ],
    escolha: [
      ['miguel', '...'],
      { escolha: [
        { txt: 'Miguel foge!', vai: 'fuga', flags: { escolheu_fugir: true } },
        { txt: 'Miguel se explica', vai: 'explica' }
      ] }
    ],
    fuga: [
      ['miguel', 'PERNA, PRA QUE TE QUERO!'],
      ['narrador', 'Fuja da Tia Zane! Corra (Shift ou joystick até o fim) e use a habilidade pra sumir da vista dela.'],
      { fim: true }
    ],
    explica: [
      { escolha: [
        { txt: 'Confessar e pedir desculpa', vai: 'conta', flags: { miguel_confessou: true, tia_zane_respeitada: true } },
        { txt: 'Botar a culpa no Davi', vai: 'culpa', flags: { culpou_davi: true }, medidores: { desconfianca: 10 } }
      ] }
    ],
    conta: [
      ['miguel', 'Fui eu, vó. Desculpa. A carne tava tão bonita...'],
      { vai: 'segredo_zane' }
    ],
    segredo_zane: [
      ['tiazane', '...Tu é igualzinho teu avô. O Ota também roubava a minha carne de madrugada pra assar com os amigos.'],
      ['tiazane', 'E ele dizia uma coisa. Que aquela botija não era de ninguém. Era de Santa Isabel.'],
      { pista: 'botija_do_povo' },
      ['tiazane', 'Se forem atrás dela, vão por Santa Isabel. Não por dinheiro. Ouviram?'],
      ['joaopedro', 'Sim, senhora.'],
      { fim: true }
    ],
    culpa: [
      ['davi', 'EU?!'],
      ['tiazane', 'O Davi nem come carne de sol, Miguel! Ele só come o que o bode aprova!'],
      ['tiazane', 'Vocês vão se ver comigo. Todos.'],
      { fim: true }
    ]
  };
  D.zane_fugiu = {
    inicio: [
      ['tiazane', '*ofegante* Esse menino corre igual o avô...'],
      ['tiazane', 'Mas eu sei que foi tu, Miguel. Avó sabe.'],
      { fim: true }
    ]
  };
  D.zane_pegou = {
    inicio: [
      ['tiazane', 'PEGUEI! Pode parar de correr, que avó tem chinela teleguiada!'],
      { fim: true }
    ]
  };
  D.zane_conversa = {
    inicio: [
      ['tiazane', 'Agora fala a verdade, Miguel.'],
      { escolha: [
        { txt: 'Confessar e pedir desculpa', vai: 'confessa', flags: { miguel_confessou: true, tia_zane_respeitada: true } },
        { txt: 'Continuar negando', vai: 'nega' }
      ] }
    ],
    confessa: [
      ['miguel', 'Fui eu, vó. Desculpa.'],
      ['tiazane', '...Tu é igualzinho teu avô. O Ota também roubava a minha carne de madrugada.'],
      ['tiazane', 'Ele dizia que aquela botija não era de ninguém. Era de Santa Isabel. Lembrem disso.'],
      { pista: 'botija_do_povo' },
      { fim: true }
    ],
    nega: [
      ['miguel', 'Não fui eu não, vó. Foi... o vento.'],
      ['tiazane', 'Um dia tu me conta. E nesse dia eu conto uma coisa pra tu também.'],
      { fim: true }
    ]
  };

})();
