#!/usr/bin/env node
/* =========================================================
   tools/validate.js — VALIDADOR da Botija de Santa Isabel
   Rode com:  node tools/validate.js
   Confere:
     1. scripts do index.html (existem, ordem)
     2. mapas (linhas do mesmo tamanho, tiles conhecidos, portas,
        chegadas livres, entidades em lugar válido, tudo alcançável)
     3. diálogos (nós existentes, quem fala, flags e medidores)
     4. personagens (arma, habilidade, grupos) e falas usadas no código
     5. TESTE DE FUMAÇA: roda o jogo sem tela por milhares de passos,
        usando todas as habilidades, todos os "tirar o excesso",
        diálogos, troca de mapa e "todo mundo caiu".
   Sai com código 1 se achar ERRO.
   ========================================================= */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var RAIZ = path.join(__dirname, '..');
var erros = [], avisos = [];
function erro(m) { erros.push(m); }
function aviso(m) { avisos.push(m); }

// ---------------------------------------------------------
// 1. scripts do index.html
// ---------------------------------------------------------
var html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
var scripts = [];
html.replace(/<script\s+src="([^"]+)"\s*><\/script>/g, function (_, s) { scripts.push(s); });
if (!scripts.length) erro('index.html não tem <script src>');
if (scripts[0] !== 'js/core/namespace.js') erro('O primeiro script precisa ser js/core/namespace.js');
if (scripts[scripts.length - 1] !== 'js/main.js') erro('O último script precisa ser js/main.js');
if (/type\s*=\s*"module"/.test(html)) erro('Não use type="module" (quebra em file://)');
scripts.forEach(function (s) {
  var p = path.join(RAIZ, s);
  if (!fs.existsSync(p)) { erro('Script não existe: ' + s); return; }
  var src = fs.readFileSync(p, 'utf8');
  if (/^\s*(import|export)\s/m.test(src)) erro(s + ': usa import/export (proibido, quebra em file://)');
  if (/\bfetch\s*\(/.test(src)) erro(s + ': usa fetch() (proibido em file://)');
});
// arquivos .js que existem mas não estão no index
(function varrer(dir) {
  fs.readdirSync(dir).forEach(function (f) {
    var p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) return varrer(p);
    if (!/\.js$/.test(f)) return;
    var rel = path.relative(RAIZ, p).replace(/\\/g, '/');
    if (scripts.indexOf(rel) < 0) aviso('Arquivo não carregado no index.html: ' + rel);
  });
})(path.join(RAIZ, 'js'));

// ---------------------------------------------------------
// Ambiente falso de navegador (sem tela)
// ---------------------------------------------------------
function noop() { }
function ctxFalso(canvas) {
  var alvo = {
    canvas: canvas,
    getImageData: function (x, y, w, h) { return { data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }; },
    putImageData: noop,
    createRadialGradient: function () { return { addColorStop: noop }; },
    createLinearGradient: function () { return { addColorStop: noop }; },
    measureText: function (t) { return { width: String(t).length * 4 }; }
  };
  return new Proxy(alvo, {
    get: function (t, k) { return k in t ? t[k] : noop; },
    set: function (t, k, v) { t[k] = v; return true; }
  });
}
function elementoFalso(tag) {
  var el = {
    tagName: tag, style: {}, children: [], width: 300, height: 150, textContent: '', innerHTML: '',
    classList: { add: noop, remove: noop, toggle: noop, contains: function () { return false; } },
    addEventListener: noop, removeEventListener: noop, setPointerCapture: noop,
    appendChild: function (c) { this.children.push(c); return c; },
    querySelector: function () { return elementoFalso('div'); },
    querySelectorAll: function () { return []; },
    getBoundingClientRect: function () { return { left: 0, top: 0, width: 800, height: 450 }; },
    getAttribute: function () { return null; }
  };
  el.getContext = function () { if (!el._ctx) el._ctx = ctxFalso(el); return el._ctx; };
  return el;
}
var elementos = {};
var armazenamento = {};
var janela = {
  innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
  location: { search: '' },
  addEventListener: noop, removeEventListener: noop,
  matchMedia: function () { return { matches: false }; },
  requestAnimationFrame: noop,
  setTimeout: function (fn) { fn(); return 0; },
  performance: { now: function () { return Date.now(); } },
  localStorage: {
    getItem: function (k) { return armazenamento[k] === undefined ? null : armazenamento[k]; },
    setItem: function (k, v) { armazenamento[k] = String(v); },
    removeItem: function (k) { delete armazenamento[k]; }
  },
  navigator: { getGamepads: function () { return []; }, maxTouchPoints: 0 },
  document: {
    readyState: 'complete',
    body: elementoFalso('body'),
    getElementById: function (id) { if (!elementos[id]) elementos[id] = elementoFalso('div'); return elementos[id]; },
    createElement: function (t) { return elementoFalso(t); },
    addEventListener: noop,
    activeElement: null
  },
  console: console, Math: Math, JSON: JSON, Date: Date, Proxy: Proxy, Uint8Array: Uint8Array, Uint8ClampedArray: Uint8ClampedArray,
  Object: Object, Array: Array, String: String, Number: Number, Error: Error, parseInt: parseInt, isNaN: isNaN
};
janela.window = janela;
janela.navigator = janela.navigator;
var ctx = vm.createContext(janela);
vm.runInContext('var navigator = window.navigator, document = window.document, localStorage = window.localStorage, setTimeout = window.setTimeout, requestAnimationFrame = window.requestAnimationFrame, performance = window.performance;', ctx);

var carregou = true;
scripts.forEach(function (s) {
  var p = path.join(RAIZ, s);
  if (!fs.existsSync(p)) return;
  try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: s }); }
  catch (e) { carregou = false; erro('Erro ao carregar ' + s + ': ' + (e.stack || e).toString().split('\n').slice(0, 3).join(' | ')); }
});
var BSI = janela.BSI;
if (!BSI || !carregou) { relatorio(); process.exit(1); }

// ---------------------------------------------------------
// 2. mapas
// ---------------------------------------------------------
var T = BSI.cfg.TILE, defs = BSI.tiles.defs;
var TIPOS_ENT = ['inimigo', 'animal', 'item', 'checkpoint', 'npc', 'decor', 'placa', 'gatilho', 'zona', 'chefe', 'fogueira', 'sinal', 'caixa', 'cabo', 'diazepan'];
var ITENS = ['municao', 'rapadura', 'pilha', 'cachaca', 'fumo'];

function specDialogos(spec) {
  if (!spec) return [];
  if (typeof spec === 'string') return [spec];
  return Object.keys(spec).map(function (k) { return spec[k]; });
}

Object.keys(BSI.data.maps).forEach(function (id) {
  var m = BSI.data.maps[id], pre = 'Mapa "' + id + '": ';
  if (!m.linhas || !m.linhas.length) { erro(pre + 'sem linhas'); return; }
  var w = m.linhas[0].length, h = m.linhas.length;
  m.linhas.forEach(function (l, y) {
    if (l.length !== w) erro(pre + 'linha ' + y + ' tem ' + l.length + ' colunas (esperado ' + w + ')');
    for (var x = 0; x < l.length; x++) if (!defs[l[x]]) erro(pre + 'tile desconhecido "' + l[x] + '" em ' + x + ',' + y);
  });
  function ch(x, y) { x = Math.floor(x); y = Math.floor(y); return (y >= 0 && y < h && x >= 0 && x < w) ? m.linhas[y][x] : null; }
  function livre(x, y) { var c = ch(x, y); return c && !defs[c].solido && !defs[c].segredo; }
  // passável considerando que fogo abre e o Vander revela
  function passavel(x, y) { var c = ch(x, y); return c && (!defs[c].solido || defs[c].inflamavel > 0 || defs[c].segredo); }

  if (!m.inicio) erro(pre + 'sem "inicio"');
  else if (!livre(m.inicio.x, m.inicio.y)) erro(pre + 'inicio em tile sólido');

  // alcançabilidade a partir do início
  var vis = {};
  if (m.inicio) {
    var fila = [[Math.floor(m.inicio.x), Math.floor(m.inicio.y)]];
    vis[fila[0][0] + ',' + fila[0][1]] = true;
    while (fila.length) {
      var p = fila.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var nx = p[0] + d[0], ny = p[1] + d[1], k = nx + ',' + ny;
        if (!vis[k] && passavel(nx, ny)) { vis[k] = true; fila.push([nx, ny]); }
      });
    }
  }
  function alcanca(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (vis[x + ',' + y]) return true;
    // vizinho alcançável (para objetos em tile sólido, como pedra com desenho)
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { return vis[(x + d[0]) + ',' + (y + d[1])]; });
  }

  (m.portas || []).forEach(function (po, i) {
    var dest = BSI.data.maps[po.para];
    if (!dest) { erro(pre + 'porta ' + i + ' leva a mapa inexistente "' + po.para + '"'); return; }
    if (!po.chegada) { erro(pre + 'porta ' + i + ' sem "chegada"'); return; }
    var c = dest.linhas[Math.floor(po.chegada.y)] && dest.linhas[Math.floor(po.chegada.y)][Math.floor(po.chegada.x)];
    if (!c || defs[c].solido) erro(pre + 'porta ' + i + ': chegada em "' + po.para + '" cai em tile sólido');
    (dest.portas || []).forEach(function (q) {
      if (po.chegada.x >= q.x && po.chegada.x < q.x + q.w && po.chegada.y >= q.y && po.chegada.y < q.y + q.h) erro(pre + 'porta ' + i + ': chegada cai dentro de outra porta (vai ficar indo e voltando)');
    });
    var ok = false;
    for (var yy = po.y; yy < po.y + po.h; yy++) for (var xx = po.x; xx < po.x + po.w; xx++) if (vis[xx + ',' + yy]) ok = true;
    if (!ok) erro(pre + 'porta ' + i + ' não é alcançável a partir do início');
    if (po.fase && !BSI.data.fases[po.fase]) erro(pre + 'porta ' + i + ': fase "' + po.fase + '" não existe');
    if (po.requer && BSI.data.flagsConhecidas.indexOf(po.requer) < 0) erro(pre + 'porta ' + i + ': flag "' + po.requer + '" desconhecida');
    if (po.bloqueio && !BSI.data.dialogos[po.bloqueio]) erro(pre + 'porta ' + i + ': diálogo de bloqueio "' + po.bloqueio + '" não existe');
  });

  (m.entidades || []).forEach(function (e, i) {
    var q = pre + 'entidade ' + i + ' (' + e.tipo + ')';
    if (TIPOS_ENT.indexOf(e.tipo) < 0) erro(q + ': tipo desconhecido');
    if (e.x < 0 || e.y < 0 || e.x >= w || e.y >= h) { erro(q + ': fora do mapa'); return; }
    if (e.tipo !== 'gatilho' && !e.elevado && !livre(e.x, e.y) && !passavel(e.x, e.y)) erro(q + ': em tile sólido (' + ch(e.x, e.y) + ' em ' + e.x + ',' + e.y + ')');
    if (!e.elevado && !alcanca(e.x, e.y)) aviso(q + ': não alcançável a partir do início (' + e.x + ',' + e.y + ')');
    if (e.tipo === 'inimigo' && !BSI.data.inimigos[e.id]) erro(q + ': inimigo "' + e.id + '" não existe');
    if (e.tipo === 'animal' && !BSI.data.bichos[e.id]) erro(q + ': bicho "' + e.id + '" não existe');
    if (e.tipo === 'npc' && !BSI.data.falantes[e.id] && !BSI.data.personagens[e.id]) erro(q + ': NPC "' + e.id + '" não está em BSI.data.falantes');
    if (e.tipo === 'zona') {
      if (!BSI.data.eventos[e.evento]) erro(q + ': evento "' + e.evento + '" não existe');
      if (!(e.w > 0 && e.h > 0)) erro(q + ': zona sem w/h');
    }
    if (e.tipo === 'chefe') {
      if (!BSI.chefes[e.id]) erro(q + ': chefe "' + e.id + '" não existe');
      if (!BSI.chefes[e.id].semNpc && !BSI.data.dialogos[e.id + '_depois']) erro(q + ': falta o diálogo "' + e.id + '_depois" (chefe vira NPC depois)');
    }
    (e.fases || []).forEach(function (f) { if (!BSI.data.fases[f]) erro(q + ': fase "' + f + '" não existe'); });
    if (e.segredo && !BSI.data.segredos.some(function (s) { return s.id === e.segredo; })) erro(q + ': segredo "' + e.segredo + '" não existe');
    [e.comFlag, e.semFlag].forEach(function (f) { if (f && BSI.data.flagsConhecidas.indexOf(f) < 0) erro(q + ': flag "' + f + '" desconhecida'); });
    if (e.tipo === 'item' && ITENS.indexOf(e.item) < 0) erro(q + ': item "' + e.item + '" desconhecido');
    if (e.tipo === 'decor' && !BSI.painter.objetos[e.sprite]) erro(q + ': sprite "' + e.sprite + '" não existe');
    specDialogos(e.dialogo).forEach(function (d) { if (!BSI.data.dialogos[d]) erro(q + ': diálogo "' + d + '" não existe'); });
    if (e.dialogo && typeof e.dialogo === 'object') Object.keys(e.dialogo).forEach(function (k) {
      if (k !== 'padrao' && !BSI.data.personagens[k]) erro(q + ': chave de diálogo "' + k + '" não é personagem');
    });
    if (e.dialogo && typeof e.dialogo === 'object' && !e.dialogo.padrao) aviso(q + ': diálogo por personagem sem "padrao"');
  });
});

