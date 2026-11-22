/* =========================================================
   MAPA: A Tapera do pé da serra (Ato II)
   Sala grande (arena do Gadernal), quarto, cozinha, corredor e o
   PORÃO pela escada (onde a botija está enterrada). Paredes caídas.
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   (novos: f chão de dentro, i parede caiada, k balcão, m mesa, e escada)
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.tapera = {
  nome: 'A Tapera',
  noite: true,
  ambiente: 0.12,
  ajusteLuz: -0.1,
  semTelhado: true, // tapera sem teto (caiu faz tempo)
  mata: true,
  vagalumes: 10,
  semWeb: true,
  linhas: [
    'PPPPPPTPPPTTPTTPTPTPPPTPPPPPTPPPPP',
    'P,P,.P,.P.P.PT.P.PP,.P,TT,T.,TPPPP',
    'PP.,,,...,,,.,x.........,...,.,,.T',
    'P..,,.######################..,.PP',
    'TP,..,#ffffffffffffff#fffff#,...TP',
    'PP..,.#ffffffffffffff#fffff#,.,.,P',
    'P,...,#ffffffffffffffffffff#M,..TP',
    'T.M..,#ffffffffffffffffffff#,...TP',
    'P.M.,.Bffffffffffffff#fffff#....PP',
    'TP,..,#ffffffffffffff#fffff#....TP',
    'P,,.M.#ffffffffffffff###f###x,,,PT',
    'TT...,#ffffffffffffff#fffff#,.,,,P',
    'P,....#ffffffffffffff#fffff#....PP',
    'P,...,#ffffffffffffff#fffff#,,,..P',
    'P..,,.#######ff#######fffffB.x...P',
    'TT.,..#fffffeeef#ffff#fffff#,...PP',
    'TP..M.#ffffffffffffffffffff#,...xP',
    'P.....#ffffffffffffffffffff#..,,.P',
    'T...,,#fffffffff#ffff#fffff#....PP',
    'P,.,,,#fffffffff#ffff#fffff#,,..TP',
    'TT,.,,###########^^^########.,..,P',
    'TT,,.,..,.,...,..^^^.....,,,,..,.P',
    'P,...,,,,M.......^^,.,,...,...,,,P',
    'T,.......,..,.,.,^^..,.,..,....,TT',
    'TP..........,.,,^^^,.,,..,,,.....P',
    'PP,,....,....,..^^^,.,,..,.....,,T',
    'P,...,.M....,...^^.M,,,,.M..,...PT',
    'P.,,..,...,,,,..^^..,.,,.,..,.,..P',
    'PP,TPTPPT,PPT...^^P..,PT.TPP,,,PTP',
    'PPTPTPPPPPPTPTPP^^TPPPPPPPPPPTPPPT'
  ],
  inicio: {x: 16.5,y: 26},
  portas: [
    {x: 16,y: 29,w: 2,h: 1,para: 'caminho_tapera',chegada: {x: 20.5,y: 2}}
  ],
  entidades: [
    {tipo: 'checkpoint',x: 16,y: 24},
    {tipo: 'npc',id: 'bode',x: 10,y: 25,dialogo: {davi: 'bode_tapera_davi',padrao: 'bode_outro'}},
    {tipo: 'decor',sprite: 'vela',x: 24,y: 6,luz: 40,dialogo: 'vela_tapera'},
    {tipo: 'decor',sprite: 'vela',x: 9,y: 16,luz: 34},
    {tipo: 'gatilho',x: 8,y: 4,dialogo: {miguel: 'desenhos_tapera',padrao: 'desenhos_tapera'}},
    {tipo: 'zona',x: 16,y: 4,w: 5,h: 10,evento: 'gadernal_chega'},
    {tipo: 'zona',x: 11,y: 12,w: 5,h: 2,evento: 'gadernal_chega'},
    {tipo: 'chefe',id: 'gadernal',x: 13,y: 8},
    {tipo: 'diazepan',x: 10,y: 11},
    {tipo: 'gatilho',x: 10,y: 18,comFlag: 'irmaos_revelados',semFlag: 'botija_achada',dialogo: 'cavar_botija'},
    {tipo: 'item',item: 'rapadura',x: 24,y: 15},
    {tipo: 'item',item: 'municao',qtd: 6,x: 25,y: 18},
    {tipo: 'item',item: 'pilha',x: 30,y: 24}
  ]
};
