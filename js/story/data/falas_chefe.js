/* =========================================================
   falas_chefe.js — o que os CHEFES dizem durante a luta (balão)
   entrada · fase1/fase2/fase3 (quando muda de fase) ·
   apanha (às vezes, ao levar golpe) · derrota
   A conversa DEPOIS da luta fica nos diálogos de cada ato
   (<chefe>_depois), e muda se ele virou aliado.
   ========================================================= */
(function () {
  'use strict';
  BSI.data.falasChefe = {
    paulo: {
      entrada: ['Pedágio do Roma! Ninguém passa sem jogar!', 'Presidente, capitão e artilheiro! Vem!'],
      fase1: ['Aquece, Roma! Aquece!', 'Hic! Primeiro tempo!'],
      fase2: ['Segundo tempo! Agora é pra valer! Hic!', 'Juiz ladrão! Ah, não tem juiz. Então EU sou o juiz!'],
      fase3: ['Prorrogação! Ninguém sai de campo!', 'Pênalti! Dessa vez eu não perco! Acho.'],
      apanha: ['Falta! FALTA!', 'Ai! Cartão amarelo pra tu!', 'Isso foi mão!', 'Hic! Doeu na alma do clube!', 'Cadê o massagista?!'],
      derrota: ['Tá bom, tá bom... o Roma pede tempo.', 'Perdi... igual em 2009. Mas dessa vez foi bonito.']
    },
    alma: {
      entrada: ['Quem... ousa... perturbar... meu descanso...', 'Uuuuuhhh... carne assada... eu sinto o cheiro...'],
      fase2: ['A noite é minha... apaguem... as fogueiras...', 'Vocês... não são... do meu tempo...'],
      fase3: ['Eu não... me rendo...', 'Essa terra... ainda é minha...'],
      apanha: ['Uuuuhhh!', 'A reza... queima...', 'Luz... não...', 'Fogo... de novo...'],
      derrota: ['O aboio... do Tio Ota... eu lembro... desse som...', 'Enfim... descanso...']
    },
    gojoba: {
      entrada: ['VOLUME NO MÁXIMO, PRIMO! *soluço*', 'ESSA É PRA DANÇAR! *soluço*'],
      fase2: ['A CAIXA RESERVA! A CAIXA RESERVA! *soluço*', 'Ninguém desliga meu som! Nem a polícia! Nem minha mãe!'],
      fase3: ['*soluço* Por que vocês odeiam música?!', 'Última música... a mais triste... *soluço*'],
      apanha: ['Ai, primo! *soluço*', 'Isso é inveja do meu som!', 'Desliga não, desliga não!', '*soluço* Doeu no coração e na caixa!'],
      derrota: ['*chorando* Ninguém entende minha arte...', 'Silêncio... que coisa feia o silêncio...']
    },
    gadernal: {
      entrada: ['Regra nova: quem entrar na tapera vira estátua!', 'Aqui as regras sou eu! E elas mudam!'],
      fase2: ['Regra nova! Agora vale tudo... menos andar!', 'Café! Cadê meu café?! Mudei a regra do café!'],
      fase3: ['Regra final: ninguém dorme! NINGUÉM!', 'Eu não durmo há três dias! Vocês também não vão!'],
      apanha: ['Isso é contra a regra!', 'Que regra é essa?! Fui eu que fiz?!', 'Ai! Mudei a regra da dor!', 'Telha! Telha!'],
      derrota: ['...que sono. Que sono de três dias.', 'Tá bom... regra nova: todo mundo descansa.']
    },
    cds: {
      entrada: ['Povo de Santa Isabel! Eu trago o FUTURO!', 'Vamos ouvir o cidadão! Depois eu falo por uma hora.'],
      fase1: ['Promessa número um: metrô no açude!', 'Vou asfaltar até o céu!'],
      fase2: ['Capangas! Garantam a democracia do meu palanque!', 'Quermesse liberada! Pra eles, não pra vocês!'],
      fase3: ['Isso é perseguição política!', 'Eu tenho advogado! Eu tenho TRÊS advogados!'],
      apanha: ['Isso é fake news!', 'Ai! Vou processar!', 'Minha gravata! Era importada!', 'Ninguém me toca! Eu sou o futuro!'],
      derrota: ['...eu volto. Com metrô. Vocês vão ver.', 'Essa terra... era um investimento...']
    }
  };
})();
