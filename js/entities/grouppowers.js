/* =========================================================
   grouppowers.js — PODERES DE GRUPO (botão L)
   A barra enche ao causar dano, usar habilidade e reviver gente.
   Cheia: usa o poder do grupo que tem pelo menos 2 membros no
   grupo ativo (se tiver mais de um, o jogador escolhe).
   PODER MÁXIMO: precisa de TODOS os membros, 1 vez por fase.
   DESCONFIANÇA alta: o poder pode falhar.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  function noTela(mundo, e) {
    var cx = mundo.camera.x, cy = mundo.camera.y;
    return e.x > cx - 16 && e.x < cx + BSI.view.w + 16 && e.y > cy - 16 && e.y < cy + BSI.view.h + 24;
  }
  function inimigosNaTela(mundo) {
    return mundo.inimigos.filter(function (e) { return !e.morto && e.time === 'inimigos' && noTela(mundo, e); });
  }
  function membrosPresentes(mundo, grupo) {
    var g = BSI.data.grupos[grupo];
    return mundo.herois.filter(function (h) { return !h.caido && g.membros.indexOf(h.id) >= 0; });
  }
  function luaCheia(mundo) { return !!mundo.dados.luaCheia; }

  var P = {
    // ---------------- TRIBO DOS AMADEUS ----------------
    pacto: {
      nome: 'Pacto Amadeu', grupo: 'amadeus',
      usar: function (m) {
        var n = 0;
        inimigosNaTela(m).forEach(function (e) { if (e.humano) { e.atordoar(5); m.falar(e, '?!', 1.5); n++; } });
        if (m.chefe && m.chefe.humano) { m.chefe.atordoar(3); }
        membrosPresentes(m, 'amadeus').forEach(function (h) { h.inv = 5; h.flash = 0; });
        BSI.hud.faixa('PACTO AMADEU', 'O gesto secreto da tribo!', n ? n + ' cabra(s) ficaram sem entender nada.' : 'Ninguém entendeu. Nem a tribo.');
      }
    },
    ritualTres: {
      nome: 'Ritual dos Três Amadeus', grupo: 'amadeus', maximo: true,
      podeUsar: function (m) { return m.chefe && m.chefe.pularFase ? true : 'Só funciona diante de um grande inimigo (boss).'; },
      usar: function (m) {
        if (!m.chefe || !m.chefe.pularFase) { BSI.hud.faixa('RITUAL DOS TRÊS AMADEUS', 'Giz, palma e juramento...', 'Mas não tinha boss nenhum por perto.'); return; }
        BSI.hud.faixa('RITUAL DOS TRÊS AMADEUS', 'Giz, palma e juramento...', 'O boss pulou uma fase inteira!');
        m.chefe.pularFase(m);
      }
    },
    // ---------------- NETOS DO TIO OTA ----------------
    heranca: {
      nome: 'Herança do Tio Ota', grupo: 'netos',
      usar: function (m) {
        m.herois.forEach(function (h) { if (!h.caido) { h.st.rapido = 8; h.st.forte = 8; } });
        BSI.state.suspeitaZane = (BSI.state.suspeitaZane || 0) + 8;
        BSI.audio.sfx('aboio');
        BSI.hud.faixa('HERANÇA DO TIO OTA', 'A memória do avô dá coragem.', 'Grupo mais rápido e com o dobro de dano por 8 s.');
      }
    },
    aboio: {
      nome: 'O Aboio do Tio Ota', grupo: 'netos', maximo: true,
      usar: function (m) {
        BSI.state.suspeitaZane = (BSI.state.suspeitaZane || 0) + 15;
        BSI.audio.sfx('aboio');
        m.estouroBoiada();
        // contra ALMA é o golpe mais forte do jogo: acerta sempre (e termina a alma fraca)
        var ch = m.chefe;
        if (ch && ch.alma && ch.livre()) m.agendar(0.9, function () { if (ch.livre()) { ch.levarDano(45, m, m.lider(), 'aboio'); ch.fugir(2, m.lider()); } });
        BSI.hud.faixa('O ABOIO DO TIO OTA', 'Lá do curral, um aboio...', 'E o gado veio em disparada!');
      }
    },
    // ---------------- FAMÍLIA DO DAVI ----------------
    doideira: {
      nome: 'Doideira de Sangue', grupo: 'familia',
      usar: function (m) {
        var x2 = luaCheia(m) ? 2 : 1, r = BSI.rng.next(), extra = luaCheia(m) ? ' (lua cheia: em dobro!)' : '';
        if (r < 0.4) {
          inimigosNaTela(m).forEach(function (e) { e.levarDano(6 * x2, m, m.lider(), 'poder'); });
          if (m.chefe && noTela(m, m.chefe)) m.chefe.levarDano(5 * x2, m, m.lider(), 'poder');
          m.camera.tremer(5);
          BSI.hud.faixa('DOIDEIRA DE SANGUE', 'Ninguém entendeu o plano...', 'Mas funcionou! Dano em todo mundo' + extra);
        } else if (r < 0.7) {
          for (var i = 0; i < x2 + 1; i++) { var ef = BSI.rng.pickPeso(BSI.excesso.tabela.filter(function (e) { return !e.so || e.so(m); })); ef.fn(m.lider(), m); }
          BSI.hud.faixa('DOIDEIRA DE SANGUE', 'Falaram o idioma da família...', 'Efeitos absurdos aconteceram' + extra);
        } else {
          m.herois.forEach(function (h) { if (!h.caido) h.st.atordoado = 1.5 * x2; });
          BSI.hud.faixa('DOIDEIRA DE SANGUE', 'O plano era tão bom...', 'que o grupo inteiro tropeçou e caiu' + extra);
        }
      }
    },
    caosCalma: {
      nome: 'Caos e Calma', grupo: 'familia', maximo: true,
      podeUsar: function () { return BSI.story.tem('irmaos_unidos') ? true : 'Só depois que os irmãos se encontrarem...'; },
      usar: function (m) {
        m.caosCalma = 10;
        BSI.hud.faixa('CAOS E CALMA', 'Gadernal enlouquece, Diazepan desacelera.', 'Inimigos lentos e perdidos por 10 s.');
      }
    },
    // ---------------- TURMA DO ALPENDRE ----------------
    conselho: {
      nome: 'Conselho do Alpendre', grupo: 'alpendre',
      usar: function (m) {
        m.conselho = 7;
        m.conselhoErrado = BSI.rng.chance(0.25); // diagnóstico do Zé Neto pode estar errado
        var falas = { helano: 'O caminho seguro é o que ninguém pisa.', vander: 'Eu vi isso num sonho...', zeneto: m.conselhoErrado ? 'Diagnóstico: é pra lá! (ou pra cá)' : 'Diagnóstico: é pra lá!', hugo: 'Dá pra fazer uma gambiarra ali.', joaocarlos: 'Primo, escuta o conselho.' };
        membrosPresentes(m, 'alpendre').forEach(function (h) { m.falar(h, falas[h.id], 2.5); });
        BSI.hud.faixa('CONSELHO DO ALPENDRE', 'Profecia, visão, diagnóstico e gambiarra.', 'Pontos fracos à mostra (+50% de dano) por 7 s.');
      }
    },
    gambiarraProfetica: {
      nome: 'Gambiarra Profética', grupo: 'alpendre', maximo: true,
      usar: function (m) {
        if (m.chefe && !m.chefe.morto) {
          m.chefe.atordoar(4);
          m.chefe.levarDano(m.chefe.vidaFase * 0.4, m, m.lider(), 'gambiarra');
          BSI.hud.faixa('GAMBIARRA PROFÉTICA', 'Arame, prego, profecia e boldo.', 'A geringonça derrubou o boss!');
        } else {
          var T = BSI.cfg.TILE, L = m.lider(), cx = Math.floor(L.x / T), cy = Math.floor(L.y / T), n = 0;
          for (var y = cy - 14; y <= cy + 14; y++) for (var x = cx - 14; x <= cx + 14; x++) if (m.mapa.ch(x, y) === 'G') { m.mapa.trocar(x, y, '.'); n++; }
          n += m.mapa.revelarSegredos(L.x, L.y, 220);
          BSI.hud.faixa('GAMBIARRA PROFÉTICA', 'Ninguém sabe como funciona.', n ? 'Abriu ' + n + ' passagem(ns) impossível(is)!' : 'Não tinha nada impossível por perto.');
        }
      }
    }
  };

  var G = BSI.poderes = {
    lista: P,

    // quais poderes dá pra usar agora
    disponiveis: function (m) {
      var r = [];
      Object.keys(P).forEach(function (id) {
        var p = P[id], g = BSI.data.grupos[p.grupo];
        var presentes = membrosPresentes(m, p.grupo).length;
        if (presentes < 2) return;
        var ok = true;
        if (p.maximo) {
          if (presentes < g.membros.length) ok = 'Precisa de todos: ' + g.membros.map(function (i) { return BSI.data.personagens[i].curto; }).join(', ');
          else if (!m.poderInfinito && (BSI.state.maximos || {})[BSI.state.fase + ':' + id]) ok = 'Já foi usado nesta fase.';
        }
        if (ok === true && p.podeUsar) ok = p.podeUsar(m);
        r.push({ id: id, nome: p.nome, grupo: g.nome, maximo: !!p.maximo, ok: ok });
      });
      return r;
    },

    apertou: function (m) {
      var S = BSI.state;
      if ((S.poder || 0) < 100 && !BSI.debug.op.semRecarga) { BSI.hud.aviso('Barra de poder em ' + Math.floor(S.poder || 0) + '%'); BSI.audio.sfx('estalo'); return; }
      var lista = G.disponiveis(m).filter(function (p) { return p.ok === true; });
      if (!lista.length) {
        var todos = G.disponiveis(m);
        BSI.hud.aviso(todos.length ? todos[0].ok : 'Nenhum grupo com 2 membros juntos aqui.');
        BSI.audio.sfx('estalo');
        return;
      }
      if (lista.length === 1) G.usar(lista[0].id, m);
      else BSI.jogo.abrirModal(new Escolha(G.disponiveis(m), m));
    },

    usar: function (id, m) {
      var p = P[id], S = BSI.state;
      if (BSI.falasVivas) m.agendar(0.4, function () { BSI.falasVivas.reagir(m, 'poder'); }, true);
      S.poder = 0;
      if (p.maximo) { S.maximos = S.maximos || {}; S.maximos[S.fase + ':' + id] = true; }
      m.estatistica('poderes');
      // desconfiança alta = o poder pode falhar
      var desc = S.medidores.desconfianca, risco = desc > 60 ? (desc - 60) / 80 : 0;
      if (p.grupo === 'amadeus' && S.segredo === 'joaovitor') risco += 0.2;
      if (BSI.rng.chance(risco)) {
        BSI.audio.sfx('falha');
        if (p.grupo === 'amadeus') {
          membrosPresentes(m, 'amadeus').forEach(function (h) { h.st.zonzo = 3; h.kbx += (Math.random() - 0.5) * 400; h.kby += (Math.random() - 0.5) * 400; });
          BSI.hud.faixa(p.nome.toUpperCase(), 'FALHOU!', 'A desconfiança desfez o pacto: a tribo saiu correndo cada um pra um lado.');
        } else BSI.hud.faixa(p.nome.toUpperCase(), 'FALHOU!', 'Ninguém confia em ninguém... o poder não veio.');
        return;
      }
      BSI.audio.sfx('excesso');
      m.camera.tremer(4);
      m.particulas.explosao(m.lider().x, m.lider().y - 10, 24, [C.amarelo, C.branco, C.ocre], 70, 0.8);
      p.usar(m);
    }
  };

  // ---------------- menu de escolha ----------------
  function Escolha(lista, m) {
    var self = this;
    this.menu = new BSI.Menu(lista.map(function (p) {
      return {
        txt: (p.maximo ? '★ ' : '') + p.nome + (p.ok === true ? '' : '  (indisponível)'),
        ativo: function () { return p.ok === true; },
        acao: function () { BSI.jogo.fecharModal(); G.usar(p.id, m); }
      };
    }), { y: function () { return Math.round(BSI.view.h * 0.3); }, larg: Math.min(BSI.view.w - 20, 200), alt: 15 });
    this.lista = lista;
  }
  Escolha.prototype.atualizar = function () {
    if (BSI.input.apertou('pausa') || BSI.input.apertou('poder')) { BSI.jogo.fecharModal(); return; }
    this.menu.atualizar();
  };
  Escolha.prototype.desenhar = function (g) {
    g.fillStyle = 'rgba(10,6,20,0.75)'; g.fillRect(0, 0, BSI.view.w, BSI.view.h);
    this.menu.desenhar(g);
  };
  Escolha.prototype.desenharTexto = function () {
    var W = BSI.view.w;
    BSI.texto.escrever('PODER DE GRUPO', W / 2, Math.round(BSI.view.h * 0.3) - 20, { tam: 11, alinhar: 'center', cordel: true, cor: C.amarelo });
    this.menu.desenharTexto();
    var p = this.lista[this.menu.sel];
    if (p) BSI.texto.escrever(p.grupo + (p.ok === true ? '' : ' — ' + p.ok), W / 2, Math.round(BSI.view.h * 0.3) + this.lista.length * 15 + 6, { tam: 6.5, alinhar: 'center', cor: '#d8cdb0' });
  };
})();
