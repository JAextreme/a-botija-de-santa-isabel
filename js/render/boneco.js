/* =========================================================
   boneco.js — O BONECO NOVO (Etapa 2 da atualização pré-1.0)
   Pixel art feita por código com o DOBRO de detalhe:
   cada quadro tem 32x48 pixels de arte (aparece com 16x24 no
   mundo). Proporção mais realista (umas 5 cabeças de altura),
   4 a 5 tons por cor, luz vindo da esquerda e contorno suave.

   ANIMAÇÕES (cada uma em 4 direções; "right" é o espelho):
     parado 4 · andar 8 · correr 8 · atacar 6 · atirar 4 ·
     dano 2 · cair 3 · mania 6 (a mania de cada um, parado)
   Os quadros são feitos NA HORA que aparecem a primeira vez
   e ficam guardados (não pesa memória com o que não aparece).

   Visual (characters.js): pele, cabelo, camisa, camisa2, calca,
   sapato, chapeu, cabeca (estilo), padrao (camisa), extras,
   acessorio (na mão), olhos, boca, faixa.

   ENCAIXE PRA PNG: se existir BSI.imagens['heroi:id'] (folha de
   sprites feita à mão), ela é usada no lugar (ver README).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor;
  var ESC = 2, W = 32, H = 48, OX = 16, OY = 46;
  var CONTORNO = [30, 18, 26];

  // ---------------- cor ----------------
  function hexRgb(h) { h = (h || '#888888').replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbHex(r, g, b) { return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  // escurece puxando pro roxo (sombra fria) e clareia puxando pro amarelo (luz quente)
  function esc(h, f) { var c = hexRgb(h); return rgbHex(c[0] * (1 - f) + 18 * f, c[1] * (1 - f) + 8 * f, c[2] * (1 - f) + 30 * f); }
  function cla(h, f) { var c = hexRgb(h); return rgbHex(c[0] + (255 - c[0]) * f, c[1] + (245 - c[1]) * f, c[2] + (200 - c[2]) * f * 0.8); }
  function tons(h) { return { e2: esc(h, 0.42), e: esc(h, 0.22), b: h, c: cla(h, 0.16), c2: cla(h, 0.32) }; }

  // ---------------- pincel ----------------
  function Pincel(g, espelho) {
    this.g = g;
  }
  Pincel.prototype.r = function (x, y, w, h, cor) { if (w <= 0 || h <= 0) return; this.g.fillStyle = cor; this.g.fillRect(x, y, w, h); };
  Pincel.prototype.p = function (x, y, cor) { this.g.fillStyle = cor; this.g.fillRect(x, y, 1, 1); };
  // bloco com volume: luz à esquerda, sombra à direita e embaixo
  Pincel.prototype.bloco = function (x, y, w, h, t, semBaixo) {
    if (w <= 0 || h <= 0) return;
    this.r(x, y, w, h, t.b);
    this.r(x, y, 1, h, t.c);
    if (w > 3) this.r(x + 1, y, 1, Math.max(1, h - 1), cla(t.b, 0.07));
    this.r(x + w - 1, y, 1, h, t.e);
    if (!semBaixo) this.r(x, y + h - 1, w, 1, t.e);
    this.r(x, y, w, 1, t.c);
  };

  // ---------------- poses ----------------
  // cada quadro vira um objeto de pose
  function pose(o) {
    return {
      by: o.by || 0,           // corpo (tronco+cabeça+braços) desce
      hy: o.hy || 0,           // cabeça a mais
      liftE: o.liftE || 0, liftD: o.liftD || 0, // pernas levantadas
      passoE: o.passoE || 0, passoD: o.passoD || 0, // (lado) perna pra frente/trás
      bracoE: o.bracoE || 0, bracoD: o.bracoD || 0, // balanço dos braços
      incl: o.incl || 0,       // inclinação pra frente (lado)
      atk: o.atk || 0,         // 1 prepara, 2 golpe, 3 volta
      mira: !!o.mira,          // braços apontando (arma)
      olhos: o.olhos || 'normal', boca: o.boca || 'normal',
      agacha: o.agacha || 0,   // cair: dobra os joelhos
      mania: o.mania === undefined ? -1 : o.mania
    };
  }
  var ANIM = {
    parado: [0, 0, 1, 1].map(function (b, i) { return pose({ by: b, boca: 'normal', olhos: i === 3 ? 'piscando' : 'normal' }); }),
    andar: [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
      var s = Math.sin(i / 8 * Math.PI * 2), c = Math.cos(i / 8 * Math.PI * 2);
      return pose({ by: Math.abs(c) > 0.7 ? 1 : 0, liftE: s > 0.3 ? Math.round(s * 2) : 0, liftD: s < -0.3 ? Math.round(-s * 2) : 0, passoE: Math.round(s * 3), passoD: Math.round(-s * 3), bracoE: Math.round(-s * 2), bracoD: Math.round(s * 2) });
    }),
    correr: [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
      var s = Math.sin(i / 8 * Math.PI * 2), c = Math.cos(i / 8 * Math.PI * 2);
      return pose({ by: Math.abs(c) > 0.7 ? 1 : -1, liftE: s > 0.2 ? Math.round(s * 3) : 0, liftD: s < -0.2 ? Math.round(-s * 3) : 0, passoE: Math.round(s * 5), passoD: Math.round(-s * 5), bracoE: Math.round(-s * 3), bracoD: Math.round(s * 3), incl: 1 });
    }),
    atacar: [1, 1, 2, 2, 3, 0].map(function (a, i) { return pose({ atk: a, incl: a === 2 ? 2 : 0, by: a === 2 ? 1 : 0, passoE: a === 2 ? -2 : 0, passoD: a === 2 ? 2 : 0, boca: a === 2 ? 'aberta' : 'normal' }); }),
    atirar: [0, 1, 1, 0].map(function (r) { return pose({ mira: true, incl: -r, by: r }); }),
    dano: [pose({ by: -1, incl: -2, olhos: 'fechado', boca: 'aberta', bracoE: -2, bracoD: -2 }), pose({ by: 0, incl: -1, olhos: 'fechado', boca: 'aberta' })],
    cair: [pose({ agacha: 2, by: 2, olhos: 'fechado' }), pose({ agacha: 5, by: 5, olhos: 'fechado' }), pose({ agacha: 8, by: 8, olhos: 'fechado', boca: 'aberta' })],
    mania: [0, 1, 2, 3, 4, 5].map(function (i) { return pose({ mania: i, by: i % 3 === 2 ? 1 : 0 }); })
  };

  // ---------------- o desenho ----------------
  function desenhar(g, d, dir, ps, id) {
    var P = new Pincel(g);
    var pele = tons(d.pele || '#c98b5e'), cab = tons(d.cabelo || '#2b1d14');
    var cam = tons(d.camisa || C.creme), cam2 = tons(d.camisa2 || esc(d.camisa || C.creme, 0.25));
    var calca = tons(d.calca || '#4a3a2e'), sap = tons(d.sapato || '#3a2418'), chap = tons(d.chapeu || C.madeira);
    var estilo = d.cabeca || 'curto', padrao = d.padrao || 'liso', ex = d.extras || [];
    var lado = dir === 'left', costas = dir === 'up';
    var by = ps.by + ps.agacha, ag = ps.agacha;
    var vestido = padrao === 'vestido', jaleco = padrao === 'jaleco';

    // ======== PERNAS ========
    var yPe = 43, yPerna = 30 + ag; // pernas encurtam quando agacha
    if (!lado) {
      var pernas = [[12, ps.liftE, -ps.passoE], [17, ps.liftD, -ps.passoD]];
      pernas.forEach(function (pp, k) {
        var x = pp[0], lift = pp[1];
        var y0 = yPerna, y1 = yPe - lift;
        if (vestido) { P.bloco(x, 37 + ag, 3, y1 - 37 - ag, pele, true); }
        else P.bloco(x, y0, 4, y1 - y0, calca, true);
        if (!vestido) { P.r(x + 1, y0 + 6, 2, 1, calca.e); } // joelho
        // sapato / chinela
        P.r(x - (k ? 0 : 0), y1, 4, 3, sap.b); P.r(x, y1, 4, 1, sap.c); P.r(x, y1 + 2, 4, 1, sap.e2);
        if (!costas) P.p(x + (k ? 3 : 0), y1 + 1, sap.c2);
      });
    } else {
      // de lado: perna de trás mais escura
      var tras = { x: 15 + ps.passoD, lift: ps.liftD }, frente = { x: 14 + ps.passoE, lift: ps.liftE };
      [tras, frente].forEach(function (pp, k) {
        var t = k ? calca : tons(calca.e), s = k ? sap : tons(sap.e);
        var y1 = yPe - pp.lift;
        if (vestido) P.bloco(pp.x, 37 + ag, 3, y1 - 37 - ag, k ? pele : tons(pele.e), true);
        else P.bloco(pp.x, yPerna, 4, y1 - yPerna, t, true);
        P.r(pp.x - 2, y1, 6, 3, s.b); P.r(pp.x - 2, y1, 6, 1, s.c); P.r(pp.x - 2, y1 + 2, 6, 1, s.e2);
      });
    }

    // ======== TRONCO ========
    var ti = lado ? ps.incl : 0; // inclinação desloca o tronco
    var tx = lado ? 11 - ti : 10, tw = lado ? 10 : 12, ty = 17 + by, th = 13;
    var fimRoupa = jaleco ? 36 + ag : (vestido ? 38 + ag : ty + th);
    // braço de trás (só de lado)
    function braco(xb, yb, compr, t, mao, frenteCorpo, estendido) {
      if (estendido) { // braço reto pra frente (golpe/mira) — de lado é horizontal
        if (lado) { P.r(xb - compr, yb + 2, compr, 3, t.b); P.r(xb - compr, yb + 2, compr, 1, t.c); P.r(xb - compr - 2, yb + 1, 3, 4, mao.b); P.p(xb - compr - 2, yb + 1, mao.c); }
        else { P.bloco(xb, yb, 3, compr, t); P.r(xb, yb + compr, 3, 3, mao.b); P.p(xb, yb + compr, mao.c); }
        return;
      }
      var mangaFim = jaleco ? compr - 2 : 4;
      P.bloco(xb, yb, 3, mangaFim, t);
      P.bloco(xb, yb + mangaFim, 3, compr - mangaFim, mao, true);
      P.r(xb, yb + compr, 3, 2, mao.b); P.r(xb, yb + compr + 1, 3, 1, mao.e); P.p(xb + 1, yb + compr, mao.c);
      P.r(xb, yb + mangaFim, 3, 1, esc(t.b, 0.35)); // sombra da manga no braço
    }
    var mangaT = jaleco ? tons('#f4f1ea') : cam;
    if (lado) braco(tx + 5 + ti, ty + 1, 10 + (ps.bracoD > 0 ? 0 : 0), tons(mangaT.e), tons(pele.e), false, ps.mira);

    // corpo
    if (vestido) {
      // vestido rodado
      for (var vy = ty; vy < fimRoupa; vy++) {
        var abre = Math.max(0, Math.floor((vy - ty - 8) / 3));
        P.r(tx - abre, vy, tw + abre * 2, 1, cam.b);
      }
      P.r(tx, ty, 1, th, cam.c); P.r(tx + tw - 1, ty, 1, fimRoupa - ty, cam.e);
      P.r(tx - 3, fimRoupa - 1, tw + 6, 1, cam.e);
      for (var fl = 0; fl < 6; fl++) P.p(tx + 1 + (fl * 5) % tw, ty + 4 + (fl * 7) % 14, cam2.c);
    } else {
      P.bloco(tx, ty, tw, th, cam);
      if (padrao === 'listra') for (var ly = ty + 2; ly < ty + th; ly += 3) { P.r(tx + 1, ly, tw - 2, 1, cam2.b); P.p(tx + tw - 2, ly, cam2.e); }
      if (padrao === 'xadrez') { for (var xy = ty + 2; xy < ty + th; xy += 4) P.r(tx + 1, xy, tw - 2, 1, cam2.b); for (var xx = tx + 2; xx < tx + tw - 1; xx += 4) P.r(xx, ty + 1, 1, th - 2, cam2.e); }
      if (padrao === 'metade' && !lado) { P.r(tx + tw / 2, ty, tw / 2, th, cam2.b); P.r(tx + tw - 1, ty, 1, th, cam2.e); P.r(tx + tw / 2, ty, tw / 2, 1, cam2.c); }
      if (padrao === 'metade' && lado) { P.r(tx, ty + 6, tw, th - 6, cam2.b); }
      if (padrao === 'macacao') { // macacão por cima (cor da calça), alças
        var mx = lado ? tx + 1 : tx + 2, mw = lado ? tw - 2 : tw - 4;
        P.bloco(mx, ty + 5, mw, th - 5, calca, true);
        if (!lado) { P.r(tx + 2, ty, 2, 5, calca.b); P.r(tx + tw - 4, ty, 2, 5, calca.e); if (!costas) { P.p(tx + 3, ty + 5, '#d8d0c0'); P.p(tx + tw - 3, ty + 5, '#d8d0c0'); P.r(mx + 2, ty + 7, mw - 4, 3, calca.e); } }
      }
      if (jaleco) {
        var jal = tons('#f4f1ea');
        P.bloco(tx - 1, ty, tw + 2, fimRoupa - ty, jal);
        if (!costas && !lado) { P.r(tx + 4, ty + 2, 4, th - 2, cam2.b); P.r(tx + 5, ty + 1, 2, 3, pele.b); P.r(tx + 3, ty, 1, fimRoupa - ty, jal.e); P.r(tx + 8, ty, 1, fimRoupa - ty, jal.e); P.r(tx + 1, ty + 8, 2, 2, jal.e); }
        if (lado) P.r(tx + 1, ty + 1, 1, fimRoupa - ty - 1, jal.e);
      }
      // volume do tronco: ombro arredondado, cintura mais fina, sombra do lado
      // direito, dobra embaixo do peito e (de costas) a coluna
      if (!jaleco) {
        g.clearRect(tx, ty, 1, 1); g.clearRect(tx + tw - 1, ty, 1, 1);
        g.clearRect(tx, ty + th - 4, 1, 3); g.clearRect(tx + tw - 1, ty + th - 4, 1, 3);
        P.r(tx + 1, ty + th - 4, 1, 3, cam.c); P.r(tx + tw - 2, ty + th - 4, 1, 3, cam.e2);
        if (!lado) { P.r(tx + tw - 3, ty + 2, 1, th - 5, cam.e); P.p(tx + 3, ty + 6, cam.e); P.p(tx + tw - 4, ty + 6, cam.e); P.r(tx + 4, ty + 7, tw - 8, 1, cla(cam.e, 0.25)); }
        if (costas) { P.r(tx + tw / 2, ty + 3, 1, th - 5, cam.e); P.r(tx + 2, ty + 2, 3, 1, cam.e); P.r(tx + tw - 5, ty + 2, 3, 1, cam.e); }
        if (lado) { P.r(tx + 1, ty + 4, 1, 5, cam.e); }
      }
      // cinto e gola
      if (!jaleco && padrao !== 'macacao') { P.r(tx, ty + th - 1, tw, 1, esc(d.calca || '#4a3a2e', 0.5)); if (!costas && !lado) P.r(tx + tw / 2 - 1, ty + th - 1, 2, 1, '#c8a040'); }
      if (!costas && !lado) { P.r(tx + 4, ty, 4, 1, pele.e); P.p(tx + 5, ty + 1, pele.e); P.p(tx + 6, ty + 1, pele.e); }
    }

    // braços da frente
    var compr = 10;
    if (!lado) {
      var golpe = ps.atk === 2, prep = ps.atk === 1;
      // esquerdo (da tela): lado iluminado
      braco(tx - 3, ty + 1 - (prep ? 0 : 0), compr + ps.bracoE, mangaT, pele, true, false);
      // direito: segura a coisa / golpeia / mira
      if (ps.mira || golpe) braco(tx + tw, ty + 1, compr - 2, tons(mangaT.e), pele, true, true);
      else if (prep) { P.bloco(tx + tw, ty - 6, 3, 8, tons(mangaT.e)); P.r(tx + tw, ty - 8, 3, 3, pele.b); }
      else braco(tx + tw, ty + 1, compr + ps.bracoD, tons(mangaT.e), tons(pele.e), true, false);
      if (costas) { /* nas costas a mão some atrás do corpo */ }
    } else {
      var est = ps.mira || ps.atk === 2;
      if (ps.atk === 1) { P.bloco(tx + 3, ty - 5, 3, 8, mangaT); P.r(tx + 3, ty - 7, 3, 3, pele.b); }
      else braco(tx + 3 - ti - (est ? 0 : ps.bracoE > 0 ? 1 : 0), ty + 1, compr - (est ? 3 : 0) + (est ? 0 : Math.abs(ps.bracoE) > 1 ? -1 : 0), mangaT, pele, true, est);
      if (!est && ps.bracoE) { P.p(tx + 3 - ti + (ps.bracoE > 0 ? -1 : 1), ty + compr - 1, pele.b); }
    }

    // extras do peito
    if (!costas) {
      if (ex.indexOf('estetoscopio') >= 0) { P.r(tx + 2, ty, 1, 5, '#5a5f66'); P.r(tx + tw - 3, ty, 1, 5, '#5a5f66'); P.r(tx + 3, ty + 5, tw - 6, 1, '#5a5f66'); P.r(tx + tw / 2, ty + 6, 2, 2, '#9aa3ab'); }
      if (ex.indexOf('terco') >= 0 && !lado) { for (var tc = 0; tc < 5; tc++) { P.p(tx + 3 + tc, ty + 1 + tc, '#e8e0c8'); P.p(tx + tw - 4 - tc, ty + 1 + tc, '#e8e0c8'); } P.r(tx + tw / 2, ty + 6, 1, 4, '#c8a040'); P.r(tx + tw / 2 - 1, ty + 7, 3, 1, '#c8a040'); }
      if (ex.indexOf('colar') >= 0 && !lado) { P.r(tx + 3, ty + 1, tw - 6, 1, '#e8c040'); P.p(tx + tw / 2, ty + 2, '#ffe080'); }
    }

    // ======== PESCOÇO E CABEÇA ========
    var hy = 3 + by + ps.hy, hx = lado ? 11 - ti : 11, hw = lado ? 9 : 10;
    P.r(lado ? hx + 3 : 14, hy + 11, 4, 3, pele.e);
    // cabeça arredondada
    P.r(hx + 1, hy + 1, hw - 2, 11, pele.b); P.r(hx, hy + 2, hw, 8, pele.b);
    P.r(hx, hy + 2, 1, 8, pele.c); P.r(hx + 1, hy + 1, 1, 2, pele.c);
    P.r(hx + hw - 1, hy + 3, 1, 7, pele.e); P.r(hx + 2, hy + 11, hw - 4, 1, pele.e);
    if (!lado) { P.r(hx - 1, hy + 5, 1, 3, pele.b); P.r(hx + hw, hy + 5, 1, 3, pele.e); } // orelhas
    else P.r(hx + 5, hy + 5, 2, 3, pele.e); // orelha de lado

    // rosto
    if (!costas) {
      var olho = '#1e1418', ox = lado ? hx + 1 : hx + 2, ox2 = hx + hw - 4, oy = hy + 5;
      var desenhaOlho = function (x) {
        if (ps.olhos === 'fechado' || ps.olhos === 'piscando' || d.olhos === 'sono') { P.r(x, oy + 1, 2, 1, olho); return; }
        if (d.olhos === 'arregalado') { P.r(x, oy - 1, 2, 3, '#f2f0ea'); P.r(x + (lado ? 0 : 1), oy, 1, 2, olho); return; }
        P.r(x, oy, 2, 2, olho); P.p(x, oy, d.olhos === 'brilho' ? '#ffffff' : '#5a4a50');
      };
      desenhaOlho(ox); if (!lado) desenhaOlho(ox2);
      // sobrancelha
      P.r(ox, oy - 2, 2, 1, cab.e); if (!lado) P.r(ox2, oy - 2, 2, 1, cab.e);
      // nariz
      if (lado) { P.r(hx - 1, hy + 6, 1, 2, pele.b); P.p(hx - 1, hy + 7, pele.e); } else { P.p(hx + 4, hy + 7, pele.e); P.p(hx + 5, hy + 8, pele.e); }
      // boca
      var bx = lado ? hx : hx + 3, bw = lado ? 2 : 4, byy = hy + 9;
      if (ps.boca === 'aberta') { P.r(bx, byy, bw, 2, '#5a1e1e'); P.r(bx, byy, bw, 1, '#2a0e0e'); }
      else if (d.boca === 'sorriso') { P.r(bx, byy, bw, 1, '#7a2a2a'); P.p(bx - 1, byy - 1, '#7a2a2a'); if (!lado) P.p(bx + bw, byy - 1, '#7a2a2a'); }
      else P.r(bx, byy, bw, 1, esc(d.pele || '#c98b5e', 0.45));
      // óculos, bigode, barba
      if (ex.indexOf('oculos') >= 0) { var fo = '#2a2a33'; if (lado) { P.r(ox - 1, oy - 1, 4, 4, fo); P.r(ox, oy, 2, 2, '#bcd8e8'); P.r(ox + 3, oy, 3, 1, fo); } else { P.r(ox - 1, oy - 1, 4, 4, fo); P.r(ox2 - 1, oy - 1, 4, 4, fo); P.r(ox, oy, 2, 2, '#bcd8e8'); P.r(ox2, oy, 2, 2, '#bcd8e8'); P.p(ox, oy + 1, olho); P.p(ox2 + 1, oy + 1, olho); P.r(ox + 3, oy, ox2 - ox - 3, 1, fo); } }
      if (ex.indexOf('oculosEscuros') >= 0) { var fe = '#141018'; if (lado) P.r(ox - 1, oy - 1, 5, 3, fe); else { P.r(ox - 1, oy - 1, ox2 - ox + 4, 3, fe); P.p(ox, oy - 1, '#5a6a8a'); P.p(ox2, oy - 1, '#5a6a8a'); } }
      if (ex.indexOf('bigode') >= 0) { P.r(lado ? hx - 1 : hx + 2, hy + 8, lado ? 3 : 6, 1, cab.b); if (!lado) { P.p(hx + 2, hy + 9, cab.b); P.p(hx + 7, hy + 9, cab.b); } }
      if (ex.indexOf('bigodinho') >= 0) { var bgd = cla(d.cabelo || '#2b1d14', 0.25); if (lado) P.r(hx - 1, hy + 8, 2, 1, bgd); else P.r(hx + 3, hy + 8, 4, 1, bgd); } // buço ralo
      if (ex.indexOf('mascara') >= 0) { // máscara respiradora: corpo cinza, cartuchos claros, filtro preto com faixa amarela
        if (lado) { P.r(hx + 3, hy + 7, 4, 1, '#1a1a1e'); P.r(hx - 1, hy + 7, 4, 4, '#7a7e86'); P.r(hx - 1, hy + 7, 4, 1, '#9aa0a8'); P.r(hx - 2, hy + 8, 2, 3, '#24242a'); P.p(hx - 2, hy + 8, '#e8c030'); }
        else { P.r(hx, hy + 7, 1, 1, '#1a1a1e'); P.r(hx + hw - 1, hy + 7, 1, 1, '#1a1a1e'); P.r(hx + 2, hy + 7, 6, 4, '#7a7e86'); P.r(hx + 2, hy + 7, 6, 1, '#9aa0a8'); P.r(hx + 1, hy + 8, 2, 2, '#b8bec6'); P.r(hx + hw - 3, hy + 8, 2, 2, '#b8bec6'); P.r(hx + 4, hy + 9, 2, 2, '#24242a'); P.r(hx + 4, hy + 9, 2, 1, '#e8c030'); }
      }
      if (ex.indexOf('barba') >= 0) { if (lado) { P.r(hx, hy + 8, 5, 4, cab.b); P.r(hx, hy + 9, 2, 1, '#7a2a2a'); } else { P.r(hx + 1, hy + 8, hw - 2, 4, cab.b); P.r(hx + 1, hy + 8, 1, 3, cab.c); P.r(hx + 3, hy + 9, 4, 1, '#5a1e1e'); P.r(hx, hy + 6, 1, 4, cab.b); P.r(hx + hw - 1, hy + 6, 1, 4, cab.e); } }
    }

    // ======== CABELO / CHAPÉU ========
    cabeca(P, estilo, hx, hy, hw, lado, costas, cab, chap, cam, d);
    if (ex.indexOf('faixa') >= 0) { var fx = tons(d.faixa || '#7a2a1c'); P.r(hx - 1, hy + 3, hw + 2, 2, fx.b); P.r(hx - 1, hy + 3, hw + 2, 1, fx.c); if (costas || lado) { P.r(lado ? hx + hw - 1 : hx + 4, hy + 4, 2, 5, fx.e); } }

    // ======== NA MÃO ========
    if (!costas && !ps.mira && ps.atk === 0) acessorio(P, d.acessorio, lado ? tx - 1 - ti : tx + tw, ty + compr + 1 + (lado ? 0 : ps.bracoD), lado);

    // ======== MANIA ========
    if (ps.mania >= 0) mania(P, id, ps.mania, tx, tw, ty, hx, hy, hw, pele, lado);
  }

  function cabeca(P, estilo, hx, hy, hw, lado, costas, cab, chap, cam, d) {
    var c = cab, t;
    function topo(alt, larg) { // calota de cabelo
      P.r(hx + 1, hy - 1, hw - 2, alt, c.b); P.r(hx, hy, hw, alt - 1, c.b);
      P.r(hx + 2, hy - 1, 3, 1, c.c); P.r(hx + 1, hy, 2, 1, c.c2); P.r(hx + hw - 1, hy + 1, 1, alt - 2, c.e);
    }
    switch (estilo) {
      case 'careca':
        P.r(hx + 2, hy, 3, 1, cla(d.pele || '#c98b5e', 0.4)); // brilho da careca
        if (!lado) { P.r(hx, hy + 4, 1, 3, c.e); P.r(hx + hw - 1, hy + 4, 1, 3, c.e); } else P.r(hx + 5, hy + 3, 3, 3, c.e);
        if (costas) P.r(hx + 1, hy + 6, hw - 2, 3, c.e);
        break;
      case 'liso':
        topo(4); P.r(hx, hy + 2, 2, lado ? 3 : 6, c.b); P.r(hx + hw - 2, hy + 2, 2, 6, c.e);
        if (!lado && !costas) { P.r(hx + 2, hy + 2, 4, 1, c.b); P.p(hx + 6, hy + 1, c.e); }
        if (costas) P.r(hx, hy + 2, hw, 8, c.b);
        if (lado) P.r(hx + 4, hy + 1, hw - 4, 6, c.b);
        break;
      case 'cacheado':
        for (var k = 0; k < 7; k++) { var cx = hx - 1 + k * 2, cy = hy - 2 + (k % 2); P.r(cx, cy, 3, 3, c.b); P.p(cx, cy, c.c); P.p(cx + 2, cy + 2, c.e); }
        P.r(hx - 1, hy + 1, 2, lado ? 4 : 6, c.b); P.r(hx + hw - 1, hy + 1, 2, 6, c.e);
        if (costas) for (var k2 = 0; k2 < 5; k2++) P.r(hx + k2 * 2, hy + 3 + (k2 % 2) * 2, 3, 3, k2 % 2 ? c.e : c.b);
        if (lado) P.r(hx + 4, hy, hw - 3, 7, c.b);
        break;
      case 'arrepiado':
        topo(3);
        for (var s = 0; s < 5; s++) { P.r(hx + s * 2, hy - 3 + (s % 2), 2, 3, c.b); P.p(hx + s * 2, hy - 3 + (s % 2), c.c); }
        if (costas) P.r(hx, hy + 1, hw, 6, c.b);
        if (lado) P.r(hx + 4, hy, hw - 4, 5, c.b);
        break;
      case 'coque':
        topo(4); P.r(hx + hw / 2 - 2, hy - 4, 5, 4, c.b); P.r(hx + hw / 2 - 2, hy - 4, 2, 1, c.c); P.r(hx + hw / 2 + 2, hy - 3, 1, 3, c.e);
        P.r(hx, hy + 2, 1, 4, c.b); P.r(hx + hw - 1, hy + 2, 1, 4, c.e);
        if (costas) P.r(hx, hy + 2, hw, 7, c.b);
        if (lado) P.r(hx + 4, hy + 1, hw - 4, 5, c.b);
        break;
      case 'capuz':
        t = tons(esc(d.camisa || '#555', 0.1));
        P.r(hx - 1, hy - 1, hw + 2, 4, t.b); P.r(hx - 1, hy + 2, 2, 9, t.b); P.r(hx + hw - 1, hy + 2, 2, 9, t.e); P.r(hx - 1, hy - 1, hw + 2, 1, t.c);
        if (costas) P.r(hx, hy, hw, 11, t.b);
        if (lado) P.r(hx + 3, hy, hw - 2, 11, t.b);
        break;
      case 'bone': case 'boneTras':
        t = chap;
        P.r(hx, hy - 1, hw, 4, t.b); P.r(hx + 1, hy - 2, hw - 2, 1, t.b); P.r(hx + 1, hy - 2, 3, 1, t.c); P.r(hx + hw - 1, hy - 1, 1, 4, t.e);
        P.r(hx, hy + 3, 1, 3, c.b); P.r(hx + hw - 1, hy + 3, 1, 3, c.e);
        var aba = (estilo === 'bone') !== costas; // aba na frente ou atrás
        if (!lado) { if (aba) { P.r(hx - 1, hy + 3, hw + 2, 1, t.e2); P.r(hx, hy + 2, hw, 1, t.e); } else P.r(hx + 3, hy + 2, 4, 1, t.e2); }
        else { if (estilo === 'bone') P.r(hx - 3, hy + 2, 5, 1, t.e2); else P.r(hx + hw - 1, hy + 2, 4, 1, t.e2); P.r(hx + 4, hy + 3, hw - 4, 3, c.b); }
        if (costas) P.r(hx, hy + 3, hw, 6, c.b);
        break;
      case 'chapeu': case 'chapeuPreto': case 'palha':
        t = estilo === 'chapeuPreto' ? tons('#2a2228') : (estilo === 'palha' ? tons(d.chapeu || '#e0c27a') : chap);
        // copa
        P.r(hx + 1, hy - 4, hw - 2, 6, t.b); P.r(hx + 1, hy - 4, 3, 1, t.c2); P.r(hx + 1, hy - 3, 1, 4, t.c); P.r(hx + hw - 2, hy - 4, 1, 6, t.e);
        P.r(hx + 1, hy + 1, hw - 2, 1, esc(t.b, 0.5)); // fita
        // aba larga (chapéu de couro/vaqueiro tem a aba virada)
        var ax = lado ? hx - 4 : hx - 4, aw = lado ? hw + 6 : hw + 8;
        P.r(ax, hy + 2, aw, 2, t.b); P.r(ax, hy + 2, aw, 1, t.c); P.r(ax + aw - 2, hy + 1, 2, 2, t.e);
        if (estilo === 'chapeu') { P.r(ax, hy + 1, 2, 1, t.b); P.r(ax + aw - 2, hy + 1, 2, 1, t.e); for (var st = 0; st < aw; st += 3) P.p(ax + st, hy + 3, t.e2); } // costura de couro
        if (estilo === 'palha') for (var tr = 0; tr < aw; tr += 2) P.p(ax + tr, hy + 2 + (tr % 4 ? 1 : 0), t.e);
        P.r(ax + 1, hy + 4, aw - 2, 1, 'rgba(0,0,0,0.28)'); // sombra da aba no rosto
        if (costas) P.r(hx, hy + 4, hw, 5, c.b);
        else { P.r(hx, hy + 4, 1, 3, c.b); P.r(hx + hw - 1, hy + 4, 1, 3, c.e); }
        break;
      default: // curto
        topo(4); P.r(hx, hy + 2, 1, 3, c.b); P.r(hx + hw - 1, hy + 2, 1, 3, c.e);
        if (!lado && !costas) P.r(hx + 1, hy + 2, 3, 1, c.b);
        if (costas) P.r(hx, hy + 2, hw, 6, c.b);
        if (lado) P.r(hx + 4, hy + 1, hw - 4, 5, c.b);
    }
  }

  function acessorio(P, a, x, y, lado) {
    if (!a) return;
    switch (a) {
      case 'celular': P.r(x, y - 2, 3, 5, '#1e1e24'); P.r(x, y - 2, 3, 1, '#3a3a44'); P.p(x + 1, y - 1, '#9fd8ff'); break;
      case 'maleta': P.r(x - 1, y + 1, 7, 5, '#5a3a22'); P.r(x - 1, y + 1, 7, 1, '#7a5a3a'); P.r(x + 1, y, 3, 1, '#3a2418'); P.p(x + 2, y + 3, '#c8a040'); break;
      case 'carteira': P.r(x, y, 4, 3, '#4a2a1a'); P.p(x + 1, y + 1, '#c8a040'); break;
      case 'panela': P.r(x - 1, y + 1, 7, 4, '#7a8088'); P.r(x - 1, y + 1, 7, 1, '#a8aeb6'); P.r(x - 3, y + 2, 2, 1, '#3a3a44'); break;
      case 'giz': P.r(x, y, 1, 3, '#f2f0ea'); break;
      case 'escapamento': P.r(x - 1, y, 8, 3, '#9aa3ab'); P.r(x - 1, y, 8, 1, '#c8d0d8'); P.r(x + 6, y - 1, 2, 5, '#6a6a72'); break;
      case 'caderno': P.r(x, y - 1, 5, 6, '#c45a4a'); P.r(x + 1, y, 3, 4, '#f2e6c9'); P.r(x, y - 1, 1, 6, '#8a3a2a'); break;
      case 'chave': P.r(x, y, 1, 6, '#9aa3ab'); P.r(x - 1, y + 5, 3, 2, '#9aa3ab'); P.p(x, y + 6, '#3a3a44'); break;
      case 'galao': P.r(x - 1, y + 1, 6, 7, '#c03030'); P.r(x - 1, y + 1, 6, 1, '#e0504a'); P.r(x + 3, y, 2, 2, '#e8c040'); P.p(x, y + 3, '#e0504a'); break;
      case 'copo': P.r(x, y, 3, 4, '#e8d080'); P.r(x, y, 3, 1, '#fff8e0'); P.p(x + 2, y + 2, '#c8a040'); break;
    }
  }

  // a mania de cada um, parado (6 quadros)
  function mania(P, id, i, tx, tw, ty, hx, hy, hw, pele, lado) {
    var mx = tx + tw, my = ty + 4;
    switch (id) {
      case 'helano': // no celular, o rosto azulado
        P.r(hx + 2, hy + 6, 4, 6, '#1e1e24'); P.r(hx + 3, hy + 7, 2, 4, i % 3 === 0 ? '#c8f0ff' : '#9fd8ff');
        P.r(hx + 1, hy + 11, 3, 2, pele.b); if (i === 4) P.p(hx + 4, hy + 8, '#ff7ad8');
        break;
      case 'miguel': // desenhando no caderno
        P.r(tx + 2, ty + 6, 7, 6, '#f2e6c9'); P.r(tx + 2, ty + 6, 7, 1, '#d8cdb0');
        for (var k = 0; k <= i; k++) P.p(tx + 3 + (k * 2) % 6, ty + 8 + (k % 3), '#3a2a20');
        P.r(tx + 7 + (i % 2), ty + 5 + (i % 3), 1, 3, '#e8c040');
        break;
      case 'daniel': // brincando com fósforo
        P.r(mx, my + 3, 1, 4, '#d8b080'); if (i % 3 !== 2) { P.p(mx, my + 1 + (i % 2), '#f7a733'); P.p(mx, my + 2, '#ffe080'); P.p(mx - 1 + (i % 2), my, '#e85030'); }
        break;
      case 'joaopedro': // limpando o escapamento
        P.r(tx - 2, ty + 9, 9, 3, '#9aa3ab'); P.r(tx - 2, ty + 9, 9, 1, '#d0d8e0');
        P.r(tx + (i % 3) * 2, ty + 8, 3, 3, '#c03030'); if (i === 2) P.p(tx + 7, ty + 8, '#ffffff');
        break;
      case 'davi': // conversando com o nada
        if (i < 3) { P.r(hx + hw + 2, hy - 2, 4, 3, '#f2f0ea'); P.p(hx + hw + 3, hy - 1, '#3a2a20'); P.p(hx + hw + 4 + (i % 2), hy - 1, '#3a2a20'); }
        P.r(mx + 1, my - 2 - (i % 2) * 2, 3, 3, pele.b);
        break;
      case 'zeneto': // lendo a bula
        P.r(tx + 2, ty + 3, 8, 7, '#f4f1ea'); for (var l = 0; l < 3; l++) P.r(tx + 3, ty + 5 + l * 2, 6 - (l + i) % 3, 1, '#8a8a9a');
        break;
      default: // espreguiça e coça a cabeça
        if (i >= 2 && i <= 4) { P.r(hx + hw, hy - 1, 3, 4, pele.b); P.r(hx + hw, hy + 3, 3, 6, pele.e); }
    }
  }

  // ---------------- contorno suave ----------------
  function contornar(cv) {
    var g = cv.getContext('2d'), w = cv.width, h = cv.height, img;
    try { img = g.getImageData(0, 0, w, h); } catch (e) { return; }
    if (!img || !img.data || img.data.length < w * h * 4) return;
    var d = img.data, cheio = new Uint8Array(w * h), i, x, y;
    for (i = 0; i < w * h; i++) cheio[i] = d[i * 4 + 3] > 60 ? 1 : 0;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x; if (cheio[i]) continue;
      var n4 = (x > 0 && cheio[i - 1]) || (x < w - 1 && cheio[i + 1]) || (y > 0 && cheio[i - w]) || (y < h - 1 && cheio[i + w]);
      if (n4) { d[i * 4] = CONTORNO[0]; d[i * 4 + 1] = CONTORNO[1]; d[i * 4 + 2] = CONTORNO[2]; d[i * 4 + 3] = 235; }
    }
    g.putImageData(img, 0, 0);
  }

  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; return c; }
  function espelhar(c) { var e = canvas(c.width, c.height), g = e.getContext('2d'); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return e; }
  function silhueta(c, cor) { var s = canvas(c.width, c.height), g = s.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = cor; g.fillRect(0, 0, c.width, c.height); return s; }

  // ---------------- o conjunto de sprites de um personagem ----------------
  function Boneco(chave, def) {
    this.chave = chave; this.def = def; this.id = chave.split(':')[1];
    this.esc = ESC; this.w = W + 2; this.h = H + 2; this.ox = OX + 1; this.oy = OY + 1;
    this.cache = {}; this.anim = {};
    var self = this;
    // listas usadas pela galeria
    Object.keys(ANIM).forEach(function (a) { self.anim[a] = { down: self.lista(a, 'down') }; });
    // compatibilidade com o desenho antigo: 3 quadros por direção
    this.dirs = {}; this.branco = {}; this.vermelho = {};
    ['down', 'up', 'left', 'right'].forEach(function (dir) {
      self.dirs[dir] = [self.quadro('parado', dir, 0), self.quadro('andar', dir, 2), self.quadro('andar', dir, 6)];
      self.branco[dir] = self.dirs[dir].map(function (c) { return self.flash(c, '#ffffff'); });
      self.vermelho[dir] = self.dirs[dir].map(function (c) { return self.flash(c, BSI.acess ? BSI.acess.corAviso() : '#e8403a'); });
    });
    // retratinho do HUD: recorte da cabeça de frente
    var rt = canvas(32, 26), g = rt.getContext('2d');
    g.drawImage(this.quadro('parado', 'down', 0), -1, 0);
    this.retrato = rt; this.retratoEsc = ESC;
  }
  Boneco.prototype.n = function (anim) { return (ANIM[anim] || ANIM.parado).length; };
  Boneco.prototype.quadro = function (anim, dir, i) {
    if (!ANIM[anim]) anim = 'parado';
    var lista = ANIM[anim]; i = ((i % lista.length) + lista.length) % lista.length;
    var k = anim + ':' + dir + ':' + i;
    if (this.cache[k]) return this.cache[k];
    if (dir === 'right') return (this.cache[k] = espelhar(this.quadro(anim, 'left', i)));
    var c = canvas(W + 2, H + 2), g = c.getContext('2d');
    g.translate(1, 1);
    desenhar(g, this.def, dir, lista[i], this.id);
    contornar(c);
    return (this.cache[k] = c);
  };
  Boneco.prototype.lista = function (anim, dir) { var r = [], n = this.n(anim); for (var i = 0; i < n; i++) r.push(this.quadro(anim, dir, i)); return r; };
  Boneco.prototype.flash = function (c, cor) {
    var k = '_f' + cor; c[k] = c[k] || silhueta(c, cor); return c[k];
  };

  // ---------------- ARMAS NA MÃO (arte 2x, apontando pra direita) ----------------
  // px/py = onde a mão segura (em pixels de arte)
  var ARMAS = {
    socaTempo: { w: 30, h: 8, px: 8, py: 4, pintar: function (P) {
      var mad = tons('#7a4a26'), fe = tons('#5a5f66');
      P.r(0, 3, 9, 4, mad.b); P.r(0, 3, 9, 1, mad.c); P.r(0, 6, 9, 1, mad.e); P.r(0, 4, 2, 3, mad.e); // coronha
      P.r(9, 3, 8, 2, mad.b); P.r(9, 5, 3, 2, mad.e); // guarda-mão
      P.r(10, 2, 20, 2, fe.b); P.r(10, 2, 20, 1, fe.c2); P.p(29, 2, fe.e2); // cano comprido
      P.r(9, 5, 2, 2, '#2a2a33'); P.p(12, 6, '#c8a040'); // gatilho e cão
    } },
    calibre20: { w: 26, h: 8, px: 7, py: 4, pintar: function (P) {
      var mad = tons('#8a5a30'), fe = tons('#4a4f58');
      P.r(0, 3, 8, 4, mad.b); P.r(0, 3, 8, 1, mad.c); P.r(0, 6, 8, 1, mad.e);
      P.r(8, 2, 18, 2, fe.b); P.r(8, 4, 18, 1, fe.e); P.r(8, 2, 18, 1, fe.c2); // cano duplo
      P.r(8, 4, 6, 2, mad.b); P.r(8, 6, 2, 1, '#2a2a33');
    } },
    peixeira: { w: 16, h: 6, px: 3, py: 3, pintar: function (P) {
      P.r(0, 2, 5, 3, '#6a3a1e'); P.r(0, 2, 5, 1, '#8a5a32'); P.p(2, 3, '#c8a040');
      P.r(5, 2, 10, 2, '#c8d0d8'); P.r(5, 2, 10, 1, '#f2f6fa'); P.p(15, 2, '#c8d0d8'); P.r(5, 4, 1, 1, '#8a9098');
    } },
    facao: { w: 20, h: 8, px: 3, py: 4, pintar: function (P) {
      P.r(0, 3, 5, 3, '#3a2418'); P.r(0, 3, 5, 1, '#5a3a22');
      P.r(5, 2, 13, 4, '#aeb6be'); P.r(5, 2, 13, 1, '#e8eef4'); P.r(15, 3, 4, 3, '#aeb6be'); P.r(5, 5, 13, 1, '#7a8088');
    } },
    maleta: { w: 14, h: 12, px: 4, py: 2, pintar: function (P) {
      P.r(3, 0, 5, 2, '#3a2418'); P.r(0, 2, 12, 9, '#5a3a22'); P.r(0, 2, 12, 1, '#7a5a3a'); P.r(0, 10, 12, 1, '#3a2418'); P.p(6, 5, '#c8a040'); P.r(1, 6, 10, 1, '#4a2a18');
    } },
    chave: { w: 16, h: 8, px: 2, py: 4, pintar: function (P) {
      P.r(0, 3, 11, 2, '#9aa3ab'); P.r(0, 3, 11, 1, '#d0d8e0'); P.r(11, 1, 4, 6, '#9aa3ab'); P.r(12, 3, 3, 2, 'rgba(0,0,0,0)'); P.r(13, 3, 2, 2, '#3a3a44'); P.p(11, 1, '#d0d8e0');
    } }
  };
  var cacheArma = {};
  function arma(id) {
    if (cacheArma[id] !== undefined) return cacheArma[id];
    var A = ARMAS[id]; if (!A) return (cacheArma[id] = null);
    var c = canvas(A.w + 2, A.h + 2), g = c.getContext('2d'); g.translate(1, 1);
    A.pintar(new Pincel(g)); contornar(c);
    return (cacheArma[id] = { c: c, px: A.px + 1, py: A.py + 1 });
  }

  BSI.boneco = { Boneco: Boneco, ANIM: ANIM, ESC: ESC, tons: tons, esc: esc, cla: cla, desenhar: desenhar, arma: arma, ARMAS: ARMAS, Pincel: Pincel, contornar: contornar, canvas: canvas, espelhar: espelhar, silhueta: silhueta };

  // ---------------- liga no lugar do boneco antigo ----------------
  var cacheB = {};
  BSI.sprites.humano = function (chave, def) {
    if (cacheB[chave]) return cacheB[chave];
    return (cacheB[chave] = new Boneco(chave, def || {}));
  };
  var limparVelho = BSI.sprites.limpar;
  BSI.sprites.limpar = function () { cacheB = {}; if (limparVelho) limparVelho(); };

  // desenha qualquer sprite (arte 1x ou 2x) na posição do mundo, com os pés em (x, y)
  BSI.sprites.pintar = function (g, spr, img, x, y, alfa) {
    var e = spr.esc || 1;
    if (alfa !== undefined && alfa < 1) g.globalAlpha = alfa;
    g.drawImage(img, Math.round((x - spr.ox / e) * e) / e, Math.round((y - spr.oy / e) * e) / e, img.width / e, img.height / e);
    if (alfa !== undefined && alfa < 1) g.globalAlpha = 1;
  };
})();
