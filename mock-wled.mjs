// Fake WLED for testing the LuxPlant controller without a plant.
// Put PRESET_V1_1.json next to this file, then run:  node mock-wled.mjs
// Optional (enables live WebSocket sync):  npm i -D ws
import http from "node:http";
import fs from "node:fs";

const PORT = 8080;
const presets = JSON.parse(fs.readFileSync(new URL("./PRESET_V1_1.json", import.meta.url), "utf8"));
let meta = null;

// Real WLED names for the IDs that matter here; everything else stays generic.
const effects = Array.from({ length: 220 }, (_, i) => `Effect ${i}`);
const fxNames = { 0: "Solid", 1: "Blink", 2: "Breathe", 3: "Wipe", 8: "Colorloop", 9: "Rainbow", 17: "Twinkle", 41: "Lighthouse", 46: "Gradient",
  51: "Fairytwinkle", 65: "Palette", 66: "Fire 2012", 67: "Colorwaves", 71: "Noise 2", 73: "Noise 4", 74: "Colortwinkles", 80: "Twinklefox",
  101: "Pacifica", 110: "Flow", 115: "Blends", 213: "Effect 213", 218: "Effect 218" };
Object.entries(fxNames).forEach(([k, v]) => (effects[k] = v));
const palettes = Array.from({ length: 200 }, (_, i) => `Palette ${i}`);
const palNames = ["Default", "* Random Cycle", "* Color 1", "* Colors 1&2", "* Color Gradient", "* Colors Only", "Party", "Cloud", "Lava", "Ocean", "Forest",
  "Rainbow", "Rainbow Bands", "Sunset", "Rivendell", "Breeze", "Red & Blue", "Yellowout", "Analogous", "Splash", "Pastel", "Sunset 2", "Beach", "Vintage",
  "Departure", "Landscape", "Beech", "Sherbet", "Hult", "Hult 64", "Drywet", "Jul", "Grintage", "Rewhi", "Tertiary", "Fire", "Icefire", "Cyane", "Light Pink",
  "Autumn", "Magenta", "Magred", "Yelmag", "Yelblu", "Orange & Teal", "Tiamat", "April Night", "Orangery", "C9", "Sakura", "Aurora", "Atlantica", "C9 2",
  "C9 New", "Temperature", "Aurora 2", "Retro Clown", "Candy", "Toxy Reaf", "Fairy Reaf", "Semi Blue", "Pink Candy", "Red Reaf", "Aqua Flash", "Yelblu Hot",
  "Lite Light", "Red Flash", "Blink Red", "Red Shift", "Red Tide", "Candy2"];
