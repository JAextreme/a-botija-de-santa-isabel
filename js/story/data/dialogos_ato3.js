/* =========================================================
   dialogos_ato3.js — CONTEÚDO: Ato III, A Noite da Festa,
   o boss final Rafael CDs e os FINAIS.
   Rafael CDs e todos os políticos deste jogo são fictícios.
   Marcador extra no texto: {plano} (quantas partes do plano já
   foram combinadas).
   ========================================================= */
(function () {
  'use strict';
  var D = BSI.data.dialogos;

  D.ato3_abertura = {
    inicio: [
      ['narrador', 'A noite da festa da padroeira. Santa Isabel inteira na praça: quermesse, leilão de galinha, banda, a igrejinha iluminada.'],
      ['narrador', 'E, no meio de tudo, um palanque gigante com uma faixa: "RAFAEL CDs REVELA UM TESOURO HISTÓRICO".'],
      ['miguel', 'Ele vai mostrar a escritura dizendo que a terra é dele.'],
      ['joaovitor', 'Então a gente precisa de um plano. Um plano de verdade, não um plano do Davi.'],
      ['davi', 'Meus planos são infalíveis.'],
      ['hugo', 'O último plano infalível teu terminou com a gente dentro de um chiqueiro.'],
      ['davi', 'E ninguém achou a gente. INFALÍVEL.'],
      ['joaopedro:rindo', 'Ó o leilão de galinha começando! Bora dar um lance?'],
      ['miguel', 'A gente não tem dinheiro.'],
      ['joaovitor:rindo', 'Isso nunca me impediu.'],
      { escolha: [
        { txt: 'Dar um lance no leilão de galinha (fiado)', vai: 'leilao', medidores: { desconfianca: -5 } },
        { txt: 'Comprar uma cartela de bingo da padroeira', vai: 'bingo', medidores: { juizo: 5 } },
        { txt: 'Foco no plano, gente', vai: 'foco' }
      ] }
    ],
    leilao: [
      ['narrador', 'O padre bate o martelo: "Vendida pro grupo do alpendre, por dez reais no fiado do João Vitor!"'],
      ['joaovitor:rindo', 'Negócio fechado. A galinha é de todos. A dívida é minha.'],
      ['helano', 'Pela primeira vez, essa turma concordou em alguma coisa: a galinha.'],
      { vai: 'plano' }
    ],
    bingo: [
      ['narrador', '"B-7! Bode no sete!" Por milagre da padroeira, a cartela do grupo completa uma linha.'],
      ['davi:rindo', 'GANHEI! GANHEI! O que eu ganhei?'],
      ['narrador', 'Uma panela de pressão. Que vai pro João Luiz, porque tampa de panela é escudo sagrado.'],
      { vai: 'plano' }
    ],
    foco: [
      ['hugo', 'Isso. Foco. Depois tem leilão de novo. Sempre tem leilão.'],
      { vai: 'plano' }
    ],
    plano: [
      ['helano', 'Plano é o que a gente faz enquanto o destino ri.'],
      ['narrador', 'O PLANO: Miguel rouba a botija no camarim atrás do palanque (com o Roubo da Madrugada). Hugo sabota o gerador do palanque.'],
      ['narrador', '(Não precisa trocar de personagem: chegue perto do gerador ou do camarim e interaja. O Hugo e o Miguel vêm correndo fazer a parte deles.)'],
      ['narrador', 'E falem com quem pode ajudar: o Stelo, a Tribo dos Amadeus, a Tia Zane, o Gojoba, o Paulo do Zé Baixinho... Quando estiverem prontos, cheguem perto do palanque.'],
      { fim: true }
    ]
  };

  // ---------------- o plano ----------------
  D.gerador_palanque = {
    inicio: [
      ['narrador', 'O gerador que alimenta o som e as luzes do palanque. Ronca mais que o escapamento do João Pedro.'],
      { acao: 'sabotarGerador' },
      { fim: true }
    ]
  };
  D.botija_camarim = {
    inicio: [
      ['narrador', 'Ali, em cima de uma mesa no camarim: a botija! E os capangas de olho.'],
      ['capanga', '...e aí o doutor disse que vai fazer metrô no açude.'],
      ['capanga', 'Metrô? Eu nunca andei de metrô.'],
      ['capanga', 'Nem ele. Por isso que é promessa.'],
      ['narrador', 'Os capangas estão distraídos. Mas nem tanto. Precisa de mais uma distração.'],
      { escolha: [
        { txt: 'Davi conta um plano infalível pros capangas', vai: 'davi', grupo: 'davi', medidores: { juizo: -2 } },
        { txt: 'João Pedro acelera a moto do outro lado da praça', vai: 'moto', grupo: 'joaopedro' },
        { txt: 'Ninguém distrai. O Miguel vai assim mesmo.', vai: 'direto', medidores: { desconfianca: 3 } }
      ] }
    ],
    davi: [
      ['davi', 'Com licença, cavalheiros. Tenho um plano infalível pra vocês ficarem ricos.'],
      ['capanga', '...qual?'],
      ['davi', '{lista:daviPlanos}'],
      ['capanga', 'Rapaz... faz sentido.'],
      ['narrador', 'Não fazia sentido nenhum. Mas os dois ficaram pensando. E pensar distrai.'],
      { vai: 'roubo' }
    ],
    moto: [
      ['narrador', 'Do outro lado da praça: VRUUUUM! PÁ-PÁ-PÁ!'],
      ['capanga', 'Que zoada é essa?!'],
      ['capanga', 'Deve ser o tal do escapamento das duas da manhã. Vamo ver!'],
      { vai: 'roubo' }
    ],
    direto: [
      ['miguel:desconfiado', 'Vou assim mesmo. Roubo da madrugada não pede licença.'],
      ['helano', 'Coragem é medo com pressa.'],
      { vai: 'roubo' }
    ],
    roubo: [
      { acao: 'roubarBotija' },
      { fim: true }
    ]
  };
  D.stelo_festa = {
    inicio: [
      ['stelo', 'Meu povo! Tô com o celular na mão e oitenta grupos de WhatsApp. Querem que eu espalhe alguma coisa?'],
      { escolha: [
        { txt: 'Espalhar que o CDs quer tomar a terra do povo', vai: 'espalha', acao: 'steloFakeNews' },
        { txt: 'Melhor não, Stelo', vai: 'nao' }
      ] }
    ],
    espalha: [{ fim: true }],
    nao: [['stelo', 'Vocês que sabem. Mas o áudio já tava gravado.'], { fim: true }]
  };
  D.zane_festa = {
    inicio: [
      ['tiazane', 'Meus netos. Eu sei o que vocês vão fazer.'],
      ['tiazane', 'Quando aquele homem estiver lá em cima mentindo, eu subo naquele palanque e conto pra cidade inteira quem era o Ota.'],
      { flags: { zane_no_palanque: true } },
      ['joaopedro', 'Vó... obrigado.'],
      { fim: true }
    ]
  };
  D.gojoba_festa = {
    inicio: [
      ['gojoba', 'PRIMOS! Trouxe a caixa reserva! Quando o CDs começar a falar, eu ligo no MÁXIMO e ninguém escuta nada!'],
      { flags: { gojoba_aliado_festa: true } },
      ['joaocarlos', 'Pela primeira vez na vida, essa caixa vai servir pra alguma coisa.'],
      { fim: true }
    ]
  };
  D.paulo_festa = {
    inicio: [
      ['paulo', 'O ROMA INTEIRO TÁ AQUI! Goleiro, zagueiro, roupeiro e a torcida organizada (três pessoas)!'],
      ['paulo', 'Se o CDs chamar capanga, o Roma entra em campo.'],
      { flags: { roma_na_festa: true } },
      { fim: true }
    ]
  };
  D.tribo_festa = {
    inicio: [
      ['luizfernando', 'A tribo preparou o ritual secreto. Duas palmas, um estalo, um aceno de sobrancelha.'],
      ['joaoluiz', 'Na hora certa, a gente faz. Ninguém resiste ao ritual completo.'],
      { seGrupo: 'joaovitor', vai: 'jv' },
      { vai: 'fim' }
    ],
    jv: [
      ['joaovitor', 'Eu tô dentro. A tribo antes de tudo. ...Até antes do dinheiro.'],
      { seSegredo: 'joaovitor', vai: 'jv_suspeito' },
      { vai: 'fim' }
    ],
    jv_suspeito: [
      ['luizfernando', '...Até antes do dinheiro, Miserável? Jura pela tribo?'],
      ['joaovitor', '...Juro.'],
      { vai: 'fim' }
    ],
    fim: [
      { flags: { ritual_tribo: true } },
      { fim: true }
    ]
  };
  D.daniel_festa = {
    inicio: [
      ['daniel', 'Quando chegar a hora, eu acendo a maior fogueira que essa praça já viu. Pro bem. Prometo.'],
      ['daniel', '*sorri, mas é um sorriso diferente*'],
      { flags: { fogueira_combinada: true } },
      { fim: true }
    ]
  };
  D.vander_festa = {
    inicio: [
      ['vander', 'As luzes no céu tão mais fortes hoje. Elas vieram ver o fim da história.'],
      ['vander', 'E o coronel também vem. Ele não vai deixar o neto cair sozinho.'],
      { fim: true }
    ]
  };
  D.zeneto_festa = {
    inicio: [
      ['zeneto', 'Trouxe dipirona pra cidade inteira. E boldo. Muito boldo.'],
      { fim: true }
    ]
  };
  D.jc_festa = {
    inicio: [
      ['joaocarlos', 'Hoje eu fico do lado de vocês. A família vai entender. O Gojoba, talvez.'],
      { fim: true }
    ]
  };
  D.gadernal_festa = {
    inicio: [
      ['gadernal', 'Irmão! Hoje as regras sou eu que mudo! ...Brincadeira. Hoje a gente faz junto.'],
      ['diazepan', '*dormindo em pé*'],
      { fim: true }
    ]
  };
  D.felipe_festa = {
    inicio: [
      ['felipe', 'Parceiro! Tenho um "tesouro histórico" aqui, parceiro. Uma réplica. Baratinha, parceiro.'],
      { se: 'confiou_felipe', vai: 'atalho' },
      { fim: true }
    ],
    atalho: [
      ['hugo', 'Foi pelo teu atalho que os capangas chegaram na tapera, "parceiro".'],
      ['felipe', 'Coincidência, parceiro. Pura coincidência, parceiro.'],
      { fim: true }
    ]
  };
  D.socorro_festa = {
    inicio: [
      ['socorro', 'Meus filhos, hoje é festa: o fiado de vocês fica pra depois. Vão lá e salvem a cidade.'],
      { fim: true }
    ]
  };
  D.padre_festa = {
    inicio: [
      ['padre', 'A padroeira olha por todos. Até pelos que vão subir num palanque pra mentir.'],
      { fim: true }
    ]
  };
  D.bode_festa_davi = {
    inicio: [
      ['davi', 'Bode, tu veio pra festa?'],
      ['bode', 'Mééééé.'],
      ['davi', '(traduzindo) Ele disse que a promessa do CDs é igual capim de plástico: bonita e não alimenta ninguém.'],
      { fim: true }
    ]
  };

  // ---------------- o golpe final da web namorada ----------------
  D.web_final_msg = {
    inicio: [
      ['narrador', 'O celular do Helano vibra. É ela. A Morena de São Paulo.'],
      ['narrador', '"Tô aqui na festa, Lapuca! Finalmente! Me encontra na sacristia, sozinho, pra ninguém ver..."'],
      ['joaovitor', 'Lapuca. Lapuca, olha pra mim. Isso é golpe.'],
      { fim: true }
    ]
  };
  D.web_final_ok = {
    inicio: [
      ['helano', '...A Morena de São Paulo nunca existiu. Ela escreve "vc" igual a assessoria do CDs.'],
      ['helano', 'Perfil falso. Mandado pra me tirar do caminho.'],
      ['joaopedro', 'O PROFETA VIROU O JOGO!'],
      { pista: 'perfil_falso' },
      { fim: true }
    ]
  };
  D.web_final_caiu = {
    inicio: [
      ['helano', 'Eu vou só ali. Rapidinho. Ninguém vê.'],
      ['narrador', 'O Helano entra na sacristia. A porta bate. CLIC. Trancada por fora.'],
      ['narrador', '(O Helano está preso na sacristia, ao lado da igreja. Alguém precisa soltar ele.)'],
      { fim: true }
    ]
  };
  D.sacristia = {
    inicio: [
      ['narrador', 'A porta da sacristia, trancada por fora com um cadeado novinho. De dentro, uma voz calma.'],
      ['helano', 'O amor me trancou. A amizade abre.'],
      { acao: 'resgatarHelano' },
      { acao: 'removerAlvo' },
      ['narrador', 'O cadeado cede. O Helano sai, ajeita o chapéu e guarda o celular. Pra sempre, ele diz.'],
      { fim: true }
    ]
  };

  // ---------------- o confronto ----------------
  D.chegar_palanque = {
    inicio: [
      ['narrador', 'O palanque está logo ali. Plano combinado: {plano}.'],
      { escolha: [
        { txt: 'Começar o confronto com o Rafael CDs', vai: 'vai', acao: 'comecarComicio' },
        { txt: 'Ainda não: falta acertar o plano', vai: 'nao' }
      ] }
    ],
    vai: [{ fim: true }],
    nao: [{ fim: true }]
  };
  D.comicio_inicio = {
    inicio: [
      ['narrador', 'As luzes do palanque acendem. Fogos. Uma banda tocando uma música que ninguém conhece.'],
      ['cds', 'POVO DE SANTA ISABEL! Eu, Rafael CDs, neto do grande coronel Firmino, trago a vocês...'],
      ['cds', '...a ESCRITURA ANTIGA destas terras! E ela diz que tudo isso aqui... é MEU!'],
      ['cds', 'Mas calma! Em troca, prometo: AÇUDE DE ÁGUA MINERAL! METRÔ ATÉ QUIXERAMOBIM!'],
      ['davi', 'Ele tá falando da nossa botija.'],
      ['cds', 'E QUEM DISCORDAR... vai ouvir as minhas PROMESSAS!'],
      ['narrador', 'Bata nos balões de PROMESSA (ataque corpo a corpo) pra rebater de volta. JOÃO VITOR rebate todas de uma vez. HELANO solta uma frase de profeta. JOÃO PEDRO trava o discurso.'],
      { fim: true }
    ]
  };
  D.zane_palanque = {
    inicio: [
      ['narrador', 'De repente, uma senhora sobe no palanque, de chinela na mão. A praça inteira faz silêncio.'],
      ['tiazane', 'Esse menino aí é neto do coronel Firmino. Eu sou viúva do Ota. E todo mundo aqui sabe quem foi um e quem foi o outro.'],
      ['tiazane', 'O Ota abriu o açude que o coronel fechou. "Água de Deus não tem dono", ele disse. A botija também não tem.'],
      ['narrador', 'A praça inteira vira as costas pro palanque. O microfone do CDs fica falando sozinho.'],
      { fim: true }
    ]
  };
  D.cds_fase1_fim = {
    inicio: [
      ['cds', 'Ninguém mais me escuta?! Então... SEGURANÇAS! PEGUEM ELES!'],
      ['narrador', 'O CDs pula do palanque e se esconde atrás dos capangas. A quermesse vira campo de batalha.'],
      { fim: true }
    ]
  };
  D.cds_alma_surge = {
    inicio: [
      ['cds', '*encurralado* Vovô... me ajuda...'],
      ['narrador', 'O vento para. As luzes da festa piscam e apagam. Do alto da igrejinha desce uma sombra enorme, de chapéu de coronel.'],
      ['narrador', 'A alma do coronel Firmino CDs veio proteger o neto.'],
      ['vander', 'Os três irmãos. Os três netos do Ota. E a fé. Agora.'],
      { fim: true }
    ]
  };
  D.fogueira_grande = {
    inicio: [
      ['daniel', 'Agora sim. A hora que eu esperei a vida inteira.'],
      ['narrador', 'O Daniel acende uma fogueira enorme no meio da praça. E todo mundo vem pra perto: a Tribo, os netos, a família do Davi, a turma do alpendre.'],
      ['narrador', 'Ninguém desconfia de ninguém. Pela primeira vez, todo mundo junto.'],
      ['helano', 'Fogo junto não apaga.'],
      ['narrador', 'A GRANDE FOGUEIRA: o poder de grupo fica INFINITO até o fim da luta!'],
      { fim: true }
    ]
  };
  D.fogueira_falhou = {
    inicio: [
      ['daniel', 'Vamos fazer a fogueira! Todo mundo junto!'],
      ['narrador', 'Mas ninguém se aproxima de ninguém. Desconfiança demais. A fogueira fica pequena.'],
      ['narrador', '(A Grande Fogueira precisa de pouca desconfiança no grupo e de gente de cada grupo reunida.)'],
      { fim: true }
    ]
  };
  D.cds_derrota = {
    inicio: [
      ['narrador', 'A alma do coronel se desfaz no ar com o último aboio. O neto fica sozinho no meio da praça.'],
      { se: 'botija_recuperada', vai: 'com_botija' },
      ['cds', 'A escritura... ainda tá comigo! A terra ainda é minha!'],
      ['narrador', 'Ele aperta o papel contra o peito, mas ninguém na praça olha mais pra ele.'],
      { fim: true }
    ],
    com_botija: [
      ['miguel', 'Procurando isso aqui, doutor? Roubo da madrugada. Só que de noite.'],
      ['narrador', 'O Miguel ergue a botija. Lá dentro, as moedas e a escritura de Santa Isabel.'],
      ['cds', 'Isso... isso é MEU!'],
      ['davi', 'É do povo. O bisavô deixou escrito.'],
      { fim: true }
    ]
  };

  D.cds_depois = {
    inicio: [
      ['cds:bravo', '...Eu volto. Com metrô. Vocês vão ver.'],
      ['cds', 'E com uma ponte ligando Santa Isabel a lugar nenhum!'],
      { escolha: [
        { txt: '"Promete uma coisa que dê pra cumprir, doutor."', vai: 'cumprir' },
        { txt: 'Perguntar pelos três advogados', vai: 'advogados' }
      ] }
    ],
    cumprir: [
      ['cds:desconfiado', '...Uma promessa que dê pra cumprir?'],
      ['cds', 'Prometo... ir embora.'],
      ['helano', 'Essa a gente aceita.'],
      { fim: true }
    ],
    advogados: [
      ['cds:assustado', 'Os três foram pra festa. Tão no leilão de galinha.'],
      ['cds', 'Um deles comprou duas galinhas com o dinheiro da minha campanha.'],
      { fim: true }
    ]
  };

  // =========================================================
  //  OS FINAIS
  // =========================================================
  D.final_heroico = {
    inicio: [
      ['narrador', 'A escritura é lida em voz alta no palanque, pela Tia Zane: as terras de Santa Isabel são do povo de Santa Isabel.'],
      ['narrador', 'O CDs sai da cidade na garupa de um capanga, prometendo voltar com metrô.'],
      ['narrador', 'E, por um segundo, no meio da fogueira, todo mundo vê: um velho de chapéu sorrindo. Joaquim Bento, uma última vez.'],
      ['narrador', 'As luzes no céu? Eram fogos. Os maiores que Santa Isabel já viu, pagos com uma moeda da botija.'],
      { se: 'irmaos_unidos', vai: 'irmaos' },
      { vai: 'fim' }
    ],
    irmaos: [
      ['davi', 'Meus irmãos. Minha cidade. Meu bode.'],
      ['gadernal', '*chora*'], ['diazepan', '*dorme sorrindo*'],
      { vai: 'fim' }
    ],
    fim: [
      ['paulo', 'E O ROMA GANHA UNIFORME NOVO!'],
      ['narrador', 'A maior festa da história de Santa Isabel. FINAL HEROICO.'],
      { fim: true }
    ]
  };
  D.final_familia = {
    inicio: [
      ['narrador', 'No domingo, a Tia Zane faz um almoço pra todo mundo. Panela de barro, carne de sol, baião de dois.'],
      ['narrador', 'Davi, Emanuel e Vinícius sentam juntos pela primeira vez. O Gadernal só chora duas vezes. O Diazepan dorme na sobremesa.'],
      ['narrador', 'E lá do curral, bem baixinho, vem um aboio. Ninguém fala nada. Todo mundo sabe de quem é.'],
      { se: 'miguel_confessou', vai: 'ja_sabia' },
      ['tiazane', 'Agora me digam uma coisa: quem roubava a minha carne de madrugada?'],
      ['narrador', 'Todo mundo olha pro Miguel. O Miguel olha pro bode. O bode olha pro Davi.'],
      ['tiazane', 'Miguel. Igualzinho teu avô.'],
      { vai: 'fim' }
    ],
    ja_sabia: [
      ['tiazane', 'E tu, Miguel, pode pegar mais carne. Hoje é de graça. Só hoje.'],
      { vai: 'fim' }
    ],
    fim: [
      ['narrador', 'As luzes no céu ficam paradas a noite toda, como quem também foi convidado pro almoço. FINAL DA FAMÍLIA REUNIDA.'],
      { fim: true }
    ]
  };
  D.final_tragico = {
    inicio: [
      ['narrador', 'Na comemoração, alguém pede: "Daniel, acende uma fogueirinha pra gente?"'],
      ['daniel', '*sorri*'],
      ['narrador', 'A escritura estava perto demais. Ninguém sabe se foi sem querer. O Daniel diz que foi o vento.'],
      ['narrador', 'Sem escritura, sem ouro (que foi pra pagar o Stelo, o Paulo e os prejuízos do bar), todo mundo volta pro fiado da bodega.'],
      ['socorro', 'Terceira página do caderno, meus filhos.'],
      ['narrador', 'As luzes no céu? Era o letreiro da bodega, que o Hugo consertou. FINAL TRÁGICO-CÔMICO.'],
      { fim: true }
    ]
  };
  D.final_sobrenatural = {
    inicio: [
      ['narrador', 'Quando a festa acaba, um assobio corta a praça. Fininho. Conhecido.'],
      ['narrador', 'A botija some da mesa. As moedas, uma por uma, rolam pro mato. A Caipora veio cobrar cada peba, cada tatu, cada avoante.'],
      ['narrador', 'O grupo corre atrás, entra na serra... e se perde. Pra sempre.'],
      ['narrador', 'Ou até segunda-feira, quando aparecem na bodega com fome, sem lembrar de nada.'],
      ['narrador', 'As luzes no céu? Eram os olhos da Caipora. FINAL SOBRENATURAL.'],
      { fim: true }
    ]
  };
  D.final_absurdo = {
    inicio: [
      ['narrador', 'No meio da festa, as luzes no céu descem. Descem mesmo. Um disco voador pousa no meio da praça.'],
      ['narrador', 'Três seres pequenininhos saem, pegam a botija, a caixa de som do Gojoba e o escapamento do João Pedro, e vão embora.'],
      ['joaopedro', 'MEU ESCAPAMENTO!'],
      ['gojoba', 'MINHA CAIXINHA!'],
      ['stelo', 'EU AVISEI! EU AVISEI NO GRUPO! NINGUÉM ACREDITOU NO STELO!'],
      ['narrador', 'O Stelo estava certo o tempo todo. FINAL ABSURDO.'],
      { fim: true }
    ]
  };
  D.final_traicao = {
    inicio: [
      ['narrador', 'No meio da comemoração, alguém pega a botija e some na Bros do Hugo.'],
      { seSegredo: 'joaovitor', vai: 'jv' },
      { seSegredo: 'vander', vai: 'vander' },
      { seSegredo: 'daniel', vai: 'daniel' },
      { vai: 'felipe' }
    ],
    jv: [['narrador', 'Era o João Vitor. O apelido nunca foi brincadeira. "É pela tribo", ele gritou. A tribo não acreditou.'], { vai: 'quebra' }],
    vander: [['narrador', 'Era o Vander. De olho fechado. Dormindo. Ele jura que não lembra de nada, e talvez seja verdade.'], { vai: 'quebra' }],
    daniel: [['narrador', 'Era o Daniel. "O vô me contou primeiro", ele disse, e sorriu do jeito antigo.'], { vai: 'quebra' }],
    felipe: [['narrador', 'Era o Felipe Parceiro. Sempre foi o Felipe Parceiro.'], { vai: 'quebra' }],
    quebra: [
      ['narrador', 'A Bros quebra na saída da cidade, como sempre. A botija rola pela estrada.'],
      ['narrador', 'Última cena: na feira de Quixeramobim, o Felipe Parceiro vendendo uma botija velha numa lona no chão.'],
      ['felipe', 'Baratinha, parceiro. Baratinha.'],
      ['narrador', 'As luzes no céu? O farol da Bros, que nunca mais acendeu. FINAL DA TRAIÇÃO.'],
      { fim: true }
    ]
  };
  D.final_meio = {
    inicio: [
      ['narrador', 'O CDs vai embora. A festa continua. Ninguém sabe direito quem ficou com o quê.'],
      { se: 'botija_recuperada', vai: 'com' },
      ['narrador', 'A escritura sumiu com ele. Mas a cidade inteira viu quem ele é, e isso também vale alguma coisa.'],
      { vai: 'fim' }
    ],
    com: [
      ['narrador', 'A escritura fica guardada na sacristia, com o padre. Até alguém ter coragem de ler em voz alta.'],
      { vai: 'fim' }
    ],
    fim: [
      ['helano', 'Nem toda vitória é inteira. Mas toda vitória é nossa.'],
      ['narrador', 'As luzes no céu somem devagar, como quem ainda vai voltar. FINAL DO MEIO-TERMO.'],
      ['narrador', '(Existem outros finais. Faça escolhas diferentes!)'],
      { fim: true }
    ]
  };
})();
