/* =========================================================
   MAPA: Açudinho, curral do Tio Ota e casa do Dudu (Interlúdio)
   A Noite da Pipoca. O açude quase seco a noroeste, o curral do
   Tio Ota a nordeste (4 sinais de proteção nos mourões), a casa
   do Dudu a sudeste e a fogueira no meio.
   Legenda dos tiles: ver js/world/maps/terreiro.js e js/render/tiles.js
   Coordenadas das entidades em TILES.
   ========================================================= */
BSI.data.maps.acudinho = {
  nome: 'Açudinho do Tio Ota',
  noite: true,
  ambiente: 0.3,
  luaCheia: true,
  vagalumes: 18,
  semWeb: true,
  // durante a luta com a alma, a noite fica um breu
  escuroSe: { flag: 'alma_luta', semFlag: 'alma_derrotada', ambiente: 0.04, horario: 'terror' },
  linhas: [
    'PPTPTPTPTPPPTTPPPPPPPPTPPTPPTPTPPPPPPTPTPPTTPP',
    'PTTTPPT.P...T,T....T.,TPPPT.P.,PTP.P.P..PPPPPP',
    'PP.,,,....,....,....,..,........,.,..,......PP',
    'TP.....,.,...,.,,,,,.,..,,.....x...,..T....,,P',
    'PP.x,x.........,,,,,..T.,,..CCCCCCCCCCCCC...,T',
    'TT..,,.T...M...........,..,,C......T....C,,,,P',
    'TP......T~~~~~~~...,,...M...C...........C..,PP',
    'PP,,...~~~~~~~~~~~....,.....CM..........C....P',
    'P.TT.M~~~~~~~~~~~~~.,.......C...........C....P',
    'PP.T..~~~~~~~~~.~~~.T.....,.C...........C...TP',
    'P...,.~~~~~~~.M...~.,...,,..C...........C,,T.T',
    'P.....T~~~~~~~~.~~..,..,.,.,C....T......C.T.,P',
    'P..,M....~~~~~~~....,...,..,C........T..C...PP',
    'TP...T..................,,..CCCCCC..CCCCC..,,T',
    'P.......,.,T.,,.,,......,,.....,^^^^,,,....,PP',
    'TP,T,...,...,M,...,..,.,.....^^^^^..,,......PP',
    'TT..,.....,..M.,..,,,,......^^,.,,........,.PP',
    'PP..,....,..........T^^^^....,....,.,....,T..P',
    'P..............,....^^^,.,..,,.,..,,,,.,,....T',
    'PT^^^^^^^^^^^^^.....^,..,.,.,,..T.,..,.......T',
    'PP^^...,..,T.,....,.^^^..x....,...,.......,.PP',
    'TP.,.,,..,.,.,......,^^^^,...,,,......,....,PP',
    'PP......,,.....,,......^^^.....#########.,.,TP',
    'P...,,,...,......,,......^^^...#########.....P',
    'PP,.......,T,..,..,,,....,,^^^.#########.,.,PP',
    'P,...,.......,..M.......,.,.^^^#########.,T,xP',
    'P..,........,.,..,.......,.MT,^####p####..,T,T',
    'PP...M......M...,,,,......,...,=========....PT',
    'P...,,.....,....,..,,.....,....T..^...T,.....T',
    'P..,.,,,,.........TT...,.....,,..,,...,...,.TP',
    'T.........,.....,..,..,..M,.,..,M,....,T,.,.PP',
    'PP,,.,,.,....,,.....,...T....,.,,..,....,....P',
    'PTP.Px.T,,...P.P..T,P.TPT...P...PPTPPTPPPPT.PT',
    'PTPPPPTPPPPPPPPPPPTTPTPPPTTTPPTPPPPPPPTTPPPPPP'
  ],
  inicio: { x: 16, y: 20 },
  portas: [],
  entidades: [
    { tipo: 'checkpoint', x: 18, y: 18 },
    { tipo: 'gatilho', x: 18, y: 17, fases: ['interludio'], semFlag: 'pipoca_feita', dialogo: 'fogueira_pipoca' },
    { tipo: 'fogueira', x: 10, y: 26 },
    { tipo: 'fogueira', x: 26, y: 16 },
    { tipo: 'sinal', x: 27, y: 3 },
    { tipo: 'sinal', x: 41, y: 3 },
    { tipo: 'sinal', x: 27, y: 14 },
    { tipo: 'sinal', x: 41, y: 14 },
    { tipo: 'npc', id: 'boi', x: 33, y: 8, dialogo: 'boi_curral' },
    { tipo: 'npc', id: 'boi', x: 37, y: 10, dialogo: 'boi_curral' },
    { tipo: 'npc', id: 'boi', x: 31, y: 11, dialogo: 'boi_curral' },
    { tipo: 'npc', id: 'dudu', x: 36, y: 29, fases: ['amanhecer'], parado: true, dialogo: 'dudu_depois' },
    { tipo: 'chefe', id: 'alma', x: 36, y: 29 },
    { tipo: 'item', item: 'pilha', x: 22, y: 26 },
    { tipo: 'item', item: 'pilha', x: 6, y: 16 },
    { tipo: 'item', item: 'rapadura', x: 40, y: 20 },
    { tipo: 'item', item: 'municao', qtd: 4, x: 14, y: 28 },
    { tipo: 'decor', sprite: 'rede', x: 24, y: 8, dialogo: 'rede_tio_ota' }
  ]
};
