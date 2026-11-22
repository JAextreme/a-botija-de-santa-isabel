/* =========================================================
   MAPA: Caminho da tapera (Ato II) — noite
   A trilha longa (cheia de capangas do CDs) e o ATALHO DO
   FELIPE PARCEIRO, fechado por cerca: só abre se o grupo confiou
   nele (ver "trocasSe").
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   (novos: f chão de dentro, i parede caiada, k balcão, m mesa, e escada)
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.caminho_tapera = {
  nome: 'Caminho da Tapera',
  noite: true,
  ambiente: 0.15,
  luaCheia: false,
  mata: true,
  vagalumes: 14,
  linhas: [
    'TPPTPPTPPPTPPPPPPTP^^^^PPPPPPPPPPTTPPTPP',
    'TP,TPTP.,.PT,.TTPPP^^^^T,P....PP,PT..PPP',
    'P,.....,,.,.T.,...^^^^^^,.,.,,M.,..,,.PP',
    'P...,.,.....,,,.,.^^^.^^^^,.,,....,...,P',
    'P,...,...,.,.,,,..^^T,.^^^^,,....,.,,.PP',
    'T.,,,,PPPT..Tx,.^^^^T.,.^^^^^,,M.,....TP',
    'TT.,,.PPPP.,.x,...^,.,,.P^^^^^.,,,PP,T.P',
    'PP....PPPT.,,.^........,M..^^^^,.PPPP,,P',
    'TP...,.,,..,.^^...,..,T,,.,T^^^,.PPPP,PP',
    'PP.,..,.,...^^^^....,........^^^PPPPP,PP',
    'PPPPPPPPPPP^^^PPP...M..,,,...^^^PPPPP..P',
    'TPPPPPPPPCCCCPPPP,.T,.,,.,.,.,^^..,...TP',
    'PPPPPPPPP^^PPPPPP.,.,.,,......^^.PP.,.TP',
    'TT....,,^^^..,,..,,.,.T...x.,.^^^PP...PT',
    '^^^^^^^^^^,..,.,,.,,.x,x..,,,,^^^,...,TP',
    '^^^^^^^^^^.x....,...,.T.,.,,,,,^^,.,.,PP',
    'PP,,..,^^^^,.,,..,....,x,,,,,.^^^,..,.PT',
    'T,.,...,^^^^.,x,.......,,,,,^^^^,,....,P',
    'PTT,,.,..^^^^,.,,......x,,,^^^^P,..,,.PT',
    'PP.,,....,^^^^..,.....,..T^^^^PP.,,,...T',
    'P........,.^^^.,.T,.,..,.^^^^,PP,,,,.,PT',
    'PP.,....,,.,^^^^^^^^,x.,^^^^,.PPP.....TP',
    'P,...,.,,,..P^^^^^^^^^^^^^^..,,PP....,.P',
    'PP.,,.,.T,,,......^^^^^^^^..,..PP....,PT',
    'PP..,,.,.,..,x,,,,....,.,,,,.,,,PPP.,,,P',
    'T,,,..,.,,T,,,.,.,...,...,,..,..,T,,,,PP',
    'PPPTPT.PP,PxT,TTMP.TTPPPPPTPPTT,P..,TTTP',
    'TPPPTPPPTTPTPPTTPPPPPPPPPPPPPPPPPPPPPPPP'
  ],
  inicio: {x: 1.5,y: 14.5},
  trocasSe: [
    {flag: 'confiou_felipe',ch: '^',tiles: [[9,11],[10,11],[11,11],[12,11]]}
  ],
  portas: [
    {x: 0,y: 14,w: 1,h: 2,para: 'santa_isabel',chegada: {x: 45.5,y: 17.5}},
    {x: 20,y: 0,w: 2,h: 1,para: 'tapera',chegada: {x: 16.5,y: 26}}
  ],
  entidades: [
    {tipo: 'checkpoint',x: 26,y: 22},
    {tipo: 'placa',x: 6,y: 13,dialogo: 'placa_atalho'},
    {tipo: 'inimigo',id: 'jagunco',x: 14,y: 22},
    {tipo: 'inimigo',id: 'atirador',x: 20,y: 18},
    {tipo: 'inimigo',id: 'jagunco',x: 31,y: 12},
    {tipo: 'inimigo',id: 'jagunco',x: 34,y: 22},
    {tipo: 'inimigo',id: 'atirador',x: 26,y: 6},
    {tipo: 'animal',id: 'peba',x: 6,y: 20},
    {tipo: 'animal',id: 'avoante',x: 16,y: 7},
    {tipo: 'item',item: 'municao',qtd: 5,x: 24,y: 23},
    {tipo: 'item',item: 'pilha',x: 32,y: 16}
  ]
};
