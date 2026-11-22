/* =========================================================
   MAPA: Trilha do pé da serra (protótipo)
   Escuro de verdade: só se enxerga no raio das lanternas.
   - Jagunços patrulhando (o inimigo do protótipo).
   - Bolsão a leste fechado por garrancheira: só o fogo do Daniel abre.
   - Passagem escondida a sudeste: o Vander revela (debug: troque o grupo).
   - Pebas: caçar sobe a RAIVA DA CAIPORA.
   Legenda: ver terreiro.js
   ========================================================= */
BSI.data.maps.trilha = {
  nome: 'Trilha do Pé da Serra',
  noite: true,
  ambiente: 0.1,
  vagalumes: 16,
  linhas: [
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPP^^^^PPPPPPPPPPPPPPPPPP',
    'PPP,,,,,,PPPPPPP,,^^^^,,PPPPPP,,,,,,,PPP',
    'PP,,,M,,,,,PDP,,,,^^^,,,,,PP,,,,T,,,,,PP',
    'PP,,,,,,,,,,,,,,,,,^^,,,,,,,,,,,,,,,,,PP',
    'P,,,T,,,,,....,,,,,^^,,,,,,....,,,,,,,PP',
    'P,,,,,,,,.......,,,^^,,,,.........,,,,,P',
    'P,,x,,,..........^^^^^..........,,,GGGGP',
    'P,,,,,...........^^^^^...........,,G..DP',
    'P,,,,...T........^^^.......T.....,,G...P',
    'P,,,.............^^................G...P',
    'P,,..............^^..........,,,,,,G...P',
    'P,,,,,..........^^^.........,,,,,,,GGGGP',
    'P,,,,,,.........^^...........,,,,,,,,,,P',
    'PP,,,,...MM.....^^.....PPP.....,,,,,,,PP',
    'PP,,,,..........^^......P.........,,,,PP',
    'P,,,,,..........^^..........,,,,,,,,,,,P',
    'P,,T,,,.........^^^^.........,,,,,x,,,,P',
    'P,,,,,,,,..........^^.......,,,,,,,,,,,P',
    'P,,,,,,,,,,,.......^^......,,,,,,T,,,,,P',
    'P,,,M,,,,,,,,......^^.....,,,,,,,,,,,,,P',
    'P,,,,,,,,,,,,,.....^^....,,,,,,,,,,,,,,P',
    'PP,,,,,,,,,,,,,....^^...,,,,,,,,,,,,,PPP',
    'PPP,,,,,,,,,,,.....^^.....,,,,,,,,,,_.PP',
    'PPPP,,,,,,,,,......^^......,,,,,,,,PPPPP',
    'PPPPP,,,T,,,,......^^......,,,,,,,PPPPPP',
    'PPPPPP,,,,,,.......^^.......,,,,,PPPPPPP',
    'PPPPPPP,,,,,,......^^......,,,,,PPPPPPPP',
    'PPPPPPPP,,,,,,.....^^.....,,,,,PPPPPPPPP',
    'PPPPPPPPP,,,,,,....^^....,,,,,PPPPPPPPPP',
    'PPPPPPPPPPPPPPPPP..^^..PPPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPPPPPPPP^^PPPPPPPPPPPPPPPPPPP'
  ],
  inicio: { x: 19.5, y: 29 },
  luaCheia: true,
  mata: true,
  portas: [
    { x: 19, y: 31, w: 2, h: 1, para: 'terreiro', chegada: { x: 15.5, y: 2 } },
    { x: 18, y: 1, w: 4, h: 1, para: 'serra', chegada: { x: 24.5, y: 41 } }
  ],
  entidades: [
    { tipo: 'checkpoint', x: 22, y: 27 },
    { tipo: 'gatilho', x: 12, y: 3, dialogo: { miguel: 'pedra_miguel', padrao: 'pedra_outro' } },
    { tipo: 'gatilho', x: 38, y: 8, dialogo: { miguel: 'pedra_miguel2', padrao: 'pedra_outro' } },
    { tipo: 'inimigo', id: 'jagunco', x: 8, y: 10 },
    { tipo: 'inimigo', id: 'atirador', x: 26, y: 6 },
    { tipo: 'inimigo', id: 'jagunco', x: 29, y: 16 },
    { tipo: 'inimigo', id: 'jagunco', x: 10, y: 19 },
    { tipo: 'inimigo', id: 'atirador', x: 14, y: 4 },
    { tipo: 'animal', id: 'peba', x: 6, y: 22 },
    { tipo: 'animal', id: 'peba', x: 30, y: 21 },
    { tipo: 'item', item: 'municao', qtd: 4, x: 24, y: 9 },
    { tipo: 'item', item: 'rapadura', x: 12, y: 15 },
    { tipo: 'item', item: 'municao', qtd: 6, x: 36, y: 9 },
    { tipo: 'item', item: 'pilha', x: 37, y: 10 },
    { tipo: 'item', item: 'municao', qtd: 8, x: 37, y: 23 }
  ]
};
