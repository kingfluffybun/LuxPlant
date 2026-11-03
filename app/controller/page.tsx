"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- constants (from luxplant-app-spec.md) ---------- */
const LEAVES = 9;
const LEAF_LEN = 14;
const TOTAL = LEAVES * LEAF_LEN; // 126
const PLAYLIST_ID = 20; // "All effects"
const FIRST_FREE_ID = 32;
const MAX_PRESET_ID = 250;
const HOST_KEY = "luxplant-host";
const META_KEY = "luxplant-meta";
const META_FILE = "luxplant-meta.json";
const LEAVES_KEY = "luxplant-leaves"; // remembered colours of the 9 leaves
const CUSTOM_KEY = "luxplant-custom"; // remembered single colour
const ORANGE = [255, 160, 0]; // the "Default" look
const isOrange = (c?: number[]) => !!c && Math.abs(c[0] - 255) <= 4 && Math.abs(c[1] - 160) <= 6 && c[2] <= 4;
const ICONS: Record<string, string> = {
  sun: "☀️", leaf: "🌿", moon: "🌙", flame: "🔥", star: "⭐",
  heart: "❤️", drop: "💧", bolt: "⚡", rainbow: "🌈", snow: "❄️",
};

// First-time setup values (see luxplant-app-spec.md, section 2)
const SETUP = { leds: 126, pin: 16, maPerLed: 35, psuMa: 5000, bootBri: 255, type: 22 }; // type 22 = WS281x
const ORDERS = ["GRB", "RGB", "BRG", "RBG", "BGR", "GBR"]; // WLED color order codes 0 to 5

/* ---------- types ---------- */
type Seg = { id: number; start: number; stop: number; col: number[][]; fx: number; sx: number; ix: number; pal: number };
type WState = {
  on: boolean; bri: number; ps: number; pl: number;
  nl: { on: boolean; dur: number; rem?: number };
  seg: Seg[];
};
type Info = { ver: string; name: string; ip: string; leds: { count: number }; wifi?: { signal: number } };
type Named = { id: number; name: string };
type Preset = { n?: string; playlist?: unknown; seg?: { fx?: number; pal?: number; col?: number[][] }[] };
type Meta = Record<string, { icon: string; color: string }>;
type Status = "connecting" | "online" | "offline";
type Tab = "lights" | "presets" | "device";
type SheetKind =
  | null | "effect" | "palette" | "save"
  | { kind: "menu"; id: number }
  | { kind: "rename"; id: number }
  | { kind: "tag"; id: number };

/* ---------- helpers ---------- */
const toHex = (c?: number[]) =>
  "#" + [0, 1, 2].map((i) => (c?.[i] ?? 0).toString(16).padStart(2, "0")).join("");
const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const named = (arr: string[]): Named[] =>
  arr.map((name, id) => ({ id, name })).filter((x) => x.name && x.name !== "RSVD" && x.name !== "-");
