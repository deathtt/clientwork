import { useState, useEffect, useRef } from "react";
import { Clock, Briefcase, ChevronRight, RotateCcw, Check, TrendingUp } from "lucide-react";

/* ======================================================================
   DATA POOLS — combined at runtime to generate 100+ distinct briefs
====================================================================== */

const CATEGORIES = [
  { id: "branding", label: "Branding", deliverables: ["Logo suite", "Brand identity", "Wordmark", "Visual identity system", "Rebrand"] },
  { id: "packaging", label: "Packaging", deliverables: ["Product label", "Box design", "Shelf packaging", "Bottle wrap", "Tin/can design"] },
  { id: "uiux", label: "UI/UX", deliverables: ["App onboarding screen", "Landing page hero", "Dashboard module", "Mobile app icon", "Checkout flow"] },
  { id: "print", label: "Print", deliverables: ["Poster", "Business card", "Menu design", "Flyer", "Signage"] },
  { id: "motion", label: "Motion / Social", deliverables: ["Instagram carousel", "Launch teaser frame", "Story template", "Animated logo still", "Ad creative"] },
  { id: "editorial", label: "Editorial", deliverables: ["Book jacket", "Magazine spread", "Zine cover", "Album sleeve", "Report cover"] },
];

const NAME_PARTS = {
  branding: [["Fernwood", "Nordhaus", "Kestrel", "Amaro", "Birchline", "Solano", "Verve", "Anthem", "Hollow &", "Marrow"], ["& Co.", "Studio", "Collective", "Goods", "Supply Co.", "Labs", "House", "Group"]],
  packaging: [["Fernwood", "Blue Reef", "Copper Kettle", "Harvest", "Salt & Sage", "Amaro", "Northgate", "Wildwood"], ["Tea Co.", "Coffee Roasters", "Preserves", "Bakery", "Soap Co.", "Spice Co.", "Brewing", "Farms"]],
  uiux: [["Ledger", "Cadence", "Northpath", "Tally", "Fable", "Loop", "Signal", "Basecamp", "Drift", "Anchor"], ["App", "Health", "Finance", "Labs", "Cloud"]],
  print: [["Marisol", "Cargo//Run", "The Alley", "Basecamp", "Fernwood", "Northgate", "Kestrel"], ["Restaurant", "Studio", "Market", "Gallery", "Festival"]],
  motion: [["Cargo//Run", "Void", "Basecamp", "Ledger", "Fable", "Drift"], ["Drop", "Launch", "Sale", "Release", "Campaign"]],
  editorial: [["Almanac", "Void", "Northgate", "Marrow", "Hollow &", "Fable"], ["Press", "Records", "Quarterly", "Editions", "Studio"]],
};

const PERSONALITIES = [
  { id: "calm", desc: "calm, natural, unhurried — nothing loud", palette: ["Forest", "Ink & Paper", "Slate Mint"], font: ["Instrument Serif", "Fraunces", "Inter"], layout: ["centered", "left-align"], imagery: ["organic", "photographic"], density: ["airy"] },
  { id: "technical", desc: "sharp, trustworthy, modern — built for professionals", palette: ["Signal Blue", "Deep Sea", "Slate Mint"], font: ["Space Grotesk", "Inter", "JetBrains Mono"], layout: ["left-align", "split"], imagery: ["geometric", "iconographic"], density: ["structured"] },
  { id: "luxury", desc: "upscale, romantic, a little indulgent — not corporate", palette: ["Terracotta", "Blush Gold", "Sunbeam"], font: ["Playfair Display", "Fraunces", "Instrument Serif"], layout: ["centered", "full-bleed"], imagery: ["photographic", "illustrative"], density: ["airy"] },
  { id: "loud", desc: "kinetic, maximal, made for a camera roll — go big", palette: ["Neon Night", "Sunbeam"], font: ["Space Grotesk", "JetBrains Mono"], layout: ["full-bleed", "split"], imagery: ["geometric", "collage"], density: ["dense"] },
  { id: "gentle", desc: "safe, quiet, human — the opposite of clinical", palette: ["Slate Mint", "Rosewater", "Forest"], font: ["Instrument Serif", "Inter"], layout: ["centered", "left-align"], imagery: ["organic", "illustrative"], density: ["airy"] },
  { id: "serious", desc: "zero gimmicks, serious money, understated confidence", palette: ["Ink & Paper", "Deep Sea", "Signal Blue"], font: ["Space Grotesk", "Inter"], layout: ["left-align", "split"], imagery: ["geometric", "none"], density: ["structured"] },
  { id: "eerie", desc: "cold, strange, a little unsettling — should not feel friendly", palette: ["Neon Night", "Deep Sea"], font: ["JetBrains Mono", "Space Grotesk"], layout: ["full-bleed"], imagery: ["collage", "none"], density: ["dense"] },
  { id: "timeless", desc: "could sit on a shelf in 1975 or 2045 — nothing trendy", palette: ["Ink & Paper", "Blush Gold", "Terracotta"], font: ["Instrument Serif", "Fraunces"], layout: ["centered", "left-align"], imagery: ["illustrative", "none"], density: ["airy"] },
  { id: "playful", desc: "fun, approachable, a little silly — don't take it too seriously", palette: ["Sunbeam", "Rosewater", "Neon Night"], font: ["Space Grotesk", "Fraunces"], layout: ["split", "full-bleed"], imagery: ["illustrative", "collage"], density: ["dense"] },
  { id: "minimal", desc: "reduced to the essential — say less, mean more", palette: ["Ink & Paper", "Slate Mint"], font: ["Inter", "Instrument Serif"], layout: ["centered", "left-align"], imagery: ["none", "geometric"], density: ["airy"] },
];

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