palNames.forEach((v, i) => (palettes[i] = v));
palettes[199] = "Custom palette";
// Approximate colour stops [position 0-255, r, g, b] for the palettes the presets use (a real plant sends its own).
const palStops = {
  6: [[0,85,0,171],[64,181,0,75],[128,234,23,5],[192,171,85,0],[255,5,10,215]],
  11: [[0,255,0,0],[42,255,170,0],[85,200,255,0],[127,0,255,60],[170,0,140,255],[212,120,0,255],[255,255,0,120]],
  13: [[0,120,0,0],[64,179,22,0],[128,255,104,0],[192,167,22,18],[255,100,0,103]],
  18: [[0,3,0,255],[64,23,0,255],[128,67,0,255],[192,142,0,45],[255,255,0,0]],
  30: [[0,47,30,2],[64,213,147,24],[128,103,219,52],[192,3,219,207],[255,1,48,214]],
  31: [[0,194,1,1],[94,1,29,18],[132,57,131,28],[255,113,1,1]],
  33: [[0,113,91,147],[72,157,88,78],[89,208,85,33],[107,255,29,11],[141,137,31,39],[255,59,33,89]],
  35: [[0,0,0,0],[46,18,0,0],[96,113,0,0],[119,175,17,1],[174,255,82,4],[202,255,156,4],[234,255,255,4],[255,255,255,255]],
  36: [[0,0,0,0],[59,0,9,45],[119,0,38,255],[149,3,100,255],[180,23,199,255],[217,100,235,255],[255,255,255,255]],
  39: [[0,26,1,1],[51,67,4,1],[104,137,152,52],[163,113,13,1],[204,55,3,1],[255,17,1,1]],
  41: [[0,0,0,0],[63,42,0,45],[127,255,0,255],[191,255,0,45],[255,255,0,0]],
  42: [[0,255,255,0],[85,255,120,0],[170,255,0,120],[255,255,0,255]],
  54: [[0,1,27,105],[56,1,119,221],[99,67,182,112],[127,142,203,11],[155,252,187,2],[198,229,43,1],[255,80,3,3]],
  56: [[0,227,101,3],[117,194,18,19],[255,92,8,192]],
  57: [[0,229,227,1],[15,227,101,3],[142,40,1,80],[198,17,1,79],[255,0,0,45]],
  61: [[0,255,255,255],[45,7,12,255],[112,227,1,127],[140,255,255,255],[196,45,1,99],[255,255,255,255]],
  62: [[0,3,13,43],[104,78,141,240],[188,255,0,0],[255,28,1,1]],
  66: [[0,0,0,0],[99,227,1,1],[130,249,199,95],[155,227,1,1],[255,0,0,0]],
  69: [[0,247,5,0],[28,255,67,1],[58,234,176,51],[84,229,28,1],[140,255,225,44],[216,255,28,1],[255,53,1,1]],
};
function sample(stops, u) {
  const pos = (((u % 1) + 1) % 1) * 255;
  for (let i = 1; i < stops.length; i++) {
    if (pos <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i], f = (pos - a[0]) / Math.max(1, b[0] - a[0]);
      return [1, 2, 3].map((j) => a[j] + (b[j] - a[j]) * f);
    }
  }
  return stops[stops.length - 1].slice(1);
}

const info = { ver: "0.15.0-mock", name: "luxplant", ip: "127.0.0.1", leds: { count: 126 }, wifi: { signal: 80 } };

const seg0 = { id: 0, start: 0, stop: 126, on: true, col: [[255, 160, 0], [0, 0, 0], [0, 0, 0]], fx: 0, sx: 128, ix: 128, pal: 0 };
const state = { on: true, bri: 255, ps: -1, pl: -1, nl: { on: false, dur: 30, rem: -1 }, seg: [seg0] };
let nlTimer;

function applyPreset(id) {
  const p = presets[String(id)];
  if (!p) return;
  if (p.playlist) {
    state.pl = id; state.ps = id;
    p.playlist.ps?.[0] != null && applyPreset(p.playlist.ps[0]);
    state.pl = id; state.ps = id;
    return;
  }
  state.pl = -1; state.ps = id;
  if (p.on != null) state.on = p.on;
  if (p.bri != null) state.bri = p.bri;
  if (p.seg) {
    state.seg = p.seg
      .map((s, i) => ({ ...s, id: s.id ?? i }))
      .filter((s) => s.stop !== 0)
      .map((s) => ({ id: s.id, start: s.start, stop: s.stop, on: s.on ?? true, col: JSON.parse(JSON.stringify(s.col ?? [[255, 160, 0]])), fx: s.fx, sx: s.sx, ix: s.ix, pal: s.pal }));
  }
}

