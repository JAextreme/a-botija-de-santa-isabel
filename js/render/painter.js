/* =========================================================
   painter.js — pixel art desenhada por código.
   Cada personagem é um "boneco" montado por partes:
   cabeça (estilo de cabelo/chapéu), extras (óculos, bigode,
   terço...), camisa (padrão), acessório na mão (celular,
   galão de querosene, caderno...). Assim cada um tem silhueta
   e detalhe próprios sem precisar de arquivos de imagem.

   Grade do boneco: 16 x 19 pixels, pés na linha 17.
   O contorno escuro é aplicado depois (spritecache.js).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor;

  // ---- utilidades de cor ----
  function hexRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function escurecer(h, f) { var c = hexRgb(h); return rgbHex(c[0] * (1 - f), c[1] * (1 - f), c[2] * (1 - f)); }
  function clarear(h, f) { var c = hexRgb(h); return rgbHex(c[0] + (255 - c[0]) * f, c[1] + (255 - c[1]) * f, c[2] + (255 - c[2]) * f); }

  // pinta retângulo de pixels; em "espelho" inverte o eixo x (não usado: espelhamos no cache)
  function P(g) {
    return function (x, y, w, h, cor) { g.fillStyle = cor; g.fillRect(x, y, w, h); };
  }

  // =========================================================
  //  BONECO HUMANO
  //  d = definição visual (ver characters.js), dir = down|up|left
  //  quadro = 0 parado, 1 passo A, 2 passo B
  // =========================================================
  function humano(g, d, dir, quadro) {
    var r = P(g);
    var pele = d.pele || '#c98b5e', peleE = escurecer(pele, 0.18);
    var cab = d.cabelo || '#2b1d14';
    var cam = d.camisa || C.creme, cam2 = d.camisa2 || escurecer(cam, 0.2), camE = escurecer(cam, 0.22);
    var calca = d.calca || '#4a3a2e', calcaE = escurecer(calca, 0.25);
    var sap = d.sapato || '#3a2418';
    var chap = d.chapeu || C.madeira, chapE = escurecer(chap, 0.3);
    var estilo = d.cabeca || 'curto';
    var padrao = d.padrao || 'liso';
    var lado = dir === 'left';
    var costas = dir === 'up';

    // ---------- pernas e sapatos ----------
    var saia = padrao === 'vestido' || padrao === 'jaleco';
    if (!lado) {
      var le = quadro === 1 ? 1 : 0, ld = quadro === 2 ? 1 : 0; // perna levantada
      if (padrao !== 'vestido') {
        r(5, 14, 2, 2 - le, calca); r(9, 14, 2, 2 - ld, calca);
        r(5, 16 - le, 2, 1, sap); r(9, 16 - ld, 2, 1, sap);
      } else {
        r(5, 15, 2, 1 - le, pele); r(9, 15, 2, 1 - ld, pele);
        r(5, 16 - le, 2, 1, sap); r(9, 16 - ld, 2, 1, sap);
      }
    } else {
      if (quadro === 0) {
        r(6, 14, 4, 2, calca); r(6, 14, 1, 2, calcaE);
        r(5, 16, 3, 1, sap); r(8, 16, 2, 1, sap);
      } else if (quadro === 1) {
        r(4, 14, 2, 2, calca); r(9, 14, 2, 2, calcaE);
        r(3, 16, 3, 1, sap); r(9, 16, 2, 1, sap);
      } else {
        r(6, 14, 2, 2, calcaE); r(8, 14, 2, 2, calca);
        r(5, 16, 3, 1, sap); r(8, 16, 2, 1, sap);
      }
    }

    // ---------- tronco ----------
    if (!lado) {
      var x0 = 4, larg = 8;
      if (padrao === 'vestido') { r(3, 9, 10, 6, cam); r(3, 14, 10, 1, camE); r(11, 9, 1, 5, camE); }
      else {
        r(x0, 9, larg, 4, cam);
        r(x0, 13, larg, 1, calca); // cinto/cós
        if (padrao === 'metade') {
          // João Pedro: metade vermelha, metade verde e amarela
          var esq = costas ? cam2 : cam, dirC = costas ? cam : cam2;
          r(4, 9, 4, 4, esq); r(8, 9, 4, 4, dirC);
          r(costas ? 5 : 9, 10, 1, 1, C.amarelo);
        } else if (padrao === 'xadrez') {
          for (var yy = 9; yy < 13; yy++) for (var xx = 4; xx < 12; xx++) if (((xx >> 1) + (yy >> 1)) % 2) r(xx, yy, 1, 1, cam2);
        } else if (padrao === 'listra') {
          r(4, 10, 8, 1, cam2); r(4, 12, 8, 1, cam2);
        } else if (padrao === 'macacao') {
          r(4, 11, 8, 2, calca); r(5, 9, 1, 2, calca); r(10, 9, 1, 2, calca);
        } else if (padrao === 'jaleco') {
          r(4, 9, 8, 6, cam); r(4, 14, 8, 1, camE);
          if (!costas) { r(7, 10, 2, 5, cam2); r(7, 9, 2, 1, pele); }
        }
        r(11, 9, 1, 4, camE); // sombra lateral
      }
      // braços (balançam ao andar)
      var be = quadro === 1 ? 1 : 0, bd = quadro === 2 ? 1 : 0;
      r(3, 9 + be, 1, 2, cam); r(3, 11 + be, 1, 1, pele);
      r(12, 9 + bd, 1, 2, camE); r(12, 11 + bd, 1, 1, pele);
    } else {
      if (padrao === 'vestido') { r(4, 9, 7, 6, cam); r(4, 14, 7, 1, camE); }
      else if (padrao === 'jaleco') { r(5, 9, 6, 6, cam); r(5, 14, 6, 1, camE); }
      else {
        r(5, 9, 6, 4, cam); r(5, 13, 6, 1, calca);
        if (padrao === 'metade') r(9, 9, 2, 4, cam2);
        if (padrao === 'xadrez') { r(6, 10, 1, 1, cam2); r(8, 9, 1, 1, cam2); r(9, 11, 1, 1, cam2); r(6, 12, 1, 1, cam2); }
        if (padrao === 'listra') { r(5, 10, 6, 1, cam2); r(5, 12, 6, 1, cam2); }
        if (padrao === 'macacao') { r(5, 11, 6, 2, calca); r(8, 9, 1, 2, calca); }
      }
      r(10, 9, 1, 4, camE);
      var bx = quadro === 1 ? 6 : (quadro === 2 ? 8 : 7);
      r(bx, 9, 2, 3, camE); r(bx, 12, 2, 1, pele);
    }

    // ---------- cabeça ----------
    if (!lado) {
      r(4, 2, 8, 7, pele); r(5, 1, 6, 1, pele); r(11, 3, 1, 5, peleE);
    } else {
      r(4, 2, 7, 7, pele); r(5, 1, 5, 1, pele); r(3, 6, 1, 1, pele); // nariz
    }

    // rosto (só de frente e de lado)
    if (!costas) {
      var olhos = d.olhos || 'normal';
      if (!lado) {
        if (olhos === 'arregalado') { r(5, 5, 2, 2, C.branco); r(9, 5, 2, 2, C.branco); r(6, 6, 1, 1, C.contorno); r(9, 6, 1, 1, C.contorno); }
        else if (olhos === 'sono') { r(5, 6, 2, 1, C.contorno); r(9, 6, 2, 1, C.contorno); }
        else if (olhos === 'brilho') { r(6, 5, 1, 1, C.alma); r(9, 5, 1, 1, C.alma); }
        else { r(6, 5, 1, 2, C.contorno); r(9, 5, 1, 2, C.contorno); }
        if (d.boca === 'sorriso') { r(6, 7, 4, 1, C.contorno); r(5, 6, 1, 1, peleE); r(10, 6, 1, 1, peleE); }
        else r(7, 7, 2, 1, peleE);
      } else {
        if (olhos === 'arregalado') { r(4, 5, 2, 2, C.branco); r(4, 6, 1, 1, C.contorno); }
        else if (olhos === 'sono') r(4, 6, 2, 1, C.contorno);
        else if (olhos === 'brilho') r(4, 5, 1, 1, C.alma);
        else r(4, 5, 1, 2, C.contorno);
        if (d.boca === 'sorriso') { r(3, 7, 3, 1, C.contorno); }
        else r(4, 7, 2, 1, peleE);
      }
    }

    // cabelo / chapéu
    cabelo(r, estilo, dir, cab, chap, chapE, pele);

    // extras do rosto/peito
    (d.extras || []).forEach(function (ex) { extra(r, ex, dir, d, cab); });

    // acessório na mão
    if (d.acessorio) acessorio(r, d.acessorio, dir);
  }

  function cabelo(r, estilo, dir, cab, chap, chapE, pele) {
    var lado = dir === 'left', costas = dir === 'up';
    var cabE = escurecer(cab, 0.3);
    switch (estilo) {
      case 'careca':
        if (!lado) r(6, 2, 2, 1, clarear(pele, 0.35));
        else r(6, 2, 2, 1, clarear(pele, 0.35));
        if (costas) r(4, 6, 8, 1, escurecer(pele, 0.1));
        break;
      case 'chapeu': case 'palha': case 'chapeuPreto':
        // chapéu de couro do sertão / de palha / preto de jagunço
        if (!lado) {
          r(4, 3, 8, 2, cab); if (costas) r(4, 3, 8, 5, cab);
          r(2, 3, 12, 1, chap); r(4, 0, 8, 3, chap); r(4, 2, 8, 1, chapE);
          r(2, 3, 1, 1, chapE); r(13, 3, 1, 1, chapE);
        } else {
          r(7, 3, 4, 4, cab);
          r(1, 3, 12, 1, chap); r(4, 0, 7, 3, chap); r(4, 2, 7, 1, chapE);
        }
        break;
      case 'bone': case 'boneTras':
        var tras = estilo === 'boneTras';
        if (!lado) {
          r(4, 1, 8, 3, chap);
          if (costas) { r(4, 4, 8, 3, cab); if (tras) r(5, 4, 6, 1, chapE); }
          else { r(4, 4, 1, 2, cab); r(11, 4, 1, 2, cab); if (!tras) r(4, 4, 8, 1, chapE); }
        } else {
          r(4, 1, 7, 3, chap); r(8, 4, 3, 3, cab);
          if (tras) r(10, 3, 3, 1, chapE); else r(1, 3, 4, 1, chapE);
        }
        break;
      case 'cacheado':
        if (!lado) {
          r(3, 0, 10, 4, cab); r(3, 0, 1, 1, 'rgba(0,0,0,0)');
          r(3, 4, 1, 3, cab); r(12, 4, 1, 3, cab);
          r(4, 0, 1, 1, cabE); r(7, 0, 1, 1, cabE); r(10, 0, 1, 1, cabE); r(5, 2, 1, 1, cabE); r(9, 2, 1, 1, cabE);
          if (costas) r(3, 0, 10, 8, cab);
        } else {
          r(3, 0, 9, 4, cab); r(8, 4, 4, 4, cab); r(5, 1, 1, 1, cabE); r(9, 2, 1, 1, cabE);
        }
        break;
      case 'arrepiado':
        // Davi: cabelo espetado, cara de quem tem um plano infalível
        if (!lado) {
          r(4, 1, 8, 2, cab); r(4, 0, 1, 1, cab); r(6, 0, 1, 1, cab); r(9, 0, 1, 1, cab); r(11, 0, 1, 1, cab);
          r(3, 1, 1, 1, cab); r(12, 1, 1, 1, cab);
          r(4, 3, 1, 2, cab); r(11, 3, 1, 2, cab);
          if (costas) r(4, 1, 8, 6, cab);
        } else {
          r(4, 1, 7, 2, cab); r(5, 0, 1, 1, cab); r(7, 0, 1, 1, cab); r(10, 0, 1, 1, cab); r(11, 1, 1, 1, cab);
          r(8, 3, 3, 3, cab);
        }
        break;
      case 'liso':
        // Daniel: franja caída pro lado, cara calma demais
        if (!lado) {
          r(4, 1, 8, 3, cab); r(4, 4, 4, 1, cab); r(11, 4, 1, 3, cab);
          if (costas) r(4, 1, 8, 6, cab);
        } else {
          r(4, 1, 7, 3, cab); r(4, 4, 2, 1, cab); r(8, 4, 3, 3, cab);
        }
        break;
      case 'capuz':
        // Vander: capuz escuro, rosto na sombra
        if (!lado) {
          r(3, 1, 10, 8, chap); r(4, 0, 8, 1, chap);
          if (!costas) { r(5, 4, 6, 5, pele); r(5, 4, 6, 1, chapE); r(5, 5, 6, 1, escurecer(pele, 0.35)); }
          r(3, 8, 10, 1, chapE);
        } else {
          r(4, 0, 8, 9, chap); r(3, 1, 1, 7, chap);
          r(3, 4, 4, 5, pele); r(3, 4, 4, 1, chapE); r(3, 5, 4, 1, escurecer(pele, 0.35));
        }
        break;
      case 'coque':
        // Tia Zane: cabelo grisalho preso
        if (!lado) {
          r(4, 1, 8, 3, cab); r(6, -0, 4, 1, cab); r(4, 4, 1, 2, cab); r(11, 4, 1, 2, cab);
          if (costas) { r(4, 1, 8, 6, cab); r(6, 0, 4, 2, cabE); }
        } else {
          r(4, 1, 7, 3, cab); r(8, 4, 3, 3, cab); r(10, 0, 3, 3, cab); r(11, 1, 1, 1, cabE);
        }
        break;
      default: // 'curto'
        if (!lado) {
          r(4, 1, 8, 3, cab); r(5, 0, 6, 1, cab); r(4, 4, 1, 2, cab); r(11, 4, 1, 2, cab);
          if (costas) r(4, 1, 8, 6, cab);
        } else {
          r(4, 1, 7, 3, cab); r(5, 0, 5, 1, cab); r(8, 4, 3, 3, cab);
        }
    }
  }

  function extra(r, ex, dir, d, cab) {
    var lado = dir === 'left', costas = dir === 'up';
    switch (ex) {
      case 'oculos':
        if (costas) return;
        if (!lado) { r(5, 5, 6, 1, C.contorno); r(5, 5, 1, 1, '#bfe3ff'); r(9, 5, 1, 1, '#bfe3ff'); }
        else { r(3, 5, 3, 1, C.contorno); r(4, 5, 1, 1, '#bfe3ff'); }
        break;
      case 'oculosEscuros':
        if (costas) return;
        if (!lado) { r(5, 5, 6, 2, '#141418'); r(5, 5, 1, 1, '#5a6a7a'); r(9, 5, 1, 1, '#5a6a7a'); }
        else r(3, 5, 3, 2, '#141418');
        break;
      case 'bigode':
        if (costas) return;
        if (!lado) r(6, 7, 4, 1, cab); else r(3, 7, 3, 1, cab);
        break;
      case 'barba':
        if (costas) return;
        if (!lado) { r(4, 7, 8, 2, cab); r(7, 7, 2, 1, escurecer(d.pele || '#c98b5e', 0.3)); }
        else r(3, 7, 5, 2, cab);
        break;
      case 'faixa':
        // faixa da Tribo dos Amadeus
        if (!lado) r(4, 3, 8, 1, d.faixa || C.barro); else { r(4, 3, 7, 1, d.faixa || C.barro); r(11, 3, 1, 3, d.faixa || C.barro); }
        break;
      case 'estetoscopio':
        if (costas || lado) return;
        r(5, 9, 1, 2, '#9aa0a8'); r(10, 9, 1, 2, '#9aa0a8'); r(6, 11, 4, 1, '#9aa0a8'); r(8, 12, 1, 1, '#dfe6ee');
        break;
      case 'terco':
        if (costas) return;
        if (!lado) { r(6, 9, 1, 1, C.creme); r(9, 9, 1, 1, C.creme); r(7, 10, 2, 1, C.creme); r(7, 11, 2, 2, C.amarelo); }
        else r(5, 10, 1, 2, C.creme);
        break;
      case 'colar':
        if (costas) return;
        if (!lado) { r(5, 9, 6, 1, C.amarelo); r(7, 10, 2, 1, C.barro); }
        else r(5, 9, 2, 1, C.amarelo);
        break;
    }
  }

  function acessorio(r, ac, dir) {
    var lado = dir === 'left', costas = dir === 'up';
    switch (ac) {
      case 'celular': // Helano e a web namorada
        if (costas) return;
        if (!lado) { r(12, 11, 2, 3, '#1b1b22'); r(12, 11, 2, 1, '#7ad0ff'); }
        else { r(5, 11, 2, 3, '#1b1b22'); r(5, 11, 1, 2, '#7ad0ff'); }
        break;
      case 'galao': // querosene do Daniel
        if (!lado) { var gx = costas ? 1 : 12; r(gx, 11, 3, 4, C.barro); r(gx, 11, 3, 1, escurecer(C.barro, 0.3)); r(gx + 1, 10, 1, 1, '#d8d0c0'); }
        else { r(6, 12, 3, 4, C.barro); r(7, 11, 1, 1, '#d8d0c0'); }
        break;
      case 'caderno': // Miguel, o artista incompreendido
        if (!lado) { var cx = costas ? 12 : 1; r(cx, 10, 3, 4, C.creme); r(cx, 11, 3, 1, '#9a8f7a'); r(cx, 13, 3, 1, '#9a8f7a'); }
        else { r(5, 10, 2, 4, C.creme); r(5, 12, 2, 1, '#9a8f7a'); }
        break;
      case 'chave': // Hugo e a gambiarra
        if (!lado) { var kx = costas ? 2 : 13; r(kx, 9, 1, 5, '#a8aeb6'); r(kx - 1, 9, 3, 1, '#a8aeb6'); r(kx, 9, 1, 1, '#6b7078'); }
        else { r(5, 10, 1, 4, '#a8aeb6'); r(4, 10, 3, 1, '#a8aeb6'); }
        break;
      case 'escapamento': // João Pedro, 2 da manhã
        if (!lado) { var ex = costas ? 0 : 12; r(ex, 11, 4, 2, '#9aa3ab'); r(costas ? 0 : 15, 11, 1, 2, '#4a4f55'); }
        else { r(1, 11, 5, 2, '#9aa3ab'); r(1, 11, 1, 2, '#4a4f55'); }
        break;
      case 'carteira': // João Vitor "Miserável"
        if (costas) return;
        if (!lado) { r(12, 11, 2, 2, '#5a8a3a'); r(12, 11, 2, 1, '#79a85a'); }
        else r(5, 11, 2, 2, '#5a8a3a');
        break;
      case 'maleta': // Zé Neto, o "doutor"
        if (!lado) { var mx = costas ? 1 : 12; r(mx, 11, 3, 3, '#3a2a20'); r(mx + 1, 10, 1, 1, '#3a2a20'); r(mx + 1, 12, 1, 1, '#f0f0f0'); }
        else { r(6, 12, 3, 3, '#3a2a20'); r(7, 13, 1, 1, '#f0f0f0'); }
        break;
      case 'panela': // João Luiz: tampa de panela de escudo
        if (!lado) { if (!costas) { r(1, 10, 3, 4, '#b8bec6'); r(2, 11, 1, 1, '#e8eef6'); } }
        else { r(3, 10, 2, 4, '#b8bec6'); }
        break;
      case 'giz': // Luiz Fernando: giz dos rituais
        if (costas) return;
        if (!lado) r(12, 11, 1, 2, C.branco); else r(5, 11, 1, 2, C.branco);
        break;
      case 'copo': // João Carlos: sempre com um copo na mão (é da família do Gojoba)
        if (costas) return;
        if (!lado) { r(12, 11, 2, 2, '#e8d080'); r(12, 11, 2, 1, C.branco); }
        else { r(5, 11, 2, 2, '#e8d080'); }
        break;
      case 'peixeira':
        if (costas) return;
        if (!lado) { r(13, 11, 1, 3, '#c8ccd4'); r(13, 10, 1, 1, C.madeiraEsc); }
        else { r(4, 12, 1, 3, '#c8ccd4'); }
        break;
    }
  }

  // =========================================================
  //  BICHOS (de lado, virados pra esquerda; o cache espelha)
  // =========================================================
  // Peba (tatu-peba): 16 x 10
  function peba(g, quadro, cores) {
    var r = P(g);
    cores = cores || {};
    var casco = cores.casco || '#a89070', cascoE = cores.cascoE || '#7a6650', cascoC = cores.cascoC || '#c8b090';
    r(4, 3, 9, 4, casco); r(5, 2, 7, 1, casco); r(5, 2, 7, 1, cascoC);
    r(6, 3, 1, 4, cascoE); r(8, 3, 1, 4, cascoE); r(10, 3, 1, 4, cascoE);
    r(4, 6, 9, 1, cascoE);
    r(1, 5, 3, 2, '#c8a888'); r(3, 4, 1, 1, '#c8a888'); r(1, 5, 1, 1, '#5a4030'); // focinho
    r(2, 5, 1, 1, C.contorno); // olho
    r(13, 5, 2, 1, cascoE); r(15, 6, 1, 1, cascoE); // rabo
    var a = quadro === 1 ? 1 : 0;
    r(5 - a, 7, 1, 1, '#7a6650'); r(11 + a, 7, 1, 1, '#7a6650');
  }

  // Bode: 18 x 16 — o bode que entende tudo
  function bode(g, quadro) {
    var r = P(g);
    var pelo = '#e8e0d0', peloE = '#b8b0a0', mancha = '#5a4a3a';
    r(5, 6, 10, 5, pelo); r(5, 10, 10, 1, peloE); r(9, 6, 3, 2, mancha);
    r(2, 3, 4, 4, pelo); r(1, 5, 2, 2, pelo); r(1, 6, 1, 1, '#8a7a6a'); // cabeça e focinho
    r(3, 4, 1, 1, C.contorno); // olho
    r(4, 1, 1, 2, '#8a7a5a'); r(5, 0, 1, 2, '#8a7a5a'); r(6, 1, 1, 1, '#8a7a5a'); // chifres
    r(6, 3, 2, 1, peloE); // orelha
    r(2, 7, 2, 3, '#c8c0b0'); // barbicha
    r(15, 5, 1, 2, pelo); // rabo
    var a = quadro === 1 ? 1 : 0, b = quadro === 2 ? 1 : 0;
    r(6, 11, 1, 4 - a, peloE); r(8, 11, 1, 4 - b, pelo); r(12, 11, 1, 4 - b, peloE); r(14, 11, 1, 4 - a, pelo);
    r(6, 15 - a, 1, 1, '#3a3028'); r(8, 15 - b, 1, 1, '#3a3028'); r(12, 15 - b, 1, 1, '#3a3028'); r(14, 15 - a, 1, 1, '#3a3028');
  }

  // Cachorro de caça (Trovão e Piaba): 15 x 11
  function cachorro(g, quadro, cor, corE) {
    var r = P(g);
    r(4, 4, 9, 4, cor); r(4, 7, 9, 1, corE);          // corpo
    r(0, 2, 5, 4, cor); r(0, 4, 1, 1, '#2a1a10');      // cabeça e focinho
    r(1, 3, 1, 1, C.contorno);                         // olho
    r(3, 1, 2, 2, corE);                               // orelha
    r(13, 2, 1, 3, cor); r(14, 1, 1, 2, cor);          // rabo pra cima
    var a = quadro === 1 ? 1 : 0, b = quadro === 2 ? 1 : 0;
    r(5 - a, 8, 1, 3 - b, corE); r(7, 8, 1, 3 - a, cor); r(10 + b, 8, 1, 3 - a, corE); r(12, 8, 1, 3 - b, cor);
    r(1, 6, 2, 1, '#c86a7a');                          // língua de fora
  }
  // Mocó: 11 x 7
  function moco(g, quadro) {
    var r = P(g);
    r(3, 2, 6, 4, '#8a7a6a'); r(4, 1, 4, 1, '#9a8a7a'); r(3, 5, 6, 1, '#6a5a4a');
    r(1, 3, 3, 2, '#9a8a7a'); r(1, 3, 1, 1, C.contorno); r(3, 1, 1, 1, '#b09a8a');
    var a = quadro === 1 ? 1 : 0;
    r(4 - a, 6, 1, 1, '#5a4a3a'); r(8 + a, 6, 1, 1, '#5a4a3a');
  }
  // Avoante (pombinha do sertão): 9 x 7, quadro 1/2 = asas batendo
  function avoante(g, quadro) {
    var r = P(g);
    r(2, 3, 5, 3, '#9a8a8a'); r(1, 2, 2, 2, '#8a7a7a'); r(1, 2, 1, 1, C.contorno); r(0, 3, 1, 1, '#3a2a2a');
    r(7, 4, 2, 1, '#6a5a5a');
    if (quadro === 0) r(3, 3, 3, 1, '#7a6a6a');
    else if (quadro === 1) { r(3, 0, 2, 3, '#7a6a6a'); r(5, 1, 1, 2, '#7a6a6a'); }
    else { r(3, 5, 3, 2, '#7a6a6a'); }
    r(4, 6, 1, 1, '#c86a4a');
  }
  // Boi (gado nelore do curral): 23 x 16
  function boi(g, quadro) {
    var r = P(g);
    var c = '#e4dccc', e = '#b8ae9a';
    r(6, 5, 13, 6, c); r(6, 10, 13, 1, e); r(14, 3, 4, 3, c);   // corpo e cupim
    r(1, 4, 6, 5, c); r(1, 8, 2, 1, '#8a7a6a'); r(2, 5, 1, 1, C.contorno); // cabeça
    r(2, 2, 1, 2, '#d8cdb0'); r(5, 2, 1, 2, '#d8cdb0'); r(1, 1, 1, 1, '#d8cdb0'); r(6, 1, 1, 1, '#d8cdb0'); // chifres
    r(5, 9, 3, 3, e);                                            // barbela
    r(19, 5, 1, 5, e); r(20, 9, 1, 2, '#5a4a3a');               // rabo
    var a = quadro === 1 ? 1 : 0, b = quadro === 2 ? 1 : 0;
    r(7, 11, 2, 4 - a, e); r(10, 11, 2, 4 - b, c); r(15, 11, 2, 4 - b, e); r(17, 11, 2, 4 - a, c);
  }

  // =========================================================
  //  OBJETOS
  // =========================================================
  var objetos = {
    municao: { w: 8, h: 8, pintar: function (r) { r(1, 2, 2, 5, C.barro); r(1, 6, 2, 1, C.amarelo); r(4, 1, 2, 5, C.barro); r(4, 5, 2, 1, C.amarelo); r(1, 2, 1, 1, '#d86a50'); r(4, 1, 1, 1, '#d86a50'); } },
    rapadura: { w: 8, h: 8, pintar: function (r) { r(1, 2, 6, 5, '#8a5a2a'); r(1, 2, 6, 1, '#b07a3a'); r(5, 3, 1, 3, '#6a4020'); } },
    pilha: { w: 8, h: 8, pintar: function (r) { r(2, 2, 4, 6, '#2a2a33'); r(2, 2, 4, 2, '#c98a2a'); r(3, 1, 2, 1, '#d8d0c0'); r(2, 5, 1, 2, '#5a5a66'); } },
    cachaca: { w: 8, h: 10, pintar: function (r) { r(2, 3, 4, 7, '#6a9a6a'); r(3, 0, 2, 3, '#6a9a6a'); r(2, 5, 4, 2, C.creme); r(3, 0, 2, 1, C.madeira); } },
    placa: {
      w: 14, h: 16, pintar: function (r) {
        r(6, 8, 2, 8, C.madeiraEsc); r(1, 1, 12, 8, C.madeira); r(1, 1, 12, 1, C.madeiraClara);
        r(3, 3, 8, 1, C.madeiraEsc); r(3, 5, 6, 1, C.madeiraEsc);
      }
    },
    // A Bros do João Pedro (de lado)
    moto: {
      w: 26, h: 16, pintar: function (r) {
        r(1, 10, 6, 6, '#1e1e24'); r(19, 10, 6, 6, '#1e1e24'); r(3, 12, 2, 2, '#9aa3ab'); r(21, 12, 2, 2, '#9aa3ab');
        r(6, 8, 13, 4, C.barro); r(8, 6, 8, 2, '#2a2a33'); r(4, 5, 3, 4, '#9aa3ab'); r(3, 4, 3, 1, '#1e1e24');
        r(10, 11, 10, 2, '#9aa3ab'); r(19, 11, 4, 1, '#c0c8d0'); r(7, 8, 3, 1, '#d86a50');
      }
    },
    rede: {
      w: 34, h: 12, pintar: function (r) {
        r(0, 0, 2, 12, C.madeiraEsc); r(32, 0, 2, 12, C.madeiraEsc);
        r(2, 2, 2, 1, '#d8c8a0'); r(30, 2, 2, 1, '#d8c8a0');
        r(4, 3, 26, 3, C.barro); r(6, 6, 22, 2, C.ocre); r(8, 8, 18, 1, C.azul); r(4, 4, 26, 1, C.amarelo);
      }
    },
    torre: { // torre de prego do Hugo
      w: 12, h: 16, pintar: function (r) {
        r(2, 12, 8, 4, C.madeiraEsc); r(5, 4, 2, 9, C.madeira); r(3, 2, 6, 4, '#7a8088'); r(8, 3, 3, 2, '#a8aeb6'); r(4, 3, 1, 1, '#e0702a');
      }
    },
    fogueiraLenha: {
      w: 16, h: 8, pintar: function (r) {
        r(1, 4, 14, 3, C.madeiraEsc); r(3, 3, 10, 2, C.madeira); r(2, 6, 12, 2, '#5a504a'); r(6, 2, 4, 2, C.madeiraEsc);
      }
    },
    fumo: { w: 9, h: 7, pintar: function (r) { r(1, 2, 7, 4, '#5a3a1a'); r(1, 2, 7, 1, '#7a5a2a'); r(0, 3, 1, 2, '#3a2410'); r(8, 3, 1, 2, '#3a2410'); r(3, 2, 1, 4, '#3a2410'); } },
    espingardas: { // duas soca-tempo e a calibre 20 na parede do alpendre
      w: 18, h: 12, pintar: function (r) {
        r(1, 9, 16, 1, C.madeiraEsc); r(2, 2, 1, 1, '#a8aeb6');
        for (var i = 0; i < 3; i++) { r(3 + i * 5, 1, 1, 7, '#5a5f66'); r(2 + i * 5, 7, 3, 4, C.madeira); }
      }
    },
    cartucheira: { w: 14, h: 6, pintar: function (r) { r(0, 2, 14, 3, C.madeiraEsc); for (var i = 1; i < 13; i += 2) { r(i, 1, 1, 3, C.barro); r(i, 1, 1, 1, C.amarelo); } } },
    toco: { // toco da Caipora (lugar de deixar oferenda)
      w: 14, h: 10, pintar: function (r) {
        r(2, 3, 10, 7, C.madeira); r(2, 3, 10, 2, '#c8a070'); r(4, 3, 6, 1, '#a07a50'); r(0, 8, 3, 2, C.madeiraEsc); r(11, 8, 3, 2, C.madeiraEsc);
        r(6, 4, 2, 1, '#8a6a40'); r(5, 0, 1, 3, C.verde); r(6, 1, 2, 1, C.verde);
      }
    },
    rastro: { w: 14, h: 10, pintar: function (r) { var c = 'rgba(90,60,30,0.55)'; r(1, 6, 3, 2, c); r(5, 2, 3, 2, c); r(9, 6, 3, 2, c); r(12, 1, 2, 2, c); } },
    circuloCinza: { w: 18, h: 10, pintar: function (r) { var c = '#3d3530'; r(4, 0, 10, 1, c); r(1, 2, 2, 6, c); r(15, 2, 2, 6, c); r(4, 9, 10, 1, c); r(2, 1, 2, 1, c); r(14, 1, 2, 1, c); r(2, 8, 2, 1, c); r(14, 8, 2, 1, c); r(8, 4, 2, 2, '#7a3a20'); } },
    papel: { w: 7, h: 6, pintar: function (r) { r(0, 1, 6, 4, C.creme); r(1, 2, 3, 1, '#9a8f7a'); r(1, 3, 4, 1, '#9a8f7a'); r(5, 0, 1, 2, '#d8cdb0'); } },
    ossada: { w: 18, h: 8, pintar: function (r) { var o = '#e8e0c8'; r(1, 3, 5, 3, o); r(2, 4, 1, 1, C.contorno); r(6, 4, 10, 1, o); for (var i = 7; i < 16; i += 2) r(i, 2, 1, 5, o); r(12, 6, 2, 2, C.amarelo); } },
    trave: { // trave do gol do Roma (de lado, vista de cima)
      w: 10, h: 40, pintar: function (r) {
        r(6, 0, 2, 40, '#f0f0e8'); r(0, 0, 8, 2, '#f0f0e8'); r(0, 38, 8, 2, '#f0f0e8');
        for (var y = 3; y < 38; y += 3) r(1, y, 5, 1, 'rgba(220,220,210,0.35)');
      }
    },
    poste: { w: 8, h: 30, pintar: function (r) { r(3, 4, 2, 26, C.madeiraEsc); r(0, 2, 8, 2, '#4a4a52'); r(2, 4, 4, 2, '#fff1a8'); } },
    porteira: { w: 10, h: 30, pintar: function (r) { r(0, 0, 2, 30, C.madeiraEsc); r(8, 0, 2, 30, C.madeiraEsc); for (var y = 3; y < 28; y += 6) r(2, y, 6, 2, C.madeira); } },
    gerador: { w: 18, h: 14, pintar: function (r) { r(0, 3, 18, 11, '#c89a2a'); r(1, 4, 16, 9, '#e0b040'); r(3, 6, 6, 5, '#3a3a40'); r(11, 6, 4, 2, '#c03030'); r(11, 9, 4, 1, '#3a3a40'); r(14, 0, 2, 4, '#5a5f66'); r(0, 13, 18, 1, '#6a4a10'); } },
    vela: { w: 4, h: 9, pintar: function (r) { r(1, 3, 2, 6, C.creme); r(1, 8, 2, 1, '#c8bca2'); r(1, 1, 1, 2, C.fogo2); r(2, 0, 1, 2, C.fogo1); } },
    sacos: { w: 20, h: 10, pintar: function (r) { r(1, 3, 9, 7, '#c8b090'); r(9, 2, 10, 8, '#b8a080'); r(5, 0, 8, 5, '#d0b898'); r(3, 5, 2, 1, '#8a7a5a'); r(13, 5, 3, 1, '#8a7a5a'); } },
    // a CAIXA DE SOM do Gojoba
    caixaSom: {
      w: 24, h: 22, pintar: function (r) {
        r(0, 2, 24, 20, '#1e1e24'); r(1, 3, 22, 18, '#2a2a33');
        r(4, 5, 7, 7, '#111116'); r(5, 6, 5, 5, '#3a3a44'); r(7, 8, 1, 1, '#9aa3ab');
        r(13, 5, 7, 7, '#111116'); r(14, 6, 5, 5, '#3a3a44'); r(16, 8, 1, 1, '#9aa3ab');
        r(4, 14, 16, 5, '#111116'); r(5, 15, 14, 3, '#5a2a6a'); r(6, 16, 4, 1, '#ff60c0'); r(12, 16, 3, 1, '#60e0ff');
        r(9, 0, 6, 2, '#5a5f66'); r(21, 4, 1, 2, '#ff4040');
      }
    },
    cabo: { w: 12, h: 8, pintar: function (r) { r(1, 2, 7, 6, '#5a5f66'); r(2, 3, 5, 4, '#7a8088'); r(3, 4, 1, 1, '#f0c75e'); r(8, 4, 4, 1, '#1e1e24'); r(10, 2, 1, 3, '#1e1e24'); r(0, 5, 1, 1, '#c03030'); } },
    caboCortado: { w: 12, h: 8, pintar: function (r) { r(1, 2, 7, 6, '#5a5f66'); r(2, 3, 5, 4, '#3a3a44'); r(8, 4, 2, 1, '#1e1e24'); r(11, 4, 1, 1, '#1e1e24'); } },
    botija: { w: 12, h: 14, pintar: function (r) { r(3, 0, 6, 2, '#8a5a3a'); r(4, 2, 4, 1, '#6a4020'); r(1, 3, 10, 10, '#a86a40'); r(2, 13, 8, 1, '#6a4020'); r(2, 4, 2, 6, '#c88a5a'); r(5, 6, 3, 2, C.amarelo); } },
    cadeira: { w: 8, h: 10, pintar: function (r) { r(1, 0, 1, 10, C.madeira); r(6, 0, 1, 10, C.madeira); r(1, 5, 6, 2, C.madeiraClara); r(1, 1, 6, 1, C.madeira); } },
    garrafa: { w: 4, h: 8, pintar: function (r) { r(0, 3, 4, 5, '#6a9a6a'); r(1, 0, 2, 3, '#6a9a6a'); r(0, 5, 4, 2, C.creme); } }
  };

  BSI.painter = {
    humano: humano,
    peba: peba,
    bode: bode,
    cachorro: cachorro,
    moco: moco,
    avoante: avoante,
    boi: boi,
    objetos: objetos,
    escurecer: escurecer,
    clarear: clarear,
    P: P
  };
})();