const IMAGERY = [
  { id: "photographic", label: "Photographic" },
  { id: "illustrative", label: "Illustrative" },
  { id: "geometric", label: "Geometric shapes" },
  { id: "collage", label: "Collage / texture" },
  { id: "none", label: "Type-only" },
];

const DENSITY = [
  { id: "airy", label: "Airy / spacious" },
  { id: "structured", label: "Structured / gridded" },
  { id: "dense", label: "Dense / maximal" },
];

/* ======================================================================
   GENERATOR
====================================================================== */

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function tierForRound(n) {
  // tier climbs every 3 clients, caps difficulty scaling at 8 but keeps generating forever
  return Math.min(8, Math.floor((n - 1) / 3) + 1);
}

function choiceSetForTier(tier) {
  const set = ["palette", "font", "layout"];
  if (tier >= 3) set.push("imagery");
  if (tier >= 5) set.push("density");
  return set;
}

function timeForTier(tier) {
  return Math.max(14, 42 - tier * 3);
}

function payForTier(tier) {
  return 130 + tier * 45;
}

let idCounter = 0;
function generateClient(round) {
  const tier = tierForRound(round);
  const category = pick(CATEGORIES);
  const [prefixes, suffixes] = NAME_PARTS[category.id];
  const name = `${pick(prefixes)} ${pick(suffixes)}`;
  const deliverable = pick(category.deliverables);
  const personality = pick(PERSONALITIES);
  idCounter += 1;

  return {
    uid: idCounter,
    round,
    tier,
    category: category.label,
    name,
    type: deliverable,
    brief: `${deliverable} for a ${category.label.toLowerCase()} project. Wants it ${personality.desc}.`,
    personality,
    pay: payForTier(tier),
    time: timeForTier(tier),
    choices: choiceSetForTier(tier),
  };
}

/* ======================================================================
   SCORING
====================================================================== */