// ---------------------------------------------------------
// 3. diálogos
// ---------------------------------------------------------
var flags = BSI.data.flagsConhecidas, meds = Object.keys(BSI.data.medidores);
var flagsUsadas = {};
Object.keys(BSI.data.dialogos).forEach(function (id) {
  var d = BSI.data.dialogos[id], pre = 'Diálogo "' + id + '": ';
  if (!d.inicio) erro(pre + 'sem nó "inicio"');
  var alcancados = { inicio: true };
  Object.keys(d).forEach(function (no) {
    if (!Array.isArray(d[no])) { erro(pre + 'nó "' + no + '" não é lista'); return; }
    d[no].forEach(function (p, i) {
      var q = pre + no + '[' + i + ']';
      if (Array.isArray(p)) {
        if (p.length < 2 || typeof p[1] !== 'string') erro(q + ': fala precisa ser [quem, texto]');
        var quem = String(p[0]).split(':')[0], exprV = String(p[0]).split(':')[1];
        if (exprV && ['normal', 'rindo', 'bravo', 'assustado', 'desconfiado'].indexOf(exprV) < 0) erro(q + ': expressão desconhecida "' + exprV + '"');
        if (quem !== 'lider' && !BSI.data.personagens[quem] && !BSI.data.falantes[quem]) erro(q + ': falante desconhecido "' + quem + '"');
        if (p[1] && p[1].length > 220) aviso(q + ': fala muito longa (' + p[1].length + ' letras)');
        return;
      }
      function confereFlags(o, onde) {
        if (o.flags) Object.keys(o.flags).forEach(function (f) { flagsUsadas[f] = true; if (flags.indexOf(f) < 0) erro(onde + ': flag "' + f + '" não está em flagsConhecidas'); });
        if (o.medidores) Object.keys(o.medidores).forEach(function (m) { if (meds.indexOf(m) < 0) erro(onde + ': medidor "' + m + '" não existe'); });
        if (o.vai) { alcancados[o.vai] = true; if (!d[o.vai]) erro(onde + ': vai para nó inexistente "' + o.vai + '"'); }
      }
      function confereCond(lista, onde) {
        [].concat(lista).forEach(function (f) { flagsUsadas[f] = true; if (flags.indexOf(f) < 0) erro(onde + ': condição com flag desconhecida "' + f + '"'); });
      }
      confereFlags(p, q);
      if (p.se !== undefined) confereCond(p.se, q);
      if (p.seGrupo !== undefined && !BSI.data.personagens[p.seGrupo]) erro(q + ': seGrupo "' + p.seGrupo + '" não é personagem');
      if (p.seSegredo !== undefined && !BSI.data.segredos.some(function (s) { return s.id === p.seSegredo; })) erro(q + ': segredo "' + p.seSegredo + '" não existe');
      if ((p.seGrupo !== undefined || p.seSegredo !== undefined) && !p.vai) erro(q + ': condição sem "vai"');
      if (p.pista && !BSI.data.pistas[p.pista]) erro(q + ': pista "' + p.pista + '" não existe');
      if (p.acao && !BSI.story.acoes[p.acao]) erro(q + ': ação "' + p.acao + '" não existe');
      if (p.escolha) {
        if (p.escolha.length < 2 || p.escolha.length > 4) aviso(q + ': escolha com ' + p.escolha.length + ' opções (o ideal é 2 a 3)');
        p.escolha.forEach(function (o, j) {
          var oq = q + ' opção ' + j;
          if (!o.txt) erro(oq + ': sem texto');
          confereFlags(o, oq);
          if (o.se !== undefined) confereCond(o.se, oq);
          if (o.seNao !== undefined) confereCond(o.seNao, oq);
          if (o.grupo && !BSI.data.personagens[o.grupo]) erro(oq + ': grupo "' + o.grupo + '" não é personagem');
          if (o.acao && !BSI.story.acoes[o.acao]) erro(oq + ': ação "' + o.acao + '" não existe');
          var ok = ['txt', 'vai', 'flags', 'medidores', 'se', 'seNao', 'grupo', 'acao'];
          Object.keys(o).forEach(function (k) { if (ok.indexOf(k) < 0) erro(oq + ': chave desconhecida "' + k + '"'); });
        });
      }
      if (p.fofoca !== undefined && !(BSI.data.fofocas || {})[p.fofoca]) erro(q + ': fofoca de "' + p.fofoca + '" não existe em reacoes.js');
      var conhecidos = ['escolha', 'flags', 'medidores', 'se', 'vai', 'acao', 'fim', 'pista', 'seGrupo', 'seSegredo', 'fofoca', 'quem'];
      Object.keys(p).forEach(function (k) { if (conhecidos.indexOf(k) < 0) erro(q + ': passo com chave desconhecida "' + k + '"'); });
    });
  });
  Object.keys(d).forEach(function (no) { if (!alcancados[no]) aviso(pre + 'nó "' + no + '" nunca é usado'); });
});

// ---------------------------------------------------------
// 3b. fases, pistas e eventos
// ---------------------------------------------------------
BSI.data.ordemFases.forEach(function (id) {
  var f = BSI.data.fases[id], pre = 'Fase "' + id + '": ';
  if (!f) { erro(pre + 'está em ordemFases mas não existe'); return; }
  var m = BSI.data.maps[f.mapa];
  if (!m) { erro(pre + 'mapa "' + f.mapa + '" não existe'); return; }
  var c = m.linhas[Math.floor(f.chegada.y)] && m.linhas[Math.floor(f.chegada.y)][Math.floor(f.chegada.x)];
  if (!c || BSI.tiles.defs[c].solido) erro(pre + 'chegada em tile sólido');
  if (f.grupo) {
    if (f.grupo.length < 4 || f.grupo.length > 6) aviso(pre + 'grupo com ' + f.grupo.length + ' personagens (o ideal é 4 a 6)');
    f.grupo.forEach(function (p) { if (!BSI.data.personagens[p]) erro(pre + 'personagem "' + p + '" não existe'); });
  }
  if (f.abertura && !BSI.data.dialogos[f.abertura]) erro(pre + 'diálogo de abertura "' + f.abertura + '" não existe');
});
Object.keys(BSI.data.fases).forEach(function (id) { if (BSI.data.ordemFases.indexOf(id) < 0) aviso('Fase "' + id + '" fora de ordemFases'); });
Object.keys(BSI.data.pistas).forEach(function (id) {
  var p = BSI.data.pistas[id];
  if (!p.titulo || !p.texto) erro('Pista "' + id + '": falta título ou texto');
  if (p.segredo && !BSI.data.segredos.some(function (s) { return s.id === p.segredo; })) erro('Pista "' + id + '": segredo desconhecido');
});
// cada segredo precisa de pelo menos uma pista
BSI.data.segredos.forEach(function (s) {
  var n = Object.keys(BSI.data.pistas).filter(function (k) { return BSI.data.pistas[k].segredo === s.id; }).length;
  if (!n) aviso('Segredo "' + s.id + '" ainda sem pistas');
});
// grupos ativos: pelo menos um poder de grupo disponível em cada fase
BSI.data.ordemFases.forEach(function (id) {
  var f = BSI.data.fases[id];
  if (!f.grupo) return;
  var algum = Object.keys(BSI.data.grupos).some(function (g) { return BSI.data.grupos[g].membros.filter(function (p) { return f.grupo.indexOf(p) >= 0; }).length >= 2; });
  if (!algum) aviso('Fase "' + id + '": nenhum grupo com 2 membros (botão L não faz nada)');
});

// ---------------------------------------------------------
// 3c. FINAIS: todos alcançáveis? (combina flags e medidores)
// ---------------------------------------------------------
(function () {
  var lista = BSI.data.finais, achados = {};
  lista.forEach(function (fi) {
    if (!BSI.data.dialogos['final_' + fi.id]) erro('Final "' + fi.id + '": falta o diálogo final_' + fi.id);
    if (!fi.nome || !fi.frase || !fi.condicao) erro('Final "' + fi.id + '": falta nome, frase ou condição');
  });
  // as flags que os finais testam precisam existir e ser ligadas em algum lugar do jogo
  var fontes = scripts.map(function (s) { return fs.readFileSync(path.join(RAIZ, s), 'utf8'); }).join('\n');
  ['botija_recuperada', 'grande_fogueira', 'irmaos_unidos', 'tia_zane_respeitada', 'daniel_descontrolado'].forEach(function (fl) {
    if (BSI.data.flagsConhecidas.indexOf(fl) < 0) erro('Final usa flag desconhecida: ' + fl);
    if (fontes.indexOf("'" + fl + "'") < 0 && fontes.indexOf(fl + ': true') < 0) erro('Final usa a flag "' + fl + '", mas nada no jogo liga ela');
  });
  var FL = ['botija_recuperada', 'grande_fogueira', 'irmaos_unidos', 'tia_zane_respeitada', 'daniel_descontrolado'];
  [0, 95].forEach(function (raiva) { [0, 95].forEach(function (desc) { [100, 10].forEach(function (juizo) { [0, 3].forEach(function (falsas) {
    for (var b = 0; b < (1 << FL.length); b++) {
      var S = { medidores: { raiva: raiva, desconfianca: desc, juizo: juizo }, steloFalsas: falsas, flags: {} };
      FL.forEach(function (fl, i) { if (b & (1 << i)) S.flags[fl] = true; });
      achados[BSI.finais.escolher(S).id] = true;
    }
  }); }); }); });
  lista.forEach(function (fi) { if (!achados[fi.id]) erro('Final "' + fi.id + '" nunca é alcançado por nenhuma combinação de flags e medidores'); });
  // Final Heroico exige a Grande Fogueira (regra do roteiro)
  var semFogueira = { medidores: { raiva: 0, desconfianca: 0, juizo: 100 }, steloFalsas: 0, flags: { botija_recuperada: true } };
  if (BSI.finais.escolher(semFogueira).id === 'heroico') erro('O Final Heroico não pode acontecer sem a Grande Fogueira');
})();

