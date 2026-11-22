/* =========================================================
   minimapa.js — MINIMAPA, MAPA COMPLETO [M] e ALVO DO OBJETIVO
   - Névoa: só aparece o que o grupo já viu (salvo no jogo).
   - Ícones: você (amarelo), grupo (branco), inimigos perto
     (vermelho), gente pra conversar (azul), fogueira (laranja),
     saídas (verde), objetivo (estrela) e sua marca (rosa).
   - Objetivo fora da área: seta na borda com a distância.
   - Mapa completo: roda do mouse = zoom, arrastar = mover,
     clique = marcar/desmarcar um ponto. [M] ou [Esc] fecha.
   Números em js/config/visual.js → minimapa.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, U = BSI.util, T = BSI.cfg.TILE;
  function CFG() { var c = BSI.config.visual.minimapa, s = BSI.save.cfg(); return { ligado: s.minimapa !== undefined ? s.minimapa : c.ligado, posicao: s.minimapaPos || c.posicao, tamanho: s.minimapaTam || c.tamanho, transp: s.minimapaTransp !== undefined ? s.minimapaTransp : c.transparencia, raio: c.raioRevelar, hz: c.atualizacoesPorSegundo }; }
  var LARG = { pequeno: 56, medio: 74, grande: 96 }, PPT = { pequeno: 2, medio: 2, grande: 3 };

  var COR = {
    '.': C.terra, ',': '#a88a48', '^': C.picarra, 'B': '#4a4440', '=': '#9a948a', 'f': '#8a6a48', 'L': '#e8e2d0',
    '#': '#a8502e', 'i': '#e8e0cc', 'p': '#5a3a22', 'T': '#2e5a2a', 'M': '#4a7a3a', 'x': '#4a7a3a', 'G': '#5a4030',
    'P': '#6a6058', 'D': '#6a6058', '_': '#6a6058', 'C': '#7a5a3a', '~': '#2e5a8a', 'v': '#0a0710',
    'b': '#6a4a2a', 'k': '#6a4a2a', 'm': '#6a4a2a', 'e': '#3a2a20', 'q': '#8a5a32', 'n': '#c0303a'
  };

  // ---------------- névoa (o que já foi visto) ----------------
  var nevoa = {}; // mapaId -> Uint8Array
  function nevoaDe(mapa) {
    var id = mapa.id, S = BSI.state;
    if (nevoa[id] && nevoa[id].length === mapa.w * mapa.h) return nevoa[id];
    var a = new Uint8Array(mapa.w * mapa.h);
    var salvo = S.nevoa && S.nevoa[id];
    if (salvo) for (var i = 0; i < a.length; i++) { var c = parseInt(salvo[i >> 2], 16) || 0; a[i] = (c >> (i & 3)) & 1; }
    return (nevoa[id] = a);
  }
  function salvarNevoa(mapa) {
    var a = nevoaDe(mapa), s = '';
    for (var i = 0; i < a.length; i += 4) s += ((a[i] | (a[i + 1] << 1) | (a[i + 2] << 2) | (a[i + 3] << 3)) & 15).toString(16);
    BSI.state.nevoa = BSI.state.nevoa || {};
    BSI.state.nevoa[mapa.id] = s;
  }

  // ---------------- imagem do mapa (1 pixel por tile) ----------------
  var img = { id: null, c: null, nev: null, sujo: true, sujoNev: true };
  function imagem(mapa) {
    if (img.id !== mapa.id || img.mapa !== mapa) {
      img.id = mapa.id; img.mapa = mapa; img.sujo = true; img.sujoNev = true;
      img.c = document.createElement('canvas'); img.c.width = mapa.w; img.c.height = mapa.h;
      img.nev = document.createElement('canvas'); img.nev.width = mapa.w; img.nev.height = mapa.h;
    }
    if (img.sujo) {
      var g = img.c.getContext('2d');
      for (var y = 0; y < mapa.h; y++) for (var x = 0; x < mapa.w; x++) {
        g.fillStyle = COR[mapa.ch(x, y)] || '#8a7a6a'; g.fillRect(x, y, 1, 1);
      }
      // pontilhado leve pra dar textura
      g.fillStyle = 'rgba(0,0,0,0.08)';
      for (var y2 = 0; y2 < mapa.h; y2++) for (var x2 = (y2 & 1); x2 < mapa.w; x2 += 2) g.fillRect(x2, y2, 1, 1);
      img.sujo = false;
    }
    if (img.sujoNev) {
      var a = nevoaDe(mapa), gn = img.nev.getContext('2d');
      gn.clearRect(0, 0, mapa.w, mapa.h); gn.fillStyle = '#1a121e';
      for (var j = 0; j < a.length; j++) if (!a[j]) gn.fillRect(j % mapa.w, Math.floor(j / mapa.w), 1, 1);
      img.sujoNev = false;
    }
    return img;
  }

  // ---------------- rota entre mapas (pelas portas) ----------------
  function rotaPorta(deMapa, praMapa) {
    if (deMapa === praMapa) return null;
    var maps = BSI.data.maps, fila = [[deMapa, null]], visto = {}; visto[deMapa] = true;
    while (fila.length) {
      var at = fila.shift(), ps = maps[at[0]].portas || [];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i]; if (visto[p.para] || !maps[p.para]) continue;
        var primeira = at[1] || p;
        if (p.para === praMapa) return primeira;
        visto[p.para] = true; fila.push([p.para, primeira]);
      }
    }
    return null;
  }

  // ---------------- resolver o alvo do objetivo ----------------
  function alvoDoTexto(txt) {
    if (!txt) return null;
    var lista = BSI.data.alvosObjetivo || [];
    for (var i = 0; i < lista.length; i++) if (txt.indexOf(lista[i].trecho) >= 0) return lista[i].alvo;
    return null;
  }
  function propCom(m, dialogo) {
    var ids = Array.isArray(dialogo) ? dialogo : [dialogo];
    for (var k = 0; k < ids.length; k++) for (var i = 0; i < m.props.length; i++) {
      var p = m.props[i]; if (p.morto) continue;
      if (p.dialogo === ids[k] || (p.dialogo && typeof p.dialogo === 'object' && Object.keys(p.dialogo).some(function (c) { return p.dialogo[c] === ids[k]; }))) return p;
    }
    return null;
  }
  function resolver(m) {
    var S = BSI.state, a = S.objetivoAlvo !== undefined ? S.objetivoAlvo : alvoDoTexto(S.objetivo);
    if (!a) return null;
    if (a.chefe) return m.chefe && !m.chefe.morto ? { x: m.chefe.x, y: m.chefe.y, aqui: true } : null;
    if (a.caixa) return m.caixa && m.caixa.ativa ? { x: m.caixa.x, y: m.caixa.y, aqui: true } : null;
    if (a.diazepan) { var dz = m.props.filter(function (p) { return p.diazepan; })[0]; return dz ? { x: dz.x, y: dz.y, aqui: true } : null; }
    if (a.plano) {
      if (m.mapa.id !== 'praca_festa') return null;
      var passo = !BSI.story.tem('gerador_sabotado') ? propCom(m, 'gerador_palanque') : (!BSI.story.tem('botija_recuperada') ? propCom(m, 'botija_camarim') : null);
      return passo ? { x: passo.x, y: passo.y, aqui: true } : { x: 18 * T + 8, y: 18 * T + 8, aqui: true };
    }
    if (a.mapa && a.mapa !== m.mapa.id) {
      var porta = rotaPorta(m.mapa.id, a.mapa);
      return porta ? { x: (porta.x + porta.w / 2) * T, y: (porta.y + porta.h / 2) * T, porta: true } : null;
    }
    if (a.dialogo) { var p = propCom(m, a.dialogo); return p ? { x: p.x, y: p.y, aqui: true } : null; }
    if (a.npc) { var n = m.acharNpc(a.npc); return n ? { x: n.x, y: n.y, aqui: true } : null; }
    if (a.x !== undefined) return { x: a.x * T + T / 2, y: a.y * T + T / 2, aqui: true };
    return null;
  }

  var MM = BSI.minimapa = {
    alvo: null, tRevelar: 0,
    rotaPorta: rotaPorta, alvoDoTexto: alvoDoTexto, resolver: resolver,
    cfg: CFG,
    // retângulo do minimapa na tela (virtual)
    caixa: function () {
      var c = CFG(); if (!c.ligado) return null;
      // tela estreita em luta de chefe: o minimapa cede o lugar pra barra do chefe
      var mj = BSI.jogo && BSI.jogo.mundo, chj = mj && mj.chefe;
      if (chj && chj.ativo && BSI.view.w < 320 && ['derrotado', 'derrotada', 'paz', 'desafio'].indexOf(chj.estado) < 0) return null;
      var w = LARG[c.tamanho] || 74, h = Math.round(w * 0.68), W = BSI.view.w, H = BSI.view.h;
      var x = c.posicao.indexOf('Direita') >= 0 ? W - w - 4 : 4;
      var y = c.posicao.indexOf('cima') >= 0 ? 4 : H - h - 14;
      if (c.posicao === 'cimaEsquerda') y = 52; // embaixo dos rostos do grupo
      return { x: x, y: y, w: w, h: h, ppt: PPT[c.tamanho] || 2 };
    },
    // quanto o canto de cima à direita está ocupado (o HUD desce)
    ocupaDireita: function () { var b = MM.caixa(); return b && b.y < 10 && b.x > BSI.view.w / 2 ? b.h + 6 : 0; },
    sujar: function () { img.sujo = true; },

    atualizar: function (m, dt) {
      var c = CFG();
      MM.tRevelar -= dt;
      if (MM.tRevelar > 0) return;
      MM.tRevelar = 1 / c.hz;
      // revela em volta do grupo
      var a = nevoaDe(m.mapa), mudou = false, r = c.raio;
      m.herois.forEach(function (h, idx) {
        if (h.caido) return;
        var rr = idx === m.liderIdx ? r : Math.round(r * 0.6);
        var cx = Math.floor(h.x / T), cy = Math.floor(h.y / T);
        for (var y = cy - rr; y <= cy + rr; y++) for (var x = cx - rr; x <= cx + rr; x++) {
          if (x < 0 || y < 0 || x >= m.mapa.w || y >= m.mapa.h) continue;
          if ((x - cx) * (x - cx) + (y - cy) * (y - cy) > rr * rr) continue;
          var i = y * m.mapa.w + x; if (!a[i]) { a[i] = 1; mudou = true; }
        }
      });
      if (mudou) { img.sujoNev = true; salvarNevoa(m.mapa); }
      MM.alvo = resolver(m);
    },

    // ícones (compartilhado entre minimapa e mapa completo)
    icones: function (g, m, ox, oy, esc, x0, y0, w, h, tempo) {
      function ponto(px, py, cor, tam) {
        var sx = Math.round(ox + px / T * esc), sy = Math.round(oy + py / T * esc);
        if (sx < x0 || sy < y0 || sx >= x0 + w || sy >= y0 + h) return false;
        g.fillStyle = cor; g.fillRect(sx - (tam >> 1), sy - (tam >> 1), tam, tam); return true;
      }
      var a = nevoaDe(m.mapa);
      function visto(px, py) { var tx = Math.floor(px / T), ty = Math.floor(py / T); return a[ty * m.mapa.w + tx]; }
      (m.dados.portas || []).forEach(function (p) { var px = (p.x + p.w / 2) * T, py = (p.y + p.h / 2) * T; if (visto(px, py)) ponto(px, py, '#7ad07a', 3); });
      m.props.forEach(function (p) {
        if (p.morto || p.invisivel) return;
        if (p.fogueira && visto(p.x, p.y)) ponto(p.x, p.y, '#f7a733', 2);
        else if (p instanceof BSI.Npc && p.dialogo && visto(p.x, p.y)) ponto(p.x, p.y, '#6ab0f0', 2);
      });
      var L = m.lider();
      m.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos' && U.dist(e, L) < 200) ponto(e.x, e.y, BSI.acess ? BSI.acess.corInimigo(e.chefe) : (e.chefe ? '#ff4040' : '#e8503a'), e.chefe ? 3 : 2); });
      m.herois.forEach(function (h) { if (h !== L && !h.caido) ponto(h.x, h.y, '#f2e6c9', 1); });
      var marca = BSI.state.marcas && BSI.state.marcas[m.mapa.id];
      if (marca) ponto(marca.x * T + 8, marca.y * T + 8, Math.floor(tempo * 3) % 2 ? '#ff7ad8' : '#ffffff', 3);
      if (L) ponto(L.x, L.y, Math.floor(tempo * 4) % 2 ? C.amarelo : '#ffffff', 3);
    },
    estrela: function (g, sx, sy, tempo) {
      var c = Math.floor(tempo * 4) % 2 ? C.amarelo : '#fff1a8';
      g.fillStyle = C.contorno; g.fillRect(sx - 3, sy - 1, 7, 3); g.fillRect(sx - 1, sy - 3, 3, 7);
      g.fillStyle = c; g.fillRect(sx - 2, sy, 5, 1); g.fillRect(sx, sy - 2, 1, 5);
    },

    desenhar: function (g, m) {
      var b = MM.caixa(); if (!b || BSI.roteiro.emCena()) return;
      var c = CFG(), im = imagem(m.mapa), L = m.lider(); if (!L) return;
      var tw = b.w / b.ppt, th = b.h / b.ppt;
      var ltx = L.x / T, lty = L.y / T;
      var sx = U.clamp(ltx - tw / 2, 0, Math.max(0, m.mapa.w - tw)), sy = U.clamp(lty - th / 2, 0, Math.max(0, m.mapa.h - th));
      // moldura de cordel (madeira com dente)
      g.globalAlpha = 1 - c.transp;
      g.fillStyle = C.contorno; g.fillRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
      g.fillStyle = '#1a1220'; g.fillRect(b.x, b.y, b.w, b.h);
      var dw = Math.min(tw, m.mapa.w - sx), dh = Math.min(th, m.mapa.h - sy);
      g.imageSmoothingEnabled = false;
      g.drawImage(im.c, sx, sy, dw, dh, b.x, b.y, dw * b.ppt, dh * b.ppt);
      g.drawImage(im.nev, sx, sy, dw, dh, b.x, b.y, dw * b.ppt, dh * b.ppt);
      g.globalAlpha = 1;
      MM.icones(g, m, b.x - sx * b.ppt, b.y - sy * b.ppt, b.ppt, b.x, b.y, b.w, b.h, m.tempo);
      // objetivo: estrela dentro, ou seta na borda
      MM.seta = null;
      if (MM.alvo) {
        var ax = b.x + (MM.alvo.x / T - sx) * b.ppt, ay = b.y + (MM.alvo.y / T - sy) * b.ppt;
        if (ax >= b.x + 2 && ay >= b.y + 2 && ax < b.x + b.w - 2 && ay < b.y + b.h - 2) MM.estrela(g, Math.round(ax), Math.round(ay), m.tempo);
        else {
          var cxm = b.x + b.w / 2, cym = b.y + b.h / 2, dx = ax - cxm, dy = ay - cym;
          var k = Math.min((b.w / 2 - 4) / Math.abs(dx || 0.01), (b.h / 2 - 4) / Math.abs(dy || 0.01));
          var ex = Math.round(cxm + dx * k), ey = Math.round(cym + dy * k);
          var n = U.norm(dx, dy);
          g.fillStyle = C.amarelo;
          for (var i = 0; i < 4; i++) g.fillRect(Math.round(ex - n.x * i - Math.abs(n.y) * (i * 0.6)), Math.round(ey - n.y * i - Math.abs(n.x) * (i * 0.6)), 2, 2);
          for (var j = 0; j < 4; j++) g.fillRect(Math.round(ex - n.x * j + Math.abs(n.y) * (j * 0.6)), Math.round(ey - n.y * j + Math.abs(n.x) * (j * 0.6)), 2, 2);
          MM.seta = { x: ex, y: ey, dist: Math.round(U.dist(L, MM.alvo) / T * 2) };
        }
      }
      // cantinhos de cordel
      g.fillStyle = '#c88a2a'; [[b.x - 2, b.y - 2], [b.x + b.w - 1, b.y - 2], [b.x - 2, b.y + b.h - 1], [b.x + b.w - 1, b.y + b.h - 1]].forEach(function (p) { g.fillRect(p[0], p[1], 3, 3); });
    },
    desenharTexto: function (m) {
      var b = MM.caixa(); if (!b || BSI.roteiro.emCena()) return;
      Tx.escrever('[' + BSI.input.rotulo('mapa') + '] mapa', b.x + b.w, b.y + b.h + 2, { tam: 4.5, alinhar: 'right', cor: '#c8bca0', grossura: 1.5 });
      if (MM.seta) {
        var right = MM.seta.x > b.x + b.w / 2;
        Tx.escrever(MM.seta.dist + 'm', MM.seta.x + (right ? -4 : 4), MM.seta.y - 3, { tam: 4.5, alinhar: right ? 'right' : 'left', cor: C.amarelo, grossura: 1.5 });
      }
    },

    // ---------------- MAPA COMPLETO (tecla M) ----------------
    abrir: function (m) { BSI.jogo.abrirModal(new MapaCompleto(m)); BSI.audio.sfx('menu'); }
  };

  function MapaCompleto(m) {
    this.m = m; this.t = 0;
    var W = BSI.view.w, H = BSI.view.h;
    this.esc = Math.max(2, Math.min(8, Math.floor(Math.min((W - 110) / m.mapa.w, (H - 30) / m.mapa.h))));
    var L = m.lider();
    this.cx = L ? L.x / T : m.mapa.w / 2; this.cy = L ? L.y / T : m.mapa.h / 2;
    this.arrastou = false;
  }
  MapaCompleto.prototype.telaCheia = true;
  MapaCompleto.prototype.area = function () { var W = BSI.view.w, H = BSI.view.h; return { x: 8, y: 20, w: W - 114, h: H - 36 }; };
  MapaCompleto.prototype.atualizar = function (dt) {
    var I = BSI.input, a = this.area(), m = this.m;
    this.t += dt;
    if (this.t > 0.15 && (I.apertou('mapa') || I.apertou('pausa'))) { BSI.jogo.fecharModal(); BSI.audio.sfx('menu'); return; }
    if (I.mouse.roda) { this.esc = U.clamp(this.esc - I.mouse.roda, 2, 10); }
    var v = 30 * dt;
    if (I.segurando('esq')) this.cx -= v; if (I.segurando('dir')) this.cx += v;
    if (I.segurando('cima')) this.cy -= v; if (I.segurando('baixo')) this.cy += v;
    // arrastar com o mouse
    if (I.mouse.segurando && I.mouse.arrasto && this.ultArr) {
      var dx = I.mouse.arrasto.x - this.ultArr.x, dy = I.mouse.arrasto.y - this.ultArr.y;
      if (Math.abs(dx) + Math.abs(dy) > 0) { this.cx -= dx / this.esc; this.cy -= dy / this.esc; this.arrastou = true; }
    }
    if (I.mouse.segurando && I.mouse.arrasto) this.ultArr = { x: I.mouse.arrasto.x, y: I.mouse.arrasto.y };
    else {
      // soltou sem arrastar = clique: marca/desmarca
      if (this.ultArr && !this.arrastou) {
        var mx = this.ultArr.x, my = this.ultArr.y;
        if (mx >= a.x && my >= a.y && mx < a.x + a.w && my < a.y + a.h) {
          var o = this.origem(), tx = Math.floor((mx - o.x) / this.esc), ty = Math.floor((my - o.y) / this.esc);
          var S = BSI.state; S.marcas = S.marcas || {};
          var atual = S.marcas[m.mapa.id];
          if (atual && Math.abs(atual.x - tx) < 2 && Math.abs(atual.y - ty) < 2) delete S.marcas[m.mapa.id];
          else S.marcas[m.mapa.id] = { x: tx, y: ty };
          BSI.audio.sfx('confirma');
        }
      }
      this.ultArr = null; this.arrastou = false;
    }
    this.cx = U.clamp(this.cx, 0, m.mapa.w); this.cy = U.clamp(this.cy, 0, m.mapa.h);
  };
  MapaCompleto.prototype.origem = function () { var a = this.area(); return { x: Math.round(a.x + a.w / 2 - this.cx * this.esc), y: Math.round(a.y + a.h / 2 - this.cy * this.esc) }; };
  MapaCompleto.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, m = this.m, a = this.area(), o = this.origem(), im = imagem(m.mapa);
    g.fillStyle = '#120c1c'; g.fillRect(0, 0, W, H);
    BSI.telas.moldura(g, 2, 2, W - 4, H - 4);
    g.fillStyle = '#1a1220'; g.fillRect(a.x, a.y, a.w, a.h);
    g.save(); g.beginPath(); g.rect(a.x, a.y, a.w, a.h); g.clip();
    g.imageSmoothingEnabled = false;
    g.drawImage(im.c, o.x, o.y, m.mapa.w * this.esc, m.mapa.h * this.esc);
    g.drawImage(im.nev, o.x, o.y, m.mapa.w * this.esc, m.mapa.h * this.esc);
    MM.icones(g, m, o.x, o.y, this.esc, a.x, a.y, a.w, a.h, this.t);
    var alvo = MM.alvo;
    if (alvo) MM.estrela(g, Math.round(o.x + alvo.x / T * this.esc), Math.round(o.y + alvo.y / T * this.esc), this.t);
    g.restore();
    g.fillStyle = C.contorno; g.fillRect(a.x - 1, a.y - 1, a.w + 2, 1); g.fillRect(a.x - 1, a.y + a.h, a.w + 2, 1); g.fillRect(a.x - 1, a.y, 1, a.h); g.fillRect(a.x + a.w, a.y, 1, a.h);
    // legenda (quadradinhos)
    var lx = W - 100, ly = 34;
    [[C.amarelo, 3], ['#f2e6c9', 2], ['#e8503a', 2], ['#6ab0f0', 2], ['#f7a733', 2], ['#7ad07a', 3], ['#ff7ad8', 3]].forEach(function (it, i) {
      g.fillStyle = C.contorno; g.fillRect(lx - 1, ly + i * 11 - 1, 6, 6); g.fillStyle = it[0]; g.fillRect(lx, ly + i * 11, 4, 4);
    });
    MM.estrela(g, lx + 2, ly + 7 * 11 + 2, this.t);
  };
  MapaCompleto.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, m = this.m, lx = W - 92, ly = 33;
    Tx.escrever((m.dados.nome || m.mapa.id).toUpperCase(), 10, 9, { tam: 8, cordel: true, cor: C.contorno, contorno: false });
    ['Você', 'Seu grupo', 'Inimigo perto', 'Gente pra conversar', 'Fogueira', 'Saída', 'Sua marca', 'Objetivo'].forEach(function (t, i) {
      Tx.escrever(t, lx, ly + i * 11 - 1, { tam: 5.5, cor: '#2a1a10', contorno: false });
    });
    var S = BSI.state;
    if (S.objetivo) Tx.quebrar('▸ ' + S.objetivo, 92, 5.5).slice(0, 5).forEach(function (l, i) { Tx.escrever(l, W - 96, ly + 95 + i * 7, { tam: 5.5, cor: '#5a2a10', contorno: false }); });
    Tx.escrever('Roda: zoom · Arrastar: mover · Clique: marcar · [' + BSI.input.rotulo('mapa') + '] fecha', W / 2, H - 14, { tam: 5, alinhar: 'center', cor: '#3a2a20', contorno: false });
  };
  BSI.MapaCompleto = MapaCompleto;
})();
