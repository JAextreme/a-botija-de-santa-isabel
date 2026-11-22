/* =========================================================
   characters.js — CONTEÚDO: os 12 personagens jogáveis,
   as armas, os grupos e quem mais fala nos diálogos.
   Para mudar a aparência de alguém, mexa em "visual"
   (cabeca: curto|chapeu|palha|bone|boneTras|cacheado|arrepiado|
    liso|capuz|careca|coque|chapeuPreto;
    padrao: liso|metade|xadrez|listra|macacao|jaleco|vestido;
    extras: oculos|oculosEscuros|bigode|barba|faixa|estetoscopio|terco|colar;
    acessorio: celular|galao|caderno|chave|escapamento|carteira|maleta|panela|giz|copo|peixeira)
   ========================================================= */
(function () {
  'use strict';

  BSI.data.armas = {
    socaTempo: { nome: 'Espingarda soca-tempo', tipo: 'tiro', cd: 1.0, dano: 3, vel: 270, vida: 0.6, n: 1, espalha: 0, tremor: 2.5, som: 'tiro' },
    calibre20: { nome: 'Calibre 20 do Tio Ota', tipo: 'tiro', cd: 0.7, dano: 1, vel: 240, vida: 0.4, n: 4, espalha: 0.3, tremor: 2, som: 'tiro20' },
    peixeira: { nome: 'Peixeira', tipo: 'corpo', cd: 0.32, dano: 1, alcance: 13 },
    facao: { nome: 'Facão', tipo: 'corpo', cd: 0.45, dano: 2, alcance: 15 },
    maleta: { nome: 'Maleta de doutor', tipo: 'corpo', cd: 0.5, dano: 1, alcance: 12 },
    chave: { nome: 'Chave inglesa', tipo: 'corpo', cd: 0.4, dano: 1, alcance: 13 }
  };

  BSI.data.grupos = {
    amadeus: { nome: 'Tribo dos Amadeus', membros: ['joaovitor', 'joaoluiz', 'luizfernando'] },
    netos: { nome: 'Netos do Tio Ota', membros: ['miguel', 'daniel', 'joaopedro'] },
    familia: { nome: 'Família do Davi', membros: ['davi', 'joaopedro'] },
    alpendre: { nome: 'Turma do Alpendre', membros: ['helano', 'zeneto', 'vander', 'hugo', 'joaocarlos'] }
  };

  BSI.data.personagens = {
    helano: {
      nome: 'Helano', apelido: 'Lapuca', curto: 'Lapuca',
      visual: { pele: '#b07a4e', cabelo: '#1e140e', camisa: '#d8c8a0', calca: '#4a5a6a', chapeu: '#6a3e22', cabeca: 'chapeu', acessorio: 'celular' },
      vel: 58, arma: 'socaTempo', habilidade: 'tiroProfeta', grupos: ['alpendre'],
      descricao: 'Profeta do sertão. Fala pouco, acerta tudo. Fraqueza: web namorada.'
    },
    zeneto: {
      nome: 'Zé Neto', curto: 'Zé Neto',
      visual: { pele: '#d2a07a', cabelo: '#2b1d14', camisa: '#f4f1ea', camisa2: '#cfcac0', calca: '#3b4a6a', cabeca: 'curto', padrao: 'jaleco', extras: ['oculos', 'estetoscopio'], acessorio: 'maleta' },
      vel: 56, arma: 'maleta', habilidade: 'consulta', grupos: ['alpendre'],
      descricao: 'O "doutor". Dipirona e chá de boldo pra tudo. Desmaia se levar dano.'
    },
    joaovitor: {
      nome: 'João Vitor', apelido: 'Miserável', curto: 'Miserável',
      visual: { pele: '#e0b490', cabelo: '#2b1d14', camisa: '#f0d030', camisa2: '#2a8a3a', padrao: 'metade', calca: '#7ad0b8', chapeu: '#a8402a', cabeca: 'bone', extras: ['faixa', 'bigodinho'], faixa: '#7a2a1c', acessorio: 'carteira' },
      vel: 62, arma: 'peixeira', habilidade: 'labia', grupos: ['amadeus'],
      descricao: 'Mente com a cara mais lisa do mundo. Convence até jagunço.'
    },
    joaoluiz: {
      nome: 'João Luiz Amadeu', curto: 'João Luiz',
      visual: { pele: '#d8a882', cabelo: '#1a120c', camisa: '#2a9ad8', calca: '#4a3a2e', cabeca: 'liso', extras: ['faixa'], faixa: '#7a2a1c', acessorio: 'panela' },
      vel: 57, arma: 'facao', habilidade: 'lealdade', grupos: ['amadeus'],
      descricao: 'Leal à tribo acima de tudo. Escudo de tampa de panela.'
    },
    luizfernando: {
      nome: 'Luiz Fernando Amadeu', curto: 'Luiz Fernando',
      visual: { pele: '#e2b892', cabelo: '#2b1d14', camisa: '#6a1e2e', calca: '#2a2a30', cabeca: 'liso', extras: ['faixa', 'colar', 'bigodinho'], faixa: '#7a2a1c', acessorio: 'giz' },
      vel: 58, arma: 'socaTempo', habilidade: 'ritual', grupos: ['amadeus'],
      descricao: 'Guardião dos rituais secretos da Tribo dos Amadeus.'
    },
    joaopedro: {
      nome: 'João Pedro', curto: 'João Pedro',
      visual: { pele: '#c08858', cabelo: '#2b1d14', camisa: '#c0303a', camisa2: '#3a8a3a', padrao: 'metade', calca: '#2f3a5a', chapeu: '#2a2a33', cabeca: 'boneTras', acessorio: 'escapamento' },
      vel: 63, arma: 'calibre20', habilidade: 'escapamento', grupos: ['netos', 'familia'],
      descricao: 'Neto do Tio Ota. Escapamento aberto às 2 da manhã. Altar com os dois candidatos lado a lado.'
    },
    davi: {
      nome: 'Davi', curto: 'Davi',
      visual: { pele: '#e2b48a', cabelo: '#b8904a', camisa: '#efe8d2', calca: '#5a4030', cabeca: 'liso', olhos: 'sono' },
      vel: 66, arma: 'peixeira', habilidade: 'tirarExcesso', grupos: ['familia'],
      descricao: 'Fala com bicho, tem um plano infalível (que falha) e grita "TIRAR O EXCESSO!".'
    },
    vander: {
      nome: 'Vander', curto: 'Vander',
      visual: { pele: '#e2b48e', cabelo: '#111111', camisa: '#2a2438', calca: '#1e1a28', chapeu: '#1e1a2a', cabeca: 'capuz', olhos: 'sono', extras: ['terco'] },
      vel: 60, arma: 'facao', habilidade: 'visao', grupos: ['alpendre'],
      descricao: 'Aparece e some. Sonha com o futuro. A reza dele afasta alma.'
    },
    miguel: {
      nome: 'Miguel', curto: 'Miguel',
      visual: { pele: '#e6bc96', cabelo: '#2a1a10', camisa: '#f4f4f0', camisa2: '#f0b088', padrao: 'listra', calca: '#3b4a6a', cabeca: 'arrepiado', extras: ['oculos'], acessorio: 'caderno' },
      vel: 70, arma: 'peixeira', habilidade: 'rouboMadrugada', grupos: ['netos'],
      descricao: 'Artista incompreendido e ladrão oficial da carne da Tia Zane.'
    },
    hugo: {
      nome: 'Hugo', curto: 'Hugo',
      visual: { pele: '#e0b088', cabelo: '#1a120c', camisa: '#b02a32', camisa2: '#f0d0d8', padrao: 'xadrez', calca: '#1e2a4a', cabeca: 'arrepiado', acessorio: 'chave' },
      vel: 57, arma: 'chave', habilidade: 'gambiarra', grupos: ['alpendre'],
      descricao: 'Mecânico da gambiarra. A Bros dele vive quebrando.'
    },
    daniel: {
      nome: 'Daniel', curto: 'Daniel',
      visual: { pele: '#e0b48c', cabelo: '#4a2e1c', camisa: '#f2f2f2', camisa2: '#1a1a1a', padrao: 'listra', calca: '#2a2a33', cabeca: 'arrepiado', extras: ['mascara'], acessorio: 'galao' },
      vel: 60, arma: 'facao', habilidade: 'fogo', grupos: ['netos'],
      descricao: 'Neto do Tio Ota. Querosene e fósforo. Sorri enquanto tudo queima.'
    },
    joaocarlos: {
      nome: 'João Carlos', curto: 'João Carlos',
      visual: { pele: '#b07a4e', cabelo: '#3a2416', camisa: '#a8402a', camisa2: '#e0c27a', padrao: 'xadrez', calca: '#4a3a2e', chapeu: '#e0c27a', cabeca: 'palha', extras: ['bigode'], acessorio: 'copo' },
      vel: 58, arma: 'peixeira', habilidade: 'conversa', grupos: ['alpendre'],
      descricao: 'Parente do Gojoba. O único que às vezes consegue lidar com ele.'
    }
  };

  // Ordem padrão (debug e tela de seleção)
  BSI.data.ordemPersonagens = ['helano', 'zeneto', 'joaovitor', 'joaoluiz', 'luizfernando', 'joaopedro', 'davi', 'vander', 'miguel', 'hugo', 'daniel', 'joaocarlos'];

  // Grupo ativo do protótipo
  BSI.data.grupoInicial = ['joaopedro', 'miguel', 'daniel', 'davi', 'helano', 'zeneto'];

  // Quem fala nos diálogos além dos jogáveis (NPCs)
  BSI.data.falantes = {
    narrador: { nome: '' },
    bode: { nome: 'O Bode', bicho: 'bode' },
    jagunco: { nome: 'Jagunço', visual: { pele: '#a87048', cabelo: '#1a120c', camisa: '#5a5a62', calca: '#2a2a33', chapeu: '#1a1a20', cabeca: 'chapeuPreto', extras: ['oculosEscuros'] } },
    boi: { nome: 'Boi', bicho: 'boi' },
    trovao: { nome: 'Trovão', bicho: 'trovao' },
    piaba: { nome: 'Piaba', bicho: 'piaba' },
    torcedor: { nome: 'Torcedor do Roma', visual: { pele: '#b88050', cabelo: '#2b1d14', camisa: '#a8302a', camisa2: '#1a1a20', padrao: 'listra', calca: '#3a3a44', chapeu: '#1a1a20', cabeca: 'bone', acessorio: 'copo' } },
    // NPC novo: vaqueiro velho, amigo do Tio Ota
    seuchico: { nome: 'Seu Chico Vaqueiro', visual: { pele: '#9a6a48', cabelo: '#d8d0c0', camisa: '#8a5a2a', camisa2: '#6a4020', padrao: 'listra', calca: '#5a3a20', chapeu: '#7a4a2a', cabeca: 'chapeu', extras: ['bigode'] } },
    // Dudu: mora perto do curral e do açudinho; viu a alma e sabe mais do que conta
    dudu: { nome: 'Dudu', visual: { pele: '#a87048', cabelo: '#8a8a8a', camisa: '#3b5b8c', camisa2: '#253a5e', padrao: 'xadrez', calca: '#5a4030', chapeu: '#e0c27a', cabeca: 'palha', extras: ['barba'] } },
    // ---- Santa Isabel (Ato II) ----
    stelo: { nome: 'Stelo', visual: { pele: '#c08858', cabelo: '#2b1d14', camisa: '#f2e6c9', camisa2: '#d0c6b0', padrao: 'listra', calca: '#3a3a44', cabeca: 'careca', extras: ['bigode'], acessorio: 'celular' } },
    felipe: { nome: 'Felipe Parceiro', visual: { pele: '#d6a47c', cabelo: '#1e140e', camisa: '#f0de8a', calca: '#2f3a5a', cabeca: 'curto', boca: 'sorriso', extras: ['oculos'], acessorio: 'celular' } },
    socorro: { nome: 'Dona Socorro da Bodega', visual: { pele: '#b88050', cabelo: '#4a4a4a', camisa: '#c45a8a', camisa2: '#a04070', padrao: 'vestido', calca: '#c45a8a', cabeca: 'coque', extras: ['oculos'], acessorio: 'caderno' } },
    padre: { nome: 'Padre Anselmo', visual: { pele: '#d2a07a', cabelo: '#8a8a8a', camisa: '#1e1a28', camisa2: '#2a2438', padrao: 'jaleco', calca: '#1e1a28', cabeca: 'curto', extras: ['oculos', 'terco'] } },
    benedita: { nome: 'Dona Benedita Rezadeira', visual: { pele: '#8a5a3a', cabelo: '#e8e8e8', camisa: '#f2e6c9', camisa2: '#d8cdb0', padrao: 'vestido', calca: '#f2e6c9', cabeca: 'coque', extras: ['terco'] } },
    gojoba: { nome: 'Gojoba', visual: { pele: '#c48a5a', cabelo: '#2b1d14', camisa: '#e0c27a', camisa2: '#c4566a', padrao: 'xadrez', calca: '#5a4030', chapeu: '#e0c27a', cabeca: 'palha', extras: ['bigode'], acessorio: 'copo' } },
    gadernal: { nome: 'Emanuel "Gadernal"', visual: { pele: '#c8905e', cabelo: '#3a2416', camisa: '#8a8a7a', camisa2: '#6a6a5a', padrao: 'listra', calca: '#4a3a2e', cabeca: 'arrepiado', olhos: 'arregalado', extras: ['barba'] } },
    diazepan: { nome: 'Vinícius "Diazepan"', visual: { pele: '#c8905e', cabelo: '#3a2416', camisa: '#6a8fc4', camisa2: '#4a6fa4', padrao: 'xadrez', calca: '#6a8fc4', cabeca: 'cacheado', olhos: 'sono' } },
    tiazane: { nome: 'Tia Zane', visual: { pele: '#c8946a', cabelo: '#c8c4bc', camisa: '#6a8fc4', camisa2: '#4a6fa4', padrao: 'vestido', calca: '#6a8fc4', cabeca: 'coque', sapato: '#2a1a10' } }
  };
})();