// ---------------------------------------------------------
// 4. personagens e falas
// ---------------------------------------------------------
Object.keys(BSI.data.personagens).forEach(function (id) {
  var p = BSI.data.personagens[id], pre = 'Personagem "' + id + '": ';
  if (!BSI.data.armas[p.arma]) erro(pre + 'arma "' + p.arma + '" não existe');
  if (!BSI.habilidades.lista[p.habilidade]) erro(pre + 'habilidade "' + p.habilidade + '" não existe');
  (p.grupos || []).forEach(function (g) {
    if (!BSI.data.grupos[g]) erro(pre + 'grupo "' + g + '" não existe');
    else if (BSI.data.grupos[g].membros.indexOf(id) < 0) erro(pre + 'diz ser do grupo "' + g + '" mas não está na lista de membros');
  });
  if (!BSI.data.falas['troca_' + id]) aviso(pre + 'sem falas de troca (troca_' + id + ')');
});
BSI.data.grupoInicial.forEach(function (id) { if (!BSI.data.personagens[id]) erro('grupoInicial tem personagem inexistente: ' + id); });
// falas.sorteia('chave') usadas no código
scripts.forEach(function (s) {
  var p = path.join(RAIZ, s);
  if (!fs.existsSync(p)) return;
  var src = fs.readFileSync(p, 'utf8');
  src.replace(/(?:falas\.sorteia|F)\('([a-zA-Z_]+)'\)/g, function (_, k) { if (!BSI.data.falas[k]) erro(s + ': fala "' + k + '" não existe em falas.js'); });
});

// ---------------------------------------------------------
// 4b. ATUALIZAÇÃO PRÉ-1.0: configs, horários, alvos, decoração
// ---------------------------------------------------------
(function () {
  var CV = BSI.config && BSI.config.visual, CB = BSI.config && BSI.config.balance;
  if (!CV || !CB) { erro('js/config/visual.js ou balance.js não carregou'); return; }
  ['minimoNormal', 'minimoReduzida', 'minimoTerror', 'minimoTerrorReduzida'].forEach(function (k) {
    var v = CV.luz[k]; if (!(v >= 0 && v <= 1)) erro('config/visual.js: luz.' + k + ' fora de 0..1');
  });
  if (CV.luz.minimoTerror > CV.luz.minimoNormal) aviso('config/visual.js: terror mais claro que o normal?');
  Object.keys(CV.horarios).forEach(function (h) { var o = CV.horarios[h]; if (!(o.ambiente >= 0 && o.ambiente <= 1) || !o.tinta) erro('horário "' + h + '" sem ambiente/tinta'); });
  BSI.data.ordemFases.forEach(function (f) {
    var h = CV.horarioDaFase[f];
    if (!h) aviso('fase "' + f + '" sem horário em config/visual.js (usa noite)');
    else if (!CV.horarios[h]) erro('fase "' + f + '": horário "' + h + '" não existe');
  });
  Object.keys(BSI.data.maps).forEach(function (id) {
    var d = BSI.data.maps[id];
    if (d.horario && !CV.horarios[d.horario]) erro('mapa ' + id + ': horario "' + d.horario + '" não existe');
    if (d.escuroSe && d.escuroSe.horario && !CV.horarios[d.escuroSe.horario]) erro('mapa ' + id + ': escuroSe.horario inválido');
  });
  if (['sim', 'pedir'].indexOf(CB.grupo.autoHabilidades) < 0) erro('config/balance.js: grupo.autoHabilidades deve ser "sim" ou "pedir"');
  // alvos do objetivo: mapas, diálogos e NPCs existem; todo objetivo de fase tem alvo
  (BSI.data.alvosObjetivo || []).forEach(function (l) {
    var a = l.alvo; if (!a) return;
    if (a.mapa && !BSI.data.maps[a.mapa]) erro('alvos.js: mapa "' + a.mapa + '" não existe');
    if (a.mapa && a.dialogo) {
      var ids = Array.isArray(a.dialogo) ? a.dialogo : [a.dialogo];
      ids.forEach(function (dd) {
        var ok = BSI.data.maps[a.mapa].entidades.some(function (e) { return e.dialogo === dd || (e.dialogo && typeof e.dialogo === 'object' && Object.keys(e.dialogo).some(function (k) { return e.dialogo[k] === dd; })); });
        if (!ok) erro('alvos.js: "' + dd + '" não está no mapa ' + a.mapa);
      });
    }
    if (a.mapa && a.npc && !BSI.data.maps[a.mapa].entidades.some(function (e) { return e.tipo === 'npc' && e.id === a.npc; })) erro('alvos.js: NPC "' + a.npc + '" não está no mapa ' + a.mapa);
  });
  BSI.data.ordemFases.forEach(function (f) {
    var fa = BSI.data.fases[f];
    if (fa.objetivo && !BSI.minimapa.alvoDoTexto(fa.objetivo) && !(BSI.data.alvosObjetivo || []).some(function (l) { return fa.objetivo.indexOf(l.trecho) >= 0; })) aviso('fase ' + f + ': objetivo sem alvo no minimapa');
  });
  // dá pra chegar em todo mapa com porta a partir do mapa inicial de cada fase?
  Object.keys(BSI.data.maps).forEach(function (id) {
    (BSI.data.maps[id].portas || []).forEach(function (p) { if (!BSI.data.maps[p.para]) erro('mapa ' + id + ': porta pra mapa inexistente ' + p.para); });
  });
  if (!BSI.minimapa.rotaPorta('terreiro', 'campo_roma')) erro('minimapa: não achou rota terreiro → campo do Roma');
  // decoração: sprites existem e o planejamento roda em todo mapa
  Object.keys(BSI.decoracao.temas).forEach(function (t) { BSI.decoracao.temas[t].forEach(function (sp) { if (!BSI.painter.objetos[sp]) erro('decoracao.js: sprite "' + sp + '" não existe'); }); });
  ['galinha1', 'galinha2', 'calango', 'urubu1', 'urubu2', 'jumento1', 'jumento2', 'motoLonge'].forEach(function (sp) { if (!BSI.painter.objetos[sp]) erro('vida.js: sprite "' + sp + '" não existe'); });
  var totalPlacas = 0;
  Object.keys(BSI.data.maps).forEach(function (id) {
    try { var p = BSI.decoracao.planejar(new BSI.Mapa(id)); totalPlacas += p.placas.length;
      p.placas.concat(p.objetos).forEach(function (o) { var d = BSI.tiles.defs[new BSI.Mapa(id).ch(o.x, o.y)]; if (!d || d.solido) erro('decoração em tile sólido: ' + id + ' ' + o.x + ',' + o.y); });
    } catch (e) { erro('decoração do mapa ' + id + ': ' + e.message); }
  });
  if (totalPlacas < 10) aviso('poucas placas engraçadas nos mapas (' + totalPlacas + ')');
  if (!BSI.data.dialogos.placa_texto) erro('falta o diálogo placa_texto');
  // controles de PC: toda ação remapeável tem nome e tecla padrão
  BSI.input.REMAPEAVEIS.forEach(function (a) {
    if (!BSI.input.NOMES[a]) erro('input.js: ação "' + a + '" sem nome');
    if (!BSI.input.PADRAO[a]) erro('input.js: ação "' + a + '" sem tecla padrão');
  });
})();

// ---------------------------------------------------------
// 4c. ETAPA 2 (gráficos): boneco, armas, retratos, galeria
// ---------------------------------------------------------
(function () {
  if (!BSI.boneco) { erro('js/render/boneco.js não carregou'); return; }
  var esperado = { parado: 4, andar: 8, correr: 8, atacar: 6, atirar: 4, dano: 2, cair: 3, mania: 6 };
  Object.keys(esperado).forEach(function (a) {
    var n = (BSI.boneco.ANIM[a] || []).length;
    if (n !== esperado[a]) erro('boneco: animação "' + a + '" tem ' + n + ' quadros (esperado ' + esperado[a] + ')');
  });
  Object.keys(BSI.data.armas).forEach(function (id) { if (!BSI.boneco.ARMAS[id]) aviso('boneco: arma "' + id + '" sem desenho na mão'); });
  if (!BSI.retratos || BSI.retratos.EXPRESSOES.length !== 5) erro('retratos: precisa das 5 expressões');
  // imagens CC0 embutidas (Kenney): partículas e teclas
  var dadosImg = BSI.imagensDados || {};
  ['part:fumaca1', 'part:chama1', 'part:boca1', 'part:corte', 'tecla:KeyF', 'tecla:Digit1', 'tecla:Escape', 'tecla:Shift:0'].forEach(function (n) {
    if (!dadosImg[n] || dadosImg[n].indexOf('data:image/png;base64,') !== 0) erro('imagens_kenney.js: falta a imagem "' + n + '"');
  });
  if (!BSI.data.creditos.some(function (c) { return /Kenney/.test(c[0]); })) erro('créditos: falta o crédito da Kenney (CC0)');
  [['kkkkk que doido', 'rindo'], ['Socorro! A alma!', 'assustado'], ['Seu miserável!!', 'bravo'], ['Hum... sei não.', 'desconfiado'], ['Bom dia.', 'normal']].forEach(function (c) {
    if (BSI.retratos.adivinhar(c[0]) !== c[1]) erro('retratos: "' + c[0] + '" deveria ser ' + c[1]);
  });
  // todo boneco gera todos os quadros sem erro
  Object.keys(BSI.data.personagens).forEach(function (id) {
    try { var s = BSI.sprites.humano('heroi:' + id, BSI.data.personagens[id].visual);
      Object.keys(esperado).forEach(function (a) { ['down', 'up', 'left', 'right'].forEach(function (d) { s.quadro(a, d, 0); }); });
    } catch (e) { erro('boneco de ' + id + ': ' + e.message); }
  });
})();

