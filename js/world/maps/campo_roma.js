/* =========================================================
   MAPA: Campo do Roma (Ato 1) — arena do Paulo do Zé Baixinho
   3 da manhã. Linhas de cal (L), arquibancada (b), cerca de
   varas em volta (pega fogo!) e quatro postes de luz fraca.
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.campo_roma = {
  nome: "Campo do Roma",
  noite: true,
  ambiente: 0.22,
  luaCheia: true,
  vagalumes: 4,
  linhas: [
    'PPPPPPbbbbbbbbbbbbbbbbbbPPPPPP',
    'PCCCCCbbbbbbbbbbbbbbbbbbCCCCCP',
    'PC..........................CP',
    'PC.LLLLLLLLLLLLLLLLLLLLLLLL.CP',
    'PC.L...........L..........L.CP',
    'PC.L...........L..........L.CP',
    'PC.L...........L..........L.CP',
    'PC.LLLL........L.......LLLL.CP',
    'PC.L..L.......LLL......L..L.CP',
    'PC.L..L......L...L.....L..L.CP',
    '^^^L..L......L.L.L.....L..L.CP',
    '^^^L..L......L.L.L.....L..L.CP',
    'PC.L..L......L...L.....L..L.CP',
    'PC.L..L.......LLL......L..L.CP',
    'PC.LLLL........L.......LLLL.CP',
    'PC.L...........L..........L.CP',
    'PC.L...........L..........L.CP',
    'PC.L...........L..........L.CP',
    'PC.LLLLLLLLLLLLLLLLLLLLLLLL.CP',
    'PC..........................CP',
    'PCCCCCCCCCCCCCCCCCCCCCCCCCCCCP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPP'
  ],
  inicio: {x: 2,y: 10.5},
  portas: [
    {x: 0,y: 10,w: 1,h: 2,para: 'terras_paulo',chegada: {x: 41,y: 23.5}}
  ],
  entidades: [
    {tipo: 'zona',x: 4,y: 6,w: 3,h: 10,evento: 'paulo_intro'},
    {tipo: 'chefe',id: 'paulo',x: 16,y: 10.5},
    {tipo: 'decor',sprite: 'trave',x: 2.5,y: 11},
    {tipo: 'decor',sprite: 'trave',x: 27.5,y: 11,espelho: true},
    {tipo: 'decor',sprite: 'poste',x: 2,y: 3,luz: 58},
    {tipo: 'decor',sprite: 'poste',x: 27,y: 3,luz: 58},
    {tipo: 'decor',sprite: 'poste',x: 2,y: 19,luz: 58},
    {tipo: 'decor',sprite: 'poste',x: 27,y: 19,luz: 58},
    {tipo: 'item',item: 'municao',qtd: 4,x: 5,y: 4},
    {tipo: 'item',item: 'municao',qtd: 4,x: 24,y: 17},
    {tipo: 'item',item: 'rapadura',x: 24,y: 4}
  ]
};
