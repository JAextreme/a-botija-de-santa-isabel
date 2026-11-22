/* =========================================================
   decoracao.js — vida nos mapas sem mexer no desenho deles:
   - objetos novos (bicicleta, banco, mesa de plástico, varal,
     cocho, macambira, pneu, pote de barro, carrinho de mão...)
   - placas engraçadas (texto por mapa, lugar escolhido sozinho
     na beira da trilha)
   - objetos espalhados por tema (sítio / cidade / mato)
   Tudo fixo por posição (hash): toda vez o mapa fica igual.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash, T = BSI.cfg.TILE;
  var O = BSI.painter.objetos;

  // ---------------- objetos novos ----------------
  O.bicicleta = { w: 22, h: 13, pintar: function (r) {
    r(1, 6, 7, 7, '#1e1e24'); r(14, 6, 7, 7, '#1e1e24'); r(3, 8, 3, 3, '#6a6a72'); r(16, 8, 3, 3, '#6a6a72'); r(4, 9, 1, 1, '#1e1e24'); r(17, 9, 1, 1, '#1e1e24');
    r(4, 7, 11, 1, '#c03030'); r(8, 3, 1, 6, '#c03030'); r(8, 7, 7, 1, '#c03030'); r(14, 2, 1, 7, '#c03030');
    r(6, 2, 5, 1, '#2a2a33'); r(13, 1, 4, 1, '#9aa3ab'); r(10, 9, 2, 2, '#9aa3ab');
  } };
  O.banco = { w: 22, h: 9, pintar: function (r) {
    r(1, 2, 20, 3, C.madeira); r(1, 2, 20, 1, C.madeiraClara); r(2, 5, 2, 4, C.madeiraEsc); r(18, 5, 2, 4, C.madeiraEsc); r(1, 4, 20, 1, C.madeiraEsc);
  } };
  O.mesaPlastica = { w: 24, h: 14, pintar: function (r) {
    r(7, 4, 10, 4, '#f2f0ea'); r(7, 4, 10, 1, '#ffffff'); r(8, 8, 1, 5, '#d8d4cc'); r(15, 8, 1, 5, '#d8d4cc');
    r(0, 6, 5, 3, '#c03030'); r(0, 3, 1, 4, '#c03030'); r(1, 9, 1, 4, '#8a2020'); r(4, 9, 1, 4, '#8a2020');
    r(19, 6, 5, 3, '#c03030'); r(23, 3, 1, 4, '#c03030'); r(19, 9, 1, 4, '#8a2020'); r(22, 9, 1, 4, '#8a2020');
    r(9, 2, 2, 3, '#6a9a6a'); r(13, 3, 2, 2, '#e8d080'); // garrafa e copo
  } };
  O.varal = { w: 34, h: 18, pintar: function (r) {
    r(0, 2, 2, 16, C.madeiraEsc); r(32, 2, 2, 16, C.madeiraEsc); r(2, 3, 30, 1, '#d8d0c0');
    r(4, 4, 6, 7, '#3b6a8c'); r(4, 4, 6, 1, '#5a8aac'); r(12, 4, 5, 5, '#e8e0cc'); r(19, 4, 6, 9, '#c45a8a'); r(19, 4, 6, 1, '#e07aaa'); r(27, 4, 4, 4, '#f0c75e');
    r(6, 4, 1, 1, '#8a7a5a'); r(14, 4, 1, 1, '#8a7a5a'); r(21, 4, 1, 1, '#8a7a5a'); r(28, 4, 1, 1, '#8a7a5a');
  } };
  O.cocho = { w: 22, h: 9, pintar: function (r) {
    r(1, 2, 20, 6, C.madeiraEsc); r(2, 3, 18, 3, '#3a6a8a'); r(2, 3, 18, 1, '#5a8aaa'); r(1, 2, 20, 1, C.madeira); r(2, 8, 2, 1, C.madeiraEsc); r(18, 8, 2, 1, C.madeiraEsc);
  } };
  O.macambira = { w: 16, h: 11, pintar: function (r) {
    var e = '#3a5a2a', v = '#5a7a3a', c = '#8aa05a';
    r(7, 0, 2, 10, e); r(3, 3, 2, 7, e); r(11, 3, 2, 7, e); r(0, 6, 4, 2, e); r(12, 6, 4, 2, e); r(5, 1, 1, 9, v); r(10, 1, 1, 9, v);
    r(7, 1, 1, 8, c); r(3, 4, 1, 5, v); r(12, 4, 1, 5, v); r(1, 9, 14, 2, '#2a3a1a'); r(7, 0, 2, 1, '#c03030');
  } };
  O.pneu = { w: 12, h: 9, pintar: function (r) {
    r(1, 2, 10, 6, '#1e1e24'); r(3, 1, 6, 1, '#1e1e24'); r(3, 8, 6, 1, '#1e1e24'); r(4, 4, 4, 2, '#5a4030'); r(2, 3, 1, 1, '#3a3a44'); r(9, 3, 1, 1, '#3a3a44');
  } };
  O.pote = { w: 10, h: 12, pintar: function (r) {
    r(3, 0, 4, 2, '#8a4a2a'); r(1, 2, 8, 8, '#b0603a'); r(2, 10, 6, 2, '#8a4a2a'); r(2, 3, 2, 5, '#d0804a'); r(1, 6, 8, 1, '#8a4a2a');
  } };
  O.carroDeMao = { w: 22, h: 11, pintar: function (r) {
    r(2, 2, 12, 5, '#6a7a82'); r(3, 3, 10, 2, '#4a5a62'); r(14, 4, 7, 1, C.madeira); r(14, 6, 7, 1, C.madeira); r(0, 6, 5, 5, '#1e1e24'); r(1, 7, 3, 3, '#5a5a62'); r(10, 7, 1, 4, '#4a5a62');
    r(4, 1, 3, 2, '#9a7a4a'); r(8, 1, 3, 2, '#9a7a4a'); // tijolo/areia
  } };
  O.lajedo = { w: 28, h: 10, pintar: function (r) {
    r(1, 3, 26, 6, '#6a6058'); r(3, 2, 20, 2, '#7a7068'); r(4, 3, 10, 2, '#8a8078'); r(17, 5, 6, 1, '#5a5048'); r(8, 7, 4, 1, '#5a5048'); r(0, 8, 28, 2, 'rgba(0,0,0,0.25)');
  } };
  O.balde = { w: 8, h: 9, pintar: function (r) { r(1, 2, 6, 7, '#7a8088'); r(1, 2, 6, 1, '#a8aeb6'); r(2, 0, 4, 1, '#5a5f66'); r(1, 1, 1, 1, '#5a5f66'); r(6, 1, 1, 1, '#5a5f66'); } };
  O.cadeiraBalanco = { w: 12, h: 14, pintar: function (r) {
    r(2, 0, 8, 7, '#8a5a2a'); r(3, 1, 6, 5, '#d8c8a0'); r(2, 7, 8, 3, '#8a5a2a'); r(1, 10, 2, 3, C.madeiraEsc); r(9, 10, 2, 3, C.madeiraEsc); r(0, 13, 12, 1, C.madeiraEsc);
  } };
  O.galinhaPlastica = { w: 10, h: 10, pintar: function (r) { r(2, 4, 6, 5, '#f2f0ea'); r(6, 1, 3, 4, '#f2f0ea'); r(8, 2, 2, 1, '#f0c75e'); r(7, 0, 1, 1, '#c03030'); r(3, 9, 1, 1, '#f0c75e'); r(6, 9, 1, 1, '#f0c75e'); } };

  // ---------------- placas por mapa ----------------
  var PLACAS = {
    terreiro: ['CUIDADO COM O BODE. (O bode é manso. Cuidado com o dono do bode.)', 'MOTO À VENDA. Motivo: o vizinho pediu. Pelo amor de Deus.'],
    trilha: ['TRILHA DA SERRA: volte antes do sol nascer. Ou não volte. Ass.: Ninguém.', 'PROIBIDO CAÇAR. Ass.: a Caipora. (A letra é tremida, mas ninguém tem coragem de arrancar.)'],
    serra: ['SANTA ISABEL ← 3 KM  |  QUIXADÁ → ? KM  |  DISCO VOADOR ↑', 'MIRANTE DO ALTO DA SERRA. Sinal de celular: às vezes. Sinal de assombração: sempre.'],
    grota: ['PERIGO: GROTA FUNDA. Já caíram aqui: 3 bodes, 1 moto e o Davi (duas vezes).'],
    terras_paulo: ['PROPRIEDADE PARTICULAR. Pedágio: 1 real, 2 cartuchos ou 1 pênalti.', 'ROMA FUTEBOL CLUBE → Campeão do Torneio do Açudinho 2009. Vice desde então.'],
    campo_roma: ['NÃO PISE NA GRAMA. (Não tem grama. Mas se tivesse, não pise.)'],
    acudinho: ['AÇUDINHO. Proibido nadar. Proibido pescar. Proibido ficar triste.', 'CURRAL DO TIO OTA. Respeite o gado, que o gado respeita você.'],
    santa_isabel: ['BAR DO STELO — 200 METROS. Hoje tem: cerveja, fofoca e teoria da conspiração.', 'CONSERTO MOTO, RÁDIO, TV E CORAÇÃO PARTIDO. Falar com o Hugo. Fiado só pra amigo. Amigo só quem paga.', 'DEVAGAR: ESCOLA. (Não tem escola aqui. Tem uma jumenta chamada Escola.)', 'NÃO JOGUE LIXO. O lixo também tem sentimento. — Associação dos Moradores'],
    caminho_tapera: ['TAPERA DO PÉ DA SERRA. Ninguém mora. Mas a luz acende toda noite.', 'MEL DE ABELHA PURO. (A abelha é pura. O mel, sei não.)'],
    tapera: [],
    praca_festa: ['FESTA DA PADROEIRA: quermesse, leilão de galinha e banda. Proibido levar a galinha antes do leilão.', 'RAFAEL CDs: O FUTURO CHEGOU! (Alguém riscou embaixo: "chegou pra quem?")'],
    bar_stelo: []
  };
  // tema dos objetos espalhados
  var TEMA = {
    sitio: ['cocho', 'pote', 'pneu', 'balde', 'carroDeMao', 'macambira', 'varal'],
    mato: ['macambira', 'lajedo', 'macambira', 'pneu'],
    cidade: ['bicicleta', 'banco', 'mesaPlastica', 'pote', 'balde', 'cadeiraBalanco', 'pneu', 'varal'],
    festa: ['mesaPlastica', 'banco', 'bicicleta', 'galinhaPlastica', 'mesaPlastica']
  };
  var TEMA_MAPA = { terreiro: 'sitio', trilha: 'mato', serra: 'mato', grota: 'mato', terras_paulo: 'sitio', campo_roma: 'sitio', acudinho: 'sitio', santa_isabel: 'cidade', caminho_tapera: 'mato', tapera: 'mato', praca_festa: 'festa' };

  function livre(m, tx, ty) {
    for (var y = ty - 1; y <= ty + 1; y++) for (var x = tx - 1; x <= tx + 1; x++) {
      var c = m.ch(x, y); if (!c) return false;
      var d = BSI.tiles.defs[c]; if (d.solido || c === '~') return false;
    }
    return true;
  }
  function longeDe(lista, tx, ty, dist) {
    for (var i = 0; i < lista.length; i++) if (Math.abs(lista[i].x - tx) < dist && Math.abs(lista[i].y - ty) < dist) return false;
    return true;
  }

  BSI.decoracao = {
    placas: PLACAS, temas: TEMA, temaMapa: TEMA_MAPA,
    // escolhe os lugares (puro: o validador usa também)
    planejar: function (mapa) {
      var dados = mapa.dados, id = mapa.id;
      var ocupado = [];
      (dados.entidades || []).forEach(function (e) { ocupado.push({ x: Math.round(e.x), y: Math.round(e.y) }); });
      (dados.portas || []).forEach(function (p) { for (var yy = p.y; yy < p.y + p.h; yy++) for (var xx = p.x; xx < p.x + p.w; xx++) ocupado.push({ x: xx, y: yy }); });
      if (dados.inicio) ocupado.push({ x: Math.round(dados.inicio.x), y: Math.round(dados.inicio.y) });
      var beira = [], aberto = [];
      for (var y = 1; y < mapa.h - 1; y++) for (var x = 1; x < mapa.w - 1; x++) {
        var c = mapa.ch(x, y);
        if (c !== '.' && c !== ',') continue;
        if (!livre(mapa, x, y)) continue;
        var temTrilha = mapa.ch(x + 1, y) === '^' || mapa.ch(x - 1, y) === '^' || mapa.ch(x, y + 1) === '^' || mapa.ch(x, y - 1) === '^';
        (temTrilha ? beira : aberto).push({ x: x, y: y, h: H(x, y, 777) });
      }
      beira.sort(function (a, b) { return a.h - b.h; }); aberto.sort(function (a, b) { return a.h - b.h; });
      var res = { placas: [], objetos: [] };
      var textos = PLACAS[id] || [];
      var fonte = beira.length ? beira : aberto;
      for (var i = 0; i < fonte.length && res.placas.length < textos.length; i++) {
        var p = fonte[i];
        if (!longeDe(ocupado, p.x, p.y, 3) || !longeDe(res.placas, p.x, p.y, 8)) continue;
        res.placas.push({ x: p.x, y: p.y, texto: textos[res.placas.length] });
        ocupado.push(p);
      }
      var tema = TEMA[TEMA_MAPA[id]];
      if (tema && !dados.semTelhado) {
        var qtd = Math.min(14, Math.max(2, Math.round(aberto.length / 110 * BSI.config.visual.decoracao.densidadeFauna)));
        for (var j = 0; j < aberto.length && res.objetos.length < qtd; j++) {
          var a = aberto[j];
          if (!longeDe(ocupado, a.x, a.y, 3) || !longeDe(res.objetos, a.x, a.y, 5)) continue;
          res.objetos.push({ x: a.x, y: a.y, sprite: tema[Math.floor(H(a.x, a.y, 778) * tema.length)], espelho: H(a.x, a.y, 779) > 0.5 });
          ocupado.push(a);
        }
      }
      return res;
    },
    popular: function (mundo) {
      var plano = BSI.decoracao.planejar(mundo.mapa);
      plano.placas.forEach(function (p) {
        var pl = new BSI.Placa(p.x * T + T / 2, p.y * T + T / 2 + 2, 'placa_texto');
        pl.texto = p.texto;
        mundo.props.push(pl);
      });
      plano.objetos.forEach(function (o) {
        mundo.props.push(new BSI.Decor(o.sprite, o.x * T + T / 2, o.y * T + T / 2 + 2, null, { espelho: o.espelho }));
      });
    }
  };
})();
