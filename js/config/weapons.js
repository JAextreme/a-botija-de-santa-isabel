/* =========================================================
   config/weapons.js — O ARSENAL (pode mexer à vontade)
   Campos de cada arma:
     cat       : 'fogo' | 'corpo' | 'arremesso'
     raridade  : 'comum' | 'boa' | 'rara' | 'lendaria'
     dano, cd (segundos entre golpes/tiros)
     alcance   : corpo a corpo (pixels) / arremesso (distância máx.)
     vel, vida : tiro (velocidade e duração do projétil)
     n, espalha: quantos projéteis e o leque (radianos)
     pente, recarga (s), mun (tipo de munição; null = infinita)
     kb        : empurrão · barulho: raio que chama inimigos
                 (na mata, barulho alto sobe a Raiva da Caipora)
     especial  : comportamento extra (ver js/entities/armas.js)
     descricao : aparece na tela de equipamento
   ========================================================= */
(function () {
  'use strict';
  var BSI = window.BSI = window.BSI || {};
  BSI.config = BSI.config || {};

  BSI.config.armas = {
    // ================= DE FOGO E DE LONGE =================
    socaTempo: { nome: 'Espingarda soca-tempo', cat: 'fogo', raridade: 'boa', dano: 3, cd: 1.0, vel: 270, vida: 0.6, n: 4, espalha: 0.22, pente: 1, recarga: 2.6, mun: 'cartucho', kb: 140, barulho: 260, tremor: 2.5, som: 'tiro', descricao: 'Tiro forte em cone. Recarga lenta e barulhenta: socar a pólvora leva tempo.' },
    calibre20: { nome: 'Calibre 20 do Tio Ota', cat: 'fogo', raridade: 'rara', dano: 1.2, cd: 0.55, vel: 250, vida: 0.45, n: 4, espalha: 0.3, pente: 2, recarga: 1.6, mun: 'cartucho', kb: 90, barulho: 200, tremor: 2, som: 'tiro20', descricao: 'Equilibrada. Dois canos, a herança do avô.' },
    pressao: { nome: 'Espingarda de pressão', cat: 'fogo', raridade: 'comum', dano: 0.8, cd: 0.4, vel: 300, vida: 0.5, n: 1, espalha: 0.03, pente: 6, recarga: 0.8, mun: 'chumbinho', kb: 30, barulho: 40, tremor: 0.5, som: 'estalo', descricao: 'Fraca, mas silenciosa. Recarga rápida.' },
    baladeira: { nome: 'Baladeira', cat: 'fogo', raridade: 'comum', dano: 1, cd: 0.5, vel: 230, vida: 0.55, n: 1, espalha: 0.05, pente: 1, recarga: 0.35, mun: null, kb: 50, barulho: 20, tremor: 0, som: 'estalo', tipoProj: 'pedra', descricao: 'Pedra não acaba. Ninguém ouve. Arma de menino danado.' },
    pistolaPrego: { nome: 'Pistola de prego do Hugo', cat: 'fogo', raridade: 'boa', dano: 0.6, cd: 0.11, vel: 320, vida: 0.4, n: 1, espalha: 0.12, pente: 14, recarga: 1.4, mun: 'prego', kb: 15, barulho: 120, tremor: 0.4, som: 'estalo', tipoProj: 'prego', especial: { trava: 0.06 }, descricao: 'Rajada rápida. Às vezes trava (o Hugo destrava na hora).' },
    rojao: { nome: 'Rojão da festa', cat: 'fogo', raridade: 'rara', dano: 4, cd: 1.2, alcance: 140, pente: 1, recarga: 1.8, mun: 'rojao', kb: 200, barulho: 320, tremor: 4, som: 'fogo', especial: { arco: true, explode: 26 }, descricao: 'Sobe em arco e explode onde cair. O São João adiantado.' },

    // ================= CORPO A CORPO =================
    peixeira: { nome: 'Peixeira', cat: 'corpo', raridade: 'comum', dano: 1, cd: 0.28, alcance: 13, kb: 40, barulho: 10, especial: { combo: 1.5 }, descricao: 'Rápida. O terceiro golpe do combo é o mais forte.' },
    facao: { nome: 'Facão', cat: 'corpo', raridade: 'comum', dano: 2, cd: 0.45, alcance: 16, kb: 80, barulho: 15, especial: { varios: true }, descricao: 'Acerta todo mundo na frente.' },
    foice: { nome: 'Foice', cat: 'corpo', raridade: 'boa', dano: 2, cd: 0.7, alcance: 20, kb: 90, barulho: 15, especial: { giro: true }, descricao: 'Giro em volta do corpo. Corta mato e cabra safado.' },
    enxada: { nome: 'Enxada', cat: 'corpo', raridade: 'comum', dano: 3, cd: 0.9, alcance: 16, kb: 260, barulho: 25, descricao: 'Lenta. Joga longe.' },
    pa: { nome: 'Pá', cat: 'corpo', raridade: 'comum', dano: 0.8, cd: 0.55, alcance: 15, kb: 120, barulho: 25, especial: { cava: true }, descricao: 'Fraca, mas é a única que CAVA. Boa pra botija.' },
    relho: { nome: 'Relho de vaqueiro', cat: 'corpo', raridade: 'boa', dano: 1, cd: 0.5, alcance: 34, kb: -160, barulho: 40, especial: { puxa: true }, descricao: 'Estala longe e PUXA o inimigo pra perto.' },
    laco: { nome: 'Laço de vaqueiro', cat: 'corpo', raridade: 'boa', dano: 0.5, cd: 1.0, alcance: 40, kb: 0, barulho: 10, especial: { prende: 2.5 }, descricao: 'Prende o cabra no lugar uns segundos.' },
    maleta: { nome: 'Maleta de doutor', cat: 'corpo', raridade: 'comum', dano: 1, cd: 0.5, alcance: 12, kb: 70, barulho: 15, descricao: 'Pesada de tanto remédio vencido.' },
    chave: { nome: 'Chave inglesa', cat: 'corpo', raridade: 'comum', dano: 1, cd: 0.4, alcance: 13, kb: 60, barulho: 20, descricao: 'Aperta parafuso e cabeça dura.' },
    cadeira: { nome: 'Cadeira de bar', cat: 'corpo', raridade: 'comum', dano: 2.5, cd: 0.8, alcance: 16, kb: 180, barulho: 60, especial: { bar: true }, descricao: 'De plástico, do bar do Stelo. Arma de bar.' },
    tacoSinuca: { nome: 'Taco de sinuca', cat: 'corpo', raridade: 'boa', dano: 1.5, cd: 0.45, alcance: 22, kb: 110, barulho: 20, especial: { bar: true }, descricao: 'Longo. Bola sete na caçapa do meio. Arma de bar.' },

    // ================= ARREMESSO =================
    garrafa: { nome: 'Garrafa de cachaça', cat: 'arremesso', raridade: 'comum', dano: 2, cd: 0.7, alcance: 110, mun: 'garrafa', kb: 60, barulho: 60, especial: { arco: true, explode: 14, bar: true, pegaFogo: true }, descricao: 'Espatifa. Se o Daniel acender, vira fogo.' },
    traque: { nome: 'Traque', cat: 'arremesso', raridade: 'comum', dano: 0.5, cd: 0.5, alcance: 100, mun: 'traque', kb: 40, barulho: 160, especial: { arco: true, explode: 16, atordoa: 1.5 }, descricao: 'Pá-pá-pá! Atordoa quem estiver perto.' },
    bomba: { nome: 'Bomba de São João', cat: 'arremesso', raridade: 'boa', dano: 2, cd: 0.9, alcance: 110, mun: 'bomba', kb: 160, barulho: 300, especial: { arco: true, explode: 28, atordoa: 3 }, descricao: 'BUM! Atordoa e assusta até o santo.' },
    pedra: { nome: 'Pedra', cat: 'arremesso', raridade: 'comum', dano: 1, cd: 0.45, alcance: 100, mun: null, kb: 50, barulho: 15, multiplas: true, especial: { arco: true }, descricao: 'Infinita. O sertão tem pedra que não acaba mais.' },
    farinha: { nome: 'Saco de farinha', cat: 'arremesso', raridade: 'boa', dano: 0, cd: 0.9, alcance: 95, mun: 'farinha', kb: 0, barulho: 20, especial: { arco: true, nuvem: 'cega', raio: 30, dur: 4 }, descricao: 'Nuvem branca: quem estiver dentro fica cego e anda à toa.' },
    pimenta: { nome: 'Pimenta malagueta', cat: 'arremesso', raridade: 'boa', dano: 0.5, cd: 0.8, alcance: 95, mun: 'pimenta', kb: 0, barulho: 20, especial: { arco: true, nuvem: 'tosse', raio: 26, dur: 4 }, descricao: 'Os cabras tossem e correm sem rumo.' },

    // ================= LENDÁRIAS =================
    chinela: { nome: 'A CHINELA DA TIA ZANE', cat: 'arremesso', raridade: 'lendaria', dano: 3, cd: 0.6, alcance: 130, mun: null, kb: 180, barulho: 30, especial: { bumerangue: true, critico: 1 }, requer: { flag: 'tia_zane_respeitada' }, descricao: 'Crítico garantido. Volta pra mão como bumerangue.' },
    caixaSom: { nome: 'A CAIXA DE SOM DO GOJOBA', cat: 'fogo', raridade: 'lendaria', dano: 0.5, cd: 1.6, alcance: 70, pente: 1, recarga: 1.0, mun: null, kb: 120, barulho: 400, tremor: 3, som: 'escapamento', especial: { sonica: 70, juizo: true }, requer: { flag: 'gojoba_bem_tratado' }, descricao: 'Onda sonora em volta: os inimigos perdem o JUÍZO.' },
    bracoPaulo: { nome: 'O BRAÇO DO PAULO', cat: 'corpo', raridade: 'lendaria', dano: 6, cd: 0.8, alcance: 15, kb: 380, barulho: 40, especial: { derruba: true }, requer: { flag: 'paulo_aliado' }, descricao: 'Uma luva gigante. Derruba qualquer capanga num soco só.' },
    lampiao: { nome: 'O LAMPIÃO DO TIO OTA', cat: 'fogo', raridade: 'lendaria', dano: 1, cd: 0.9, alcance: 60, pente: 1, recarga: 0.6, mun: 'querosene', kb: 60, barulho: 10, tremor: 1, som: 'fogo', especial: { luz: 60, queimaAlma: 8 }, requer: { flag: 'alma_derrotada' }, so: ['miguel', 'daniel', 'joaopedro'], descricao: 'Luz forte que queima almas. Só os netos do Tio Ota sabem acender.' }
  };

  BSI.config.raridades = {
    comum: { nome: 'comum', cor: '#d8cdb0' },
    boa: { nome: 'boa', cor: '#7ad07a' },
    rara: { nome: 'rara', cor: '#6ab0f0' },
    lendaria: { nome: 'LENDÁRIA', cor: '#f0c75e' }
  };

  // munições (cartucho continua sendo o contador antigo: BSI.state.municao)
  BSI.config.municoes = {
    cartucho: { nome: 'cartucho', max: 60 },
    chumbinho: { nome: 'chumbinho', max: 120 },
    prego: { nome: 'prego', max: 200 },
    rojao: { nome: 'rojão', max: 6 },
    querosene: { nome: 'querosene', max: 20 },
    garrafa: { nome: 'garrafa', max: 8 },
    traque: { nome: 'traque', max: 12 },
    bomba: { nome: 'bomba de São João', max: 6 },
    farinha: { nome: 'saco de farinha', max: 5 },
    pimenta: { nome: 'pimenta', max: 8 }
  };

  // ★ bônus / ✗ penalidade de cada um (o jogo aplica em js/entities/armas.js)
  BSI.config.afinidades = {
    helano: { bom: ['socaTempo', 'calibre20', 'pressao'], ruim: ['garrafa', 'traque', 'bomba'], texto: '★ Mestre das espingardas: menos espalhamento e mais crítico. ✗ Profeta não joga bomba.' },
    zeneto: { bom: ['pimenta', 'farinha'], ruim: ['socaTempo', 'calibre20', 'pressao', 'pistolaPrego'], texto: '★ Arremessos "medicinais" (pimenta, farinha) mais fortes. ✗ Mira tremida nas armas de fogo.' },
    joaovitor: { bom: [], ruim: [], texto: '★ Pechincha: pega munição extra no chão e paga menos na bodega.' },
    joaoluiz: { bom: ['peixeira', 'facao', 'maleta', 'chave', 'relho'], ruim: ['enxada', 'foice'], texto: '★ Arma de uma mão + escudo ao mesmo tempo. ✗ Arma de duas mãos derruba o escudo.' },
    luizfernando: { bom: [], ruim: [], texto: '★ Atirando de dentro do Ritual Amadeu: dano maior e o tiro atravessa.' },
    joaopedro: { bom: [], ruim: ['pressao', 'baladeira'], texto: '★ Arma barulhenta bate mais forte. ✗ Arma silenciosa? Sem graça.' },
    davi: { bom: [], ruim: [], texto: '★ Qualquer arma pode disparar um TIRAR O EXCESSO de surpresa.' },
    vander: { bom: [], ruim: [], texto: '★ Dano dobrado logo depois de ficar invisível.' },
    miguel: { bom: ['baladeira', 'pressao', 'peixeira'], ruim: ['bomba', 'rojao'], texto: '★ Mestre da baladeira e das armas silenciosas. ✗ Bomba chama atenção demais.' },
    hugo: { bom: ['pistolaPrego', 'chave'], ruim: [], texto: '★ Recarrega mais rápido e destrava arma na hora.' },
    daniel: { bom: ['garrafa', 'rojao', 'traque', 'bomba', 'lampiao'], ruim: ['farinha'], texto: '★ Tudo que pode pegar fogo pega fogo na mão dele.' },
    joaocarlos: { bom: ['garrafa', 'cadeira', 'tacoSinuca'], ruim: [], texto: '★ Armas de bar (garrafa, cadeira, taco de sinuca) batem bem mais.' }
  };

  // com o que cada um começa: [principal, secundária, arremesso]
  BSI.config.equipInicial = {
    helano: ['socaTempo', null, 'pedra'],
    zeneto: ['maleta', null, 'pimenta'],
    joaovitor: ['peixeira', null, 'pedra'],
    joaoluiz: ['facao', null, 'pedra'],
    luizfernando: ['socaTempo', null, 'pedra'],
    joaopedro: ['calibre20', null, 'traque'],
    davi: ['peixeira', null, 'pedra'],
    vander: ['facao', null, 'pedra'],
    miguel: ['peixeira', 'baladeira', 'pedra'],
    hugo: ['chave', 'pistolaPrego', 'pedra'],
    daniel: ['facao', null, 'garrafa'],
    joaocarlos: ['peixeira', null, 'garrafa']
  };
  // munição extra no começo (além dos cartuchos)
  BSI.config.municaoInicial = { chumbinho: 0, prego: 40, rojao: 0, querosene: 0, garrafa: 3, traque: 4, bomba: 0, farinha: 0, pimenta: 2 };

  // armas soltas pelos mapas (pegue com E): mapa, perto de qual ponto (tiles), arma
  BSI.config.armasNoMapa = [
    { mapa: 'terreiro', x: 28, y: 15, arma: 'enxada' },
    { mapa: 'terreiro', x: 4, y: 16, arma: 'pa' },
    { mapa: 'trilha', x: 8, y: 20, arma: 'foice' },
    { mapa: 'serra', x: 40, y: 34, arma: 'pressao', mun: { chumbinho: 30 } },
    { mapa: 'terras_paulo', x: 8, y: 8, arma: 'relho' },
    { mapa: 'terras_paulo', x: 34, y: 20, arma: 'laco' },
    { mapa: 'acudinho', x: 26, y: 26, arma: 'farinha', mun: { farinha: 3 } },
    { mapa: 'bar_stelo', x: 4, y: 12, arma: 'tacoSinuca' },
    { mapa: 'bar_stelo', x: 14, y: 9, arma: 'cadeira' },
    { mapa: 'santa_isabel', x: 40, y: 22, arma: 'bomba', mun: { bomba: 3 } },
    { mapa: 'caminho_tapera', x: 30, y: 10, arma: 'traque', mun: { traque: 4 } },
    { mapa: 'praca_festa', x: 40, y: 28, arma: 'rojao', mun: { rojao: 3 } }
  ];

  // OFICINA DO HUGO (nas fogueiras): nível → custo em sucata e o que melhora
  BSI.config.oficina = {
    niveis: [
      { custo: 3, mult: { dano: 1.25, recarga: 0.85 } },
      { custo: 6, mult: { dano: 1.5, recarga: 0.7, pente: 1.5 } }
    ],
    // nomes engraçados por nível (o primeiro serve de padrão)
    nomes: {
      socaTempo: ['Soca-tempo turbinada', 'Soca-tempo turbinada com farol de milha'],
      calibre20: ['Calibre 20 envernizada', 'Calibre 20 "Tio Ota aprovaria"'],
      pressao: ['Pressão com mola de colchão', 'Pressão com mola de colchão king size'],
      baladeira: ['Baladeira com mira de óculos do Zé Neto', 'Baladeira de câmara de pneu de caminhão'],
      pistolaPrego: ['Pistola de prego destravada (às vezes)', 'Pistola de prego com bênção do padre'],
      rojao: ['Rojão de doze tiros', 'Rojão de réveillon de Fortaleza'],
      peixeira: ['Peixeira amolada na pedra', 'Peixeira de Pasmado'],
      facao: ['Facão de três listras', 'Facão "corta-até-pensamento"'],
      enxada: ['Enxada com cabo de aroeira', 'Enxada que já viu três secas'],
      pa: ['Pá de bico', 'Pá de bico com detector de botija (não funciona)'],
      relho: ['Relho trançado', 'Relho trançado por vaqueiro de verdade'],
      laco: ['Laço de couro cru', 'Laço de campeão de vaquejada'],
      _padrao: ['%s melhorada', '%s caprichada']
    }
  };
})();
