'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Briefcase, ChevronRight, RotateCcw, Check, TrendingUp, Search, Layers, Eye, EyeOff, Pipette } from "lucide-react";

/* ======================================================================
   DATA POOLS v3 — real dimensions, expanded fonts, free color
====================================================================== */

// Real-world deliverable sizes. w/h are the aspect ratio (not px-perfect, but true ratio).
const CATEGORIES = [
  {
    id: "branding", label: "Branding",
    deliverables: [
      { name: "Logo suite", w: 1, h: 1, dim: "Square lockup" },
      { name: "Brand identity", w: 1.4, h: 1, dim: "Presentation 7:5" },
      { name: "Wordmark", w: 2.5, h: 1, dim: "Wide lockup" },
      { name: "Visual identity system", w: 1.4, h: 1, dim: "Presentation 7:5" },
      { name: "Rebrand concept", w: 1, h: 1, dim: "Square lockup" },
    ],
  },
  {
    id: "packaging", label: "Packaging",
    deliverables: [
      { name: "Product label", w: 1, h: 1.6, dim: "Bottle label 5:8" },
      { name: "Box design", w: 1, h: 1, dim: "Box face, square" },
      { name: "Shelf packaging", w: 0.75, h: 1, dim: "Carton front 3:4" },
      { name: "Bottle wrap", w: 1, h: 2.2, dim: "Wraparound tall" },
      { name: "Tin / can design", w: 1, h: 1.4, dim: "Can wrap 5:7" },
    ],
  },
  {
    id: "uiux", label: "UI/UX",
    deliverables: [
      { name: "App onboarding screen", w: 375, h: 812, dim: "375 × 812 px", isPx: true },
      { name: "Landing page hero", w: 1440, h: 720, dim: "1440 × 720 px", isPx: true },
      { name: "Dashboard module", w: 1280, h: 800, dim: "1280 × 800 px", isPx: true },
      { name: "Mobile app icon", w: 1, h: 1, dim: "1024 × 1024 px", isPx: true, sq: true },
      { name: "Checkout flow screen", w: 375, h: 812, dim: "375 × 812 px", isPx: true },
    ],
  },
  {
    id: "print", label: "Print",
    deliverables: [
      { name: "Poster", w: 18, h: 24, dim: "18 × 24 in" },
      { name: "Business card", w: 3.5, h: 2, dim: "3.5 × 2 in" },
      { name: "Menu design", w: 8.5, h: 11, dim: "8.5 × 11 in" },
      { name: "Flyer", w: 5.5, h: 8.5, dim: "5.5 × 8.5 in" },
      { name: "Signage", w: 24, h: 36, dim: "24 × 36 in" },
    ],
  },
  {
    id: "motion", label: "Motion / Social",
    deliverables: [
      { name: "Instagram carousel", w: 1080, h: 1080, dim: "1080 × 1080 px", isPx: true, sq: true },
      { name: "Launch teaser frame", w: 1920, h: 1080, dim: "1920 × 1080 px", isPx: true },
      { name: "Story template", w: 1080, h: 1920, dim: "1080 × 1920 px", isPx: true },
      { name: "Animated logo still", w: 1, h: 1, dim: "Square frame", sq: true },
      { name: "Ad creative", w: 1200, h: 628, dim: "1200 × 628 px", isPx: true },
    ],
  },
  {
    id: "editorial", label: "Editorial",
    deliverables: [
      { name: "Book jacket", w: 6, h: 9, dim: "6 × 9 in" },
      { name: "Magazine spread", w: 17, h: 11, dim: "17 × 11 in (spread)" },
      { name: "Zine cover", w: 5.5, h: 8.5, dim: "5.5 × 8.5 in" },
      { name: "Album sleeve", w: 1, h: 1, dim: "12 × 12 in", sq: true },
      { name: "Report cover", w: 8.5, h: 11, dim: "8.5 × 11 in" },
    ],
  },
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
  { id: "calm", desc: "calm, natural, unhurried — nothing loud", palette: ["Forest", "Ink & Paper", "Slate Mint"], font: ["Instrument Serif", "Fraunces", "Inter"], layout: ["centered", "left-align"], imagery: ["organic", "photographic"], density: ["airy"], hueRange: [90, 160] },
  { id: "technical", desc: "sharp, trustworthy, modern — built for professionals", palette: ["Signal Blue", "Deep Sea", "Slate Mint"], font: ["Space Grotesk", "Inter", "JetBrains Mono"], layout: ["left-align", "split"], imagery: ["geometric", "iconographic"], density: ["structured"], hueRange: [200, 230] },
  { id: "luxury", desc: "upscale, romantic, a little indulgent — not corporate", palette: ["Terracotta", "Blush Gold", "Sunbeam"], font: ["Playfair Display", "Fraunces", "Instrument Serif"], layout: ["centered", "full-bleed"], imagery: ["photographic", "illustrative"], density: ["airy"], hueRange: [20, 45] },
  { id: "loud", desc: "kinetic, maximal, made for a camera roll — go big", palette: ["Neon Night", "Sunbeam"], font: ["Space Grotesk", "JetBrains Mono"], layout: ["full-bleed", "split"], imagery: ["geometric", "collage"], density: ["dense"], hueRange: [270, 320] },
  { id: "gentle", desc: "safe, quiet, human — the opposite of clinical", palette: ["Slate Mint", "Rosewater", "Forest"], font: ["Instrument Serif", "Inter"], layout: ["centered", "left-align"], imagery: ["organic", "illustrative"], density: ["airy"], hueRange: [150, 190] },
  { id: "serious", desc: "zero gimmicks, serious money, understated confidence", palette: ["Ink & Paper", "Deep Sea", "Signal Blue"], font: ["Space Grotesk", "Inter"], layout: ["left-align", "split"], imagery: ["geometric", "none"], density: ["structured"], hueRange: [200, 220] },
  { id: "eerie", desc: "cold, strange, a little unsettling — should not feel friendly", palette: ["Neon Night", "Deep Sea"], font: ["JetBrains Mono", "Space Grotesk"], layout: ["full-bleed"], imagery: ["collage", "none"], density: ["dense"], hueRange: [250, 280] },
  { id: "timeless", desc: "could sit on a shelf in 1975 or 2045 — nothing trendy", palette: ["Ink & Paper", "Blush Gold", "Terracotta"], font: ["Instrument Serif", "Fraunces"], layout: ["centered", "left-align"], imagery: ["illustrative", "none"], density: ["airy"], hueRange: [30, 50] },
  { id: "playful", desc: "fun, approachable, a little silly — don't take it too seriously", palette: ["Sunbeam", "Rosewater", "Neon Night"], font: ["Space Grotesk", "Fraunces"], layout: ["split", "full-bleed"], imagery: ["illustrative", "collage"], density: ["dense"], hueRange: [320, 40] },
  { id: "minimal", desc: "reduced to the essential — say less, mean more", palette: ["Ink & Paper", "Slate Mint"], font: ["Inter", "Instrument Serif"], layout: ["centered", "left-align"], imagery: ["none", "geometric"], density: ["airy"], hueRange: [0, 0] },
];