const cleanHost = (h: string) => h.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
const clean = (n: string) => n.replace(/^\*\s*/, ""); // WLED marks special palettes with "* "
const uniqueByName = (list: Named[]) => {
  const seen = new Set<string>();
  return list.filter((x) => {
    const k = clean(x.name).toLowerCase();
    return seen.has(k) ? false : (seen.add(k), true);
  });
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function req(base: string, path: string, body?: unknown) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch(base + path, {
      ...(body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

/* ---------- live preview of the plant (drawn like the real one: 9 leaves, 14 LEDs each) ---------- */
// Layout in a 600 x 720 box: [attach x, attach y, direction in degrees, leaf length, leaf width, pot x]
const LEAF_SHAPES = [
  [278, 150, -77, 150, 105, 262], // 1 top centre
  [185, 195, -125, 135, 78, 245], // 2 top left
  [308, 200, -45, 125, 60, 270], // 3 right upper
  [335, 258, -10, 135, 66, 278], // 4 right, below leaf 3
  [135, 295, -160, 140, 76, 238], // 5 left
  [222, 330, -3, 115, 52, 252], // 6 small middle
  [326, 390, -18, 125, 58, 268], // 7 right middle
  [305, 458, 2, 135, 52, 276], // 8 right lower
  [125, 478, 34, 115, 86, 232], // 9 bottom left
];

function drawPlant(ctx: CanvasRenderingContext2D, W: number, H: number, leds: Uint8Array | null) {
  ctx.clearRect(0, 0, W, H);
  // the plant spans x = 0..470 in its design box, so its middle is x = 235
  const sc = Math.min(W / 500, H / 720);
  ctx.save();
  ctx.translate(W / 2 - 235 * sc, (H - 720 * sc) / 2);
  ctx.scale(sc, sc);
  ctx.lineCap = "round";

  // pot
  ctx.fillStyle = "#3a413e";
  ctx.beginPath();
  ctx.moveTo(165, 515); ctx.lineTo(180, 680); ctx.quadraticCurveTo(245, 705, 310, 680); ctx.lineTo(325, 515);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#1a2a1d";
  ctx.beginPath(); ctx.ellipse(245, 515, 82, 22, 0, 0, Math.PI * 2); ctx.fill();

  LEAF_SHAPES.forEach(([ax, ay, deg, L, Wd, px], i) => {
    // stem
    ctx.strokeStyle = "#1f2623"; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(px, 512);
    ctx.quadraticCurveTo(px + (ax - px) * 0.15, ay + (512 - ay) * 0.45, ax, ay);
    ctx.stroke();

    // colours of this leaf's 14 LEDs
    const cols: number[][] = [];
    for (let j = 0; j < LEAF_LEN; j++) {
      const k = (i * LEAF_LEN + j) * 3;
      cols.push(leds && k + 2 < leds.length ? [leds[k], leds[k + 1], leds[k + 2]] : [0, 0, 0]);
    }
    const avg = [0, 1, 2].map((c) => Math.round(cols.reduce((t, x) => t + x[c], 0) / LEAF_LEN));
    const lit = avg[0] + avg[1] + avg[2] > 10;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate((deg * Math.PI) / 180);
    const g = ctx.createLinearGradient(0, 0, L, 0);
    cols.forEach((c, j) => g.addColorStop((j + 0.5) / LEAF_LEN, `rgb(${c[0]},${c[1]},${c[2]})`));
    ctx.fillStyle = lit ? g : "#1d2421";
    ctx.shadowColor = lit ? `rgba(${avg[0]},${avg[1]},${avg[2]},0.85)` : "transparent";
    ctx.shadowBlur = lit ? 34 : 0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(L * 0.05, -Wd * 0.95, L * 0.9, -Wd * 0.85, L, 0);
    ctx.bezierCurveTo(L * 0.9, Wd * 0.85, L * 0.05, Wd * 0.95, 0, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    // soft midrib highlight, like the frosted leaf
    ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(L * 0.08, 0); ctx.lineTo(L * 0.9, 0); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

function PlantPreview({ ledsRef }: { ledsRef: React.MutableRefObject<Uint8Array | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const frame = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.clientWidth, H = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawPlant(ctx, W, H, ledsRef.current);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [ledsRef]);
  return <canvas ref={ref} className="lp-preview" />;
}

/* ---------- page ---------- */
export default function ControllerPage() {
  const [status, setStatus] = useState<Status>("connecting");
  const [live, setLive] = useState(false);
  const [host, setHost] = useState("luxplant.local");
  const [hostInput, setHostInput] = useState("luxplant.local");
  const [tab, setTab] = useState<Tab>("lights");
  const [state, setState] = useState<WState | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [effects, setEffects] = useState<Named[]>([]);
  const [palettes, setPalettes] = useState<Named[]>([]);
  const [presets, setPresets] = useState<Record<string, Preset>>({});
  const [meta, setMeta] = useState<Meta>({});
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [palCols, setPalCols] = useState<Record<string, unknown[]>>({});
  const [nameInput, setNameInput] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [nlMin, setNlMin] = useState(30);
  const [order, setOrder] = useState(0); // 0 = GRB
  const [setupMsg, setSetupMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ d: string; t: string }[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const connId = useRef(0);
  const stateRef = useRef<WState | null>(null);
  const hostRef = useRef("luxplant.local");
  const lastLocal = useRef(0);
  const ledsRef = useRef<Uint8Array | null>(null);
  const leafMem = useRef<number[][] | null>(null); // colour of each leaf, remembered while "whole plant" is on
  const wholeMem = useRef<{ col: number[][]; pal: number } | null>(null); // whole-plant colour, remembered while leaves are on
  const throttle = useRef<Record<string, { t: number; timer?: ReturnType<typeof setTimeout>; body?: unknown }>>({});
  stateRef.current = state;

  const base = () => `http://${hostRef.current}`;

  /* ----- connection ----- */
  async function connect(h: string) {
    const id = ++connId.current;
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("connecting");
    hostRef.current = h;
    try {
      const all = await req(`http://${h}`, "/json");
      if (id !== connId.current) return;
      setState(all.state);
      setInfo(all.info);
      setEffects(named(all.effects).sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.localeCompare(b.name))));
      setPalettes(named(all.palettes));
      setHost(h);
      setHostInput(h);
      localStorage.setItem(HOST_KEY, h);
      setStatus("online");
      loadPresets();
      loadMeta();
      loadPalx(`http://${h}`);
      openWs(h, id);
    } catch {
      if (id === connId.current) setStatus("offline");
    }
  }

  function openWs(h: string, id: number) {
    const ws = new WebSocket(`ws://${h}/ws`);
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";
    ws.onopen = () => setLive(true);
    ws.onmessage = (e) => {
      if (typeof e.data !== "string") {
        // live LED frame from WLED: 'L', version 1, then R,G,B for every LED
        const u = new Uint8Array(e.data as ArrayBuffer);
        if (u[0] === 76 && u[1] === 1) ledsRef.current = u.subarray(2);
        return;
      }
      note("←", e.data);
      try {
        const d = JSON.parse(e.data);
        if (d.state && Date.now() - lastLocal.current > 350) setState(d.state);
        if (d.info) setInfo(d.info);
      } catch {}
    };
    ws.onclose = () => {
      setLive(false);
      if (id === connId.current) setTimeout(() => id === connId.current && openWs(h, id), 3000);
    };
  }

  useEffect(() => {
    connect(localStorage.getItem(HOST_KEY) || "luxplant.local");
    return () => {
      connId.current++;
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ask WLED for the live LED stream only while the Lights tab is open.
  // If the WebSocket is down, fall back to polling /json/live.
  useEffect(() => {
    const ws = wsRef.current;
    if (live && ws && ws.readyState === 1) ws.send(JSON.stringify({ lv: tab === "lights" }));
    if (live || tab !== "lights" || status !== "online") return;
    const t = setInterval(async () => {
      try {
        const d = await req(base(), "/json/live");
        ledsRef.current = Uint8Array.from(
          (d.leds as string[]).flatMap((h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)))
        );
      } catch {}
    }, 400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, live, status]);

  /* ----- sending ----- */
  function note(d: string, t: string) {
    setLog((l) => [{ d, t: t.length > 400 ? t.slice(0, 400) + "…" : t }, ...l].slice(0, 12));
  }

  /** Ask the plant for its real state shortly after a tap, so the screen always matches the plant. */
  function resync(delay = 400) {
    setTimeout(async () => {
      try {
        const r = await req(base(), "/json/state");
        if (r?.seg) setState(r);
      } catch {}
    }, delay);
  }

  async function send(body: object, slider = false) {
    lastLocal.current = slider ? Date.now() : 0; // after a tap, always accept the device's answer
    note("→", JSON.stringify(body));
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) return void ws.send(JSON.stringify(body));
    try {
      const r = await req(base(), "/json/state", { ...body, v: true });
      if (r?.seg) setState(r);
    } catch {
      setStatus("offline");
    }
  }

  function sendThrottled(key: string, body: object) {
    const e = (throttle.current[key] ??= { t: 0 });
    e.body = body;
    const wait = 90 - (Date.now() - e.t);
    if (wait <= 0) {
      e.t = Date.now();
      send(body, true);
    } else if (!e.timer) {
      e.timer = setTimeout(() => {
        e.timer = undefined;
        e.t = Date.now();
        send(e.body as object, true);
      }, wait);
    }
  }

  /** Apply the same segment properties to every segment that exists right now. */
  function applyAll(props: Partial<Seg>, key?: string) {
    const s = stateRef.current;
    if (!s) return;
    setState({ ...s, seg: s.seg.map((g) => ({ ...g, ...props })) });
    const body = { seg: s.seg.map((g) => ({ id: g.id, ...props })) };
    key ? sendThrottled(key, body) : send(body);
  }

  function saveLeafMem(cols: number[][]) {
    leafMem.current = cols;
    try { localStorage.setItem(LEAVES_KEY, JSON.stringify(cols)); } catch {}
  }

  function readLeafMem(): number[][] | null {
    if (leafMem.current) return leafMem.current;
    try {
      const v = JSON.parse(localStorage.getItem(LEAVES_KEY) || "null");
      if (Array.isArray(v) && v.length === LEAVES) return (leafMem.current = v);
    } catch {}
    return null;
  }

  function forgetLeaves() {
    leafMem.current = null;
    wholeMem.current = null;
    try { localStorage.removeItem(LEAVES_KEY); } catch {}
  }

  /** Average colour a leaf is showing right now, from the live LED stream. */
  function leafLive(i: number): number[] | undefined {
    const l = ledsRef.current;
    if (!l || l.length < (i + 1) * LEAF_LEN * 3) return undefined;
    const t = [0, 0, 0];
    for (let j = 0; j < LEAF_LEN; j++) for (let c = 0; c < 3; c++) t[c] += l[(i * LEAF_LEN + j) * 3 + c];
    const avg = t.map((x) => Math.round(x / LEAF_LEN));
    return avg[0] + avg[1] + avg[2] > 30 ? avg : undefined;
  }

  /** The colour a leaf is showing now, even when a palette drives it. */
  function frozenColor(g: Seg): number[] {
    return palSpread(g.pal, g.id) ?? leafLive(g.id) ?? g.col?.[0] ?? ORANGE;
  }

  function setLeafColor(id: number, hex: string) {
    const s = stateRef.current;
    if (!s) return;
    const rgb = toRgb(hex);
    const onPalette = s.seg.some((g) => g.pal !== 0);
    // Changing one leaf while a palette is running switches EVERY leaf to custom colours (Default palette).
    // The other leaves keep roughly the colour they were showing, so nothing jumps.
    const colorOf = (g: Seg) => (g.id === id ? rgb : onPalette ? frozenColor(g) : g.col?.[0] ?? rgb);
    const segs = s.seg.map((g) => ({ id: g.id, col: [colorOf(g)], pal: 0 }));
    setState({ ...s, seg: s.seg.map((g, i) => ({ ...g, col: segs[i].col, pal: 0 })) });
    saveLeafMem(segs.map((x) => x.col[0]));
    if (onPalette) send({ seg: segs });
    else sendThrottled("leaf" + id, { seg: [segs.find((x) => x.id === id)!] });
  }

  /** Change segments one by one (each may get different values), update the screen and send it. */
  function applySegs(make: (g: Seg) => Partial<Seg>) {
    const s = stateRef.current;
    if (!s) return;
    const patches = s.seg.map((g) => ({ id: g.id, ...make(g) }));
    setState({ ...s, seg: s.seg.map((g, i) => ({ ...g, ...patches[i] })) });
    send({ seg: patches });
  }

  /** Whole-plant colour pick: this is where the plant moves from Default/palette to Custom. */
  function pickWhole(hex: string) {
    const rgb = toRgb(hex);
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(rgb)); } catch {}
    applyAll({ col: [rgb], pal: 0 }, "col");
  }

  /** Picking "Custom" in the palette list: bring back the colours the user chose before. */
  function useCustom() {
    const s = stateRef.current;
    if (!s) return;
    const alreadyCustom = s.seg.every((g) => g.pal === 0) && s.seg.some((g) => !isOrange(g.col?.[0]));
    if (alreadyCustom) return;
    if (s.seg.length === LEAVES && s.seg.every((g, i) => g.id === i)) {
      const mem = readLeafMem();
      send({ seg: s.seg.map((g) => ({ id: g.id, pal: 0, col: [mem ? mem[g.id] : frozenColor(g)] })) });
      return;
    }
    let c: number[] | undefined;
    try { c = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "null") ?? undefined; } catch {}
    const g0 = s.seg[0];
    const fallback = midRgb(g0?.pal) ?? (isOrange(g0?.col?.[0]) ? [255, 0, 120] : g0?.col?.[0]) ?? [255, 0, 120];
    applyAll({ pal: 0, col: [c && !isOrange(c) ? c : fallback] });
  }

  function setBrightness(bri: number) {
    if (stateRef.current) setState({ ...stateRef.current, bri });
    sendThrottled("bri", { bri });
  }

  /* ----- segments ----- */
  const seg = state?.seg ?? [];
  const leafMode =
    seg.length === LEAVES && seg.every((s, i) => s.id === i && s.start === i * LEAF_LEN && s.stop === (i + 1) * LEAF_LEN);

  function splitLeaves() {
    const b = seg[0];
    if (!b) return;
    wholeMem.current = { col: b.col, pal: b.pal }; // so "whole plant" can come back as it was
    const mem = readLeafMem(); // leaf colours from last time, if any
    send({
      seg: Array.from({ length: LEAVES }, (_, i) => ({
        id: i, start: i * LEAF_LEN, stop: (i + 1) * LEAF_LEN, on: true,
        fx: b.fx, sx: b.sx, ix: b.ix, pal: mem ? 0 : b.pal, col: mem ? [mem[i]] : b.col,
      })),
    });
  }

  function mergeLeaves() {
    const custom = seg.every((g) => g.pal === 0) && seg.some((g) => !isOrange(g.col?.[0]));
    if (custom) saveLeafMem(seg.map((g) => g.col?.[0] ?? [255, 160, 0])); // remember the leaves before leaving
    const w = wholeMem.current;
    const whole = custom && w ? { col: w.col, pal: w.pal } : {};
    send({
      seg: [
        ...Array.from({ length: LEAVES - 1 }, (_, i) => ({ id: i + 1, stop: 0 })),
        { id: 0, start: 0, stop: TOTAL, ...whole },
      ],
    });
  }

  /* ----- presets ----- */
  async function loadPresets() {
    try {
      const p = await req(base(), `/presets.json?t=${Date.now()}`);
      setPresets(p);
    } catch {}
  }

  // Real palette colours, the same data WLED's own page uses to draw the palette bars.
  async function loadPalx(b: string) {
    try {
      const all: Record<string, unknown[]> = {};
      let max = 0;
      for (let page = 0; page <= max && page < 40; page++) {
        const d = await req(b, `/json/palx?page=${page}`);
        max = d.m ?? 0;
        Object.assign(all, d.p);
      }
      setPalCols(all);
    } catch {}
  }

  async function loadMeta() {
    let m: Meta = {};
    try { m = JSON.parse(localStorage.getItem(META_KEY) || "{}"); } catch {}
    try { m = await req(base(), `/${META_FILE}?t=${Date.now()}`); } catch {}
    setMeta(m);
  }

  async function saveMeta(m: Meta) {
    setMeta(m);
    localStorage.setItem(META_KEY, JSON.stringify(m)); // fallback copy on this phone
    try {
      const fd = new FormData();
      fd.append("data", new Blob([JSON.stringify(m)], { type: "application/json" }), META_FILE);
      await fetch(base() + "/upload", { method: "POST", body: fd });
    } catch {}
  }

  const presetIds = Object.keys(presets)
    .map(Number)
    .filter((i) => i > 0 && presets[String(i)]?.n !== undefined)
    .sort((a, b) => a - b);

  async function savePreset(id: number, name: string) {
    await send({ psave: id, n: name, ib: true, sb: true });
    await sleep(700);
    loadPresets();
  }

  function saveNew() {
    let id = FIRST_FREE_ID;
    while (presets[String(id)] && id <= MAX_PRESET_ID) id++;
    if (id > MAX_PRESET_ID) return;
    savePreset(id, nameInput.trim() || "My preset");
    setSheet(null);
  }

  async function rename(id: number) {
    // WLED has no rename call: apply the preset, then save it again under the same ID.
    await send({ ps: id });
    await sleep(400);
    await savePreset(id, nameInput.trim() || "My preset");
    setSheet(null);
  }

  async function deletePreset(id: number) {
    await send({ pdel: id });
    await sleep(700);
    loadPresets();
    setSheet(null);
  }

  /* ----- first-time setup ----- */
  async function waitForPlant(): Promise<Info | null> {
    for (let i = 0; i < 25; i++) {
      await sleep(2000);
      try { return await req(base(), "/json/info"); } catch {}
    }
    return null;
  }

  async function applyLedSettings() {
    setBusy(true);
    setSetupMsg("Writing LED settings…");
    try {
      const r = await fetch(base() + "/json/cfg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hw: { led: { total: SETUP.leds, maxpwr: SETUP.psuMa, ins: [{
            start: 0, len: SETUP.leds, pin: [SETUP.pin], order, rev: false, skip: 0,
            type: SETUP.type, ref: false, rgbwm: 0, ledma: SETUP.maPerLed,
          }] } },
          def: { on: true, bri: SETUP.bootBri },
        }),
      });
      if (!r.ok) throw new Error();
      await sleep(500);
      await req(base(), "/json/state", { rb: true }).catch(() => {});
      setSetupMsg("Restarting the plant… this takes about 20 seconds.");
      await sleep(3000);
      const i = await waitForPlant();
      if (!i) { setSetupMsg("The plant didn't come back. Check it has power, then try again."); }
      else {
        setInfo(i);
        setSetupMsg(i.leds.count === SETUP.leds
          ? "Done. Now run the color test below."
          : `The plant restarted but reports ${i.leds.count} LEDs. Check WLED's own settings page at /settings/leds.`);
        connect(hostRef.current);
      }
    } catch {
      setSetupMsg("Couldn't write the settings. Check the connection and try again.");
    }
    setBusy(false);
  }

  async function restorePresets() {
    setBusy(true);
    setSetupMsg("Restoring presets…");
    try {
      const file = await fetch("/luxplant-presets.json");
      if (!file.ok) throw new Error();
      const fd = new FormData();
      fd.append("data", new Blob([await file.text()], { type: "application/json" }), "presets.json");
      const r = await fetch(base() + "/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error();
      await sleep(800);
      await loadPresets();
      setSetupMsg("Presets restored.");
    } catch {
      setSetupMsg("Couldn't restore presets. Is public/luxplant-presets.json in your project?");
    }
    setBusy(false);
  }

  function testColor(rgb: number[]) {
    send({ on: true });
    applyAll({ col: [rgb] });
  }

  /* ----- derived ----- */
  const first = seg[0];
  // Names: effect and palette names come from the plant itself, never numbers.
  const fxName = (id?: number) => clean(effects.find((e) => e.id === id)?.name ?? "Custom effect");
  const palNameOf = (id?: number) => clean(palettes.find((p) => p.id === id)?.name ?? "Custom palette");
  const shownIds = presetIds.filter((i) => i !== PLAYLIST_ID);
  const presetNames: Record<number, string> = {};
  const seenNames: Record<string, number> = {};
  for (const id of shownIds) {
    const p = presets[String(id)];
    const g = p?.seg?.[0];
    const own = p?.n ?? "";
    let nm = own && !/^\d+$/.test(own.trim()) ? own : g ? `${fxName(g.fx)} · ${palNameOf(g.pal)}` : `Preset ${id}`;
    seenNames[nm] = (seenNames[nm] ?? 0) + 1;
    if (seenNames[nm] > 1) nm += ` ${seenNames[nm]}`;
    presetNames[id] = nm;
  }
  // Every preset gets its own colour (golden-angle hues), unless you picked one yourself.
  const stopsOf = (id?: number) =>
    id == null ? [] : ((palCols[String(id)] ?? []).filter((e) => Array.isArray(e) && e.length >= 4) as number[][]);
  /** CSS gradient of a palette's real colours, or undefined when the plant didn't give any. */
  const gradientOf = (id?: number) => {
    const st = stopsOf(id);
    if (st.length < 2) return undefined;
    return `linear-gradient(90deg, ${st.map((e) => `rgb(${e[1]},${e[2]},${e[3]}) ${Math.round((e[0] / 255) * 100)}%`).join(", ")})`;
  };
  /** Colour of a palette at position u (0 to 1), from the plant's real palette data. */
  const palAt = (id: number | undefined, u: number): number[] | undefined => {
    const st = stopsOf(id);
    if (st.length < 2) return undefined;
    const pos = u * 255;
    for (let i = 1; i < st.length; i++) {
      if (pos <= st[i][0]) {
        const a = st[i - 1], b = st[i], f = (pos - a[0]) / Math.max(1, b[0] - a[0]);
        return [1, 2, 3].map((j) => Math.round(a[j] + (b[j] - a[j]) * f));
      }
    }
    const l = st[st.length - 1];
    return [l[1], l[2], l[3]];
  };
  /** First clearly visible colour of a palette, reading left to right (skips the black some palettes start with). */
  const litStart = (id?: number) => {
    const st = stopsOf(id);
    return st.find((x) => x[1] + x[2] + x[3] > 60) ?? st[0];
  };
  const leftmostRgb = (id?: number): number[] | undefined => {
    const e = litStart(id);
    return e ? [e[1], e[2], e[3]] : undefined;
  };
  /** Colour of leaf i when a palette is spread across the nine leaves, starting at the palette's leftmost colour. */
  const palSpread = (id: number | undefined, i: number): number[] | undefined => {
    const e = litStart(id);
    if (!e) return undefined;
    const u0 = e[0] / 255;
    return palAt(id, u0 + (1 - u0) * ((i + 0.5) / LEAVES));
  };
  const midRgb = (id?: number) => {
    const st = stopsOf(id);
    const lit = st.filter((x) => x[1] + x[2] + x[3] > 60);
    const e = lit[Math.floor(lit.length / 2)] ?? st[Math.floor(st.length / 2)];
    return e ? [e[1], e[2], e[3]] : undefined;
  };
  const midColor = (id?: number) => {
    const c = midRgb(id);
    return c ? `rgb(${c[0]},${c[1]},${c[2]})` : undefined;
  };
  const autoColor = (idx: number) => `hsl(${Math.round((idx * 137.5) % 360)} 70% 58%)`;
  const autoIcons = Object.keys(ICONS);

  // Pickers: only what the presets use (plus Solid / Default and what is active now). "Show all" has the rest.
  const usedFx = new Set<number>([0, first?.fx ?? 0]);
  const usedPal = new Set<number>([0, first?.pal ?? 0]);
  presetIds.forEach((i) => presets[String(i)]?.seg?.forEach((g) => { if (g.fx != null) usedFx.add(g.fx); if (g.pal != null) usedPal.add(g.pal); }));
  const pickList = (kind: "effect" | "palette") => {
    const all = kind === "effect" ? effects : palettes;
    const used = kind === "effect" ? usedFx : usedPal;
    const list = showAll ? all : all.filter((x) => used.has(x.id));
    const rest = uniqueByName(list)
      .map((x) => ({ id: x.id, name: clean(x.name) }))
      .filter((x) => kind === "effect" || (x.id !== 0 && !/^custom/i.test(x.name))) // "Custom" is our own entry now
      .sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.localeCompare(b.name)));
    return kind === "palette" ? [{ id: 0, name: "Default" }, { id: -1, name: "Custom" }, ...rest] : rest;
  };

  // Palette label: "Default" is the orange look, "Custom" is any colours you picked yourself.
  const allPal0 = seg.length > 0 && seg.every((g) => g.pal === 0);
  const isCustom = allPal0 && seg.some((g) => !isOrange(g.col?.[0]));
  const curPalId = first?.pal ? first.pal : isCustom ? -1 : 0;
  const rgbCss = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const customGradient = () => {
    const cols = seg.map((g) => rgbCss(g.col?.[0] ?? ORANGE));
    return cols.length > 1 ? `linear-gradient(90deg, ${cols.join(", ")})` : `linear-gradient(90deg, ${cols[0] ?? "#888"}, ${cols[0] ?? "#888"})`;
  };
  const orangeBar = `linear-gradient(90deg, ${rgbCss(ORANGE)}, ${rgbCss(ORANGE)})`;
  const barFor = (id: number) => (id === 0 ? orangeBar : id === -1 ? customGradient() : gradientOf(id) ?? "var(--surface-2)");
  const palLabel = curPalId === 0 ? "Default" : curPalId === -1 ? "Custom" : palNameOf(first?.pal);

  // Swatches show the colour you are actually seeing: the palette's colours while a palette runs, your own colour otherwise.
  const wholeShown = first?.pal ? leftmostRgb(first.pal) ?? first.col?.[0] : first?.col?.[0];
  const leafShown = (g: Seg) => (g.pal ? palSpread(g.pal, g.id) ?? g.col?.[0] : g.col?.[0]);

  const effName = effects.find((e) => e.id === first?.fx)?.name ?? (first ? "Custom effect" : "");
  const palName = palettes.find((p) => p.id === first?.pal)?.name ?? (first ? "Custom palette" : "");
  const playing = state?.pl === PLAYLIST_ID;
  const nl = state?.nl;
  const insecure = typeof window !== "undefined" && window.location.protocol === "https:";

  const css = <link rel="stylesheet" href="/css/controller.css" precedence="default" />;

  /* ---------- offline screen ---------- */
  if (status !== "online") {
    return (
      <div className="lp">
        {css}
        <div className="lp-offline">
          <h1>{status === "connecting" ? "Looking for your LuxPlant…" : "Can't find your LuxPlant"}</h1>
          {status === "offline" && (
            <>
              <ul>
                <li>Is the plant plugged in and glowing?</li>
                <li>Is your phone on the same Wi-Fi as the plant?</li>
              </ul>
              {insecure && (
                <div className="lp-warn">
                  This page is loaded over HTTPS, so your browser blocks it from talking to the plant. Open it over
                  http:// instead (for example the local dev server).
                </div>
              )}
              <button className="lp-btn primary" onClick={() => connect(host)}>Retry</button>
              <input
                className="lp-input"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                placeholder="luxplant.local or 192.168.1.50"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <button className="lp-btn center" onClick={() => connect(cleanHost(hostInput) || "luxplant.local")}>
                Connect to this address
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const filter = (list: Named[]) => list.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()));
  const menuId = typeof sheet === "object" && sheet ? sheet.id : 0;
  const menuPreset = presets[String(menuId)];
  const closeSheet = () => { setSheet(null); setSearch(""); setShowAll(false); setConfirmDel(false); };

  /* ---------- main UI ---------- */
  return (
    <div className="lp">
      {css}
      <header className="lp-head">
        <h1>LuxPlant</h1>
        <div className="lp-status">
          <span className={"lp-dot" + (live ? " on" : "")} />
          {live ? "Live" : "Reconnecting…"}
        </div>
      </header>

      <main className="lp-main">
        {tab === "lights" && state && (
          <>
            <section className="lp-card">
              <h2>Your plant right now</h2>
              <PlantPreview ledsRef={ledsRef} />
              <div className="lp-muted">Live from the plant. It updates the moment you change something.</div>
            </section>

            <section className="lp-card">
              <div className="lp-row">
                <h2>{state.on ? "Lights on" : "Lights off"}</h2>
                <button className={"lp-power" + (state.on ? " on" : "")} onClick={() => send({ on: !state.on })} aria-label="Power">⏻</button>
              </div>
              <div className="lp-slider">
                <label><span>Brightness</span><span>{Math.round((state.bri / 255) * 100)}%</span></label>
                <input type="range" min={1} max={255} value={state.bri} onChange={(e) => setBrightness(+e.target.value)} />
              </div>
            </section>

            <section className="lp-card">
              <h2>Color</h2>
              {!leafMode && (
                <div className="lp-all">
                  <div className="lp-swatch" style={{ background: toHex(wholeShown) }}>
                    <input type="color" value={toHex(wholeShown)} onChange={(e) => pickWhole(e.target.value)} />
                  </div>
                  <div>
                    <div>Whole plant</div>
                    <div className="lp-muted">Tap to pick a color</div>
                  </div>
                </div>
              )}
              {leafMode ? (
                <>
                  <div className="lp-muted">
                    {seg.some((g) => g.pal !== 0)
                      ? "The leaves follow a palette. Pick any leaf color to switch every leaf to Custom colors."
                      : "Tap a leaf to pick its color."}
                  </div>
                  <div className="lp-leaves">
                    {seg.map((s) => (
                      <div className="lp-leaf" key={s.id}>
                        <div className="lp-swatch" style={{ background: toHex(leafShown(s)) }}>
                          <input type="color" value={toHex(leafShown(s))} onChange={(e) => setLeafColor(s.id, e.target.value)} />
                        </div>
                        Leaf {s.id + 1}
                      </div>
                    ))}
                  </div>
                  <button className="lp-btn center" onClick={mergeLeaves}>Use whole plant as one</button>
                </>
              ) : (
                <button className="lp-btn center" onClick={splitLeaves}>Control each leaf separately</button>
              )}
            </section>

            <section className="lp-card">
              <h2>Effect</h2>
              <button className="lp-btn" onClick={() => setSheet("effect")}>{clean(effName)}<span>›</span></button>
              <div className="lp-slider">
                <label><span>Speed</span><span>{Math.round(((first?.sx ?? 0) / 255) * 100)}%</span></label>
                <input type="range" min={0} max={255} value={first?.sx ?? 0} onChange={(e) => applyAll({ sx: +e.target.value }, "sx")} />
              </div>
              <div className="lp-slider">
                <label><span>Intensity</span><span>{Math.round(((first?.ix ?? 0) / 255) * 100)}%</span></label>
                <input type="range" min={0} max={255} value={first?.ix ?? 0} onChange={(e) => applyAll({ ix: +e.target.value }, "ix")} />
              </div>
              <h2>Palette</h2>
              <button className="lp-btn" onClick={() => setSheet("palette")}><span>{palLabel}</span><span className="lp-pal" style={{ background: barFor(curPalId) }} /><span>›</span></button>
            </section>

            <section className="lp-card">
              <h2>Night light</h2>
              {nl?.on ? (
                <>
                  <div className="lp-muted">Fading out… {Math.max(1, Math.ceil((nl.rem ?? nl.dur * 60) / 60))} min left</div>
                  <button className="lp-btn center" onClick={() => send({ nl: { on: false } })}>Cancel</button>
                </>
              ) : (
                <div className="lp-row">
                  <select className="lp-input" style={{ width: "50%" }} value={nlMin} onChange={(e) => setNlMin(+e.target.value)}>
                    {[10, 15, 30, 60, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                  <button className="lp-btn primary" style={{ width: "50%" }} onClick={() => send({ nl: { on: true, dur: nlMin, mode: 1, tbri: 0 } })}>Start fade</button>
                </div>
              )}
            </section>
          </>
        )}

        {tab === "presets" && (
          <>
            <section className="lp-card">
              <div className="lp-row">
                <div>
                  <h2>Auto cycle</h2>
                  <div className="lp-muted">{playing ? "Playing all effects" : "Plays every effect, one after another"}</div>
                </div>
                <button
                  className={"lp-btn " + (playing ? "center" : "primary")}
                  style={{ width: "auto" }}
                  onClick={() => { if (!playing) forgetLeaves(); send(playing ? { pl: -1 } : { ps: PLAYLIST_ID }); resync(); }}
                >
                  {playing ? "Stop" : "Start"}
                </button>
              </div>
            </section>

            <button className="lp-btn primary" onClick={() => { setNameInput(""); setSheet("save"); }}>Save current look</button>

            <div className="lp-grid">
              {shownIds.map((id, idx) => {
                const m = meta[String(id)];
                const g = presets[String(id)]?.seg?.[0];
                const pid = g?.pal;
                const solid = (c: string) => `linear-gradient(90deg, ${c}, ${c})`;
                const segCol = g?.col?.[0] ? `rgb(${g.col[0][0]},${g.col[0][1]},${g.col[0][2]})` : undefined;
                const tagColor = m?.color ?? (pid ? midColor(pid) : undefined) ?? segCol ?? autoColor(idx);
                const grad = m?.color ? solid(m.color) : (pid ? gradientOf(pid) : undefined) ?? solid(tagColor);
                const custom = !!presets[String(id)]?.n && !/^\d+$/.test(presets[String(id)].n!.trim());
                return (
                  <div key={id} style={{ position: "relative" }}>
                    <button
                      className={"lp-preset" + (state?.ps === id ? " active" : "")}
                      style={{ ["--tag" as string]: tagColor, ["--grad" as string]: grad, width: "100%", height: "100%" }}
                      onClick={() => { forgetLeaves(); send({ ps: id }); resync(); }}
                    >
                      <span className="ic">{ICONS[m?.icon ?? autoIcons[idx % autoIcons.length]] ?? "✨"}</span>
                      <span>
                        <div className="nm">{presetNames[id]}</div>
                        {custom && g && <div className="id">{fxName(g.fx)} · {palNameOf(g.pal)}</div>}
                      </span>
                    </button>
                    <button className="lp-more" aria-label="Preset options" onClick={() => { setConfirmDel(false); setSheet({ kind: "menu", id }); }}>⋯</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "device" && (
          <>
            <section className="lp-card">
              <h2>Your LuxPlant</h2>
              <dl className="lp-info">
                <dt>Name</dt><dd>{info?.name}</dd>
                <dt>Address</dt><dd>{host}</dd>
                <dt>IP</dt><dd>{info?.ip}</dd>
                <dt>LEDs</dt><dd>{info?.leds.count}</dd>
                <dt>WLED version</dt><dd>{info?.ver}</dd>
                <dt>Wi-Fi signal</dt><dd>{info?.wifi ? `${info.wifi.signal}%` : "–"}</dd>
                <dt>Connection</dt><dd>{live ? "Live" : "Reconnecting…"}</dd>
              </dl>
            </section>
            <section className="lp-card">
              <h2>First-time setup</h2>
              <div className="lp-muted">
                Sets up the LEDs for you: WS281x, {SETUP.leds} LEDs, pin {SETUP.pin}, {SETUP.maPerLed} mA each,{" "}
                {SETUP.psuMa} mA power limit, full brightness on boot. The plant restarts afterwards.
              </div>
              <select className="lp-input" value={order} onChange={(e) => setOrder(+e.target.value)}>
                {ORDERS.map((o, i) => <option key={o} value={i}>Color order: {o}{i === 0 ? " (default)" : ""}</option>)}
              </select>
              <button className="lp-btn primary" disabled={busy} onClick={applyLedSettings}>1. Apply LED settings</button>
              <button className="lp-btn center" disabled={busy} onClick={restorePresets}>2. Restore LuxPlant presets</button>
              <div className="lp-muted">3. Color test: each button should light the plant in that color. If red looks green, pick another color order above and apply again.</div>
              <div className="lp-row">
                <button className="lp-btn center" onClick={() => testColor([255, 0, 0])}>Red</button>
                <button className="lp-btn center" onClick={() => testColor([0, 255, 0])}>Green</button>
                <button className="lp-btn center" onClick={() => testColor([0, 0, 255])}>Blue</button>
              </div>
              {setupMsg && <div className="lp-warn">{setupMsg}</div>}
            </section>
            <section className="lp-card">
              <h2>Change address</h2>
              <input className="lp-input" value={hostInput} onChange={(e) => setHostInput(e.target.value)} autoCapitalize="none" autoCorrect="off" />
              <button className="lp-btn center" onClick={() => connect(cleanHost(hostInput) || "luxplant.local")}>Connect</button>
            </section>
            <section className="lp-card">
              <h2>JSON sent and received</h2>
              <div className="lp-muted">Every change is sent to the plant as WLED JSON. Newest first.</div>
              <div className="lp-log">
                {log.length === 0 && <div className="lp-muted">Nothing yet.</div>}
                {log.map((l, i) => (
                  <pre key={i}><b>{l.d}</b> {l.t}</pre>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <nav className="lp-nav">
        {(["lights", "presets", "device"] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t === "lights" ? "Lights" : t === "presets" ? "Presets" : "Plant"}
          </button>
        ))}
      </nav>

      {/* ----- sheets ----- */}
      {sheet && (
        <div className="lp-backdrop" onClick={closeSheet}>
          <div className="lp-sheet" onClick={(e) => e.stopPropagation()}>
            {(sheet === "effect" || sheet === "palette") && (
              <>
                <h3>{sheet === "effect" ? "Choose an effect" : "Choose a palette"}</h3>
                <input className="lp-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                <div className="lp-list">
                  {filter(pickList(sheet === "effect" ? "effect" : "palette")).map((x) => (
                    <button
                      key={x.id}
                      className={x.id === (sheet === "effect" ? first?.fx : curPalId) ? "sel" : ""}
                      onClick={() => {
                        if (sheet === "effect") {
                          const left = x.id === 0 && first?.pal ? leftmostRgb(first.pal) : undefined;
                          if (left) {
                            // Solid with a palette: use the palette's leftmost colour (per leaf: the colour at that leaf's spot).
                            // The palette stays selected, so switching to another effect brings its colours back.
                            applySegs((g) => ({ fx: 0, col: [leafMode ? palSpread(g.pal, g.id) ?? left : left] }));
                          } else applyAll({ fx: x.id });
                        } else if (x.id === 0) applyAll({ pal: 0, col: [ORANGE] }); // Default = the orange look
                        else if (x.id === -1) useCustom(); // Custom = the colours you picked
                        else applyAll({ pal: x.id });
                        closeSheet();
                      }}
                    >
                      <span>{x.name}</span>
                      {sheet === "palette" && <span className="lp-pal" style={{ background: barFor(x.id) }} />}
                    </button>
                  ))}
                </div>
                <button className="lp-btn center" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show fewer" : sheet === "effect" ? "Show all effects" : "Show all palettes"}
                </button>
              </>
            )}

            {sheet === "save" && (
              <>
                <h3>Save current look</h3>
                <input className="lp-input" placeholder="Preset name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                <button className="lp-btn primary" onClick={saveNew}>Save preset</button>
              </>
            )}

            {typeof sheet === "object" && sheet?.kind === "menu" && (
              <>
                <h3>{presetNames[menuId] ?? `Preset ${menuId}`}</h3>
                {!menuPreset?.playlist && (
                  <button className="lp-btn" onClick={() => { setNameInput(presetNames[menuId] ?? ""); setSheet({ kind: "rename", id: menuId }); }}>Rename</button>
                )}
                <button className="lp-btn" onClick={() => setSheet({ kind: "tag", id: menuId })}>Icon and color</button>
                <button className="lp-btn danger" onClick={() => (confirmDel ? deletePreset(menuId) : setConfirmDel(true))}>
                  {confirmDel ? "Tap again to delete" : "Delete"}
                </button>
              </>
            )}

            {typeof sheet === "object" && sheet?.kind === "rename" && (
              <>
                <h3>Rename preset</h3>
                <div className="lp-muted">The plant will apply this preset, then save it again with the new name.</div>
                <input className="lp-input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
                <button className="lp-btn primary" onClick={() => rename(menuId)}>Rename</button>
              </>
            )}

            {typeof sheet === "object" && sheet?.kind === "tag" && (
              <>
                <h3>Icon and color</h3>
                <div className="lp-icons">
                  {Object.entries(ICONS).map(([k, e]) => (
                    <button
                      key={k}
                      className={meta[String(menuId)]?.icon === k ? "sel" : ""}
                      onClick={() => saveMeta({ ...meta, [menuId]: { icon: k, color: meta[String(menuId)]?.color ?? "#FFA000" } })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="color"
                  className="lp-input"
                  style={{ height: 48, padding: 4 }}
                  value={meta[String(menuId)]?.color ?? "#FFA000"}
                  onChange={(e) => saveMeta({ ...meta, [menuId]: { icon: meta[String(menuId)]?.icon ?? "leaf", color: e.target.value } })}
                />
                <button className="lp-btn primary" onClick={closeSheet}>Done</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}