// ---------------------------------------------------------
// 4e. ETAPA 4 (diálogos): falas de combate, estrada, reações, listas, fofocas
// ---------------------------------------------------------
(function () {
  var FL = BSI.data.flagsConhecidas || [], P = BSI.data.personagens, LIS = BSI.data.listas || {};
  function quemExiste(q) { return q === 'lider' || q === 'qualquer' || q === 'narrador' || P[q] || BSI.data.falantes[q]; }
  function confereTexto(t, onde) { String(t).replace(/\{lista:(\w+)\}/g, function (_, n) { if (!LIS[n]) erro(onde + ': lista "' + n + '" não existe'); }); }
  function confereFlag(f, onde) { [].concat(f).forEach(function (x) { if (FL.indexOf(x) < 0) erro(onde + ': flag desconhecida "' + x + '"'); }); }
  var CATS = ['luta', 'acerto', 'dano', 'semMunicao', 'recarga', 'trocaArma', 'curado', 'habilidade', 'abate', 'caido'];
  Object.keys(P).forEach(function (id) {
    var t = (BSI.data.falasCombate || {})[id];
    if (!t) { erro('falas de combate: falta ' + id); return; }
    var total = 0;
    CATS.forEach(function (c) { if (!t[c] || !t[c].length) erro('falas de combate de ' + id + ': falta a situação "' + c + '"'); else { total += t[c].length; t[c].forEach(function (x) { confereTexto(x, 'combate ' + id); if (x.length > 90) aviso('fala de combate longa (' + id + '): ' + x.slice(0, 40)); }); } });
    if (total < 10) erro('falas de combate de ' + id + ': só ' + total + ' (o pedido é 10+)');
  });
  var E = BSI.data.estrada || [], ids = {};
  if (E.length < 40) erro('conversas de estrada: só ' + E.length + ' (o pedido é 40+)');
  E.forEach(function (c) {
    var q = 'estrada "' + c.id + '"';
    if (ids[c.id]) erro(q + ': id repetido'); ids[c.id] = true;
    (c.requer || []).forEach(function (id) { if (!P[id]) erro(q + ': requer personagem inexistente ' + id); });
    if (c.se) confereFlag(c.se, q); if (c.seNao) confereFlag(c.seNao, q);
    (c.fases || []).forEach(function (f) { if (!BSI.data.fases[f]) erro(q + ': fase inexistente ' + f); });
    if (!c.falas || c.falas.length < 2) erro(q + ': conversa com menos de 2 falas');
    (c.falas || []).forEach(function (f) {
      if (!quemExiste(f[0])) erro(q + ': falante desconhecido ' + f[0]);
      if (P[f[0]] && (c.requer || []).indexOf(f[0]) < 0) erro(q + ': ' + f[0] + ' fala mas não está no "requer"');
      confereTexto(f[1], q);
    });
  });
  Object.keys(BSI.data.reacoes || {}).forEach(function (ev) { BSI.data.reacoes[ev].forEach(function (r) { if (!quemExiste(r[0])) erro('reação ' + ev + ': falante ' + r[0]); confereTexto(r[1], 'reação ' + ev); }); });
  Object.keys(BSI.data.fofocas || {}).forEach(function (npc) {
    if (!BSI.data.falantes[npc]) erro('fofoca: NPC desconhecido ' + npc);
    BSI.data.fofocas[npc].forEach(function (f, i) {
      var q = 'fofoca ' + npc + '[' + i + ']';
      if (f.se) confereFlag(f.se, q); if (f.seNao) confereFlag(f.seNao, q);
      if (f.medidor && !BSI.data.medidores[f.medidor[0]]) erro(q + ': medidor ' + f.medidor[0]);
      confereTexto(f.fala, q);
    });
  });
  var minimo = { steloFake: 30, lapucaFrases: 30, zenetoDiagnosticos: 20, felipeOfertas: 15, daviPlanos: 15 };
  Object.keys(minimo).forEach(function (n) { var t = (LIS[n] || []).length; if (t < minimo[n]) erro('lista ' + n + ': ' + t + ' itens (o pedido é ' + minimo[n] + '+)'); });
  // falas de chefe
  Object.keys(BSI.data.falasChefe || {}).forEach(function (id) { if (!BSI.chefes[id]) erro('falas de chefe: chefe "' + id + '" não existe'); Object.keys(BSI.data.falasChefe[id]).forEach(function (k) { BSI.data.falasChefe[id][k].forEach(function (x) { confereTexto(x, 'chefe ' + id); }); }); });
})();

// ---------------------------------------------------------
// 4d. ETAPA 3 (combate): arsenal, munição, afinidades, inimigos
// ---------------------------------------------------------
(function () {
  var A = BSI.config.armas, M0 = BSI.config.municoes, R = BSI.config.raridades;
  var n = Object.keys(A).length;
  if (n < 20) erro('arsenal: só ' + n + ' armas (o pedido é 20 ou mais)');
  Object.keys(A).forEach(function (id) {
    var a = A[id], q = 'arma ' + id + ': ';
    if (['fogo', 'corpo', 'arremesso'].indexOf(a.cat) < 0) erro(q + 'categoria inválida');
    if (!R[a.raridade]) erro(q + 'raridade inválida');
    if (typeof a.dano !== 'number' || typeof a.cd !== 'number' || a.cd <= 0) erro(q + 'dano/cadência faltando');
    if (a.mun && !M0[a.mun]) erro(q + 'munição "' + a.mun + '" não existe');
    if (a.pente && !(a.recarga > 0)) erro(q + 'tem pente mas não tem recarga');
    if (a.cat === 'fogo' && !a.vel && !(a.especial && (a.especial.arco || a.especial.sonica || a.especial.luz))) erro(q + 'arma de fogo sem velocidade');
    if (a.cat !== 'fogo' && !a.alcance) erro(q + 'sem alcance');
    if (typeof a.barulho !== 'number') erro(q + 'sem BARULHO');
    if (!BSI.boneco.ARMAS[id]) erro(q + 'sem desenho');
    if (!a.descricao) aviso(q + 'sem descrição');
  });
  ['comum', 'boa', 'rara', 'lendaria'].forEach(function (r) { if (!Object.keys(A).some(function (id) { return A[id].raridade === r; })) aviso('arsenal: nenhuma arma ' + r); });
  Object.keys(BSI.config.equipInicial).forEach(function (h) {
    if (!BSI.data.personagens[h]) erro('equipInicial: personagem "' + h + '" não existe');
    BSI.config.equipInicial[h].forEach(function (id, i) { if (id && !A[id]) erro('equipInicial ' + h + ': arma "' + id + '" não existe'); if (id && (i === 2) !== (A[id].cat === 'arremesso')) erro('equipInicial ' + h + ': "' + id + '" no espaço errado'); });
  });
  Object.keys(BSI.data.personagens).forEach(function (h) { if (!BSI.config.afinidades[h]) erro('afinidades: falta ' + h); if (!BSI.config.equipInicial[h]) erro('equipInicial: falta ' + h); });
  Object.keys(BSI.config.afinidades).forEach(function (h) { var af = BSI.config.afinidades[h]; af.bom.concat(af.ruim).forEach(function (id) { if (!A[id]) erro('afinidade ' + h + ': arma "' + id + '" não existe'); }); });
  BSI.config.armasNoMapa.forEach(function (x) { if (!BSI.data.maps[x.mapa]) erro('armasNoMapa: mapa ' + x.mapa); if (!A[x.arma]) erro('armasNoMapa: arma ' + x.arma); });
  Object.keys(BSI.config.oficina.nomes).forEach(function (id) { if (id !== '_padrao' && !A[id]) erro('oficina: nome pra arma inexistente ' + id); });
  ['turista', 'cabra', 'lapuca'].forEach(function (k) { if (!BSI.config.balance.dificuldades[k]) erro('dificuldade "' + k + '" faltando'); });
  var novos = ['capangaPeixeira', 'capangaEspingarda', 'capangaEscudo', 'cachorroBravo', 'cascavel', 'abelhas', 'almaMenor', 'bodeEndiabrado'];
  novos.forEach(function (id) { var d = BSI.data.inimigos[id]; if (!d) erro('inimigo novo faltando: ' + id); else if (!(d.vida > 0) || !d.ataque) erro('inimigo ' + id + ': vida/ataque'); });
  BSI.config.inimigosExtras.forEach(function (x) { if (!BSI.data.maps[x.mapa]) erro('inimigosExtras: mapa ' + x.mapa); if (!BSI.data.inimigos[x.id]) erro('inimigosExtras: inimigo ' + x.id); });
})();

// ---------------------------------------------------------
// 5. teste de fumaça (jogo rodando sem tela)
// ---------------------------------------------------------
var J = BSI.jogo, I = BSI.input, DT = BSI.cfg.DT;
function U2(a, b) { return a && b ? Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) : -1; }
var passos = 0;
function rodar(n, antes) {
  for (var i = 0; i < n; i++) {
    if (antes) antes(i);
    J.atualizar(DT);
    if (i % 3 === 0) J.desenhar();
    passos++;
  }
}
function fumaca(nome, fn) {
  try { fn(); }
  catch (e) { erro('TESTE "' + nome + '": ' + (e.stack || e).toString().split('\n').slice(0, 4).join(' | ')); }
}
// segura uma ação por alguns passos
function segurar(acao, n) { I.toqueSegura(acao, true); rodar(n || 2); I.toqueSegura(acao, false); rodar(1); }
function terminarDialogos() {
  for (var k = 0; k < 400 && BSI.dialogo.ativo; k++) {
    if (k % 2) { I.toqueTela(10, 10); rodar(2); }   // toque na tela (pula digitação / avança)
    else segurar('confirmar', 1);                    // botão (também escolhe opção)
  }
}

// passa por cartelas, diálogos e roteiros apertando confirmar
function avancarHistoria(max) {
  for (var k = 0; k < (max || 3000); k++) {
    if (!BSI.roteiro.ativo && !BSI.dialogo.ativo && !J.modal && J.fade.a < 0.01 && J.fade.alvo === 0) return;
    if (BSI.dialogo.ativo) { if (k % 2) { I.toqueTela(10, 10); rodar(2); } else segurar('confirmar', 1); }
    else if (J.modal && J.modal.terminar && !J.modal.fim) { J.modal.terminar(true); rodar(2); } // minigame: ganha
    else if (J.modal) segurar('confirmar', 1);
    else rodar(2);
  }
  throw new Error('a história travou (roteiro/diálogo não terminou)');
}

