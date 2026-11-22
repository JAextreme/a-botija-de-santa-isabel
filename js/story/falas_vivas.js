/* =========================================================
   falas_vivas.js — O GRUPO FALANDO SEM PARAR O JOGO (Etapa 4)
   - FALAS DE COMBATE: cada um tem as suas (data/falas_combate.js)
     por situação; nunca repete a mesma fala duas vezes seguidas.
   - CONVERSAS DE ESTRADA (data/estrada.js): balões enquanto o
     grupo anda, sem pausar, conforme quem está no grupo.
   - REAÇÕES a eventos (data/reacoes.js): caça, fogo, web
     namorada, Tia Zane, fake news, poder de grupo, juízo baixo,
     arma lendária.
   - LISTAS (data/listas.js): {lista:steloFake} etc. funcionam em
     qualquer fala, de diálogo ou de balão.
   - CHEFES: falas por fase, ao apanhar e na derrota.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;
  function S() { return BSI.state; }

  // ---------------- sorteio sem repetir ----------------
  var ultimas = {};
  function sortear(lista, chave) {
    if (!lista || !lista.length) return null;
    if (lista.length === 1) return lista[0];
    var u = ultimas[chave], t = 0, x;
    do { x = lista[Math.floor(Math.random() * lista.length)]; } while (x === u && t++ < 8);
    ultimas[chave] = x;
    return x;
  }
  // troca {lista:nome} por um item sorteado da lista
  function preencher(txt) {
    return String(txt).replace(/\{lista:(\w+)\}/g, function (_, n) { return sortear((BSI.data.listas || {})[n], 'lista:' + n) || ''; });
  }
  BSI.falasVivas = { sortear: sortear, preencher: preencher };

  // ---------------- falas de combate ----------------
  var cdHeroi = {}, cdGlobal = 0;
  var V = BSI.falasVivas;
  // categoria: luta, acerto, dano, semMunicao, recarga, trocaArma, curado, habilidade, abate, caido
  V.dizer = function (m, h, categoria, op) {
    op = op || {};
    if (!m || !h || h.caido || BSI.roteiro.emCena() || BSI.dialogo.ativo) return false;
    var agora = m.tempo;
    if (!op.forcar && ((cdHeroi[h.id] || 0) > agora || cdGlobal > agora)) return false;
    if (op.chance !== undefined && Math.random() > op.chance) return false;
    var tab = (BSI.data.falasCombate || {})[h.id] || {}, lista = tab[categoria];
    if (!lista || !lista.length) return false;
    var txt = sortear(lista, h.id + ':' + categoria);
    m.falar(h, preencher(txt), op.dur || Math.min(2.6, 1.1 + txt.length / 30));
    cdHeroi[h.id] = agora + (op.cd || 3.5);
    cdGlobal = agora + 0.9;
    return true;
  };
  // alguém do grupo (não caído) que tem fala pra situação; prefere quem está perto
  V.alguem = function (m, categoria, perto) {
    var lista = m.herois.filter(function (h) { return !h.caido && ((BSI.data.falasCombate || {})[h.id] || {})[categoria]; });
    if (perto) lista.sort(function (a, b) { return U.dist(a, perto) - U.dist(b, perto); });
    return lista.length ? (perto ? lista[Math.floor(Math.random() * Math.min(2, lista.length))] : lista[Math.floor(Math.random() * lista.length)]) : null;
  };

  // ---------------- reações a eventos ----------------
  var cdReacao = {};
  V.reagir = function (m, evento, preferido) {
    if (!m || BSI.roteiro.emCena() || BSI.dialogo.ativo) return false;
    if ((cdReacao[evento] || -99) > m.tempo) return false;
    var opcoes = ((BSI.data.reacoes || {})[evento] || []).filter(function (r) { var q = r[0]; return q === 'qualquer' || m.temNoGrupo(q); });
    if (preferido) { var pref = opcoes.filter(function (r) { return r[0] === preferido; }); if (pref.length) opcoes = pref; }
    var r = sortear(opcoes, 'reacao:' + evento); if (!r) return false;
    var quem = r[0] === 'qualquer' ? V.alguem(m, 'luta') || m.lider() : m.heroi(r[0]);
    if (!quem) return false;
    m.falar(quem, preencher(r[1]), Math.min(3, 1.2 + r[1].length / 28));
    cdReacao[evento] = m.tempo + (r[2] || 12);
    return true;
  };

  // ---------------- conversas de estrada ----------------
  var Estrada = BSI.estrada = {
    t: 45, rodando: null,
    elegivel: function (m, c) {
      var s = S();
      if (c.requer && !c.requer.every(function (id) { return m.temNoGrupo(id); })) return false;
      if (c.se && !BSI.story.tem(c.se)) return false;
      if (c.seNao && BSI.story.tem(c.seNao)) return false;
      if (c.fases && c.fases.indexOf(s.fase) < 0) return false;
      if (c.mata !== undefined && !!m.dados.mata !== c.mata) return false;
      if (c.noite !== undefined && (m.ambienteAtual < 0.7) !== c.noite) return false;
      return true;
    },
    calmo: function (m) {
      if (BSI.roteiro.emCena() || BSI.dialogo.ativo || BSI.jogo.modal || (m.chefe && m.chefe.ativo) || m.perseguicao || m.defesa) return false;
      var L = m.lider();
      return !m.inimigos.some(function (e) { return !e.morto && e.time === 'inimigos' && (e.estado === 'persegue' || e.estado === 'prepara' || U.dist(e, L) < 110); });
    },
    atualizar: function (m, dt) {
      var s = S(); if (!s) return;
      var R = Estrada.rodando;
      if (R) { // falando: uma fala de cada vez, em balão
        if (!Estrada.calmo(m)) { Estrada.rodando = null; return; }
        R.t -= dt;
        if (R.t <= 0) {
          var f = R.c.falas[R.i++];
          if (!f) { Estrada.rodando = null; return; }
          var quem = f[0] === 'lider' ? m.lider() : (f[0] === 'qualquer' ? V.alguem(m, 'luta') : m.heroi(f[0]));
          if (!quem || quem.caido) { R.t = 0.1; return; }
          var txt = preencher(f[1]);
          var dur = Math.min(4.2, 1.6 + txt.length / 24);
          m.falar(quem, txt, dur);
          R.t = dur + 0.25;
        }
        return;
      }
      if (!Estrada.calmo(m) || !m.lider().movendo) return;
      Estrada.t -= dt;
      if (Estrada.t > 0) return;
      var faixa = (BSI.config.balance.estrada || {}).intervalo || [35, 70];
      Estrada.t = faixa[0] + Math.random() * (faixa[1] - faixa[0]);
      s.estradaUsadas = s.estradaUsadas || [];
      var todas = (BSI.data.estrada || []).filter(function (c) { return Estrada.elegivel(m, c); });
      var novas = todas.filter(function (c) { return s.estradaUsadas.indexOf(c.id) < 0; });
      if (!novas.length && todas.length) { s.estradaUsadas = []; novas = todas; } // já ouviu todas: recomeça
      // as que têm mais gente do grupo envolvida têm preferência
      novas.sort(function (a, b) { return (b.requer || []).length - (a.requer || []).length + (Math.random() - 0.5) * 2; });
      var c = novas[0]; if (!c) return;
      s.estradaUsadas.push(c.id);
      Estrada.rodando = { c: c, i: 0, t: 0 };
    }
  };

  // ---------------- chefes: fases, apanhar, derrota ----------------
  var vistoChefe = { obj: null, fase: -1, estado: null, cdApanha: 0 };
  V.chefe = function (m) {
    var ch = m.chefe, F = BSI.data.falasChefe || {};
    if (!ch || !ch.ativo) return;
    var id = ch.id || (ch.d && ch.d.id) || Object.keys(BSI.chefes).filter(function (k) { return ch instanceof BSI.chefes[k]; })[0];
    var tab = F[id]; if (!tab) return;
    if (vistoChefe.obj !== ch) { vistoChefe = { obj: ch, fase: ch.fase, estado: ch.estado, cdApanha: m.tempo + 3 }; if (tab.entrada) m.falar(ch, preencher(sortear(tab.entrada, id + ':entrada')), 2.6); return; }
    if (ch.fase !== vistoChefe.fase) { vistoChefe.fase = ch.fase; var lf = tab['fase' + ch.fase] || tab.fase; if (lf) m.falar(ch, preencher(sortear(lf, id + ':fase')), 3); }
    var fim = ['derrotado', 'derrotada', 'paz'].indexOf(ch.estado) >= 0;
    if (fim && vistoChefe.estado !== ch.estado && tab.derrota) m.falar(ch, preencher(sortear(tab.derrota, id + ':derrota')), 3.2);
    vistoChefe.estado = ch.estado;
  };
  V.chefeApanhou = function (m, ch) {
    var F = BSI.data.falasChefe || {}, id = Object.keys(BSI.chefes).filter(function (k) { return ch instanceof BSI.chefes[k]; })[0], tab = F[id];
    if (!tab || !tab.apanha || vistoChefe.cdApanha > m.tempo || Math.random() > 0.35) return;
    vistoChefe.cdApanha = m.tempo + 4;
    m.falar(ch, preencher(sortear(tab.apanha, id + ':apanha')), 1.8);
  };

  // ---------------- todo quadro ----------------
  var juizoAntes = null, fogoAntes = 0;
  V.atualizar = function (m, dt) {
    var s = S(); if (!s) return;
    Estrada.atualizar(m, dt);
    V.chefe(m);
    // juízo caiu abaixo de 30
    var j = s.medidores.juizo;
    if (juizoAntes !== null && juizoAntes >= 30 && j < 30) V.reagir(m, 'juizoBaixo');
    juizoAntes = j;
    // fogo se espalhando
    if (m.fogo.n > 14 && fogoAntes <= 14) V.reagir(m, 'fogo', m.temNoGrupo('daniel') && Math.random() < 0.5 ? 'daniel' : null);
    fogoAntes = m.fogo.n;
  };
})();
