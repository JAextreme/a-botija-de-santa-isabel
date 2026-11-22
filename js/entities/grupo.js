/* =========================================================
   grupo.js — O GRUPO QUE SE VIRA SOZINHO
   Pra ninguém precisar ficar trocando de personagem toda hora:
   1. ESPECIALISTA: quando um objeto precisa de alguém (cabo → Hugo,
      botija → Miguel), esse alguém vem correndo e faz, sem trocar.
   2. PEDIDO (teclas 1 a 6): o companheiro daquele número usa a
      habilidade dele na direção do mouse, sem trocar.
   3. IA COM HABILIDADE: os companheiros usam a habilidade sozinhos
      quando faz sentido (opção: sim / só quando eu pedir / não).
   4. ORDENS (tecla T): ME SEGUE → AVANÇAR → SEGURAR POSIÇÃO.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;
  function B() { return BSI.config.balance; }

  var ORDENS = ['seguir', 'avancar', 'segurar'];
  var NOME_ORDEM = { seguir: 'ME SEGUE', avancar: 'AVANÇAR', segurar: 'SEGURAR POSIÇÃO' };

  // ponto do mundo embaixo do mouse (ou à frente do líder)
  function pontoMira(m) {
    var I = BSI.input, L = m.lider();
    if (I.mouse.dentro && I.ultimoDispositivo !== 'pad') return { x: m.camera.x + I.mouse.x, y: m.camera.y + I.mouse.y };
    return { x: L.x + L.face.x * 60, y: L.y + L.face.y * 60 };
  }

  var G = BSI.grupo = {
    NOME_ORDEM: NOME_ORDEM,
    pontoMira: pontoMira,

    // ---------- 1. o especialista vem fazer ----------
    // id: quem sabe fazer; alvo: {x,y}; fazer(heroi): o que acontece quando ele chega
    especialista: function (m, id, alvo, fazer, nomeTarefa) {
      var h = m.heroi(id);
      if (!h || h.caido) {
        var nome = (BSI.data.personagens[id] || {}).curto || id;
        BSI.hud.aviso('Isso precisa do ' + nome + ' no grupo' + (nomeTarefa ? ' (' + nomeTarefa + ')' : '') + '.', '#ff9a7a');
        return false;
      }
      if (h === m.lider() || U.dist(h, alvo) < 22) { fazer(h); return true; }
      h.ia.tarefa = { alvo: { x: alvo.x, y: alvo.y }, t: 0, fazer: fazer };
      m.falar(h, BSI.rng.pick(['Deixa comigo!', 'Pera, que eu vou aí!', 'Isso é comigo!']), 1.2);
      return true;
    },
    // chamado pela IA do companheiro a cada passo enquanto tem tarefa
    andarTarefa: function (h, m, dt) {
      var tf = h.ia.tarefa;
      tf.t += dt;
      var d = U.dist(h, tf.alvo);
      if (d < 20 || tf.t > B().grupo.tempoChegar) {
        if (d >= 20) { // não chegou a tempo: aparece do lado (nunca trava)
          var p = m.mapa.pontoLivre(tf.alvo.x, tf.alvo.y + 12, h.hw, h.hh);
          m.particulas.explosao(h.x, h.y, 6, 'rgba(225,190,140,0.8)', 25, 0.4);
          h.x = p.x; h.y = p.y;
        }
        h.ia.tarefa = null;
        tf.fazer(h);
        return { x: 0, y: 0, mag: 0, correndo: false };
      }
      var n = U.norm(tf.alvo.x - h.x, tf.alvo.y - h.y);
      return { x: n.x, y: n.y, mag: 1, correndo: true };
    },

    // ---------- 2. pedido com as teclas 1 a 6 ----------
    pedir: function (m, indice) {
      var h = m.herois[indice];
      if (!h) return;
      if (h.caido) { BSI.hud.aviso(h.nome() + ' está caído.', '#ff9a7a'); return; }
      var hab = BSI.habilidades.de(h);
      if (!hab) return;
      if (h.cdHab > 0) { BSI.hud.aviso(h.nome() + ': ' + hab.nome + ' em ' + Math.ceil(h.cdHab) + 's', '#d8cdb0'); BSI.audio.sfx('estalo'); return; }
      if (U.dist(h, m.lider()) > B().grupo.alcancePedido) { BSI.hud.aviso(h.nome() + ' tá longe demais.', '#ff9a7a'); return; }
      // a Consulta do Zé Neto: ele vai até quem precisa
      if (h.def.habilidade === 'consulta') {
        var p = G.maisFerido(m, h);
        if (!p) { m.falar(h, 'Tá todo mundo bem. Mas toma um boldo assim mesmo.', 1.8); return; }
        G.especialista(m, h.id, p, function (hh) { BSI.habilidades.usar(hh, m); });
        return;
      }
      var alvo = pontoMira(m);
      var n = U.norm(alvo.x - h.x, alvo.y - h.y);
      if (n.x || n.y) { h.face = n; h.dir = U.dirDe(n.x, n.y); }
      BSI.habilidades.usar(h, m);
    },
    maisFerido: function (m, quem) {
      var pior = null, nota = 99;
      m.herois.forEach(function (o) {
        if (o === quem) return;
        var v = o.caido ? -1 : (o.vida < o.vidaMax ? o.vida : 99);
        if (v < nota) { nota = v; pior = o; }
      });
      return pior;
    },

    // ---------- 3. ordens ----------
    ciclarOrdem: function (m) {
      var i = ORDENS.indexOf(m.ordem || 'seguir');
      m.ordem = ORDENS[(i + 1) % ORDENS.length];
      var L = m.lider();
      m.pontoOrdem = { x: L.x, y: L.y };
      BSI.hud.aviso('Ordem pro grupo: ' + NOME_ORDEM[m.ordem], BSI.cor.amarelo);
      BSI.audio.sfx('confirma');
      var falas = { seguir: 'Bora, todo mundo atrás de mim!', avancar: 'Pra cima deles!', segurar: 'Fica todo mundo aqui!' };
      m.falar(L, falas[m.ordem], 1.4);
    },

    // ---------- 4. a IA usa habilidade sozinha ----------
    autoHabilidade: function (h, m, dt) {
      var modo = (BSI.save.cfg().autoHab) || B().grupo.autoHabilidades;
      if (modo !== 'sim' || h.cdHab > 0 || h.caido || h.ia.tarefa || BSI.roteiro.emCena()) return;
      h.ia.tHab = (h.ia.tHab || 0) - dt;
      if (h.ia.tHab > 0) return;
      h.ia.tHab = B().grupo.pensarHabilidade;
      var id = h.def.habilidade, L = m.lider();
      var inimigos = m.inimigos.filter(function (e) { return !e.morto && e.time === 'inimigos'; });
      function perto(r, de) { de = de || h; return inimigos.filter(function (e) { return U.dist(e, de) < r; }); }
      var usar = false;
      switch (id) {
        case 'consulta':
          var p = G.maisFerido(m, h);
          if (p && (p.caido || p.vida <= 2) && U.dist(p, h) < 120) { G.especialista(m, h.id, p, function (hh) { BSI.habilidades.usar(hh, m); }); h.ia.tHab = 3; return; }
          break;
        case 'lealdade':
          usar = m.projeteis.some(function (pr) { return pr.time !== 'herois' && U.dist2(pr.x, pr.y, h.x, h.y) < 60 * 60; });
          break;
        case 'ritual': usar = perto(110, L).length >= 2; break;
        case 'escapamento': usar = perto(60).length >= 2; break;
        case 'gambiarra': usar = perto(130, L).length >= 2; break;
        case 'labia': usar = perto(60).some(function (e) { return e.humano && !e.chefe; }); break;
        case 'conversa': usar = perto(60).some(function (e) { return e.conversavel && !e.chefe; }) || perto(70, L).length >= 3; break;
        case 'tiroProfeta': usar = (m.chefe && !m.chefe.alma && m.chefe.livre && m.chefe.livre() && U.dist(m.chefe, h) < 260) || perto(220).length >= 3; break;
        case 'rouboMadrugada': usar = m.chefe && m.chefe.alma && m.chefe.livre() && U.dist(m.chefe, h) < 120; break;
        case 'fogo':
          // o Daniel só bota fogo se não tiver amigo no caminho
          var alvoF = perto(80)[0];
          if (alvoF) {
            var amigoPerto = m.herois.some(function (o) { return o !== h && !o.caido && U.dist(o, alvoF) < 40; });
            if (!amigoPerto) { var nf = U.norm(alvoF.x - h.x, alvoF.y - h.y); h.face = nf; usar = true; }
          }
          break;
        case 'tirarExcesso': usar = perto(150, L).length >= 4 && Math.random() < 0.25; break;
        case 'visao': break; // a reza do Vander contra alma já é automática
      }
      if (usar) {
        var alvo = perto(200)[0];
        if (alvo && id !== 'fogo') { var n = U.norm(alvo.x - h.x, alvo.y - h.y); h.face = n; h.dir = U.dirDe(n.x, n.y); }
        BSI.habilidades.usar(h, m);
        if (h.cdHab > 0) h.cdHab *= B().grupo.recargaIA;
      }
    }
  };
})();
