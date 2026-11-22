/* =========================================================
   dialogos_ato1.js — CONTEÚDO: Prólogo e Ato 1.
   Formato: ver o topo de dialogos_proto.js. Extras usados aqui:
     { seGrupo: 'davi', vai: 'no' }     pula se o personagem está no grupo
     { seSegredo: 'vander', vai: 'no' } pula se esse é o segredo sorteado
     { pista: 'id' }                     anota no Caderno de Pistas
     opções de escolha com  se / seNao (flag ou lista), grupo, acao
   ========================================================= */
(function () {
  'use strict';
  var D = BSI.data.dialogos;

  // =========================================================
  //  PRÓLOGO — DUAS DA MANHÃ
  // =========================================================
  D.prologo_abertura = {
    inicio: [
      ['narrador', 'Santa Isabel, Sertão Central do Ceará. Sexta-feira, 2 da manhã. Lua cheia.'],
      ['narrador', 'No terreiro, um barulho que acorda meia cidade: VRUM. VRUM. PÁ-PÁ-PÁ.'],
      ['joaopedro', 'Escuta esse ronco, macho! Escapamento novo! Às 2 da manhã é que ele canta bonito.'],
      ['zeneto', 'João Pedro, a vizinha tá na janela com uma chinela na mão.'],
      ['joaopedro:rindo', 'É fã.'],
      ['zeneto:assustado', 'Fã não grita "VOU CHAMAR A POLÍCIA, JOÃO PEDRO!", João Pedro.'],
      ['davi', 'Calma, gente. Eu tenho um plano infalível pra acalmar a vizinha.'],
      ['miguel:desconfiado', 'Qual?'],
      ['davi', '{lista:daviPlanos}'],
      { escolha: [
        { txt: 'Deixar o Davi executar o plano', vai: 'vizinhaDavi', medidores: { juizo: -3 } },
        { txt: 'João Pedro desliga a moto (com dor no coração)', vai: 'vizinhaDesliga', medidores: { desconfianca: -3 } },
        { txt: 'Acelerar mais forte, pra ela desistir', vai: 'vizinhaAcelera', medidores: { juizo: -5 } }
      ] }
    ],
    vizinhaDavi: [
      ['davi', 'Dona Lurdes! O bode mandou dizer que tá tudo bem!'],
      ['narrador', 'Silêncio. Depois, uma chinela voando no escuro. Acertou o bode. O bode nem acordou.'],
      ['davi:assustado', '...o plano funcionou parcialmente.'],
      { vai: 'chegou' }
    ],
    vizinhaDesliga: [
      ['joaopedro:assustado', '*desliga a moto devagarinho, como quem se despede de um parente*'],
      ['joaopedro', 'Pronto. Tá desligada. Tô de luto.'],
      ['helano', 'Toda despedida é um silêncio que a gente escolhe.'],
      { vai: 'chegou' }
    ],
    vizinhaAcelera: [
      ['joaopedro:rindo', 'VRUUUUUUUUM!'],
      ['narrador', 'A janela fechou. Duas casas acenderam a luz. Um cachorro uivou em Quixadá.'],
      ['zeneto', 'Diagnóstico: tu vai apanhar amanhã.'],
      { vai: 'chegou' }
    ],
    chegou: [
      ['helano', '...O barulho chega antes do homem. O homem chega antes do problema.'],
      ['miguel', 'Oxente, cheguei. E trouxe... uma carne.'],
      ['daniel', '*olha pra carne, olha pra fogueira e sorri*'],
      ['zeneto', 'Miguel, essa carne não é da Tia Zane, não, é?'],
      { escolha: [
        { txt: 'Assar agora mesmo na fogueira', vai: 'assar', flags: { carne_assada_cedo: true } },
        { txt: 'Guardar pra depois', vai: 'guardar', flags: { carne_guardada: true } },
        { txt: 'Perguntar de onde veio a carne', vai: 'perguntar' }
      ] }
    ],
    assar: [
      ['daniel', 'Deixa que eu acendo. Eu gosto de acender.'],
      ['miguel', 'Assa logo, antes que a véia acorde com esse escapamento.'],
      { vai: 'final' }
    ],
    guardar: [
      ['miguel', 'Melhor. Carne roubada de madrugada rende mais na noite seguinte.'],
      ['helano', 'Carne guardada é promessa de fogueira.'],
      { vai: 'final' }
    ],
    perguntar: [
      ['miguel', 'Veio... do mercado. Do mercado da madrugada. Que é... a geladeira da minha avó.'],
      ['zeneto', 'Então é roubada.'],
      ['miguel', 'É emprestada pra sempre.'],
      { flags: { mentiu_carne: true }, medidores: { desconfianca: 5 } },
      { vai: 'final' }
    ],
    final: [
      ['joaopedro', 'Bora subir a serra? Peba, tatu... a noite tá boa pra caçar.'],
      ['davi', 'Eu tenho um plano infalível: a gente vai, caça, e volta.'],
      ['helano', 'Plano simples é o que mais erra.'],
      ['narrador', '{controles}'],
      { fim: true }
    ]
  };

  D.pegar_espingardas = {
    inicio: [
      ['lider', 'As duas soca-tempo e a calibre 20 do Tio Ota, penduradas na parede do alpendre.'],
      { seGrupo: 'joaopedro', vai: 'neto' },
      { vai: 'pega' }
    ],
    neto: [
      ['joaopedro', 'A calibre 20 do vô. Ele dizia: "Arma é pra respeito, não pra exibição."'],
      ['joaopedro', 'Ninguém nessa serra levantava a voz pro Tio Ota. Nem o coronel.'],
      { vai: 'pega' }
    ],
    pega: [
      { flags: { pegou_espingardas: true }, acao: 'removerAlvo' },
      ['narrador', 'Espingardas pegas. Quem tem espingarda atira com [{tecla:ataque}] (munição contada!).'],
      { fim: true }
    ]
  };
  D.pegar_cartucheira = {
    inicio: [
      ['lider', 'A cartucheira. Doze cartuchos. Pouca munição pra muita serra.'],
      ['zeneto', 'E a minha maleta de doutor? Dipirona, boldo e esparadrapo. Tá completa.'],
      { flags: { pegou_cartucheira: true }, acao: 'removerAlvo' },
      { fim: true }
    ]
  };
  D.chamar_cachorros = {
    inicio: [
      ['lider', 'TROVÃO! PIABA! Bora caçar!'],
      ['trovao', 'Au! Au!'],
      ['piaba', 'Au?'],
      { seGrupo: 'davi', vai: 'davi' },
      { vai: 'fim' }
    ],
    davi: [
      ['davi', '(traduzindo) A Piaba disse que vai, mas que hoje a noite tá esquisita.'],
      { vai: 'fim' }
    ],
    fim: [
      { flags: { chamou_cachorros: true }, acao: 'chamarCachorros' },
      ['narrador', 'Trovão e Piaba vão com o grupo. Eles mordem quem chegar perto... e latem pro nada.'],
      { fim: true }
    ]
  };
  D.amadeus_prologo = {
    inicio: [
      ['joaovitor', 'A Tribo dos Amadeus vai pelo outro lado da serra. A gente se encontra nas terras do Paulo do Zé Baixinho.'],
      ['joaoluiz', 'Amadeu não anda em bando. Anda em tribo.'],
      ['luizfernando', 'Já fizemos o juramento: palma, giz e silêncio.'],
      ['joaovitor', 'E se alguém achar alguma coisa de valor, a tribo tem direito a 30%. Tá no estatuto.'],
      ['luizfernando', 'Não tem estatuto nenhum.'],
      ['joaovitor', 'Agora tem.'],
      { fim: true }
    ]
  };
  D.hugo_prologo = {
    inicio: [
      ['hugo', 'A Bros quebrou de novo. Corrente, vela e um barulho que eu nunca ouvi na vida.'],
      ['hugo', 'Fico aqui ajeitando. Se precisar de gambiarra amanhã, me chama.'],
      { fim: true }
    ]
  };
  D.jc_prologo = {
    inicio: [
      ['joaocarlos', 'Vou ali ver o Gojoba. Ele ligou chorando de novo. Disse que ganhou uma caixa de som.'],
      ['joaocarlos', '...Isso não vai acabar bem pra ninguém.'],
      { fim: true }
    ]
  };
  D.prologo_ainda_nao = {
    inicio: [
      ['lider', 'Peraí. Falta pegar as espingardas e a cartucheira no alpendre, e chamar o Trovão e a Piaba.'],
      { fim: true }
    ]
  };

  D.prologo_vander = {
    inicio: [
      ['narrador', 'Alguém vem chegando pela escuridão, devagar, sem fazer barulho nenhum.'],
      ['vander', '...Eu sonhei.'],
      ['zeneto', 'Tu tá pálido, macho. Toma uma dipirona.'],
      ['vander', 'Sonhei com um velho. Joaquim Bento. Disse que tem uma botija enterrada na tapera do pé da serra.'],
      ['davi', 'Joaquim Bento? Esse nome me deu uma coceira na alma.'],
      ['joaopedro', 'Em mim também! Aqui, ó, do lado do fígado.'],
      ['vander', 'Ele botou uma condição: "Vai só. Não conta pra ninguém."'],
      ['miguel', 'E tu acabou de contar pra todo mundo.'],
      ['vander', '...'],
      ['helano', 'Botija contada é botija cobrada.'],
      { acao: 'gritoDavi' },
      ['davi', 'TIRAR O EXCESSO!'],
      ['zeneto', 'Excesso de quê, Davi?'],
      ['davi', 'De conversa. Agora a gente vai.'],
      { pista: 'joaquim_bento' },
      { escolha: [
        { txt: 'Vamos atrás da botija!', vai: 'tribo', flags: { botija_assumida: true } },
        { txt: 'A gente vai só caçar. Se a botija aparecer, apareceu.', vai: 'tribo', flags: { disfarce_cacada: true } }
      ] }
    ],
    tribo: [
      ['joaopedro', 'E os Amadeus? A tribo vai pelo outro lado da serra.'],
      { escolha: [
        { txt: 'Contar da botija pra tribo também', vai: 'fim', flags: { contou_amadeus: true } },
        { txt: 'Segredo nosso. Os Amadeus não precisam saber.', vai: 'fim', flags: { escondeu_amadeus: true }, medidores: { desconfianca: 10 } }
      ] }
    ],
    fim: [
      ['vander', 'Eu vou na frente. Vocês vão me ver... e não vão me ver.'],
      { flags: { prologo_pronto: true } },
      { fim: true }
    ]
  };

  // =========================================================
  //  ATO 1 — A CAÇADA QUE DÁ ERRADO
  // =========================================================
  D.ato1_abertura = {
    inicio: [
      ['narrador', 'Pé da serra. A lua se esconde atrás das pedras e a lanterna vira a única coisa que existe.'],
      ['davi', 'Eu e o bode combinamos: peba à esquerda, tatu à direita.'],
      ['zeneto', 'E a Caipora no meio.'],
      ['joaopedro', 'O vô dizia: respeita a mata, que ela respeita a gente.'],
      ['helano', 'Quem caça demais vira caça.'],
      ['narrador', 'Caçar bicho sobe a RAIVA DA CAIPORA. A barra de PODER DE GRUPO enche quando vocês lutam: use com [{tecla:poder}].'],
      { fim: true }
    ]
  };
  D.serra_ainda_nao = {
    inicio: [
      ['davi', 'Calma! O plano infalível manda subir até o alto primeiro. Lá em cima pega sinal... de alguma coisa.'],
      { fim: true }
    ]
  };

  D.latido_caipora = {
    inicio: [
      ['narrador', 'Trovão e Piaba param de repente e latem pro escuro. Pra nada. Pra ninguém.'],
      ['zeneto', 'Não tem nada ali. Não tem. Né?'],
      ['joaopedro', 'O vô dizia que cachorro late pro que a gente não vê.'],
      ['helano', 'O que a gente não vê também está vendo a gente.'],
      { fim: true }
    ]
  };
  D.latido_vander = {
    inicio: [
      ['narrador', 'Trovão e Piaba latem pro escuro. Lá longe, uma figura passa andando devagar... de olho fechado, assobiando.'],
      ['miguel', 'Aquilo ali era... de chinelo?'],
      ['davi', 'A Piaba disse que conhece aquele cheiro. Não quis dizer de quem.'],
      { pista: 'vander_sonambulo_1' },
      { fim: true }
    ]
  };

  D.pe_torcido = {
    inicio: [
      ['davi', 'AI! Pisei num buraco de tatu! Torci o pé!'],
      ['zeneto', 'Deixa o doutor ver. Hum. Hum hum. Diagnóstico: virose.'],
      ['davi', 'Virose no PÉ?'],
      ['zeneto', 'Virose do pé. Toma esse chá de boldo e duas dipironas.'],
      { escolha: [
        { txt: 'Aceitar o boldo do Zé Neto', vai: 'aceita', flags: { davi_boldo: true } },
        { txt: 'Davi: "O bode já me curou por telepatia."', vai: 'recusa', flags: { davi_recusou_boldo: true } }
      ] }
    ],
    aceita: [
      ['davi', '*bebe tudo de uma vez*'],
      ['davi', 'O pé melhorou... mas o mundo tá girando pro lado errado.'],
      { acao: 'daviZonzo' },
      ['zeneto', 'Efeito colateral raro. Raríssimo. Acontece sempre.'],
      { fim: true }
    ],
    recusa: [
      ['zeneto', 'Tá certo. Quando o pé cair, não me chama.'],
      { medidores: { desconfianca: 3 } },
      { fim: true }
    ]
  };

  D.vander_serra = {
    inicio: [
      ['vander', '...'],
      ['miguel', 'Vander? Tu tava na nossa frente esse tempo todo?'],
      ['vander', 'A botija não tá onde vocês pensam. Tá onde vocês vão.'],
      ['vander', 'E cuidado com o sinal lá no alto. Tem voz que chama de longe pra derrubar de perto.'],
      { seSegredo: 'vander', vai: 'sonambulo' },
      { fim: true }
    ],
    sonambulo: [
      ['zeneto', 'Vander... tu tá descalço. E de olho fechado.'],
      ['vander', '*acorda* Hã? Onde é que eu tô? Eu tava em casa...'],
      { pista: 'vander_sonambulo_2' },
      { fim: true }
    ]
  };

  D.sinal_helano_1 = {
    inicio: [
      ['narrador', 'No alto da serra, o celular do Helano vibra. Quatro tracinhos de sinal. Um milagre.'],
      ['helano', '...É a galega de Fortaleza.'],
      ['zeneto', 'Lapuca, não. Não, não, não.'],
      { fim: true }
    ]
  };
  D.sinal_resistiu = {
    inicio: [
      ['helano', 'Mulher que pede localização no meio da serra, de madrugada, não quer o meu bem.'],
      ['joaopedro', 'Profeta!'],
      { vai: 'vista' }
    ],
    vista: [
      ['narrador', 'Lá do alto dá pra ver o campo do Roma lá embaixo, a leste. E, no céu, umas luzes que não são estrela.'],
      ['davi', 'Disco voador. O bode já tinha avisado.'],
      { fim: true }
    ]
  };
  D.sinal_caiu = {
    inicio: [
      ['helano', 'Ela tá perdida aqui perto. Na grota. Me seguam.'],
      ['zeneto', 'Lapuca, a grota é um BURACO.'],
      ['helano', 'O amor também é.'],
      ['narrador', 'O grupo seguiu o profeta. O GPS da galega apontava direto pro barranco.'],
      { fim: true }
    ]
  };
  D.sinal_sem_helano = {
    inicio: [
      ['lider', 'O alto da serra. Daqui dá pra ver o campo do Roma lá embaixo, a leste.'],
      ['narrador', 'E, no céu, umas luzes que não são estrela piscam devagar.'],
      { fim: true }
    ]
  };
  D.grota_chegada = {
    inicio: [
      ['narrador', 'TUM. O grupo inteiro rola barranco abaixo e cai no fundo da grota.'],
      ['zeneto', 'Ninguém se mexe! Diagnóstico: todo mundo quebrado. Mentira, todo mundo bem.'],
      ['helano', '...Ela não estava aqui.'],
      ['miguel', 'Nunca esteve, Lapuca. Nunca esteve.'],
      ['narrador', 'Saída pela trilha a noroeste. E tem alguém aqui embaixo com vocês...'],
      { fim: true }
    ]
  };
  D.ossada_jb = {
    inicio: [
      ['narrador', 'A ossada de um jumento, e no pescoço dele um medalhão enferrujado: "J. B."'],
      ['davi', 'J. B. ... Joaquim Bento? A coceira na alma voltou.'],
      { pista: 'medalhao_jb' },
      { fim: true }
    ]
  };

  D.toco_caipora = {
    inicio: [
      ['narrador', 'Um toco antigo, cheio de marquinhas. Dizem que é aqui que se deixa agrado pra Caipora.'],
      { escolha: [
        { txt: 'Deixar um rolo de fumo de oferenda', acao: 'oferenda', vai: 'deixou' },
        { txt: 'Seguir em frente', vai: 'nada' }
      ] }
    ],
    deixou: [{ fim: true }],
    nada: [
      ['joaopedro', 'O vô sempre deixava fumo pra Caipora. Dizia que sai mais barato que levar surra da mata.'],
      { fim: true }
    ]
  };
  D.pedra_miguel_serra = {
    inicio: [
      ['miguel', 'PERAÍ. Esse desenho na pedra é o MEU estilo cubista! Igualzinho o que eu faço desde criança!'],
      ['zeneto', 'Isso aí tá aí há uns cem anos, Miguel.'],
      ['miguel', 'Então eu sou um gênio adiantado. Ou atrasado. E olha: as linhas apontam pra baixo da serra.'],
      { flags: { viu_desenho_pedra: true }, pista: 'desenho_pedra' },
      { fim: true }
    ]
  };
  D.bode_serra_davi = {
    inicio: [
      ['davi', 'Bode?! Tu subiu a serra atrás da gente?'],
      ['bode', 'Méééé.'],
      ['davi', '(traduzindo) Ele disse pra deixar fumo no toco, que a Caipora se acalma.'],
      ['bode', 'Mé. Mé-mé-méééé.'],
      ['davi', 'E que o Paulo do Zé Baixinho é forte no braço, mas no escuro não pega um pênalti.'],
      { fim: true }
    ]
  };

  // ---------- pistas dos segredos ----------
  D.pista_vander_rastro = {
    inicio: [
      ['lider', 'Rastro de chinelo. Andando reto por cima dos espinhos, como quem não sente nada.'],
      { pista: 'vander_rastro' },
      { fim: true }
    ]
  };
  D.pista_daniel_circulo = {
    inicio: [
      ['lider', 'Um círculo de cinza velha no chão, perfeitinho.'],
      { seGrupo: 'daniel', vai: 'daniel' },
      { pista: 'daniel_circulo' },
      { fim: true }
    ],
    daniel: [
      ['daniel', 'Isso aqui eu conheço. O vô fazia assim. *sorri*'],
      { pista: 'daniel_circulo' },
      { fim: true }
    ]
  };
  D.pista_jv_recibo = {
    inicio: [
      ['lider', 'Um papel amassado: "Recebi de C. a quantia de... por informações." A assinatura parece um "M".'],
      { pista: 'jv_recibo' },
      { fim: true }
    ]
  };
  D.pista_felipe_bilhete = {
    inicio: [
      ['lider', 'Um bilhete: "Parceiro, marca a trilha da tapera que o doutor paga bem. Ass.: F."'],
      { pista: 'felipe_bilhete' },
      { fim: true }
    ]
  };
  D.pista_felipe_placa = {
    inicio: [
      ['narrador', 'Placa: "VENDO TERRA E MOTO BARATINHA — TRATAR C/ FELIPE PARCEIRO".'],
      ['lider', 'Essa terra é do Paulo. Que história é essa?'],
      { pista: 'felipe_placa' },
      { fim: true }
    ]
  };

  // =========================================================
  //  ATO 1 — O PEDÁGIO DO ROMA
  // =========================================================
  D.ato1_paulo_abertura = {
    inicio: [
      ['narrador', 'Do outro lado da serra, na entrada das terras do Paulo do Zé Baixinho, a Tribo dos Amadeus espera.'],
      ['joaovitor', 'Oxente! Demoraram! A tribo já tava cobrando hora extra.'],
      ['luizfernando', '*faz o gesto secreto: duas palmas, um estalo e um aceno de sobrancelha*'],
      { se: 'contou_amadeus', vai: 'contou' },
      ['joaovitor', 'Vocês tão com cara de quem esconde alguma coisa. Miserável conhece cara de segredo.'],
      { medidores: { desconfianca: 5 } },
      { vai: 'segue' }
    ],
    contou: [
      ['joaoluiz', 'Botija, né? A tribo tá dentro. Pela tribo e pela botija.'],
      { vai: 'segue' }
    ],
    segue: [
      ['narrador', 'O Zé Neto ficou cuidando do Davi (que ainda vê o mundo girando) e o Daniel ficou "vigiando a fogueira".'],
      ['joaopedro', 'O Paulo cobra pedágio de quem passa pelas terras dele. E ele é presidente do Roma.'],
      ['helano', 'Todo presidente cobra. A diferença é o que ele entrega.'],
      { fim: true }
    ]
  };
  D.placa_pedagio = {
    inicio: [
      ['narrador', 'PEDÁGIO DO ROMA — Pague em cartucho, cachaça ou humilhação. Assinado: O Presidente.'],
      { fim: true }
    ]
  };
  D.seuchico = {
    inicio: [
      ['seuchico', 'Boa noite, meninos. Ou bom dia, que já passa das três.'],
      { fofoca: 'seuchico' },
      { seGrupo: 'joaopedro', vai: 'neto' },
      { vai: 'dica' }
    ],
    neto: [
      ['seuchico', 'Tu é neto do Ota, não é? Teu avô foi o maior vaqueiro que essa região já viu.'],
      ['seuchico', 'Uma vez ele enfrentou o coronel sozinho, no meio da seca, por causa da água do açude. Ninguém esquece.'],
      ['joaopedro', '...Obrigado, Seu Chico.'],
      { vai: 'dica' }
    ],
    dica: [
      ['seuchico', 'O Paulo é bom de braço. Mas bêbado, tropeça. Espera ele cair que aí é a hora.'],
      { fim: true }
    ]
  };
  D.boi = {
    inicio: [
      ['boi', 'Muuuu.'],
      ['lider', 'Gado nelore do Paulo. Parece mais sóbrio que o dono.'],
      { fim: true }
    ]
  };
  D.pedagio = {
    inicio: [
      ['torcedor', 'Hic! PEDÁGIO! Ninguém passa pela porteira do presidente sem pagar!'],
      ['torcedor', 'Ou paga em cartucho, ou é briga, ou é... é... esqueci a terceira.'],
      { escolha: [
        { txt: 'Pagar 5 cartuchos', vai: 'pagou', acao: 'pagarPedagio', flags: { pagou_pedagio: true } },
        { txt: 'João Vitor: "Deixa que eu converso."', grupo: 'joaovitor', vai: 'labia', flags: { enrolou_pedagio: true } },
        { txt: 'Passar na marra', vai: 'briga', flags: { brigou_pedagio: true } }
      ] }
    ],
    pagou: [
      ['torcedor', 'Hic! Gente educada! O presidente vai gostar de vocês.'],
      { flags: { paulo_respeitado: true } },
      { vai: 'abre' }
    ],
    labia: [
      ['joaovitor', 'Parceiro, a gente É do Roma. Diretoria. Viemos fiscalizar o pedágio.'],
      ['torcedor', 'Diretoria?! Hic! Desculpa, doutor! Pode passar!'],
      { medidores: { desconfianca: 3 } },
      { vai: 'abre' }
    ],
    briga: [
      ['torcedor', 'Então é briga! Ô RAPAZIADA DO ROMA!'],
      { acao: 'alertarBebados' },
      { vai: 'abre' }
    ],
    abre: [
      { acao: 'abrirPorteira', flags: { porteira_aberta: true } },
      ['narrador', 'A porteira abre rangendo. Lá no fim da estrada, as luzes do campo do Roma.'],
      { seSegredo: 'joaovitor', vai: 'jv' },
      { fim: true }
    ],
    jv: [
      ['narrador', 'O João Vitor se afasta pra atender o celular, falando baixinho.'],
      ['joaovitor', 'Era a mãe. Tá tudo certo. Bora.'],
      ['miguel', '...A mãe dele não tem celular.'],
      { pista: 'jv_celular' },
      { fim: true }
    ]
  };

  // =========================================================
  //  BOSS — PAULO DO ZÉ BAIXINHO
  // =========================================================
  D.paulo_intro = {
    inicio: [
      ['narrador', '3 da manhã. No meio do campo do Roma, iluminado por quatro lâmpadas fracas, um homem.'],
      ['paulo', 'HIC! Quem é que entra no MEU campo a uma hora dessas?!'],
      ['narrador', 'Paulo do Zé Baixinho. Presidente do Roma. E um braço muito, muito maior que o outro.'],
      ['joaopedro', 'Dizem que foi de tanto erguer taça.'],
      ['luizfernando', 'Dizem que foi promessa pra Santa Isabel.'],
      ['joaovitor', 'Dizem que foi abelha.'],
      ['paulo', 'Foi de dar queda de braço com quem não paga PEDÁGIO! HIC!'],
      { escolha: [
        { txt: 'Respeitar o presidente: "Boa noite, seu Paulo."', vai: 'respeito', flags: { paulo_respeitado: true } },
        { txt: 'Zombar do braço', vai: 'zomba', flags: { zombou_paulo: true } }
      ] }
    ],
    respeito: [
      ['paulo', 'Educado! Gostei. Mas pedágio é pedágio. Bora resolver na briga e no desafio!'],
      { vai: 'fim' }
    ],
    zomba: [
      ['joaovitor', 'Esse braço aí é emprestado, seu Paulo?'],
      ['paulo', 'EMPRESTADO?! Vou te mostrar o emprestado! HIC!'],
      { vai: 'fim' }
    ],
    fim: [
      ['narrador', 'Fique de olho no CÍRCULO VERMELHO antes do soco e na SOMBRA das garrafas. Quando ele tropeçar, ataque!'],
      { fim: true }
    ]
  };
  D.paulo_desafio = {
    inicio: [
      ['paulo', 'Ôxe! Tu bate bem, cabra! Mas no Roma briga se resolve é no DESAFIO! Escolhe!'],
      { escolha: [
        { txt: 'Queda de braço (contra o braço gigante)', seNao: 'paulo_venceu_braco', flags: { paulo_esc_braco: true } },
        { txt: 'Pênaltis no escuro contra o Roma', seNao: 'paulo_venceu_penaltis', flags: { paulo_esc_penaltis: true } },
        { txt: 'Rodada de cachaça', seNao: 'paulo_venceu_cachaca', flags: { paulo_esc_cachaca: true } },
        { txt: 'Propor paz (ele tá sem a garrafa)', se: ['paulo_sem_garrafa', 'paulo_respeitado'], flags: { paulo_paz: true } }
      ] },
      { fim: true }
    ]
  };
  D.paulo_paz_fim = {
    inicio: [
      ['paulo', 'Sem a garrafa eu fico... lúcido. E lúcido eu vejo que vocês são gente boa.'],
      ['paulo', 'Fazemos as pazes. Pedágio perdoado. Hic. Foi o último hic, juro.'],
      { flags: { paulo_aliado: true } },
      { fim: true }
    ]
  };
  D.paulo_derrota = {
    inicio: [
      ['paulo', 'Hic... Fazia tempo que ninguém me ganhava. Desde o Zé Baixinho, meu pai.'],
      { escolha: [
        { txt: 'Ajudar o presidente a levantar', vai: 'ajuda', flags: { paulo_aliado: true } },
        { txt: 'Cobrar pedágio dele agora', vai: 'cobra', flags: { paulo_cobrado: true }, medidores: { desconfianca: 5 } }
      ] }
    ],
    ajuda: [
      ['paulo', 'Gente boa. Gente boa demais. O Roma tá com vocês, viu?'],
      { fim: true }
    ],
    cobra: [
      ['joaovitor', 'Pedágio invertido, presidente. Cinco cartuchos.'],
      { acao: 'darMunicao' },
      ['paulo', 'Miserável... Esse apelido é merecido.'],
      { fim: true }
    ]
  };
  D.paulo_revela = {
    inicio: [
      ['paulo', 'Agora escuta, que eu sóbrio falo pouco: o neto do coronel... o CDs... anda comprando terra por aqui.'],
      ['paulo', 'Semana passada veio perguntar da tapera do pé da serra. Ofereceu uma fortuna. Eu disse que a tapera não é minha.'],
      ['helano', 'Quem pergunta da tapera já sabe da botija.'],
      { seSegredo: 'joaovitor', vai: 'jv' },
      { vai: 'fim' }
    ],
    jv: [
      ['joaovitor', 'CDs? Nunca ouvi falar. Nunquinha. Nem sei escrever.'],
      ['miguel', 'Ninguém perguntou se tu sabia escrever.'],
      { vai: 'fim' }
    ],
    fim: [
      { pista: 'cedezzi_comprando' },
      { se: 'paulo_aliado', vai: 'aliado' },
      { fim: true }
    ],
    aliado: [
      ['paulo', 'E se precisarem do Roma, o time inteiro tá com vocês. Até o goleiro, que não pega nada.'],
      { fim: true }
    ]
  };
  D.paulo_depois = {
    inicio: [
      { se: 'paulo_aliado', vai: 'aliado' },
      ['paulo:bravo', 'Hic. Vocês ganharam, mas não comemorem no meu campo.'],
      ['paulo', 'Treino amanhã às seis. Ninguém vai, mas o treino é às seis.'],
      { escolha: [
        { txt: '"A gente vai no treino, presidente."', vai: 'treino', medidores: { juizo: -3 } },
        { txt: '"E aquele pênalti de 2009?"', vai: 'penalti' },
        { txt: 'Sair de fininho', vai: 'fim' }
      ] }
    ],
    aliado: [
      ['paulo:rindo', 'OLHA OS CAMPEÕES! Hic! O Roma tá com vocês, viu?'],
      ['paulo', 'Se precisarem de gente pra empurrar, carregar ou gritar "UH!", é só chamar.'],
      ['joaopedro', 'E o pedágio?'],
      ['paulo', 'Pedágio pra amigo é um abraço. Hic. Dois abraços pra quem é do Roma.'],
      { fim: true }
    ],
    treino: [
      ['paulo:rindo', 'SÉRIO?! Hic! Finalmente um elenco!'],
      ['paulo', 'Seis da manhã. Tragam chuteira. Ou chinela. Ou nada, que o campo é de terra mesmo.'],
      { fim: true }
    ],
    penalti: [
      ['paulo:assustado', 'Ninguém fala desse pênalti!'],
      ['paulo', 'A bola ainda tá subindo, sabia? O Stelo jura que viu ela passando por Quixadá.'],
      ['helano', 'Toda bola um dia desce.'],
      ['paulo:desconfiado', '...isso foi uma ameaça ou uma profecia?'],
      { fim: true }
    ],
    fim: [{ fim: true }]
  };
})();
