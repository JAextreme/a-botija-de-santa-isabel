/* =========================================================
   armas_ui.js — TELAS DAS ARMAS (Etapa 3)
   - EQUIPAMENTO [I]: rostos do grupo × 3 espaços. Arraste
     uma arma pra trocar; passe o mouse pra ver os atributos
     e a afinidade (★ bônus / ✗ penalidade).
   - RODA DE ARMAS [segurar Z]: tempo lento, aponte e solte.
   - ARMA NOVA: nome, raridade, atributos e quem fica com ela.
   - OFICINA DO HUGO (em qualquer fogueira acesa) e a
     PRATELEIRA da bodega da Dona Socorro.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, U = BSI.util;
  var AR = function () { return BSI.armas; };
  function cfgArma(id) { return BSI.config.armas[id]; }
  function corRar(r) { return (BSI.config.raridades[r] || {}).cor || C.creme; }
  function caixa(g, x, y, w, h, fundo, ativo) { BSI.cordel.caixa(g, x, y, w, h, fundo || 'rgba(30,20,40,0.94)', ativo); }

  // ícone de uma arma, centralizado na caixa
  function icone(g, id, x, y, w, h, kmax) {
    var a = BSI.boneco.arma(id); if (!a) return;
    var iw = a.c.width / 2, ih = a.c.height / 2, k = Math.min(kmax || 1, (w - 2) / iw, (h - 2) / ih);
    g.drawImage(a.c, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k);
  }
  function dentro(p, r) { return p && p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h; }

  // linhas de atributo da arma (pra caixa de detalhe)
  function atributos(e) {
    var l = [];
    l.push(['Dano', Math.min(1, e.dano / 6)]);
    l.push(['Cadência', Math.min(1, 0.15 / Math.max(0.1, e.cd) * 3)]);
    if (e.tipo === 'tiro') l.push(['Alcance', Math.min(1, ((e.vel || 0) * (e.vida || 0) || e.alcance || 60) / 180)]);
    else l.push(['Alcance', Math.min(1, (e.alcance || 12) / (e.tipo === 'arremesso' ? 140 : 40))]);
    l.push(['Barulho', Math.min(1, (e.barulho || 0) / 320)]);
    return l;
  }
  function textoMun(e) {
    if (e.tipo === 'corpo') return 'corpo a corpo';
    var tipo = e.mun ? BSI.config.municoes[e.mun].nome : 'infinita';
    return (e.pente ? 'pente ' + e.pente + ' · recarga ' + e.recarga.toFixed(1) + 's · ' : '') + 'munição: ' + tipo + (e.mun ? ' (' + AR().mun(e.mun) + ')' : '');
  }
  function detalhe(gTxt, e, x, y, w, heroiId) {
    var R = BSI.config.raridades[e.raridade];
    Tx.escrever(e.nomeCompleto || e.nome, x, y, { tam: 7, cor: R.cor });
    Tx.escrever(R.nome + ' · ' + (e.cat === 'fogo' ? 'de fogo' : (e.cat === 'corpo' ? 'corpo a corpo' : 'arremesso')), x, y + 9, { tam: 5, cor: '#c8bca0' });
    var yy = y + 17;
    Tx.quebrar(e.descricao || '', w, 5.5).slice(0, 3).forEach(function (l) { Tx.escrever(l, x, yy, { tam: 5.5, cor: C.creme, negrito: false }); yy += 7; });
    Tx.escrever(textoMun(e), x, yy + 1, { tam: 5, cor: '#d8cdb0' });
    if (heroiId) {
      var af = e.afinidade, nome = BSI.data.personagens[heroiId].curto;
      Tx.escrever(af > 0 ? '★ ' + nome + ' é bom com ela' : (af < 0 ? '✗ ' + nome + ' é ruim com ela' : '· ' + nome + ': normal'), x, yy + 9, { tam: 5.5, cor: af > 0 ? '#9fe0a0' : (af < 0 ? '#ff9a7a' : '#c8bca0') });
    }
    return yy + 18;
  }

  // ================= TELA DE EQUIPAMENTO =================
  function Equip(m) { this.m = m; this.arrasto = null; this.hover = null; this.antes = false; this.selHeroi = 0; this.t = 0; }
  Equip.prototype.telaCheia = true;
  Equip.prototype.herois = function () { return this.m.herois.map(function (h) { return h.id; }); };
  Equip.prototype.layout = function () {
    var W = BSI.view.w, H = BSI.view.h, ids = this.herois(), r = [];
    var linhaH = Math.min(24, Math.floor((H - 40) / Math.max(4, ids.length))), x0 = 8, y0 = 22, slotW = 34;
    ids.forEach(function (id, i) {
      var y = y0 + i * linhaH;
      r.push({ tipo: 'rosto', heroi: id, x: x0, y: y, w: 18, h: linhaH - 2 });
      for (var s = 0; s < 3; s++) r.push({ tipo: 'slot', heroi: id, slot: s, x: x0 + 20 + s * (slotW + 2), y: y, w: slotW, h: linhaH - 2 });
    });
    // bornal (armas sem dono)
    var bx = x0 + 20 + 3 * (slotW + 2) + 6, livres = AR().garantir().inv.filter(function (p) { return !AR().donoDe(p.uid); });
    var col = Math.max(2, Math.floor((W * 0.55 - bx) / 24));
    livres.forEach(function (p, i) { r.push({ tipo: 'bornal', uid: p.uid, x: bx + (i % col) * 24, y: y0 + 10 + Math.floor(i / col) * 18, w: 22, h: 16 }); });
    r.bornal = { x: bx - 2, y: y0, w: col * 24 + 2, h: H - y0 - 30 };
    r.detalhe = { x: Math.round(W * 0.58), y: y0, w: Math.round(W * 0.42) - 8, h: H - y0 - 30 };
    return r;
  };
  Equip.prototype.pecaDe = function (b) {
    if (b.tipo === 'bornal') return AR().peca(b.uid);
    if (b.tipo === 'slot') return AR().peca(AR().garantir().equip[b.heroi][b.slot]);
    return null;
  };
  Equip.prototype.atualizar = function (dt) {
    var I = BSI.input, L = this.layout(), self = this, mouse = { x: I.mouse.x, y: I.mouse.y };
    this.t += dt;
    if (this.t > 0.15 && (I.apertou('equipamento') || I.apertou('pausa'))) { BSI.jogo.fecharModal(); BSI.audio.sfx('menu'); return; }
    this.hover = null;
    L.forEach(function (b) { if (dentro(mouse, b)) self.hover = b; });
    if (this.hover && this.hover.heroi) this.selHeroi = this.herois().indexOf(this.hover.heroi);
    var segura = I.mouse.segurando;
    if (segura && !this.antes && this.hover && this.pecaDe(this.hover)) { this.arrasto = { uid: this.pecaDe(this.hover).uid, de: this.hover }; BSI.audio.sfx('menu'); }
    if (!segura && this.antes && this.arrasto) {
      var alvo = this.hover;
      if (alvo && alvo.tipo === 'slot') {
        if (AR().equipar(alvo.heroi, alvo.slot, this.arrasto.uid)) { BSI.audio.sfx('confirma'); var e = AR().efetiva({ id: alvo.heroi, st: {} }, AR().peca(this.arrasto.uid)); BSI.hud.aviso(BSI.data.personagens[alvo.heroi].curto + ' equipou: ' + e.nomeCompleto.toUpperCase(), corRar(e.raridade)); }
        else { BSI.audio.sfx('estalo'); BSI.hud.aviso('Arremesso vai no 3º espaço; arma, nos dois primeiros.', '#ff9a7a'); }
      } else if (dentro(mouse, L.bornal) && this.arrasto.de.tipo === 'slot') { AR().desequipar(this.arrasto.de.heroi, this.arrasto.de.slot); BSI.audio.sfx('pegar'); }
      this.arrasto = null;
    }
    this.antes = segura;
  };
  Equip.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, L = this.layout(), self = this, s = AR().garantir();
    g.fillStyle = 'rgba(12,8,18,0.96)'; g.fillRect(0, 0, W, H);
    caixa(g, L.bornal.x, L.bornal.y, L.bornal.w, L.bornal.h, 'rgba(40,28,22,0.9)');
    caixa(g, L.detalhe.x, L.detalhe.y, L.detalhe.w, L.detalhe.h, '#1e1428', false, true);
    L.forEach(function (b) {
      if (b.tipo === 'rosto') {
        var h = self.m.heroi(b.heroi); caixa(g, b.x, b.y, b.w, b.h, '#2a1d38', h === self.m.lider());
        var rt = h.spr.retrato; g.drawImage(rt, b.x + 1, b.y + 2, Math.min(16, rt.width / 2), Math.min(b.h - 3, rt.height / 2));
        return;
      }
      var p = self.pecaDe(b), arrastando = self.arrasto && p && self.arrasto.uid === p.uid;
      var cor = p ? corRar(cfgArma(p.id).raridade) : null;
      caixa(g, b.x, b.y, b.w, b.h, self.hover === b ? '#4a3a2a' : 'rgba(30,20,40,0.94)', self.hover === b);
      if (p && !arrastando) { icone(g, p.id, b.x + 2, b.y + 1, b.w - 4, b.h - 4); g.fillStyle = cor; g.fillRect(b.x + 2, b.y + b.h - 3, b.w - 4, 1); }
      if (b.tipo === 'slot' && s.slot[b.heroi] === b.slot && p) { g.fillStyle = C.amarelo; g.fillRect(b.x + b.w - 4, b.y + 2, 2, 2); }
    });
    if (this.arrasto) { var I = BSI.input; icone(g, AR().peca(this.arrasto.uid).id, I.mouse.x - 10, I.mouse.y - 8, 20, 16); }
  };
  Equip.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, L = this.layout(), s = AR().garantir(), self = this;
    Tx.escrever('EQUIPAMENTO DO GRUPO', 8, 6, { tam: 9, cordel: true, cor: C.amarelo });
    ['principal', 'secundária', 'arremesso'].forEach(function (n, i) { Tx.escrever(n, 8 + 20 + i * 36 + 17, 15, { tam: 4.5, alinhar: 'center', cor: '#c8bca0' }); });
    Tx.escrever('BORNAL (sem dono)', L.bornal.x + 4, L.bornal.y + 3, { tam: 5, cor: '#d8cdb0' });
    // detalhe da arma sob o mouse (ou da arma ativa do herói)
    var b = this.hover, p = b ? this.pecaDe(b) : null, hid = b && b.heroi ? b.heroi : this.herois()[this.selHeroi];
    var D = L.detalhe, x = D.x + 6, y = D.y + 6;
    if (p) { var e = AR().efetiva({ id: hid || 'helano', st: {} }, p); detalhe(null, e, x, y, D.w - 12, b.tipo === 'slot' || b.tipo === 'rosto' ? hid : hid); }
    else if (hid) {
      var pj = BSI.data.personagens[hid], af = BSI.config.afinidades[hid];
      Tx.escrever(pj.nome, x, y, { tam: 7, cor: C.amarelo });
      Tx.quebrar(af ? af.texto : '', D.w - 12, 5.5).forEach(function (l, i) { Tx.escrever(l, x, y + 10 + i * 7, { tam: 5.5, cor: C.creme, negrito: false }); });
    }
    // munição do grupo
    var mm = ['cartucho', 'chumbinho', 'prego', 'rojao', 'querosene', 'garrafa', 'traque', 'bomba', 'farinha', 'pimenta'].filter(function (k) { return AR().mun(k) > 0; });
    Tx.escrever('Munição: ' + (mm.map(function (k) { return AR().mun(k) + ' ' + BSI.config.municoes[k].nome; }).join(' · ') || 'nenhuma') + '    Sucata: ' + s.sucata + '    R$ ' + s.dinheiro, 8, H - 22, { tam: 5, cor: '#d8cdb0' });
    Tx.escrever('Arraste pra trocar · solte no bornal pra guardar · roda do mouse troca a arma no jogo · [' + BSI.input.rotulo('equipamento') + '] fecha', W / 2, H - 12, { tam: 5, alinhar: 'center', cor: '#c8bca0' });
    this.layout().forEach(function (bb) { if (bb.tipo === 'slot') { var pp = self.pecaDe(bb); if (pp && pp.nivel) Tx.escrever('+' + pp.nivel, bb.x + 2, bb.y + 1, { tam: 4.5, cor: C.amarelo }); } });
  };

  // ================= ARMA NOVA =================
  function ArmaNova(p, m) { this.p = p; this.m = m; this.sel = 0; this.t = 0; BSI.audio.sfx('salvar'); }
  ArmaNova.prototype.telaCheia = true;
  ArmaNova.prototype.opcoes = function () {
    var a = cfgArma(this.p.id), r = this.m.herois.filter(function (h) { return !a.so || a.so.indexOf(h.id) >= 0; }).map(function (h) { return { heroi: h.id }; });
    r.push({ bornal: true });
    return r;
  };
  ArmaNova.prototype.escolher = function (o) {
    var a = cfgArma(this.p.id);
    if (!o.bornal) {
      var s = AR().garantir(), eq = s.equip[o.heroi], slot = a.cat === 'arremesso' ? 2 : (eq[1] ? (eq[0] ? 1 : 0) : 1);
      AR().equipar(o.heroi, slot, this.p.uid); s.slot[o.heroi] = slot;
      BSI.hud.aviso(BSI.data.personagens[o.heroi].curto + ' ficou com: ' + a.nome.toUpperCase(), corRar(a.raridade));
    } else BSI.hud.aviso(a.nome + ' foi pro bornal. Equipe com [' + BSI.input.rotulo('equipamento') + '].');
    BSI.audio.sfx('confirma'); BSI.jogo.fecharModal();
  };
  ArmaNova.prototype.botoes = function () {
    var W = BSI.view.w, H = BSI.view.h, ops = this.opcoes(), w = Math.min(34, Math.floor((W - 8) / ops.length) - 2), x0 = W / 2 - (ops.length * (w + 2)) / 2;
    return ops.map(function (o, i) { return { o: o, x: Math.round(x0 + i * (w + 2)), y: Math.round(H * 0.62), w: w, h: 30 }; });
  };
  ArmaNova.prototype.atualizar = function (dt) {
    var I = BSI.input, B = this.botoes(), self = this; this.t += dt;
    if (this.t < 0.4) return;
    if (I.apertou('esq')) this.sel = (this.sel - 1 + B.length) % B.length;
    if (I.apertou('dir')) this.sel = (this.sel + 1) % B.length;
    if (I.mouse.dentro) B.forEach(function (b, i) { if (dentro(I.mouse, b)) self.sel = i; });
    if (I.toque) { B.forEach(function (b) { if (dentro(I.toque, b)) self.escolher(b.o); }); return; }
    if (I.apertou('confirmar') || I.apertou('interagir')) this.escolher(B[this.sel].o);
    if (I.apertou('pausa')) this.escolher({ bornal: true });
  };
  ArmaNova.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, a = cfgArma(this.p.id), self = this;
    g.fillStyle = 'rgba(10,6,16,0.86)'; g.fillRect(0, 0, W, H);
    var cw = Math.min(W - 20, 240), cx = W / 2 - cw / 2, cy = H * 0.1;
    caixa(g, cx, cy, cw, H * 0.48, '#1e1428', a.raridade === 'lendaria', true);
    // raios de brilho atrás do ícone (lendária pisca dourado)
    var ix = W / 2, iy = cy + 30;
    g.save(); g.globalAlpha = 0.25 + Math.sin(this.t * 5) * 0.1; g.fillStyle = corRar(a.raridade);
    for (var r = 0; r < 8; r++) { g.save(); g.translate(ix, iy); g.rotate(r * Math.PI / 4 + this.t * 0.5); g.fillRect(-1, -24, 2, 18); g.restore(); }
    g.restore();
    icone(g, this.p.id, ix - 22, iy - 14, 44, 28, 2.5);
    this.botoes().forEach(function (b, i) {
      caixa(g, b.x, b.y, b.w, b.h, i === self.sel ? '#4a3a2a' : 'rgba(30,20,40,0.94)', i === self.sel);
      if (b.o.heroi) { var rt = self.m.heroi(b.o.heroi).spr.retrato; g.drawImage(rt, b.x + b.w / 2 - 8, b.y + 3, 16, 13); }
    });
  };
  ArmaNova.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, a = cfgArma(this.p.id), self = this, cw = Math.min(W - 20, 240), cx = W / 2 - cw / 2, cy = H * 0.1;
    Tx.escrever('ARMA NOVA!', W / 2, cy + 4, { tam: 8, alinhar: 'center', cordel: true, cor: C.amarelo });
    var e = AR().efetiva({ id: (this.botoes()[this.sel].o.heroi) || 'helano', st: {} }, this.p);
    detalhe(null, e, cx + 10, cy + 50, cw - 20, this.botoes()[this.sel].o.heroi);
    Tx.escrever('Quem fica com ela?', W / 2, H * 0.62 - 9, { tam: 6, alinhar: 'center', cor: C.creme });
    this.botoes().forEach(function (b) {
      var nome = b.o.heroi ? BSI.data.personagens[b.o.heroi].curto : 'bornal', af = b.o.heroi ? AR().efetiva({ id: b.o.heroi, st: {} }, self.p).afinidade : 0;
      Tx.escrever((af > 0 ? '★' : (af < 0 ? '✗' : '')) + nome, b.x + b.w / 2, b.y + b.h - 8, { tam: 4.5, alinhar: 'center', cor: af > 0 ? '#9fe0a0' : (af < 0 ? '#ff9a7a' : C.creme) });
    });
  };

  // ================= OFICINA DO HUGO =================
  function Oficina() { this.sel = 0; this.t = 0; }
  Oficina.prototype.telaCheia = true;
  Oficina.prototype.lista = function () { return AR().garantir().inv.filter(function (p) { return cfgArma(p.id).raridade !== 'lendaria' && !cfgArma(p.id).multiplas; }); };
  Oficina.prototype.atualizar = function (dt) {
    var I = BSI.input, L = this.lista(); this.t += dt;
    if (this.t > 0.2 && I.apertou('pausa')) { BSI.jogo.fecharModal(); return; }
    if (I.apertou('cima')) this.sel = (this.sel - 1 + L.length) % L.length;
    if (I.apertou('baixo')) this.sel = (this.sel + 1) % L.length;
    if (I.mouse.roda) this.sel = U.clamp(this.sel + I.mouse.roda, 0, L.length - 1);
    var self = this;
    if (I.toque) { var y0 = 34; L.forEach(function (p, i) { if (I.toque.y >= y0 + i * 12 && I.toque.y < y0 + i * 12 + 11) { self.sel = i; self.melhorar(); } }); return; }
    if (this.t > 0.2 && (I.apertou('confirmar') || I.apertou('interagir'))) this.melhorar();
  };
  Oficina.prototype.melhorar = function () {
    var p = this.lista()[this.sel]; if (!p) return;
    var custo = AR().podeMelhorar(p);
    if (!custo) { BSI.hud.aviso('Essa aí já tá no máximo. Até o Hugo respeita.', '#d8cdb0'); return; }
    if (AR().melhorar(p)) { BSI.audio.sfx('melhoria'); BSI.hud.aviso('Hugo: "Pronto! Agora é ' + AR().nomeMelhoria(p.id, p.nivel).toUpperCase() + '."', C.amarelo); }
    else { BSI.audio.sfx('estalo'); BSI.hud.aviso('Falta sucata (' + custo + '). Cata nos capangas e cava com a pá.', '#ff9a7a'); }
  };
  Oficina.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, L = this.lista(), self = this;
    g.fillStyle = 'rgba(14,8,10,0.95)'; g.fillRect(0, 0, W, H);
    L.forEach(function (p, i) { var y = 34 + i * 12; if (y > H - 30) return; caixa(g, 10, y, W - 20, 11, i === self.sel ? '#4a3a2a' : 'rgba(30,20,40,0.94)', i === self.sel); icone(g, p.id, 12, y, 18, 11); });
  };
  Oficina.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, L = this.lista(), s = AR().garantir(), self = this;
    Tx.escrever('OFICINA DO HUGO', W / 2, 6, { tam: 10, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.escrever('"Sucata na mão, milagre na arma." — Sucata: ' + s.sucata, W / 2, 20, { tam: 6, alinhar: 'center', cor: C.creme });
    L.forEach(function (p, i) {
      var y = 34 + i * 12; if (y > H - 30) return;
      var custo = AR().podeMelhorar(p), dono = AR().donoDe(p.uid), prox = custo ? AR().nomeMelhoria(p.id, p.nivel + 1) : 'no máximo';
      Tx.escrever((p.nivel ? AR().nomeMelhoria(p.id, p.nivel) : cfgArma(p.id).nome) + (dono ? '  (' + BSI.data.personagens[dono].curto + ')' : ''), 34, y + 2, { tam: 5.5, cor: corRar(cfgArma(p.id).raridade) });
      Tx.escrever(custo ? '→ ' + prox + '  [' + custo + ' sucata]' : prox, W - 14, y + 2, { tam: 5, alinhar: 'right', cor: custo && s.sucata >= custo ? '#9fe0a0' : '#a89a88' });
    });
    Tx.escrever('↑↓ escolhe · [Enter] ou clique melhora · [Esc] sai', W / 2, H - 10, { tam: 5, alinhar: 'center', cor: '#c8bca0' });
  };

  // ================= PRATELEIRA DA BODEGA =================
  var PRATELEIRA = [
    { mun: 'cartucho', qtd: 5, preco: 10 }, { mun: 'chumbinho', qtd: 30, preco: 6 }, { mun: 'prego', qtd: 40, preco: 6 },
    { mun: 'rojao', qtd: 1, preco: 12 }, { mun: 'querosene', qtd: 4, preco: 6 }, { mun: 'garrafa', qtd: 2, preco: 8 },
    { mun: 'traque', qtd: 4, preco: 6 }, { mun: 'bomba', qtd: 1, preco: 10 }, { mun: 'farinha', qtd: 1, preco: 5 }, { mun: 'pimenta', qtd: 2, preco: 4 }
  ];
  function Bodega(m) { this.m = m; this.sel = 0; this.t = 0; }
  Bodega.prototype.telaCheia = true;
  Bodega.prototype.preco = function (it) { return this.m && this.m.temNoGrupo('joaovitor') ? Math.ceil(it.preco * 0.8) : it.preco; };
  Bodega.prototype.comprar = function () {
    var it = PRATELEIRA[this.sel], s = AR().garantir(), p = this.preco(it), nome = BSI.config.municoes[it.mun].nome;
    var pagou = s.dinheiro >= p;
    if (pagou) { s.dinheiro -= p; BSI.hud.aviso('Pagou R$ ' + p + ': +' + it.qtd + ' ' + nome); }
    else { s.fiado = (s.fiado || 0) + 1; BSI.hud.aviso('+' + it.qtd + ' ' + nome + ' NO FIADO (caderno: ' + s.fiado + ')', '#f0c75e'); }
    AR().ganharMun(it.mun, it.qtd); BSI.audio.sfx(pagou ? 'moeda' : 'pegar');
  };
  Bodega.prototype.atualizar = function (dt) {
    var I = BSI.input, self = this, n = PRATELEIRA.length; this.t += dt;
    if (this.t > 0.2 && I.apertou('pausa')) { BSI.jogo.fecharModal(); return; }
    if (I.apertou('cima')) { this.sel = (this.sel - 1 + n) % n; BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % n; BSI.audio.sfx('menu'); }
    if (I.toque) { PRATELEIRA.forEach(function (it, i) { if (I.toque.y >= 30 + i * 13 && I.toque.y < 41 + i * 13) { self.sel = i; self.comprar(); } }); return; }
    if (this.t > 0.2 && (I.apertou('confirmar') || I.apertou('interagir'))) this.comprar();
  };
  Bodega.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, self = this;
    g.fillStyle = 'rgba(14,8,10,0.95)'; g.fillRect(0, 0, W, H);
    PRATELEIRA.forEach(function (it, i) { caixa(g, 20, 30 + i * 13, W - 40, 12, i === self.sel ? '#4a3a2a' : 'rgba(30,20,40,0.94)', i === self.sel); });
  };
  Bodega.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, s = AR().garantir(), self = this;
    Tx.escrever('BODEGA DA DONA SOCORRO', W / 2, 6, { tam: 9, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.escrever('No bolso: R$ ' + s.dinheiro + '   ·   Caderno do fiado: ' + (s.fiado || 0) + (this.m && this.m.temNoGrupo('joaovitor') ? '   ·   (o João Vitor pechincha: -20%)' : ''), W / 2, 18, { tam: 5.5, alinhar: 'center', cor: C.creme });
    PRATELEIRA.forEach(function (it, i) {
      var y = 30 + i * 13, p = self.preco(it);
      Tx.escrever(it.qtd + ' ' + BSI.config.municoes[it.mun].nome + '  (tem ' + AR().mun(it.mun) + ')', 28, y + 2.5, { tam: 6, cor: C.creme });
      Tx.escrever(s.dinheiro >= p ? 'R$ ' + p : 'R$ ' + p + ' (fiado)', W - 28, y + 2.5, { tam: 6, alinhar: 'right', cor: s.dinheiro >= p ? '#9fe0a0' : '#f0c75e' });
    });
    Tx.escrever('[Enter] ou clique compra · sem dinheiro vai no fiado (cobrado depois) · [Esc] sai', W / 2, H - 10, { tam: 5, alinhar: 'center', cor: '#c8bca0' });
  };

  // ================= RODA DE ARMAS (segurar Z) =================
  var Roda = BSI.rodaArmas = {
    ativa: false, sel: -1,
    atualizar: function (m) {
      var I = BSI.input, L = m.lider();
      if (!L || L.caido || BSI.roteiro.emCena()) { Roda.ativa = false; return; }
      if (I.segurando('rodaArmas')) {
        if (!Roda.ativa) { Roda.ativa = true; BSI.audio.sfx('menu'); }
        m.tempoLento(0.2, 0.1);
        var cx = L.x - m.camera.x, cy = L.y - 10 - m.camera.y, dx = I.mouse.x - cx, dy = I.mouse.y - cy;
        if (dx * dx + dy * dy > 64) { var ang = Math.atan2(dy, dx); Roda.sel = Math.round(((ang + Math.PI / 2) / (Math.PI * 2 / 3) + 3)) % 3; }
        if (I.apertou('hab1')) Roda.sel = 0; if (I.apertou('hab2')) Roda.sel = 1; if (I.apertou('hab3')) Roda.sel = 2;
      } else if (Roda.ativa) {
        Roda.ativa = false;
        if (Roda.sel >= 0) AR().escolherSlot(L, Roda.sel);
        Roda.sel = -1;
      }
    },
    desenhar: function (g, m) {
      if (!Roda.ativa) return;
      var L = m.lider(), s = AR().garantir(), eq = s.equip[L.id], cx = L.x - m.camera.x, cy = L.y - 10 - m.camera.y;
      g.save(); g.globalAlpha = 0.55; g.fillStyle = '#0c0812'; g.beginPath(); g.arc(cx, cy, 34, 0, Math.PI * 2); g.fill(); g.restore();
      for (var i = 0; i < 3; i++) {
        var ang = -Math.PI / 2 + i * Math.PI * 2 / 3, x = cx + Math.cos(ang) * 22 - 11, y = cy + Math.sin(ang) * 22 - 8;
        caixa(g, x, y, 22, 16, i === Roda.sel ? '#6a4a20' : 'rgba(30,20,40,0.94)', i === Roda.sel);
        var p = AR().peca(eq[i]); if (p) icone(g, p.id, x + 2, y + 1, 18, 13);
      }
    },
    desenharTexto: function (m) {
      if (!Roda.ativa) return;
      var L = m.lider(), eq = AR().garantir().equip[L.id], i = Roda.sel >= 0 ? Roda.sel : AR().garantir().slot[L.id], p = AR().peca(eq[i]);
      if (p) Tx.escrever(AR().efetiva(L, p).nomeCompleto, L.x - m.camera.x, L.y - m.camera.y + 28, { tam: 6, alinhar: 'center', cor: corRar(cfgArma(p.id).raridade) });
    }
  };

  // ---------------- objetos novos (itens no chão) ----------------
  var O = BSI.painter.objetos;
  O.sucata = { w: 10, h: 8, pintar: function (r) { r(1, 3, 5, 4, '#7a8088'); r(4, 1, 5, 3, '#9aa3ab'); r(2, 5, 7, 2, '#5a5f66'); r(6, 2, 1, 1, '#c8d0d8'); r(1, 2, 2, 1, '#a86a3a'); } };
  O.dinheiro = { w: 10, h: 6, pintar: function (r) { r(0, 1, 10, 4, '#7aa06a'); r(1, 2, 8, 2, '#9ac08a'); r(4, 2, 2, 2, '#5a8a4a'); r(0, 1, 10, 1, '#c8e0b8'); } };

  // ---------------- ações dos diálogos ----------------
  BSI.story.acoes.abrirOficina = function () { BSI.jogo.abrirModal(new Oficina()); };
  BSI.story.acoes.abrirBodega = function (m) { BSI.jogo.abrirModal(new Bodega(m)); };

  BSI.Equip = Equip; BSI.ArmaNova = ArmaNova; BSI.Oficina = Oficina; BSI.Bodega = Bodega; BSI.prateleira = PRATELEIRA;
})();
