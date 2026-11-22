/* =========================================================
   abilities.js — habilidades individuais (botão K).
   Cada uma: nome, cd (recarga em segundos) e usar(heroi, mundo).
   usar() devolve false quando não deu pra usar (sem gastar recarga).
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, F = function (k) { return BSI.falas.sorteia(k); };

  function inimigoMaisPerto(h, mundo, raio, filtro) {
    var melhor = null, md = raio * raio;
    var l = mundo.inimigos;
    for (var i = 0; i < l.length; i++) {
      var e = l[i];
      if (e.morto || e.time !== 'inimigos') continue;
      if (filtro && !filtro(e)) continue;
      var d = U.dist2(e.x, e.y, h.x, h.y);
      if (d < md) { md = d; melhor = e; }
    }
    return melhor;
  }

  var H = {
    // ---------------- HELANO "LAPUCA" ----------------
    tiroProfeta: {
      nome: 'Tiro do Profeta', cd: 8,
      usar: function (h, mundo) {
        // no palanque do CDs: uma FRASE de profeta vale mais que bala
        var ch = mundo.chefe;
        if (ch && ch.cds && ch.livre()) {
          mundo.tempoLento(0.3, 0.8);
          mundo.falar(h, BSI.rng.pick(['Promessa sem chão é nuvem sem chuva.', 'Quem promete o mar nunca viu o açude.', 'A terra não tem dono. Tem gente.']), 2.6);
          mundo.agendar(0.5, function () { ch.frase(mundo, h); }, true);
          return;
        }
        if (BSI.state.municao <= 0 && !BSI.debug.op.municaoInfinita) { mundo.falar(h, 'Profeta sem cartucho é só um homem calado.', 2); return false; }
        mundo.tempoLento(0.25, 0.9);
        BSI.audio.sfx('tempoLento');
        mundo.falar(h, F('helanoTiro'), 2);
        mundo.agendar(0.45, function () {
          if (h.caido) return;
          var alvo = inimigoMaisPerto(h, mundo, 330);
          var d = alvo ? U.norm(alvo.x - h.x, (alvo.y - 4) - (h.y - 6)) : h.face;
          h.face = d; h.dir = U.dirDe(d.x, d.y);
          if (!BSI.debug.op.municaoInfinita) BSI.state.municao = Math.max(0, BSI.state.municao - 1);
          mundo.projeteis.push(new BSI.Projetil({ x: h.x + d.x * 8, y: h.y - 6 + d.y * 6, vx: d.x * 560, vy: d.y * 560, vida: 0.65, dano: 6, fura: 3, time: 'herois', tipo: 'profeta', dono: h }));
          mundo.clarao(h.x + d.x * 10, h.y - 6);
          mundo.camera.tremer(4);
          BSI.audio.sfx('tiro');
        }, true);
      }
    },

    // ---------------- ZÉ NETO ----------------
    consulta: {
      nome: 'Consulta Grátis', cd: 9,
      usar: function (h, mundo) {
        var paciente = null, pior = 99;
        mundo.herois.forEach(function (o) {
          if (o === h || U.dist(o, h) > 34) return;
          var nota = o.caido ? -1 : (o.vida < o.vidaMax ? o.vida : 99);
          if (nota < pior) { pior = nota; paciente = o; }
        });
        if (!paciente) { mundo.falar(h, 'Ninguém doente? Então chá de boldo preventivo pra todo mundo.', 2.2); return false; }
        // 35% de chance do diagnóstico dar errado
        if (BSI.rng.chance(0.35)) {
          if (paciente.caido) paciente.reviver(1);
          paciente.st.zonzo = 4;
          mundo.falar(h, F('zenetoFalha'), 2);
          BSI.audio.sfx('falha');
          mundo.particulas.explosao(paciente.x, paciente.y - 10, 8, ['#9fd0a0', '#e0c27a'], 25, 0.6);
        } else {
          if (paciente.caido) { paciente.reviver(3); mundo.encherPoder(15); mundo.falar(paciente, 'Voltei! Que gosto de boldo é esse?', 1.8); }
          else paciente.curar(3);
          mundo.falar(h, F('zenetoCura'), 2);
          BSI.audio.sfx('cura');
          mundo.particulas.explosao(paciente.x, paciente.y - 10, 10, ['#ffffff', '#9fd0a0'], 30, 0.7, { grav: -20 });
        }
      }
    },

    // ---------------- JOÃO VITOR "MISERÁVEL" ----------------
    labia: {
      nome: 'Lábia', cd: 10,
      usar: function (h, mundo) {
        // no palanque: a lábia devolve as promessas pro próprio CDs
        var cds = mundo.chefe;
        if (cds && cds.cds && cds.livre()) {
          var n = cds.refletirPerto(mundo, h, 95);
          mundo.falar(h, n ? 'Promessa boa assim, doutor, guarda pra tu!' : 'Cadê as promessas? Me dá que eu devolvo!', 2.2);
          if (!n) return false;
          return;
        }
        var alvo = inimigoMaisPerto(h, mundo, 70, function (e) { return e.humano && !e.alma && !e.chefe; });
        if (!alvo && mundo.chefe && !mundo.chefe.morto && U.dist(mundo.chefe, h) < 80) { mundo.falar(h, 'Esse aí é presidente de time. Não tem lábia que chegue.', 2.2); return false; }
        if (!alvo) { mundo.falar(h, 'Não tem ninguém aqui pra eu enrolar, não.', 1.8); return false; }
        if (BSI.rng.chance(0.65)) {
          alvo.converter(7);
          mundo.falar(h, F('labiaConverte'), 2.2);
          mundo.falar(alvo, 'Rapaz... faz sentido.', 1.6);
        } else {
          alvo.atordoar(3);
          mundo.soltarItem('municao', alvo.x, alvo.y, 3);
          mundo.falar(h, F('labiaPedagio'), 2.2);
        }
        BSI.audio.sfx('confirma');
      }
    },

    // ---------------- JOÃO LUIZ AMADEU ----------------
    lealdade: {
      nome: 'Lealdade de Ferro', cd: 9,
      usar: function (h, mundo) {
        h.st.escudo = 4;
        mundo.falar(h, F('lealdade'), 1.8);
        BSI.audio.sfx('estalo');
      }
    },

    // ---------------- LUIZ FERNANDO AMADEU ----------------
    ritual: {
      nome: 'Ritual Amadeu', cd: 12,
      usar: function (h, mundo) {
        mundo.efeitos.push({ tipo: 'circulo', x: h.x, y: h.y, r: 34, t: 7, t0: 7 });
        mundo.falar(h, F('ritual'), 2);
        BSI.audio.sfx('cura');
      }
    },

    // ---------------- JOÃO PEDRO ----------------
    escapamento: {
      nome: 'Escapamento das 2h', cd: 8,
      usar: function (h, mundo) {
        // no palanque: a confusão política do João Pedro trava o discurso
        var cds = mundo.chefe;
        if (cds && cds.cds && cds.livre()) {
          mundo.falar(h, 'Doutor, o senhor é Lula ou Bolsonaro? Porque eu sou os DOIS! Lado a lado no meu altar!', 3);
          cds.travar(mundo, 3.5, 'Eu... sou... a favor... dos dois? De nenhum? Que pergunta é essa?!');
          BSI.audio.sfx('escapamento');
          return;
        }
        h.st.montado = 5;
        mundo.inimigos.forEach(function (e) { if (!e.morto && U.dist(e, h) < 75) e.atordoar(2.5); });
        mundo.barulho(h.x, h.y, 340); // o ronco chama gente de longe
        mundo.camera.tremer(3);
        for (var i = 0; i < 10; i++) mundo.particulas.fumaca(h.x + (Math.random() - 0.5) * 16, h.y);
        mundo.particulas.explosao(h.x, h.y, 10, [BSI.cor.fogo2, BSI.cor.fogo1], 60, 0.3);
        mundo.efeitos.push({ tipo: 'onda', x: h.x, y: h.y - 4, r: 0, rMax: 75, t: 0.4, t0: 0.4 });
        BSI.audio.sfx('escapamento');
        mundo.falar(h, F('escapamento'), 2);
      }
    },

    // ---------------- DAVI ----------------
    tirarExcesso: {
      nome: 'TIRAR O EXCESSO!', cd: 18,
      usar: function (h, mundo) { BSI.excesso.gritar(h, mundo); }
    },

    // ---------------- VANDER ----------------
    visao: {
      nome: 'Visão', cd: 10,
      usar: function (h, mundo) {
        if (mundo.chefe && mundo.chefe.alma && mundo.chefe.livre()) return false; // perto da alma, K vira a reza (segurar)
        h.st.invisivel = 2.5;
        var n = mundo.mapa.revelarSegredos(h.x, h.y, 140);
        mundo.revelar = 6;
        mundo.falar(h, n > 0 ? 'Tem caminho onde ninguém vê.' : F('vander'), 2.2);
        if (n > 0) BSI.hud.aviso('Vander revelou uma passagem escondida!');
        BSI.audio.sfx('tempoLento');
      }
    },

    // ---------------- MIGUEL ----------------
    rouboMadrugada: {
      nome: 'Roubo da Madrugada', cd: 12,
      usar: function (h, mundo) {
        h.st.invisivel = 6;
        mundo.estatistica('carne'); // a "isca" sempre sai da carne de sol da Tia Zane
        if (mundo.chefe && mundo.chefe.alma && mundo.chefe.livre()) {
          // contra a alma: deixa a carne assada de isca
          mundo.props.push(new BSI.Isca(h.x, h.y));
          mundo.falar(h, 'Ó a carne assada, alma! Vem, vem!', 1.8);
          BSI.audio.sfx('troca');
          return;
        }
        mundo.falar(h, F('roubo'), 1.6);
        BSI.audio.sfx('troca');
      }
    },

    // ---------------- HUGO ----------------
    gambiarra: {
      nome: 'Gambiarra', cd: 14,
      usar: function (h, mundo) {
        // perto de um cabo da caixa de som: sabota em vez de montar torre
        var cabo = mundo.props.filter(function (p) { return p.cabo && !p.cortado && U.dist(p, h) < 34; })[0];
        if (cabo) { cabo.cortar(mundo); mundo.falar(h, 'Um alicate e fé. Pronto.', 1.6); return; }
        var x = h.x + h.face.x * 16, y = h.y + h.face.y * 12;
        var p = mundo.mapa.pontoLivre(x, y, 4, 3);
        mundo.props.push(new BSI.Torre(p.x, p.y));
        if (BSI.combos) BSI.combos.registrar('gambiarra', h, mundo);
        mundo.falar(h, F('gambiarra'), 2);
        BSI.audio.sfx('estalo');
      }
    },

    // ---------------- DANIEL ----------------
    fogo: {
      nome: 'Fogo', cd: 5,
      usar: function (h, mundo) {
        var alvo = inimigoMaisPerto(h, mundo, 70);
        var tx, ty;
        if (alvo && (alvo.x - h.x) * h.face.x + (alvo.y - h.y) * h.face.y > 0) { tx = alvo.x; ty = alvo.y; }
        else { tx = h.x + h.face.x * 42; ty = h.y + h.face.y * 36; }
        mundo.efeitos.push({ tipo: 'galao', x0: h.x, y0: h.y - 8, x: tx, y: ty, t: 0.38, t0: 0.38, dono: h });
        if (BSI.combos) BSI.combos.registrar('fogo', h, mundo);
        mundo.falar(h, F('danielFogo'), 1.6);
        BSI.audio.sfx('facada');
      }
    },

    // ---------------- JOÃO CARLOS ----------------
    conversa: {
      nome: 'Conversa de Família', cd: 10,
      usar: function (h, mundo) {
        var bebado = inimigoMaisPerto(h, mundo, 60, function (e) { return e.conversavel; });
        if (bebado) {
          if (bebado.chefe && BSI.story.tem('jc_familia')) { mundo.falar(h, 'Não vou atrapalhar a festa do meu primo. Família é família.', 2.2); return false; }
          bebado.acalmar(5);
          mundo.falar(h, 'Primo, senta aqui. Bora conversar sobre a família.', 2.2);
          return;
        }
        var n = 0;
        mundo.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos' && U.dist(e, h) < 120) { e.forcarAlvo(h, 4); n++; } });
        if (!n) { mundo.falar(h, 'Ninguém pra eu provocar. Que paz.', 1.6); return false; }
        h.st.escudo = 2; // segura o tranco de frente enquanto provoca
        mundo.falar(h, F('provocacao'), 2);
        BSI.audio.sfx('alerta');
      }
    }
  };

  BSI.habilidades = {
    lista: H,
    de: function (h) { return H[h.def.habilidade]; },
    usar: function (h, mundo) {
      var hab = H[h.def.habilidade];
      if (!hab) return;
      if (h.cdHab > 0) { BSI.audio.sfx('estalo'); return; }
      var r = hab.usar(h, mundo);
      if (r !== false) {
        if (BSI.falasVivas && mundo.lider() !== h) mundo.agendar(1.6, function () { BSI.falasVivas.dizer(mundo, h, 'habilidade', { chance: 0.3 }); });
        h.cdHab = hab.cd;
        h.cdHabMax = hab.cd;
        mundo.estatistica('habilidades');
        mundo.encherPoder(6);
      }
    }
  };
})();
