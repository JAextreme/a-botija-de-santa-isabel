/* =========================================================
   MAPA: A Grota (Ato 1, desvio)
   Onde o grupo vai parar quando o Helano segue o "GPS" da
   web namorada. Breu quase total. Sobe pela trilha a noroeste.
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.grota = {
  nome: "A Grota",
  noite: true,
  ambiente: 0.05,
  ajusteLuz: -0.12, // a grota é funda: menos luar
  luaCheia: true,
  mata: true,
  vagalumes: 10,
  linhas: [
    'PP^^PPPPPPPPPPPPPPPPPPPPPP',
    'PP^^PPPPPPPPPPPPPPPPPPPPPP',
    'PP^^^^^PPPPPP,PPPPPPPPPPPP',
    'PPP^^^^^^^^^^^.....,...PPP',
    'PPP,.^^^^^^^^^.....,...PPP',
    'PPP.....,..P...,.......PPP',
    'PPP,.,...,,...,....,,..PPP',
    'PPP,.,,.PPP.,......,,...PP',
    'PPP....,.,..,,....,,..,.PP',
    'PP.,,.,....,,.......,...,P',
    'PPP...,...,...,......,..PP',
    'PPP.......,...,,.....,.,PP',
    'PPP......,....PP......xPPP',
    'PPP.....,.,.....,.~~~.,PPP',
    'PPP,,...,.......,,.~.,.PPP',
    'PPPPPPPP..,xx.....,PPPPPPP',
    'PPPPPPPPPPPPP.PPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPP'
  ],
  inicio: {x: 13,y: 4},
  portas: [
    {x: 2,y: 0,w: 2,h: 1,para: 'serra',chegada: {x: 39,y: 8}}
  ],
  entidades: [
    {tipo: 'inimigo',id: 'jagunco',x: 8,y: 10},
    {tipo: 'inimigo',id: 'atirador',x: 18,y: 11},
    {tipo: 'animal',id: 'moco',x: 6,y: 13},
    {tipo: 'item',item: 'pilha',x: 21,y: 4},
    {tipo: 'item',item: 'municao',qtd: 5,x: 4,y: 12},
    {tipo: 'item',item: 'rapadura',x: 12,y: 12},
    {tipo: 'decor',sprite: 'ossada',x: 16,y: 8,dialogo: 'ossada_jb'}
  ]
};
