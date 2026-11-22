/* =========================================================
   props.js — coisas do mapa: itens, fogueira (checkpoint),
   NPC (o bode), objetos de cenário, placas, gatilhos de diálogo,
   a torre de prego do Hugo e os vagalumes.
   Tudo que tem "dialogo" pode ser falado com Espaço.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE;

  // ---------------- ITEM ----------------
  var NOMES_ITEM = { municao: 'cartucho', rapadura: 'rapadura', pilha: 'pilha', cachaca: 'cachaça', fumo: 'fumo de rolo' };
  function Item(item, x, y, qtd, chave) {
    BSI.Entidade.call(this, x, y, 4, 4);
    this.item = item; this.qtd = qtd || 1; this.chave = chave || null;
    this.atraso = chave ? 0 : 0.4; // item que caiu de inimigo espera um pouco
  }
  Item.prototype = Object.create(BSI.Entidade.prototype);
  Item.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    if (this.atraso > 0) { this.atraso -= dt; return; }
    for (var i = 0; i < mundo.herois.length; i++) {
      var h = mundo.herois[i];
      if (h.caido) continue;
      if (U.dist2(h.x, h.y, this.x, this.y) < 12 * 12) { this.pegar(h, mundo); return; }
    }
  };
  Item.prototype.pegar = function (h, mundo) {
    var S = BSI.state;
    this.morto = true;
    if (this.chave) S.coletados[this.chave] = true;
    BSI.audio.sfx({ municao: 'cartucho', dinheiro: 'moeda', sucata: 'moeda' }[this.item] || 'pegar');
    if (this.item === 'municao') { var q = Math.max(1, Math.round(this.qtd * (BSI.dificuldade ? BSI.dificuldade().municao : 1))) + (h.id === 'joaovitor' || mundo.temNoGrupo('joaovitor') ? 1 : 0); S.municao += q; BSI.hud.aviso('+' + q + ' cartucho' + (q > 1 ? 's' : '') + (q > this.qtd ? ' (o João Vitor pechinchou)' : '')); }
    else if (this.item === 'arma') { BSI.armas.pegarArma(this.arma, mundo, this.mun); }
    else if (this.item === 'sucata') { BSI.armas.garantir().sucata += this.qtd; BSI.hud.aviso('+' + this.qtd + ' sucata (pra Oficina do Hugo)'); }
    else if (this.item === 'dinheiro') { BSI.armas.garantir().dinheiro += this.qtd * 5; BSI.hud.aviso('Achou R$ ' + (this.qtd * 5) + ' amassados'); }
    else if (this.item === 'pilha') { S.pilha = 100; BSI.hud.aviso('Pilha nova na lanterna!'); }
    else if (this.item === 'fumo') { S.fumo = (S.fumo || 0) + 1; BSI.hud.aviso('Pegou um rolo de fumo (a Caipora gosta...)'); }
    else if (this.item === 'cachaca') {
      // cachaça: efeito imprevisível
      var sorte = BSI.rng.next();
      if (sorte < 0.3) { mundo.herois.forEach(function (o) { if (!o.caido) o.curar(6); }); BSI.hud.aviso(h.nome() + ' deu um gole: todo mundo curado!', '#9fe0a0'); BSI.audio.sfx('cura'); }
      else if (sorte < 0.55) { h.st.zonzo = 6; BSI.hud.aviso(h.nome() + ' bebeu e ficou zonzo...', '#ff9a7a'); }
      else if (sorte < 0.8) { mundo.herois.forEach(function (o) { if (!o.caido) o.st.rapido = 8; }); BSI.hud.aviso('Cachaça braba: grupo acelerado!', '#9fe0a0'); }
      else { BSI.story.medidor('juizo', -10, 'Cachaça de alambique duvidoso: Juízo -10'); }
    }
    else if (this.item === 'rapadura') {
      var ferido = null;
      mundo.herois.forEach(function (o) { if (!o.caido && o.vida < o.vidaMax && (!ferido || o.vida < ferido.vida)) ferido = o; });
      if (ferido) { ferido.curar(2); BSI.hud.aviso(ferido.nome() + ' comeu rapadura (+1 coração)'); BSI.audio.sfx('cura'); }
      else { S.rapaduras++; BSI.hud.aviso('Rapadura guardada no bornal (' + S.rapaduras + ')'); }
    }
    mundo.particulas.explosao(this.x, this.y - 4, 6, [C.amarelo, C.branco], 25, 0.4);
  };
  Item.prototype.desenhar = function (g, cx, cy) {
    if (this.item === 'arma') { // arma no chão: o desenho dela, brilhando de vez em quando
      var ar = BSI.boneco.arma(this.arma), bob2 = Math.sin(this.t * 3) * 1.5;
      g.fillStyle = 'rgba(20,10,20,0.3)'; g.fillRect(Math.round(this.x - cx) - 6, Math.round(this.y - cy) + 1, 12, 1);
      if (ar) g.drawImage(ar.c, Math.round(this.x - cx - ar.c.width / 4), Math.round(this.y - cy - 8 + bob2), ar.c.width / 2, ar.c.height / 2);
      if (Math.floor(this.t * 2) % 3 === 0) { g.fillStyle = BSI.config.raridades[BSI.config.armas[this.arma].raridade].cor; g.fillRect(Math.round(this.x - cx) + 4, Math.round(this.y - cy - 10 + bob2), 1, 1); }
      return;
    }
    var o = BSI.sprites.objeto(this.item);
    if (!o) return;
    var bob = Math.round(Math.sin(this.t * 4) * 1.5);
    g.fillStyle = 'rgba(20,10,20,0.3)'; g.fillRect(Math.round(this.x - cx) - 3, Math.round(this.y - cy) + 1, 6, 1);
    g.drawImage(o.c, Math.round(this.x - cx - o.w / 2), Math.round(this.y - cy - o.h + bob), o.w, o.h);
  };
  Item.prototype.luz = function () { return { x: this.x, y: this.y - 4, r: this.item === 'arma' ? 18 : 12, forca: 0.5, cor: this.item === 'arma' ? '#f0c75e' : undefined }; };

  // ---------------- FOGUEIRA (checkpoint) ----------------
  // semCheckpoint: fogueira comum (não salva). forca: 1 acesa, 0 apagada
  // (a alma apaga as fogueiras; reacende com fósforo ou com o fogo do Daniel)
  function Fogueira(x, y, chave, semCheckpoint) {
    BSI.Entidade.call(this, x, y, 6, 3);
    this.chave = chave;
    this.ativa = false;
    this.fogueira = true;
    this.semCheckpoint = !!semCheckpoint;
    this.forca = 1;
    this.dialogo = null;
  }
  Fogueira.prototype = Object.create(BSI.Entidade.prototype);
  Fogueira.prototype.reacender = function (mundo) {
    this.forca = 1;
    BSI.audio.sfx('fogo');
    if (mundo) mundo.particulas.explosao(this.x, this.y - 6, 12, [C.fogo1, C.fogo2], 40, 0.5);
  };
  Fogueira.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    this.dialogo = this.forca < 0.35 ? 'fogueira_apagada' : 'bancada_hugo'; // fogueira acesa: Oficina do Hugo
    if (this.forca <= 0.05) { if (Math.random() < 0.05) mundo.particulas.fumaca(this.x, this.y - 4); return; }
    if (Math.random() < 0.15 * this.forca) mundo.particulas.faisca(this.x + (Math.random() - 0.5) * 6, this.y - 6);
    var L = mundo.lider();
    if (!this.semCheckpoint && this.forca > 0.5 && !BSI.roteiro.ativo && L && !L.caido && U.dist2(L.x, L.y, this.x, this.y) < 24 * 24 && BSI.state.checkpoint.chave !== this.chave) {
      mundo.salvarCheckpoint(this);
    }
    this.ativa = BSI.state.checkpoint.chave === this.chave;
  };
  Fogueira.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (this.grande) { g.save(); g.translate(x, y); g.scale(2, 2); g.translate(-x, -y); }
    var l = BSI.sprites.objeto('fogueiraLenha');
    g.drawImage(l.c, x - 9, y - 6, l.w, l.h);
    if (this.forca <= 0.05) { g.fillStyle = '#7a3a20'; g.fillRect(x - 3, y - 4, 2, 1); g.fillRect(x + 2, y - 3, 1, 1); return; }
    for (var i = 0; i < 3; i++) {
      var alt = Math.round((8 + Math.sin(this.t * 10 + i * 2) * 3 + (i === 1 ? 3 : 0)) * (0.3 + this.forca * 0.7));
      var fx = x - 5 + i * 3;
      g.fillStyle = C.fogo4; g.fillRect(fx, y - 3 - alt, 4, alt);
      g.fillStyle = C.fogo3; g.fillRect(fx + 1, y - 2 - alt, 2, alt - 1);
      g.fillStyle = C.fogo2; g.fillRect(fx + 1, y - 3 - Math.round(alt * 0.5), 2, Math.round(alt * 0.5));
      g.fillStyle = C.fogo1; g.fillRect(fx + 1, y - 3 - Math.round(alt * 0.25), 1, Math.round(alt * 0.25));
    }
    // chama "de verdade" (textura CC0 da Kenney) somada por cima, tremulando
    var ch = BSI.imagemTingida && BSI.imagemTingida('part:chama' + (1 + Math.floor(this.t * 9) % 2), '#f79a33');
    if (ch && BSI.view.det > 1) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.85 * this.forca; g.imageSmoothingEnabled = true;
      var tam = 18 + Math.sin(this.t * 11) * 2;
      g.translate(x, y - 6); g.scale(1, 1.25 + Math.sin(this.t * 7) * 0.08);
      g.drawImage(ch, -tam / 2, -tam * 0.8, tam, tam);
      g.restore();
    }
    if (this.grande) g.restore();
  };
  Fogueira.prototype.luz = function () {
    if (this.forca <= 0.05) return { x: this.x, y: this.y - 4, r: 10, forca: 0.4, cor: '#a8302a' };
    return { x: this.x, y: this.y - 6, r: ((BSI.config.visual.luz.fogueiraRaio * (0.4 + 0.6 * this.forca)) + Math.sin(this.t * 13) * 3) * (this.grande ? 1.8 : 1), forca: 1, cor: '#f7a733' };
  };

  // ---------------- NPC (o bode e, depois, a cidade inteira) ----------------
  function Npc(id, x, y, dialogo, parado) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.id = id; this.dialogo = dialogo; this.parado = !!parado;
    this.casa = { x: x, y: y };
    this.face = { x: -1, y: 0 }; this.quadro = 0; this.passo = 0;
    this.destino = null; this.tDest = 0;
    this.destinoFixo = null;   // usado pelos roteiros (NPC andando em cutscene)
    this.alfa = 1; this.sumindo = false;
    var f = BSI.data.falantes[id] || {}, pj = BSI.data.personagens[id];
    if (f.bicho) { this.spr = BSI.sprites[f.bicho](); this.bicho = true; }
    else if (pj) { this.spr = BSI.sprites.humano('heroi:' + id, pj.visual); this.dirHumano = 'down'; }
    else { this.spr = BSI.sprites.humano('npc:' + id, f.visual || {}); this.dirHumano = 'down'; }
    this.time = 'npc';
  }
  Npc.prototype = Object.create(BSI.Entidade.prototype);
  Npc.prototype.sumir = function () { this.sumindo = true; this.dialogo = null; };
  Npc.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    if (this.sumindo) { this.alfa -= dt * 1.2; if (this.alfa <= 0) this.morto = true; }
    if (this.destinoFixo) {
      var nf = U.norm(this.destinoFixo.x - this.x, this.destinoFixo.y - this.y), ax0 = this.x, ay0 = this.y;
      if (U.dist(this.destinoFixo, this) > 2) {
        BSI.colisao.mover(this, mundo.mapa, nf.x * 45 * dt, nf.y * 45 * dt);
        if (U.dist2(ax0, ay0, this.x, this.y) < 0.01) { this.x += nf.x * 45 * dt; this.y += nf.y * 45 * dt; } // em cutscene atravessa
        this.face = { x: nf.x, y: nf.y }; this.dirHumano = U.dirDe(nf.x, nf.y);
        this.passo += 45 * dt; this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
      } else { this.destinoFixo = null; this.casa = { x: this.x, y: this.y }; this.quadro = 0; }
      return;
    }
    if (this.agitado) {
      // gado agitado: corre de um lado pro outro, batendo os cascos
      this.tDest -= dt;
      if (!this.destino || this.tDest <= 0) { this.destino = { x: this.casa.x + (Math.random() - 0.5) * 70, y: this.casa.y + (Math.random() - 0.5) * 40 }; this.tDest = 0.6 + Math.random(); }
      var na = U.norm(this.destino.x - this.x, this.destino.y - this.y);
      BSI.colisao.mover(this, mundo.mapa, na.x * 55 * dt, na.y * 55 * dt);
      if (Math.abs(na.x) > 0.1) this.face.x = na.x;
      this.passo += 55 * dt; this.quadro = 1 + Math.floor(this.passo / 4) % 2;
      if (Math.random() < 0.08) mundo.particulas.poeira(this.x, this.y);
      return;
    }
    if (mundo.conversando === this || this.parado) {
      this.quadro = 0;
      var L = mundo.lider();
      if (L && this.dirHumano && U.dist(L, this) < 40) { var nl = U.norm(L.x - this.x, L.y - this.y); this.dirHumano = U.dirDe(nl.x, nl.y); this.face = nl; }
      return;
    }
    this.tDest -= dt;
    if (!this.destino || this.tDest <= 0) {
      this.destino = { x: this.casa.x + (Math.random() - 0.5) * 30, y: this.casa.y + (Math.random() - 0.5) * 20 };
      this.tDest = 2 + Math.random() * 4;
    }
    if (U.dist(this.destino, this) > 3) {
      var n = U.norm(this.destino.x - this.x, this.destino.y - this.y), ax = this.x;
      BSI.colisao.mover(this, mundo.mapa, n.x * 14 * dt, n.y * 14 * dt);
      if (Math.abs(n.x) > 0.1) this.face.x = n.x;
      if (this.dirHumano) this.dirHumano = U.dirDe(n.x, n.y);
      this.passo += Math.abs(this.x - ax) + 0.2;
      this.quadro = Math.floor(this.passo / 4) % 3;
    } else this.quadro = 0;
  };
  Npc.prototype.desenhar = function (g, cx, cy) {
    if (this.alfa <= 0) return;
    this.sombra(g, cx, cy, this.bicho ? 14 : 10);
    var dir = this.dirHumano || (this.face.x > 0 ? 'right' : 'left');
    this.desenharSprite(g, cx, cy, this.spr, dir, this.quadro, this.alfa);
  };
  Npc.prototype.aoFalar = function () {
    if (this.id === 'bode') BSI.audio.sfx('bode');
    if (this.id === 'trovao' || this.id === 'piaba') BSI.audio.sfx('latido');
  };

  // ---------------- OBJETO DE CENÁRIO ----------------
  // op: { luz: raio, espelho: true } (vem do mapa)
  function Decor(sprite, x, y, dialogo, op) {
    BSI.Entidade.call(this, x, y, 8, 3);
    this.sprite = sprite; this.dialogo = dialogo;
    this.raioLuz = op && op.luz; this.espelho = op && op.espelho;
  }
  Decor.prototype = Object.create(BSI.Entidade.prototype);
  Decor.prototype.atualizar = function (dt) { this.t += dt; };
  Decor.prototype.desenhar = function (g, cx, cy) {
    var o = BSI.sprites.objeto(this.sprite);
    if (!o) return;
    g.drawImage(this.espelho ? o.espelho : o.c, Math.round(this.x - cx - o.w / 2), Math.round(this.y - cy - o.h + 3), o.w, o.h);
  };
  Decor.prototype.luz = function () {
    if (!this.raioLuz) return null;
    var o = BSI.sprites.objeto(this.sprite);
    return { x: this.x, y: this.y - o.h + 6, r: this.raioLuz + Math.sin(this.t * 7) * 2, forca: 0.85, cor: '#fff1a8' };
  };

  // ---------------- PLACA ----------------
  function Placa(x, y, dialogo) { Decor.call(this, 'placa', x, y, dialogo); this.hw = 5; }
  Placa.prototype = Object.create(Decor.prototype);

  // ---------------- GATILHO (ponto invisível de conversa) ----------------
  function Gatilho(x, y, dialogo) {
    BSI.Entidade.call(this, x, y, 8, 8);
    this.dialogo = dialogo; this.invisivel = true;
  }
  Gatilho.prototype = Object.create(BSI.Entidade.prototype);
  Gatilho.prototype.atualizar = function () { };
  Gatilho.prototype.desenhar = function () { };

  // ---------------- TORRE DE PREGO (gambiarra do Hugo) ----------------
  function Torre(x, y) {
    BSI.Entidade.call(this, x, y, 4, 3);
    this.vida = 10; this.cd = 0.4;
    this.time = 'herois';
  }
  Torre.prototype = Object.create(BSI.Entidade.prototype);
  Torre.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    this.vida -= dt;
    if (this.vida <= 0) {
      this.morto = true;
      mundo.particulas.explosao(this.x, this.y - 6, 10, [C.madeira, '#7a8088'], 40, 0.5);
      return;
    }
    this.cd -= dt;
    if (this.cd > 0) return;
    var melhor = null, md = 115 * 115;
    mundo.inimigos.forEach(function (e) {
      if (e.morto || e.time !== 'inimigos') return;
      var d = U.dist2(e.x, e.y, this.x, this.y);
      if (d < md) { md = d; melhor = e; }
    }, this);
    if (!melhor) return;
    this.cd = 0.55;
    var n = U.norm(melhor.x - this.x, melhor.y - 4 - (this.y - 10));
    mundo.projeteis.push(new BSI.Projetil({ x: this.x, y: this.y - 10, vx: n.x * 220, vy: n.y * 220, vida: 0.6, dano: 1, time: 'herois', tipo: 'prego', dono: this }));
    BSI.audio.sfx('prego');
  };
  Torre.prototype.desenhar = function (g, cx, cy) {
    var o = BSI.sprites.objeto('torre');
    this.sombra(g, cx, cy, 10);
    if (this.vida < 2 && Math.floor(this.t * 10) % 2) return;
    g.drawImage(o.c, Math.round(this.x - cx - o.w / 2), Math.round(this.y - cy - o.h + 2), o.w, o.h);
  };

  // ---------------- VAGALUME ----------------
  function Vagalume(mapa) {
    BSI.Entidade.call(this, Math.random() * mapa.w * T, Math.random() * mapa.h * T, 1, 1);
    this.vx = 0; this.vy = 0; this.fase = Math.random() * 6;
  }
  Vagalume.prototype = Object.create(BSI.Entidade.prototype);
  Vagalume.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    this.vx += (Math.random() - 0.5) * 30 * dt; this.vy += (Math.random() - 0.5) * 30 * dt;
    this.vx *= 0.98; this.vy *= 0.98;
    this.x = U.clamp(this.x + this.vx * dt, 0, mundo.mapa.w * T);
    this.y = U.clamp(this.y + this.vy * dt, 0, mundo.mapa.h * T);
  };
  Vagalume.prototype.brilho = function () { return Math.max(0, Math.sin(this.t * 2 + this.fase)); };
  Vagalume.prototype.desenhar = function (g, cx, cy) {
    var b = this.brilho();
    if (b < 0.2) return;
    g.fillStyle = 'rgba(220,255,140,' + b.toFixed(2) + ')';
    g.fillRect(Math.round(this.x - cx), Math.round(this.y - cy - 10), 1, 1);
  };
  Vagalume.prototype.luz = function () { var b = this.brilho(); return b > 0.3 ? { x: this.x, y: this.y - 10, r: 9 * b, forca: 0.7, cor: '#cfff8a' } : null; };

  BSI.Item = Item;
  BSI.Fogueira = Fogueira;
  BSI.Npc = Npc;
  BSI.Decor = Decor;
  BSI.Placa = Placa;
  BSI.Gatilho = Gatilho;
  BSI.Torre = Torre;
  BSI.Vagalume = Vagalume;
  BSI.NOMES_ITEM = NOMES_ITEM;
})();
