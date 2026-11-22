# =========================================================
# embutir_imagens.ps1 — converte PNGs em um arquivo .js
# (o jogo abre com dois cliques em file://, e o navegador não
# deixa ler os pixels de um PNG solto; dentro do .js pode).
#
# Uso:  powershell -File tools\embutir_imagens.ps1 -Lista lista.txt -Saida js\data\imagens_kenney.js
# lista.txt: uma linha por imagem →  nome|caminho\do\arquivo.png|tamanho
#   (tamanho = lado final em pixels; 0 = não muda)
# =========================================================
param(
  [Parameter(Mandatory = $true)][string]$Lista,
  [Parameter(Mandatory = $true)][string]$Saida,
  [string]$Titulo = 'imagens'
)
Add-Type -AssemblyName System.Drawing
$linhas = Get-Content -LiteralPath $Lista -Encoding UTF8 | Where-Object { $_ -and -not $_.StartsWith('#') }
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('/* ' + $Titulo + ' — gerado por tools/embutir_imagens.ps1. NÃO edite à mão. */')
[void]$sb.AppendLine('BSI.imagensDados = BSI.imagensDados || {};')
foreach ($l in $linhas) {
  $p = $l.Split('|'); $nome = $p[0]; $arq = $p[1]; $tam = [int]$p[2]
  $img = [System.Drawing.Image]::FromFile($arq)
  try {
    if ($tam -gt 0 -and ($img.Width -ne $tam -or $img.Height -ne $tam)) {
      $bmp = New-Object System.Drawing.Bitmap $tam, $tam, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.Clear([System.Drawing.Color]::Transparent)
      $g.DrawImage($img, 0, 0, $tam, $tam)
      $g.Dispose()
    } else { $bmp = New-Object System.Drawing.Bitmap $img }
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $b64 = [Convert]::ToBase64String($ms.ToArray())
    $ms.Dispose(); $bmp.Dispose()
  } finally { $img.Dispose() }
  [void]$sb.AppendLine("BSI.imagensDados['" + $nome + "'] = 'data:image/png;base64," + $b64 + "';")
}
[System.IO.File]::WriteAllText($Saida, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))
Write-Output ("ok: " + $linhas.Count + " imagens -> " + $Saida + " (" + [Math]::Round((Get-Item -LiteralPath $Saida).Length / 1024) + " KB)")