function scoreRound(client, pick_) {
  const p = client.personality;
  let pts = 0;
  const notes = [];
  const weights = { palette: 26, font: 26, layout: 18, imagery: 16, density: 14 };
  const activeChoices = client.choices;
  const totalWeight = activeChoices.reduce((s, c) => s + weights[c], 0);

  const evalField = (field, value, likedList, labelFn) => {
    const w = weights[field] / totalWeight * 100;
    if (likedList.includes(value)) {
      pts += w;
      notes.push({ ok: true, text: `${labelFn(value)} is exactly the right call here.` });
    } else {
      pts += w * 0.35;
      notes.push({ ok: false, text: `${labelFn(value)} doesn't match what they asked for.` });
    }
  };

  evalField("palette", pick_.paletteName, p.palette, (v) => v);
  evalField("font", pick_.fontName, p.font, (v) => v);
  evalField("layout", pick_.layoutId, p.layout, (v) => LAYOUTS.find((l) => l.id === v)?.label || v);
  if (activeChoices.includes("imagery")) evalField("imagery", pick_.imageryId, p.imagery, (v) => IMAGERY.find((i) => i.id === v)?.label || v);
  if (activeChoices.includes("density")) evalField("density", pick_.densityId, p.density, (v) => DENSITY.find((d) => d.id === v)?.label || v);

  pts = Math.round(Math.max(0, Math.min(100, pts)));
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

/* ======================================================================
   APP SHELL
====================================================================== */

export default function ClientWork() {
  const [screen, setScreen] = useState("title");
  const [round, setRound] = useState(1);
  const [client, setClient] = useState(null);
  const [cash, setCash] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const startGame = () => {
    const c = generateClient(1);
    setClient(c);
    setScreen("brief");
  };

  const finishRound = (choicePick) => {
    const { pts, notes } = scoreRound(client, choicePick);
    const g = grade(pts);
    const earned = g.letter === "F" ? 0 : Math.round(client.pay * (pts / 100));
    const newStreak = pts >= 60 ? streak + 1 : 0;
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    setCash((c) => c + earned);
    setPortfolio((p) => [...p, { name: client.name, category: client.category, letter: g.letter, pts, tier: client.tier }]);
    setLastResult({ pts, notes, grade: g, earned });
    setScreen("stamp");
  };

  const nextClient = () => {
    const nextRound = round + 1;
    setRound(nextRound);
    setClient(generateClient(nextRound));
    setScreen("brief");
  };

  const endCareer = () => setScreen("gameover");

  const restart = () => {
    setScreen("title"); setRound(1); setClient(null); setCash(0); setStreak(0); setBestStreak(0); setPortfolio([]); setLastResult(null);
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

      {screen === "title" && <Title onStart={startGame} />}
      {screen === "brief" && client && (
        <BriefScreen client={client} round={round} cash={cash} streak={streak} onAccept={() => setScreen("studio")} />
      )}
      {screen === "studio" && client && (
        <Studio client={client} onSubmit={finishRound} />
      )}
      {screen === "stamp" && lastResult && client && (
        <StampScreen result={lastResult} client={client} onContinue={() => setScreen("results")} />
      )}
      {screen === "results" && lastResult && client && (
        <ResultsScreen result={lastResult} client={client} cash={cash} streak={streak} onNext={nextClient} onEnd={endCareer} />
      )}
      {screen === "gameover" && (
        <GameOver portfolio={portfolio} cash={cash} bestStreak={bestStreak} onRestart={restart} />
      )}
    </div>
  );
}

/* ======================================================================
   TITLE
====================================================================== */

function Title({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 rise">
        <div className="f-mono text-xs tracking-[0.3em] text-[#8A8578] mb-4">AN ENDLESS FREELANCE DESIGN SIM</div>
        <h1 className="f-display text-6xl sm:text-8xl italic leading-none">Client Work</h1>
      </div>
      <p className="max-w-md text-[#4A473F] leading-relaxed mb-10 rise" style={{ animationDelay: "0.1s", opacity: 0 }}>
        Branding, packaging, UI/UX, print, motion, editorial — an endless stream of clients,
        each with their own taste. Read the brief. Design fast. Get graded.
      </p>
      <button
        onClick={onStart}
        className="rise inline-flex items-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-7 py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        style={{ animationDelay: "0.2s", opacity: 0 }}
      >
        Open the studio <ChevronRight size={16} />
      </button>
      <div className="mt-14 f-mono text-[10px] tracking-widest text-[#8A8578] rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
        6 DISCIPLINES · ENDLESS CLIENTS · TIERS 1–8+
      </div>
    </div>
  );
}

/* ======================================================================
   BRIEF
====================================================================== */

function BriefScreen({ client, round, cash, streak, onAccept }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <TopBar round={round} cash={cash} streak={streak} />
      <div className="max-w-md w-full rise">
        <div className="bg-white border border-[#D8D2C4] rounded-2xl shadow-[0_2px_0_#D8D2C4] p-7 relative">
          <div className="absolute -top-3 left-7 bg-[#C1442D] text-white text-[10px] f-mono px-2.5 py-1 rounded-sm tracking-wider">
            NEW BRIEF
          </div>
          <div className="f-mono text-[10px] tracking-widest text-[#8A8578] mb-1">
            {client.category.toUpperCase()} · TIER {client.tier} · ${client.pay} BUDGET
          </div>
          <h2 className="f-display text-3xl mb-1">{client.name}</h2>
          <div className="text-sm text-[#8A8578] mb-5">{client.type}</div>
          <p className="text-[#3A362E] leading-relaxed">{client.brief}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {client.choices.map((c) => (
              <span key={c} className="f-mono text-[9px] tracking-wider px-2 py-1 rounded-full bg-[#EDE9E0] text-[#4A473F]">{c.toUpperCase()}</span>
            ))}
          </div>
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

function TopBar({ round, cash, streak }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 f-mono text-xs text-[#4A473F]">
      <div className="flex items-center gap-1.5"><Briefcase size={13} /> CLIENT {round}</div>
      <div className="flex items-center gap-4">
        {streak > 1 && <div className="flex items-center gap-1 text-[#C1442D]"><TrendingUp size={13} /> {streak} STREAK</div>}
        <div>${cash} EARNED</div>
      </div>
    </div>
  );
}

/* ======================================================================
   STUDIO
====================================================================== */

function Studio({ client, onSubmit }) {
  const time = client.time;
  const [secondsLeft, setSecondsLeft] = useState(time);
  const [paletteIdx, setPaletteIdx] = useState(null);
  const [fontIdx, setFontIdx] = useState(null);
  const [layoutId, setLayoutId] = useState(null);
  const [imageryId, setImageryId] = useState(null);
  const [densityId, setDensityId] = useState(null);
  const submittedRef = useRef(false);

  const palette = paletteIdx !== null ? PALETTES[paletteIdx] : null;
  const font = fontIdx !== null ? FONTS[fontIdx] : null;
  const hasImagery = client.choices.includes("imagery");
  const hasDensity = client.choices.includes("density");

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit({
      paletteName: palette ? palette.name : "Ink & Paper",
      fontName: font ? font.name : "Inter",
      layoutId: layoutId || "centered",
      imageryId: imageryId || "none",
      densityId: densityId || "structured",
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
          <Mockup layoutId={layoutId} palette={palette} font={font} client={client} densityId={densityId} imageryId={imageryId} />
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

          {hasImagery && (
            <PickGroup label="Imagery style">
              <div className="grid grid-cols-2 gap-2">
                {IMAGERY.map((im) => (
                  <button
                    key={im.id}
                    onClick={() => setImageryId(im.id)}
                    className={`text-xs font-medium rounded-xl border py-2.5 px-2 transition-all ${imageryId === im.id ? "border-[#1C1B19] bg-[#1C1B19] text-[#EDE9E0]" : "border-[#D8D2C4] hover:border-[#8A8578] bg-white/60"}`}
                  >
                    {im.label}
                  </button>
                ))}
              </div>
            </PickGroup>
          )}

          {hasDensity && (
            <PickGroup label="Spacing density">
              <div className="grid grid-cols-3 gap-2">
                {DENSITY.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDensityId(d.id)}
                    className={`text-[11px] font-medium rounded-xl border py-2.5 px-1.5 transition-all ${densityId === d.id ? "border-[#1C1B19] bg-[#1C1B19] text-[#EDE9E0]" : "border-[#D8D2C4] hover:border-[#8A8578] bg-white/60"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </PickGroup>
          )}

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

function Mockup({ layoutId, palette, font, client, densityId, imageryId }) {
  const bg = palette ? palette.colors[1] : "#FAFAF7";
  const ink = palette ? palette.colors[0] : "#B8B4A8";
  const accent = palette ? palette.colors[2] : "#B8B4A8";
  const fontStack = font ? font.stack : "'Inter', sans-serif";
  const align = layoutId === "left-align" || layoutId === "split" ? "left" : "center";
  const pad = densityId === "dense" ? "1.25rem" : densityId === "structured" ? "2rem" : "2.5rem";

  return (
    <div
      className="rounded-2xl border border-[#D8D2C4] overflow-hidden aspect-[4/3] flex flex-col justify-center transition-colors duration-300"
      style={{ backgroundColor: bg, padding: layoutId === "full-bleed" ? 0 : pad }}
    >
      {layoutId === "split" ? (
        <div className="flex h-full w-full">
          <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: accent }}>
            {imageryId === "geometric" && <div className="w-16 h-16 rotate-45" style={{ backgroundColor: bg, opacity: 0.5 }} />}
            {imageryId === "collage" && <div className="absolute inset-3 border-2 border-dashed" style={{ borderColor: bg + "80" }} />}
          </div>
          <div className="flex-1 flex flex-col justify-center px-6">
            <div className="text-2xl font-semibold" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>
            <div className="text-xs mt-1 opacity-70" style={{ color: ink }}>{client.type}</div>
          </div>
        </div>
      ) : layoutId === "full-bleed" ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2 relative" style={{ backgroundColor: accent }}>
          <div className="text-3xl font-bold text-center px-6" style={{ color: bg, fontFamily: fontStack }}>{client.name}</div>
          <div className="text-xs opacity-80" style={{ color: bg }}>{client.type}</div>
          {imageryId === "collage" && <div className="absolute inset-6 border border-dashed" style={{ borderColor: bg + "60" }} />}
        </div>
      ) : (
        <div className={`flex flex-col ${align === "left" ? "items-start text-left" : "items-center text-center"}`}>
          {imageryId !== "none" && (
            <div
              className="mb-4"
              style={{
                width: 40, height: 40, backgroundColor: accent,
                borderRadius: imageryId === "photographic" ? "8px" : imageryId === "geometric" ? "0px" : "50%",
                transform: imageryId === "geometric" ? "rotate(45deg)" : "none",
              }}
            />
          )}
          <div className="text-3xl font-semibold leading-tight" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>
          <div className="text-xs mt-2 opacity-60" style={{ color: ink }}>{client.type}</div>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   STAMP
====================================================================== */

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

/* ======================================================================
   RESULTS
====================================================================== */

function ResultsScreen({ result, client, cash, streak, onNext, onEnd }) {
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
                style={{ backgroundColor: n.ok ? "#2E6B4F" : "#C1442D" }}
              />
              <span className="text-[#3A362E] leading-relaxed">{n.text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between bg-[#1C1B19] text-[#EDE9E0] rounded-2xl px-5 py-4 mb-6">
          <span className="text-sm">Paid out{streak > 1 ? ` · ${streak} streak` : ""}</span>
          <span className="f-mono text-lg">${result.earned}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onNext}
            className="flex-1 bg-[#C1442D] text-white py-3.5 rounded-full font-medium hover:bg-[#a3381f] transition-colors flex items-center justify-center gap-2"
          >
            Next client <ChevronRight size={16} />
          </button>
          <button
            onClick={onEnd}
            className="px-5 py-3.5 rounded-full font-medium border border-[#D8D2C4] hover:bg-white transition-colors text-sm text-[#4A473F]"
          >
            End day
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   GAME OVER
====================================================================== */

function GameOver({ portfolio, cash, bestStreak, onRestart }) {
  const avg = portfolio.length ? Math.round(portfolio.reduce((s, p) => s + p.pts, 0) / portfolio.length) : 0;
  const overall = grade(avg);
  const maxTier = portfolio.length ? Math.max(...portfolio.map((p) => p.tier)) : 1;

  const byCategory = {};
  portfolio.forEach((p) => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full rise text-center">
        <div className="f-mono text-xs tracking-widest text-[#8A8578] mb-3">CAREER SUMMARY</div>
        <h1 className="f-display text-5xl italic mb-2">Studio closed for the day.</h1>
        <p className="text-[#4A473F] mb-8">{portfolio.length} clients served across {Object.keys(byCategory).length} disciplines.</p>

        <div className="grid grid-cols-4 gap-2.5 mb-8">
          <Stat label="Earned" value={`$${cash}`} />
          <Stat label="Avg score" value={avg} />
          <Stat label="Overall" value={overall.letter} color={overall.color} />
          <Stat label="Best streak" value={bestStreak} />
        </div>

        <div className="bg-white border border-[#D8D2C4] rounded-2xl divide-y divide-[#D8D2C4] mb-8 text-left overflow-hidden max-h-72 overflow-y-auto">
          {portfolio.slice().reverse().map((p, i) => {
            const g = grade(p.pts);
            return (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm">{p.name}</span>
                  <span className="f-mono text-[9px] text-[#8A8578] ml-2">{p.category.toUpperCase()}</span>
                </div>
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