fumaca('tela de título', function () { rodar(60); });
fumaca('PRÓLOGO completo', function () {
  J.novoJogo(); rodar(40);
  if (!J.mundo) throw new Error('mundo não foi criado');
  avancarHistoria();
  if (BSI.state.fase !== 'prologo') throw new Error('não está no prólogo');
  var M = J.mundo;
  ['pegar_espingardas', 'pegar_cartucheira', 'chamar_cachorros'].forEach(function (d) {
    var alvo = M.props.filter(function (p) { return p.dialogo === d; })[0];
    J.conversar(d, alvo); avancarHistoria();
  });
  if (M.cachorros.length !== 2) throw new Error('cachorros não vieram');
  rodar(10); avancarHistoria();
  if (!BSI.state.flags.prologo_pronto) throw new Error('cutscene do Vander não aconteceu');
});
fumaca('GRUPO QUE SE VIRA SOZINHO (1-6, ordens, especialista, IA)', function () {
  var M = J.mundo;
  if (M.herois.length < 2) throw new Error('o grupo precisa de 2+ pra testar');
  if (!BSI.config || !BSI.config.balance || !BSI.config.visual) throw new Error('configs não carregaram');
  // tecla 2: o companheiro 2 usa a habilidade sem trocar quem está no controle
  var liderAntes = M.liderIdx, alvo = liderAntes === 1 ? 0 : 1, comp = M.herois[alvo];
  comp.cdHab = 0; comp.x = M.lider().x + 10; comp.y = M.lider().y;
  segurar('hab' + (alvo + 1), 1);
  avancarHistoria();
  if (M.liderIdx !== liderAntes) throw new Error('pedir habilidade trocou o personagem controlado');
  // ordens: ME SEGUE → AVANÇAR → SEGURAR → ME SEGUE
  ['avancar', 'segurar', 'seguir'].forEach(function (esp) {
    segurar('ordem', 1);
    if (M.ordem !== esp) throw new Error('ordem esperada ' + esp + ', veio ' + M.ordem);
    rodar(30);
  });
  // segurar posição: companheiros ficam perto do posto mesmo com o líder longe
  segurar('ordem', 1); segurar('ordem', 1);
  var posto = M.pontoOrdem;
  rodar(60, function (k) { if (k === 0) I.toqueStick(1, 0); });
  I.toqueStick(0, 0); rodar(5);
  // especialista: alguém que não é líder vem fazer a tarefa
  segurar('ordem', 1); // volta pro ME SEGUE
  var feito = null, outro = M.herois.filter(function (h) { return h !== M.lider(); })[0];
  BSI.grupo.especialista(M, outro.id, { x: M.lider().x + 30, y: M.lider().y }, function (h) { feito = h; });
  rodar(150);
  if (feito !== outro) throw new Error('o especialista não chegou pra fazer a tarefa');
  if (outro.ia.tarefa) throw new Error('a tarefa ficou pendurada');
  // IA com habilidade sozinha não quebra (roda um tempo com inimigos de mentira)
  rodar(120);
  if (!posto) throw new Error('segurar posição não marcou o posto');
});
fumaca('ARSENAL: toda arma ataca, recarrega e não quebra', function () {
  var M = J.mundo, L = M.lider(), AR = BSI.armas, s = AR.garantir();
  Object.keys(BSI.config.municoes).forEach(function (k) { AR.ganharMun(k, 99); });
  var alvo = new BSI.Inimigo('boneco', L.x + 24, L.y); M.inimigos.push(alvo);
  Object.keys(BSI.config.armas).forEach(function (id) {
    var p = { uid: s.proxUid++, id: id, nivel: 0, pente: BSI.config.armas[id].pente || 0 }; s.inv.push(p);
    var slot = BSI.config.armas[id].cat === 'arremesso' ? 2 : 1;
    if (!AR.equipar(L.id, slot, p.uid)) throw new Error('não equipou ' + id);
    s.slot[L.id] = slot; L.cdAtaque = 0; L.recarga = null; L.travada = 0; L.chinelaFora = false;
    if (BSI.config.armas[id].so) { var neto = M.herois.filter(function (h) { return BSI.config.armas[id].so.indexOf(h.id) >= 0; })[0]; if (!neto) return; }
    L.atacar(M); rodar(40);
    if (L.arma.id !== id) throw new Error('a arma ativa devia ser ' + id);
  });
  // recarga: pressão esvazia o pente e recarrega sozinha
  var pr = s.inv.filter(function (p) { return p.id === 'pressao'; })[0]; AR.equipar(L.id, 1, pr.uid); s.slot[L.id] = 1;
  for (var k = 0; k < 8; k++) { L.cdAtaque = 0; L.atacar(M); rodar(2); }
  if (!L.recarga && pr.pente >= BSI.config.armas.pressao.pente) throw new Error('a pressão não gastou o pente');
  rodar(120); if (pr.pente <= 0) throw new Error('a recarga não encheu o pente');
  // troca pela roda do mouse
  var antes = s.slot[L.id]; AR.trocarSlot(L, 1, M); if (s.slot[L.id] === antes) throw new Error('a troca de arma não trocou');
  alvo.morto = true; rodar(5);
});
fumaca('TELAS das armas (equipamento, arma nova, oficina, bodega, roda)', function () {
  var M = J.mundo, AR = BSI.armas, s = AR.garantir();
  segurar('equipamento', 1); rodar(10); if (!(J.modal instanceof BSI.Equip)) throw new Error('[I] não abriu o equipamento');
  segurar('equipamento', 1); rodar(3); if (J.modal) throw new Error('[I] não fechou');
  AR.pegarArma('foice', M); rodar(30); if (!(J.modal instanceof BSI.ArmaNova)) throw new Error('arma nova não mostrou o cartão');
  J.modal.escolher({ heroi: M.lider().id }); rodar(2);
  s.sucata = 10; J.abrirModal(new BSI.Oficina()); rodar(15); var p0 = J.modal.lista()[0], niv = p0.nivel; J.modal.sel = 0; J.modal.melhorar();
  if (p0.nivel !== niv + 1) throw new Error('a oficina não melhorou a arma'); J.fecharModal();
  BSI.state.municao = 10; var cart = BSI.state.municao; J.abrirModal(new BSI.Bodega(M)); rodar(15); J.modal.sel = 0; J.modal.comprar(); J.fecharModal();
  if (BSI.state.municao <= cart) throw new Error('a bodega não vendeu cartucho');
  I.toqueSegura('rodaArmas', true); rodar(5); if (!BSI.rodaArmas.ativa) throw new Error('a roda de armas não abriu'); I.toqueSegura('rodaArmas', false); rodar(3);
});
fumaca('ESQUIVA, IMPACTO, ESCUDO, COMBOS e DIFICULDADE', function () {
  var M = J.mundo, L = M.lider();
  L.cdEsquiva = 0; L.inv = 0; segurar('esquiva', 1);
  if (!(L.inv > 0)) throw new Error('a esquiva não deu invencibilidade');
  rodar(60);
  // capanga de escudo: de frente não toma, por trás toma
  var esc = new BSI.Inimigo('capangaEscudo', L.x + 20, L.y); M.inimigos.push(esc); rodar(1);
  esc.face = { x: -1, y: 0 }; esc.estado = 'persegue'; var v0 = esc.vida;
  esc.levarDano(1, M, { x: L.x, y: L.y, time: 'herois' }, 'corpo');
  if (esc.vida !== v0) throw new Error('o escudo não segurou o golpe de frente');
  esc.levarDano(1, M, { x: esc.x + 20, y: esc.y, time: 'herois' }, 'corpo');
  if (esc.vida >= v0) throw new Error('por trás o capanga de escudo devia tomar dano');
  esc.morto = true;
  // combo: isca + explosão = churrasco explosivo
  var isca = new BSI.Isca(L.x + 40, L.y); M.props.push(isca);
  var c0 = BSI.state.stats.combos || 0; BSI.combos.explodiuPerto(M, isca.x, isca.y, L);
  if ((BSI.state.stats.combos || 0) <= c0) throw new Error('o combo churrasco explosivo não saiu');
  // dificuldade turista: dano menor
  BSI.state.dificuldade = 'turista'; var h = M.herois[1] || L; h.inv = 0; h.vida = 6;
  var soma = 0; for (var k = 0; k < 40; k++) { h.inv = 0; h.vida = 6; h.caido = false; h.levarDano(2, M, { x: h.x + 5, y: h.y, time: 'inimigos' }, 'corpo'); soma += 6 - h.vida; }
  BSI.state.dificuldade = 'cabra';
  if (soma > 60) throw new Error('turista devia tirar menos vida (' + soma + ')');
  rodar(30);
});
fumaca('8 INIMIGOS NOVOS lutando (60 s)', function () {
  var M = J.mundo, L = M.lider();
  M.herois.forEach(function (h) { h.vida = 6; });
  ['capangaPeixeira', 'capangaEspingarda', 'capangaEscudo', 'cachorroBravo', 'cascavel', 'abelhas', 'almaMenor', 'bodeEndiabrado'].forEach(function (id, i) {
    var p = M.mapa.pontoLivre(L.x + 30 + i * 6, L.y + (i % 3) * 12 - 12, 4, 3); M.inimigos.push(new BSI.Inimigo(id, p.x, p.y));
  });
  var ataqueMax = 0;
  rodar(3600, function (k) {
    var n = M.inimigos.filter(function (e) { return !e.morto && e.estado === 'prepara' && !e.chefe; }).length; if (n > ataqueMax) ataqueMax = n;
    if (k % 30 === 0) { I.toqueSegura('ataque', true); } if (k % 30 === 3) I.toqueSegura('ataque', false);
    M.herois.forEach(function (h) { if (h.vida < 3) h.vida = 6; });
  });
  if (ataqueMax > BSI.config.balance.dificuldades.cabra.maxAtacando + 1) throw new Error('atacaram ' + ataqueMax + ' ao mesmo tempo (a fila não segurou)');
  M.inimigos.forEach(function (e) { if (!e.chefe) e.morto = true; }); rodar(5);
  // limpa o que os testes de combate bagunçaram (fogo, munição) pra história seguir igual
  BSI.state.stats.queimados = 0; BSI.state.flags.daniel_descontrolado = false; BSI.state.municao = 12;
  BSI.state.medidores.juizo = 100; BSI.state.medidores.raiva = 0; BSI.state.medidores.desconfianca = 0;
  M.fogo.apagarTudo ? M.fogo.apagarTudo() : null;
});
fumaca('CONVERSAS DE ESTRADA, falas de combate e fofoca', function () {
  var M = J.mundo, L = M.lider();
  M.inimigos.forEach(function (e) { if (!e.chefe) e.morto = true; }); rodar(2);
  var antes = (BSI.state.estradaUsadas || []).length;
  BSI.estrada.t = 0; L.movendo = true;
  for (var k = 0; k < 600 && (BSI.state.estradaUsadas || []).length === antes; k++) { I.toqueStick(Math.cos(k / 40), Math.sin(k / 40)); rodar(1); BSI.estrada.t = Math.min(BSI.estrada.t, 0); }
  I.toqueStick(0, 0);
  if ((BSI.state.estradaUsadas || []).length === antes) throw new Error('nenhuma conversa de estrada começou');
  rodar(400);
  if (!BSI.falasVivas.dizer(M, L, 'luta', { forcar: true })) throw new Error('fala de combate não saiu');
  var f = BSI.dialogo.fofoca('stelo'); f = f && BSI.falasVivas.preencher(f); if (!f || f.indexOf('{lista') >= 0) throw new Error('fofoca do Stelo não saiu: ' + f);
  var t = BSI.falasVivas.preencher('{lista:steloFake}'); if (!t || t.indexOf('{') >= 0) throw new Error('lista não sorteou');
});
fumaca('GALERIA do debug (todas as páginas)', function () {
  BSI.galeria.abrir(); rodar(2);
  for (var p = 0; p < 6; p++) { segurar('dir', 1); rodar(2); }
  segurar('pausa', 1); rodar(2);
  if (J.modal) throw new Error('a galeria não fechou');
});
fumaca('MINIMAPA, MAPA COMPLETO e OPÇÕES', function () {
  var M = J.mundo;
  rodar(30);
  if (!BSI.state.nevoa || !BSI.state.nevoa[M.mapa.id]) throw new Error('a névoa do minimapa não foi salva no estado');
  if (!BSI.minimapa.alvo) throw new Error('o objetivo do prólogo não tem estrela no minimapa');
  segurar('mapa', 1); rodar(15);
  if (!(J.modal instanceof BSI.MapaCompleto)) throw new Error('[M] não abriu o mapa completo');
  I.mouse.roda = 1; rodar(1); segurar('mapa', 1); rodar(2);
  if (J.modal) throw new Error('[M] não fechou o mapa completo');
  BSI.opcoes.abrir(J.pausa); rodar(2);
  for (var k = 0; k < BSI.opcoes.itens.length - 2; k++) { segurar('dir', 1); segurar('esq', 1); segurar('baixo', 1); }
  segurar('pausa', 1); rodar(2);
  if (J.modal) { segurar('pausa', 1); rodar(2); }
  BSI.jogo.abrirModal(new BSI.opcoes.Controles(null)); rodar(2); segurar('pausa', 1); rodar(2);
  // horário do prólogo = noite; nunca mais escuro que o luar mínimo
  if (M.ambienteAtual < BSI.config.visual.luz.minimoNormal - 0.01) throw new Error('o prólogo está mais escuro que o luar mínimo');
});
fumaca('ATO 1: serra, eventos e grota', function () {
  BSI.fases.iniciar('ato1_cacada'); rodar(30); avancarHistoria();
  if (J.mundo.mapa.id !== 'trilha') throw new Error('ato 1 não começou na trilha');
  J.trocarMapa('serra', { x: 24.5, y: 41 }); rodar(40);
  ['latido_pro_nada', 'pe_torcido', 'vander_aparece', 'sinal_celular'].forEach(function (ev) {
    BSI.fases.dispararEvento(ev, J.mundo); avancarHistoria(); rodar(30);
  });
  if (!BSI.state.flags.ato1_pode_descer) throw new Error('alto da serra não liberou a descida');
  BSI.story.medidor('raiva', 95);
  rodar(1500, function (k) { if (k % 200 === 0) I.toqueStick(Math.cos(k), Math.sin(k)); });
  I.toqueStick(0, 0);
});
fumaca('ATO 1: pedágio e boss Paulo do Zé Baixinho', function () {
  BSI.story.medidor('raiva', -100);
  BSI.fases.iniciar('ato1_paulo'); rodar(30); avancarHistoria();
  BSI.fases.dispararEvento('porteira_pedagio', J.mundo); avancarHistoria();
  if (J.mundo.mapa.ch(27, 10) === 'C') throw new Error('porteira não abriu');
  J.trocarMapa('campo_roma', { x: 2, y: 10.5 }); rodar(40);
  var M = J.mundo;
  if (!M.chefe) throw new Error('Paulo não apareceu');
  BSI.fases.dispararEvento('paulo_intro', M); avancarHistoria();
  if (!M.chefe.ativo) throw new Error('Paulo não ativou');
  rodar(600); // luta de verdade um pouco (com o grupo apanhando)
  if (J.mundo !== M) { M = J.mundo; } // grupo pode ter caído e voltado
  // derruba as 3 fases (cada uma vira um desafio/minigame)
  for (var f = 0; f < 6 && !BSI.state.flags.ato1_completo; f++) {
    var ch = J.mundo.chefe;
    if (ch && ch.livre()) ch.levarDano(999, J.mundo, null, 'teste');
    avancarHistoria(); rodar(20);
  }
  if (!BSI.state.flags.paulo_derrotado && !BSI.state.flags.paulo_aliado) throw new Error('Paulo não foi derrotado');
  avancarHistoria(); rodar(60); avancarHistoria();
  if (BSI.state.fase !== 'interludio') throw new Error('não foi para o fim do ato (fase ' + BSI.state.fase + ')');
});
fumaca('minigames do Paulo jogados de verdade', function () {
  ['braco', 'penaltis', 'cachaca'].forEach(function (tipo) {
    var fim = null;
    BSI.minigames.desafioPaulo(tipo, 1, function (ok) { fim = ok; });
    rodar(1200, function (k) { if (k % 4 === 0) I.toqueSegura('ataque', true); if (k % 4 === 2) I.toqueSegura('ataque', false); if (k % 30 === 0) I.toqueStick(Math.sin(k), Math.cos(k)); });
    I.toqueStick(0, 0); I.toqueSegura('ataque', false);
    if (fim === null) throw new Error('minigame "' + tipo + '" não terminou');
  });
});
fumaca('INTERLÚDIO: pipoca, alma da casa do Dudu', function () {
  BSI.fases.iniciar('interludio'); rodar(30); avancarHistoria();
  var M = J.mundo;
  if (M.mapa.id !== 'acudinho') throw new Error('interlúdio não começou no açudinho');
  if (!M.chefe || M.chefe.ativo) throw new Error('alma deveria existir escondida');
  var fog = M.props.filter(function (p) { return p.dialogo === 'fogueira_pipoca'; })[0];
  if (!fog) throw new Error('fogueira da pipoca não existe');
  J.conversar('fogueira_pipoca', fog); avancarHistoria();
  var alma = M.chefe;
  if (!alma.livre()) throw new Error('alma não ativou depois da pipoca');
  // sinais do Tio Ota
  M.props.filter(function (p) { return p.sinal; }).forEach(function (s) { J.conversar('sinal_protecao', s); avancarHistoria(); });
  if (M.props.filter(function (p) { return p.sinal && p.ativo; }).length !== 4) throw new Error('sinais não acenderam');
  // reza do Vander segurando K perto da alma
  var iv = M.herois.findIndex(function (h) { return h.id === 'vander'; });
  M.liderIdx = iv; M.reiniciarTrilha();
  var v = M.herois[iv]; alma.x = v.x + 20; alma.y = v.y;
  var antes = alma.vida;
  I.toqueSegura('habilidade', true); rodar(120); I.toqueSegura('habilidade', false); rodar(2);
  if (!(alma.vida < antes)) throw new Error('a reza não fez efeito');
  // isca do Miguel e fogo do Daniel
  ['miguel', 'daniel', 'davi'].forEach(function (id) {
    var h = M.heroi(id); h.cdHab = 0; M.liderIdx = M.herois.indexOf(h); BSI.habilidades.usar(h, M); rodar(90); avancarHistoria();
  });
  rodar(600); // a alma ataca, grita, apaga fogueira...
  if (J.mundo !== M) M = J.mundo, alma = M.chefe; // pode ter caído todo mundo e voltado
  if (!alma || !alma.livre()) throw new Error('alma sumiu antes da hora');
  // fraca: só o aboio
  alma.acuar(M);
  if (alma.estado !== 'acuada') throw new Error('alma não ficou acuada');
  alma.levarDano(50, M, M.lider(), 'chumbo');
  if (alma.estado !== 'acuada') throw new Error('tiro não deveria terminar a alma');
  BSI.poderes.usar('aboio', M); rodar(240); avancarHistoria(); rodar(60); avancarHistoria();
  if (!BSI.state.flags.alma_derrotada) throw new Error('o aboio não derrotou a alma (estado ' + alma.estado + ', vida ' + alma.vida + ', mesmoMundo ' + (J.mundo === M) + ', livre ' + alma.livre() + ')');
  if (['amanhecer', 'ato2_bar'].indexOf(BSI.state.fase) < 0) throw new Error('não amanheceu (fase ' + BSI.state.fase + ')');
});
fumaca('AMANHECER: Dudu, Tia Zane e a perseguição', function () {
  // a abertura já rodou junto; escolher "fugir" e deixar a Tia Zane pegar
  avancarHistoria(6000);
  if (BSI.state.fase !== 'ato2_bar') throw new Error('não chegou no fim do interlúdio (fase ' + BSI.state.fase + ') roteiro=' + BSI.roteiro.ativo + ' livre=' + BSI.roteiro.livre + ' fila=' + JSON.stringify(BSI.roteiro.fila.map(function (p) { return p[0] + (typeof p[1] === 'string' ? ':' + p[1] : ''); })) + ' dialogo=' + BSI.dialogo.ativo + ' modal=' + !!J.modal + ' pers=' + !!(J.mundo && J.mundo.perseguicao) + ' fade=' + J.fade.a + '/' + J.fade.alvo + ' flags=' + Object.keys(BSI.state.flags).filter(function (k) { return /zane|fugir|confess/.test(k); }));
  if (!BSI.state.flags.pego_pela_zane && !BSI.state.flags.miguel_fugiu_zane) throw new Error('a perseguição não aconteceu');
  if ((BSI.state.pistas || []).indexOf('alma_coronel') < 0) throw new Error('pista do coronel não foi anotada');
  if (J.mundo.herois.length < 4) throw new Error('o grupo não voltou depois da perseguição');
});
fumaca('alma: voltar do checkpoint no meio da luta', function () {
  BSI.state.flags.alma_derrotada = false; BSI.state.flags.alma_luta = true; BSI.state.fase = 'interludio';
  J.recriarMundo('acudinho', { x: 16, y: 20 });
  if (!J.mundo.chefe) throw new Error('alma não reapareceu');
  rodar(200);
  if (!J.mundo.chefe.livre()) throw new Error('alma deveria voltar ativa');
  if (!J.mundo.terror() || J.mundo.ambienteAtual > 0.2) throw new Error('a noite deveria continuar escura (terror) na luta');
  BSI.state.flags.alma_derrotada = true; BSI.state.fase = 'ato2_bar';
});
fumaca('minigame da pipoca jogado de verdade', function () {
  var fim = null;
  BSI.minigames.pipoca(function (ok) { fim = ok; });
  rodar(1300, function (k) { if (k % 6 === 0) I.toqueSegura('ataque', true); if (k % 6 === 3) I.toqueSegura('ataque', false); });
  I.toqueSegura('ataque', false);
  if (fim === null) throw new Error('pipoca não terminou');
});
fumaca('ATO II: Stelo, Gojoba e a caixa de som', function () {
  BSI.fases.iniciar('ato2_bar'); rodar(30); avancarHistoria();
  if (J.mundo.mapa.id !== 'santa_isabel') throw new Error('ato II não começou na cidade');
  J.trocarMapa('bar_stelo', BSI.data.maps.santa_isabel.portas[0].chegada); rodar(60); avancarHistoria();
  var M = J.mundo;
  if (!M.caixa || !M.chefe) throw new Error('caixa ou Gojoba não existem no bar');
  var stelo = M.acharNpc('stelo');
  J.conversar('stelo', stelo); avancarHistoria();
  if (!M.chefe.livre() || !M.caixa.ativa) throw new Error('a luta do Gojoba não começou');
  rodar(300); // ondas de notas tirando juízo
  if (!M.projeteis.some(function (p) { return p.tipo === 'nota'; }) && BSI.state.medidores.juizo >= 100) throw new Error('a caixa não está tocando');
  // Hugo corta um cabo; Miguel rouba o pen drive; Davi tira o excesso
  var hugo = M.heroi('hugo'); M.liderIdx = M.herois.indexOf(hugo); M.reiniciarTrilha();
  var cabo = M.props.filter(function (p) { return p.cabo; })[0];
  J.conversar('cabo_som', cabo); avancarHistoria();
  if (M.caixa.volume > 2) throw new Error('o cabo não baixou o volume (' + M.caixa.volume + ')'); // (a IA do Hugo pode cortar outro sozinha)
  var mig = M.heroi('miguel'); mig.cdHab = 0; M.liderIdx = M.herois.indexOf(mig); BSI.habilidades.usar(mig, M);
  mig.x = M.caixa.x; mig.y = M.caixa.y + 6; rodar(5);
  if (M.caixa.volume !== 1) throw new Error('o pen drive não baixou o volume');
  BSI.excesso.forcado = 'volume'; var dv = M.heroi('davi'); dv.cdHab = 0; BSI.habilidades.usar(dv, M); BSI.excesso.forcado = null;
  rodar(10); avancarHistoria(); rodar(30); avancarHistoria();
  if (!BSI.state.flags.gojoba_vencido) throw new Error('a caixa desligou mas o Gojoba não foi vencido');
  var ban = J.mundo.props.filter(function (p) { return p.dialogo && p.dialogo.miguel === 'banheiro_miguel'; })[0];
  M.liderIdx = M.herois.indexOf(M.heroi('miguel'));
  J.conversar(ban.dialogo, ban); avancarHistoria();
  if (!BSI.state.flags.mapa_tapera) throw new Error('o Miguel não achou o mapa no banheiro');
});
fumaca('ATO II: Gojoba queimado pelo Daniel (rota alternativa)', function () {
  BSI.state.flags.gojoba_luta = true; BSI.state.flags.gojoba_vencido = false; BSI.state.grupo = ['daniel', 'hugo', 'miguel']; BSI.state.lider = 0;
  J.recriarMundo('bar_stelo', { x: 11.5, y: 12.5 }); rodar(10);
  var M = J.mundo;
  if (!M.caixa.ativa) throw new Error('a luta não voltou do checkpoint');
  var d = M.heroi('daniel'); d.x = M.caixa.x; d.y = M.caixa.y + 36; d.face = { x: 0, y: -1 }; d.cdHab = 0;
  BSI.habilidades.usar(d, M); rodar(90); avancarHistoria(); rodar(20); avancarHistoria();
  if (!BSI.state.flags.queimou_caixa) throw new Error('o fogo não queimou a caixa');
  BSI.state.flags.gojoba_vencido = true;
});
fumaca('ATO II: a tapera, o Gadernal, os irmãos e a botija', function () {
  BSI.fases.iniciar('ato2_tapera'); rodar(30); avancarHistoria();
  J.trocarMapa('tapera', BSI.data.maps.caminho_tapera.portas[1].chegada); rodar(60);
  var M = J.mundo;
  if (!M.chefe) throw new Error('o Gadernal não está na tapera');
  BSI.fases.dispararEvento('gadernal_chega', M); avancarHistoria();
  if (!M.chefe.livre()) throw new Error('o Gadernal não começou a briga');
  var g = M.chefe;
  BSI.debug.op.invencivel = true;
  ['invertido', 'gira', 'telhado', 'briga', 'cafe', 'chora'].forEach(function (r) { g.trocarRegra(r, M); avancarHistoria(); rodar(120); avancarHistoria(); });
  BSI.debug.op.invencivel = false;
  if (J.mundo !== M) { M = J.mundo; g = M.chefe; }
  M.inverterForcado = false;
  g.levarDano(60, M, M.lider(), 'teste'); avancarHistoria(); rodar(10);
  if (!BSI.state.flags.diazepan_achado) throw new Error('não acharam o Diazepan na metade da fúria');
  g.levarDano(999, M, M.lider(), 'teste'); avancarHistoria(); // fúria zerada: só chora (não troca mais de regra)
  if (g.regra !== 'chora') throw new Error('fúria zerada deveria deixar o Gadernal chorando');
  var dz = M.props.filter(function (p) { return p.diazepan; })[0];
  var L = M.lider(); L.x = dz.x + 8; L.y = dz.y; L.flash = 0;
  BSI.debug.op.invencivel = true; rodar(240); BSI.debug.op.invencivel = false; avancarHistoria(); rodar(30); avancarHistoria();
  if (!BSI.state.flags.irmaos_revelados) throw new Error('o Diazepan não acordou / irmãos não revelados: prog=' + (dz && dz.prog) + ' dist=' + Math.round(U2(J.mundo.lider(), dz)) + ' flash=' + J.mundo.lider().flash + ' emCena=' + BSI.roteiro.emCena() + ' evento=' + !!(BSI.state.eventos || {}).diazepan_acorda + ' achado=' + BSI.state.flags.diazepan_achado + ' calmo=' + BSI.state.flags.gadernal_calmo + ' lider=' + J.mundo.lider().id + ' caido=' + J.mundo.lider().caido);
  var cav = J.mundo.props.filter(function (p) { return p.dialogo === 'cavar_botija'; })[0];
  if (!cav) throw new Error('não apareceu o lugar de cavar');
  J.conversar('cavar_botija', cav);
  for (var q = 0; q < 900 && !J.mundo.defesa; q++) { if (BSI.dialogo.ativo) { I.toqueTela(10, 10); rodar(2); } else if (J.modal && J.modal.terminar && !J.modal.fim) { J.modal.terminar(true); rodar(2); } else rodar(2); }
  if (!J.mundo.defesa) throw new Error('a defesa da tapera não começou');
  // defesa: deixa rolar e derruba os capangas
  for (var k = 0; k < 20 && J.mundo.defesa; k++) { J.mundo.inimigos.forEach(function (e) { if (!e.morto) e.morrer(J.mundo); }); rodar(10); }
  avancarHistoria(6000);
  if (!BSI.state.flags.botija_roubada) throw new Error('a botija não foi roubada no fim');
  if (BSI.state.fase !== 'ato3_festa') throw new Error('não chegou no fim do ato II (fase ' + BSI.state.fase + ')');
});
fumaca('minigame de cavar jogado de verdade', function () {
  var fim = false;
  BSI.minigames.cavar(function () { fim = true; });
  rodar(2400, function (k) { if (k % 45 === 0) I.toqueSegura('ataque', true); if (k % 45 === 2) I.toqueSegura('ataque', false); });
  I.toqueSegura('ataque', false);
  if (J.modal) J.fecharModal();
});
fumaca('ATO III: o plano, o golpe final e o Rafael CDs (3 fases) até os créditos', function () {
  BSI.state.medidores.desconfianca = 0; BSI.state.medidores.raiva = 0; BSI.state.medidores.juizo = 100; BSI.state.steloFalsas = 0;
  ['irmaos_unidos', 'irmaos_revelados', 'tia_zane_respeitada', 'gojoba_bem_tratado', 'paulo_aliado'].forEach(function (f) { BSI.story.flag(f); });
  BSI.fases.iniciar('ato3_festa'); rodar(30); avancarHistoria();
  var M = J.mundo;
  if (M.mapa.id !== 'praca_festa') throw new Error('o ato III não começou na praça');
  // golpe final da web namorada (o teste falha de propósito: Helano preso)
  BSI.fases.dispararEvento('web_final', M); avancarHistoria(800);
  if (!BSI.state.flags.helano_preso && !BSI.state.flags.helano_desmascarou) throw new Error('o golpe final não aconteceu');
  if (BSI.state.flags.helano_preso) {
    var sac = M.props.filter(function (p) { return p.dialogo === 'sacristia'; })[0];
    J.conversar('sacristia', sac); avancarHistoria();
    if (!M.temNoGrupo('helano')) throw new Error('o resgate na sacristia não devolveu o Helano');
  }
  // o plano: Hugo no gerador, Miguel invisível no camarim, aliados
  // (GRUPO QUE SE VIRA SOZINHO) o líder NÃO é o Hugo nem o Miguel: eles vêm fazer sozinhos
  var outro = M.herois.filter(function (h) { return h.id !== 'hugo' && h.id !== 'miguel' && !h.caido; })[0];
  if (outro) M.liderIdx = M.herois.indexOf(outro);
  var ger = M.props.filter(function (p) { return p.dialogo === 'gerador_palanque'; })[0];
  M.lider().x = ger.x; M.lider().y = ger.y + 14;
  J.conversar('gerador_palanque', ger); avancarHistoria(); rodar(150);
  if (!BSI.state.flags.gerador_sabotado) throw new Error('o Hugo não veio sabotar o gerador sozinho');
  var bot = M.props.filter(function (p) { return p.dialogo === 'botija_camarim'; })[0];
  M.lider().x = bot.x; M.lider().y = bot.y + 14;
  J.conversar('botija_camarim', bot); avancarHistoria(); rodar(150);
  if (!BSI.state.flags.botija_recuperada) throw new Error('o Miguel não veio roubar a botija sozinho');
  ['stelo_festa', 'zane_festa', 'gojoba_festa', 'paulo_festa', 'tribo_festa', 'daniel_festa'].forEach(function (d) { J.conversar(d, null); avancarHistoria(); });
  // o comício
  BSI.story.acoes.comecarComicio(M); avancarHistoria();
  var c = M.chefe;
  if (!c || !c.cds || !c.livre()) throw new Error('o Rafael CDs não começou o discurso');
  rodar(400, function (k) { if (k % 20 === 0) I.toqueSegura('ataque', true); if (k % 20 === 5) I.toqueSegura('ataque', false); });
  if (!M.projeteis.some(function (p) { return p.tipo === 'promessa'; }) && c.livre()) throw new Error('o CDs não está disparando promessas');
  // João Vitor rebate, João Pedro trava, Helano solta a frase
  ['joaovitor', 'joaopedro', 'helano'].forEach(function (id) { var h = M.heroi(id); if (!h) return; h.cdHab = 0; M.liderIdx = M.herois.indexOf(h); BSI.habilidades.usar(h, M); rodar(60); avancarHistoria(); });
  if (c.livre()) { c.levarDano(999, M, M.lider(), 'teste'); }
  avancarHistoria();
  if (c.estado !== 'quermesse') throw new Error('não passou pra fase 2 (estado ' + c.estado + ')');
  // fase 2: as ondas
  for (var k = 0; k < 40 && c.estado === 'quermesse'; k++) { M.inimigos.forEach(function (e) { if (!e.morto && e.time === 'inimigos' && !e.chefe) e.morrer(M); }); rodar(140); }
  avancarHistoria();
  if (!BSI.state.flags.cds_fase3) throw new Error('não chegou na fase da alma');
  if (!BSI.state.flags.grande_fogueira) throw new Error('a Grande Fogueira deveria acender (desconfiança baixa)');
  var alma = J.mundo.chefe;
  if (!alma || !alma.coronel) throw new Error('a alma do coronel não apareceu');
  rodar(300);
  alma.acuar(J.mundo);
  BSI.poderes.usar('aboio', J.mundo); rodar(120);
  for (var q2 = 0; q2 < 4000 && !(J.modal instanceof BSI.Creditos); q2++) { if (BSI.dialogo.ativo) { I.toqueTela(10, 10); rodar(2); } else if (J.modal && !(J.modal instanceof BSI.Creditos)) { segurar('confirmar', 1); } else rodar(2); }
  if (!BSI.state.flags.cds_derrotado) throw new Error('o CDs não foi derrotado');
  if (BSI.state.final !== 'heroico') throw new Error('com tudo certo, o final deveria ser o Heroico (foi ' + BSI.state.final + ')');
  if (!(J.modal instanceof BSI.Creditos)) throw new Error('os créditos não apareceram');
  rodar(60); J.fecharModal(); J.fade = { a: 0, alvo: 0, cb: null, espera: 0 };
});
fumaca('ATO III: voltar do checkpoint na fase da alma', function () {
  BSI.state.flags.cds_derrotado = false; BSI.state.flags.cds_fase3 = true;
  J.mundo = null; J.cena = 'jogo'; J.recriarMundo('praca_festa', { x: 6, y: 21 });
  rodar(30);
  if (!J.mundo.chefe || !J.mundo.chefe.coronel) throw new Error('a alma do coronel não voltou depois do checkpoint');
  BSI.state.flags.cds_derrotado = true;
});
fumaca('todos os poderes de grupo', function () {
  BSI.state.grupo = BSI.data.ordemPersonagens.slice(); BSI.state.lider = 0;
  BSI.story.flag('irmaos_unidos');
  J.recriarMundo('campo_roma', { x: 8, y: 10 });
  var M = J.mundo;
  if (M.chefe) M.chefe.ativar();
  Object.keys(BSI.poderes.lista).forEach(function (id) {
    BSI.poderes.usar(id, M); rodar(60);
    if (J.modal) J.fecharModal();
    avancarHistoria();
  });
  BSI.state.poder = 100; BSI.poderes.apertou(M); rodar(5);
  if (J.modal) { segurar('confirmar', 1); rodar(30); }
  J.recriarMundo('serra', { x: 24.5, y: 41 });
  Object.keys(BSI.poderes.lista).forEach(function (id) { BSI.poderes.usar(id, J.mundo); rodar(30); });
});
fumaca('andar, correr, atacar, trocar', function () {
  rodar(30, function () { I.toqueStick(1, 0); });
  rodar(30, function () { I.toqueStick(0, -1); });
  rodar(30, function () { I.toqueStick(-1, 0.3); });
  I.toqueStick(0, 0);
  for (var t = 0; t < 8; t++) { segurar('proximo'); segurar('ataque', 3); rodar(20); }
  segurar('anterior');
});
fumaca('todas as habilidades (12 personagens)', function () {
  BSI.state.grupo = BSI.data.ordemPersonagens.slice(0, 6);
  J.recriarMundo('trilha', BSI.data.maps.trilha.inicio);
  var lote2 = BSI.data.ordemPersonagens.slice(6);
  [BSI.state.grupo, lote2].forEach(function (grupo) {
    BSI.state.grupo = grupo; BSI.state.lider = 0;
    J.recriarMundo('trilha', { x: 8, y: 11 });
    var M = J.mundo;
    M.herois.forEach(function (h, i) {
      M.liderIdx = i;
      h.cdHab = 0;
      BSI.habilidades.usar(h, M);
      rodar(90, function (k) { if (k % 30 === 0) I.toqueStick(Math.cos(k), Math.sin(k)); });
      I.toqueStick(0, 0);
      if (BSI.jogo.modal) BSI.jogo.fecharModal();
    });
  });
});
fumaca('todos os "TIRAR O EXCESSO!"', function () {
  BSI.state.grupo = ['davi', 'joaopedro', 'miguel']; BSI.state.lider = 0;
  J.recriarMundo('trilha', { x: 19.5, y: 20 });
  BSI.excesso.tabela.forEach(function (ef) {
    BSI.excesso.forcado = ef.id;
    var d = J.mundo.herois[0]; d.cdHab = 0;
    BSI.habilidades.usar(d, J.mundo);
    rodar(40);
  });
  BSI.excesso.forcado = null;
});
fumaca('fogo espalhando no mato seco', function () {
  var M = J.mundo;
  M.fogo.acenderArea(M.lider().x + 40, M.lider().y, 2, true);
  rodar(400);
});
fumaca('web namorada (acerta e erra)', function () {
  BSI.state.grupo = ['helano', 'zeneto']; BSI.state.lider = 0;
  J.recriarMundo('terreiro', null);
  var M = J.mundo, h = M.herois[0];
  BSI.minigames.webNamorada(h, M); rodar(2);
  var dir = J.modal && J.modal.dir; I.toqueDeslize(dir); rodar(80);
  BSI.minigames.webNamorada(h, M); rodar(150);
  if (!(h.st.digitando > 0) && !J.modal) aviso('web namorada: falha não deixou o Helano digitando');
  rodar(300);
});
fumaca('todos os diálogos', function () {
  Object.keys(BSI.data.dialogos).forEach(function (id) {
    J.conversar(id, null); terminarDialogos();
    if (J.modal && !BSI.dialogo.ativo) J.fecharModal(); // ação que abre tela (oficina, bodega)
    if (BSI.dialogo.ativo) { if (J.modal) { J.fecharModal(); terminarDialogos(); } }
    if (BSI.dialogo.ativo) throw new Error('diálogo "' + id + '" não termina');
  });
});
fumaca('troca de mapa ida e volta', function () {
  J.trocarMapa('trilha', BSI.data.maps.terreiro.portas[0].chegada); rodar(60);
  if (J.mundo.mapa.id !== 'trilha') throw new Error('não chegou na trilha');
  J.trocarMapa('terreiro', BSI.data.maps.trilha.portas[0].chegada); rodar(60);
  if (J.mundo.mapa.id !== 'terreiro') throw new Error('não voltou pro terreiro');
});
fumaca('todo mundo cai e volta pra fogueira', function () {
  var M = J.mundo;
  M.herois.forEach(function (h) { h.inv = 0; h.levarDano(99, M, null, 'corpo'); });
  rodar(120);
  if (J.mundo.herois.some(function (h) { return h.caido; })) throw new Error('heróis não voltaram de pé');
});
fumaca('inimigos atacando o grupo parado (60 s)', function () {
  BSI.state.grupo = BSI.data.grupoInicial.slice(); BSI.state.lider = 0;
  J.recriarMundo('trilha', { x: 8, y: 12 });
  rodar(3600, function (k) { if (k % 50 === 0) { I.toqueSegura('ataque', true); } if (k % 50 === 5) I.toqueSegura('ataque', false); });
});
fumaca('v1.0: TODO MAPA com o grupo andando e brigando', function () {
  Object.keys(BSI.data.maps).forEach(function (id) {
    for (var w = 0; w < 300 && J.trocando; w++) rodar(1);
    BSI.state.medidores.raiva = 0;
    J.recriarMundo(id, BSI.data.maps[id].inicio); rodar(20); avancarHistoria(400);
    var M = J.mundo; if (!M) throw new Error('mapa ' + id + ' não carregou');
    M.herois.forEach(function (h) { h.vida = 6; h.caido = false; });
    rodar(400, function (k) {
      if (k % 60 === 0) I.toqueStick(Math.cos(k * 0.7), Math.sin(k * 0.9));
      if (k % 25 === 0) I.toqueSegura('ataque', true); if (k % 25 === 2) I.toqueSegura('ataque', false);
      if (k % 50 === 0) M.herois.forEach(function (h) { if (h.vida < 3) h.vida = 6; });
      if (BSI.dialogo.ativo || J.modal) avancarHistoria(300);
    });
    I.toqueStick(0, 0);
  });
});
fumaca('v1.0: MEMÓRIA — 4 minutos de briga sem acumular lixo', function () {
  for (var w0 = 0; w0 < 300 && J.trocando; w0++) rodar(1);
  BSI.state.medidores.raiva = 0; J.recriarMundo('serra', { x: 24.5, y: 40 }); rodar(20); avancarHistoria(400);
  var M = J.mundo, L = M.lider();
  for (var i = 0; i < 6; i++) M.inimigos.push(new BSI.Inimigo(['jagunco', 'capangaEspingarda', 'cachorroBravo'][i % 3], L.x + 50 + i * 8, L.y + (i % 2) * 20));
  var pico = {};
  rodar(14400, function (k) {
    M = J.mundo;
    if (k % 30 === 0) I.toqueSegura('ataque', true); if (k % 30 === 2) I.toqueSegura('ataque', false);
    if (k % 120 === 0) { M.herois.forEach(function (h) { h.vida = 6; }); if (M.inimigos.filter(function (e) { return !e.morto; }).length < 3) M.inimigos.push(new BSI.Inimigo('jagunco', M.lider().x + 60, M.lider().y)); }
    if (BSI.dialogo.ativo || J.modal) avancarHistoria(300);
    if (k % 600 === 0) ['projeteis', 'baloes', 'efeitos', 'agenda', 'props', 'inimigos'].forEach(function (c) { pico[c] = Math.max(pico[c] || 0, (M[c] || []).length); });
  });
  if (M.particulas.lista.length > 600) throw new Error('partículas acumulando: ' + M.particulas.lista.length);
  if (pico.projeteis > 250) throw new Error('projéteis acumulando: ' + pico.projeteis);
  if (pico.baloes > 30) throw new Error('balões acumulando: ' + pico.baloes);
  if (pico.agenda > 200) throw new Error('agenda acumulando: ' + pico.agenda);
  if (pico.efeitos > 150) throw new Error('efeitos acumulando: ' + pico.efeitos);
  if (M.trilha.length > 170) throw new Error('rastro do líder acumulando: ' + M.trilha.length);
});
fumaca('v1.0: OS 7 FINAIS tocados até os créditos', function () {
  var receitas = {
    sobrenatural: function (S) { S.medidores.raiva = 95; },
    traicao: function (S) { S.medidores.desconfianca = 95; },
    absurdo: function (S) { S.steloFalsas = 2; },
    tragico: function (S) { S.medidores.juizo = 10; },
    heroico: function (S) { ['botija_recuperada', 'grande_fogueira'].forEach(function (f) { S.flags[f] = true; }); },
    familia: function (S) { ['irmaos_unidos', 'tia_zane_respeitada'].forEach(function (f) { S.flags[f] = true; }); },
    meio: function () { }
  };
  var vistos = [];
  Object.keys(receitas).forEach(function (id) {
    if (!BSI.data.finais.some(function (f) { return f.id === id; })) throw new Error('final ' + id + ' não existe');
    var S = BSI.state;
    S.medidores.raiva = 0; S.medidores.desconfianca = 0; S.medidores.juizo = 100; S.steloFalsas = 0; S.stats.queimados = 0;
    ['botija_recuperada', 'grande_fogueira', 'irmaos_unidos', 'tia_zane_respeitada', 'daniel_descontrolado'].forEach(function (f) { S.flags[f] = false; });
    receitas[id](S);
    J.recriarMundo('praca_festa', { x: 10, y: 17 }); rodar(10);
    BSI.finais.tocar(J.mundo);
    var creditos = false;
    for (var k = 0; k < 3000 && !creditos; k++) {
      if (J.modal && J.modal.constructor && J.modal.constructor.name === 'Creditos') creditos = true;
      else if (BSI.dialogo.ativo) { if (k % 2) { I.toqueTela(10, 10); rodar(2); } else segurar('confirmar', 1); }
      else if (J.modal && J.modal.terminar && !J.modal.fim) { J.modal.terminar(true); rodar(2); }
      else rodar(2);
      if (J.modal && /Creditos|Estatisticas/.test(J.modal.constructor && J.modal.constructor.name)) creditos = true;
    }
    if (S.final !== id) throw new Error('queria o final ' + id + ' e veio ' + S.final);
    if (!creditos) throw new Error('o final ' + id + ' não chegou nos créditos');
    vistos.push(id);
    if (J.modal) J.fecharModal();
  });
  BSI.state.medidores.raiva = 0; BSI.state.medidores.desconfianca = 0; BSI.state.medidores.juizo = 100; BSI.state.steloFalsas = 0;
});
fumaca('v1.0: 3 ESPAÇOS DE SAVE, save corrompido, exportar/importar', function () {
  var SV = BSI.save, ls = { setItem: function (k, v) { armazenamento[k] = v; } };
  SV.usarSlot(2); J.salvar();
  var i2 = SV.info(2); if (!i2.meta || !i2.meta.ato) throw new Error('o espaço 2 não guardou nome/ato');
  J.salvar(); // segunda vez: guarda o anterior
  ls.setItem('bsi.save.slot2', '{isso nao e json');
  var c = SV.info(2); if (!c.corrompido) throw new Error('save estragado devia aparecer como corrompido');
  if (!c.temAnterior) throw new Error('devia ter o save anterior pra voltar');
  if (SV.carregarJogo(2) !== null) throw new Error('save corrompido não devia carregar');
  if (!SV.carregarAnterior(2)) throw new Error('o save anterior não carregou');
  // exporta do 1 (o atual) e importa no 3
  SV.usarSlot(1); J.salvar();
  var arq = SV.exportar(1); if (!arq) throw new Error('não exportou');
  var erro = SV.importar(3, arq); if (erro) throw new Error('não importou: ' + erro);
  if (!SV.info(3).meta) throw new Error('o espaço 3 ficou vazio depois de importar');
  if (!SV.importar(3, 'lixo')) throw new Error('importar lixo devia dar erro');
  // a tela abre e fecha
  J.abrirModal(new BSI.TelaSaves('gerenciar')); rodar(10); segurar('pausa', 1); rodar(3);
  SV.apagarJogo(2); SV.apagarJogo(3); SV.usarSlot(1);
});
fumaca('pausa, salvar e continuar', function () {
  J.abrirModal(J.pausa()); rodar(10); J.fecharModal();
  J.salvar();
  if (!BSI.save.temJogo()) throw new Error('não salvou');
  J.mundo = null; J.criarMenuTitulo(); rodar(10);
  J.continuar(); rodar(30);
  if (!J.mundo) throw new Error('continuar não criou o mundo');
});
fumaca('tela em retrato (celular)', function () {
  janela.innerWidth = 390; janela.innerHeight = 844; janela.devicePixelRatio = 3;
  BSI.touch.ativo = true; BSI.view.redimensionar();
  if (BSI.view.w < 170 || BSI.view.w > 300) erro('retrato: largura virtual estranha ' + BSI.view.w);
  rodar(60);
  janela.innerWidth = 1280; janela.innerHeight = 720; janela.devicePixelRatio = 1;
  BSI.touch.ativo = false; BSI.view.redimensionar();
});

relatorio();
process.exit(erros.length ? 1 : 0);

function relatorio() {
  console.log('\n=== Validador — A Botija de Santa Isabel ===');
  console.log('Scripts: ' + scripts.length + '   Mapas: ' + (BSI ? Object.keys(BSI.data.maps).length : 0) + '   Diálogos: ' + (BSI ? Object.keys(BSI.data.dialogos).length : 0) + '   Passos simulados: ' + passos);
  console.log('Finais: ' + (BSI ? BSI.data.finais.length : 0) + ' (todos conferidos como alcançáveis).');
  if (avisos.length) { console.log('\nAVISOS (' + avisos.length + '):'); avisos.forEach(function (a) { console.log('  ! ' + a); }); }
  if (erros.length) { console.log('\nERROS (' + erros.length + '):'); erros.forEach(function (e) { console.log('  x ' + e); }); }
  console.log(erros.length ? '\nFALHOU.' : '\nTUDO CERTO.');
}
