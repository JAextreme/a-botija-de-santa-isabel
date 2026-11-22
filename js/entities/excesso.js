/* =========================================================
   excesso.js — "TIRAR O EXCESSO!" do Davi.
   Ele grita e o jogo sorteia um efeito absurdo desta tabela.
   Às vezes salva, às vezes estraga tudo. Para acrescentar um
   efeito, é só colocar mais um item na lista.
   (o debug pode forçar um efeito específico)
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;

  var TABELA = [
    {
      // só com a caixa de som do Gojoba ligada (1 vez)
      id: 'volume', nome: 'Tirou o excesso de volume', peso: 8,
      so: function (m) { return m.caixa && m.caixa.ativa && !m.caixa.excesso; },
      fn: function (h, m) {
        if (!m.caixa || !m.caixa.ativa || m.caixa.excesso) return 'Não tinha volume nenhum pra tirar.';
        m.caixa.excesso = true; m.caixa.reduzir(m, 'excesso');
        return 'Girou o botão da caixa pro lado certo. Pela primeira vez na vida.';
      }
    },
    {
      // só aparece quando tem alma por perto
      id: 'alma', nome: 'Tirou o excesso de alma', peso: 6,
      so: function (m) { return m.chefe && m.chefe.alma && m.chefe.livre(); },
      fn: function (h, m) {
        var a = m.chefe;
        if (!a || !a.alma || !a.livre()) return 'Não tinha alma nenhuma... ainda.';
        a.levarDano(14, m, h, 'excesso');
        a.fugir(2, h);
        return 'A alma do coronel ficou mais leve. E mais longe.';
      }
    },
    {
      id: 'projeteis', nome: 'Tirou o excesso de bala do ar', peso: 3,
      fn: function (h, m) {
        var n = 0;
        m.projeteis.forEach(function (p) { if (p.time !== 'herois') { p.morto = true; n++; } });
        m.inimigos.forEach(function (e) { if (!e.morto && U.dist(e, h) < 100) e.atordoar(1.2); });
        return n ? 'Sumiu tudo que tava voando!' : 'Não tinha nada voando... mas agora tem menos ainda.';
      }
    },
    {
      id: 'municao', nome: 'Jogou fora metade da munição', peso: 2,
      fn: function () {
        var antes = BSI.state.municao;
        BSI.state.municao = Math.floor(antes / 2);
        return 'Era cartucho demais, macho. Ficou ' + BSI.state.municao + '.';
      }
    },
    {
      id: 'bodes', nome: 'Transformou os inimigos em bode', peso: 3,
      fn: function (h, m) {
        var n = 0;
        m.inimigos.forEach(function (e) { if (!e.morto && U.dist(e, h) < 220) { e.virarBode(5); n++; } });
        BSI.audio.sfx('bode');
        return n ? 'Méééé. O bode aprova.' : 'Não tinha inimigo... o bode ficou com ciúme.';
      }
    },
    {
      id: 'teleporte', nome: 'Teleportou o grupo', peso: 2,
      fn: function (h, m) {
        // pula pra um lugar livre aleatório perto (até 10 tiles)
        var T = BSI.cfg.TILE, ok = null;
        for (var i = 0; i < 40 && !ok; i++) {
          var x = h.x + (BSI.rng.next() - 0.5) * 20 * T, y = h.y + (BSI.rng.next() - 0.5) * 20 * T;
          if (x > T && y > T && x < (m.mapa.w - 1) * T && y < (m.mapa.h - 1) * T && !BSI.colisao.tocaSolido(h, m.mapa, x, y)) ok = { x: x, y: y };
        }
        if (!ok) return 'Era pra teleportar. Ninguém saiu do lugar.';
        m.herois.forEach(function (o) {
          m.particulas.explosao(o.x, o.y, 8, ['#d9798a', '#f0c75e'], 30, 0.4);
          var p = m.mapa.pontoLivre(ok.x + (BSI.rng.next() - 0.5) * 16, ok.y + (BSI.rng.next() - 0.5) * 16, 4, 3);
          o.x = p.x; o.y = p.y;
        });
        m.reiniciarTrilha();
        m.camera.pular(h, m.mapa);
        return 'Ninguém sabe como. Nem o Davi.';
      }
    },
    {
      id: 'careca', nome: 'Raspou a cabeça de alguém', peso: 2,
      fn: function (h, m) {
        var vivos = m.herois.filter(function (o) { return !o.caido && !o.careca; });
        if (!vivos.length) return 'Todo mundo já tava careca.';
        var v = BSI.rng.pick(vivos);
        v.careca = true; v.atualizarSprite();
        m.particulas.explosao(v.x, v.y - 14, 12, ['#2b1d14', '#3a2416'], 30, 0.6, { grav: 60 });
        m.falar(v, 'MEU CABELO, DAVI!', 2);
        return 'Raspou o ' + v.nome() + '. Ficou mais aerodinâmico.';
      }
    },
    {
      id: 'vida', nome: 'Tirou o excesso de vida dos inimigos', peso: 2,
      fn: function (h, m) {
        m.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos') { e.vida = Math.min(e.vida, 1); e.flash = 0.3; } });
        return 'Agora qualquer peteleco derruba.';
      }
    },
    {
      id: 'peso', nome: 'Tirou o excesso de peso', peso: 2,
      fn: function (h, m) {
        m.herois.forEach(function (o) { if (!o.caido) o.st.rapido = 6; });
        return 'O grupo tá leve que só pena de avoante!';
      }
    },
    {
      id: 'juizo', nome: 'Tirou o excesso de juízo', peso: 2,
      fn: function () {
        BSI.story.medidor('juizo', -15);
        return 'Ninguém aqui tinha juízo sobrando... agora tem menos.';
      }
    },
    {
      id: 'cartucheira', nome: 'Tirou a cartucheira dos outros', peso: 2,
      fn: function (h, m) {
        var n = 0;
        m.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos' && U.dist(e, h) < 200) n++; });
        var ganho = 3 + n * 2;
        BSI.state.municao += ganho;
        return '+' + ganho + ' cartuchos. Ninguém viu de onde veio.';
      }
    },
    {
      id: 'escuro', nome: 'Tirou o excesso de escuridão', peso: 2,
      fn: function (h, m) {
        m.luzTotal = 8;
        return 'Clareou tudo! O Davi diz que foi ele. Pode ter sido a lua.';
      }
    },
    {
      id: 'mato', nome: 'Tirou o excesso de mato', peso: 2,
      fn: function (h, m) {
        var T = BSI.cfg.TILE, cx = Math.floor(h.x / T), cy = Math.floor(h.y / T), n = 0;
        for (var y = -4; y <= 4; y++) for (var x = -4; x <= 4; x++) {
          if (m.mapa.ch(cx + x, cy + y) === ',') { m.mapa.trocar(cx + x, cy + y, '.'); n++; }
        }
        return n ? 'Capinou ' + n + ' palmos de mato na unha. Fogo agora não pega aqui.' : 'Não tinha mato. Ele arrancou foi a paciência de todo mundo.';
      }
    },
    {
      id: 'gente', nome: 'Tirou o excesso de gente', peso: 1,
      fn: function (h, m) {
        m.herois.forEach(function (o) { if (o !== h && !o.caido) { o.kbx += (BSI.rng.next() - 0.5) * 500; o.kby += (BSI.rng.next() - 0.5) * 500; o.st.zonzo = 2; } });
        return 'Espalhou o grupo todinho. "Tava muito aglomerado", disse ele.';
      }
    },
    {
      id: 'medo', nome: 'Tirou o excesso de coragem dos inimigos', peso: 2,
      fn: function (h, m) {
        m.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos') e.fugir(5, h); });
        return 'Saíram correndo sem saber de quê.';
      }
    }
  ];

  BSI.excesso = {
    tabela: TABELA,
    forcado: null, // id escolhido no debug
    gritar: function (h, mundo) {
      var ef = null;
      if (BSI.excesso.forcado) ef = TABELA.filter(function (e) { return e.id === BSI.excesso.forcado; })[0];
      if (!ef) ef = BSI.rng.pickPeso(TABELA.filter(function (e) { return !e.so || e.so(mundo); }));
      BSI.audio.sfx('excesso');
      mundo.camera.tremer(3);
      mundo.falar(h, 'TIRAR O EXCESSO!', 1.6);
      var resultado = ef.fn(h, mundo) || '';
      BSI.hud.faixa('TIRAR O EXCESSO!', ef.nome, resultado);
      mundo.estatistica('excessos');
    }
  };
})();
