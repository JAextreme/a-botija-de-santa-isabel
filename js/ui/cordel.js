/* =========================================================
   cordel.js — INTERFACE EM ESTILO CORDEL / XILOGRAVURA
   - caixas de madeira entalhada (HUD, diálogo, retrato)
   - cursor próprio: retícula no jogo, mãozinha nos menus
   - tela de título animada: Santa Isabel à noite, lua cheia,
     o alpendre com a rede balançando, vagalumes, a serra
     andando devagar (parallax)
   - transição: página de cordel virando
   Desenhado em detalhe 2x (as caixas ficam guardadas prontas).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash;
  var cache = {};

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); var g = c.getContext('2d'); g.imageSmoothingEnabled = false; return c; }

  // ---------- caixa de madeira entalhada ----------
  // fundo: cor de dentro; papel: true = papel envelhecido
  function caixaPronta(w, h, fundo, papel, ativo) {
    var k = [w, h, fundo, papel, ativo].join('|');
    if (cache[k]) return cache[k];
    var E = 2, c = canvas(w * E, h * E), g = c.getContext('2d');
    var W = w * E, Hh = h * E, b = (W < 70 || Hh < 70) ? 2 : 4; // largura da madeira em pixels de arte
    // contorno
    g.fillStyle = '#140a10'; g.fillRect(0, 0, W, Hh);
    // madeira com veio
    for (var y = 1; y < Hh - 1; y++) for (var x = 1; x < W - 1; x++) {
      var borda = x < b + 1 || y < b + 1 || x >= W - b - 1 || y >= Hh - b - 1;
      if (!borda) continue;
      var veio = Math.sin((x + y * 0.15) * 0.45 + Math.sin(y * 0.3) * 2) * 0.5 + 0.5;
      var base = ativo ? [200, 150, 60] : [106, 66, 38];
      var f = (veio - 0.5) * 0.25 + (H(x, y, 3) - 0.5) * 0.1;
      if (x <= 1 || y <= 1) f += 0.25;                         // luz em cima/esquerda
      if (x >= W - 2 || y >= Hh - 2) f -= 0.3;                 // sombra embaixo/direita
      if ((x === b || y === b) && x >= b && y >= b && x < W - b && y < Hh - b) f -= 0.4; // sulco do entalhe
      var r = base[0] * (1 + f), gg = base[1] * (1 + f), bb = base[2] * (1 + f);
      g.fillStyle = 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ')'; g.fillRect(x, y, 1, 1);
    }
    // miolo
    g.fillStyle = '#140a10'; g.fillRect(b + 1, b + 1, W - 2 * b - 2, Hh - 2 * b - 2);
    g.fillStyle = fundo || 'rgba(30,20,40,0.92)'; g.fillRect(b + 2, b + 2, W - 2 * b - 4, Hh - 2 * b - 4);
    if (papel) { // fibras e manchas de papel velho
      for (var i = 0; i < W * Hh / 60; i++) { g.fillStyle = H(i, 1, 7) > 0.5 ? 'rgba(255,240,200,0.06)' : 'rgba(0,0,0,0.08)'; g.fillRect(b + 2 + H(i, 2, 7) * (W - 2 * b - 6), b + 2 + H(i, 3, 7) * (Hh - 2 * b - 6), 1 + (H(i, 4, 7) * 3 | 0), 1); }
    }
    // cravinhos de latão nos cantos
    if (W > 30 && Hh > 30) [[b / 2 + 1, b / 2 + 1], [W - b / 2 - 2, b / 2 + 1], [b / 2 + 1, Hh - b / 2 - 2], [W - b / 2 - 2, Hh - b / 2 - 2]].forEach(function (p) {
      g.fillStyle = '#3a2410'; g.fillRect(p[0] - 1, p[1] - 1, 3, 3); g.fillStyle = '#e0b050'; g.fillRect(p[0] - 1, p[1] - 1, 2, 2); g.fillStyle = '#fff0b0'; g.fillRect(p[0] - 1, p[1] - 1, 1, 1);
    });
    return (cache[k] = c);
  }

  // ---------- ornamento de xilogravura (sol do sertão) ----------
  function sol(g, x, y, r, cor) {
    g.fillStyle = cor;
    for (var a = 0; a < 12; a++) { var an = a / 12 * Math.PI * 2; g.fillRect(x + Math.cos(an) * (r + 1.5) - 0.5, y + Math.sin(an) * (r + 1.5) - 0.5, 1, 1); }
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }

  // ---------- cursor ----------
  function cursorUrl(tipo) {
    var k = 'cur' + tipo; if (cache[k]) return cache[k];
    var c = canvas(32, 32), g = c.getContext('2d');
    if (tipo === 'mira') {
      g.fillStyle = '#140a10';
      [[15, 2, 3, 9], [15, 21, 3, 9], [2, 15, 9, 3], [21, 15, 9, 3]].forEach(function (r) { g.fillRect(r[0] - 1, r[1] - 1, r[2] + 2, r[3] + 2); });
      g.fillStyle = '#f0c75e';
      [[15, 2, 3, 9], [15, 21, 3, 9], [2, 15, 9, 3], [21, 15, 9, 3]].forEach(function (r) { g.fillRect(r[0], r[1], r[2], r[3]); });
      g.fillStyle = '#fff6e0'; g.fillRect(15, 15, 3, 3);
      g.strokeStyle = '#a8402a'; g.lineWidth = 1.5; g.beginPath(); g.arc(16.5, 16.5, 9, 0, Math.PI * 2); g.stroke();
    } else { // mãozinha de cordel
      var mao = ['....##..........', '...#oo#.........', '...#oo#.........', '...#oo####......', '...#oo#oo#oo##..', '.###oo#oo#oo#o#.', '#oo#oooooooooo#.', '#ooooooooooooo#.', '.#oooooooooooo#.', '..#ooooooooooo#.', '...#ooooooooo#..', '....#ooooooo#...', '....#ooooooo#...', '....#########...'];
      for (var y = 0; y < mao.length; y++) for (var x = 0; x < 16; x++) { var ch = mao[y][x]; if (ch === '.') continue; g.fillStyle = ch === '#' ? '#140a10' : (x < 6 ? '#fff6e0' : '#f2e6c9'); g.fillRect(x * 2, y * 2, 2, 2); }
    }
    var url; try { url = c.toDataURL('image/png'); } catch (e) { url = null; }
    return (cache[k] = url);
  }
  var cursorAtual = null;
  function atualizarCursor() {
    var el = document.getElementById('palco'); if (!el || !el.style) return;
    var J = BSI.jogo, menu = !J || J.cena !== 'jogo' || J.modal || (BSI.dialogo && BSI.dialogo.ativo);
    var tipo = menu ? 'mao' : 'mira';
    if (tipo === cursorAtual) return;
    cursorAtual = tipo;
    if (tipo === 'mira') { el.style.cursor = 'none'; return; } // no jogo a retícula é desenhada (abre e fecha com o tiro)
    var u = cursorUrl(tipo);
    if (u) el.style.cursor = 'url(' + u + ') ' + (tipo === 'mira' ? '16 16' : '6 2') + ', ' + (tipo === 'mira' ? 'crosshair' : 'pointer');
  }

  // ---------- tela de título animada ----------
  var estrelas = []; for (var e = 0; e < 90; e++) estrelas.push({ x: H(e, 1, 9), y: H(e, 2, 9) * 0.6, f: H(e, 3, 9) * 6, b: H(e, 4, 9) });
  var vaga = []; for (var v = 0; v < 14; v++) vaga.push({ x: H(v, 5, 9), y: 0.72 + H(v, 6, 9) * 0.2, f: H(v, 7, 9) * 6 });
  function titulo(g, t) {
    var W = BSI.view.w, Hh = BSI.view.h;
    // céu em degradê (noite funda → horizonte alaranjado)
    var gr = g.createLinearGradient(0, 0, 0, Hh * 0.8);
    gr.addColorStop(0, '#07051a'); gr.addColorStop(0.45, '#1b1638'); gr.addColorStop(0.75, '#4a2240'); gr.addColorStop(1, '#a8482a');
    g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    estrelas.forEach(function (s) { var br = 0.35 + Math.sin(t * 1.7 + s.f) * 0.35 + s.b * 0.3; g.fillStyle = 'rgba(244,236,208,' + br.toFixed(2) + ')'; g.fillRect(s.x * W, s.y * Hh, s.b > 0.85 ? 1 : 0.5, s.b > 0.85 ? 1 : 0.5); });
    // lua cheia grande com halo e crateras
    var lx = W * 0.9, ly = Hh * 0.1, lr = Math.min(W, Hh) * 0.07;
    var halo = g.createRadialGradient(lx, ly, lr * 0.8, lx, ly, lr * 3.2); halo.addColorStop(0, 'rgba(244,236,208,0.28)'); halo.addColorStop(1, 'rgba(244,236,208,0)');
    g.fillStyle = halo; g.fillRect(lx - lr * 3.2, ly - lr * 3.2, lr * 6.4, lr * 6.4);
    g.fillStyle = '#f4ecd0'; g.beginPath(); g.arc(lx, ly, lr, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(200,190,160,0.6)'; [[-0.35, -0.2, 0.22], [0.3, 0.25, 0.16], [0.05, 0.45, 0.1], [-0.1, 0.1, 0.08]].forEach(function (c) { g.beginPath(); g.arc(lx + c[0] * lr, ly + c[1] * lr, c[2] * lr, 0, Math.PI * 2); g.fill(); });
    // luzes estranhas no céu
    for (var k = 0; k < 3; k++) { var ox = W * 0.15 + k * 40 + Math.sin(t * 0.7 + k) * 30, oy = Hh * 0.15 + Math.cos(t * 0.9 + k * 2) * 10; g.fillStyle = 'rgba(160,255,220,' + (0.5 + Math.sin(t * 5 + k) * 0.4).toFixed(2) + ')'; g.fillRect(ox, oy, 1.5, 1.5); }
    // serras em parallax
    function serra(base, alt, cor, vel, sem) {
      g.fillStyle = cor; g.beginPath(); g.moveTo(0, Hh);
      for (var x = 0; x <= W; x += 2) { var X = x + t * vel; var y = base - (Math.sin(X * 0.013 + sem) * 0.5 + Math.sin(X * 0.031 + sem * 2) * 0.3 + 0.8) * alt; g.lineTo(x, y); }
      g.lineTo(W, Hh); g.fill();
    }
    serra(Hh * 0.7, Hh * 0.2, '#2a1830', 2, 1.3);
    serra(Hh * 0.78, Hh * 0.14, '#1d1226', 5, 4.1);
    // chão
    g.fillStyle = '#120a16'; g.fillRect(0, Hh * 0.86, W, Hh);
    // igrejinha com a janela acesa
    var ix = W * 0.14, iy = Hh * 0.86;
    g.fillStyle = '#100816'; g.fillRect(ix, iy - 18, 20, 18); g.fillRect(ix + 7, iy - 30, 6, 12); g.fillRect(ix + 9, iy - 36, 2, 6); g.fillRect(ix + 7, iy - 34, 6, 1.5);
    g.fillStyle = '#f0c75e'; g.fillRect(ix + 9, iy - 10, 2, 4); g.fillRect(ix + 9, iy - 26, 2, 2);
    // a casa com alpendre e a rede balançando
    var cx = W * 0.8, cy = Hh * 0.86;
    g.fillStyle = '#0e0712'; g.fillRect(cx - 40, cy - 22, 80, 22); // casa
    g.beginPath(); g.moveTo(cx - 46, cy - 22); g.lineTo(cx, cy - 38); g.lineTo(cx + 46, cy - 22); g.fill(); // telhado
    g.fillRect(cx - 52, cy - 16, 104, 2); // beiral do alpendre
    g.fillRect(cx - 50, cy - 14, 2, 14); g.fillRect(cx + 48, cy - 14, 2, 14); // esteios
    // luz do alpendre (lampião)
    var lamp = g.createRadialGradient(cx - 20, cy - 12, 1, cx - 20, cy - 12, 26); lamp.addColorStop(0, 'rgba(247,183,51,0.55)'); lamp.addColorStop(1, 'rgba(247,183,51,0)');
    g.fillStyle = lamp; g.fillRect(cx - 50, cy - 40, 60, 40);
    g.fillStyle = '#ffe080'; g.fillRect(cx - 21, cy - 13, 2, 2);
    g.fillStyle = '#f0c75e'; g.fillRect(cx + 14, cy - 18, 5, 6); g.fillRect(cx - 34, cy - 18, 5, 6); // janelas
    // rede (balança)
    var bal = Math.sin(t * 1.4) * 2.5;
    g.strokeStyle = '#c4562a'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 44, cy - 12); g.quadraticCurveTo(cx - 30 + bal, cy - 2 + Math.abs(bal) * 0.4, cx - 16, cy - 12); g.stroke();
    g.strokeStyle = '#f0c75e'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(cx - 43, cy - 11.5); g.quadraticCurveTo(cx - 30 + bal, cy - 1.5 + Math.abs(bal) * 0.4, cx - 17, cy - 11.5); g.stroke();
    // mandacarus
    [[W * 0.58, 1], [W * 0.97, 0.7], [W * 0.3, 0.8]].forEach(function (m) {
      var x = m[0], s = m[1]; g.fillStyle = '#0c0610';
      g.fillRect(x, cy - 30 * s, 5 * s, 30 * s); g.fillRect(x - 6 * s, cy - 22 * s, 3 * s, 10 * s); g.fillRect(x - 6 * s, cy - 14 * s, 8 * s, 3 * s); g.fillRect(x + 7 * s, cy - 26 * s, 3 * s, 12 * s); g.fillRect(x + 3 * s, cy - 16 * s, 7 * s, 3 * s);
    });
    // vagalumes
    vaga.forEach(function (f) { var a = Math.sin(t * 2 + f.f) * 0.5 + 0.5; if (a < 0.3) return; g.fillStyle = 'rgba(207,255,138,' + a.toFixed(2) + ')'; g.fillRect(f.x * W + Math.sin(t * 0.5 + f.f) * 8, f.y * Hh + Math.cos(t * 0.7 + f.f) * 4, 1, 1); });
  }

  // ---------- transição: página de cordel virando ----------
  function pagina(u, W, Hh, a, s) {
    // u = contexto do texto (resolução da tela); W/Hh virtuais; s = escala
    var x = W * (1 - a);
    u.save();
    u.fillStyle = '#120a16'; u.fillRect(x, 0, W - x + 1, Hh);
    // borda da página com ornamento e sombra
    var grd = u.createLinearGradient(x - 10, 0, x, 0); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    u.fillStyle = grd; u.fillRect(x - 10, 0, 10, Hh);
    u.fillStyle = '#d39b3a'; u.fillRect(x, 0, 1, Hh);
    for (var y = 4; y < Hh; y += 6) u.fillRect(x + 2, y, 2, 2);
    if (a > 0.6) { u.globalAlpha = (a - 0.6) / 0.4; sol(u, x + (W - x) / 2, Hh / 2, 5, '#d39b3a'); }
    u.restore();
  }

  BSI.cordel = {
    caixa: function (g, x, y, w, h, fundo, ativo, papel) {
      w = Math.round(w); h = Math.round(h);
      if (w < 4 || h < 4) { g.fillStyle = fundo || '#1e1428'; g.fillRect(x, y, w, h); return; }
      g.drawImage(caixaPronta(w, h, fundo, papel, ativo), x, y, w, h);
    },
    sol: sol,
    titulo: titulo,
    pagina: pagina,
    atualizarCursor: atualizarCursor
  };
})();
