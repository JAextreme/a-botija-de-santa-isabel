/* =========================================================
   audio.js — todos os sons são sintetizados com Web Audio.
   Nenhum arquivo de áudio: funciona em file:// e pesa nada.
   O navegador só libera o som depois do primeiro toque/tecla,
   por isso existe BSI.audio.destravar().
   ========================================================= */
(function () {
  'use strict';

  var ctx = null, mestre = null, ruidoBuf = null, geral = null, barras = {};
  var cfg = BSI.save.cfg();
  var ultimo = {}; // anti-metralhadora: limita repetição do mesmo som

  function criar() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      // mixagem (v1.0): geral -> Efeitos / Música / Ambiente, cada um com seu volume
      geral = ctx.createGain(); geral.connect(ctx.destination);
      ['efeitos', 'musica', 'ambiente'].forEach(function (b) { barras[b] = ctx.createGain(); barras[b].connect(geral); });
      mestre = barras.efeitos;
      aplicarVolume();
      // buffer de ruído branco reaproveitado (tiro, fogo, escapamento)
      var n = ctx.sampleRate * 1.5;
      ruidoBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      var d = ruidoBuf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }

  var PADRAO = { efeitos: 1, musica: 0.6, ambiente: 0.8 };
  function volBarra(b) { var v = cfg['vol_' + b]; return typeof v === 'number' ? v : PADRAO[b]; }
  function aplicarVolume() {
    if (!geral) return;
    geral.gain.value = cfg.mudo ? 0 : cfg.volume * 0.6;
    for (var b in barras) barras[b].gain.value = volBarra(b) * (b === 'musica' ? 0.55 : 1);
  }

  // ---- instrumentos da trilha (tempo absoluto, saída escolhida) ----
  function nota(f, t, dur, tipo, vol, out, ataque, filtro) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (ataque || 0.01));
    g.gain.setValueAtTime(vol, t + Math.max(ataque || 0.01, dur * 0.6)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var ultimoNo = o;
    if (filtro) { var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filtro; o.connect(fl); ultimoNo = fl; }
    ultimoNo.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.03);
    return o;
  }
  function bate(t, out, dur, vol, freq, tipo, freqFim) {
    var s = ctx.createBufferSource(); s.buffer = ruidoBuf;
    var f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.setValueAtTime(freq, t); if (freqFim) f.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  var INST = {
    zabumba: function (t, out, v, agudo) {
      if (agudo) { bate(t, out, 0.06, 0.25 * v, 1800, 'bandpass'); return; }
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
      g.gain.setValueAtTime(0.55 * v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.3);
      bate(t, out, 0.04, 0.12 * v, 600, 'lowpass');
    },
    triangulo: function (t, out, v, aberto) {
      nota(5200, t, aberto ? 0.3 : 0.06, 'sine', 0.05 * v, out, 0.002);
      nota(7900, t, aberto ? 0.22 : 0.05, 'sine', 0.025 * v, out, 0.002);
    },
    ganza: function (t, out, v) { bate(t, out, 0.07, 0.12 * v, 6000, 'highpass'); },
    caixa: function (t, out, v) { bate(t, out, 0.12, 0.3 * v, 2200, 'bandpass'); nota(220, t, 0.06, 'triangle', 0.1 * v, out, 0.002); },
    baixo: function (f, t, dur, out, v) { nota(f, t, dur, 'triangle', 0.32 * v, out, 0.01); nota(f * 2, t, dur * 0.5, 'sine', 0.06 * v, out, 0.01); },
    pifano: function (f, t, dur, out) {
      var o = nota(f * 2, t, Math.max(0.08, dur), 'sine', 0.1, out, 0.03);
      if (dur > 0.25) { var vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5.5; vg.gain.value = f * 0.012; vib.connect(vg); vg.connect(o.frequency); vib.start(t + 0.12); vib.stop(t + dur + 0.03); }
      bate(t, out, 0.04, 0.02, 3000, 'bandpass'); // sopro
    },
    sanfona: function (f, t, dur, out) {
      // duas palhetas levemente desafinadas (o "chorinho" da sanfona)
      nota(f, t, Math.max(0.08, dur), 'square', 0.045, out, 0.015, 1900);
      nota(f * 1.004, t, Math.max(0.08, dur), 'sawtooth', 0.03, out, 0.015, 1500);
      nota(f / 2, t, Math.max(0.08, dur), 'square', 0.018, out, 0.015, 900);
    },
    pad: function (f, t, dur, out) { nota(f, t, dur, 'triangle', 0.06, out, dur * 0.3); nota(f * 1.006, t, dur, 'sine', 0.05, out, dur * 0.35); },
    grilo: function (f, t, out) { nota(f, t, 0.035, 'square', 0.012, out, 0.003, 6000); }
  };

  // legendas de sons importantes (acessibilidade): o HUD mostra "[assobio na mata]"
  var LEGENDAS = {
    assobio: 'assobio na mata', alma: 'gemido de alma penada', aboio: 'aboio de vaqueiro ao longe', latido: 'cachorro latindo',
    celular: 'celular do Helano tocando', escapamento: 'ronco de moto de escapamento aberto', tiro: 'tiro', tiro20: 'tiro de espingarda',
    explosao: 'explosão', fogo: 'fogo pegando', mugido: 'mugido de vaca', bode: 'bode berrando', apito: 'apito', vidro: 'vidro quebrando',
    excesso: 'vinheta do excesso', buzina: 'buzina desafinada', alerta: 'alguém te viu!'
  };

  // ---- blocos básicos ----
  // tom: frequência inicial, final, duração, forma de onda, volume
  function tom(f0, f1, dur, tipo, vol, atraso) {
    if (!ctx) return;
    var t = ctx.currentTime + (atraso || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || 'square';
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(mestre);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // ruído filtrado: duração, volume, frequência do filtro, tipo do filtro
  function ruido(dur, vol, freq, tipoFiltro, atraso, freqFim) {
    if (!ctx) return;
    var t = ctx.currentTime + (atraso || 0);
    var s = ctx.createBufferSource(); s.buffer = ruidoBuf;
    var f = ctx.createBiquadFilter(); f.type = tipoFiltro || 'lowpass';
    f.frequency.setValueAtTime(freq || 1200, t);
    if (freqFim) f.frequency.exponentialRampToValueAtTime(freqFim, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(mestre);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  // ---- catálogo de efeitos ----
  var SONS = {
    tiro: function () { ruido(0.35, 0.6, 900, 'lowpass', 0, 120); tom(140, 40, 0.25, 'triangle', 0.4); },
    tiro20: function () { ruido(0.22, 0.5, 1800, 'lowpass', 0, 200); tom(220, 60, 0.15, 'square', 0.15); },
    estalo: function () { tom(900, 700, 0.05, 'square', 0.08); }, // sem munição
    facada: function () { ruido(0.12, 0.25, 3000, 'highpass', 0, 6000); },
    acerto: function () { tom(300, 90, 0.12, 'square', 0.18); ruido(0.08, 0.2, 1500); },
    dano: function () { tom(220, 70, 0.25, 'sawtooth', 0.22); },
    queda: function () { tom(300, 50, 0.6, 'triangle', 0.3); },
    pegar: function () { tom(660, 660, 0.07, 'square', 0.12); tom(990, 990, 0.1, 'square', 0.12, 0.07); },
    troca: function () { tom(440, 880, 0.08, 'triangle', 0.15); },
    menu: function () { tom(520, 520, 0.04, 'square', 0.08); },
    confirma: function () { tom(523, 523, 0.06, 'square', 0.12); tom(784, 784, 0.12, 'square', 0.12, 0.06); },
    blip: function () { tom(700 + Math.random() * 120, 0, 0.03, 'square', 0.04); },
    alerta: function () { tom(880, 1200, 0.12, 'square', 0.1); },
    cura: function () { tom(523, 523, 0.1, 'sine', 0.2); tom(659, 659, 0.1, 'sine', 0.2, 0.1); tom(784, 784, 0.2, 'sine', 0.2, 0.2); },
    falha: function () { tom(400, 300, 0.15, 'square', 0.12); tom(300, 150, 0.3, 'square', 0.12, 0.15); },
    fogo: function () { ruido(0.6, 0.35, 400, 'bandpass', 0, 2400); },
    crepita: function () { ruido(0.05, 0.05, 2500, 'highpass'); },
    salvar: function () { tom(392, 392, 0.1, 'triangle', 0.15); tom(523, 523, 0.1, 'triangle', 0.15, 0.1); tom(659, 659, 0.25, 'triangle', 0.15, 0.2); },
    morte: function () { ruido(0.3, 0.3, 600, 'lowpass', 0, 80); tom(180, 40, 0.4, 'square', 0.12); },
    tempoLento: function () { tom(300, 80, 0.8, 'sine', 0.25); },
    // ronco do escapamento aberto do João Pedro: serra + ruído pulsando
    escapamento: function () {
      if (!ctx) return;
      var t = ctx.currentTime, dur = 1.3;
      var o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(45, t);
      o.frequency.linearRampToValueAtTime(110, t + 0.5);
      o.frequency.linearRampToValueAtTime(70, t + dur);
      var lfo = ctx.createOscillator(); lfo.frequency.value = 28;
      var lg = ctx.createGain(); lg.gain.value = 0.25;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(mestre);
      o.start(t); lfo.start(t); o.stop(t + dur); lfo.stop(t + dur);
      ruido(1.0, 0.25, 300, 'lowpass', 0.05);
      for (var i = 0; i < 6; i++) ruido(0.05, 0.3, 2000, 'bandpass', 0.15 + i * 0.16); // pipocos
    },
    // "TIRAR O EXCESSO!" — acorde desafinado de vinheta
    excesso: function () {
      tom(262, 262, 0.3, 'square', 0.12); tom(330, 311, 0.3, 'square', 0.12);
      tom(392, 415, 0.3, 'square', 0.12); tom(523, 130, 0.5, 'sawtooth', 0.12, 0.3);
    },
    // assobio da Caipora (sobe a raiva)
    assobio: function () {
      if (!ctx) return;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1400, t);
      o.frequency.linearRampToValueAtTime(2200, t + 0.35);
      o.frequency.linearRampToValueAtTime(1300, t + 0.9);
      var vib = ctx.createOscillator(); vib.frequency.value = 7;
      var vg = ctx.createGain(); vg.gain.value = 40;
      vib.connect(vg); vg.connect(o.frequency);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      o.connect(g); g.connect(mestre);
      o.start(t); vib.start(t); o.stop(t + 1.05); vib.stop(t + 1.05);
    },
    // celular do Helano tocando (web namorada)
    celular: function () {
      for (var i = 0; i < 3; i++) { tom(1318, 1318, 0.07, 'square', 0.09, i * 0.18); tom(1760, 1760, 0.07, 'square', 0.09, i * 0.18 + 0.08); }
    },
    // aboio do vaqueiro (Tio Ota lá do curral): voz longa que sobe e cai
    aboio: function () {
      if (!ctx) return;
      var t = ctx.currentTime, dur = 2.6;
      [1, 1.5].forEach(function (mult, i) {
        var o = ctx.createOscillator(); o.type = i ? 'sine' : 'triangle';
        o.frequency.setValueAtTime(196 * mult, t);
        o.frequency.linearRampToValueAtTime(294 * mult, t + 0.5);
        o.frequency.setValueAtTime(294 * mult, t + 1.4);
        o.frequency.linearRampToValueAtTime(220 * mult, t + 2.0);
        o.frequency.linearRampToValueAtTime(165 * mult, t + dur);
        var vib = ctx.createOscillator(); vib.frequency.value = 5.5;
        var vg = ctx.createGain(); vg.gain.value = 6 * mult;
        vib.connect(vg); vg.connect(o.frequency);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(i ? 0.05 : 0.16, t + 0.3);
        g.gain.setValueAtTime(i ? 0.05 : 0.16, t + 1.8);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(mestre);
        o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
      });
    },
    latido: function () { ruido(0.08, 0.3, 900, 'bandpass'); tom(420, 260, 0.1, 'sawtooth', 0.12); ruido(0.08, 0.25, 900, 'bandpass', 0.16); tom(400, 250, 0.1, 'sawtooth', 0.1, 0.16); },
    vidro: function () { ruido(0.25, 0.3, 4000, 'highpass'); tom(2400, 1800, 0.08, 'square', 0.05); tom(3100, 2600, 0.06, 'square', 0.04, 0.05); },
    soco: function () { tom(120, 40, 0.35, 'sine', 0.5); ruido(0.2, 0.4, 300, 'lowpass'); },
    apito: function () { tom(2600, 2600, 0.25, 'square', 0.06); tom(2650, 2650, 0.25, 'square', 0.06, 0.02); },
    gol: function () { [523, 659, 784, 1046].forEach(function (f, i) { tom(f, f, 0.15, 'square', 0.1, i * 0.1); }); ruido(0.8, 0.2, 1500, 'bandpass', 0.2); },
    // a "música" do Gojoba: bumbo + buzina desafinada (horrível de propósito)
    batida: function () { tom(110, 40, 0.18, 'sine', 0.5); ruido(0.05, 0.15, 3000, 'highpass'); },
    buzina: function () { tom(415, 400, 0.22, 'sawtooth', 0.08); tom(440, 452, 0.22, 'square', 0.05); },
    pipoca: function () { for (var i = 0; i < 3; i++) ruido(0.03, 0.25, 1800 + Math.random() * 1500, 'bandpass', i * 0.05 + Math.random() * 0.03); },
    chinela: function () { ruido(0.08, 0.5, 2500, 'highpass'); tom(300, 120, 0.08, 'square', 0.15); },
    mugido: function () { tom(140, 110, 0.9, 'sawtooth', 0.12); tom(142, 108, 0.9, 'sawtooth', 0.06, 0.03); },
    // gemido da alma: dois tons desafinados descendo, com tremor
    alma: function () {
      if (!ctx) return;
      var t = ctx.currentTime, dur = 1.8;
      [330, 349].forEach(function (f0) {
        var o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + dur);
        var vib = ctx.createOscillator(); vib.frequency.value = 9; var vg = ctx.createGain(); vg.gain.value = 12;
        vib.connect(vg); vg.connect(o.frequency);
        var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(mestre); o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
      });
      ruido(1.5, 0.08, 500, 'bandpass', 0.1);
    },
    bode: function () { tom(500, 380, 0.4, 'sawtooth', 0.12); tom(510, 390, 0.4, 'sawtooth', 0.06, 0.02); },
    prego: function () { tom(1500, 900, 0.05, 'square', 0.06); },
    // ---- combate (Etapa 3): cada golpe com seu som ----
    pa: function () { tom(160, 60, 0.1, 'square', 0.22); ruido(0.06, 0.3, 900, 'lowpass'); },          // soco/pancada
    corte: function () { ruido(0.09, 0.3, 5000, 'highpass', 0, 2000); tom(1400, 600, 0.05, 'triangle', 0.05); }, // lâmina
    pesado: function () { tom(90, 40, 0.2, 'sine', 0.45); ruido(0.12, 0.3, 500, 'lowpass'); },       // enxada, braço do Paulo
    critico: function () { tom(880, 1760, 0.08, 'square', 0.12); tom(1320, 1320, 0.12, 'triangle', 0.1, 0.05); },
    vupt: function () { ruido(0.18, 0.25, 600, 'bandpass', 0, 2600); },                                 // esquiva
    baladeira: function () { tom(220, 520, 0.06, 'triangle', 0.15); ruido(0.04, 0.15, 3000, 'highpass'); },
    pressao: function () { ruido(0.07, 0.25, 1800, 'bandpass'); tom(500, 200, 0.04, 'square', 0.05); },
    pregoTiro: function () { tom(1800, 700, 0.04, 'square', 0.08); ruido(0.03, 0.15, 4000, 'highpass'); },
    explosao: function () { ruido(0.6, 0.55, 700, 'lowpass', 0, 60); tom(90, 30, 0.5, 'sine', 0.5); },
    estalo2: function () { ruido(0.04, 0.4, 5000, 'highpass'); tom(2000, 900, 0.03, 'square', 0.1); }, // relho
    recarga: function () { tom(700, 700, 0.03, 'square', 0.08); tom(500, 500, 0.04, 'square', 0.08, 0.08); },
    ai: function () { tom(500, 300, 0.12, 'triangle', 0.12); },
    // ---- acabamento (v1.0): cada coisa pegada tem seu som ----
    moeda: function () { tom(1318, 1318, 0.05, 'square', 0.09); tom(1975, 1975, 0.16, 'square', 0.09, 0.05); },
    cartucho: function () { tom(900, 600, 0.03, 'square', 0.1); ruido(0.03, 0.2, 3500, 'highpass', 0.05); tom(700, 500, 0.03, 'square', 0.08, 0.09); },
    melhoria: function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tom(f, f, 0.12, 'triangle', 0.13, i * 0.06); }); ruido(0.3, 0.1, 6000, 'highpass', 0.25); },
    conquista: function () { [659, 784, 988, 1318].forEach(function (f, i) { tom(f, f, 0.18, 'square', 0.08, i * 0.09); tom(f * 2, f * 2, 0.1, 'sine', 0.05, i * 0.09); }); },
    pagina: function () { ruido(0.12, 0.12, 2400, 'bandpass', 0, 900); }
  };

  BSI.audio = {
    destravar: function () {
      criar();
      if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { } }
    },
    sfx: function (nome) {
      if (!ctx || cfg.mudo) return;
      var t = BSI.util.agora();
      if (ultimo[nome] && t - ultimo[nome] < 40) return;
      ultimo[nome] = t;
      var f = SONS[nome];
      if (f) { try { f(); } catch (e) { } }
      if (cfg.legendas && LEGENDAS[nome] && BSI.hud && BSI.hud.legenda) BSI.hud.legenda(LEGENDAS[nome]);
    },
    // ---- usados pela trilha (musica.js) ----
    ctx: function () { return ctx && ctx.state !== 'closed' ? ctx : null; },
    saida: function (b) { return barras[b] || null; },
    ruidoBuffer: function () { return ruidoBuf; },
    inst: INST,
    legendas: LEGENDAS,
    volBarra: volBarra,
    mudarBarra: function (b, delta) {
      cfg['vol_' + b] = BSI.util.clamp(Math.round((volBarra(b) + delta) * 10) / 10, 0, 1);
      aplicarVolume(); BSI.save.salvarCfg(cfg);
    },
    get mudo() { return cfg.mudo; },
    get volume() { return cfg.volume; },
    get legendasLigadas() { return !!cfg.legendas; },
    alternarLegendas: function () { cfg.legendas = !cfg.legendas; BSI.save.salvarCfg(cfg); },
    alternarMudo: function () { cfg.mudo = !cfg.mudo; aplicarVolume(); BSI.save.salvarCfg(cfg); },
    mudarVolume: function (delta) {
      cfg.volume = BSI.util.clamp(Math.round((cfg.volume + delta) * 10) / 10, 0, 1);
      aplicarVolume(); BSI.save.salvarCfg(cfg);
    },
    sons: SONS
  };
})();
