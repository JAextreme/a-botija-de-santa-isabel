# =========================================================
# criar_exe.ps1 — monta dist\A-Botija-de-Santa-Isabel.exe
# Usa só o que já vem no Windows (csc.exe do .NET Framework).
# Rode na pasta do jogo:  powershell -ExecutionPolicy Bypass -File tools\criar_exe.ps1
# =========================================================
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$obra = Join-Path $raiz '_tmp\exe'
if (Test-Path $obra) { Remove-Item -Recurse -Force $obra }
New-Item -ItemType Directory -Force $obra | Out-Null
New-Item -ItemType Directory -Force (Join-Path $raiz 'dist') | Out-Null

# ---------- 1. o ícone: uma botija de barro com moedas (pixel art 32x32) ----------
function Desenhar-Botija {
  $b = New-Object System.Drawing.Bitmap 32, 32
  $g = [System.Drawing.Graphics]::FromImage($b)
  $g.Clear([System.Drawing.Color]::Transparent)
  function Pinta-Pixel($cor, $x, $y, $w, $h) { $g.FillRectangle((New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($cor))), $x, $y, $w, $h) }
  $cont = '#2a1a10'; $barro = '#b8642e'; $claro = '#d8874a'; $escuro = '#7a3e1a'; $ouro = '#f0c75e'; $ouroE = '#b88a2a'
  # contorno do corpo (barriga redonda)
  Pinta-Pixel $cont 9 9 14 1;  Pinta-Pixel $cont 7 10 18 1; Pinta-Pixel $cont 5 11 22 2; Pinta-Pixel $cont 4 13 24 11; Pinta-Pixel $cont 5 24 22 2; Pinta-Pixel $cont 7 26 18 2; Pinta-Pixel $cont 9 28 14 1
  # corpo
  Pinta-Pixel $barro 8 11 16 1; Pinta-Pixel $barro 6 12 20 1; Pinta-Pixel $barro 5 13 22 11; Pinta-Pixel $barro 6 24 20 1; Pinta-Pixel $barro 8 25 16 2; Pinta-Pixel $barro 10 27 12 1
  # sombra (luz vem da esquerda)
  Pinta-Pixel $escuro 21 14 5 10; Pinta-Pixel $escuro 18 24 7 1; Pinta-Pixel $escuro 17 25 6 2
  # brilho
  Pinta-Pixel $claro 7 14 3 6; Pinta-Pixel $claro 8 13 4 1; Pinta-Pixel $claro 10 15 1 2
  # faixa pintada (enfeite de cordel)
  Pinta-Pixel $cont 5 18 22 1; Pinta-Pixel $ouroE 6 19 20 1; Pinta-Pixel $cont 5 20 22 1
  # pescoço e boca
  Pinta-Pixel $cont 11 4 10 6; Pinta-Pixel $barro 12 5 8 4; Pinta-Pixel $escuro 17 5 3 4; Pinta-Pixel $cont 10 3 12 2; Pinta-Pixel $claro 11 3 10 1
  # moedas saindo da boca
  Pinta-Pixel $cont 12 0 5 4; Pinta-Pixel $ouro 13 1 3 2; Pinta-Pixel $cont 17 1 5 4; Pinta-Pixel $ouro 18 2 3 2; Pinta-Pixel $ouroE 19 3 2 1
  Pinta-Pixel '#fff3b0' 13 1 1 1; Pinta-Pixel '#fff3b0' 18 2 1 1
  # moedas no chão
  Pinta-Pixel $cont 24 26 7 5; Pinta-Pixel $ouro 25 27 5 3; Pinta-Pixel '#fff3b0' 25 27 1 1; Pinta-Pixel $ouroE 27 29 3 1
  $g.Dispose()
  return $b
}
$base = Desenhar-Botija
$tamanhos = 16, 24, 32, 48, 64, 128, 256
$pngs = @()
foreach ($t in $tamanhos) {
  $bm = New-Object System.Drawing.Bitmap $t, $t
  $gg = [System.Drawing.Graphics]::FromImage($bm)
  $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $gg.DrawImage($base, 0, 0, $t, $t)
  $gg.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $bm.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngs += , $ms.ToArray()
  $bm.Dispose()
}
$base.Save((Join-Path $raiz 'docs\icone.png'), [System.Drawing.Imaging.ImageFormat]::Png)
# arquivo .ico com as imagens PNG dentro (o Windows aceita desde o Vista)
$ico = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $ico
$w.Write([UInt16]0); $w.Write([UInt16]1); $w.Write([UInt16]$tamanhos.Count)
$offset = 6 + 16 * $tamanhos.Count
for ($i = 0; $i -lt $tamanhos.Count; $i++) {
  $t = $tamanhos[$i]; $lado = if ($t -ge 256) { 0 } else { $t }
  $w.Write([Byte]$lado); $w.Write([Byte]$lado); $w.Write([Byte]0); $w.Write([Byte]0)
  $w.Write([UInt16]1); $w.Write([UInt16]32); $w.Write([UInt32]$pngs[$i].Length); $w.Write([UInt32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $w.Write($p) }
$w.Flush()
$icoArq = Join-Path $obra 'icone.ico'
[System.IO.File]::WriteAllBytes($icoArq, $ico.ToArray())

# ---------- 2. o jogo num zip (vai dentro do .exe) ----------
$zipArq = Join-Path $obra 'jogo.zip'
$fs = [System.IO.File]::Open($zipArq, 'Create')
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
$arquivos = @(Get-Item (Join-Path $raiz 'index.html')) + @(Get-ChildItem -Recurse -File (Join-Path $raiz 'css')) + @(Get-ChildItem -Recurse -File (Join-Path $raiz 'js'))
foreach ($a in $arquivos) {
  $nome = $a.FullName.Substring($raiz.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $a.FullName, $nome, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$zip.Dispose(); $fs.Dispose()

# ---------- 3. compila ----------
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) { $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe' }
$saida = Join-Path $raiz 'dist\A-Botija-de-Santa-Isabel.exe'
& $csc /nologo /target:winexe /optimize+ /codepage:65001 "/win32icon:$icoArq" "/resource:$zipArq,jogo.zip" `
  /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /r:System.Windows.Forms.dll `
  "/out:$saida" (Join-Path $raiz 'tools\exe\lancador.cs')
if ($LASTEXITCODE -ne 0) { throw 'O compilador reclamou (veja acima).' }
Remove-Item -Recurse -Force (Join-Path $raiz '_tmp')
'Pronto: {0} ({1:N0} KB, {2} arquivos do jogo dentro)' -f $saida, ((Get-Item $saida).Length / 1KB), $arquivos.Count