// Curated preset palettes (fast picks)
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

// Curated preset fonts (fast picks) + full searchable Google Fonts list
const FONTS = [
  { name: "Fraunces", stack: "'Fraunces', serif", mood: "editorial" },
  { name: "Space Grotesk", stack: "'Space Grotesk', sans-serif", mood: "technical" },
  { name: "Instrument Serif", stack: "'Instrument Serif', serif", mood: "literary" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", mood: "luxury" },
  { name: "JetBrains Mono", stack: "'JetBrains Mono', monospace", mood: "utilitarian" },
  { name: "Inter", stack: "'Inter', sans-serif", mood: "neutral" },
];

const GOOGLE_FONTS = [
  "Fraunces", "Space Grotesk", "Instrument Serif", "Playfair Display", "JetBrains Mono", "Inter",
  "Archivo Black", "Bebas Neue", "Cormorant Garamond", "DM Serif Display", "Sora", "Manrope",
  "Syne", "Unbounded", "Libre Caslon Display", "Spectral", "Epilogue", "Outfit", "Zilla Slab",
  "Bricolage Grotesque", "Newsreader", "Petrona", "Big Shoulders Display", "Fjalla One",
  "Cabinet Grotesk".replace(" Grotesk", " Grotesk"), "Work Sans", "Prata", "Josefin Sans",
  "Bodoni Moda", "Anton", "Marcellus", "Crimson Pro", "Grandstander", "Righteous", "Chivo",
  "Cormorant", "Abril Fatface", "Vollkorn", "Poppins", "Rubik", "Karla", "Lora",
].filter((v, i, a) => a.indexOf(v) === i);

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

function randPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function tierForRound(n) { return Math.min(8, Math.floor((n - 1) / 3) + 1); }

function choiceSetForTier(tier) {
  const set = ["palette", "font", "layout"];
  if (tier >= 3) set.push("imagery");
  if (tier >= 5) set.push("density");
  return set;
}

function timeForTier(tier) { return Math.max(16, 46 - tier * 3); }
function payForTier(tier) { return 130 + tier * 45; }

let idCounter = 0;
function generateClient(round, fieldId) {
  const tier = tierForRound(round);
  const category = fieldId && fieldId !== "all"
    ? CATEGORIES.find((c) => c.id === fieldId) || randPick(CATEGORIES)
    : randPick(CATEGORIES);
  const [prefixes, suffixes] = NAME_PARTS[category.id];
  const name = `${randPick(prefixes)} ${randPick(suffixes)}`;
  const deliverable = randPick(category.deliverables);
  const personality = randPick(PERSONALITIES);
  idCounter += 1;

  return {
    uid: idCounter,
    round,
    tier,
    category: category.label,
    name,
    deliverable,
    type: deliverable.name,
    brief: `${deliverable.name} for a ${category.label.toLowerCase()} project. Wants it ${personality.desc}.`,
    personality,
    pay: payForTier(tier),
    time: timeForTier(tier),
    choices: choiceSetForTier(tier),
  };
}

/* ======================================================================
   COLOR HELPERS
====================================================================== */

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function isCustomColorAppropriate(hex, hueRange) {
  if (!hueRange || (hueRange[0] === 0 && hueRange[1] === 0)) return true; // minimal = any works
  const { h, s } = hexToHsl(hex);
  if (s < 12) return true; // near-grayscale always acceptable
  const [lo, hi] = hueRange;
  if (lo <= hi) return h >= lo - 15 && h <= hi + 15;
  return h >= lo - 15 || h <= hi + 15; // wraps around 360
}

/* ======================================================================
   SCORING
====================================================================== */

function scoreRound(client, pickObj) {
  const p = client.personality;
  let pts = 0;
  const notes = [];
  const weights = { palette: 26, font: 26, layout: 18, imagery: 16, density: 14 };
  const activeChoices = client.choices;
  const totalWeight = activeChoices.reduce((s, c) => s + weights[c], 0);

  // palette: preset name match OR custom hue-range match
  {
    const w = weights.palette / totalWeight * 100;
    if (pickObj.paletteSource === "custom") {
      const ok = isCustomColorAppropriate(pickObj.accentHex, p.hueRange);
      pts += ok ? w : w * 0.3;
      notes.push({ ok, text: ok ? `Your custom accent (${pickObj.accentHex}) sits right in their palette.` : `Your custom accent (${pickObj.accentHex}) clashes with the mood they asked for.` });
    } else if (p.palette.includes(pickObj.paletteName)) {
      pts += w;
      notes.push({ ok: true, text: `${pickObj.paletteName} is exactly the right call here.` });
    } else {
      pts += w * 0.35;
      notes.push({ ok: false, text: `${pickObj.paletteName} doesn't match what they asked for.` });
    }
  }

  // font
  {
    const w = weights.font / totalWeight * 100;
    if (pickObj.fontSource === "custom") {
      pts += w * 0.75; // custom fonts get generous credit — can't rule-check every Google Font's mood
      notes.push({ ok: true, text: `${pickObj.fontName} is a distinctive pick — client appreciates the custom choice.` });
    } else if (p.font.includes(pickObj.fontName)) {
      pts += w;
      notes.push({ ok: true, text: `${pickObj.fontName} nails the voice they asked for.` });
    } else {
      pts += w * 0.35;
      notes.push({ ok: false, text: `${pickObj.fontName} sends the wrong signal for this client.` });
    }
  }

  // layout
  {
    const w = weights.layout / totalWeight * 100;
    const ok = p.layout.includes(pickObj.layoutId);
    pts += ok ? w : w * 0.35;
    notes.push({ ok, text: ok ? "Layout matches how this should be read." : "Layout doesn't fit the size or the brief." });
  }

  if (activeChoices.includes("imagery")) {
    const w = weights.imagery / totalWeight * 100;
    const ok = p.imagery.includes(pickObj.imageryId);
    pts += ok ? w : w * 0.35;
    notes.push({ ok, text: ok ? "Imagery style fits the brand voice." : "Imagery style feels off for this client." });
  }
  if (activeChoices.includes("density")) {
    const w = weights.density / totalWeight * 100;
    const ok = p.density.includes(pickObj.densityId);
    pts += ok ? w : w * 0.35;
    notes.push({ ok, text: ok ? "Spacing density is well judged." : "Spacing density doesn't match the brief's energy." });
  }

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
  const [fontsLoaded, setFontsLoaded] = useState(new Set());
  const [field, setField] = useState("all");

  const loadFont = (fontName) => {
    if (fontsLoaded.has(fontName)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
    setFontsLoaded((prev) => new Set(prev).add(fontName));
  };

  const startGame = () => {
    setScreen("field");
  };

  const chooseField = (fieldId) => {
    setField(fieldId);
    const c = generateClient(1, fieldId);
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
    setClient(generateClient(nextRound, field));
    setScreen("brief");
  };

  const endCareer = () => setScreen("gameover");

  const restart = () => {
    setScreen("title"); setRound(1); setClient(null); setCash(0); setStreak(0); setBestStreak(0); setPortfolio([]); setLastResult(null); setField("all");
  };

  return (
    <div className="min-h-screen bg-[#EDE9E0] text-[#1C1B19]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Space+Grotesk:wght@500;600&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Caveat:wght@500;600&display=swap');
        .f-display { font-family: 'Instrument Serif', serif; }
        .f-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes stampIn { 0% { transform: scale(3) rotate(-18deg); opacity: 0; } 60% { transform: scale(0.95) rotate(-8deg); opacity: 1; } 100% { transform: scale(1) rotate(-8deg); opacity: 1; } }
        .stamp-anim { animation: stampIn 0.55s cubic-bezier(.2,.9,.25,1.2) forwards; }
        @keyframes riseIn { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform: translateY(0);} }
        .rise { animation: riseIn 0.4s ease forwards; }
        input[type="color"] { -webkit-appearance: none; appearance: none; border: none; padding: 0; background: none; }
        input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        input[type="color"]::-webkit-color-swatch { border: none; border-radius: 8px; }
        ::selection { background: #C1442D; color: white; }
      `}</style>

      {screen === "title" && <Title onStart={startGame} />}
      {screen === "field" && <FieldSelect onChoose={chooseField} />}
      {screen === "brief" && client && (
        <BriefScreen client={client} round={round} cash={cash} streak={streak} onAccept={() => setScreen("studio")} />
      )}
      {screen === "studio" && client && (
        <Studio client={client} onSubmit={finishRound} loadFont={loadFont} />
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
        Real dimensions. Real color pickers. Real fonts. An endless stream of clients across
        branding, packaging, UI/UX, print, motion, and editorial — read the brief and design it right.
      </p>
      <button
        onClick={onStart}
        className="rise inline-flex items-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-7 py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        style={{ animationDelay: "0.2s", opacity: 0 }}
      >
        Open the studio <ChevronRight size={16} />
      </button>
      <div className="mt-14 f-mono text-[10px] tracking-widest text-[#8A8578] rise" style={{ animationDelay: "0.3s", opacity: 0 }}>
        6 DISCIPLINES · REAL CANVAS SIZES · CUSTOM COLOR + FONT
      </div>
    </div>
  );
}

/* ======================================================================
   FIELD SELECT — choose your specialty
====================================================================== */

const FIELD_BLURBS = {
  branding: "Logos, wordmarks, and identity systems.",
  packaging: "Labels, boxes, bottles, and cans.",
  uiux: "App screens, dashboards, and web layouts.",
  print: "Posters, cards, menus, and signage.",
  motion: "Social frames, stories, and ad creative.",
  editorial: "Book jackets, spreads, and covers.",
};

function FieldSelect({ onChoose }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full rise text-center">
        <div className="f-mono text-xs tracking-[0.3em] text-[#8A8578] mb-3">CHOOSE YOUR FIELD</div>
        <h1 className="f-display text-4xl sm:text-5xl italic mb-3">What do you want to design?</h1>
        <p className="text-[#4A473F] leading-relaxed mb-10 max-w-md mx-auto">
          Pick a specialty to build a career in it, or stay open to everything.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-left">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChoose(cat.id)}
              className="bg-white border border-[#D8D2C4] rounded-2xl p-5 hover:border-[#1C1B19] hover:ring-2 hover:ring-[#1C1B19]/10 transition-all"
            >
              <div className="text-lg font-semibold mb-1">{cat.label}</div>
              <div className="text-sm text-[#8A8578] leading-relaxed">{FIELD_BLURBS[cat.id]}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => onChoose("all")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1B19] text-[#EDE9E0] px-7 py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors"
        >
          Surprise me — all disciplines <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ======================================================================
   BRIEF
====================================================================== */

function useTypewriter(text, speed = 18, startDelay = 250) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    let interval;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => { clearTimeout(startTimer); clearInterval(interval); };
  }, [text, speed, startDelay]);
  return { out, done };
}

function BriefScreen({ client, round, cash, streak, onAccept }) {
  const d = client.deliverable;
  const { out: briefOut, done: briefDone } = useTypewriter(client.brief, 16, 500);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[#DAD5C8]">
      <TopBar round={round} cash={cash} streak={streak} />
      <div className="max-w-lg w-full rise">
        {/* typed page */}
        <div
          className="relative bg-[#F3EEE3] rounded-sm px-8 sm:px-10 py-9 shadow-[0_10px_30px_rgba(28,27,25,0.18)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, rgba(28,27,25,0.035) 28px)",
          }}
        >
          {/* header */}
          <div className="flex items-start justify-between mb-6 border-b border-[#1C1B19]/15 pb-4">
            <div>
              <div
                className="text-3xl text-[#1C1B19]"
                style={{ fontFamily: "'Caveat', cursive", transform: "rotate(-2deg)" }}
              >
                {client.name}
              </div>
            </div>
            <div className="f-mono text-[10px] tracking-widest text-[#6B675C] text-right pt-1">
              {client.category.toUpperCase()}<br/>{d.dim.toUpperCase()}
            </div>
          </div>

          {/* meta fields, styled like the "nama / kelas" fields */}
          <div className="f-mono text-[11px] text-[#3A362E] space-y-1 mb-7">
            <div><span className="text-[#8A8578]">deliverable :</span> {client.type}</div>
            <div><span className="text-[#8A8578]">tier ·budget :</span> Tier {client.tier} · ${client.pay}</div>
          </div>

          {/* typed brief body */}
          <div className="f-mono text-[13px] leading-[1.9] text-[#242220] min-h-[6.5rem]">
            {briefOut}
            {!briefDone && <span className="inline-block w-[7px] h-[1em] bg-[#1C1B19] ml-0.5 align-middle animate-pulse" />}
          </div>

          {/* footer strip, echoing "old memory of new time...." tone but on-brand */}
          <div className="mt-8 pt-4 border-t border-dashed border-[#1C1B19]/20 f-mono text-[10px] tracking-wide text-[#8A8578]">
            client work · new assignment ....
          </div>

          {/* tags */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {client.choices.map((c) => (
              <span key={c} className="f-mono text-[9px] tracking-wider px-2 py-1 rounded-full bg-[#1C1B19]/[0.06] text-[#4A473F]">{c.toUpperCase()}</span>
            ))}
          </div>
        </div>

        <button
          onClick={onAccept}
          className="w-full mt-6 bg-[#1C1B19] text-[#EDE9E0] py-3.5 rounded-full font-medium hover:bg-[#3A241C] transition-colors flex items-center justify-center gap-2"
        >
          Open canvas <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function TopBar({ round, cash, streak }) {
  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 f-mono text-xs text-[#4A473F] z-30">
      <div className="flex items-center gap-1.5"><Briefcase size={13} /> CLIENT {round}</div>
      <div className="flex items-center gap-4">
        {streak > 1 && <div className="flex items-center gap-1 text-[#C1442D]"><TrendingUp size={13} /> {streak} STREAK</div>}
        <div>${cash} EARNED</div>
      </div>
    </div>
  );
}

/* ======================================================================
   STUDIO — realistic design-tool chrome
====================================================================== */

function Studio({ client, onSubmit, loadFont }) {
  const time = client.time;
  const [secondsLeft, setSecondsLeft] = useState(time);

  const [paletteIdx, setPaletteIdx] = useState(null);
  const [customHex, setCustomHex] = useState("#5B5FEF");
  const [useCustomColor, setUseCustomColor] = useState(false);

  const [fontIdx, setFontIdx] = useState(null);
  const [customFont, setCustomFont] = useState(null);
  const [fontQuery, setFontQuery] = useState("");
  const [fontSearchOpen, setFontSearchOpen] = useState(false);

  const [layoutId, setLayoutId] = useState(null);
  const [imageryId, setImageryId] = useState(null);
  const [densityId, setDensityId] = useState(null);

  const [layerVis, setLayerVis] = useState({ background: true, accent: true, headline: true, subhead: true });

  const submittedRef = useRef(false);

  const activePalette = paletteIdx !== null ? PALETTES[paletteIdx] : null;
  const font = customFont ? { name: customFont, stack: `'${customFont}', sans-serif` } : (fontIdx !== null ? FONTS[fontIdx] : null);
  const hasImagery = client.choices.includes("imagery");
  const hasDensity = client.choices.includes("density");

  const filteredFonts = useMemo(
    () => GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(fontQuery.toLowerCase())).slice(0, 8),
    [fontQuery]
  );

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit({
      paletteSource: useCustomColor ? "custom" : "preset",
      paletteName: activePalette ? activePalette.name : "Ink & Paper",
      accentHex: customHex,
      fontSource: customFont ? "custom" : "preset",
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

  const toggleLayer = (key) => setLayerVis((v) => ({ ...v, [key]: !v[key] }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* top toolbar - GLASSMORPHISM BLUR EFFECT */}
      <div className="sticky top-0 z-20 bg-[#1C1B19]/85 backdrop-blur-md border-b border-[#3A362E]/50 text-[#EDE9E0] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <div className="f-mono text-[10px] text-[#8A8578] tracking-widest">{client.name.toUpperCase()}</div>
          <div className="text-sm font-medium">{client.type} · <span className="f-mono text-[#8A8578]">{client.deliverable.dim}</span></div>
        </div>
        <div className={`flex items-center gap-2 f-mono text-sm font-medium ${urgent ? "text-[#E8836C]" : "text-[#EDE9E0]"}`}>
          <Clock size={15} /> {secondsLeft}s
        </div>
      </div>
      <div className="h-1 bg-[#3A362E]">
        <div className={`h-full transition-all duration-1000 ${urgent ? "bg-[#C1442D]" : "bg-[#3A5A8C]"}`} style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="flex-1 grid lg:grid-cols-[200px_1fr_340px] bg-[#DAD5C8]">
        {/* LEFT: layers panel */}
        <div className="hidden lg:block border-r border-[#C7C1B2] bg-[#EDE9E0] p-4">
          <div className="flex items-center gap-1.5 f-mono text-[10px] tracking-widest text-[#8A8578] mb-3">
            <Layers size={12} /> LAYERS
          </div>
          <div className="space-y-1">
            {[
              { key: "background", label: "Background" },
              { key: "accent", label: "Accent shape" },
              { key: "headline", label: "Headline" },
              { key: "subhead", label: "Subhead" },
            ].map((l) => (
              <button
                key={l.key}
                onClick={() => toggleLayer(l.key)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/60 text-left text-xs"
              >
                <span className={layerVis[l.key] ? "text-[#1C1B19]" : "text-[#B0AA9A] line-through"}>{l.label}</span>
                {layerVis[l.key] ? <Eye size={13} className="text-[#8A8578]" /> : <EyeOff size={13} className="text-[#C7C1B2]" />}
              </button>
            ))}
          </div>

          <div className="mt-8 f-mono text-[10px] tracking-widest text-[#8A8578] mb-2">CANVAS</div>
          <div className="text-xs text-[#4A473F] leading-relaxed">
            {client.deliverable.dim}<br />
            <span className="text-[#8A8578]">{client.category}</span>
          </div>
        </div>

        {/* CENTER: canvas with ruler */}
        <div className="p-4 sm:p-8 flex flex-col items-center justify-center overflow-auto">
          <div className="f-mono text-[10px] tracking-widest text-[#8A8578] mb-3 self-start lg:self-center">LIVE CANVAS</div>
          <CanvasWithRuler
            layoutId={layoutId} palette={activePalette} font={font} client={client}
            densityId={densityId} imageryId={imageryId} layerVis={layerVis}
            useCustomColor={useCustomColor} customHex={customHex}
          />
        </div>

        {/* RIGHT: properties panel */}
        <div className="border-l border-[#C7C1B2] bg-[#EDE9E0] p-4 sm:p-5 overflow-y-auto space-y-6 max-h-[calc(100vh-56px)] lg:sticky lg:top-[56px]">
          {/* Color */}
          <PickGroup label="Fill color">
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={() => setUseCustomColor(false)}
                className={`flex-1 text-[10px] f-mono tracking-wider py-1.5 rounded-md ${!useCustomColor ? "bg-[#1C1B19] text-[#EDE9E0]" : "bg-white text-[#8A8578]"}`}
              >PRESETS</button>
              <button
                onClick={() => setUseCustomColor(true)}
                className={`flex-1 text-[10px] f-mono tracking-wider py-1.5 rounded-md flex items-center justify-center gap-1 ${useCustomColor ? "bg-[#1C1B19] text-[#EDE9E0]" : "bg-white text-[#8A8578]"}`}
              ><Pipette size={10} /> CUSTOM</button>
            </div>

            {!useCustomColor ? (
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setPaletteIdx(i)}
                    className={`text-left rounded-xl border p-2.5 transition-all ${paletteIdx === i ? "border-[#1C1B19] ring-2 ring-[#1C1B19]/10" : "border-[#D8D2C4] hover:border-[#8A8578]"} bg-white`}
                  >
                    <div className="flex h-6 rounded overflow-hidden mb-1.5">
                      {p.colors.map((c, ci) => <div key={ci} className="flex-1" style={{ backgroundColor: c }} />)}
                    </div>
                    <div className="text-[11px] font-medium">{p.name}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#D8D2C4] rounded-xl p-3.5 flex items-center gap-3">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-[10px] f-mono text-[#8A8578] mb-1">HEX VALUE</div>
                  <input
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-full f-mono text-sm border border-[#D8D2C4] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3A5A8C]"
                  />
                </div>
              </div>
            )}
          </PickGroup>

          {/* Font */}
          <PickGroup label="Typeface">
            <div className="space-y-1.5 mb-2">
              {FONTS.map((f, i) => (
                <button
                  key={f.name}
                  onClick={() => { setFontIdx(i); setCustomFont(null); }}
                  className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-all flex items-center justify-between ${fontIdx === i && !customFont ? "border-[#1C1B19] ring-2 ring-[#1C1B19]/10 bg-white" : "border-[#D8D2C4] hover:border-[#8A8578] bg-white/60"}`}
                >
                  <span style={{ fontFamily: f.stack }} className="text-lg">{f.name}</span>
                  <span className="f-mono text-[9px] text-[#8A8578]">{f.mood}</span>
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8578]" />
                <input
                  value={customFont || fontQuery}
                  onChange={(e) => { setFontQuery(e.target.value); setCustomFont(null); setFontSearchOpen(true); }}
                  onFocus={() => setFontSearchOpen(true)}
                  placeholder="Search any Google Font…"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-[#D8D2C4] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3A5A8C]"
                />
              </div>
              {fontSearchOpen && fontQuery && filteredFonts.length > 0 && !customFont && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#D8D2C4] rounded-xl overflow-hidden shadow-lg max-h-56 overflow-y-auto">
                  {filteredFonts.map((f) => (
                    <button
                      key={f}
                      onClick={() => { loadFont(f); setCustomFont(f); setFontQuery(""); setFontSearchOpen(false); }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#EDE9E0] text-sm border-b border-[#EDE9E0] last:border-0"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PickGroup>

          {/* Layout */}
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

/* ---------- canvas with rulers, pasteboard, real aspect ratio ---------- */

function CanvasWithRuler({ layoutId, palette, font, client, densityId, imageryId, layerVis, useCustomColor, customHex }) {
  const d = client.deliverable;
  const ratio = d.sq ? 1 : d.w / d.h;

  // constrain canvas to a reasonable box while preserving true aspect ratio
  const maxW = 480, maxH = 420;
  let boxW, boxH;
  if (ratio >= maxW / maxH) { boxW = maxW; boxH = maxW / ratio; }
  else { boxH = maxH; boxW = maxH * ratio; }

  const bg = palette ? palette.colors[1] : "#FAFAF7";
  const ink = palette ? palette.colors[0] : "#B8B4A8";
  const accent = useCustomColor ? customHex : (palette ? palette.colors[2] : "#B8B4A8");
  const fontStack = font ? font.stack : "'Inter', sans-serif";
  const align = layoutId === "left-align" || layoutId === "split" ? "left" : "center";
  const pad = densityId === "dense" ? "1rem" : densityId === "structured" ? "1.75rem" : "2.25rem";

  const rulerTicks = (len, count = 10) => Array.from({ length: count + 1 }, (_, i) => i);

  return (
    <div className="inline-block bg-[#F4F1EA] p-6 rounded-lg border border-[#C7C1B2]">
      <div className="flex">
        <div style={{ width: 20 }} />
        <div className="flex-1 h-5 relative border-b border-[#C7C1B2] mb-1" style={{ width: boxW }}>
          {rulerTicks(boxW).map((i) => (
            <div key={i} className="absolute bottom-0 w-px bg-[#B0AA9A]" style={{ left: `${(i / 10) * 100}%`, height: i % 5 === 0 ? 8 : 4 }} />
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="w-5 relative border-r border-[#C7C1B2] mr-1" style={{ height: boxH }}>
          {rulerTicks(boxH).map((i) => (
            <div key={i} className="absolute right-0 h-px bg-[#B0AA9A]" style={{ top: `${(i / 10) * 100}%`, width: i % 5 === 0 ? 8 : 4 }} />
          ))}
        </div>

        <div
          className="relative rounded-sm overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.15)] flex flex-col justify-center transition-colors duration-300"
          style={{ width: boxW, height: boxH, backgroundColor: layerVis.background ? bg : "#FFFFFF", padding: layoutId === "full-bleed" ? 0 : pad }}
        >
          {layoutId === "split" ? (
            <div className="flex h-full w-full">
              <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: layerVis.accent ? accent : "transparent" }}>
                {imageryId === "geometric" && layerVis.accent && <div className="w-12 h-12 rotate-45" style={{ backgroundColor: bg, opacity: 0.5 }} />}
              </div>
              <div className="flex-1 flex flex-col justify-center px-5">
                {layerVis.headline && <div className="text-xl font-semibold" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>}
                {layerVis.subhead && <div className="text-[11px] mt-1 opacity-70" style={{ color: ink }}>{client.type}</div>}
              </div>
            </div>
          ) : layoutId === "full-bleed" ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 relative" style={{ backgroundColor: layerVis.accent ? accent : bg }}>
              {layerVis.headline && <div className="text-2xl font-bold text-center px-6" style={{ color: bg, fontFamily: fontStack }}>{client.name}</div>}
              {layerVis.subhead && <div className="text-[11px] opacity-80" style={{ color: bg }}>{client.type}</div>}
            </div>
          ) : (
            <div className={`flex flex-col ${align === "left" ? "items-start text-left" : "items-center text-center"}`}>
              {imageryId && imageryId !== "none" && layerVis.accent && (
                <div
                  className="mb-3"
                  style={{
                    width: 32, height: 32, backgroundColor: accent,
                    borderRadius: imageryId === "photographic" ? "6px" : imageryId === "geometric" ? "0px" : "50%",
                    transform: imageryId === "geometric" ? "rotate(45deg)" : "none",
                  }}
                />
              )}
              {layerVis.headline && <div className="text-2xl font-semibold leading-tight" style={{ color: ink, fontFamily: fontStack }}>{client.name}</div>}
              {layerVis.subhead && <div className="text-[11px] mt-1.5 opacity-60" style={{ color: ink }}>{client.type}</div>}
            </div>
          )}
        </div>
      </div>
      <div className="f-mono text-[10px] text-[#8A8578] mt-2 text-center">{d.dim} · {ratio.toFixed(2)}:1</div>
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