function update(b) {
  if (b.on != null) state.on = b.on;
  if (b.bri != null) state.bri = b.bri;
  if (b.pl === -1) state.pl = -1;
  if (b.nl) {
    Object.assign(state.nl, b.nl);
    clearInterval(nlTimer);
    if (state.nl.on) {
      state.nl.rem = state.nl.dur * 60;
      nlTimer = setInterval(() => { if (--state.nl.rem <= 0) { state.nl.on = false; state.on = false; clearInterval(nlTimer); broadcast(); } }, 1000);
    }
  }
  if (b.ps != null) applyPreset(b.ps);
  if (b.seg) {
    for (const s of b.seg) {
      if (s.stop === 0) { state.seg = state.seg.filter((g) => g.id !== s.id); continue; }
      let g = state.seg.find((x) => x.id === s.id);
      if (!g) { g = { id: s.id, start: 0, stop: 0, on: true, col: [[255, 160, 0]], fx: 0, sx: 128, ix: 128, pal: 0 }; state.seg.push(g); }
      Object.assign(g, s);
    }
    state.seg.sort((a, b2) => a.id - b2.id);
  }
  if (b.psave != null) presets[String(b.psave)] = { n: b.n, on: state.on, bri: state.bri, seg: JSON.parse(JSON.stringify(state.seg)) };
  if (b.pdel != null) delete presets[String(b.pdel)];
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Private-Network": "true",
};
const json = (res, obj, code = 200) => { res.writeHead(code, { ...cors, "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];
  if (req.method === "OPTIONS") { res.writeHead(200, cors); return res.end(); }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.method === "POST" && path === "/json/state") {
      const b = JSON.parse(body || "{}");
      if (b.rb) { console.log("reboot requested (ignored)"); return json(res, { success: true }); }
      update(b);
      broadcast();
      return b.v ? json(res, state) : json(res, { success: true });
    }
    if (req.method === "POST" && path === "/json/cfg") {
      const c = JSON.parse(body || "{}");
      if (c.hw?.led?.total) info.leds.count = c.hw.led.total;
      console.log("cfg received:", JSON.stringify(c));
      return json(res, { success: true });
    }
    if (req.method === "POST" && path === "/upload") {
      const m = body.match(/\r\n\r\n([\s\S]*?)\r\n--/);
      if (m && /filename="presets\.json"/.test(body)) {
        for (const k of Object.keys(presets)) delete presets[k];
        Object.assign(presets, JSON.parse(m[1]));
      } else if (m) meta = m[1];
      res.writeHead(200, cors); return res.end("OK");
    }
    if (path === "/json") return json(res, { state, info, effects, palettes });
    if (path === "/json/state") return json(res, state);
    if (path === "/json/info") return json(res, info);
    if (path === "/json/palx") {
      const page = Number(new URL(req.url, "http://x").searchParams.get("page") || 0);
      const p = {};
      for (let id = page * 8; id < page * 8 + 8; id++) if (palStops[id]) p[id] = palStops[id];
      return json(res, { m: Math.ceil(palettes.length / 8) - 1, p });
    }
    if (path === "/json/live") return json(res, { leds: frame().map((p) => p.map((v) => v.toString(16).padStart(2, "0")).join("")) });
    if (path === "/json/eff") return json(res, effects);
    if (path === "/json/pal") return json(res, palettes);
    if (path === "/presets.json") return json(res, presets);
    if (path === "/luxplant-meta.json" && meta) { res.writeHead(200, { ...cors, "Content-Type": "application/json" }); return res.end(meta); }
    res.writeHead(404, cors); res.end("Not found");
  });
});

