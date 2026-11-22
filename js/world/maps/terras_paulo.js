/* =========================================================
   MAPA: Terras do Paulo do Zé Baixinho (Ato 1)
   Pasto com gado, a casa do presidente do Roma e a PORTEIRA
   DO PEDÁGIO (tiles C na coluna 27, linhas 10-11; o evento abre).
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.terras_paulo = {
  nome: "Terras do Paulo do Zé Baixinho",
  noite: true,
  ambiente: 0.3,
  luaCheia: true,
  vagalumes: 8,
  linhas: [
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPCPPPPPPPPPPPPPPPP',
    'PPPPPPP,,.....PPPPPPPM..,..CPPPPPP.,.,..T,PP',
    'P.,..M..,,,T..,,.........,,C,,,#########,,.P',
    'P.,.,...,.....,.........,,,C...#########.,.P',
    'P.....,,...........T..,,,..C.,M#########.,.P',
    'P,..,...,.,M,.,...,........C.,,########...,P',
    'P,..,...,.,.,.,,....,....T.C..,####p###...,P',
    'P.......,,......,T..,......C...==^^^===...PP',
    'P...T,...........T..,....,,C...^^^^^,,.,T.PP',
    'PP,..,..,..,,......,,.T....C.^^^^^^,...,,TPP',
    '^^^^^^^^^^^^^^^^^^^^^^^^^^^C^^^^^,..,,..,.PP',
    '^^^...^^^^^^^^^^^^^...^^^^^C^^^..,.......,PP',
    'PP....,..,.,,,..,.....,.,,.C.^^,,,,.......PP',
    'PP........M,,,..,..........C......,.....TMPP',
    'PP.,,..,,,,.,.,........,,.,C,...,.,,...,,,TP',
    'PP..T...CCCCCCC..CCCCCC,.,,C......,.,.,..,.P',
    'P.,.....C.............C..,,C,^.....,.,...,,P',
    'P.T.,...C.............C....C,^.....T.,..,..P',
    'P.,,,...C.............C....C.^^.,M.....T.,.P',
    'P.,..,..C.............C,...C,^^...,...M.,.,P',
    'P,..,...C.............C....C.^^,..,....,..PP',
    'P.,..,,.C.............C,.,.C.^^.,,........PP',
    'PP,.,,.,C.............C...TC.^^.......,...PP',
    'PP.,..,,C.............C.,T,C,^^^^^^^^^^^^^^^',
    'PP.....,C.............C..,,C.^^^^^^^^^^^^^^^',
    'PP.M...,CCCCCCCCCCCCCCC....C,..,.....,.,..PP',
    'PP,...............,,,..,..,C,,,.....,.,...PP',
    'PP..........,,,....,,,,..,.C..MM....,...,..P',
    'PP..,..,......,..,,....,...C...,......,,...P',
    'PP......,...T.,,,T...,...,.C,.,,....,,....,P',
    'PPPPP.T.,....PPPPPPT....T.PCPPPPPP..,,,,PPPP',
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPCPPPPPPPPPPPPPPPP'
  ],
  inicio: {x: 1.5,y: 10.5},
  portas: [
    {x: 0,y: 10,w: 1,h: 2,para: 'serra',chegada: {x: 47,y: 14.5}},
    {x: 43,y: 23,w: 1,h: 2,para: 'campo_roma',chegada: {x: 2,y: 10.5}}
  ],
  entidades: [
    {tipo: 'zona',x: 23,y: 8,w: 3,h: 6,evento: 'porteira_pedagio'},
    {tipo: 'checkpoint',x: 30,y: 14},
    {tipo: 'npc',id: 'seuchico',x: 6,y: 6,dialogo: 'seuchico'},
    {tipo: 'npc',id: 'boi',x: 12,y: 18,dialogo: 'boi'},
    {tipo: 'npc',id: 'boi',x: 18,y: 22,dialogo: 'boi'},
    {tipo: 'npc',id: 'boi',x: 20,y: 17,dialogo: 'boi'},
    {tipo: 'placa',x: 22,y: 6,dialogo: 'placa_pedagio'},
    {tipo: 'placa',x: 16,y: 4,segredo: 'felipe',dialogo: 'pista_felipe_placa'},
    {tipo: 'inimigo',id: 'bebado',x: 14,y: 8},
    {tipo: 'inimigo',id: 'bebado',x: 20,y: 12},
    {tipo: 'inimigo',id: 'bebado',x: 31,y: 16},
    {tipo: 'inimigo',id: 'bebado',x: 36,y: 20},
    {tipo: 'inimigo',id: 'bebado',x: 10,y: 28},
    {tipo: 'item',item: 'municao',qtd: 4,x: 38,y: 12},
    {tipo: 'item',item: 'rapadura',x: 34,y: 26},
    {tipo: 'item',item: 'cachaca',x: 40,y: 6}
  ]
};
