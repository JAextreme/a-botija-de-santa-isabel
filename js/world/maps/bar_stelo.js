/* =========================================================
   MAPA: Bar do Stelo (Ato II) — arena do Gojoba
   Balcão no fundo, mesas (servem de proteção contra as ondas da
   caixa de som), o banheiro com os desenhos do Miguel a sudeste.
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   (novos: f chão de dentro, i parede caiada, k balcão, m mesa, e escada)
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.bar_stelo = {
  nome: 'Bar do Stelo',
  noite: true,
  ambiente: 0.78,
  horario: 'interior',
  semTelhado: true, // é por dentro: parede é parede, não telhado
  vagalumes: 0,
  semWeb: true,
  linhas: [
    '########################',
    '########################',
    '#ffkkkkkkkkkkkkffffffff#',
    '#ffffffffffffffffffffff#',
    '#ffffffffffffffffffffff#',
    '#ffffffffffffffffffffff#',
    '#fffmmfffmmffffffffffff#',
    '#ffffffffffffffffffffff#',
    '#ffffffffffffffmmffffff#',
    '#ffffffffffffffffffffff#',
    '#fffmmfffmmffffff#######',
    '#ffffffffffffffff#fffff#',
    '#ffffffffffffffffffffff#',
    '#ffffffffffffffff#fffff#',
    '#ffffffffffffffff#fffff#',
    '###########pp###########'
  ],
  inicio: {x: 11.5,y: 12.5},
  portas: [
    {x: 11,y: 14,w: 2,h: 1,para: 'santa_isabel',chegada: {x: 7.5,y: 15.5}}
  ],
  entidades: [
    {tipo: 'npc',id: 'stelo',x: 8,y: 3,parado: true,dialogo: 'stelo'},
    {tipo: 'chefe',id: 'gojoba',x: 12,y: 13},
    {tipo: 'caixa',x: 12,y: 4},
    {tipo: 'cabo',x: 2,y: 4},
    {tipo: 'cabo',x: 21,y: 4},
    {tipo: 'cabo',x: 2,y: 13},
    {tipo: 'gatilho',x: 20,y: 13,dialogo: {miguel: 'banheiro_miguel',padrao: 'banheiro_outro'}},
    {tipo: 'item',item: 'cachaca',x: 15,y: 3}
  ]
};
