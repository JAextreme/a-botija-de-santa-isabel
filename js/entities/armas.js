/* =========================================================
   armas.js — O ARSENAL EM AÇÃO (Etapa 3 da atualização)
   - Inventário do GRUPO: cada arma é uma peça (uid) e fica com
     UM personagem por vez. Cada um tem 3 espaços:
     [principal, secundária, arremesso].
   - Pente e recarga por arma; munição por TIPO (o cartucho
     continua sendo o contador antigo BSI.state.municao).
   - Arma efetiva = base (config/weapons.js) + melhoria da
     Oficina do Hugo + AFINIDADE do personagem (★/✗).
   - Ataques: tiro (com leque), corpo a corpo (combo de 3,
     giro, puxão, laço...), arremesso em ARCO (explosão,
     nuvem de farinha/pimenta, fogo, bumerangue da chinela).
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE;
  function CFG() { return BSI.config.armas; }
  function S() { return BSI.state; }
  var SLOTS = ['principal', 'secundária', 'arremesso'];

  // ---------------- estado (inventário, equipamento, munição) ----------------
  function garantir() {
    var s = S(); if (!s) return null;
    if (s.inv && s.equip && s.mun) return s;
    s.inv = s.inv || []; s.equip = s.equip || {}; s.slot = s.slot || {};
    s.mun = s.mun || U.clonar(BSI.config.municaoInicial);
    s.sucata = s.sucata || 0; s.dinheiro = s.dinheiro || 0; s.proxUid = s.proxUid || 1;
    // kit inicial de todo mundo (vale pra save antigo também)
    Object.keys(BSI.config.equipInicial).forEach(function (id) {
      if (s.equip[id]) return;
      s.equip[id] = BSI.config.equipInicial[id].map(function (aid) { return aid ? novaPeca(aid).uid : null; });
      s.slot[id] = 0;
    });
    return s;
  }
  function novaPeca(id) {
    var s = S(), a = CFG()[id];
    var p = { uid: s.proxUid++, id: id, nivel: 0, pente: a && a.pente ? a.pente : 0 };
    s.inv.push(p);
    return p;
  }
  function peca(uid) { var s = garantir(); if (!s || !uid) return null; for (var i = 0; i < s.inv.length; i++) if (s.inv[i].uid === uid) return s.inv[i]; return null; }
  function donoDe(uid) { var s = garantir(); for (var id in s.equip) if (s.equip[id].indexOf(uid) >= 0) return id; return null; }

  // munição: quanto tem de um tipo
  function mun(tipo) { var s = garantir(); if (!tipo) return Infinity; if (tipo === 'cartucho') return s.municao; return s.mun[tipo] || 0; }
  function gastarMun(tipo, n) {
    if (!tipo || (BSI.debug && BSI.debug.op.municaoInfinita)) return;
    var s = garantir(); if (tipo === 'cartucho') s.municao = Math.max(0, s.municao - n); else s.mun[tipo] = Math.max(0, (s.mun[tipo] || 0) - n);
  }
  function ganharMun(tipo, n) {
    var s = garantir(), max = (BSI.config.municoes[tipo] || {}).max || 999;
    if (tipo === 'cartucho') s.municao = Math.min(max, s.municao + n); else s.mun[tipo] = Math.min(max, (s.mun[tipo] || 0) + n);
  }

  // ---------------- arma EFETIVA de um personagem ----------------
  function efetiva(h, p) {
    p = p || ativa(h);
    var base = p ? CFG()[p.id] : CFG().pedra;
    var e = {}; for (var k in base) e[k] = base[k];
    e.id = p ? p.id : 'pedra'; e.peca = p;
    e.tipo = e.cat === 'fogo' ? 'tiro' : (e.cat === 'corpo' ? 'corpo' : 'arremesso');
    e.especial = base.especial || {};
    e.critico = e.especial.critico || 0.05;
    // melhoria da oficina
    var niv = p ? p.nivel : 0, of = BSI.config.oficina;
    for (var n = 0; n < niv; n++) { var m = of.niveis[n].mult; if (m.dano) e.dano = base.dano * m.dano; if (m.recarga && e.recarga) e.recarga = base.recarga * m.recarga; if (m.pente && e.pente) e.pente = Math.round(base.pente * m.pente); }
    e.nomeCompleto = niv ? nomeMelhoria(e.id, niv) : e.nome;
    // afinidade
    var af = BSI.config.afinidades[h.id] || { bom: [], ruim: [] };
    e.afinidade = af.bom.indexOf(e.id) >= 0 ? 1 : (af.ruim.indexOf(e.id) >= 0 ? -1 : 0);
    if (e.afinidade < 0) { e.dano *= 0.8; }
    switch (h.id) {
      case 'helano': if (e.afinidade > 0) { e.espalha = (e.espalha || 0) * 0.6; e.critico = 0.25; } break;
      case 'zeneto': if (e.afinidade > 0) { e.dano = e.dano * 1.5 + 0.3; e.especial = U.clonar(e.especial); e.especial.raio = (e.especial.raio || 20) * 1.3; } if (e.afinidade < 0) e.espalha = (e.espalha || 0) * 1.8 + 0.12; break;
      case 'joaopedro': if ((e.barulho || 0) >= 150) e.dano *= 1.3; break;
      case 'miguel': if (e.afinidade > 0) { e.dano *= 1.4; e.cd *= 0.85; } break;
      case 'hugo': if (e.recarga) e.recarga *= 0.6; e.trava = 0; break;
      case 'joaocarlos': if (e.especial.bar) e.dano *= 1.6; break;
      case 'daniel': if (e.afinidade > 0) e.pegaFogo = true; break;
    }
    if (e.trava === undefined) e.trava = e.especial.trava || 0;
    if (h.id === 'vander' && h.st && h.st.posInvis > 0) e.dano *= 2;
    if (h.st && h.st.forte > 0) e.dano *= 2;
    return e;
  }
  function nomeMelhoria(id, nivel) {
    var N = BSI.config.oficina.nomes, l = N[id];
    if (l && l[nivel - 1]) return l[nivel - 1];
    return N._padrao[nivel - 1].replace('%s', CFG()[id].nome);
  }

  function ativa(h) {
    var s = garantir(); if (!s) return null;
    var eq = s.equip[h.id]; if (!eq) return null;
    var i = s.slot[h.id] || 0;
    if (!eq[i]) { for (var k = 0; k < 3; k++) if (eq[k]) { i = k; break; } }
    return peca(eq[i]);
  }

  // ---------------- troca de arma ----------------
  function trocarSlot(h, passo, m) {
    var s = garantir(), eq = s.equip[h.id]; if (!eq) return;
    var i = s.slot[h.id] || 0;
    for (var k = 0; k < 3; k++) { i = (i + passo + 3) % 3; if (eq[i]) break; }
    if (i === (s.slot[h.id] || 0)) return;
    s.slot[h.id] = i; h.recarga = null; h.combo = 0;
    var e = efetiva(h);
    BSI.audio.sfx('troca');
    BSI.hud.aviso(h.nome() + ' equipou: ' + e.nomeCompleto.toUpperCase(), BSI.config.raridades[e.raridade].cor);
    if (m && BSI.falasVivas) BSI.falasVivas.dizer(m, h, 'trocaArma', { chance: 0.5 });
  }
  function escolherSlot(h, i) {
    var s = garantir(); if (!s.equip[h.id] || !s.equip[h.id][i] || (s.slot[h.id] || 0) === i) return;
    s.slot[h.id] = (i - 1 + 3) % 3; trocarSlot(h, 1);
  }

  // ---------------- recarga ----------------
  function precisaRecarregar(h, e) { e = e || efetiva(h); return e.pente && e.peca && e.peca.pente < e.pente; }
  function recarregar(h, m) {
    var e = efetiva(h);
    if (!e.pente || !e.peca || h.recarga || e.peca.pente >= e.pente) return false;
    if (e.mun && mun(e.mun) <= 0 && !(BSI.debug && BSI.debug.op.municaoInfinita)) { if (m && !(BSI.falasVivas && BSI.falasVivas.dizer(m, h, 'semMunicao', { cd: 2.5 }))) m.falar(h, BSI.falas.sorteia('semMunicao'), 1.2); BSI.audio.sfx('estalo'); return false; }
    h.recarga = { t: e.recarga, total: e.recarga };
    if (m && BSI.falasVivas) BSI.falasVivas.dizer(m, h, 'recarga', { chance: 0.3 });
    if (m && e.id === 'socaTempo') m.barulho(h.x, h.y, 90); // socar a pólvora faz barulho
    BSI.audio.sfx('estalo');
    return true;
  }
  function terminarRecarga(h) {
    var e = efetiva(h), p = e.peca; if (!p) return;
    var falta = e.pente - p.pente, tem = e.mun ? mun(e.mun) : Infinity;
    if (BSI.debug && BSI.debug.op.municaoInfinita) tem = Infinity;
    var n = Math.min(falta, tem);
    if (e.mun && !(BSI.debug && BSI.debug.op.municaoInfinita)) gastarMun(e.mun, n);
    p.pente += n;
    BSI.audio.sfx('pegar');
  }

  // ---------------- ATACAR ----------------
  function atacar(h, m, mult) {
    if (h.cdAtaque > 0 || h.st.montado > 0 || h.caido || h.recarga || h.travada > 0) return false;
    var e = efetiva(h), forca = (mult || 1) * (m.multDano || 1) * (BSI.dificuldade ? BSI.dificuldade().danoGrupo : 1);
    if (e.so && e.so.indexOf(h.id) < 0) { m.falar(h, 'Isso aqui só os netos do Tio Ota sabem acender.', 1.6); h.cdAtaque = 0.6; return false; }
    // Davi: qualquer arma pode virar um TIRAR O EXCESSO
    if (h.id === 'davi' && Math.random() < 0.03 && BSI.excesso && m.inimigos.some(function (i) { return !i.morto && i.time === 'inimigos' && U.dist(i, h) < 120; })) { BSI.excesso.gritar(h, m); h.cdAtaque = 0.8; return true; }
    if (e.tipo === 'tiro') return atirar(h, m, e, forca);
    if (e.tipo === 'arremesso') return arremessar(h, m, e, forca);
    return golpear(h, m, e, forca);
  }

  // direção do ataque: o mouse (se for você) ou a mira automática da IA
  function direcao(h, m, alcance, cone) {
    if (h.mirandoMouse) { var d0 = { x: h.face.x, y: h.face.y }; return h.travado || !BSI.mira ? d0 : BSI.mira.assistir(h, m, d0, alcance); }
    return h.mira(m, alcance, cone);
  }
  function alvoNoChao(h, m, alcanceMax) {
    var I = BSI.input;
    if (h.mirandoMouse) {
      var x = m.camera.x + I.mouse.x, y = m.camera.y + I.mouse.y;
      if (h.travado && m.travaAlvo) { x = m.travaAlvo.x; y = m.travaAlvo.y; }
      var d = U.dist({ x: x, y: y }, h);
      if (d > alcanceMax) { var n = U.norm(x - h.x, y - h.y); x = h.x + n.x * alcanceMax; y = h.y + n.y * alcanceMax; }
      return { x: x, y: y };
    }
    var alvo = null, md = alcanceMax * alcanceMax;
    m.inimigos.forEach(function (i) { if (i.morto || i.time !== 'inimigos') return; var d2 = U.dist2(i.x, i.y, h.x, h.y); if (d2 < md) { md = d2; alvo = i; } });
    return alvo ? { x: alvo.x, y: alvo.y } : { x: h.x + h.face.x * alcanceMax * 0.6, y: h.y + h.face.y * alcanceMax * 0.6 };
  }

  function barulhoDe(h, m, e) {
    if (!e.barulho) return;
    m.barulho(h.x, h.y, e.barulho);
    // na mata, barulho alto deixa a Caipora brava
    if (m.dados.mata && e.barulho >= 150) BSI.story.medidor('raiva', e.barulho >= 250 ? 1 : 0.5, null, true);
  }

  function atirar(h, m, e, forca) {
    var p = e.peca, infinita = BSI.debug && BSI.debug.op.municaoInfinita;
    if (e.pente && p.pente <= 0) {
      if (!recarregar(h, m)) { h.cdAtaque = 0.4; }
      return false;
    }
    // a pistola do Hugo trava às vezes
    if (e.trava && Math.random() < e.trava) {
      h.travada = 1.0; BSI.audio.sfx('estalo'); m.falar(h, 'Travou! Cadê o Hugo?!', 1.4);
      var hugo = m.heroi('hugo'); if (hugo && !hugo.caido && U.dist(hugo, h) < 80) { h.travada = 0.15; m.falar(hugo, 'Pancada no lugar certo. Pronto.', 1.4); }
      return false;
    }
    // Caipora com raiva: a arma nega fogo
    if (m.dados.mata && BSI.state.medidores.raiva >= 50 && BSI.rng.chance(0.25) && e.barulho >= 100) {
      BSI.audio.sfx('estalo'); h.cdAtaque = 0.8; m.falar(h, BSI.falas.sorteia('negaFogo'), 1.6); return false;
    }
    if (e.pente && !infinita) p.pente--;
    var esp = e.especial;
    h.cdAtaque = e.cd; h.animAtaque = 0.12;
    barulhoDe(h, m, e);
    if (e.tremor) m.camera.tremer(e.tremor);
    BSI.audio.sfx(e.som || 'tiro');
    // CAIXA DE SOM: onda sonora em volta, inimigos perdem o juízo
    if (esp.sonica) {
      m.efeitos.push({ tipo: 'onda', x: h.x, y: h.y, r: 0, rMax: esp.sonica, t: 0.5, t0: 0.5 });
      m.inimigos.forEach(function (i) {
        if (i.morto || i.time !== 'inimigos' || U.dist(i, h) > esp.sonica) return;
        i.levarDano(e.dano * forca, m, h, 'som'); if (i.atordoar) i.atordoar(i.chefe ? 0.8 : 2.5);
        if (!i.chefe && i.fugir) i.fugir(2, { x: i.x + (Math.random() - 0.5) * 60, y: i.y + (Math.random() - 0.5) * 60 });
      });
      return true;
    }
    // LAMPIÃO DO TIO OTA: clarão em cone que queima alma
    if (esp.luz) {
      var dl = direcao(h, m, e.alcance, 0.8);
      m.clarao(h.x + dl.x * 20, h.y - 6 + dl.y * 16); m.luzTotal = Math.max(m.luzTotal, 0.25);
      m.inimigos.forEach(function (i) {
        if (i.morto || i.time !== 'inimigos') return;
        var dx = i.x - h.x, dy = i.y - h.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > e.alcance || (dx * dl.x + dy * dl.y) / d < 0.5) return;
        i.levarDano((i.alma ? esp.queimaAlma : e.dano) * forca, m, h, i.alma ? 'luz' : 'fogo');
      });
      return true;
    }
    // ROJÃO: arco até o ponto e explode
    if (esp.arco) { lancarArco(h, m, e, forca, alvoNoChao(h, m, e.alcance)); return true; }
    var dir = direcao(h, m, (e.vel || 200) * (e.vida || 0.5), BSI.input.ultimoDispositivo === 'teclado' ? 0.35 : 0.7);
    if (!h.mirandoMouse) { h.face = dir; h.dir = U.dirDe(dir.x, dir.y); }
    // Ritual Amadeu: tiro de dentro do círculo atravessa (combo!)
    var noRitual = m.efeitos.some(function (f) { return f.tipo === 'circulo' && U.dist2(f.x, f.y, h.x, h.y) < f.r * f.r; });
    var bonus = noRitual ? (h.id === 'luizfernando' ? 1.6 : 1.3) : 1;
    if (noRitual && BSI.combos) BSI.combos.anunciar(m, 'TIRO PERFURANTE', h);
    // retícula abre depois do tiro (mira de precisão fecha o leque)
    var abertura = (h.abertura || 0) + (h.precisao ? 0 : 0.05);
    var leque = (e.espalha || 0) * (h.precisao ? 0.35 : 1) + abertura;
    for (var k = 0; k < (e.n || 1); k++) {
      var ang = (e.n > 1 ? (k / (e.n - 1) - 0.5) * leque * 2 : 0) + (Math.random() - 0.5) * (leque * 0.6 + 0.03);
      var v = U.girar(dir.x, dir.y, ang), vel = e.vel * (0.9 + Math.random() * 0.2);
      var crit = Math.random() < e.critico;
      m.projeteis.push(new BSI.Projetil({
        x: h.x + dir.x * 8, y: h.y - 6 + dir.y * 6, vx: v.x * vel, vy: v.y * vel,
        vida: e.vida, dano: e.dano * forca * bonus * (crit ? 2 : 1), time: 'herois', tipo: e.tipoProj || 'chumbo', dono: h,
        fura: noRitual ? 2 : 0, kb: e.kb, critico: crit
      }));
    }
    h.abertura = Math.min(0.35, abertura + 0.08);
    m.clarao(h.x + dir.x * 10, h.y - 6 + dir.y * 8);
    h.kbx -= dir.x * (e.kb || 40) * 0.3; h.kby -= dir.y * (e.kb || 40) * 0.3; // coice
    // munição acabou no pente: recarga automática
    if (e.pente && p.pente <= 0) recarregar(h, m);
    return true;
  }

  function golpear(h, m, e, forca) {
    var esp = e.especial, alc = e.alcance;
    // combo de 3: cliques seguidos
    h.combo = (h.tCombo > 0 ? (h.combo || 0) + 1 : 1); if (h.combo > 3) h.combo = 1;
    h.tCombo = 0.7;
    var fim = h.combo === 3, multCombo = fim ? (esp.combo || 1.3) : 1;
    var dir = direcao(h, m, alc + 14, 0.9);
    if (!h.mirandoMouse) { h.face = dir; h.dir = U.dirDe(dir.x, dir.y); }
    var hx = h.x + dir.x * 9, hy = h.y - 4 + dir.y * 8, acertou = false;
    var alvos = m.alvosPara('herois'), duasMaos = h.id === 'joaoluiz' && e.afinidade < 0;
    if (duasMaos && h.st.escudo > 0) h.st.escudo = 0; // arma pesada derruba o escudo
    for (var j = 0; j < alvos.length; j++) {
      var a = alvos[j]; if (a.morto) continue;
      var dx = a.x - h.x, dy = (a.y - 4) - (h.y - 4), d = Math.sqrt(dx * dx + dy * dy) || 1;
      var dentro;
      if (esp.giro) dentro = d < alc + a.hw;
      else dentro = d < alc + a.hw + 9 && (dx * dir.x + dy * dir.y) / d > 0.25;
      if (!dentro) continue;
      if (!esp.varios && !esp.giro && acertou) break; // peixeira: um de cada vez
      var crit = Math.random() < e.critico;
      a.levarDano(e.dano * forca * multCombo * (crit ? 2 : 1), m, h, 'corpo');
      if (crit && BSI.impacto) BSI.impacto.critico(m, a);
      if (a.empurrar) a.empurrar(h.x, h.y, (e.kb || 50) * (fim ? 1.6 : 1) * (a.chefe ? 0.3 : 1));
      if (esp.prende && a.atordoar && !a.chefe) a.atordoar(esp.prende);
      if (esp.derruba && a.atordoar && !a.chefe) a.atordoar(2);
      acertou = true;
    }
    // pá: cava o chão (às vezes acha alguma coisa)
    if (esp.cava && !acertou) {
      m.particulas.explosao(hx, hy + 4, 8, [C.terraEsc, C.terra], 30, 0.5, { grav: 60 });
      if (Math.random() < 0.12) { m.soltarItem(Math.random() < 0.5 ? 'sucata' : 'dinheiro', hx, hy, 1); m.falar(h, 'Achei alguma coisa!', 1.2); }
    }
    // rebater as PROMESSAS do Rafael CDs
    var ch = m.chefe;
    if (ch && ch.cds && ch.refletir) m.projeteis.forEach(function (pr) { if (pr.tipo === 'promessa' && pr.time !== 'herois' && U.dist2(pr.x, pr.y, hx, hy) < (alc + 9) * (alc + 9)) { ch.refletir(pr, h); acertou = true; } });
    barulhoDe(h, m, e);
    BSI.audio.sfx(acertou ? 'acerto' : 'facada');
    h.cdAtaque = e.cd * (fim ? 1.4 : 1);
    h.animAtaque = 0.14;
    if (esp.giro) m.efeitos.push({ tipo: 'onda', x: h.x, y: h.y - 4, r: 0, rMax: alc, t: 0.2, t0: 0.2 });
    return acertou;
  }

  function arremessar(h, m, e, forca) {
    if (e.mun && mun(e.mun) <= 0 && !(BSI.debug && BSI.debug.op.municaoInfinita)) { m.falar(h, 'Acabou ' + (BSI.config.municoes[e.mun] || {}).nome + '!', 1.2); BSI.audio.sfx('estalo'); h.cdAtaque = 0.4; return false; }
    if (e.especial.bumerangue && h.chinelaFora) return false;
    gastarMun(e.mun, 1);
    h.cdAtaque = e.cd; h.animAtaque = 0.14;
    BSI.audio.sfx('facada');
    lancarArco(h, m, e, forca, alvoNoChao(h, m, e.alcance));
    return true;
  }

  // ---------------- coisa voando em arco (arremesso, rojão, chinela) ----------------
  function Arco(h, m, e, forca, alvo) {
    this.x0 = h.x; this.y0 = h.y - 6; this.x = this.x0; this.y = this.y0;
    this.alvo = alvo; this.dono = h; this.e = e; this.forca = forca;
    var d = U.dist({ x: this.x0, y: this.y0 }, alvo);
    this.dur = 0.25 + d / 260; this.t = 0; this.z = 0; this.morto = false; this.time = 'herois'; this.tipo = 'arremesso';
    this.altura = e.especial.bumerangue ? 4 : 10 + d * 0.15;
    this.volta = false; this.atingidos = [];
    if (e.especial.bumerangue) h.chinelaFora = true;
  }
  Arco.prototype.atualizar = function (dt, m) {
    var e = this.e, esp = e.especial;
    this.t += dt;
    var p = Math.min(1, this.t / this.dur);
    if (esp.bumerangue) {
      // vai e volta, batendo em quem estiver no caminho
      var ida = this.volta ? 1 - p : p, alvoX = this.volta ? this.dono.x : this.alvo.x, alvoY = this.volta ? this.dono.y - 6 : this.alvo.y;
      this.x = this.volta ? U.lerp(this.alvo.x, alvoX, p) : U.lerp(this.x0, alvoX, p);
      this.y = this.volta ? U.lerp(this.alvo.y, alvoY, p) : U.lerp(this.y0, alvoY, p);
      this.z = Math.sin(ida * Math.PI) * this.altura;
      var self = this;
      m.inimigos.forEach(function (i) {
        if (i.morto || i.time !== 'inimigos' || self.atingidos.indexOf(i) >= 0 || U.dist2(i.x, i.y - 5, self.x, self.y) > 14 * 14) return;
        self.atingidos.push(i); i.levarDano(e.dano * 2 * self.forca, m, self.dono, 'chinela'); if (i.empurrar) i.empurrar(self.x, self.y, e.kb);
        if (BSI.impacto) BSI.impacto.critico(m, i);
        BSI.audio.sfx('chinela');
      });
      if (p >= 1) { if (!this.volta) { this.volta = true; this.t = 0; this.atingidos = []; } else { this.morto = true; this.dono.chinelaFora = false; } }
      return;
    }
    this.x = U.lerp(this.x0, this.alvo.x, p); this.y = U.lerp(this.y0, this.alvo.y, p);
    this.z = Math.sin(p * Math.PI) * this.altura;
    if (e.id === 'rojao' && Math.random() < 0.7) m.particulas.faisca(this.x, this.y - this.z);
    if (p >= 1) { this.morto = true; cair(this, m); }
  };
  Arco.prototype.desenhar = function (g, cx, cy) {
    var x = this.x - cx, y = this.y - cy;
    g.fillStyle = 'rgba(20,10,20,0.35)'; g.beginPath(); g.ellipse(x, y + 2, 3, 1.2, 0, 0, Math.PI * 2); g.fill();
    var arte = BSI.boneco && BSI.boneco.arma(this.e.id);
    if (arte) { g.save(); g.translate(x, y - this.z); g.rotate(this.t * 12); g.drawImage(arte.c, -arte.c.width / 4, -arte.c.height / 4, arte.c.width / 2, arte.c.height / 2); g.restore(); }
    else { g.fillStyle = '#9a8a7a'; g.fillRect(x - 1, y - this.z - 1, 3, 3); }
  };
  function lancarArco(h, m, e, forca, alvo) { m.projeteis.push(new Arco(h, m, e, forca, alvo)); }

  function cair(a, m) {
    var e = a.e, esp = e.especial, x = a.x, y = a.y, h = a.dono;
    var raio = esp.explode || 10;
    var fogo = esp.pegaFogo && (e.pegaFogo || h.id === 'daniel');
    if (esp.explode || e.dano) {
      m.inimigos.concat(m.bichos).forEach(function (i) {
        if (i.morto || U.dist2(i.x, i.y, x, y) > raio * raio) return;
        if (e.dano) i.levarDano(e.dano * a.forca, m, h, fogo ? 'fogo' : (esp.explode ? 'explosao' : 'corpo'));
        if (i.empurrar && e.kb) i.empurrar(x, y, e.kb * (i.chefe ? 0.3 : 1));
        if (esp.atordoa && i.atordoar) i.atordoar(i.chefe ? esp.atordoa * 0.3 : esp.atordoa);
      });
    }
    if (esp.explode) {
      m.particulas.explosao(x, y - 3, 14, [C.fogo1, C.fogo2, C.fogo3, '#d8cdb0'], 70, 0.45);
      m.camera.tremer(Math.min(5, raio / 6)); m.clarao(x, y);
      BSI.audio.sfx(e.id === 'garrafa' ? 'vidro' : 'fogo');
      // a bomba é barulhenta de verdade
      if (e.barulho) m.barulho(x, y, e.barulho);
    } else {
      m.particulas.explosao(x, y, 5, ['#9a8a7a', '#c8b090'], 30, 0.3); BSI.audio.sfx('estalo');
    }
    if (fogo || e.id === 'rojao') { m.fogo.acenderArea(x, y, 1, true); if (BSI.combos && h.id === 'daniel' && e.id === 'garrafa') BSI.combos.anunciar(m, 'MOLOTOV DO DANIEL', h); }
    if (esp.nuvem) m.projeteis.push(new Nuvem(x, y, esp, h));
    // traque e bomba: churrasco explosivo se tiver isca de carne do Miguel por perto
    if (esp.explode && BSI.combos) BSI.combos.explodiuPerto(m, x, y, h);
  }

  // nuvem de farinha (cega) ou de pimenta (tosse)
  function Nuvem(x, y, esp, dono) { this.x = x; this.y = y; this.r = esp.raio || 24; this.t = esp.dur || 4; this.t0 = this.t; this.efeito = esp.nuvem; this.dono = dono; this.morto = false; this.time = 'herois'; this.tipo = 'nuvem'; this.tick = 0; }
  Nuvem.prototype.atualizar = function (dt, m) {
    this.t -= dt; if (this.t <= 0) { this.morto = true; return; }
    this.tick -= dt;
    if (Math.random() < 0.5) m.particulas.add({ x: this.x + (Math.random() - 0.5) * this.r * 1.6, y: this.y + (Math.random() - 0.5) * this.r, vx: (Math.random() - 0.5) * 8, vy: -4, vida: 0.9, cor: this.efeito === 'cega' ? 'rgba(245,240,230,0.7)' : 'rgba(200,60,40,0.55)', tam: 3, atrito: 0.95 });
    if (this.tick > 0) return; this.tick = 0.5;
    var self = this;
    m.inimigos.forEach(function (i) {
      if (i.morto || i.time !== 'inimigos' || U.dist2(i.x, i.y, self.x, self.y) > self.r * self.r) return;
      if (i.chefe) { if (i.atordoar) i.atordoar(0.3); return; }
      if (self.efeito === 'tosse') { i.levarDano(0.3, m, self.dono, 'pimenta'); if (Math.random() < 0.3) m.falar(i, BSI.rng.pick(['Cof! Cof!', 'Ai, meus olho!', 'Que ardência!']), 0.8); }
      if (i.fugir) i.fugir(1.2, { x: i.x + (Math.random() - 0.5) * 80, y: i.y + (Math.random() - 0.5) * 80 });
      if (self.efeito === 'cega' && i.atordoar) i.atordoar(0.6);
    });
  };
  Nuvem.prototype.desenhar = function (g, cx, cy) {
    var a = Math.min(1, this.t / 0.6) * Math.min(1, (this.t0 - this.t) / 0.3 + 0.2);
    g.save(); g.globalAlpha = 0.28 * a; g.fillStyle = this.efeito === 'cega' ? '#f4f0e6' : '#c8402a';
    g.beginPath(); g.ellipse(this.x - cx, this.y - cy - 4, this.r, this.r * 0.6, 0, 0, Math.PI * 2); g.fill(); g.restore();
  };

  // ---------------- todo quadro, pra cada herói ----------------
  function atualizarHeroi(h, dt, m, controlado) {
    if (h.tCombo > 0) h.tCombo -= dt;
    if (h.travada > 0) h.travada -= dt;
    if (h.abertura > 0) h.abertura = Math.max(0, h.abertura - dt * (h.precisao ? 0.8 : 0.35));
    if (h.recarga) { h.recarga.t -= dt; if (h.recarga.t <= 0) { h.recarga = null; terminarRecarga(h); } }
    if (!controlado || h.bloqueado()) return;
    var I = BSI.input;
    if (I.apertou('recarregar')) recarregar(h, m);
    if (I.mouse.roda && !(BSI.jogo && BSI.jogo.modal)) trocarSlot(h, I.mouse.roda > 0 ? 1 : -1, m);
  }

  // ---------------- pegar arma nova ----------------
  function pegarArma(id, m, qtdMun) {
    var s = garantir(), a = CFG()[id];
    if (!a) return;
    if (qtdMun) for (var t in qtdMun) ganharMun(t, qtdMun[t]);
    // pedra é infinita: não precisa de outra
    if (a.multiplas && s.inv.some(function (p) { return p.id === id && !donoDe(p.uid); })) { BSI.hud.aviso('Mais ' + a.nome.toLowerCase() + '.'); return; }
    var p = novaPeca(id);
    if (m && a.raridade === 'lendaria' && BSI.falasVivas) m.agendar(0.5, function () { BSI.falasVivas.reagir(m, 'lendaria'); }, true);
    if (BSI.ArmaNova && m) BSI.jogo.abrirModal(new BSI.ArmaNova(p, m));
    else BSI.hud.aviso('Arma nova no bornal: ' + a.nome);
  }
  function equipar(heroiId, slot, uid) {
    var s = garantir(), eq = s.equip[heroiId]; if (!eq) return false;
    var p = peca(uid); if (!p) return false;
    var a = CFG()[p.id], certo = a.cat === 'arremesso' ? 2 : (slot === 2 ? -1 : slot);
    if (certo < 0) return false; // arremesso só no 3º espaço, arma só nos 2 primeiros
    // tira de quem estava com ela
    var dono = donoDe(uid); if (dono) { var i0 = s.equip[dono].indexOf(uid); s.equip[dono][i0] = null; }
    eq[certo] = uid;
    return true;
  }
  function desequipar(heroiId, slot) { var s = garantir(); if (s.equip[heroiId]) s.equip[heroiId][slot] = null; }

  // lendárias liberadas pela história
  function verificarLendarias(m) {
    var s = garantir(); if (!s) return;
    s.lendarias = s.lendarias || {};
    Object.keys(CFG()).forEach(function (id) {
      var a = CFG()[id]; if (!a.requer || s.lendarias[id]) return;
      if (a.requer.flag && !BSI.story.tem(a.requer.flag)) return;
      s.lendarias[id] = true;
      if (a.mun === 'querosene') ganharMun('querosene', 8);
      pegarArma(id, m);
    });
  }

  // ---------------- oficina do Hugo ----------------
  function podeMelhorar(p) { var n = BSI.config.oficina.niveis[p.nivel]; return n ? n.custo : 0; }
  function melhorar(p) {
    var s = garantir(), custo = podeMelhorar(p);
    if (!custo || s.sucata < custo || CFG()[p.id].raridade === 'lendaria') return false;
    s.sucata -= custo; p.nivel++;
    return true;
  }

  BSI.armas = {
    SLOTS: SLOTS, garantir: garantir, peca: peca, donoDe: donoDe, efetiva: efetiva, ativa: ativa,
    mun: mun, gastarMun: gastarMun, ganharMun: ganharMun,
    trocarSlot: trocarSlot, escolherSlot: escolherSlot, recarregar: recarregar, precisaRecarregar: precisaRecarregar,
    atacar: atacar, atualizarHeroi: atualizarHeroi, pegarArma: pegarArma, equipar: equipar, desequipar: desequipar,
    verificarLendarias: verificarLendarias, podeMelhorar: podeMelhorar, melhorar: melhorar, nomeMelhoria: nomeMelhoria,
    Arco: Arco, Nuvem: Nuvem,
    // a IA pode atirar? (sobra munição pro jogador)
    iaPodeUsar: function (h) {
      var e = efetiva(h);
      if (e.tipo === 'corpo') return true;
      if (e.pente && e.peca.pente > 0) return true;
      return !e.mun || mun(e.mun) > 3;
    }
  };

  // as armas antigas (BSI.data.armas) viram as do arsenal novo
  BSI.data.armas = BSI.data.armas || {};
  Object.keys(CFG()).forEach(function (id) { BSI.data.armas[id] = CFG()[id]; });
})();