// Simplified preview renderer: each effect name gets its own look so changing the effect is visible.
// (A real plant renders the real WLED effects; this is only a stand-in.)
const hash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
function hsv(h, s, v) {
  h = ((h % 360) + 360) % 360 / 60;
  const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), t2 = v * (1 - s * (1 - f));
  return [[v, t2, p], [q, v, p], [p, v, t2], [p, q, v], [t2, p, v], [v, p, q]][i % 6].map((x) => x * 255);
}
function pixel(g, k, t) {
  const c1 = g.col?.[0] ?? [255, 160, 0];
  const stops = g.pal ? palStops[g.pal] : null;
  const pc = (u) => (stops ? sample(stops, u) : c1); // palette colour, or the single colour for "Default"
  const n = (k - g.start) / Math.max(1, g.stop - g.start);
  const sp = 0.2 + g.sx / 128, it = g.ix / 255;
  const name = effects[g.fx] ?? "";
  const tw = (power, rate) => { const ph = hash(k); return Math.pow(Math.max(0, Math.sin(t * sp * rate + ph * 6.283)), power); };
  const noise = (x) => 0.5 + 0.5 * (Math.sin(x * 9 + t * sp * 0.6) + Math.sin(x * 5.3 - t * sp * 0.5) + Math.sin(x * 13 + t * sp * 0.9)) / 3;
  let c, v = 1;
  switch (name) {
    case "Solid": c = c1; break;
    case "Blink": c = c1; v = Math.floor(t * sp * 1.5) % 2; break;
    case "Breathe": c = pc(0.5); v = 0.5 + 0.5 * Math.sin(t * sp * 2); break;
    case "Wipe": c = pc(n); v = n < (t * sp * 0.3) % 1 ? 1 : 0.05; break;
    case "Colorloop": c = hsv(t * sp * 25, 1, 1); break;
    case "Rainbow": c = hsv(n * 360 + t * sp * 60, 1, 1); break;
    case "Twinkle": c = c1; v = hash(k, Math.floor(t * sp * 3)) < it * 0.3 + 0.05 ? 1 : 0.05; break;
    case "Lighthouse": { const p = (t * sp * 0.4) % 1, d = (n - p + 1) % 1; c = pc(p); v = d < 0.3 ? 1 - d / 0.3 : 0.03; break; }
    case "Gradient": c = pc(n * 0.8 + 0.1 * Math.sin(t * sp * 0.3)); break;
    case "Colortwinkles": c = pc(hash(k, 3)); v = 0.04 + 0.96 * tw(3, 1.2); break;
    case "Twinklefox": c = pc(hash(k, 5)); v = 0.1 + 0.9 * tw(2, 0.8); break;
    case "Fairytwinkle": c = pc(hash(k, 7)); v = 0.03 + 0.97 * tw(10, 1.6); break;
    case "Colorwaves": c = pc(n * 1.5 + t * sp * 0.1 + Math.sin(t * 0.7 + n * 6) * 0.15); v = 0.6 + 0.4 * Math.sin(n * 8 + t * sp * 0.4); break;
    case "Noise 2": c = pc(noise(n)); v = 0.55 + 0.45 * noise(n + 3); break;
    case "Noise 4": c = pc(noise(n)); v = hash(k, Math.floor(t * sp * 4)) < 0.06 ? 1 : 0.35 + 0.4 * noise(n + 3); break;
    case "Flow": c = pc(n * 0.7 + t * sp * 0.05); v = 0.65 + 0.35 * Math.sin(n * 5 - t * sp * 0.5); break;
    case "Blends": c = pc(0.5 + 0.5 * Math.sin(t * sp * 0.15 + Math.floor(k / 3) * 1.7)); break;
    case "Palette": c = pc(n + t * sp * 0.08); break;
    case "Pacifica": c = pc(0.4 + 0.3 * Math.sin(n * 5 + t * sp * 0.2)); v = 0.6 + 0.4 * Math.sin(n * 9 - t * sp * 0.3); break;
    case "Fire 2012": { const heat = hash(k, Math.floor(t * sp * 8)) * (1 - n * 0.6); c = pc(heat); v = 0.4 + 0.6 * heat; break; }
    default: c = pc(n + t * sp * 0.05); v = 0.7 + 0.3 * Math.sin(n * 6 + t * sp * 0.4);
  }
  return [c[0] * v, c[1] * v, c[2] * v];
}
function frame() {
  const t = Date.now() / 1000;
  const px = [];
  for (let k = 0; k < 126; k++) {
    const g = state.seg.find((s) => s.on !== false && k >= s.start && k < s.stop);
    if (!g || !state.on) { px.push([0, 0, 0]); continue; }
    const s = state.bri / 255;
    px.push(pixel(g, k, t).map((x) => Math.round(Math.max(0, Math.min(255, x)) * s)));
  }
  return px;
}
setInterval(() => {
  if (!wss) return;
  const px = frame();
  const buf = Buffer.from([76, 1, ...px.flat()]);
  wss.clients.forEach((c) => c.live && c.readyState === 1 && c.send(buf));
}, 100);

let wss = null;
function broadcast() {
  const msg = JSON.stringify({ state, info });
  wss?.clients.forEach((c) => c.readyState === 1 && c.send(msg));
}

try {
  const { WebSocketServer } = await import("ws");
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ state, info }));
    ws.on("message", (d) => {
      try {
        const b = JSON.parse(d.toString());
        if ("lv" in b) { ws.live = !!b.lv; delete b.lv; }
        if (Object.keys(b).length) { update(b); broadcast(); }
      } catch {}
    });
  });
  console.log("WebSocket enabled (live sync).");
} catch {
  console.log("Package 'ws' not found: running without WebSocket (the app will show 'Reconnecting…' but still works). Run: npm i -D ws");
}

server.listen(PORT, () => console.log(`Fake WLED running on http://localhost:${PORT}`));
