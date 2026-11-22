/* =========================================================
   alvos.js — PRA ONDE O OBJETIVO APONTA (estrela no minimapa).
   Cada linha: se o texto do objetivo CONTÉM "trecho", o alvo é:
     { mapa, x, y }         ponto em tiles
     { mapa, dialogo }      a coisa/NPC com esse diálogo
     { mapa, npc }          o NPC com esse id
     { chefe: true }        o chefe que estiver no mapa
     { caixa: true }        a caixa de som do Gojoba
     { diazepan: true }     o Diazepan dormindo
     { plano: true }        o próximo passo do plano do Ato III
     null                   sem alvo (objetivo de luta)
   Se o alvo estiver em OUTRO mapa, a seta aponta pra porta certa.
   ========================================================= */
BSI.data.alvosObjetivo = [
  { trecho: 'espingardas e a cartucheira', alvo: { mapa: 'terreiro', dialogo: ['pegar_espingardas', 'pegar_cartucheira', 'chamar_cachorros'] } },
  { trecho: 'Suba a serra', alvo: { mapa: 'serra', x: 31, y: 11 } },
  { trecho: 'Desça a serra pela saída a leste', alvo: { mapa: 'terras_paulo', x: 23, y: 9 } },
  { trecho: 'Saia da grota', alvo: { mapa: 'terras_paulo', x: 23, y: 9 } },
  { trecho: 'porteira do pedágio', alvo: { mapa: 'terras_paulo', x: 23, y: 9 } },
  { trecho: 'campo do Roma', alvo: { mapa: 'campo_roma', x: 16, y: 10 } },
  { trecho: 'Derrote o Paulo', alvo: { chefe: true } },
  { trecho: 'assar a carne', alvo: { mapa: 'acudinho', dialogo: 'fogueira_pipoca' } },
  { trecho: 'Sobreviva à alma', alvo: { chefe: true } },
  { trecho: 'ABOIO', alvo: { chefe: true } },
  { trecho: 'bar do Stelo (oeste', alvo: { mapa: 'bar_stelo', npc: 'stelo' } },
  { trecho: 'Desliguem a caixa', alvo: { caixa: true } },
  { trecho: 'banheiro do bar', alvo: { mapa: 'bar_stelo', x: 20, y: 13 } },
  { trecho: 'Saia da cidade pela estrada a leste', alvo: { mapa: 'tapera', x: 16, y: 10 } },
  { trecho: 'até a tapera', alvo: { mapa: 'tapera', x: 16, y: 10 } },
  { trecho: 'Sobreviva ao Gadernal', alvo: { chefe: true } },
  { trecho: 'Acorde o rapaz', alvo: { diazepan: true } },
  { trecho: 'porão pela escada', alvo: { mapa: 'tapera', dialogo: 'cavar_botija' } },
  { trecho: 'Defenda a tapera', alvo: null },
  { trecho: 'sacristia', alvo: { mapa: 'praca_festa', dialogo: 'sacristia' } },
  { trecho: 'O plano:', alvo: { plano: true } },
  { trecho: 'Terminem o plano', alvo: { plano: true } },
  { trecho: 'promessas do Rafael', alvo: { chefe: true } },
  { trecho: 'ondas de capangas', alvo: null }
];
