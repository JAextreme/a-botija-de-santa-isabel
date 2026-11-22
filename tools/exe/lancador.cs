// =========================================================
// lancador.cs — o .exe da Botija de Santa Isabel.
// O jogo inteiro vai DENTRO do .exe (recurso "jogo.zip").
// Ao abrir: copia o jogo pra %LOCALAPPDATA%\BotijaSantaIsabel
// (só na primeira vez ou quando a versão muda) e abre numa
// janela própria do Edge (modo aplicativo: sem barra, sem abas).
// Os saves ficam no perfil próprio do jogo, e continuam lá
// entre uma partida e outra.
// Compila com o csc.exe que já vem no Windows (tools\criar_exe.ps1).
// =========================================================
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("A Botija de Santa Isabel")]
[assembly: AssemblyProduct("A Botija de Santa Isabel")]
[assembly: AssemblyDescription("Aventura de ação do sertão")]
[assembly: AssemblyCompany("José Neto")]
[assembly: AssemblyCopyright("Criado por José Neto")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

static class Lancador
{
    const string VERSAO = "1.0";
    const string TITULO = "A Botija de Santa Isabel";

    [STAThread]
    static void Main()
    {
        try
        {
            string baseDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "BotijaSantaIsabel");
            string jogo = Path.Combine(baseDir, "jogo");
            string perfil = Path.Combine(baseDir, "perfil");
            string marca = Path.Combine(jogo, "versao.txt");

            if (!File.Exists(marca) || File.ReadAllText(marca).Trim() != VERSAO)
                Extrair(jogo, marca);

            string index = Path.Combine(jogo, "index.html");
            string url = new Uri(index).AbsoluteUri;

            string nav = Achar("msedge.exe", new string[] {
                @"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe",
                @"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe",
                @"%LocalAppData%\Microsoft\Edge\Application\msedge.exe" });
            if (nav == null)
                nav = Achar("chrome.exe", new string[] {
                    @"%ProgramFiles%\Google\Chrome\Application\chrome.exe",
                    @"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe",
                    @"%LocalAppData%\Google\Chrome\Application\chrome.exe" });

            if (nav != null)
            {
                string args = "--app=\"" + url + "\"" +
                              " --user-data-dir=\"" + perfil + "\"" +
                              " --no-first-run --no-default-browser-check" +
                              " --autoplay-policy=no-user-gesture-required" +
                              " --disable-features=Translate" +
                              " --start-maximized";
                ProcessStartInfo psi = new ProcessStartInfo(nav, args);
                psi.UseShellExecute = false;
                Process.Start(psi);
            }
            else
            {
                // sem Edge nem Chrome: abre no navegador padrão mesmo
                Process.Start(index);
            }
        }
        catch (Exception e)
        {
            MessageBox.Show("Não deu pra abrir o jogo:\n\n" + e.Message +
                "\n\nTente o zip: extraia e dê dois cliques no index.html.",
                TITULO, MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    // copia o jogo de dentro do .exe pra pasta do usuário
    static void Extrair(string jogo, string marca)
    {
        string novo = jogo + ".novo";
        if (Directory.Exists(novo)) Directory.Delete(novo, true);
        Directory.CreateDirectory(novo);
        using (Stream s = Assembly.GetExecutingAssembly().GetManifestResourceStream("jogo.zip"))
        using (ZipArchive zip = new ZipArchive(s, ZipArchiveMode.Read))
        {
            foreach (ZipArchiveEntry e in zip.Entries)
            {
                string nome = e.FullName.Replace('\\', '/');
                if (nome.EndsWith("/")) continue;
                string destino = Path.GetFullPath(Path.Combine(novo, nome.Replace('/', Path.DirectorySeparatorChar)));
                if (!destino.StartsWith(Path.GetFullPath(novo))) continue; // nunca escreve fora da pasta
                Directory.CreateDirectory(Path.GetDirectoryName(destino));
                using (Stream de = e.Open())
                using (FileStream para = File.Create(destino))
                    de.CopyTo(para);
            }
        }
        File.WriteAllText(Path.Combine(novo, "versao.txt"), VERSAO);
        if (Directory.Exists(jogo)) Directory.Delete(jogo, true);
        Directory.Move(novo, jogo);
    }

    static string Achar(string exe, string[] caminhos)
    {
        foreach (RegistryKey raiz in new RegistryKey[] { Registry.CurrentUser, Registry.LocalMachine })
        {
            using (RegistryKey k = raiz.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\" + exe))
            {
                if (k != null)
                {
                    string p = k.GetValue("") as string;
                    if (!string.IsNullOrEmpty(p) && File.Exists(p.Trim('"'))) return p.Trim('"');
                }
            }
        }
        foreach (string c in caminhos)
        {
            string p = Environment.ExpandEnvironmentVariables(c);
            if (File.Exists(p)) return p;
        }
        return null;
    }
}
