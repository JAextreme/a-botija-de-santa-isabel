/* =========================================================
   MAPA: Santa Isabel (cidade) — Ato II, fim de tarde
   Igrejinha da padroeira (norte), bar do Stelo (oeste), bodega
   (leste), casa da rezadeira (sudoeste) e a praça no meio.
   A estrada a leste vai pro pé da serra (tapera).
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   (novos: f chão de dentro, i parede caiada, k balcão, m mesa, e escada)
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.santa_isabel = {
  nome: 'Santa Isabel',
  noite: true,
  ambiente: 0.62,
  vagalumes: 0,
  semWeb: true,
  linhas: [
    'PPTPPTPPTPTTPPTPPTPTPTPPTTPTPPPTPPTPTPTPPPTTPTPT',
    'PP.PP,,..TTPT...PPPTT...PP..T...PPPP.,.TP,P.TPTP',
    'PP.....,...T.....,,iiiiiiiiii.,.,...,....,..,..P',
    'TP..T,,....T.......iiiiiiiiii.......,.........PT',
    'PP..........T,.....iiiiiiiiii..M......,....,...P',
    'PP.......M.........iiiiiiiiii......T...,..,....P',
    'PP..........,....,.iiiiiiiiii.......T..T......TP',
    'TT.T......,........iiiiiiiiii...M..iiiiiiii...PP',
    'PP.#########.......iiiippiiii......iiiiiiii,..PP',
    'PP.#########...T...,.........,.....iiiiiiii.,.PP',
    'P,.#########..^^^^^^^^^^^^^^^^^^^^.iiiiiiii...PP',
    'TP,#########..^^^^^^^^^^^^^^^^^^^^.iiippiii...TP',
    'PP.#########,.^^^^^^^^^^^^^^^^^^^^,.....,.....TP',
    'PP.####pp###..^^^^^^^^^^^^^^^^^^^^...........,TP',
    'P.............^^^^^^^^^^^^^^^^^^^^........,....P',
    'T.,...........^^^^^^^^^^^^^^^^^^^^..,.^^.,.,...P',
    '^^^^^^.....^^^^^^^^^^^^^^^^^^^^^^^...,^^.......P',
    '^^^^^^^^...^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^...^^^^',
    'P..,..........^^^^^^^^^^^^^^^^^^^^^^^^^^^...^^^^',
    'PT..M.,..,....^^^^^^^^^^^^^^^^^^^^..M.........TP',
    'PP...T....,...^^^^^^^^^^^^^^^^^^^^,,..,.,......P',
    'P.............^^^^^^^^^^^^^^^^^^^^.....,......TP',
    'PT..#######.....,...,.,^^T..,M...,............PP',
    'TP..#######.M..........^^...........#######...TT',
    'PP,.#######.,..........^^.,.........#######...PP',
    'PT..#######..,,...,....^^M...,......#######..,PP',
    'PP.,###p###...,######..^^..######...#######...TP',
    'PT..T.....,....######.T^^..######...###p###..,.T',
    'PP....T....,...######..^^,.######,...,..,.,.,.PP',
    'T.....,......,.######......######..,..........PP',
    'P......,..T....,...T..........,.,,.T..,.,.....PT',
    'P........T...,..,.........,...............,....P',
    'P...P...PPTTPPPPPPPP..P^^PP..TPP.PTTPPPPPP...P.T',
    'PPTPTTPTPPTPPPPPTTPPPTP^^PPPPPPTPTTTPPPTTTTTTPTT'
  ],
  inicio: {x: 24,y: 30},
  portas: [
    {x: 7,y: 14,w: 2,h: 1,para: 'bar_stelo',chegada: {x: 11.5,y: 12.5}},
    {x: 47,y: 17,w: 1,h: 2,para: 'caminho_tapera',chegada: {x: 1.5,y: 14.5},fase: 'ato2_tapera',requer: 'mapa_tapera',bloqueio: 'sem_mapa_tapera'}
  ],
  entidades: [
    {tipo: 'checkpoint',x: 27,y: 14},
    {tipo: 'npc',id: 'padre',x: 23,y: 10,parado: true,dialogo: 'padre'},
    {tipo: 'npc',id: 'socorro',x: 38,y: 13,parado: true,dialogo: 'bodega'},
    {tipo: 'npc',id: 'benedita',x: 8,y: 28,parado: true,dialogo: 'rezadeira'},
    {tipo: 'npc',id: 'felipe',x: 42,y: 18,parado: true,dialogo: 'felipe'},
    {tipo: 'decor',sprite: 'moto',x: 44,y: 20,dialogo: 'moto_felipe'},
    {tipo: 'npc',id: 'bode',x: 17,y: 19,dialogo: {davi: 'bode_cidade_davi',padrao: 'bode_outro'}},
    {tipo: 'zona',x: 18,y: 13,w: 5,h: 4,evento: 'circulo_et',comFlag: 'acreditou_et'},
    {tipo: 'placa',x: 12,y: 20,dialogo: 'placa_festa'},
    {tipo: 'item',item: 'rapadura',x: 31,y: 20}
  ]
};
