/* =========================================================
   finais.js (CONTEÚDO) — os finais do jogo, em ORDEM DE PRIORIDADE:
   o primeiro cuja condição bater é o que acontece.
   Cada final tem um diálogo "final_<id>" em dialogos_ato3.js.
   ========================================================= */
(function () {
  'use strict';
  function t(f, S) { return !!S.flags[f]; }

  BSI.data.finais = [
    {
      id: 'sobrenatural', nome: 'Final Sobrenatural', frase: 'A Caipora cobrou a conta.',
      condicao: 'Raiva da Caipora no máximo (90 ou mais)', dica: 'a mata não perdoa quem caça demais.',
      teste: function (S) { return S.medidores.raiva >= 90; }
    },
    {
      id: 'traicao', nome: 'Final da Traição', frase: 'Baratinha, parceiro.',
      condicao: 'Desconfiança no grupo no máximo (90 ou mais)', dica: 'quando ninguém confia em ninguém...',
      teste: function (S) { return S.medidores.desconfianca >= 90; }
    },
    {
      id: 'absurdo', nome: 'Final Absurdo', frase: 'O Stelo estava certo o tempo todo.',
      condicao: 'Acreditar em 2 ou mais fake news do Stelo', dica: 'o grupo do WhatsApp sempre tem razão?',
      teste: function (S) { return (S.steloFalsas || 0) >= 2; }
    },
    {
      id: 'tragico', nome: 'Final Trágico-Cômico', frase: 'De volta ao fiado da bodega.',
      condicao: 'Vencer com o Juízo muito baixo (20 ou menos) ou com o Daniel descontrolado (fogo demais)', dica: 'sem juízo e com fogo demais.',
      teste: function (S) { return S.medidores.juizo <= 20 || t('daniel_descontrolado', S); }
    },
    {
      id: 'heroico', nome: 'Final Heroico', frase: 'A terra é de Santa Isabel.',
      condicao: 'Botija recuperada, Raiva da Caipora baixa (menos de 50) e a Grande Fogueira acesa', dica: 'a botija, a mata em paz e uma fogueira enorme.',
      teste: function (S) { return t('botija_recuperada', S) && S.medidores.raiva < 50 && t('grande_fogueira', S); }
    },
    {
      id: 'familia', nome: 'Final da Família Reunida', frase: 'Almoço na casa da Tia Zane.',
      condicao: 'Irmãos unidos até o fim e a Tia Zane respeitada', dica: 'família unida e a Tia Zane de bem com todo mundo.',
      teste: function (S) { return t('irmaos_unidos', S) && t('tia_zane_respeitada', S); }
    },
    {
      id: 'meio', nome: 'Final do Meio-Termo', frase: 'Ganhamos. Mais ou menos.',
      condicao: 'Quando nenhum outro final acontece', dica: 'o que acontece quando nada de especial acontece.',
      teste: function () { return true; }
    }
  ];

  // quem fez o jogo (créditos em forma de folheto de cordel)
  // tipos: titulo · secao · verso · autor · '' (texto comum)
  BSI.data.creditos = [
    ['A BOTIJA DE SANTA ISABEL', 'titulo'],
    ['um folheto em pixel, contado em seis estrofes', ''],
    ['', ''],
    ['Vou contar pra quem quiser', 'verso'],
    ['O causo da botija enterrada:', 'verso'],
    ['Seis amigos, lua cheia,', 'verso'],
    ['Uma espingarda emprestada,', 'verso'],
    ['Um bode que dava conselho', 'verso'],
    ['E uma Caipora arretada.', 'verso'],
    ['', ''],
    ['A TURMA', 'secao'],
    ['Helano "Lapuca" — o profeta', ''], ['Zé Neto — o doutor', ''], ['João Vitor "Miserável"', ''],
    ['João Luiz Amadeu', ''], ['Luiz Fernando Amadeu', ''], ['João Pedro — escapamento das 2h', ''],
    ['Davi — TIRAR O EXCESSO!', ''], ['Vander — o que aparece e some', ''], ['Miguel — artista e ladrão de carne', ''],
    ['Hugo — a gambiarra', ''], ['Daniel — o fogo', ''], ['João Carlos — a família', ''],
    ['', ''],
    ['Tinha jagunço na serra,', 'verso'],
    ['Alma penada no açude,', 'verso'],
    ['Caixa de som no boteco', 'verso'],
    ['Tocando alto e sem virtude,', 'verso'],
    ['E um comício na praça', 'verso'],
    ['Que nem Santo Antônio acude.', 'verso'],
    ['', ''],
    ['TAMBÉM ESTRELANDO', 'secao'],
    ['Tia Zane e a chinela teleguiada', ''], ['Trovão e Piaba', ''], ['O Bode', ''], ['Stelo e o grupo do WhatsApp', ''],
    ['Paulo do Zé Baixinho e o Roma', ''], ['Gojoba e a caixa de 500 watts', ''], ['Emanuel "Gadernal"', ''],
    ['Vinícius "Diazepan" (dormindo)', ''], ['Felipe Parceiro, parceiro', ''], ['Dudu', ''],
    ['Seu Chico Vaqueiro', ''], ['Dona Socorro e o caderno do fiado', ''], ['Dona Benedita rezadeira', ''], ['Padre Anselmo', ''],
    ['Rafael CDs (fictício, como todo político deste jogo)', ''],
    ['', ''],
    ['EM MEMÓRIA', 'secao'],
    ['Lá no curral do Açudinho', 'verso'],
    ['Ainda tem aboio no ar:', 'verso'],
    ['É o Tio Ota com seu gado', 'verso'],
    ['Que vem de noite visitar.', 'verso'],
    ['Vaqueiro que é de verdade', 'verso'],
    ['Nunca deixa de aboiar.', 'verso'],
    ['', ''],
    ['Tio Ota — o maior vaqueiro de Santa Isabel', ''],
    ['"Água de Deus não tem dono."', ''],
    ['', ''],
    ['ARTE EXTRA', 'secao'],
    ['Partículas e ícones de teclas: Kenney (kenney.nl), licença CC0', ''],
    ['', ''],
    ['MÚSICA', 'secao'],
    ['Trilha composta por código, inspirada no baião, no xote e no forró.', ''],
    ['Nenhuma música real foi tocada (as do Gojoba são ruins de propósito).', ''],
    ['', ''],
    ['Este cordel de pixel', 'verso'],
    ['Foi feito com muito amor,', 'verso'],
    ['Com causo, fogo e risada', 'verso'],
    ['E um bode, sim senhor.', 'verso'],
    ['Quem conta é da terra mesmo,', 'verso'],
    ['Do sertão e do calor.', 'verso'],
    ['', ''],
    ['CRIADO POR', 'secao'],
    ['José Neto', 'autor'],
    ['', ''],
    ['Obrigado por jogar!', 'titulo']
  ];
})();
