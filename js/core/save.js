/* =========================================================
   save.js — salvamento em localStorage, sempre com try/catch
   (aba anônima, armazenamento bloqueado ou cheio não podem
   quebrar o jogo: ele só deixa de salvar).
   ========================================================= */
(function () {
  'use strict';
  var cfgCache = null;

  var CHAVE_SAVE = 'bsi.save.v1';
  var CHAVE_CFG = 'bsi.cfg.v1';
  var memoria = {}; // reserva caso o localStorage não exista

  var CORROMPIDO = { corrompido: true };
  function ler(chave) {
    var txt;
    try { txt = window.localStorage.getItem(chave); } catch (e) { return memoria[chave] || null; }
    if (!txt) return memoria[chave] || null;
    try { return JSON.parse(txt); } catch (e) { return CORROMPIDO; } // arquivo estragado: não trava, avisa
  }
  // um estado de jogo é válido se tem o básico
  function valido(s) { return !!(s && !s.corrompido && typeof s === 'object' && s.fase && s.checkpoint && s.checkpoint.mapa && s.flags && s.medidores); }
  function gravar(chave, valor) {
    memoria[chave] = valor;
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }
  function apagar(chave) {
    delete memoria[chave];
    try { window.localStorage.removeItem(chave); } catch (e) { /* nada */ }
  }

  // ---------------- 3 ESPAÇOS DE SAVE ----------------
  function chaveSlot(n) { return 'bsi.save.slot' + n; }
  function slotAtual() { var c = BSI.save.cfg(); return c.slotAtual >= 1 && c.slotAtual <= 3 ? c.slotAtual : 1; }
  // o save antigo (de antes da v1.0) vira o espaço 1, sem perder nada
  function migrar() {
    var velho = ler(CHAVE_SAVE);
    if (velho && !velho.corrompido && !ler(chaveSlot(1))) {
      velho._meta = velho._meta || { nome: 'Jogo salvo antes da v1.0', data: new Date().toISOString() };
      gravar(chaveSlot(1), velho);
    }
  }
  function meta(estado, nomeVelho) {
    var f = BSI.data && BSI.data.fases && BSI.data.fases[estado.fase];
    return { nome: nomeVelho || 'Jogo ' + slotAtual(), ato: f ? f.ato + ' — ' + f.titulo : estado.fase, tempo: Math.floor(estado.tempo || 0), data: new Date().toISOString(), dificuldade: estado.dificuldade || 'cabra' };
  }

  BSI.save = {
    valido: valido,
    slotAtual: slotAtual,
    usarSlot: function (n) { var c = BSI.save.cfg(); c.slotAtual = n; BSI.save.salvarCfg(c); },
    // como está cada espaço: {vazio} | {corrompido, temAnterior} | {meta}
    info: function (n) {
      migrar();
      var s = ler(chaveSlot(n));
      if (!s) return { vazio: true };
      if (!valido(s)) return { corrompido: true, temAnterior: valido(ler(chaveSlot(n) + '.anterior')) };
      return { meta: s._meta || meta(s) };
    },
    temJogo: function () { migrar(); for (var n = 1; n <= 3; n++) if (valido(ler(chaveSlot(n)))) return true; return false; },
    carregarJogo: function (n) { migrar(); var s = ler(chaveSlot(n || slotAtual())); return valido(s) ? s : null; },
    carregarAnterior: function (n) { var s = ler(chaveSlot(n) + '.anterior'); return valido(s) ? s : null; },
    salvarJogo: function (estado, n) {
      n = n || slotAtual();
      var atual = ler(chaveSlot(n));
      if (valido(atual)) gravar(chaveSlot(n) + '.anterior', atual); // guarda a cópia anterior (se corromper, volta nela)
      estado._meta = meta(estado, atual && atual._meta && atual._meta.nome);
      if (estado._nomeNovo) { estado._meta.nome = estado._nomeNovo; delete estado._nomeNovo; }
      return gravar(chaveSlot(n), estado);
    },
    renomear: function (n, nome) { var s = ler(chaveSlot(n)); if (valido(s)) { s._meta = s._meta || meta(s); s._meta.nome = nome; gravar(chaveSlot(n), s); } },
    apagarJogo: function (n) { n = n || slotAtual(); apagar(chaveSlot(n)); apagar(chaveSlot(n) + '.anterior'); },
    // exportar/importar (arquivo .json pra levar pra outro PC)
    exportar: function (n) { var s = ler(chaveSlot(n)); return valido(s) ? JSON.stringify({ jogo: 'A Botija de Santa Isabel', versao: 1, save: s }) : null; },
    importar: function (n, texto) {
      var o; try { o = JSON.parse(texto); } catch (e) { return 'Esse arquivo não é um save do jogo (não deu pra ler).'; }
      var s = o && o.save ? o.save : o;
      if (!valido(s)) return 'Esse arquivo não é um save válido da Botija.';
      var atual = ler(chaveSlot(n)); if (valido(atual)) gravar(chaveSlot(n) + '.anterior', atual);
      s._meta = s._meta || meta(s); s._meta.data = new Date().toISOString();
      gravar(chaveSlot(n), s);
      return null;
    },

    // preferências (som, volume, opções, teclas). UM objeto só, guardado em
    // memória: todo mundo mexe no mesmo e quem salva não apaga o dos outros.
    cfg: function () {
      if (cfgCache) return cfgCache;
      var c = ler(CHAVE_CFG) || {};
      if (typeof c.volume !== 'number') c.volume = 0.7;
      if (typeof c.mudo !== 'boolean') c.mudo = false;
      return (cfgCache = c);
    },
    salvarCfg: function (c) {
      var atual = BSI.save.cfg();
      if (c && c !== atual) for (var k in c) atual[k] = c[k];
      gravar(CHAVE_CFG, atual);
    }
  };
})();
