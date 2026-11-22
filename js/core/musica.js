/* =========================================================
   musica.js — TRILHA SONORA feita por código (v1.0)
   Nenhum arquivo de áudio e NENHUMA música real: as melodias
   saem de um gerador com semente (cada faixa tem a sua), sempre
   iguais, inspiradas no jeito do baião, do xote e do forró.
   Instrumentos sintetizados: zabumba, triângulo, ganzá, baixo,
   pífano (flauta com vibrato) e sanfona (onda quadrada filtrada).
   Troca de faixa com transição suave. Volumes separados:
   Música / Efeitos / Ambiente (Opções).
   AMBIENTE: vento e grilo à noite, conforme o mapa.
   ========================================================= */
(function () {
  'use strict';

  // ---------------- as faixas ----------------
  // ritmo: baiao | xote | marcha | forroEletrico | nada · escala: modo nordestino
  var ESCALAS = {
    mixolidio: [0, 2, 4, 5, 7, 9, 10],          // o "modo nordestino" clássico
    nordestina: [0, 2, 4, 6, 7, 9, 10],         // mixolídio com quarta aumentada
    dorico: [0, 2, 3, 5, 7, 9, 10],
    menor: [0, 2, 3, 5, 7, 8, 10],
    maior: [0, 2, 4, 5, 7, 9, 11],
    misterio: [0, 1, 4, 5, 7, 8, 10]            // frígio maior: tenso, de alma
  };
  var FAIXAS = {
    titulo:      { bpm: 92,  ritmo: 'xote', escala: 'mixolidio', tonica: 57, semente: 11, lead: 'pifano', vol: 0.9 },
    terreiro:    { bpm: 84,  ritmo: 'xote', escala: 'mixolidio', tonica: 55, semente: 23, lead: 'pifano', vol: 0.8, calmo: true },
    mata:        { bpm: 100, ritmo: 'baiao', escala: 'dorico', tonica: 52, semente: 37, lead: 'pifano', vol: 0.75, calmo: true },
    grota:       { bpm: 70,  ritmo: 'nada', escala: 'misterio', tonica: 50, semente: 41, lead: 'pifano', vol: 0.7 },
    terrasPaulo: { bpm: 112, ritmo: 'baiao', escala: 'mixolidio', tonica: 57, semente: 53, lead: 'sanfona', vol: 0.8 },
    paulo:       { bpm: 132, ritmo: 'baiao', escala: 'nordestina', tonica: 55, semente: 61, lead: 'sanfona', vol: 0.95 },
    acudinho:    { bpm: 80,  ritmo: 'xote', escala: 'maior', tonica: 53, semente: 71, lead: 'pifano', vol: 0.75, calmo: true },
    alma:        { bpm: 66,  ritmo: 'nada', escala: 'misterio', tonica: 48, semente: 83, lead: 'pifano', vol: 0.9 },
    perseguicao: { bpm: 150, ritmo: 'baiao', escala: 'mixolidio', tonica: 60, semente: 89, lead: 'sanfona', vol: 0.9 },
    cidade:      { bpm: 118, ritmo: 'baiao', escala: 'maior', tonica: 57, semente: 97, lead: 'sanfona', vol: 0.75 },
    bar:         { bpm: 104, ritmo: 'xote', escala: 'mixolidio', tonica: 52, semente: 103, lead: 'sanfona', vol: 0.75 },
    gojoba:      { bpm: 140, ritmo: 'forroEletrico', escala: 'nordestina', tonica: 55, semente: 107, lead: 'sanfona', vol: 0.95 },
    tapera:      { bpm: 76,  ritmo: 'nada', escala: 'dorico', tonica: 50, semente: 113, lead: 'pifano', vol: 0.75 },
    gadernal:    { bpm: 124, ritmo: 'baiao', escala: 'misterio', tonica: 52, semente: 127, lead: 'sanfona', vol: 0.9, irregular: true },
    festa:       { bpm: 126, ritmo: 'baiao', escala: 'maior', tonica: 60, semente: 131, lead: 'sanfona', vol: 0.8 },
    cds:         { bpm: 108, ritmo: 'marcha', escala: 'menor', tonica: 53, semente: 137, lead: 'sanfona', vol: 0.95 },
    creditos:    { bpm: 88,  ritmo: 'xote', escala: 'mixolidio', tonica: 57, semente: 149, lead: 'pifano', vol: 0.9 }
  };
  // qual faixa em cada mapa / chefe / situação
  var POR_MAPA = { terreiro: 'terreiro', trilha: 'mata', serra: 'mata', grota: 'grota', terras_paulo: 'terrasPaulo', campo_roma: 'terrasPaulo', acudinho: 'acudinho', santa_isabel: 'cidade', bar_stelo: 'bar', caminho_tapera: 'mata', tapera: 'tapera', praca_festa: 'festa' };
  var POR_CHEFE = { paulo: 'paulo', alma: 'alma', gojoba: 'gojoba', gadernal: 'gadernal', cds: 'cds' };

  // ---------------- gerador de melodia (semente) ----------------
  function rng(s) { return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  function compor(f) {
    var r = rng(f.semente * 7919), esc = ESCALAS[f.escala], passos = 16; // 16 semicolcheias = 2 compassos de 2/4
    // um motivo de 2 compassos; a frase é A A' B A'' (8 compassos)
    function motivo(grauIni) {
      var m = [], g = grauIni;
      for (var i = 0; i < passos; i++) {
        var forte = i % 4 === 0, toca = forte ? r() < 0.85 : r() < (f.calmo ? 0.25 : 0.42);
        if (!toca) { m.push(null); continue; }
        var mov = r(); g += mov < 0.35 ? 1 : (mov < 0.7 ? -1 : (mov < 0.85 ? 2 : -2));
        g = Math.max(-2, Math.min(9, g));
        var dur = forte && r() < 0.4 ? 3 : (r() < 0.6 ? 1 : 2);
        m.push({ grau: g, dur: dur });
      }
      return m;
    }
    var A = motivo(2), B = motivo(4);
    var A2 = A.map(function (n, i) { return n && i > 11 ? { grau: n.grau + (r() < 0.5 ? 1 : -1), dur: n.dur } : n; });
    var A3 = A.map(function (n, i) { return n && i >= 12 ? (i === 12 ? { grau: 0, dur: 4 } : null) : n; }); // termina na tônica
    var frase = [].concat(A, A2, B, A3);
    function freq(grau, oit) { var o = Math.floor(grau / 7), k = ((grau % 7) + 7) % 7; return 440 * Math.pow(2, (f.tonica + 12 * (o + (oit || 0)) + esc[k] - 69) / 12); }
    // baixo: tônica e quinta acompanhando a harmonia (I - IV - V - I simplificado)
    var harmonia = [0, 0, 3, 3, 4, 4, 0, 0];
    return { frase: frase, freq: freq, harmonia: harmonia, passosCompasso: 8 };
  }

  // ---------------- motor ----------------
  var M = BSI.musica = {
    atual: null, faixa: null, comp: null, passo: 0, proximo: 0, saidaFaixa: null, desejada: null,
    tocar: function (id) {
      var A = BSI.audio, ctx = A.ctx && A.ctx();
      M.desejada = id;
      if (!ctx || M.atual === id) return;
      var saida = A.saida('musica'); if (!saida) return;
      // some com a faixa antiga devagar
      if (M.saidaFaixa) { var velha = M.saidaFaixa; velha.gain.cancelScheduledValues(ctx.currentTime); velha.gain.setValueAtTime(velha.gain.value, ctx.currentTime); velha.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.6); setTimeout(function () { try { velha.disconnect(); } catch (e) { } }, 2000); }
      M.atual = id; M.saidaFaixa = null;
      if (!id || !FAIXAS[id]) return;
      M.faixa = FAIXAS[id]; M.comp = compor(M.faixa); M.passo = 0;
      var gf = ctx.createGain(); gf.gain.setValueAtTime(0.0001, ctx.currentTime); gf.gain.linearRampToValueAtTime(M.faixa.vol, ctx.currentTime + 1.4);
      gf.connect(saida); M.saidaFaixa = gf;
      M.proximo = ctx.currentTime + 0.1;
    },
    parar: function () { M.tocar(null); },
    // chamado todo quadro: agenda as notas um pouquinho à frente
    atualizar: function () {
      var A = BSI.audio, ctx = A.ctx && A.ctx();
      if (!ctx) return;
      if (M.desejada !== M.atual) M.tocar(M.desejada);
      if (!M.saidaFaixa || !M.faixa) return;
      var semi = 60 / M.faixa.bpm / 4;
      while (M.proximo < ctx.currentTime + 0.18) { M.tocarPasso(M.passo, M.proximo, semi); M.proximo += semi * (M.faixa.irregular && M.passo % 7 === 6 ? 1.5 : 1); M.passo++; }
      Amb.atualizar(ctx);
    },
    tocarPasso: function (p, t, semi) {
      var f = M.faixa, c = M.comp, out = M.saidaFaixa, A = BSI.audio, I = A.inst;
      var naFrase = p % c.frase.length, compasso = Math.floor(naFrase / 8) % c.harmonia.length, noCompasso = naFrase % 8;
      var acorde = c.harmonia[compasso];
      // ---- percussão ----
      if (f.ritmo === 'baiao') {
        if (noCompasso === 0 || noCompasso === 3) I.zabumba(t, out, noCompasso === 0 ? 1 : 0.7);
        if (noCompasso === 6) I.zabumba(t, out, 0.35, true); // o "bacalhau" (resposta aguda)
        I.triangulo(t, out, noCompasso % 2 === 1 ? 0.5 : 0.25, noCompasso % 4 === 3);
      } else if (f.ritmo === 'xote') {
        if (noCompasso === 0 || noCompasso === 5) I.zabumba(t, out, noCompasso === 0 ? 0.9 : 0.6);
        if (noCompasso % 2 === 0) I.ganza(t, out, noCompasso === 2 || noCompasso === 6 ? 0.45 : 0.2);
      } else if (f.ritmo === 'marcha') {
        if (noCompasso === 0 || noCompasso === 4) I.zabumba(t, out, 0.9);
        if (noCompasso === 2 || noCompasso === 6) I.caixa(t, out, 0.5);
        if (noCompasso === 7) I.caixa(t, out, 0.25);
      } else if (f.ritmo === 'forroEletrico') {
        if (noCompasso % 2 === 0) I.zabumba(t, out, 1);
        I.triangulo(t, out, 0.35, noCompasso % 2 === 1);
        if (noCompasso === 4) I.caixa(t, out, 0.6);
      }
      // ---- baixo ----
      if (f.ritmo !== 'nada' ? (noCompasso === 0 || noCompasso === 3 || noCompasso === 4) : noCompasso === 0) {
        var gb = acorde + (noCompasso === 3 ? 4 : 0);
        I.baixo(c.freq(gb, -2), t, semi * (f.ritmo === 'nada' ? 7 : 2.5), out, f.ritmo === 'nada' ? 0.5 : 0.7);
      }
      // ---- melodia ----
      var n = c.frase[naFrase];
      // na volta par da frase a melodia sobe uma oitava (variação)
      if (n) I[f.lead](c.freq(n.grau, Math.floor(p / c.frase.length) % 4 === 2 && f.ritmo !== 'nada' ? 1 : 0), t, semi * n.dur * 0.95, out);
      // ---- pad de mistério ----
      if (f.ritmo === 'nada' && noCompasso === 0 && compasso % 2 === 0) { I.pad(c.freq(acorde, -1), t, semi * 15, out); I.pad(c.freq(acorde + 2, -1), t, semi * 15, out); }
    },
    // escolhe a faixa conforme o mapa, o chefe e a situação
    escolher: function (m) {
      var id = POR_MAPA[m.mapa.id] || 'terreiro';
      if (m.perseguicao) id = 'perseguicao';
      var ch = m.chefe;
      if (m.terror && m.terror()) id = 'alma';
      if (ch && ch.ativo && !ch.morto && ['derrotado', 'derrotada', 'paz', 'desafio', 'calmo'].indexOf(ch.estado) < 0) {
        var cid = Object.keys(BSI.chefes || {}).filter(function (k) { return ch instanceof BSI.chefes[k]; })[0];
        if (POR_CHEFE[cid]) id = POR_CHEFE[cid];
      }
      M.desejada = id;
      var h = m.horario ? m.horario() : 'noite';
      Amb.desejado = { noite: m.ambienteAtual < 0.7, mata: ['trilha', 'serra', 'grota', 'caminho_tapera'].indexOf(m.mapa.id) >= 0, interior: h === 'interior' };
    },
    FAIXAS: FAIXAS, POR_MAPA: POR_MAPA, POR_CHEFE: POR_CHEFE
  };

  // ---------------- AMBIENTE (vento e grilo) ----------------
  var Amb = M.ambiente = {
    desejado: null, proxGrilo: 0, vento: null,
    atualizar: function (ctx) {
      var A = BSI.audio, d = Amb.desejado, saida = A.saida('ambiente');
      if (!saida) return;
      // vento: um ruído filtrado bem baixinho, sempre ligado fora de casa
      if (!Amb.vento && A.ruidoBuffer && A.ruidoBuffer()) {
        var s = ctx.createBufferSource(); s.buffer = A.ruidoBuffer(); s.loop = true;
        var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
        var g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(saida); s.start();
        Amb.vento = { g: g, f: f };
      }
      if (Amb.vento) {
        var alvo = !d || d.interior ? 0 : (d.mata ? 0.09 : 0.05);
        Amb.vento.g.gain.setTargetAtTime(alvo, ctx.currentTime, 1.5);
        Amb.vento.f.frequency.setTargetAtTime(380 + Math.sin(ctx.currentTime * 0.3) * 120, ctx.currentTime, 2);
      }
      // grilo à noite
      if (d && d.noite && !d.interior && ctx.currentTime > Amb.proxGrilo) {
        Amb.proxGrilo = ctx.currentTime + 0.6 + Math.random() * 2.2;
        var tt = ctx.currentTime + 0.05, fq = 4200 + Math.random() * 600;
        for (var k = 0; k < 3; k++) A.inst.grilo(fq, tt + k * 0.07, saida);
      }
    }
  };
})();
