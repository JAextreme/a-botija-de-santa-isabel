/* =========================================================
   state.js — estado da partida: flags, medidores, segredo
   sorteado, munição, checkpoint. Tudo aqui é JSON puro e é o
   que vai pro localStorage.
   Medidores (0 a 100):
     raiva        RAIVA DA CAIPORA (sobe ao caçar/desrespeitar a mata)
     desconfianca DESCONFIANÇA NO GRUPO (mentira e traição)
     juizo        JUÍZO DO GRUPO (cai com caixa de som e pista falsa)
   ========================================================= */
(function () {
  'use strict';

  // Flags que existem no jogo (o validador reclama de flag fora desta lista)
  BSI.data.flagsConhecidas = [
    // decisivas para os finais
    'paulo_aliado', 'gojoba_bem_tratado', 'tia_zane_respeitada', 'confiou_felipe', 'irmaos_unidos',
    // prólogo
    'carne_assada_cedo', 'carne_guardada', 'mentiu_carne', 'falou_com_bode',
    'pegou_espingardas', 'pegou_cartucheira', 'chamou_cachorros', 'prologo_pronto',
    'botija_assumida', 'disfarce_cacada', 'contou_amadeus', 'escondeu_amadeus',
    // ato 1 — serra
    'subiu_alto', 'ato1_pode_descer', 'helano_caiu_golpe1', 'helano_resistiu_golpe1',
    'davi_boldo', 'davi_recusou_boldo', 'viu_desenho_pedra', 'oferenda_caipora', 'viu_vander_serra',
    // ato 1 — Paulo do Zé Baixinho
    'pagou_pedagio', 'enrolou_pedagio', 'brigou_pedagio', 'porteira_aberta',
    'paulo_respeitado', 'zombou_paulo', 'paulo_sem_garrafa',
    'paulo_esc_braco', 'paulo_esc_penaltis', 'paulo_esc_cachaca',
    'paulo_venceu_braco', 'paulo_venceu_penaltis', 'paulo_venceu_cachaca',
    'paulo_paz', 'paulo_derrotado', 'paulo_cobrado', 'ato1_completo',
    // interlúdio — a noite da pipoca
    'pipoca_feita', 'pipoca_perfeita', 'pipoca_queimada', 'ouviu_coronel',
    'alma_luta', 'alma_derrotada',
    'zane_sentiu', 'escolheu_fugir', 'miguel_fugiu_zane', 'pego_pela_zane',
    'miguel_confessou', 'culpou_davi',
    // ato II — Santa Isabel e o Gojoba
    'falou_stelo', 'acreditou_et', 'acreditou_reptil', 'acreditou_cia', 'stelo_acertou',
    'jc_familia', 'jc_amigos', 'gojoba_luta', 'gojoba_vencido', 'queimou_caixa',
    'mapa_tapera', 'comprou_moto_felipe', 'recusou_felipe',
    // ato II — a tapera
    'gadernal_luta', 'diazepan_achado', 'aceitou_cafe', 'gadernal_calmo', 'irmaos_revelados', 'desconfiou_irmaos',
    'botija_achada', 'tapera_defendida', 'botija_roubada', 'ato2_completo',
    // ato III — a noite da festa
    'gerador_sabotado', 'botija_recuperada', 'stelo_ajudou', 'stelo_caos', 'zane_no_palanque', 'gojoba_aliado_festa',
    'roma_na_festa', 'ritual_tribo', 'fogueira_combinada', 'helano_preso', 'helano_resgatado', 'helano_desmascarou',
    'cds_luta', 'cds_fase2', 'cds_fase3', 'grande_fogueira', 'cds_derrotado', 'daniel_descontrolado', 'jogo_zerado'
  ];
  BSI.data.medidores = {
    raiva: { nome: 'Raiva da Caipora', inicial: 0 },
    desconfianca: { nome: 'Desconfiança no grupo', inicial: 0 },
    juizo: { nome: 'Juízo do grupo', inicial: 100 }
  };
  // Segredo sorteado no começo da partida (pistas espalhadas nas próximas etapas)
  BSI.data.segredos = [
    { id: 'joaovitor', peso: 3, texto: 'João Vitor "Miserável" vendia informação pro CDs desde o Ato 1.' },
    { id: 'vander', peso: 3, texto: 'Vander era sonâmbulo: os rastros e assobios do Ato 1 eram ele.' },
    { id: 'daniel', peso: 3, texto: 'Daniel sabia da botija desde criança. Cada fogo afasta a alma do coronel.' },
    { id: 'felipe', peso: 1, texto: 'Felipe Parceiro trabalha pro CDs.' }
  ];

  var Story = BSI.story = {
    novoJogo: function (semente) {
      semente = semente || ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
      BSI.rng = new BSI.RNG(semente);
      var f0 = BSI.data.fases[BSI.data.ordemFases[0]];
      var mapa = f0.mapa, ini = f0.chegada;
      var med = {};
      for (var k in BSI.data.medidores) med[k] = BSI.data.medidores[k].inicial;
      BSI.state = {
        versao: 2,
        semente: semente,
        segredo: BSI.rng.pickPeso(BSI.data.segredos).id,
        fase: BSI.data.ordemFases[0],
        objetivo: '',
        poder: 0,           // barra de poder de grupo (0-100)
        maximos: {},        // poderes máximos já usados por fase
        pistas: [],         // Caderno de Pistas
        eventos: {},        // eventos de história que já aconteceram
        suspeitaZane: 0,    // quanto a Tia Zane desconfia do ladrão de carne
        fumo: 0,
        mapa: mapa,
        checkpoint: { mapa: mapa, x: ini.x, y: ini.y, chave: null },
        flags: {},
        medidores: med,
        municao: 12,
        pilha: 100,
        rapaduras: 0,
        grupo: (f0.grupo || BSI.data.grupoInicial).slice(),
        lider: 0,
        vidas: {},
        coletados: {},
        stats: { cacas: 0, abates: 0, habilidades: 0, excessos: 0, golpes: 0, quedas: 0 },
        conquistas: {},
        tempo: 0,
        dificuldade: (BSI.save.cfg().dificuldade || 'cabra')
      };
      if (BSI.armas) BSI.armas.garantir();
      return BSI.state;
    },

    carregar: function (s) {
      BSI.state = s;
      BSI.rng = new BSI.RNG((s.semente + Math.floor(s.tempo)) >>> 0);
      // garante campos novos em saves antigos
      s.stats = s.stats || {}; s.coletados = s.coletados || {}; s.conquistas = s.conquistas || {};
      s.medidores = s.medidores || { raiva: 0, desconfianca: 0, juizo: 100 };
      s.fase = s.fase || BSI.data.ordemFases[0];
      s.pistas = s.pistas || []; s.eventos = s.eventos || {}; s.maximos = s.maximos || {};
      s.poder = s.poder || 0; s.fumo = s.fumo || 0; s.suspeitaZane = s.suspeitaZane || 0;
      if (BSI.armas) BSI.armas.garantir(); // save antigo ganha o arsenal novo (cartucho continua igual)
    },

    // muda um medidor e avisa no HUD
    medidor: function (nome, delta, motivo, silencioso) {
      var m = BSI.state.medidores;
      if (m[nome] === undefined) return;
      var antes = m[nome];
      m[nome] = BSI.util.clamp(antes + delta, 0, 100);
      var d = m[nome] - antes;
      if (!d) return;
      var info = BSI.data.medidores[nome];
      var bom = (nome === 'juizo') ? d > 0 : d < 0;
      if (BSI.hud) {
        if (silencioso) BSI.hud.medidorPisca(nome);
        else BSI.hud.medidorMudou(nome, d, motivo || (info.nome + (d > 0 ? ' +' : ' ') + d), bom);
      }
      if (nome === 'raiva' && d > 0) BSI.audio.sfx('assobio');
    },

    flag: function (nome, valor) { BSI.state.flags[nome] = valor === undefined ? true : valor; },
    tem: function (nome) { return !!BSI.state.flags[nome]; },

    // estado "doido" dos controles conforme o Juízo
    efeitoJuizo: function () {
      var j = BSI.state ? BSI.state.medidores.juizo : 100;
      return { inverter: j < 25, tremor: j < 60 ? (60 - j) / 60 * 1.2 : 0 };
    }
  };
})();
