/* =========================================================
   hud.js — interface durante o jogo:
   rostos do grupo (1-6 pedem habilidade, Q/Tab troca), corações, habilidade com recarga,
   munição, pilha da lanterna, medidores, avisos, balões de fala
   e a faixa gigante do "TIRAR O EXCESSO!".
   Desenho em pixel no canvas do jogo; texto no canvas de texto.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;

  var avisos = [];      // {txt, t, cor}
  var legendas = [];    // legendas de som: {txt, t}
  var faixa = null;     // {titulo, sub, extra, t}
  var medPisca = {};    // medidor → tempo piscando

  // coração 7x6 (cheio, meio, vazio)
  var CORACAO = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  function coracao(g, x, y, estado, escala) {
    escala = escala || 1;
    for (var r = 0; r < 6; r++) for (var c = 0; c < 7; c++) {
      if (CORACAO[r][c] !== '#') continue;
      var cheio = estado === 2 || (estado === 1 && c < 4);
      g.fillStyle = cheio ? (r === 1 && c < 3 ? '#ff8a7a' : C.barro) : '#3a2430';
      g.fillRect(x + c * escala, y + r * escala, escala, escala);
    }
  }
  function caixa(g, x, y, w, h, fundo, borda) {
    if (BSI.cordel && BSI.view.det > 1) { BSI.cordel.caixa(g, x, y, w, h, fundo, borda === C.amarelo); return; }
    g.fillStyle = borda || C.contorno; g.fillRect(x, y, w, h);
    g.fillStyle = fundo || 'rgba(30,20,40,0.85)'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
  }
  function barra(g, x, y, w, h, frac, cor, fundo) {
    g.fillStyle = C.contorno; g.fillRect(x, y, w, h);
    g.fillStyle = fundo || '#2a1f38'; g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.fillStyle = cor; g.fillRect(x + 1, y + 1, Math.round((w - 2) * BSI.util.clamp(frac, 0, 1)), h - 2);
  }

  // rótulo da tecla de uma ação, conforme o mapa de teclas atual: "E", "F", "Clique"...
  function nomeBotao(acao) { return BSI.input.rotulo(acao); }

  var HUD = BSI.hud = {
    nomeBotao: nomeBotao,
    caixa: caixa,
    barra: barra,
    coracao: coracao,

    aviso: function (txt, cor) {
      avisos.push({ txt: txt, t: 2.6, cor: cor || C.creme });
      if (avisos.length > 4) avisos.shift();
    },
    faixa: function (titulo, sub, extra) { faixa = { titulo: titulo, sub: sub, extra: extra, t: 3.2 }; },
    medidorMudou: function (nome, delta, txt, bom) {
      medPisca[nome] = 1.5;
      HUD.aviso(txt, bom ? '#9fe0a0' : '#ff9a7a');
    },
    medidorPisca: function (nome) { medPisca[nome] = 0.8; },
    // legenda de som (acessibilidade): "[assobio na mata]"
    legenda: function (txt) {
      for (var i = 0; i < legendas.length; i++) if (legendas[i].txt === txt) { legendas[i].t = 2.4; return; }
      legendas.push({ txt: txt, t: 2.4 }); if (legendas.length > 3) legendas.shift();
    },
    limpar: function () { avisos = []; legendas = []; faixa = null; },

    atualizar: function (dt) {
      for (var i = avisos.length - 1; i >= 0; i--) { avisos[i].t -= dt; if (avisos[i].t <= 0) avisos.splice(i, 1); }
      for (var j = legendas.length - 1; j >= 0; j--) { legendas[j].t -= dt; if (legendas[j].t <= 0) legendas.splice(j, 1); }
      if (faixa) { faixa.t -= dt; if (faixa.t <= 0) faixa = null; }
      for (var k in medPisca) medPisca[k] -= dt;
    },

    desenhar: function (g, mundo) {
      var S = BSI.state, W = BSI.view.w, H = BSI.view.h;
      var L = mundo.lider();
      var conversa = BSI.dialogo.ativo;

      // ---------- rostos do grupo ----------
      var x0 = 4, y0 = 4;
      mundo.herois.forEach(function (h, i) {
        var x = x0 + i * 19, y = y0, ativo = h === L;
        caixa(g, x, y, 18, 16, h.caido ? 'rgba(40,20,20,0.9)' : 'rgba(30,20,40,0.85)', ativo ? C.amarelo : C.contorno);
        g.globalAlpha = h.caido ? 0.35 : 1;
        var re = h.spr.retratoEsc || 1;
        g.drawImage(h.spr.retrato, x + 1, y + 2, h.spr.retrato.width / re, h.spr.retrato.height / re);
        g.globalAlpha = 1;
        if (h.caido) { g.fillStyle = C.barro; for (var k = 0; k < 10; k++) { g.fillRect(x + 4 + k, y + 3 + k, 1, 1); g.fillRect(x + 13 - k, y + 3 + k, 1, 1); } }
        // arma de cada um no cantinho do rosto (pisca se acabou a munição)
        var eh = h.arma, semMun = eh.tipo !== 'corpo' && eh.mun && BSI.armas.mun(eh.mun) <= 0 && !(eh.pente && eh.peca && eh.peca.pente > 0);
        var art = BSI.boneco.arma(eh.id);
        if (art && !(semMun && Math.floor(mundo.tempo * 4) % 2)) { var ka = Math.min(9 / (art.c.width / 2), 6 / (art.c.height / 2), 1); g.drawImage(art.c, x + 18 - (art.c.width / 2) * ka - 1, y + 14 - (art.c.height / 2) * ka, (art.c.width / 2) * ka, (art.c.height / 2) * ka); }
        if (semMun && Math.floor(mundo.tempo * 4) % 2) { g.fillStyle = '#e8403a'; g.fillRect(x + 12, y + 10, 5, 4); }
        // mini vida
        var f = h.vida / h.vidaMax;
        g.fillStyle = C.contorno; g.fillRect(x + 1, y + 16, 16, 2);
        g.fillStyle = f > 0.5 ? '#7ad07a' : (f > 0.2 ? C.ocre : C.barro); g.fillRect(x + 1, y + 16, Math.round(16 * f), 2);
        // recarga: o retrato vai "enchendo" de baixo pra cima; pronta = cantinho amarelo
        if (!h.caido && h.cdHab > 0) {
          var hb = BSI.habilidades.de(h), frc = hb ? Math.min(1, h.cdHab / (h.cdHabMax || hb.cd)) : 0;
          g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 1, y + 1, 16, Math.round(14 * frc));
        }
        if (!h.caido && h.cdHab <= 0) { g.fillStyle = C.amarelo; g.fillRect(x + 14, y + 1, 3, 3); }
        // indo fazer uma tarefa (especialista)
        if (h.ia.tarefa && Math.floor(mundo.tempo * 4) % 2) { g.fillStyle = '#9fe0a0'; g.fillRect(x + 1, y + 13, 16, 1); }
      });

      BSI.mira.desenhar(g, mundo);
      BSI.rodaArmas.desenhar(g, mundo);
      // ---------- SEGURAR POSIÇÃO: bandeirinha no posto ----------
      if (mundo.ordem === 'segurar' && mundo.pontoOrdem) {
        var bxp = Math.round(mundo.pontoOrdem.x - mundo.camera.ix()), byp = Math.round(mundo.pontoOrdem.y - mundo.camera.iy());
        g.fillStyle = C.contorno; g.fillRect(bxp, byp - 12, 1, 12);
        g.fillStyle = C.amarelo; g.fillRect(bxp + 1, byp - 12, 5, 3); g.fillRect(bxp + 1, byp - 9, 3, 1);
      }

      // ---------- líder: corações + habilidade ----------
      if (L) {
        var yc = 24;
        for (var c = 0; c < L.vidaMax / 2; c++) {
          var est = L.vida >= (c + 1) * 2 ? 2 : (L.vida === c * 2 + 1 ? 1 : 0);
          coracao(g, 4 + c * 9, yc, est, 1);
        }
        var hab = BSI.habilidades.de(L);
        if (hab) {
          var bx = 34, by = 23;
          var pronto = L.cdHab <= 0;
          caixa(g, bx, by, 10, 10, pronto ? 'rgba(200,138,42,0.9)' : 'rgba(30,20,40,0.85)', pronto ? C.amarelo : C.contorno);
          if (!pronto) {
            var fr = L.cdHab / (L.cdHabMax || hab.cd);
            g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(bx + 1, by + 1, 8, Math.round(8 * fr));
          }
        }
      }

      // ---------- ARMA NA MÃO (embaixo, à esquerda) ----------
      if (L) {
        var EA = L.arma, ax = 4, ay = H - 36;
        caixa(g, ax, ay, 70, 22, 'rgba(30,20,40,0.9)', false);
        var artA = BSI.boneco.arma(EA.id);
        if (artA) { var kk = Math.min(1, 26 / (artA.c.width / 2), 16 / (artA.c.height / 2)); g.drawImage(artA.c, ax + 4 + (26 - artA.c.width / 2 * kk) / 2, ay + 3 + (16 - artA.c.height / 2 * kk) / 2, artA.c.width / 2 * kk, artA.c.height / 2 * kk); }
        g.fillStyle = (BSI.config.raridades[EA.raridade] || {}).cor || C.creme; g.fillRect(ax + 3, ay + 19, 28, 1);
        if (L.recarga) barra(g, ax + 33, ay + 15, 34, 4, 1 - L.recarga.t / L.recarga.total, C.amarelo);
        else if (EA.pente) { for (var pb = 0; pb < Math.min(EA.pente, 14); pb++) { g.fillStyle = pb < EA.peca.pente ? C.amarelo : '#3a2d48'; g.fillRect(ax + 34 + pb * (32 / Math.min(EA.pente, 14)), ay + 15, Math.max(1, 32 / Math.min(EA.pente, 14) - 1), 3); } }
      }

      // ---------- barra de poder de grupo ----------
      var pod = (S.poder || 0) / 100, cheia = pod >= 1;
      barra(g, 4, 41, 50, 5, pod, cheia ? (Math.floor(mundo.tempo * 6) % 2 ? C.amarelo : C.branco) : '#b07ad0');

      // ---------- boss ----------
      var ch = mundo.chefe;
      if (ch && ch.ativo && ['derrotado', 'derrotada', 'paz', 'desafio'].indexOf(ch.estado) < 0 && !BSI.dialogo.ativo) {
        var bxa = 4 + mundo.herois.length * 19 + 6, bxb = W - (BSI.minimapa.ocupaDireita() ? (BSI.minimapa.caixa().w + 10) : 52);
        var bw = Math.max(80, bxb - bxa), bx = Math.round(bxa), by = 3;
        if (BSI.cordel && BSI.view.det > 1) BSI.cordel.caixa(g, bx, by, bw, 17, 'rgba(30,14,18,0.95)', false);
        else { g.fillStyle = C.contorno; g.fillRect(bx, by, bw, 17); }
        var fr = BSI.util.clamp(ch.vida / ch.vidaFase, 0, 1), pisca = ch.flash > 0 && Math.floor(mundo.tempo * 30) % 2;
        g.fillStyle = '#3a1a1a'; g.fillRect(bx + 3, by + 10, bw - 6, 4);
        g.fillStyle = pisca ? C.branco : '#c8302a'; g.fillRect(bx + 3, by + 10, Math.round((bw - 6) * fr), 4);
        g.fillStyle = '#e8604a'; g.fillRect(bx + 3, by + 10, Math.round((bw - 6) * fr), 1);
        for (var f = 0; f < (ch.semPips ? 0 : 3); f++) { g.fillStyle = f < ch.fase ? '#5a5050' : C.amarelo; g.fillRect(bx + bw - 24 + f * 7, by + 3, 5, 5); }
      }

      // ---------- canto direito: munição, pilha, rapadura ----------
      var rx = W - 4, oy = BSI.minimapa.ocupaDireita(); // o minimapa no canto empurra isso pra baixo
      BSI.minimapa.desenhar(g, mundo);
      var mun = BSI.sprites.objeto('municao');
      caixa(g, rx - 44, 4 + oy, 44, 12);
      g.drawImage(mun.c, rx - 43, 5 + oy, mun.w, mun.h);
      if (mundo.dados.noite) {
        var pil = S.pilha / 100;
        caixa(g, rx - 44, 18 + oy, 44, 8);
        var opl = BSI.sprites.objeto('pilha'); g.drawImage(opl.c, rx - 44, 17 + oy, opl.w, opl.h);
        barra(g, rx - 33, 20 + oy, 28, 4, pil, pil > 0.25 ? '#f0c75e' : (Math.floor(mundo.tempo * 4) % 2 ? C.barro : '#5a2a20'));
      }
      // medidores
      var med = S.medidores, my = (mundo.dados.noite ? 29 : 18) + oy;
      var lista = [['raiva', med.raiva / 100, '#7ab04a'], ['desconfianca', med.desconfianca / 100, '#c45a8a'], ['juizo', med.juizo / 100, '#6a9ae0']];
      lista.forEach(function (m, i) {
        var pisca = medPisca[m[0]] > 0 && Math.floor(medPisca[m[0]] * 8) % 2;
        barra(g, rx - 30, my + i * 6, 30, 5, m[1], pisca ? C.branco : m[2]);
      });

      // dica de conversa
      if (!conversa && mundo.interagivel) {
        var it = mundo.interagivel, cam = mundo.camera;
        var ix = Math.round(it.x - cam.ix()), iy = Math.round(it.y - cam.iy()) - (it.invisivel ? 14 : 26);
        var bob = Math.round(Math.sin(mundo.tempo * 5));
        caixa(g, ix - 13, iy - 1 + bob, 26, 9, 'rgba(59,91,140,0.95)', C.creme);
      }

      // tempo lento: moldura
      if (mundo.lento.t > 0) { g.fillStyle = 'rgba(160,220,255,0.5)'; g.fillRect(0, 0, W, 2); g.fillRect(0, H - 2, W, 2); }
    },

    // textos por cima de tudo (canvas de texto)
    desenharTexto: function (mundo) {
      var S = BSI.state, W = BSI.view.w, L = mundo.lider();
      var rx = W - 4, oy = BSI.minimapa.ocupaDireita();
      BSI.minimapa.desenharTexto(mundo);
      Tx.escrever(String(S.municao), rx - 4, 5 + oy, { tam: 8, alinhar: 'right', cor: S.municao > 0 ? C.creme : '#ff9a7a' });
      if (S.rapaduras > 0) Tx.escrever('rapadura x' + S.rapaduras, rx, (mundo.dados.noite ? 48 : 37) + oy, { tam: 5.5, alinhar: 'right' });
      var my = (mundo.dados.noite ? 29 : 18) + oy;
      ['Caipora', 'Desconf.', 'Juízo'].forEach(function (t, i) { Tx.escrever(t, rx - 32, my + i * 6 - 0.5, { tam: 5, alinhar: 'right', cor: '#d8cdb0', grossura: 1.5 }); });

      BSI.rodaArmas.desenharTexto(mundo);
      // PÁ! TEI! OXE! (onomatopeias de cordel)
      (mundo.onomatopeias || []).forEach(function (o) {
        var a = Math.min(1, o.t / 0.25), esc = 1 + Math.max(0, (o.t - o.t0 + 0.12) / 0.12) * 0.5;
        Tx.escrever(o.txt, o.x - mundo.camera.ix(), o.y - mundo.camera.iy(), { tam: (o.grande ? 10 : 7.5) * esc, alinhar: 'center', cordel: true, cor: o.cor, alfa: a, grossura: 2.5 });
      });
      // números dos companheiros (tecla pede a habilidade daquele)
      mundo.herois.forEach(function (h, i) {
        if (i > 5) return;
        if (!BSI.desenharTecla(BSI.uctx, 'hab' + (i + 1), 4 + i * 19 + 1, 1, 6))
          Tx.escrever(nomeBotao('hab' + (i + 1)), 4 + i * 19 + 2, 3.5, { tam: 4.5, cor: h.caido ? '#8a7a70' : (h.cdHab <= 0 ? C.amarelo : C.creme), grossura: 1.5 });
      });
      // ordem atual pro grupo
      var temChefe = mundo.chefe && mundo.chefe.ativo && ['derrotado', 'derrotada', 'paz', 'desafio'].indexOf(mundo.chefe.estado) < 0 && !BSI.dialogo.ativo;
      var NO = BSI.grupo.NOME_ORDEM[mundo.ordem || 'seguir'];
      if (!temChefe) {
      var xo = 4 + mundo.herois.length * 19 + 2, wt = BSI.desenharTecla(BSI.uctx, 'ordem', xo, 5.5, 7);
      Tx.escrever((wt ? '' : '[' + nomeBotao('ordem') + '] ') + NO, xo + (wt ? wt + 2 : 0), 7, { tam: 5, cor: mundo.ordem === 'seguir' ? '#c8bca0' : C.amarelo, grossura: 1.5 });
      }

      if (L) {
        var hab = BSI.habilidades.de(L);
        Tx.escrever(L.nome(), 4, 32, { tam: 7, cor: C.amarelo });
        if (hab) {
          if (!BSI.desenharTecla(BSI.uctx, 'habilidade', 39, 24, 8, 'center'))
            Tx.escrever(nomeBotao('habilidade'), 39, 25, { tam: 5.5, alinhar: 'center', cor: L.cdHab <= 0 ? C.contorno : C.creme, contorno: L.cdHab > 0 });
          Tx.escrever(((L.id === 'vander' && mundo.chefe && mundo.chefe.alma && mundo.chefe.livre()) ? 'Reza (segure)' : hab.nome) + (L.cdHab > 0 ? '  ' + Math.ceil(L.cdHab) + 's' : ''), 47, 25, { tam: 5.5, cor: L.cdHab <= 0 ? C.creme : '#a89a88' });
        }
      }

      // arma na mão: nome e munição (pente / total)
      if (L) {
        var EA2 = L.arma, ax2 = 4, ay2 = BSI.view.h - 36;
        Tx.escrever(EA2.nomeCompleto || EA2.nome, ax2 + 33, ay2 + 3, { tam: 4.5, cor: (BSI.config.raridades[EA2.raridade] || {}).cor, grossura: 1.5 });
        var txtM = EA2.tipo === 'corpo' ? 'corpo a corpo' : (L.recarga ? 'recarregando...' : (EA2.pente ? EA2.peca.pente + ' / ' + (EA2.mun ? BSI.armas.mun(EA2.mun) : '∞') : (EA2.mun ? BSI.armas.mun(EA2.mun) + ' ' + BSI.config.municoes[EA2.mun].nome : '∞')));
        var vazio = EA2.pente && EA2.peca.pente <= 0 && !L.recarga;
        Tx.escrever(txtM, ax2 + 33, ay2 + 9, { tam: 5.5, cor: vazio ? '#ff9a7a' : C.creme, grossura: 1.5 });
        if (vazio && Math.floor(mundo.tempo * 3) % 2) { var wR = BSI.desenharTecla(BSI.uctx, 'recarregar', ax2 + 72, ay2 + 7, 7); Tx.escrever((wR ? '' : '[' + nomeBotao('recarregar') + '] ') + 'Recarregar', ax2 + 72 + (wR ? wR + 2 : 0), ay2 + 8, { tam: 5.5, cor: C.amarelo }); }
      }
      // poder de grupo, boss e objetivo
      var wp = BSI.desenharTecla(BSI.uctx, 'poder', 57, 38.5, 7);
      Tx.escrever(wp ? 'PODER' : (nomeBotao('poder') === 'PODER' ? 'PODER' : nomeBotao('poder') + ' PODER'), 57 + (wp ? wp + 2 : 0), 40, { tam: 5.5, cor: (S.poder || 0) >= 100 ? C.amarelo : '#c8b0d8' });
      var ch = mundo.chefe, H = BSI.view.h;
      if (ch && ch.ativo && ['derrotado', 'derrotada', 'paz', 'desafio'].indexOf(ch.estado) < 0 && !BSI.dialogo.ativo) {
        var bxa2 = 4 + mundo.herois.length * 19 + 6;
        Tx.escrever(ch.d.nome.toUpperCase() + (ch.garrafaRoubada ? '  (sem garrafa)' : ''), bxa2 + 6, 4.5, { tam: 6.5, cordel: true, cor: '#ffd0b0' });
        if (S.objetivo && !BSI.roteiro.ativo) { var lO = Tx.quebrar('▸ ' + S.objetivo, W - 10, 5.5); Tx.escrever(lO[0] + (lO.length > 1 ? '…' : ''), 4, H - 9, { tam: 5.5, cor: '#e8dcb0', alfa: 0.85 }); }
      } else if (S.objetivo && !BSI.dialogo.ativo && !BSI.roteiro.ativo) {
        var lObj = Tx.quebrar('▸ ' + S.objetivo, W - 10, 5.5);
        Tx.escrever(lObj[0] + (lObj.length > 1 ? '…' : ''), 4, H - 9, { tam: 5.5, cor: '#e8dcb0', alfa: 0.85 });
      }

      // as promessas do Rafael CDs (texto em cima dos balões)
      if (!BSI.dialogo.ativo) {
        var camP = mundo.camera, nP = 0;
        for (var ip = 0; ip < mundo.projeteis.length && nP < 30; ip++) {
          var pp = mundo.projeteis[ip];
          if (pp.tipo !== 'promessa' || !pp.texto) continue;
          nP++;
          Tx.escrever(pp.texto, Math.round(pp.x - camP.ix()), Math.round(pp.y - camP.iy()) - 13, { tam: 4.5, alinhar: 'center', cor: pp.time === 'herois' ? '#9fe0a0' : '#fff1a8', grossura: 1.5 });
        }
      }
      // a música da caixa de som do Gojoba
      if (mundo.caixa && mundo.caixa.ativa && !BSI.dialogo.ativo) {
        Tx.escrever('♪ Tocando: ' + mundo.caixa.musica() + '  (volume ' + mundo.caixa.volume + '/3)', W / 2, H - 32, { tam: 6, alinhar: 'center', cor: '#ff9ad8' });
      }
      // defesa da tapera
      if (mundo.defesa && !BSI.dialogo.ativo) {
        Tx.escrever('DEFENDA A TAPERA!  Capangas: ' + mundo.defesa.restantes() + '   ' + Math.ceil(Math.max(0, mundo.defesa.t)) + 's', W / 2, H - 20, { tam: 8, alinhar: 'center', cor: C.amarelo, cordel: true });
      }

      // perseguição da Tia Zane
      var pz = mundo.perseguicao;
      if (pz) {
        Tx.escrever('FUJA DA TIA ZANE!  ' + Math.ceil(Math.max(0, pz.t)) + 's', W / 2, H - 30, { tam: 9, alinhar: 'center', cor: C.amarelo, cordel: true });
        Tx.escrever('Chineladas: ' + pz.hits + '/2   (' + nomeBotao('habilidade') + ' some da vista dela)', W / 2, H - 18, { tam: 6.5, alinhar: 'center', cor: '#ffb0a0' });
      }

      // dica de conversa
      if (!BSI.dialogo.ativo && mundo.interagivel) {
        var it = mundo.interagivel, cam = mundo.camera;
        var ix = Math.round(it.x - cam.ix()), iy = Math.round(it.y - cam.iy()) - (it.invisivel ? 14 : 26);
        var bob = Math.round(Math.sin(mundo.tempo * 5));
        if (!BSI.desenharTecla(BSI.uctx, 'interagir', ix, iy + bob - 0.5, 8, 'center'))
          Tx.escrever(nomeBotao('interagir'), ix, iy + bob, { tam: 6, alinhar: 'center', contorno: false });
      }

      // balões de fala
      if (!BSI.dialogo.ativo) {
        mundo.baloes.forEach(function (b) {
          var e = b.ent, cam = mundo.camera;
          var bx = Math.round(e.x - cam.ix()), by = Math.round(e.y - cam.iy()) - 34;
          var linhas = Tx.quebrar(b.texto, 120, 6.5);
          var alfa = Math.min(1, b.t * 3);
          for (var i = 0; i < linhas.length; i++) Tx.escrever(linhas[i], bx, by - (linhas.length - 1 - i) * 8, { tam: 6.5, alinhar: 'center', alfa: alfa });
        });
      }

      // avisos
      var ya = 50;
      avisos.forEach(function (a) {
        Tx.quebrar(a.txt, W - 24, 7).forEach(function (l) {
          Tx.escrever(l, W / 2, ya, { tam: 7, alinhar: 'center', cor: a.cor, alfa: Math.min(1, a.t * 2) });
          ya += 9;
        });
        ya += 1;
      });

      // legendas de som (embaixo, à esquerda, acima dos retratos)
      var yl = BSI.view.h - 48;
      for (var li = legendas.length - 1; li >= 0; li--) {
        Tx.escrever('[' + legendas[li].txt + ']', 6, yl, { tam: 7, cor: '#f4e6b0', alfa: Math.min(1, legendas[li].t * 2), fundo: 'rgba(0,0,0,0.55)' });
        yl -= 10;
      }

      // faixa do excesso
      if (faixa) {
        var p = faixa.t, alfa = Math.min(1, p * 2, (3.2 - p) * 6);
        var H = BSI.view.h, cy = H * 0.36;
        var u = BSI.uctx;
        u.globalAlpha = alfa * 0.8; u.fillStyle = '#1a1018'; u.fillRect(0, cy - 4, W, 40); u.globalAlpha = 1;
        var tamF = 15, largF = Tx.largura(faixa.titulo, 15, true, true);
        if (largF > W - 12) tamF = Math.max(8, 15 * (W - 12) / largF); // encolhe pra caber
        Tx.escrever(faixa.titulo, W / 2, cy + (15 - tamF) / 2, { tam: tamF, alinhar: 'center', cor: C.amarelo, cordel: true, alfa: alfa, grossura: 4 });
        Tx.escrever(faixa.sub, W / 2, cy + 17, { tam: 8, alinhar: 'center', cor: C.creme, alfa: alfa });
        if (faixa.extra) Tx.escrever(faixa.extra, W / 2, cy + 27, { tam: 6.5, alinhar: 'center', cor: '#d8cdb0', alfa: alfa });
      }

      if (BSI.debug && BSI.debug.ativo) Tx.escrever(BSI.loop.fps + ' fps', W / 2, 2, { tam: 6, alinhar: 'center', cor: '#9fd0a0' });
    }
  };
})();
