/* =========================================================
   MAPA: Terreiro do alpendre (protótipo)
   2 da manhã, lua cheia. Casa de taipa, alpendre com rede,
   a moto do João Pedro, a fogueira e o bode.

   LEGENDA (ver js/render/tiles.js):
   .  terra          ^  trilha de piçarra   ,  mato seco (pega fogo)
   #  taipa          p  porta               =  piso do alpendre
   T  juazeiro       M  mandacaru           x  xique-xique
   P  pedra          D  pedra com desenho   G  garrancheira (pega fogo)
   C  cerca (pega fogo)   ~ água   B cinza   _ passagem escondida
   Coordenadas das entidades em TILES (x = coluna, y = linha).
   ========================================================= */
BSI.data.maps.terreiro = {
  nome: 'Terreiro do Alpendre',
  noite: true,
  ambiente: 0.55,          // lua cheia clareia bastante
  vagalumes: 6,
  linhas: [
    'PPPPPPPPPPPPPPP^^PPPPPPPPPPPPPPP',
    'PP,,,M,,,,....^^^^....,,,,,T,,PP',
    'C,,T,,,,.......^^.......,,,,,,,C',
    'C,,,,,.........^^.........,,M,,C',
    'C,x,...........^^............,,C',
    'C,,.......T....^^.....T........C',
    'C,.............^^..............C',
    'C..............^^..............C',
    'C.......,,.....^^.....,,.......C',
    'C......,,,,...^^^^...,,,,......C',
    'C.............^^^^.............C',
    'C.........................T....C',
    'C.============.................C',
    'C.============..........M......C',
    'C.#####p######......,,,........C',
    'C.############.....,,,,,.......C',
    'C.############....,,,,,,,......C',
    'C.############.....,,,,,.....T.C',
    'C...............,,,,,,.........C',
    'C,,x,,..........,,,,....x,,,,,,C',
    'C,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,C',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
  ],
  // onde o grupo aparece num jogo novo
  inicio: { x: 9, y: 12 },
  // saídas: retângulo em tiles → outro mapa
  luaCheia: true,
  semWeb: true,
  portas: [
    { x: 15, y: 0, w: 2, h: 1, para: 'trilha', chegada: { x: 19.5, y: 29 }, fase: 'ato1_cacada', requer: 'prologo_pronto', bloqueio: 'prologo_ainda_nao' }
  ],
  entidades: [
    // --- Prólogo: coisas da caçada e a turma no alpendre ---
    { tipo: 'decor', sprite: 'espingardas', x: 4, y: 13, semFlag: 'pegou_espingardas', dialogo: 'pegar_espingardas' },
    { tipo: 'decor', sprite: 'cartucheira', x: 11, y: 13, semFlag: 'pegou_cartucheira', dialogo: 'pegar_cartucheira' },
    { tipo: 'npc', id: 'trovao', x: 22, y: 11, semFlag: 'chamou_cachorros', dialogo: 'chamar_cachorros' },
    { tipo: 'npc', id: 'piaba', x: 23, y: 12, semFlag: 'chamou_cachorros', dialogo: 'chamar_cachorros' },
    { tipo: 'npc', id: 'joaovitor', x: 12, y: 9, fases: ['prologo'], parado: true, dialogo: 'amadeus_prologo' },
    { tipo: 'npc', id: 'joaoluiz', x: 13, y: 10, fases: ['prologo'], parado: true, dialogo: 'amadeus_prologo' },
    { tipo: 'npc', id: 'luizfernando', x: 11, y: 10, fases: ['prologo'], parado: true, dialogo: 'amadeus_prologo' },
    { tipo: 'npc', id: 'hugo', x: 19, y: 14, fases: ['prologo'], parado: true, dialogo: 'hugo_prologo' },
    { tipo: 'npc', id: 'joaocarlos', x: 26, y: 13, fases: ['prologo'], parado: true, dialogo: 'jc_prologo' },
    { tipo: 'item', item: 'fumo', x: 12, y: 19 },
    { tipo: 'checkpoint', x: 20, y: 10 },
    { tipo: 'npc', id: 'bode', x: 25, y: 6, dialogo: { davi: 'bode_davi', padrao: 'bode_outro' } },
    { tipo: 'decor', sprite: 'moto', x: 17, y: 13, solido: true, dialogo: { joaopedro: 'moto_jp', hugo: 'moto_hugo', padrao: 'moto_outro' } },
    { tipo: 'decor', sprite: 'rede', x: 6, y: 12, dialogo: { helano: 'rede_helano', padrao: 'rede_outro' } },
    { tipo: 'placa', x: 18, y: 2, dialogo: 'placa_trilha' },
    { tipo: 'item', item: 'municao', qtd: 4, x: 28, y: 4 },
    { tipo: 'item', item: 'rapadura', x: 5, y: 18 },
    { tipo: 'animal', id: 'peba', x: 24, y: 16 }
  ]
};
