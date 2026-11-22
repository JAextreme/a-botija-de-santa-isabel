#!/usr/bin/env node
/* =========================================================
   tools/servidor.js — servidor local OPCIONAL (o jogo abre com
   dois cliques no index.html; isto é só para testar no celular
   na mesma rede Wi-Fi).  Rode:  node tools/servidor.js [porta]
   Depois abra no celular: http://IP-DO-PC:8080
   ========================================================= */
'use strict';
var http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
var RAIZ = path.join(__dirname, '..');
var PORTA = +process.argv[2] || 8080;
var TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

http.createServer(function (req, res) {
  var url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  var arq = path.normalize(path.join(RAIZ, url));
  if (arq.indexOf(RAIZ) !== 0) { res.writeHead(403); return res.end('proibido'); }
  fs.readFile(arq, function (e, dados) {
    if (e) { res.writeHead(404); return res.end('não achei'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(dados);
  });
}).listen(PORTA, function () {
  console.log('Botija rodando em http://localhost:' + PORTA);
  var ifs = os.networkInterfaces();
  Object.keys(ifs).forEach(function (n) { ifs[n].forEach(function (i) { if (i.family === 'IPv4' && !i.internal) console.log('No celular (mesmo Wi-Fi): http://' + i.address + ':' + PORTA); }); });
});
