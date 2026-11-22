/* =========================================================
   impacto.js — A SENSAÇÃO DO GOLPE (Etapa 3)
   - Hitstop: o jogo "congela" 50 a 80 ms no acerto.
   - Tremor de tela proporcional ao dano, empurrão, flash.
   - Partículas por tipo: poeira, faísca, pena (bicho), pipoca.
   - Onomatopeias de cordel: PÁ! TEI! VUPT! OXE!
   - Som próprio de cada golpe.
   - ESQUIVA (tecla C): rolamento com invencibilidade curta.
   Liga sozinho em todo mundo que leva dano (inimigos, bichos,
   chefes e heróis), sem mexer no código de cada um.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, U = BSI.util;
  function B() { return BSI.config.balance.combate; }

  var PALAVRAS = {
    corte: ['TEI!', 'ZÁS!', 'TRÁ!', 'VAPT!'],
    pancada: ['PÁ!', 'POW!', 'TABEFE!', 'BUF!', 'TUM!'],
    tiro: ['PEI!', 'TÁ!', 'PÁ-PÁ!', 'BUM!'],
    critico: ['CABRA DA PESTE!', 'ARRETADO!', 'NA MOSCA!', 'EITA!'],
    heroi: ['OXE!', 'AI!', 'VIXE!', 'UI!'],
    esquiva: ['VUPT!', 'FIU!'],
    explosao: ['BUMMM!', 'CABUM!', 'PIPOCOU!']
  };
  var LAMINAS = { peixeira: 1, facao: 1, foice: 1 };
  var PESADAS = { enxada: 1, bracoPaulo: 1, cadeira: 1, tacoSinuca: 1 };

  var I = BSI.impacto = {
    // texto flutuante de cordel no mundo
    palavra: function (m, x, y, lista, cor, grande) {
      if (!m) return;
      m.onomatopeias = m.onomatopeias || [];
      if (m.onomatopeias.length > 8) m.onomatopeias.shift();
      m.onomatopeias.push({ x: x + (Math.random() - 0.5) * 8, y: y, txt: typeof lista === 'string' ? lista : BSI.rng.pick(lista), cor: cor || '#fff1a8', t: 0.7, t0: 0.7, grande: !!grande, rot: (Math.random() - 0.5) * 0.4 });
    },
    critico: function (m, alvo) {
      I.palavra(m, alvo.x, alvo.y - 26, PALAVRAS.critico, '#ff9a3a', true);
      BSI.audio.sfx('critico'); m.hitstop = Math.max(m.hitstop || 0, B().hitstopCritico);
    },
    // chamado depois de qualquer dano
    acerto: function (alvo, m, qtd, fonte, tipo) {
      if (!m || !qtd || qtd <= 0) return;
      var heroiApanhou = alvo.time === 'herois' && alvo.def;
      var dono = fonte && fonte.dono ? fonte.dono : fonte;
      var dedoHeroi = dono && dono.time === 'herois';
      // hitstop (só nos golpes do grupo e quando o grupo apanha)
      if (dedoHeroi || heroiApanhou) m.hitstop = Math.max(m.hitstop || 0, Math.min(B().hitstopMax, B().hitstopBase + qtd * 0.01));
      m.camera.tremer(Math.min(5, 0.6 + qtd * (heroiApanhou ? 1.0 : 0.6)));
      var x = alvo.x, y = alvo.y - 8;
      // partículas por tipo de alvo
      if (alvo.d && alvo.d.pena) m.particulas.explosao(x, y, 6, ['#f2e6c9', '#d8cdb0'], 30, 0.9, { grav: 20, atrito: 0.9 }); // pena!
      else if (tipo === 'fogo') m.particulas.explosao(x, y, 5, [C.fogo2, C.fogo3], 25, 0.4);
      else if (tipo === 'chumbo' || tipo === 'prego' || tipo === 'pedra') m.particulas.explosao(x, y, 5, [C.amarelo, C.branco], 40, 0.25);
      else m.particulas.explosao(x, y + 6, 5, ['rgba(225,190,140,0.8)', C.branco], 30, 0.3);
      if (BSI.state && BSI.state.fase === 'interludio' && Math.random() < 0.3) m.particulas.explosao(x, y, 3, ['#fff8e0'], 40, 0.6, { grav: 80 }); // pipoca!
      // palavra e som
      var arma = dono && dono.arma ? dono.arma.id : null;
      if (heroiApanhou) { I.palavra(m, x, y - 16, PALAVRAS.heroi, '#ffb0a0'); BSI.audio.sfx('ai'); if (BSI.falasVivas) BSI.falasVivas.dizer(m, alvo, 'dano', { chance: 0.35 }); }
      if (dedoHeroi) { alvo.ultimoGolpe = dono; if (alvo.chefe && BSI.falasVivas) BSI.falasVivas.chefeApanhou(m, alvo); else if (BSI.falasVivas) BSI.falasVivas.dizer(m, dono, 'acerto', { chance: 0.1 }); }
      else if (dedoHeroi) {
        if (tipo === 'corpo') {
          var lista = LAMINAS[arma] ? PALAVRAS.corte : PALAVRAS.pancada;
          if (Math.random() < 0.55 || (dono.combo === 3)) I.palavra(m, x, y - 14, lista, dono.combo === 3 ? '#ffd060' : '#fff1a8', dono.combo === 3);
          BSI.audio.sfx(PESADAS[arma] ? 'pesado' : (LAMINAS[arma] ? 'corte' : 'pa'));
        } else if (Math.random() < 0.25) I.palavra(m, x, y - 14, PALAVRAS.tiro, '#fff1a8');
      }
    },

    // ---------------- ESQUIVA ----------------
    esquivar: function (h, m) {
      if ((h.cdEsquiva || 0) > 0 || h.bloqueado() || h.st.montado > 0 || h.caido) return false;
      var mv = BSI.input.movimento(), d = mv.mag > 0.2 ? U.norm(mv.x, mv.y) : { x: -h.face.x, y: -h.face.y }; // parado: pula pra trás
      h.esquiva = { t: B().esquivaDur, t0: B().esquivaDur, x: d.x, y: d.y };
      h.inv = Math.max(h.inv, B().esquivaInv);
      h.cdEsquiva = B().esquivaRecarga;
      h.recarga = null; // rolar cancela a recarga
      I.palavra(m, h.x, h.y - 20, PALAVRAS.esquiva, '#c8e8ff');
      BSI.audio.sfx('vupt');
      m.particulas.poeira(h.x, h.y); m.particulas.poeira(h.x - d.x * 4, h.y);
      return true;
    },
    // movimento durante a esquiva (o herói usa no lugar do controle)
    movimentoEsquiva: function (h, dt, m) {
      var e = h.esquiva; e.t -= dt;
      if (Math.random() < 0.5) m.particulas.poeira(h.x, h.y + 1);
      if (e.t <= 0) { h.esquiva = null; return null; }
      return { x: e.x, y: e.y, mag: 1, correndo: false };
    }
  };

  // ---------------- liga em todo mundo que leva dano ----------------
  function ligar(Classe) {
    if (!Classe || !Classe.prototype.levarDano || Classe.prototype._impacto) return;
    var orig = Classe.prototype.levarDano;
    Classe.prototype.levarDano = function (qtd, m, fonte, tipo) {
      var vidaAntes = this.vida, flashAntes = this.flash;
      var r = orig.apply(this, arguments);
      // só conta se o dano "pegou" (a vida baixou ou piscou)
      if (m && (this.vida < vidaAntes || (this.flash > 0 && !(flashAntes > 0)))) I.acerto(this, m, qtd, fonte, tipo);
      return r;
    };
    Classe.prototype._impacto = true;
  }
  I.ligarTodos = function () {
    [BSI.Inimigo, BSI.Bicho, BSI.Heroi].forEach(ligar);
    Object.keys(BSI.chefes || {}).forEach(function (k) { ligar(BSI.chefes[k]); });
    (I.extras || []).forEach(ligar);
  };
})();
