/* =========================================================
   estrada.js — CONVERSAS DE ESTRADA (balões, sem pausar o jogo)
   Acontecem andando, fora de briga, de tempos em tempos.
   requer: quem precisa estar no grupo · se/seNao: flags ·
   fases: só nessas fases · mata: só na mata (true) ou fora (false)
   falas: [quem, texto] — 'lider' = quem você controla.
   O IDIOMA DA FAMÍLIA (Davi e João Pedro): toda palavra ganha
   um "-ôte" e vem de trás pra frente. Ninguém entende. Nem eles.
   ========================================================= */
(function () {
  'use strict';
  BSI.data.estrada = [
    // ---------- idioma da família (Davi e João Pedro) ----------
    { id: 'familia1', requer: ['davi', 'joaopedro', 'miguel'], falas: [['davi', 'Pedrôte, abotijôte achôte nôte?'], ['joaopedro', 'Nôte. Serrôte primôte, depôte botijôte.'], ['miguel', 'Alguém traduz, pelo amor de Deus.'], ['davi', 'Ele disse que primeiro a serra, depois a botija.'], ['joaopedro', 'Eu disse que tava com fome.']] },
    { id: 'familia2', requer: ['davi', 'joaopedro', 'helano'], falas: [['joaopedro', 'Davôte, Lapucôte falôte bonitôte.'], ['davi', 'Simôte. Mas nãôte entendôte nadôte.'], ['helano', 'Eu entendi tudo. E prefiro não ter entendido.']] },
    { id: 'familia3', requer: ['davi', 'joaopedro'], falas: [['davi', 'Mãinhôte mandôte voltôte cedôte.'], ['joaopedro', 'Mentirôte. Mãinhôte tá dormindôte.'], ['davi', 'Exatamente. Por isso a gente volta cedo. Pra ela não acordar.']] },
    { id: 'familia4', requer: ['davi', 'joaopedro', 'hugo'], falas: [['hugo', 'Esse idioma de vocês tem gramática?'], ['davi', 'Tinhôte. O bode comeu.'], ['joaopedro', 'Comeôte o dicionarôte também.']] },
    { id: 'familia5', requer: ['davi', 'joaopedro'], se: 'irmaos_revelados', falas: [['joaopedro', 'Davôte... Gadernôte e Diazepôte irmãôte teu de verdadôte?'], ['davi', 'De verdadôte. Bisnetôte do velho Joaquim Bento.'], ['joaopedro', 'Então eles entram no idiomôte da famílôte?'], ['davi', 'O Diazepan dorme no meio da frase. O Gadernal muda a regra da gramática. Vai ser difícil.']] },

    // ---------- Amadeus e as regras da tribo ----------
    { id: 'tribo1', requer: ['joaoluiz', 'luizfernando', 'helano'], falas: [['joaoluiz', 'Regra quatro da tribo: ninguém come a última rapadura.'], ['luizfernando', 'Regra quatro é "ninguém corre de briga".'], ['joaoluiz', 'Isso é a regra cinco.'], ['luizfernando', 'A cinco é sobre o giz!'], ['helano', 'A regra que importa é a zero: Amadeu não se entende.']] },
    { id: 'tribo2', requer: ['joaoluiz', 'luizfernando', 'joaovitor'], falas: [['joaovitor', 'Proponho uma regra nova: quem pechincha é chefe.'], ['joaoluiz', 'Regra nova precisa de três assinaturas.'], ['luizfernando', 'E de um círculo de giz.'], ['joaovitor', 'Tô vendendo giz, se alguém quiser.']] },
    { id: 'tribo3', requer: ['joaoluiz', 'luizfernando'], falas: [['luizfernando', 'Se o círculo for oval, vale?'], ['joaoluiz', 'Oval é círculo cansado. Vale meio ritual.'], ['luizfernando', 'Então meio Amadeu fica protegido?'], ['joaoluiz', 'O meio de cima. Regra onze.']] },
    { id: 'tribo4', requer: ['joaoluiz', 'joaovitor'], falas: [['joaoluiz', 'João Vitor, tu tá devendo a mensalidade da tribo.'], ['joaovitor', 'A tribo tem mensalidade?!'], ['joaoluiz', 'Desde agora.'], ['joaovitor', 'Pago amanhã. Juro pela tribo.'], ['joaoluiz', 'Não pode jurar pela tribo devendo pra tribo. Regra oito.']] },
    { id: 'tribo5', requer: ['joaoluiz', 'luizfernando', 'helano'], falas: [['luizfernando', 'Lapuca, tu quer entrar pra tribo?'], ['helano', 'Qual a vantagem?'], ['joaoluiz', 'Proteção do círculo e um apelido.'], ['helano', 'Eu já tenho apelido.'], ['luizfernando', 'Mas não tem círculo.'], ['helano', 'O sertão é meu círculo.']] },

    // ---------- Zé Neto e os diagnósticos ----------
    { id: 'zeneto1', requer: ['zeneto', 'miguel'], falas: [['miguel', 'Doutor, tô com uma dor aqui do lado.'], ['zeneto', '{lista:zenetoDiagnosticos}'], ['miguel', 'Mas eu só bati na cerca.'], ['zeneto', 'Então é cerca. Evita cerca.']] },
    { id: 'zeneto2', requer: ['zeneto', 'daniel'], falas: [['zeneto', 'Daniel, tu sorri muito perto do fogo. Isso tem nome.'], ['daniel', 'Hehe.'], ['zeneto', 'O nome é "hehe". Grave. Sem cura.']] },
    { id: 'zeneto3', requer: ['zeneto', 'davi'], falas: [['davi', 'Zé Neto, o bode falou comigo de novo.'], ['zeneto', 'Febre?'], ['davi', 'Não. O bode tava bem.'], ['zeneto', 'Tô falando de tu, Davi.']] },
    { id: 'zeneto4', requer: ['zeneto', 'hugo'], falas: [['hugo', 'Doutor, a pistola de prego tá travando.'], ['zeneto', 'Já tentou boldo?'], ['hugo', 'Na pistola?'], ['zeneto', 'Na pistola, no motor, em tudo. Boldo é universal.']] },
    { id: 'zeneto5', requer: ['zeneto', 'joaopedro'], falas: [['zeneto', 'João Pedro, essa zoada do escapamento tá te deixando surdo.'], ['joaopedro', 'O QUÊ?'], ['zeneto', 'Pois. Confirmado.']] },
    { id: 'zeneto6', requer: ['zeneto', 'helano'], falas: [['zeneto', 'Lapuca, tu fala por enigma. Isso é sintoma.'], ['helano', 'De quê?'], ['zeneto', 'De sabedoria crônica. Sem tratamento.'], ['helano', 'Graças a Deus.']] },
    { id: 'zeneto7', requer: ['zeneto', 'joaocarlos'], falas: [['joaocarlos', 'Doutor, quantas cervejas por dia é saudável?'], ['zeneto', 'Depende. Quantas tu toma?'], ['joaocarlos', 'Depende do primo.'], ['zeneto', 'Diagnóstico: excesso de primo.']] },

    // ---------- Lapuca encerrando discussões ----------
    { id: 'lapuca1', requer: ['helano', 'miguel', 'joaopedro'], falas: [['miguel', 'O cubismo é a arte mais importante do mundo.'], ['joaopedro', 'A arte mais importante é o escapamento aberto.'], ['miguel', 'Isso é barulho, não é arte!'], ['joaopedro', 'Barulho é arte que se ouve!'], ['helano', '{lista:lapucaFrases}'], ['miguel', '...faz sentido.']] },
    { id: 'lapuca2', requer: ['helano', 'davi', 'joaopedro'], falas: [['davi', 'Meu plano é melhor.'], ['joaopedro', 'Teu plano é se esconder dentro do bode.'], ['davi', 'E é infalível!'], ['helano', '{lista:lapucaFrases}'], ['davi', 'Viu? Até o Lapuca concorda.'], ['helano', 'Eu não disse isso.']] },
    { id: 'lapuca3', requer: ['helano', 'hugo', 'daniel'], falas: [['hugo', 'Daniel, tu queimou meu arame.'], ['daniel', 'Hehe.'], ['hugo', 'Isso não é resposta!'], ['helano', '{lista:lapucaFrases}'], ['hugo', 'Tá. Mas ele me deve arame.']] },
    { id: 'lapuca4', requer: ['helano', 'vander'], falas: [['vander', 'Lapuca. Eu vi uma coisa ontem.'], ['helano', 'Eu também.'], ['vander', 'A mesma coisa?'], ['helano', 'Toda coisa é a mesma coisa vista de outro lado.'], ['vander', '...vou sumir um pouco.']] },
    { id: 'lapuca5', requer: ['helano', 'joaovitor'], falas: [['joaovitor', 'Lapuca, me vende uma profecia?'], ['helano', 'Profecia não se vende.'], ['joaovitor', 'Aluga, então?'], ['helano', 'Toma uma de graça: tu vai morrer devendo.'], ['joaovitor', 'Essa eu já sabia.']] },

    // ---------- Davi e os planos infalíveis ----------
    { id: 'davi1', requer: ['davi', 'miguel'], falas: [['davi', '{lista:daviPlanos}'], ['miguel', 'Davi, quantos planos teus já funcionaram?'], ['davi', 'Todos. Só que no futuro.']] },
    { id: 'davi2', requer: ['davi', 'hugo'], falas: [['davi', 'Hugo, tu consegue fazer uma máquina de tirar excesso?'], ['hugo', 'Consigo. Arame, prego e fé.'], ['davi', 'Faz uma pra mim e uma pro bode.'], ['hugo', 'O bode não precisa. O bode já é o excesso.']] },
    { id: 'davi3', requer: ['davi', 'vander'], falas: [['davi', 'Vander, tu some e aparece. Isso é plano?'], ['vander', 'É jeito.'], ['davi', 'Me ensina?'], ['vander', 'Já ensinei. Tu não viu.']] },

    // ---------- Miguel, arte e carne ----------
    { id: 'miguel1', requer: ['miguel', 'daniel'], falas: [['miguel', 'Daniel, posa pra mim? Vou fazer teu retrato cubista.'], ['daniel', 'Pega fogo?'], ['miguel', 'O quadro? Não!'], ['daniel', 'Então não.']] },
    { id: 'miguel2', requer: ['miguel', 'joaopedro', 'daniel'], seNao: 'miguel_confessou', falas: [['joaopedro', 'Alguém sabe quem comeu a carne de sol da Tia Zane?'], ['miguel', 'Carne? Que carne?'], ['daniel', 'Hehe.'], ['miguel', 'Daniel, para de sorrir pra mim.']] },
    { id: 'miguel3', requer: ['miguel', 'joaopedro'], se: 'miguel_confessou', falas: [['joaopedro', 'E aí, Miguel, ainda com fome?'], ['miguel', 'Nunca mais como carne de sol. Só se for de graça.'], ['joaopedro', 'A da Tia Zane era de graça.'], ['miguel', 'Ela não achou que era.']] },
    { id: 'miguel4', requer: ['miguel', 'hugo'], falas: [['miguel', 'Hugo, tu consegue fazer uma moldura pra um quadro de três metros?'], ['hugo', 'Com o quê?'], ['miguel', 'Com a cerca do vizinho.'], ['hugo', 'Consigo. Mas tu explica pro vizinho.']] },

    // ---------- João Pedro e o escapamento (e os dois candidatos) ----------
    { id: 'jp1', requer: ['joaopedro', 'helano'], falas: [['helano', 'João Pedro, tu vota em quem?'], ['joaopedro', 'No Lula e no Bolsonaro. Os dois. Lado a lado no altar.'], ['helano', 'Não pode votar nos dois.'], ['joaopedro', 'Pode não, mas eu rezo pros dois. Equilíbrio.'], ['helano', 'O sertão é estranho.']] },
    { id: 'jp2', requer: ['joaopedro', 'miguel'], noite: true, falas: [['joaopedro', 'Duas da manhã. Hora boa de acelerar a moto.'], ['miguel', 'Tu vai acordar a serra inteira.'], ['joaopedro', 'A serra que lute.']] },
    { id: 'jp3', requer: ['joaopedro', 'joaocarlos'], falas: [['joaocarlos', 'João Pedro, teu escapamento acordou minha tia ontem.'], ['joaopedro', 'Ela gostou?'], ['joaocarlos', 'Ela rezou um terço pra tua moto quebrar.'], ['joaopedro', 'Não funcionou. A moto também reza.']] },

    // ---------- Hugo e as gambiarras ----------
    { id: 'hugo1', requer: ['hugo', 'joaocarlos'], falas: [['joaocarlos', 'Hugo, conserta a geladeira do bar do Stelo?'], ['hugo', 'O que é que ela tem?'], ['joaocarlos', 'Esquenta.'], ['hugo', 'Então ela não é geladeira. É forno. Tá funcionando.']] },
    { id: 'hugo2', requer: ['hugo', 'daniel'], falas: [['hugo', 'Daniel, se eu fizer um ventilador e tu acender o fogo...'], ['daniel', 'Parede de fogo.'], ['hugo', 'Eu ia dizer churrasco.'], ['daniel', 'Hehe. Parede de fogo.']] },
    { id: 'hugo3', requer: ['hugo', 'vander'], falas: [['vander', 'Hugo. Essa torre de prego vai cair.'], ['hugo', 'Tu viu num sonho?'], ['vander', 'Vi agora. Tá caindo.'], ['hugo', 'Ninguém olha muito pra ela que ela fica em pé.']] },

    // ---------- Daniel ----------
    { id: 'daniel1', requer: ['daniel', 'davi'], mata: true, falas: [['davi', 'Daniel, promete que não vai botar fogo na serra?'], ['daniel', 'Prometo.'], ['davi', 'Jura?'], ['daniel', 'Hehe.'], ['davi', 'Isso não é jurar!']] },
    { id: 'daniel2', requer: ['daniel', 'vander'], falas: [['daniel', 'Vander. Tu tem medo de fogo?'], ['vander', 'Tenho medo de quem não tem medo de fogo.'], ['daniel', 'Hehe.'], ['vander', 'Exatamente isso.']] },

    // ---------- Vander ----------
    { id: 'vander1', requer: ['vander', 'miguel'], noite: true, falas: [['vander', 'Miguel. O Tio Ota passou por aqui.'], ['miguel', 'Quando?'], ['vander', 'Faz quarenta anos. O rastro ainda tá aqui.'], ['miguel', 'Tu tá me arrepiando.']] },
    { id: 'vander2', requer: ['vander', 'joaopedro'], falas: [['joaopedro', 'Vander, como é que tu some assim?'], ['vander', 'Eu não sumo. Vocês que param de olhar.'], ['joaopedro', 'Eu tô olhando agora.'], ['vander', '...'], ['joaopedro', 'CADÊ ELE?']] },

    // ---------- João Vitor ----------
    { id: 'jv1', requer: ['joaovitor', 'hugo'], falas: [['joaovitor', 'Hugo, quanto tu cobra pra consertar uma promessa?'], ['hugo', 'Promessa de quem?'], ['joaovitor', 'Minha. Pro Stelo. Eu prometi pagar.'], ['hugo', 'Essa não tem conserto.']] },
    { id: 'jv2', requer: ['joaovitor', 'miguel'], falas: [['joaovitor', 'Miguel, me vende um quadro teu? Fiado.'], ['miguel', 'Arte não se vende fiado.'], ['joaovitor', 'Então me dá. Arte é de todos.'], ['miguel', '...esse argumento é bom. Odeio isso.']] },

    // ---------- João Carlos e a família ----------
    { id: 'jc1', requer: ['joaocarlos', 'davi'], falas: [['joaocarlos', 'Davi, tu é primo de quem mesmo?'], ['davi', 'Do João Pedro.'], ['joaocarlos', 'E o João Pedro é primo do Gojoba, que é meu primo. Então tu é meu primo.'], ['davi', 'E o bode?'], ['joaocarlos', 'O bode é primo de todo mundo.']] },
    { id: 'jc2', requer: ['joaocarlos', 'zeneto'], falas: [['joaocarlos', 'Zé Neto, a família inteira vai na festa amanhã.'], ['zeneto', 'Quantas pessoas?'], ['joaocarlos', 'Umas trezentas.'], ['zeneto', 'Vou levar mais boldo.']] },

    // ---------- reações à história ----------
    { id: 'caipora1', requer: ['helano'], mata: true, falas: [['helano', 'A mata tá quieta demais.'], ['lider', 'Isso é bom?'], ['helano', 'É a Caipora prestando atenção.']] },
    { id: 'tiazane1', requer: ['miguel', 'davi'], se: 'tia_zane_respeitada', falas: [['davi', 'A Tia Zane até que é gente boa, né?'], ['miguel', 'Ela me deu um prato de comida ontem.'], ['davi', 'Depois de te dar uma chinelada.'], ['miguel', 'O prato compensou.']] },
    { id: 'paulo1', requer: ['joaopedro'], se: 'paulo_aliado', falas: [['joaopedro', 'Quem diria, o Paulo do Zé Baixinho do nosso lado.'], ['lider', 'Ele ainda acha que é presidente de alguma coisa.'], ['joaopedro', 'Do Roma. E do pênalti perdido de 2009.']] },
    { id: 'gojoba1', requer: ['joaocarlos'], se: 'gojoba_vencido', falas: [['joaocarlos', 'O Gojoba mandou dizer que tá sem caixa de som.'], ['lider', 'Graças a Deus.'], ['joaocarlos', 'Mas comprou um apito.'], ['lider', 'Ai, meu Deus.']] },
    { id: 'botija1', requer: ['helano', 'miguel'], se: 'botija_achada', falas: [['miguel', 'Lapuca, o que tu vai fazer com a tua parte da botija?'], ['helano', 'A botija não é minha. É de Santa Isabel.'], ['miguel', 'Mas e a minha parte?'], ['helano', 'Também é de Santa Isabel.'], ['miguel', 'Tô começando a não gostar dessa botija.']] },
    { id: 'cds1', requer: ['joaovitor', 'helano'], fases: ['ato3_festa'], falas: [['joaovitor', 'Esse Rafael CDs promete muito, né?'], ['helano', 'Promessa sem chão é nuvem sem chuva.'], ['joaovitor', 'Eu prometo muito também.'], ['helano', 'Por isso tu também não chove.']] }
  ];
})();
