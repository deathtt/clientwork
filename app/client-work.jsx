import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Star, Briefcase, ChevronRight, RotateCcw, Check } from "lucide-react";

/* ============================= DATA ============================= */

const PALETTES = [
  { name: "Ink & Paper", colors: ["#1C1B19", "#EDE9E0", "#8A8578"] },
  { name: "Signal Blue", colors: ["#12203D", "#EAF0FA", "#3A5A8C"] },
  { name: "Terracotta", colors: ["#3A241C", "#FBF1E7", "#C1442D"] },
  { name: "Forest", colors: ["#132318", "#EEF3EC", "#2E6B4F"] },
  { name: "Sunbeam", colors: ["#2A2210", "#FFF8E4", "#E3A72F"] },
  { name: "Neon Night", colors: ["#0B0B14", "#E8E6FF", "#7C5CFF"] },
  { name: "Rosewater", colors: ["#2E1620", "#FDF0F2", "#D65D7A"] },
  { name: "Slate Mint", colors: ["#1A2226", "#EAF5F2", "#3FA88A"] },
  { name: "Blush Gold", colors: ["#241C14", "#FBF2E3", "#B8863B"] },
  { name: "Deep Sea", colors: ["#08161C", "#E4F1F5", "#1C7FA6"] },
];

const FONTS = [
  { name: "Fraunces", stack: "'Fraunces', serif", mood: "editorial" },
  { name: "Space Grotesk", stack: "'Space Grotesk', sans-serif", mood: "technical" },
  { name: "Instrument Serif", stack: "'Instrument Serif', serif", mood: "literary" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", mood: "luxury" },
  { name: "JetBrains Mono", stack: "'JetBrains Mono', monospace", mood: "utilitarian" },
  { name: "Inter", stack: "'Inter', sans-serif", mood: "neutral" },
];

const LAYOUTS = [
  { id: "centered", label: "Centered" },
  { id: "left-align", label: "Left-aligned" },
  { id: "split", label: "Split" },
  { id: "full-bleed", label: "Full-bleed" },
];

// Each client: brief + the "correct" attributes the brief implies.
const CLIENTS = [
  {
    id: 1, tier: 1, pay: 150,
    name: "Fernwood Tea Co.", type: "Packaging label",
    brief: "Small-batch loose-leaf tea. Wants it to feel calm, natural, a little old-fashioned. Nothing loud.",
    likes: { palette: ["Forest", "Ink & Paper"], font: ["Instrument Serif", "Fraunces"], layout: ["centered", "left-align"] },
    dislikes: { palette: ["Neon Night"], font: ["Space Grotesk", "JetBrains Mono"] },
  },
  {
    id: 2, tier: 1, pay: 175,
    name: "Ledger", type: "App icon + wordmark",
    brief: "Personal finance app for young professionals. Trustworthy but not boring bank-blue. Modern, sharp.",
    likes: { palette: ["Signal Blue", "Deep Sea", "Slate Mint"], font: ["Space Grotesk", "Inter"], layout: ["left-align", "split"] },
    dislikes: { palette: ["Sunbeam", "Rosewater"], font: ["Playfair Display", "Instrument Serif"] },
  },
  {
    id: 3, tier: 2, pay: 220,
    name: "Marisol", type: "Restaurant menu cover",
    brief: "Upscale Spanish tapas restaurant. Wants warmth, appetite appeal, a bit of romance — not corporate.",
    likes: { palette: ["Terracotta", "Blush Gold", "Sunbeam"], font: ["Playfair Display", "Fraunces"], layout: ["centered", "full-bleed"] },
    dislikes: { palette: ["Neon Night", "Signal Blue"], font: ["JetBrains Mono"] },
  },
  {
    id: 4, tier: 2, pay: 240,
    name: "Cargo//Run", type: "Sneaker drop poster",
    brief: "Streetwear sneaker launch. Loud, kinetic, made for a 19-year-old's camera roll. Go big.",
    likes: { palette: ["Neon Night", "Sunbeam"], font: ["Space Grotesk", "JetBrains Mono"], layout: ["full-bleed", "split"] },
    dislikes: { palette: ["Ink & Paper", "Rosewater"], font: ["Instrument Serif", "Playfair Display"] },
  },
  {
    id: 5, tier: 3, pay: 300,
    name: "Halcyon Clinic", type: "Wayfinding signage",
    brief: "Private mental health clinic. Must feel safe, quiet, human — the opposite of a hospital.",
    likes: { palette: ["Slate Mint", "Rosewater", "Forest"], font: ["Instrument Serif", "Inter"], layout: ["centered", "left-align"] },
    dislikes: { palette: ["Neon Night", "Sunbeam"], font: ["JetBrains Mono", "Space Grotesk"] },
  },
  {
    id: 6, tier: 3, pay: 320,
    name: "Northgate Capital", type: "Pitch deck cover",
    brief: "Series B fundraising deck for infrastructure investors. Serious money, zero gimmicks.",
    likes: { palette: ["Ink & Paper", "Deep Sea", "Signal Blue"], font: ["Space Grotesk", "Inter"], layout: ["left-align", "split"] },
    dislikes: { palette: ["Sunbeam", "Rosewater", "Neon Night"], font: ["Playfair Display"] },
  },
  {
    id: 7, tier: 4, pay: 400,
    name: "Void Records", type: "Vinyl sleeve",
    brief: "Experimental electronic label. Cold, strange, a little unsettling. Should not feel friendly.",
    likes: { palette: ["Neon Night", "Deep Sea"], font: ["JetBrains Mono", "Space Grotesk"], layout: ["full-bleed"] },
    dislikes: { palette: ["Sunbeam", "Blush Gold", "Rosewater"], font: ["Playfair Display", "Instrument Serif"] },
  },
  {
    id: 8, tier: 4, pay: 450,
    name: "Almanac Press", type: "Book jacket",
    brief: "Literary fiction debut novel. Wants it to feel timeless — could sit on a shelf in 1975 or 2045.",
    likes: { palette: ["Ink & Paper", "Blush Gold", "Terracotta"], font: ["Instrument Serif", "Fraunces"], layout: ["centered", "left-align"] },
    dislikes: { palette: ["Neon Night", "Sunbeam"], font: ["JetBrains Mono", "Space Grotesk"] },
  },
];

const TIER_TIME = { 1: 40, 2: 34, 3: 28, 4: 22 };

/* ============================= SCORING ============================= */

function scoreRound(client, pick) {
  let pts = 0;
  const notes = [];

  if (client.likes.palette.includes(pick.paletteName)) { pts += 34; notes.push({ ok: true, text: `${pick.paletteName} reads exactly right for this brief.` }); }
  else if (client.dislikes.palette.includes(pick.paletteName)) { pts -= 10; notes.push({ ok: false, text: `${pick.paletteName} fights the brief — wrong temperature entirely.` }); }
  else { pts += 14; notes.push({ ok: null, text: `${pick.paletteName} is safe, if a little generic here.` }); }

  if (client.likes.font.includes(pick.fontName)) { pts += 34; notes.push({ ok: true, text: `${pick.fontName} nails the voice they asked for.` }); }
  else if (client.dislikes.font.includes(pick.fontName)) { pts -= 10; notes.push({ ok: false, text: `${pick.fontName} sends the wrong signal for this client.` }); }
  else { pts += 14; notes.push({ ok: null, text: `${pick.fontName} works, doesn't sing.` }); }

  if (client.likes.layout.includes(pick.layoutId)) { pts += 22; notes.push({ ok: true, text: `Layout matches how this should be read.` }); }
  else { pts += 8; notes.push({ ok: null, text: `Layout is functional, not tailored.` }); }

  pts = Math.max(0, Math.min(100, pts));
  return { pts, notes };
}

function grade(pts) {
  if (pts >= 92) return { letter: "A+", color: "#2E6B4F" };
  if (pts >= 84) return { letter: "A", color: "#2E6B4F" };
  if (pts >= 74) return { letter: "B", color: "#3A5A8C" };
  if (pts >= 60) return { letter: "C", color: "#B8863B" };
  if (pts >= 40) return { letter: "D", color: "#C1442D" };
  return { letter: "F", color: "#C1442D" };
}

/* ============================= APP SHELL ============================= */

export default function ClientWork() {
  const [screen, setScreen] = useState("title"); // title | brief | studio | stamp | results | gameover
  const [clientIdx, setClientIdx] = useState(0);
  const [cash, setCash] = useState(0);
  const [portfolio, setPortfolio] = useState([]); // {client, pts, letter}
  const [lastResult, setLastResult] = useState(null);

  const client = CLIENTS[clientIdx];

  const startClient = () => setScreen("brief");
  const beginStudio = () => setScreen("studio");

  const finishRound = (pick) => {
    const { pts, notes } = scoreRound(client, pick);
    const g = grade(pts);
    const earned = g.letter === "F" ? 0 : Math.round(client.pay * (pts / 100));
    setLastResult({ pts, notes, grade: g, pick, earned });
    setCash((c) => c + earned);
    setPortfolio((p) => [...p, { name: client.name, letter: g.letter, pts }]);
    setScreen("stamp");
  };

  const nextClient = () => {
    if (clientIdx + 1 >= CLIENTS.length) {
      setScreen("gameover");
    } else {
      setClientIdx((i) => i + 1);
      setScreen("brief");
    }
  };

  const restart = () => {
    setScreen("title"); setClientIdx(0); setCash(0); setPortfolio([]); setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-[#EDE9E0] text-[#1C1B19]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Space+Grotesk:wght@500;600&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');
        .f-display { font-family: 'Instrument Serif', serif; }
        .f-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes stampIn { 0% { transform: scale(3) rotate(-18deg); opacity: 0; } 60% { transform: scale(0.95) rotate(-8deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); opacity: 1; } }
        .stamp-anim { animation: stampIn 0.55s cubic-bezier(.2,.9,.25,1.2) forwards; }
        @keyframes riseIn { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform: translateY(0);} }
        .rise { animation: riseIn 0.4s ease forwards; }
        ::selection { background: #C1442D; color: white; }
      `}</style>

      {screen === "title" && <Title onStart={() => setScreen("brief")} />}
      {screen === "brief" && (
        <BriefScreen client={client} clientNum={clientIdx + 1} total={CLIENTS.length} cash={cash} onAccept={beginStudio} />
      )}
      {screen === "studio" && (
        <Studio client={client} onSubmit={finishRound} />
      )}
      {screen === "stamp" && lastResult && (
        <StampScreen result={lastResult} client={client} onContinue={() => setScreen("results")} />
      )}
      {screen === "results" && lastResult && (
        <ResultsScreen result={lastResult} client={client} cash={cash} onNext={nextClient} isLast={clientIdx + 1 >= CLIENTS.length} />
      )}
      {screen === "gameover" && (
        <GameOver portfolio={portfolio} cash={cash} onRestart={restart} />
      )}
    </div>
  );
}

/* ============================= TITLE ============================= */

function Title({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 rise">
        <div className="f-mono text-xs tracking-[0.3em] text-[#8A8578] mb-4">A FREELANCE DESIGN SIM</div>
        <h1 className="f-display text-6xl sm:text-8xl italic leading-none">Client Work</h1>
      </div>
      <p className="max-w-md text-[#4A473F] leading-relaxed mb-10 rise" style={{ animationDelay: "0.1s", opacity: 0 }}>
        Read the brief. Pick the palette, the type, the layout. Get graded.
        Build a reputation, one difficult client at a time.
      </p>
      <button
        onClick={onStart}
        className="rise inline-flex items-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-7 py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        style={{ animationDelay: "0.2s", opacity: 0 }}
      >
        Take your first client <ChevronRight size={16} />
      </button>
      <div className="mt-14 f-mono text-[10px] tracking-widest text-[#8A8578] rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
        {CLIENTS.length} CLIENTS · 4 TIERS · GRADED A+ TO F
      </div>
    </div>
  );
}

/* ============================= BRIEF ============================= */

function BriefScreen({ client, clientNum, total, cash, onAccept }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <TopBar clientNum={clientNum} total={total} cash={cash} />
      <div className="max-w-md w-full rise">
        <div className="bg-white border border-[#D8D2C4] rounded-2xl shadow-[0_2px_0_#D8D2C4] p-7 relative">
          <div className="absolute -top-3 left-7 bg-[#C1442D] text-white text-[10px] f-mono px-2.5 py-1 rounded-sm tracking-wider">
            NEW BRIEF
          </div>
          <div className="f-mono text-[10px] tracking-widest text-[#8A8578] mb-1">
            TIER {client.tier} · ${client.pay} BUDGET
          </div>
          <h2 className="f-display text-3xl mb-1">{client.name}</h2>
          <div className="text-sm text-[#8A8578] mb-5">{client.type}</div>
          <p className="text-[#3A362E] leading-relaxed">{client.brief}</p>
        </div>
        <button
          onClick={onAccept}
          className="w-full mt-5 bg-[#1C1B19] text-[#EDE9E0] py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors flex items-center justify-center gap-2"
        >
          Start designing <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function TopBar({ clientNum, total, cash }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 f-mono text-xs text-[#4A473F]">
      <div className="flex items-center gap-1.5"><Briefcase size={13} /> CLIENT {clientNum} / {total}</div>
      <div className="flex items-center gap-1.5">${cash} EARNED</div>
    </div>
  );
}

/* ============================= STUDIO ============================= */

function Studio({ client, onSubmit }) {
  const time = TIER_TIME[client.tier] || 30;
  const [secondsLeft, setSecondsLeft] = useState(time);
  const [paletteIdx, setPaletteIdx] = useState(null);
  const [fontIdx, setFontIdx] = useState(null);
  const [layoutId, setLayoutId] = useState(null);
  const submittedRef = useRef(false);

  const palette = paletteIdx !== null ? PALETTES[paletteIdx] : null;
  const font = fontIdx !== null ? FONTS[fontIdx] : null;

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit({
      paletteName: palette ? palette.name : "Ink & Paper",
      fontName: font ? font.name : "Inter",
      layoutId: layoutId || "centered",
    });
  };

  useEffect(() => {
    if (secondsLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [secondsLeft]);

  const pct = secondsLeft / time;
  const urgent = pct < 0.25;

  return (
    <div className="min-h-screen pb-10">
      <div className="sticky top-0 z-20 bg-[#EDE9E0]/95 backdrop-blur border-b border-[#D8D2C4] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <div>
          <div className="f-mono text-[10px] text-[#8A8578] tracking-widest">{client.name.toUpperCase()}</div>
          <div className="text-sm font-medium">{client.type}</div>
        </div>
        <div className={`flex items-center gap-2 f-mono text-sm font-medium ${urgent ? "text-[#C1442D]" : "text-[#1C1B19]"}`}>
          <Clock size={15} /> {secondsLeft}s
        </div>
      </div>
      <div className="h-1 bg-[#D8D2C4]">
        <div className={`h-full transition-all duration-1000 ${urgent ? "bg-[#C1442D]" : "bg-[#3A5A8C]"}`} style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 mt-8 grid lg:grid-cols-[1fr_360px] gap-8">
        {/* live preview */}
        <div className="order-2 lg:order-1">
          <div className="f-mono text-[10px] tracking-widest text-[#8A8578] mb-2">LIVE MOCKUP</div>
          <Mockup layoutId={layoutId} palette={palette} font={font} client={client} />
        </div>

        {/* controls */}
        <div className="order-1 lg:order-2 space-y-6">
          <PickGroup label="Palette">
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setPaletteIdx(i)}
                  className={`text-left rounded-xl border p-2.5 transition-all ${paletteIdx === i ? "border-[#1C1B19] ring-2 ring-[#1C1B19]/10" : "border-[#D8D2C4] hover:border-[#8A8578]"}`}
                >
                  <div className="flex h-6 rounded overflow-hidden mb-1.5">
                    {p.colors.map((c, ci) => <div key={ci} className="flex-1" style={{ backgroundColor: c }} />)}
                  </div>
                  <div className="text-[11px] font-medium">{p.name}</div>
                </button>
              ))}
            </div>
          </PickGroup>

          <PickGroup label="Typeface">
            <div className="space-y-1.5">
              {FONTS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => setFontIdx(i)}
                  className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-all flex items-center justify-between ${fontIdx === i ? "border-[#1C1B19] ring-2 ring-[#1C1B19]/10 bg-white" : "border-[#D8D2C4] hover:border-[#8A8578] bg-white/60"}`}
                >
                  <span style={{ fontFamily: f.stack }} className="text-lg">{f.name}</span>
                  <span className="f-mono text-[9px] text-[#8A8578]">{f.mood}</span>
                </button>
              ))}
            </div>
          </PickGroup>

          <PickGroup label="Layout">
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayoutId(l.id)}
                  className={`text-xs font-medium rounded-xl border py-2.5 transition-all ${layoutId === l.id ? "border-[#1C1B19] bg-[#1C1B19] text-[#EDE9E0]" : "border-[#D8D2C4] hover:border-[#8A8578] bg-white/60"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </PickGroup>

          <button
            onClick={submit}
            className="w-full bg-[#C1442D] text-white py-3.5 rounded-full font-medium hover:bg-[#a3381f] transition-colors flex items-center justify-center gap-2"
          >
            Submit to client <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PickGroup({ label, children }) {
  return (
    <div>
      <div className="f-mono text-[10px] tracking-widest text-[#8A8578] mb-2">{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function Mockup({ layoutId, palette, font, client }) {
  const bg = palette ? palette.colors[1] : "#FAFAF7";
  const ink = palette ? palette.colors[0] : "#B8B4A8";
  const accent = palette ? palette.colors[2] : "#B8B4A8";
  const fontStack = font ? font.stack : "'Inter', sans-serif";
  const align = layoutId === "left-align" || layoutId === "split" ? "left" : "center";

  return (
    <div
      className="rounded-2xl border border-[#D8D2C4] overflow-hidden aspect-[4/3] flex flex-col justify-center transition-colors duration-300"
      style={{ backgroundColor: bg, padding: layoutId === "full-bleed" ? 0 : "2.5rem" }}
    >
      {layoutId === "split" ? (
        <div className="flex h-full w-full">
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: accent }} />
          <div className="flex-1 flex flex-col justify-center px-6">
            <div className="text-2xl font-semibold" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>
            <div className="text-xs mt-1 opacity-70" style={{ color: ink }}>{client.type}</div>
          </div>
        </div>
      ) : layoutId === "full-bleed" ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2" style={{ backgroundColor: accent }}>
          <div className="text-3xl font-bold text-center px-6" style={{ color: bg, fontFamily: fontStack }}>{client.name}</div>
          <div className="text-xs opacity-80" style={{ color: bg }}>{client.type}</div>
        </div>
      ) : (
        <div className={`flex flex-col ${align === "left" ? "items-start text-left" : "items-center text-center"}`}>
          <div className="w-10 h-10 rounded-full mb-4" style={{ backgroundColor: accent }} />
          <div className="text-3xl font-semibold leading-tight" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>
          <div className="text-xs mt-2 opacity-60" style={{ color: ink }}>{client.type}</div>
        </div>
      )}
    </div>
  );
}

/* ============================= STAMP ============================= */

function StampScreen({ result, client, onContinue }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="f-mono text-xs tracking-widest text-[#8A8578] mb-6">{client.name.toUpperCase()} REVIEWED YOUR WORK</div>
      {shown && (
        <div
          className="stamp-anim border-[6px] rounded-2xl px-10 py-6 flex flex-col items-center"
          style={{ borderColor: result.grade.color, color: result.grade.color }}
        >
          <div className="f-display text-8xl leading-none">{result.grade.letter}</div>
        </div>
      )}
      <button
        onClick={onContinue}
        className="mt-12 rise inline-flex items-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-6 py-3 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        style={{ animationDelay: "0.5s", opacity: 0 }}
      >
        See the critique <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ============================= RESULTS ============================= */

function ResultsScreen({ result, client, cash, onNext, isLast }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md w-full rise">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="f-mono text-[10px] tracking-widest text-[#8A8578]">{client.name.toUpperCase()}</div>
            <div className="text-xl font-semibold">{result.pts} / 100</div>
          </div>
          <div className="text-4xl f-display" style={{ color: result.grade.color }}>{result.grade.letter}</div>
        </div>

        <div className="bg-white border border-[#D8D2C4] rounded-2xl p-5 space-y-3 mb-5">
          {result.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <span
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: n.ok === true ? "#2E6B4F" : n.ok === false ? "#C1442D" : "#B8863B" }}
              />
              <span className="text-[#3A362E] leading-relaxed">{n.text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-[#1C1B19] text-[#EDE9E0] rounded-2xl px-5 py-4 mb-6">
          <span className="text-sm">Paid out</span>
          <span className="f-mono text-lg">${result.earned}</span>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-[#C1442D] text-white py-3.5 rounded-full font-medium hover:bg-[#a3381f] transition-colors flex items-center justify-center gap-2"
        >
          {isLast ? "See final portfolio" : "Next client"} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ============================= GAME OVER ============================= */

function GameOver({ portfolio, cash, onRestart }) {
  const avg = portfolio.length ? Math.round(portfolio.reduce((s, p) => s + p.pts, 0) / portfolio.length) : 0;
  const overall = grade(avg);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full rise text-center">
        <div className="f-mono text-xs tracking-widest text-[#8A8578] mb-3">CAREER SUMMARY</div>
        <h1 className="f-display text-5xl italic mb-2">Portfolio complete.</h1>
        <p className="text-[#4A473F] mb-8">Every client, reviewed and paid.</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat label="Total earned" value={`$${cash}`} />
          <Stat label="Avg. score" value={avg} />
          <Stat label="Overall" value={overall.letter} color={overall.color} />
        </div>

        <div className="bg-white border border-[#D8D2C4] rounded-2xl divide-y divide-[#D8D2C4] mb-8 text-left overflow-hidden">
          {portfolio.map((p, i) => {
            const g = grade(p.pts);
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm">{p.name}</span>
                <span className="f-mono text-sm font-medium" style={{ color: g.color }}>{p.letter}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-6 py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        >
          <RotateCcw size={15} /> Start a new career
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white border border-[#D8D2C4] rounded-xl py-4">
      <div className="f-display text-2xl" style={{ color: color || "#1C1B19" }}>{value}</div>
      <div className="f-mono text-[9px] text-[#8A8578] tracking-wider mt-1">{label.toUpperCase()}</div>
    </div>
  );
}
