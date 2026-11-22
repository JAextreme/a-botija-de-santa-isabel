/* =========================================================
   dialog_runner.js — executa os diálogos (formato em
   dialogos_proto.js). Só lógica; o desenho fica em ui/dialogbox.js.
   ========================================================= */
(function () {
  'use strict';

  // Ações chamáveis por { acao: 'nome' } nos diálogos
  BSI.story.acoes = {
    darMunicao: function () { BSI.state.municao += 4; BSI.hud.aviso('+4 cartuchos'); }
  };

  function textoControles() {
    var d = BSI.input.ultimoDispositivo, r = BSI.input.rotulo;
    if (d === 'pad') return 'Analógico anda (RT corre). A ataca, X habilidade, Y poder, B fala, RB troca de personagem, LB dá ordem pro grupo, Back abre o mapa, Start pausa.';
    return 'WASD anda, [' + r('correr') + '] corre, [' + r('ataque') + '] ataca, [' + r('habilidade') + '] habilidade, [' + r('poder') + '] poder de grupo, [' + r('interagir') + '] fala. ' +
      '[' + r('proximo') + '] troca quem você controla, e [1] a [6] pedem a habilidade de cada companheiro sem trocar. [' + r('ordem') + '] dá ordem pro grupo, [' + r('mapa') + '] abre o mapa.';
  }

  // condição de flag: 'nome' ou ['a','b'] (todas ligadas)
  function lista(x) { return Array.isArray(x) ? x : [x]; }
  function todas(x) { return lista(x).every(function (f) { return BSI.story.tem(f); }); }
  function nenhuma(x) { return lista(x).every(function (f) { return !BSI.story.tem(f); }); }
  // opção de escolha aparece? (se / seNao / grupo)
  function opcaoValida(o) {
    if (o.se !== undefined && !todas(o.se)) return false;
    if (o.seNao !== undefined && !nenhuma(o.seNao)) return false;
    if (o.grupo && !(R._mundo && R._mundo.temNoGrupo(o.grupo))) return false;
    return true;
  }

  var R = BSI.dialogo = {
    ativo: false,
    linha: null,       // {quem, nome, texto, spr}
    escolha: null,     // {opcoes:[...], sel}
    mostrados: 0,      // letras já "digitadas"
    _nos: null, _seq: null, _i: 0, _aoFim: null, _mundo: null, _id: null,

    // spec: 'id' ou { idDoPersonagem: 'id', padrao: 'id' }
    // Escolhe pelo líder; se o líder não tiver fala própria, quem do GRUPO
    // tiver (ex.: o Miguel vê os desenhos mesmo sem ser o controlado).
    resolver: function (spec, mundo) {
      if (!spec) return null;
      if (typeof spec === 'string') return spec;
      var L = mundo && mundo.lider();
      if (L && spec[L.id]) return spec[L.id];
      if (mundo && mundo.herois) {
        for (var i = 0; i < mundo.herois.length; i++) {
          var h = mundo.herois[i];
          if (!h.caido && spec[h.id]) return spec[h.id];
        }
      }
      return spec.padrao || null;
    },

    iniciar: function (spec, mundo, aoFim) {
      var id = R.resolver(spec, mundo);
      var nos = id && BSI.data.dialogos[id];
      if (!nos) { if (aoFim) aoFim(); return false; }
      R._id = id; R._nos = nos; R._seq = nos.inicio; R._i = 0;
      R._aoFim = aoFim || null; R._mundo = mundo;
      R.ativo = true;
      R.linha = null; R.escolha = null;
      R.processar();
      return true;
    },

    // anda pela sequência até achar uma fala ou escolha
    processar: function () {
      var guarda = 0;
      while (R.ativo && guarda++ < 200) {
        if (!R._seq || R._i >= R._seq.length) { R.fim(); return; }
        var p = R._seq[R._i++];
        if (Array.isArray(p)) { R.mostrarFala(p[0], p[1]); return; }
        if (p.escolha) {
          var ops = p.escolha.filter(opcaoValida);
          if (!ops.length) continue;
          R.escolha = { opcoes: ops, sel: 0 }; R.mostrados = 9999; return;
        }
        // FOFOCA: o NPC conta a primeira novidade que bate e ainda não contou
        if (p.fofoca) {
          var ff = R.fofoca(p.fofoca);
          if (ff) { R.mostrarFala(p.quem || p.fofoca, ff); return; }
          continue;
        }
        if (p.flags) for (var f in p.flags) BSI.story.flag(f, p.flags[f]);
        if (p.medidores) for (var m in p.medidores) BSI.story.medidor(m, p.medidores[m]);
        if (p.acao && BSI.story.acoes[p.acao]) BSI.story.acoes[p.acao](R._mundo);
        if (p.pista && BSI.fases) BSI.fases.pista(p.pista);
        if (p.se !== undefined) { if (todas(p.se)) R.pular(p.vai); continue; }
        if (p.seGrupo !== undefined) { if (R._mundo && R._mundo.temNoGrupo(p.seGrupo)) R.pular(p.vai); continue; }
        if (p.seSegredo !== undefined) { if (BSI.state && BSI.state.segredo === p.seSegredo) R.pular(p.vai); continue; }
        if (p.vai) { R.pular(p.vai); continue; }
        if (p.fim) { R.fim(); return; }
      }
    },
    pular: function (no) { R._seq = R._nos[no]; R._i = 0; },
    fofoca: function (npc) {
      var S = BSI.state, lista = (BSI.data.fofocas || {})[npc]; if (!lista || !S) return null;
      S.fofocasDitas = S.fofocasDitas || {};
      for (var i = 0; i < lista.length; i++) {
        var f = lista[i], k = npc + ':' + i;
        if (f.se && !todas(f.se)) continue;
        if (f.seNao && !nenhuma(f.seNao)) continue;
        if (f.medidor) { var v = S.medidores[f.medidor[0]], lim = f.medidor[1]; if (lim >= 0 ? v < lim : v > -lim) continue; }
        var repete = f.fala.indexOf('{lista:') >= 0; // as de lista podem repetir (é sorteio)
        if (!repete && S.fofocasDitas[k]) continue;
        S.fofocasDitas[k] = true;
        return f.fala;
      }
      return null;
    },

    mostrarFala: function (quem, texto) {
      var mundo = R._mundo, expr = null;
      // 'miguel:bravo' escolhe a expressão do retrato
      if (String(quem).indexOf(':') > 0) { var pq = String(quem).split(':'); quem = pq[0]; expr = pq[1]; }
      if (quem === 'lider') { var L = mundo && mundo.lider(); quem = L ? L.id : 'narrador'; }
      var nome = '', spr = null, pj = BSI.data.personagens[quem], np = BSI.data.falantes[quem];
      if (pj) { nome = pj.apelido ? pj.nome + ' "' + pj.apelido + '"' : pj.nome; spr = BSI.sprites.humano('heroi:' + quem, pj.visual); }
      else if (np) {
        nome = np.nome;
        if (np.bicho) spr = BSI.sprites[np.bicho]();
        else if (np.visual) spr = BSI.sprites.humano('npc:' + quem, np.visual);
      }
      texto = String(texto)
        .replace(/\{tecla:(\w+)\}/g, function (_, a) { return BSI.input.rotulo(a); })
        .replace(/\{lista:(\w+)\}/g, function (t0) { return BSI.falasVivas ? BSI.falasVivas.preencher(t0) : ''; })
        .replace('{placa}', mundo && mundo.conversando && mundo.conversando.texto ? mundo.conversando.texto : '')
        .replace('{lider}', mundo && mundo.lider() ? mundo.lider().nome() : '')
        .replace('{controles}', textoControles())
        .replace('{municao}', BSI.state ? BSI.state.municao : 0)
        .replace('{plano}', BSI.story.resumoPlano ? BSI.story.resumoPlano() : '');
      if (!expr && BSI.retratos) expr = BSI.retratos.adivinhar(texto);
      R.linha = { quem: quem, nome: nome, texto: texto, spr: spr, expr: expr || 'normal' };
      R.escolha = null;
      R.mostrados = 0;
    },

    // jogador apertou para avançar
    avancar: function () {
      if (!R.ativo) return;
      if (R.escolha) {
        var op = R.escolha.opcoes[R.escolha.sel];
        BSI.audio.sfx('confirma');
        R.escolha = null;
        if (op.flags) for (var f in op.flags) BSI.story.flag(f, op.flags[f]);
        if (op.medidores) for (var m in op.medidores) BSI.story.medidor(m, op.medidores[m]);
        if (op.acao && BSI.story.acoes[op.acao]) BSI.story.acoes[op.acao](R._mundo);
        if (op.vai) R.pular(op.vai);
        R.processar();
        return;
      }
      if (R.linha && R.mostrados < R.linha.texto.length) { R.mostrados = R.linha.texto.length; return; } // pula digitação
      R.processar();
    },

    fim: function () {
      R.ativo = false; R.linha = null; R.escolha = null;
      var cb = R._aoFim; R._aoFim = null;
      if (cb) cb();
    }
  };
})();
