import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  Sparkles,
  Activity,
  Zap,
  Globe,
  Share2,
  RefreshCw,
  AlertTriangle,
  Hexagon,
  Terminal,
  Fingerprint,
  Dices,
  Check,
  Shield,
  FileText,
  Cookie,
  Info,
} from 'lucide-react';

const callGeminiAPI = async (decision) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error || `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (!data?.timelines || !Array.isArray(data.timelines)) {
    throw new Error(data?.error || 'Ungültige Antwort vom Server.');
  }

  return data;
};

const FooterLink = ({ href, icon: Icon, children }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 transition hover:border-purple-500/40 hover:bg-white/10 hover:text-white"
  >
    <Icon size={14} />
    <span>{children}</span>
  </a>
);

export default function App() {
  const [step, setStep] = useState('input');
  const [decision, setDecision] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    document.title = 'NEXUS.core | Multiversum Simulator';
  }, []);

  const fillRandom = () => {
    const randomInputs = [
      'Ich habe heute meinem Chef widersprochen',
      'Ich habe Salz statt Zucker in den Kaffee getan',
      "Ich habe dem Busfahrer nicht 'Danke' gesagt",
      'Ich habe heute Morgen nach links statt nach rechts gewischt',
      'Ich habe einen mysteriösen USB-Stick auf der Straße gefunden',
      'Ich habe den großen roten Knopf gedrückt',
    ];
    setDecision(randomInputs[Math.floor(Math.random() * randomInputs.length)]);
  };

  const handleShare = async (timeline) => {
    const shareText = `🦋 NEXUS Multiversum:\nIch habe simuliert: "${results.original}".\n\nMeine Zukunft: ${timeline.title} (${timeline.probability}).\n\nTeste es hier: ${window.location.origin}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(timeline.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(null);
    }
  };

  const analyzeMultiverse = async (e) => {
    e.preventDefault();
    if (decision.trim().length < 5) return;

    setStep('analyzing');
    setLoadingProgress(0);
    setErrorMsg(null);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 300);

    try {
      const geminiData = await callGeminiAPI(decision);

      clearInterval(progressInterval);
      setLoadingProgress(100);

      const colorMap = {
        ALPHA: {
          color: 'from-emerald-500 to-teal-700',
          textColor: 'text-emerald-400',
        },
        BETA: {
          color: 'from-amber-500 to-orange-700',
          textColor: 'text-amber-400',
        },
        OMEGA: {
          color: 'from-fuchsia-600 to-purple-900',
          textColor: 'text-fuchsia-400',
        },
      };

      const mappedTimelines = geminiData.timelines.map((tl, index) => {
        const mappedId = ['ALPHA', 'BETA', 'OMEGA'][index] || tl.id || 'UNKNOWN';
        const colors = colorMap[mappedId] || colorMap.ALPHA;

        let formattedProb = '';
        try {
          const num = parseFloat(String(tl.probability).replace(',', '.'));
          if (!Number.isNaN(num)) {
            if (num >= 1) {
              formattedProb = `${num.toFixed(1)}%`;
            } else if (num >= 0.01) {
              formattedProb = `${num.toFixed(2)}%`;
            } else {
              const safeNum = num === 0 ? 0.0000001 : num;
              const chance = 100 / safeNum;

              if (chance >= 1e18) formattedProb = `1 zu ${(chance / 1e18).toFixed(1)} Trill.`;
              else if (chance >= 1e15) formattedProb = `1 zu ${(chance / 1e15).toFixed(1)} Brd.`;
              else if (chance >= 1e12) formattedProb = `1 zu ${(chance / 1e12).toFixed(1)} Bio.`;
              else if (chance >= 1e9) formattedProb = `1 zu ${(chance / 1e9).toFixed(1)} Mrd.`;
              else if (chance >= 1e6) formattedProb = `1 zu ${(chance / 1e6).toFixed(1)} Mio.`;
              else if (chance >= 1e3) formattedProb = `1 zu ${Math.round(chance / 1e3)} Tsd.`;
              else formattedProb = `1 zu ${Math.round(chance)}`;
            }
          } else {
            formattedProb = 'Anomalie';
          }
        } catch {
          formattedProb = 'Anomalie';
        }

        return {
          id: mappedId,
          type: tl.type,
          color: colors.color,
          textColor: colors.textColor,
          probability: formattedProb,
          exactProbability: `Exakte mathematische Chance: ${tl.probability}%`,
          title: tl.title,
          desc: tl.desc,
        };
      });

      setResults({ original: decision, timelines: mappedTimelines });
      setTimeout(() => setStep('results'), 300);
    } catch (error) {
      clearInterval(progressInterval);
      setLoadingProgress(0);
      setStep('input');
      setErrorMsg(error.message || 'Die KI-Antwort konnte nicht geladen werden.');
    }
  };

  const resetSimulator = () => {
    setDecision('');
    setStep('input');
    setResults(null);
    setErrorMsg(null);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#050505] font-sans text-slate-200 selection:bg-purple-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-purple-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-900/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button className="flex items-center gap-2" onClick={resetSimulator}>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-blue-600">
              <Hexagon size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              NEXUS<span className="font-light text-purple-500">.core</span>
            </h1>
          </button>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="hidden items-center gap-1 sm:flex">
              <Activity size={12} /> V 3.0.0
            </span>
            <span className="hidden items-center gap-1 text-emerald-500 sm:flex">
              <Zap size={12} /> System Online
            </span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-6">
        <div className="flex h-[50px] w-full items-center justify-center rounded-lg border border-slate-800/50 bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-600 sm:h-[90px] sm:text-xs">
          AdSense-Platzhalter – erst nach CMP-Setup + Freigabe aktivieren
        </div>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center p-4 sm:p-6 md:p-8">
        {step === 'input' && (
          <div className="mx-auto mt-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 sm:mt-0">
            <div className="mb-8 space-y-4 text-center sm:mb-10">
              <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3">
                <GitBranch className="h-8 w-8 text-purple-400" />
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Der Schmetterlingseffekt.
              </h2>
              <p className="px-2 text-base leading-relaxed text-slate-400 sm:text-lg md:text-xl">
                Jede winzige Entscheidung spaltet das Universum in Tausende alternative Realitäten.
                Was hast du heute getan?
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-widest text-emerald-200">
                <Shield size={16} /> Wichtiger Unterschied zum alten Stand
              </div>
              Die KI-Anfrage läuft hier über <strong>deinen Server</strong> unter <code>/api/gemini</code>.
              Dein Gemini-Key liegt dadurch nicht mehr offen im Frontend.
            </div>

            {errorMsg && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-center text-sm text-red-400 animate-in fade-in">
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={analyzeMultiverse} className="space-y-6">
              <div className="group relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-40" />
                <div className="relative flex flex-col items-stretch gap-2 rounded-2xl border border-white/10 bg-[#0f0f13] p-2 shadow-2xl sm:flex-row sm:items-center sm:gap-0">
                  <Terminal className="ml-3 hidden shrink-0 text-purple-500 sm:block" size={20} />
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="Z.B.: Ich habe einen Kaffee statt Tee getrunken..."
                    className="w-full bg-transparent px-3 py-4 text-base text-white placeholder:text-slate-600 focus:outline-none sm:px-4 sm:text-lg lg:text-xl"
                    autoFocus
                    required
                    minLength={5}
                  />
                  <button
                    type="button"
                    onClick={fillRandom}
                    className="mx-2 flex shrink-0 items-center justify-center border-l border-white/5 p-4 text-slate-500 transition-colors hover:text-purple-400"
                    title="Zufällige Aktion"
                  >
                    <Dices size={24} />
                  </button>
                  <button
                    type="submit"
                    disabled={decision.length < 5 || step === 'analyzing'}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 font-bold text-black transition-all hover:bg-purple-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black sm:w-auto sm:px-6"
                  >
                    <span>KI-Simulation ✨</span>
                    <Sparkles size={16} className="sm:h-[18px] sm:w-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 px-2 text-[10px] text-slate-500 sm:gap-3 sm:text-xs">
                <span className="mb-1 w-full text-center sm:mb-0 sm:w-auto">Beliebte Simulationen:</span>
                {['Ich habe den Wecker ignoriert', 'Ich habe gelogen', 'Ich bin zu Fuß gegangen'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDecision(suggestion)}
                      className="rounded-full border border-white/5 bg-white/5 px-3 py-1.5 transition-colors hover:border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-300"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </form>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="mx-auto max-w-md py-20 text-center animate-in zoom-in duration-300">
            <div className="relative mx-auto mb-8 h-32 w-32">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <div className="absolute inset-4 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-4 border-blue-500 border-b-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Fingerprint size={32} className="animate-pulse text-white" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">Kalkuliere Fraktale</h3>
            <p className="mb-6 h-6 text-sm font-mono text-slate-400">
              {loadingProgress < 30
                ? 'Scanne Quanten-Wahrscheinlichkeiten...'
                : loadingProgress < 60
                  ? 'Berechne Kettenreaktionen...'
                  : loadingProgress < 90
                    ? 'Analysiere Multiversum-Stränge...'
                    : 'Kollabiere Wellenfunktion...'}
            </p>
            <div className="mb-2 h-2 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-500">{loadingProgress}% COMPLETE</span>
          </div>
        )}

        {step === 'results' && results && (
          <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 sm:mt-0">
            <div className="mb-8 px-2 text-center sm:mb-12">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 sm:text-sm">
                Die Initiale Anomalie
              </p>
              <h2 className="break-words text-xl font-black italic text-white sm:text-3xl md:text-4xl">
                "{results.original}"
              </h2>
            </div>

            <div className="relative mb-8 grid grid-cols-1 gap-5 sm:mb-12 sm:gap-6 lg:grid-cols-3">
              <div className="absolute left-0 top-1/2 z-0 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-slate-800 via-purple-500/30 to-slate-800 lg:block" />

              {results.timelines.map((timeline, index) => (
                <div
                  key={timeline.id}
                  className="group relative z-10 flex flex-col rounded-2xl border border-white/5 bg-[#0f0f13] p-5 shadow-2xl transition-transform duration-500 lg:hover:-translate-y-2 sm:p-6 md:p-8"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-gradient-to-r ${timeline.color} opacity-50 transition-opacity lg:group-hover:opacity-100`} />
                  <div className="mb-4 flex items-start justify-between gap-2 sm:mb-6">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className={`mb-1 inline-block rounded bg-white/5 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${timeline.textColor} sm:mb-2 sm:text-[10px]`}>
                        STRANG {timeline.id}
                      </span>
                      <h3 className="mt-1 text-base font-bold leading-tight text-white sm:text-lg lg:text-xl">
                        {timeline.title}
                      </h3>
                    </div>
                    <div className="max-w-[50%] shrink-0 text-right">
                      <span
                        className="inline-block break-words border-b border-dashed border-white/40 pb-0.5 text-base font-black leading-tight text-white transition-colors hover:border-white sm:text-lg xl:text-xl"
                        title={timeline.exactProbability}
                      >
                        {timeline.probability}
                      </span>
                      <span className="mt-1 block text-[8px] font-bold uppercase tracking-widest text-slate-500">
                        Wahrscheinlichkeit
                      </span>
                    </div>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-300 sm:text-base">{timeline.desc}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 sm:mt-8">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 sm:text-xs">
                      <Globe size={14} /> {timeline.type}
                    </span>
                    <button
                      onClick={() => handleShare(timeline)}
                      className="flex items-center gap-2 rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
                      title="Ergebnis kopieren"
                    >
                      {copiedId === timeline.id ? (
                        <>
                          <Check size={16} className="text-emerald-400" />
                          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-emerald-400 sm:inline">
                            Kopiert!
                          </span>
                        </>
                      ) : (
                        <Share2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 px-4 text-center sm:mt-16 sm:gap-6">
              <button
                onClick={resetSimulator}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-700 bg-transparent px-6 py-3 font-bold text-white transition-all hover:border-purple-500 hover:bg-purple-500/10 sm:w-auto sm:px-8 sm:py-4"
              >
                <RefreshCw size={18} className="transition-transform duration-700 group-hover:rotate-180" />
                <span>Neue Entscheidung simulieren ✨</span>
              </button>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-center text-[10px] text-slate-600 sm:flex-row sm:rounded-full sm:text-left sm:text-xs">
                <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                <span>Warnung: Die Beobachtung einer Zeitlinie kann diese zur Realität machen.</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-8 border-t border-slate-800/50 bg-[#0a0a0c] py-6 sm:mt-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4">
          <div className="grid w-full gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-widest text-white">
                <Shield size={16} /> AdSense / Datenschutz
              </div>
              Dieses Starterpaket ist auf Österreich + EWR ausgelegt: Impressum/Datenschutz als echte Unterseiten,
              serverseitiger Gemini-Proxy und Platzhalter für eine Google-zertifizierte CMP.
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-bold uppercase tracking-widest text-white">
                <Info size={16} /> Noch zu ersetzen
              </div>
              Ersetze vor Livegang die Platzhalter für Cookiebot-Domain-ID, Publisher-ID und prüfe die Rechtstexte noch
              einmal mit deinen echten finalen Daten.
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <FooterLink href="/impressum" icon={FileText}>Impressum</FooterLink>
            <FooterLink href="/datenschutz" icon={Shield}>Datenschutz</FooterLink>
            <FooterLink href="/cookies" icon={Cookie}>Cookies</FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
