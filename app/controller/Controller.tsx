"use client";

import "../../public/app.css";
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from "react";

type Tab = "color" | "fx" | "pal" | "presets" | "more";
type Connection = "demo" | "live" | "offline";
type Slot = [string, string, string];
type HSV = [number, number, number];

type Segment = {id: number; name: string; start: number; stop: number; on: boolean; colors: Slot; effect: number; palette: number; speed: number; intensity: number};

type Effect = { id: number; name: string; tag: string };
type Palette = { id: number; name: string; gradient: string };
type Preset = { id: string; slot: number; name: string; effect: number; palette: number; accent: string };
type Timer = { id: number; label: string; onTime: string; offTime: string; days: boolean[]; enabled: boolean };
type DeviceInfo = { name: string; ver: string; leds: number; rssi: number | null; uptime: string };

type DeviceSegmentState = {id?: number;start?: number;stop?: number;on?: boolean;col?: number[][];pal?: number;fx?: number;sx?: number;ix?: number;};
type DeviceState = {
    on?: boolean; bri?: number; transition?: number; ps?: number; pl?: number;
    nl?: { on?: boolean; dur?: number; mode?: number; tbri?: number };
    udpn?: { send?: boolean; recv?: boolean };
    seg?: DeviceSegmentState[];
};
type DevicePreset = { n?: string; playlist?: unknown; seg?: DeviceSegmentState[] };
type PalStops = Record<string, number[][]>;

type DialogState =
    | { kind: "none" }
    | { kind: "connect" }
    | { kind: "save" }
    | { kind: "rename"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "timer"; timer: Timer | null };

const LEAVES = 9;
const LEAF_LEN = 14;
const TOTAL_LEDS = LEAVES * LEAF_LEN; // 126
const FIRST_FREE_SLOT = 32;
const MAX_SLOT = 250;
const HOST_KEY = "luxplant-host";

const tabs: [Tab, string][] = [
    ["color", "Colors"],
    ["fx", "Effects"],
    ["pal", "Palettes"],
    ["presets", "Presets"],
    ["more", "More"],
];

const quickColors = ["#ff5d8f", "#ff8f5b", "#ffd166", "#6ee7b7", "#5eead4", "#7cc8ff", "#c084fc", "#ffffff"];
const slotNames = ["Primary", "Secondary", "Tertiary"];
const nightlightModes = ["instant", "fade", "color", "sunrise"] as const;
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
const everyDay: boolean[] = Array(7).fill(true);

type NightlightMode = (typeof nightlightModes)[number];

const effects: Effect[] = [
    { id: 0, name: "Solid", tag: "Static" },
    { id: 1, name: "Blink", tag: "Flash" },
    { id: 2, name: "Breathe", tag: "Calm" },
    { id: 8, name: "Colorloop", tag: "Cycle" },
    { id: 9, name: "Rainbow", tag: "Cycle" },
    { id: 17, name: "Twinkle", tag: "Sparkle" },
    { id: 38, name: "Aurora", tag: "Flow" },
    { id: 42, name: "Fireworks", tag: "Sparkle" },
    { id: 63, name: "Pride 2015", tag: "Cycle" },
    { id: 66, name: "Fire 2012", tag: "Warm" },
    { id: 79, name: "Ripple", tag: "Flow" },
    { id: 101, name: "Pacifica", tag: "Flow" },
];

const palettes: Palette[] = [
    { id: 0, name: "Default", gradient: "linear-gradient(90deg,#ff5d8f,#ffd166,#6ee7b7,#7cc8ff)" },
    { id: 6, name: "Party", gradient: "linear-gradient(90deg,#5500ab,#84007c,#b5004b,#e50d1c,#ff5500,#ffab00)" },
    { id: 8, name: "Lava", gradient: "linear-gradient(90deg,#000,#800000,#ff0000,#ff6400,#ffc800,#fff)" },
    { id: 9, name: "Ocean", gradient: "linear-gradient(90deg,#191970,#00008b,#1e90ff,#00ced1,#20b2aa,#87ceeb)" },
    { id: 10, name: "Forest", gradient: "linear-gradient(90deg,#006400,#228b22,#6b8e23,#556b2f,#90ee90)" },
    { id: 11, name: "Rainbow", gradient: "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" },
    { id: 35, name: "Sunset", gradient: "linear-gradient(90deg,#ff512f,#f09819,#ffd166,#c084fc,#4b2a8a)" },
    { id: 50, name: "Aurora", gradient: "linear-gradient(90deg,#00ff87,#5eead4,#7cc8ff,#8a5cf6,#00ff87)" },
];

const leafColors = [
    ["#ff5d8f", "#ff8f5b"],
    ["#ff8f5b", "#ffd166"],
    ["#ffd166", "#6ee7b7"],
    ["#6ee7b7", "#5eead4"],
    ["#5eead4", "#7cc8ff"],
    ["#7cc8ff", "#c084fc"],
    ["#c084fc", "#ff9ec7"],
    ["#ff9ec7", "#ff5d8f"],
    ["#8ad4ff", "#6ee7b7"],
];

function buildLeafSegments(): Segment[] {
    return leafColors.map(([first, second], index) => ({
        id: index,
        name: `Leaf ${index + 1}`,
        start: index * 14,
        stop: index * 14 + 14,
        on: true,
        colors: [first, second, "#000000"],
        effect: 79,
        palette: 0,
        speed: 128,
        intensity: 128,
    }));
}

const initialPresets: Preset[] = [
    { id: "p1", slot: 1, name: "Aurora", effect: 38, palette: 50, accent: "#5eead4" },
    { id: "p2", slot: 2, name: "Ripple", effect: 79, palette: 9, accent: "#7ae582" },
    { id: "p3", slot: 3, name: "Pulse", effect: 2, palette: 0, accent: "#7cc8ff" },
    { id: "p4", slot: 4, name: "Rainbow", effect: 9, palette: 11, accent: "#ffb65c" },
];

const initialTimers: Timer[] = [
    { id: 1, label: "Evening", onTime: "17:00", offTime: "23:00", days: everyDay, enabled: true },
    { id: 2, label: "Morning", onTime: "06:30", offTime: "08:00", days: everyDay, enabled: false },
];

const blankTimer: Timer = { id: 0, label: "New timer", onTime: "18:00", offTime: "22:00", days: everyDay, enabled: true };

const cx = (...names: (string | false)[]) => names.filter(Boolean).join(" ");

function hexToRgb(hex: string): [number, number, number] {
    const value = hex.replace("#", "");
    return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex: string): HSV {
    const [r, g, b] = hexToRgb(hex).map((n) => n / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    let hue = 0;

    if (diff !== 0) {
        if (max === r) hue = ((g - b) / diff) % 6;
        else if (max === g) hue = (b - r) / diff + 2;
        else hue = (r - g) / diff + 4;
        hue *= 60;
        if (hue < 0) hue += 360;
    }

    return [hue, max === 0 ? 0 : diff / max, max];
}

function hsvToHex(h: number, s: number, v: number) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let rgb: [number, number, number];

    if (h < 60) rgb = [c, x, 0];
    else if (h < 120) rgb = [x, c, 0];
    else if (h < 180) rgb = [0, c, x];
    else if (h < 240) rgb = [0, x, c];
    else if (h < 300) rgb = [x, 0, c];
    else rgb = [c, 0, x];

    return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

function percent(value: number, max = 255) {
    return Math.round((value / max) * 100);
}

/* ---------- WLED helpers ---------- */

const clean = (name: string) => name.replace(/^\*\s*/, ""); // WLED marks special palettes with "* "
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// /json/eff and /json/pal return a list of names, the position in the list is the id.
function normalizeLiveEffects(source?: unknown): Effect[] {
    const seen = new Set<string>();
    return Object.entries((source ?? {}) as Record<string, unknown>)
        .map(([id, value]) => ({ id: Number(id), name: String(value ?? id), tag: "Live" }))
        .filter((effect) => effect.name && effect.name !== "RSVD" && effect.name !== "-")
        .filter((effect) => (seen.has(effect.name.toLowerCase()) ? false : (seen.add(effect.name.toLowerCase()), true)))
        .sort((a, b) => (a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.localeCompare(b.name)));
}

function normalizeLivePalettes(source?: unknown, stops: PalStops = {}): Palette[] {
    const seen = new Set<string>();
    return Object.entries((source ?? {}) as Record<string, unknown>)
        .map(([id, value]) => ({
            id: Number(id),
            name: clean(String(value ?? id)),
            gradient: gradientFrom(stops[id]) ?? "linear-gradient(90deg, #ff5d8f, #7cc8ff, #5eead4)",
        }))
        .filter((palette) => palette.name && palette.name !== "RSVD" && palette.name !== "-")
        .filter((palette) => (seen.has(palette.name.toLowerCase()) ? false : (seen.add(palette.name.toLowerCase()), true)));
}

// The plant's real palette colours: the same data WLED's own page uses to draw its palette bars.
async function loadPalx(host: string): Promise<PalStops> {
    const all: PalStops = {};

    try {
        let max = 0;
        for (let page = 0; page <= max && page < 40; page++) {
            const data = await request(host, `/json/palx?page=${page}`);
            max = data.m ?? 0;
            Object.assign(all, data.p);
        }
    } catch {}

    return all;
}

function stopList(stops?: unknown[]): number[][] {
    return ((stops ?? []).filter((entry) => Array.isArray(entry) && entry.length >= 4) as number[][]);
}

function gradientFrom(stops?: unknown[]) {
    const list = stopList(stops);
    if (list.length < 2) return undefined;
    return `linear-gradient(90deg, ${list.map((s) => `rgb(${s[1]},${s[2]},${s[3]}) ${Math.round((s[0] / 255) * 100)}%`).join(", ")})`;
}

function sampleStops(list: number[][], u: number): [number, number, number] {
    const pos = Math.min(1, Math.max(0, u)) * 255;

    for (let i = 1; i < list.length; i++) {
        if (pos <= list[i][0]) {
            const a = list[i - 1];
            const b = list[i];
            const f = (pos - a[0]) / Math.max(1, b[0] - a[0]);
            return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, a[3] + (b[3] - a[3]) * f];
        }
    }

    const last = list[list.length - 1];
    return [last[1], last[2], last[3]];
}

// First clearly visible colour of a palette (some start with black).
function firstLit(list: number[][]) {
    return list.find((s) => s[1] + s[2] + s[3] > 60) ?? list[0];
}

function fromDeviceSegment(segment: DeviceSegmentState, index: number): Segment {
    const id = Number(segment.id ?? index);
    const start = Number(segment.start ?? index * LEAF_LEN);
    const colors = [0, 1, 2].map((slot) => {
        const c = segment.col?.[slot];
        return c ? rgbToHex(c[0] ?? 0, c[1] ?? 0, c[2] ?? 0) : "#000000";
    }) as Slot;

    return {
        id,
        name: `Leaf ${id + 1}`,
        start,
        stop: Number(segment.stop ?? start + LEAF_LEN),
        on: segment.on ?? true,
        colors,
        effect: Number(segment.fx ?? 0),
        palette: Number(segment.pal ?? 0),
        speed: Number(segment.sx ?? 128),
        intensity: Number(segment.ix ?? 128),
    };
}

/**
 * The screen always shows nine leaves. Most presets give the plant ONE segment instead,
 * so that single segment is shown as nine identical leaves. The first change you make then
 * recreates the nine real leaf segments on the plant (see commitSegments).
 */
function mapDeviceSegments(raw: DeviceSegmentState[]): { list: Segment[]; leaves: boolean } {
    const active = raw.map((segment, index) => ({ segment, index })).filter(({ segment }) => (segment.stop ?? 1) > (segment.start ?? 0));
    const isLeaves =
        active.length === LEAVES &&
        active.every(({ segment }, i) => (segment.id ?? i) === i && segment.start === i * LEAF_LEN && segment.stop === (i + 1) * LEAF_LEN);

    if (isLeaves) return { list: active.map(({ segment, index }) => fromDeviceSegment(segment, index)), leaves: true };

    if (active.length === 1 && active[0].segment.start === 0 && (active[0].segment.stop ?? 0) >= TOTAL_LEDS) {
        const base = fromDeviceSegment(active[0].segment, 0);
        return {
            list: Array.from({ length: LEAVES }, (_, i) => ({
                ...base,
                id: i,
                name: `Leaf ${i + 1}`,
                start: i * LEAF_LEN,
                stop: (i + 1) * LEAF_LEN,
                colors: [...base.colors] as Slot,
            })),
            leaves: false,
        };
    }

    return { list: active.map(({ segment, index }) => fromDeviceSegment(segment, index)), leaves: true };
}

// What to send for the fields that changed.
function toDevice(changes: Partial<Segment>) {
    return {
        ...(changes.on !== undefined && { on: changes.on }),
        ...(changes.colors && { col: changes.colors.map(hexToRgb) }),
        ...(changes.effect !== undefined && { fx: changes.effect }),
        ...(changes.palette !== undefined && { pal: changes.palette }),
        ...(changes.speed !== undefined && { sx: changes.speed }),
        ...(changes.intensity !== undefined && { ix: changes.intensity }),
    };
}

async function request(host: string, path: string, body?: object) {
    if (isTauri()) {
        return invoke("wled_request", {
            host,
            path,
            method: body ? "POST" : "GET",
            body: body ?? null,
        });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const init = body
            ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal }
            : { signal: controller.signal };
        const response = await fetch(`http://${host}${path}`, init);

        if (!response.ok) throw new Error(String(response.status));
        return response.json();
    } finally {
        clearTimeout(timeout);
    }
}

type SliderProps = {
    id: string;
    label: string;
    value: number;
    min?: number;
    max?: number;
    display?: string;
    onChange: (value: number) => void;
};

function Slider({ id, label, value, min = 0, max = 255, display, onChange }: SliderProps) {
    const filled = ((value - min) / (max - min)) * 100;

    return (
        <div className="slider">
            <div className="slider-header">
                <label htmlFor={id}>{label}</label>
                <span>{display ?? `${percent(value, max)}%`}</span>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                value={value}
                className="slider-input"
                style={{ "--percent": `${filled}%` } as React.CSSProperties}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}

type SwitchProps = { on: boolean; label: string; onClick: () => void };

function Switch({ on, label, onClick }: SwitchProps) {
    return (
        <button className={cx("switch", on && "on")} onClick={onClick} role="switch" aria-checked={on} aria-label={label}>
            <span />
        </button>
    );
}

type NumFieldProps = { label: string; value: number; max: number; onChange: (value: number) => void; onCommit: () => void };

function NumField({ label, value, max, onChange, onCommit }: NumFieldProps) {
    const [draft, setDraft] = useState(String(value));

    useEffect(() => setDraft(String(value)), [value]);

    const type = (raw: string) => {
        const digits = raw.replace(/\D/g, "").slice(0, 3);
        setDraft(digits);
        if (digits) onChange(Math.min(max, Number(digits)));
    };

    return (
        <label className="num-field">
            <input
                inputMode="numeric"
                value={draft}
                onFocus={(event) => event.target.select()}
                onChange={(event) => type(event.target.value)}
                onBlur={() => { setDraft(String(value)); onCommit(); }}
                onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
            />
            <span>{label}</span>
        </label>
    );
}

type PickerProps = { value: string; onChange: (hex: string) => void; onCommit: (hex: string) => void };

function ColorPicker({ value, onChange, onCommit }: PickerProps) {
    const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
    const [draft, setDraft] = useState(value.slice(1).toUpperCase());
    const wheel = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const [h, s, v] = hsv;
    const current = hsvToHex(h, s, v);
    const radians = (h * Math.PI) / 180;

    // Sync when the color changes from outside (recent colors, switching leaf or slot).
    // Local HSV wins if it already gives the same hex, so the hue doesn't reset when brightness hits 0.
    useEffect(() => {
        setHsv((now) => (hsvToHex(...now) === value ? now : hexToHsv(value)));
        setDraft(value.slice(1).toUpperCase());
    }, [value]);

    const update = (next: HSV) => {
        setHsv(next);
        onChange(hsvToHex(...next));
    };

    const commit = () => onCommit(current);

    const pick = (event: React.PointerEvent) => {
        const rect = wheel.current?.getBoundingClientRect();
        if (!rect) return;

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;

        update([(angle + 360) % 360, Math.min(Math.hypot(x, y) / (rect.width / 2), 1), v]);
    };

    const nudge = (event: React.KeyboardEvent) => {
        const step = event.shiftKey ? 10 : 2;
        const moves: Record<string, [number, number]> = {
            ArrowRight: [step, 0],
            ArrowLeft: [-step, 0],
            ArrowUp: [0, step / 100],
            ArrowDown: [0, -step / 100],
        };
        const move = moves[event.key];
        if (!move) return;

        event.preventDefault();
        update([(h + move[0] + 360) % 360, Math.min(1, Math.max(0, s + move[1])), v]);
    };

    const typeHex = (raw: string) => {
        const clean = raw.replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase();
        setDraft(clean);

        if (clean.length === 6) {
            setHsv(hexToHsv(`#${clean}`));
            onChange(`#${clean.toLowerCase()}`);
        }
    };

    const commitHex = () => {
        const clean = (draft.length === 3 ? [...draft].map((char) => char + char).join("") : draft).toLowerCase();

        if (clean.length !== 6) {
            setDraft(value.slice(1).toUpperCase()); // invalid code -> back to the last good one
            return;
        }

        setHsv(hexToHsv(`#${clean}`));
        setDraft(clean.toUpperCase());
        onChange(`#${clean}`);
        onCommit(`#${clean}`);
    };

    return (
        <div className="picker">
            <div className="picker-top">
                <span className="picker-preview" style={{ background: current }} aria-hidden="true" />
                <label className="hex-field">
                    <span aria-hidden="true">#</span>
                    <input
                        value={draft}
                        maxLength={7}
                        spellCheck={false}
                        autoCapitalize="characters"
                        aria-label="Hex color code"
                        placeholder="FF5D8F"
                        onChange={(event) => typeHex(event.target.value)}
                        onBlur={commitHex}
                        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
                    />
                </label>
            </div>

            <div
                ref={wheel}
                className="wheel"
                role="slider"
                tabIndex={0}
                aria-label="Color wheel"
                aria-valuetext={`Hue ${Math.round(h)}°, saturation ${Math.round(s * 100)}%`}
                aria-valuenow={Math.round(h)}
                aria-valuemin={0}
                aria-valuemax={360}
                onPointerDown={(event) => {
                    dragging.current = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    pick(event);
                }}
                onPointerMove={(event) => dragging.current && pick(event)}
                onPointerUp={() => {
                    dragging.current = false;
                    commit();
                }}
                onPointerCancel={() => { dragging.current = false; }}
                onKeyDown={nudge}
            >
                <span className="wheel-shade" style={{ opacity: 1 - v }} />
                <span className="wheel-thumb" style={{ left: `${50 + Math.sin(radians) * s * 50}%`, top: `${50 - Math.cos(radians) * s * 50}%`, background: current }} />
            </div>

            <div className="hsv">
                <NumField label="H" max={360} value={Math.round(h)} onChange={(n) => update([n, s, v])} onCommit={commit} />
                <NumField label="S" max={100} value={Math.round(s * 100)} onChange={(n) => update([h, n / 100, v])} onCommit={commit} />
                <NumField label="B" max={100} value={Math.round(v * 100)} onChange={(n) => update([h, s, n / 100])} onCommit={commit} />
            </div>
        </div>
    );
}

export default function App() {
    const [connection, setConnection] = useState<Connection>("demo");
    const [ip, setIp] = useState("luxplant.local");
    const [ipDraft, setIpDraft] = useState(ip);
    const [connecting, setConnecting] = useState(false);
    const [info, setInfo] = useState<DeviceInfo>({ name: "LuxPlant", ver: "0.14.x (demo)", leds: 72, rssi: null, uptime: "—" });

    const [power, setPowerState] = useState(true);
    const [brightness, setBrightnessState] = useState(200);
    const [transition, setTransitionState] = useState(7);
    const [segments, setSegments] = useState<Segment[]>(() => buildLeafSegments());
    const [selection, setSelection] = useState([0]);
    const [effectCatalog, setEffectCatalog] = useState<Effect[]>(effects);
    const [paletteCatalog, setPaletteCatalog] = useState<Palette[]>(palettes);
    const [palStops, setPalStops] = useState<PalStops>({});
    const [slot, setSlot] = useState(0);
    const [recent, setRecent] = useState<string[]>(quickColors);

    const [tab, setTab] = useState<Tab>("color");
    const [moreSection, setMoreSection] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
    const [nameDraft, setNameDraft] = useState("");
    const [timerDraft, setTimerDraft] = useState(blankTimer);
    const [toast, setToast] = useState<string | null>(null);

    const [presets, setPresets] = useState(initialPresets);
    const [activePreset, setActivePreset] = useState<string | null>("p2");
    const [playlistOn, setPlaylistOnState] = useState(false);
    const [playlistSeconds, setPlaylistSeconds] = useState(30);
    const [playlistRepeat, setPlaylistRepeat] = useState(true);

    const [nightlightOn, setNightlightOnState] = useState(false);
    const [nightlightMinutes, setNightlightMinutesState] = useState(30);
    const [nightlightBrightness, setNightlightBrightnessState] = useState(0);
    const [nightlightMode, setNightlightModeState] = useState<NightlightMode>("fade");
    const [timers, setTimers] = useState(initialTimers);
    const [syncSend, setSyncSendState] = useState(false);
    const [syncReceive, setSyncReceiveState] = useState(true);

    // Connection plumbing. Refs hold the latest values so the WebSocket handlers never see stale state.
    const wsRef = useRef<WebSocket | null>(null);
    const nativePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const nativePollBusy = useRef(false);
    const connId = useRef(0);
    const lastLocal = useRef(0);
    const leavesOnDevice = useRef(false);
    const playlistSince = useRef(0);
    const throttle = useRef<Record<string, { t: number; timer?: ReturnType<typeof setTimeout>; body?: object }>>({});
    const usedSlots = useRef<Set<number>>(new Set());
    const segmentsRef = useRef(segments);
    const presetsRef = useRef(presets);
    const ipRef = useRef(ip);
    const liveRef = useRef(false);
    const catalogRef = useRef({ effects: effects as Effect[], palettes: palettes as Palette[], stops: {} as PalStops });
    const nlRef = useRef({ on: false, dur: 30, tbri: 0, mode: "fade" as NightlightMode });

    segmentsRef.current = segments;
    presetsRef.current = presets;
    ipRef.current = ip;
    liveRef.current = connection === "live";
    nlRef.current = { on: nightlightOn, dur: nightlightMinutes, tbri: nightlightBrightness, mode: nightlightMode };
    catalogRef.current = { effects: effectCatalog, palettes: paletteCatalog, stops: palStops };

    const leaf = segments[Math.min(...selection)] ?? segments[0];
    const allSelected = selection.length === segments.length;
    const activeEffect = effectCatalog.find((effect) => effect.id === leaf.effect);
    const activePalette = paletteCatalog.find((palette) => palette.id === leaf.palette);
    const filteredEffects = effectCatalog.filter((effect) => effect.name.toLowerCase().includes(search.trim().toLowerCase()));

    const selectionLabel = allSelected ? "All leaves" : selection.length === 1 ? leaf.name : `${selection.length} leaves`;

    // While a palette drives a leaf, show the palette's colours on that leaf (the plain colour slots stay editable in the Colors tab).
    const shownColors = (segment: Segment): [string, string] => {
        const list = segment.palette ? stopList(palStops[String(segment.palette)]) : [];
        if (list.length < 2) return [segment.colors[0], segment.colors[1]];

        const lit = firstLit(list);
        const u0 = lit[0] / 255;
        const at = (u: number) => {
            const [r, g, b] = sampleStops(list, u0 + (1 - u0) * u);
            return rgbToHex(r, g, b);
        };

        return [at((segment.id + 0.2) / LEAVES), at((segment.id + 0.8) / LEAVES)];
    };

    const status = {
        live: { label: "Connected", hint: ip },
        demo: { label: "Demo mode", hint: "Tap to connect" },
        offline: { label: "Offline", hint: "Tap to retry" },
    }[connection];

    useEffect(() => {
        if (!toast) return;

        const timeout = setTimeout(() => setToast(null), 2200);
        return () => clearTimeout(timeout);
    }, [toast]);

    // Reconnect to the plant you used last time.
    useEffect(() => {
        const saved = localStorage.getItem(HOST_KEY);
        if (saved) connect(saved);

        return () => {
            connId.current++;
            wsRef.current?.close();
            if (nativePollRef.current) clearInterval(nativePollRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---------- talking to the plant ---------- */

    // Every control sends just the small JSON command for what you changed, and the plant answers with its real state.
    async function push(body: object, slider = false) {
        if (!liveRef.current) return;

        lastLocal.current = slider ? Date.now() : 0; // after a tap, always accept the plant's answer
        const socket = wsRef.current;

        if (socket && socket.readyState === 1) {
            socket.send(JSON.stringify(body));
            return;
        }

        try {
            const state = await request(ipRef.current, "/json/state", { ...body, v: true });
            if (state?.seg) applyDeviceState(state);
        } catch {
            setConnection("offline");
            setToast("Lost connection to controller");
        }
    }

    // Sliders and the colour wheel send at most about ten commands a second, and always the last value.
    function pushThrottled(key: string, body: object) {
        const entry = (throttle.current[key] ??= { t: 0 });
        entry.body = body;
        const wait = 90 - (Date.now() - entry.t);

        if (wait <= 0) {
            entry.t = Date.now();
            push(body, true);
        } else if (!entry.timer) {
            entry.timer = setTimeout(() => {
                entry.timer = undefined;
                entry.t = Date.now();
                push(entry.body as object, true);
            }, wait);
        }
    }

    // Shortly after a tap, ask the plant for its real state so the screen always matches it.
    function resync(delay = 400) {
        setTimeout(async () => {
            if (!liveRef.current) return;

            try {
                const state = await request(ipRef.current, "/json/state");
                if (state?.seg) applyDeviceState(state);
            } catch {}
        }, delay);
    }

    function applyDeviceState(state: DeviceState) {
        setPowerState(!!state.on);
        if (typeof state.bri === "number") setBrightnessState(Math.max(1, state.bri));
        if (typeof state.transition === "number") setTransitionState(state.transition);

        if (state.nl) {
            setNightlightOnState(!!state.nl.on);
            if (state.nl.dur) setNightlightMinutesState(state.nl.dur);
            if (typeof state.nl.tbri === "number") setNightlightBrightnessState(state.nl.tbri);
            if (typeof state.nl.mode === "number") setNightlightModeState(nightlightModes[state.nl.mode] ?? "fade");
        }

        if (state.udpn) {
            setSyncSendState(!!state.udpn.send);
            setSyncReceiveState(!!state.udpn.recv);
        }

        if (Array.isArray(state.seg)) {
            const { list, leaves } = mapDeviceSegments(state.seg);

            if (list.length > 0) {
                leavesOnDevice.current = leaves;
                segmentsRef.current = list;
                setSegments(list);
                setSelection((current) => {
                    const ids = list.map((segment) => segment.id);
                    const keep = current.filter((id) => ids.includes(id));
                    return keep.length > 0 ? keep : [ids[0]];
                });
            }
        }

        if (typeof state.ps === "number") setActivePreset(presetsRef.current.find((preset) => preset.slot === state.ps)?.id ?? null);
        if (typeof state.pl === "number" && Date.now() - playlistSince.current > 2500) setPlaylistOnState(state.pl >= 0);
    }

    function openSocket(target: string, id: number) {
        if (isTauri()) {
            if (nativePollRef.current) clearInterval(nativePollRef.current);
            nativePollRef.current = setInterval(async () => {
                if (id !== connId.current || !liveRef.current || nativePollBusy.current) return;

                nativePollBusy.current = true;
                try {
                    const state = await request(target, "/json/state");
                    if (id === connId.current && state?.seg) applyDeviceState(state);
                } catch {
                    if (id === connId.current) {
                        liveRef.current = false;
                        setConnection("offline");
                        setToast("Lost connection to controller");
                        if (nativePollRef.current) clearInterval(nativePollRef.current);
                        nativePollRef.current = null;
                    }
                } finally {
                    nativePollBusy.current = false;
                }
            }, 1500);
            return;
        }

        const socket = new WebSocket(`ws://${target}/ws`);
        wsRef.current = socket;

        socket.onmessage = (event) => {
            if (typeof event.data !== "string") return;

            try {
                const data = JSON.parse(event.data);
                if (data.state && Date.now() - lastLocal.current > 350) applyDeviceState(data.state);
                if (data.info?.wifi) setInfo((current) => ({ ...current, rssi: data.info.wifi.signal ?? current.rssi }));
            } catch {}
        };

        socket.onclose = () => {
            if (id === connId.current) setTimeout(() => id === connId.current && openSocket(target, id), 3000);
        };
    }

    /* ---------- presets that live on the plant ---------- */

    async function loadPresets(target: string, effectList: Effect[], paletteList: Palette[], stops: PalStops) {
        try {
            const data: Record<string, DevicePreset> = await request(target, `/presets.json?t=${Date.now()}`);
            const keys = Object.keys(data).map(Number);
            usedSlots.current = new Set(keys);

            const names: Record<string, number> = {};
            const list: Preset[] = keys
                .filter((n) => n > 0 && data[String(n)]?.n !== undefined && !data[String(n)].playlist)
                .sort((a, b) => a - b)
                .map((slotNumber, index) => {
                    const item = data[String(slotNumber)];
                    const first = item.seg?.[0];
                    const effect = first?.fx ?? 0;
                    const palette = first?.pal ?? 0;

                    // Presets named "1", "2"… get a real name from their effect and palette.
                    const own = (item.n ?? "").trim();
                    const effectName = effectList.find((e) => e.id === effect)?.name ?? "Custom effect";
                    const paletteName = paletteList.find((p) => p.id === palette)?.name ?? "Custom palette";
                    let name = own && !/^\d+$/.test(own) ? own : `${effectName} · ${paletteName}`;
                    names[name] = (names[name] ?? 0) + 1;
                    if (names[name] > 1) name += ` ${names[name]}`;

                    const lit = stopList(stops[String(palette)]).filter((s) => s[1] + s[2] + s[3] > 60);
                    const mid = lit[Math.floor(lit.length / 2)];
                    const col = first?.col?.[0];
                    const accent = palette && mid ? rgbToHex(mid[1], mid[2], mid[3]) : col ? rgbToHex(col[0], col[1], col[2]) : `hsl(${Math.round((index * 137.5) % 360)} 70% 58%)`;

                    return { id: String(slotNumber), slot: slotNumber, name, effect, palette, accent };
                });

            presetsRef.current = list;
            setPresets(list);
            return list;
        } catch {
            return presetsRef.current;
        }
    }

    function reloadPresets() {
        const { effects: effectList, palettes: paletteList, stops } = catalogRef.current;
        return loadPresets(ipRef.current, effectList, paletteList, stops);
    }

    /* ---------- connecting ---------- */

    const closeDialog = () => { setDialog({ kind: "none" }); };

    const openConnectDialog = () => {
        setIpDraft(ip);
        setDialog({ kind: "connect" });
    };

    async function connect(target: string) {
        const id = ++connId.current;
        wsRef.current?.close();
        wsRef.current = null;
        if (nativePollRef.current) clearInterval(nativePollRef.current);
        nativePollRef.current = null;
        setConnecting(true);

        try {
            const [infoData, stateData, effectData, paletteData] = await Promise.all([
                request(target, "/json/info"),
                request(target, "/json/state"),
                request(target, "/json/eff"),
                request(target, "/json/pal"),
            ]);
            if (id !== connId.current) return;

            const stops = await loadPalx(target);
            const uptime = infoData.uptime ?? 0;

            const deviceEffects = normalizeLiveEffects(effectData);
            const devicePalettes = normalizeLivePalettes(paletteData, stops);
            const effectList = deviceEffects.length > 0 ? deviceEffects : effects;
            const paletteList = devicePalettes.length > 0 ? devicePalettes : palettes;

            setEffectCatalog(effectList);
            setPaletteCatalog(paletteList);
            setPalStops(stops);
            setIp(target);
            ipRef.current = target;
            localStorage.setItem(HOST_KEY, target);
            setInfo({
                name: infoData.name ?? "WLED",
                ver: infoData.ver ?? "?",
                leds: infoData.leds?.count ?? 0,
                rssi: infoData.wifi?.signal ?? null,
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            });

            // Presets first, so the active preset can be marked when the state is applied.
            await loadPresets(target, effectList, paletteList, stops);
            if (id !== connId.current) return;

            liveRef.current = true;
            applyDeviceState(stateData);
            setConnection("live");
            openSocket(target, id);
            closeDialog();
            setToast(`Connected to ${target}`);
        } catch (error) {
            if (id === connId.current) {
                setConnection("offline");
                const detail = typeof error === "string"
                    ? error
                    : error instanceof Error
                        ? error.message
                        : "Unknown connection error";
                setToast(`Can't reach ${target}: ${detail}`);
            }
        } finally {
            if (id === connId.current) setConnecting(false);
        }
    }

    /* ---------- controls ---------- */

    const setPower = (value: boolean) => {
        setPowerState(value);
        push({ on: value });
    };

    const setBrightness = (value: number) => {
        setBrightnessState(value);
        pushThrottled("bri", { bri: value });
    };

    const setTransition = (value: number) => {
        setTransitionState(value);
        pushThrottled("transition", { transition: value });
    };

    const pushNightlight = (changes: Partial<typeof nlRef.current>, slider = false) => {
        const next = { ...nlRef.current, ...changes };
        nlRef.current = next;
        const body = { nl: { on: next.on, dur: next.dur, mode: nightlightModes.indexOf(next.mode), tbri: next.tbri } };

        if (slider) pushThrottled("nl", body);
        else push(body);
    };

    const setNightlightOn = (value: boolean) => {
        setNightlightOnState(value);
        pushNightlight({ on: value });
    };

    const setNightlightMinutes = (value: number) => {
        setNightlightMinutesState(value);
        pushNightlight({ dur: value }, true);
    };

    const setNightlightBrightness = (value: number) => {
        setNightlightBrightnessState(value);
        pushNightlight({ tbri: value }, true);
    };

    const setNightlightMode = (value: NightlightMode) => {
        setNightlightModeState(value);
        pushNightlight({ mode: value });
    };

    const setSyncSend = (value: boolean) => {
        setSyncSendState(value);
        push({ udpn: { send: value, recv: syncReceive } });
    };

    const setSyncReceive = (value: boolean) => {
        setSyncReceiveState(value);
        push({ udpn: { send: syncSend, recv: value } });
    };

    // Starts a playlist of all your presets on the plant, or stops it.
    const setPlaylistOn = (value: boolean) => {
        setPlaylistOnState(value);
        playlistSince.current = Date.now();
        if (!liveRef.current) return;

        if (!value) {
            push({ pl: -1 });
            return;
        }

        const slots = presetsRef.current.map((preset) => preset.slot);

        if (slots.length === 0) {
            setPlaylistOnState(false);
            setToast("Save a preset first");
            return;
        }

        push({
            playlist: {
                ps: slots,
                dur: slots.map(() => playlistSeconds * 10),
                transition: [transition],
                repeat: playlistRepeat ? 0 : 1,
                end: 0,
            },
        });
        resync(600);
    };

    /**
     * Updates the screen and sends the change. Presets usually give the plant a single segment,
     * so the first change recreates the nine leaf segments (with the current look) before anything else.
     */
    function commitSegments(next: Segment[], patches: { id: number; changes: Partial<Segment> }[], slider = false) {
        segmentsRef.current = next;
        setSegments(next);
        if (!liveRef.current) return;

        if (!leavesOnDevice.current) {
            leavesOnDevice.current = true;
            push({
                seg: next.map((segment) => ({
                    id: segment.id,
                    start: segment.start,
                    stop: segment.stop,
                    on: segment.on,
                    col: segment.colors.map(hexToRgb),
                    fx: segment.effect,
                    pal: segment.palette,
                    sx: segment.speed,
                    ix: segment.intensity,
                })),
            });
            return;
        }

        const body = { seg: patches.map(({ id, changes }) => ({ id, ...toDevice(changes) })) };

        if (slider) pushThrottled("seg" + patches.map((patch) => patch.id).join("-"), body);
        else push(body);
    }

    const toggleLeaf = (id: number) => {
        setSelection((current) => {
            if (current.includes(id)) {
                if (current.length === 1) {
                    setToast("Keep at least one leaf selected");
                    return current;
                }
                return current.filter((leafId) => leafId !== id);
            }

            return [...current, id].sort((a, b) => a - b);
        });
    };

    const toggleSegment = (id: number) => {
        const segment = segmentsRef.current.find((item) => item.id === id);
        if (!segment) return;

        const changes = { on: !segment.on };
        commitSegments(segmentsRef.current.map((item) => (item.id === id ? { ...item, ...changes } : item)), [{ id, changes }]);
    };

    const updateLeaves = (changes: Partial<Segment>) => {
        const next = segmentsRef.current.map((segment) => (selection.includes(segment.id) ? { ...segment, ...changes } : segment));
        const slider = "speed" in changes || "intensity" in changes;
        commitSegments(next, selection.map((id) => ({ id, changes })), slider);
    };

    // Picking a colour switches those leaves off their palette, because a palette would hide the colour you picked.
    const setSlotColor = (hex: string) => {
        const next = segmentsRef.current.map((segment) => {
            if (!selection.includes(segment.id)) return segment;

            const colors = [...segment.colors] as Slot;
            colors[slot] = hex;
            return { ...segment, colors, palette: 0 };
        });

        commitSegments(
            next,
            selection.map((id) => ({ id, changes: { colors: next.find((segment) => segment.id === id)!.colors, palette: 0 } })),
            true,
        );
    };

    const commitRecent = (hex: string) => {
        setRecent((current) => [hex, ...current.filter((color) => color !== hex)].slice(0, 8));
    };

    const applyPreset = (preset: Preset) => {
        setSegments((current) => current.map((segment) => ({ ...segment, effect: preset.effect, palette: preset.palette })));
        setActivePreset(preset.id);
        setToast(`${preset.name} applied`);

        if (connection === "live") {
            push({ ps: preset.slot });
            resync();
        }
    };

    const openSave = () => {
        setNameDraft(activeEffect?.name ?? "My preset");
        setDialog({ kind: "save" });
    };

    const openRename = (preset: Preset) => {
        setNameDraft(preset.name);
        setDialog({ kind: "rename", id: preset.id });
    };

    const savePreset = () => {
        const name = nameDraft.trim() || "Custom preset";
        let slotNumber = presets.reduce((max, preset) => Math.max(max, preset.slot), 0) + 1;

        if (connection === "live") {
            // Lowest free slot from 32 up, so the presets already on the plant are never overwritten.
            slotNumber = FIRST_FREE_SLOT;
            while ((usedSlots.current.has(slotNumber) || presets.some((preset) => preset.slot === slotNumber)) && slotNumber <= MAX_SLOT) slotNumber++;

            if (slotNumber > MAX_SLOT) {
                setToast("No free preset slots left");
                return;
            }
        }

        const preset: Preset = {
            id: connection === "live" ? String(slotNumber) : `p-${Date.now()}`,
            slot: slotNumber,
            name,
            effect: leaf.effect,
            palette: leaf.palette,
            accent: leaf.colors[0],
        };

        setPresets((current) => [...current, preset]);
        setActivePreset(preset.id);
        closeDialog();
        setToast("Preset saved to device");

        if (connection === "live") {
            usedSlots.current.add(slotNumber);
            push({ psave: slotNumber, n: name, ib: true, sb: true });
            sleep(800).then(reloadPresets);
        }
    };

    const renamePreset = () => {
        if (dialog.kind !== "rename") return;

        const name = nameDraft.trim();
        if (!name) return;

        const target = presets.find((preset) => preset.id === dialog.id);
        setPresets((current) => current.map((preset) => (preset.id === dialog.id ? { ...preset, name } : preset)));
        closeDialog();
        setToast("Preset renamed");

        if (connection === "live" && target) {
            // WLED has no rename call: apply the preset, then save it again under the same slot with the new name.
            push({ ps: target.slot });
            sleep(450).then(() => push({ psave: target.slot, n: name, ib: true, sb: true }));
            sleep(1300).then(reloadPresets);
        }
    };

    const deletePreset = () => {
        if (dialog.kind !== "delete") return;

        const target = presets.find((preset) => preset.id === dialog.id);
        setPresets((current) => current.filter((preset) => preset.id !== dialog.id));
        if (activePreset === dialog.id) setActivePreset(null);
        closeDialog();
        setToast("Preset deleted");

        if (connection === "live" && target) {
            usedSlots.current.delete(target.slot);
            push({ pdel: target.slot });
            sleep(800).then(reloadPresets);
        }
    };

    const openTimerDialog = (timer: Timer | null = null) => {
        setTimerDraft(timer ?? blankTimer);
        setDialog({ kind: "timer", timer });
    };

    const saveTimer = () => {
        if (dialog.kind !== "timer") return;

        const editing = dialog.timer;
        const timer: Timer = {
            ...timerDraft,
            label: timerDraft.label.trim() || "Timer",
            onTime: timerDraft.onTime || "00:00",
            offTime: timerDraft.offTime || "00:00",
        };

        if (timer.onTime === timer.offTime) {
            setToast("Turn on and turn off time can't be the same");
            return;
        }

        if (editing) {
            setTimers((current) => current.map((item) => (item.id === editing.id ? timer : item)));
        } else {
            setTimers((current) => [...current, { ...timer, id: Date.now() }]);
        }

        closeDialog();
        setToast(editing ? "Timer updated" : "Timer added");
    };

    const updateTimer = (id: number, changes: Partial<Timer>) => {
        setTimers((current) => current.map((timer) => (timer.id === id ? { ...timer, ...changes } : timer)));
    };

    const toggleTimerDay = (timer: Timer, day: number) => {
        updateTimer(timer.id, { days: timer.days.map((active, index) => (index === day ? !active : active)) });
    };

    const removeTimer = (id: number) => {
        setTimers((current) => current.filter((timer) => timer.id !== id));
        setToast("Timer removed");
    };

    const renderColorTab = () => (
        <>
            <div className="card">
                <div className="card-header">
                    <h2>Colors</h2>
                    <small>{selectionLabel}</small>
                </div>

                <div className="slots">
                    {leaf.colors.map((color, index) => (
                        <button key={index} className={cx("slot", slot === index && "active")} onClick={() => setSlot(index)}>
                            <span className="slot-swatch" style={{ background: color }} />
                            <span>{slotNames[index]}</span>
                        </button>
                    ))}
                </div>

                <ColorPicker value={leaf.colors[slot]} onChange={setSlotColor} onCommit={commitRecent} />

                <div className="recent">
                    <small>Recent colors</small>
                    <div className="swatches">
                        {recent.map((color) => (
                            <button
                                key={color}
                                className="swatch"
                                style={{ background: color }}
                                aria-label={`Use ${color}`}
                                onClick={() => {
                                    setSlotColor(color);
                                    commitRecent(color);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Effect tuning</h2>
                    <small>{activeEffect?.name}</small>
                </div>
                <Slider id="sx" label="Speed" value={leaf.speed} onChange={(value) => updateLeaves({ speed: value })} />
                <Slider id="ix" label="Intensity" value={leaf.intensity} onChange={(value) => updateLeaves({ intensity: value })} />
            </div>
        </>
    );

    const renderEffectsTab = () => (
        <div className="card">
            <div className="card-header">
                <h2>Effects</h2>
                <small>{filteredEffects.length} found</small>
            </div>
            <input className="field" placeholder="Search effects…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search effects" />
            <div className="list">
                {filteredEffects.map((effect) => (
                    <button key={effect.id} className={cx("row", leaf.effect === effect.id && "active")} onClick={() => updateLeaves({ effect: effect.id })}>
                        <span className="row-title">{effect.name}</span>
                        <span className="tag">{effect.tag}</span>
                    </button>
                ))}
                {filteredEffects.length === 0 && <p>No effect matches “{search}”.</p>}
            </div>
        </div>
    );

    const renderPalettesTab = () => (
        <div className="card">
            <div className="card-header">
                <h2>Palettes</h2>
                <small>{activePalette?.name}</small>
            </div>
            <div className="palette-grid">
                {paletteCatalog.map((palette) => (
                    <button key={palette.id} className={cx("palette", leaf.palette === palette.id && "active")} onClick={() => updateLeaves({ palette: palette.id })}>
                        <span className="palette-bar" style={{ background: palette.gradient }} />
                        <span>{palette.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderPresetsTab = () => (
        <>
            <div className="card">
                <div className="card-header">
                    <h2>Presets</h2>
                    <button className="button small" onClick={openSave}>Save current</button>
                </div>
                <div className="preset-grid">
                    {presets.map((preset) => (
                        <div key={preset.id} className={cx("preset", activePreset === preset.id && "active")}>
                            <button className="preset-main" onClick={() => applyPreset(preset)}>
                                <span className="preset-number" style={{ background: preset.accent }}>{preset.slot}</span>
                                <strong>{preset.name}</strong>
                                <small>
                                    {effectCatalog.find((effect) => effect.id === preset.effect)?.name} · {paletteCatalog.find((palette) => palette.id === preset.palette)?.name}
                                </small>
                            </button>
                            <div className="preset-actions">
                                <button onClick={() => openRename(preset)}>Rename</button>
                                <button className="danger" onClick={() => setDialog({ kind: "delete", id: preset.id })}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Playlist</h2>
                    <Switch on={playlistOn} label="Playlist" onClick={() => setPlaylistOn(!playlistOn)} />
                </div>
                <p className="hint">Cycle through your presets automatically.</p>
                <Slider id="pl-dur" label="Duration per preset" value={playlistSeconds} min={5} max={300} display={`${playlistSeconds}s`} onChange={setPlaylistSeconds} />
                <Slider id="pl-tr" label="Transition" value={transition} min={0} max={30} display={`${(transition / 10).toFixed(1)}s`} onChange={setTransition} />
                <div className="setting-row">
                    <span>Repeat</span>
                    <Switch on={playlistRepeat} label="Repeat playlist" onClick={() => setPlaylistRepeat(!playlistRepeat)} />
                </div>
            </div>
        </>
    );

    const renderMoreTab = () => {
        const sections = [
            {
                id: "segments",
                label: "Segments",
                summary: `${segments.length} leaves · ${info.leds} LEDs`,
                content: (
                    <div className="list">
                        {segments.map((segment) => (
                            <div key={segment.id} className={cx("segment-row", selection.includes(segment.id) && "active")}>
                                <button className="segment-main" onClick={() => setSelection([segment.id])}>
                                    <span className="segment-dot" style={{ background: shownColors(segment)[0] }} />
                                    <span>
                                        <strong>{segment.name}</strong>
                                        <small>{`LED ${segment.start}–${segment.stop - 1}`}</small>
                                    </span>
                                </button>
                                <Switch on={segment.on} label={`${segment.name} on`} onClick={() => toggleSegment(segment.id)} />
                            </div>
                        ))}
                    </div>
                )
            },
            {
                id: "nightlight",
                label: "Nightlight",
                content: (
                    <>
                        <Slider id="nl-dur" label="Duration" value={nightlightMinutes} min={1} max={120} display={`${nightlightMinutes} min`} onChange={setNightlightMinutes} />
                        <Slider id="nl-bri" label="Target brightness" value={nightlightBrightness} onChange={setNightlightBrightness} />
                        <div className="chips">
                            {nightlightModes.map((mode) => (
                                <button key={mode} className={cx("chip", nightlightMode === mode && "active")} onClick={() => setNightlightMode(mode)}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </>
                )
            },
            {
                id: "timers",
                label: "Timers",
                summary: `${timers.filter((timer) => timer.enabled).length} enabled`,
                content: (
                    <>
                        <div className="section-actions">
                            <button className="button small" onClick={() => openTimerDialog()}>Add timer</button>
                        </div>
                        <div className="list">
                            {timers.map((timer) => (
                                <div key={timer.id} className="timer">
                                    <div className="timer-top">
                                        <div className="timer-label">
                                            <strong>{timer.label}</strong>
                                        </div>
                                        <Switch on={timer.enabled} label={`${timer.label} enabled`} onClick={() => updateTimer(timer.id, { enabled: !timer.enabled })} />
                                    </div>
                                    <div className="timer-times">
                                        <label className="timer-time-field">
                                            <span>Turn on</span>
                                            <input type="time" className="timer-time" value={timer.onTime} onChange={(event) => updateTimer(timer.id, { onTime: event.target.value })} />
                                        </label>
                                        <label className="timer-time-field">
                                            <span>Turn off</span>
                                            <input type="time" className="timer-time" value={timer.offTime} onChange={(event) => updateTimer(timer.id, { offTime: event.target.value })} />
                                        </label>
                                    </div>
                                    <div className="days">
                                        {dayLabels.map((label, index) => (
                                            <button key={index} className={cx("day", timer.days[index] && "active")} onClick={() => toggleTimerDay(timer, index)} aria-label={`Day ${index + 1}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="timer-actions">
                                        <button className="timer-action" onClick={() => openTimerDialog(timer)}>Edit</button>
                                        <button className="timer-action danger" onClick={() => removeTimer(timer.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )
            },
            {
                id: "device",
                label: "Sync & device",
                content: (
                    <>
                        <div className="setting-row">
                            <span>Send to other WLED devices</span>
                            <Switch on={syncSend} label="Sync send" onClick={() => setSyncSend(!syncSend)} />
                        </div>
                        <div className="setting-row">
                            <span>Receive from other devices</span>
                            <Switch on={syncReceive} label="Sync receive" onClick={() => setSyncReceive(!syncReceive)} />
                        </div>
                        <div className="info-grid">
                            <div><small>IP</small><strong>{ip}</strong></div>
                            <div><small>Firmware</small><strong>{info.ver}</strong></div>
                            <div><small>Signal</small><strong>{info.rssi === null ? "—" : `${info.rssi}%`}</strong></div>
                            <div><small>Uptime</small><strong>{info.uptime}</strong></div>
                        </div>
                        <div className="section-actions">
                            <button className="button small secondary" onClick={openConnectDialog}>Connect</button>
                        </div>
                    </>
                )
            }
        ];

        return (
            <div className="card accordion-card">
                <div className="accordion-list">
                    {sections.map((section) => {
                        const open = moreSection === section.id;

                        return (
                            <div key={section.id} className={cx("accordion-item", open && "open")}>
                                <button
                                    type="button"
                                    className="accordion-trigger"
                                    aria-expanded={open}
                                    onClick={() => setMoreSection(open ? null : section.id)}
                                >
                                    <span>{section.label}</span>
                                    {open && section.summary && <small>{section.summary}</small>}
                                    <span className="accordion-chevron">{open ? "−" : "+"}</span>
                                </button>
                                {open && <div className="accordion-content">{section.content}</div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (tab) {
            case "color":
                return renderColorTab();
            case "fx":
                return renderEffectsTab();
            case "pal":
                return renderPalettesTab();
            case "presets":
                return renderPresetsTab();
            case "more":
                return renderMoreTab();
            default:
                return null;
        }
    };

    const renderDialog = () => {
        if (dialog.kind === "none") return null;

        return (
            <div className="backdrop" onClick={closeDialog}>
                <div className="modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                    {dialog.kind === "connect" && (
                        <>
                            <h3>Connect to controller</h3>
                            <p className="hint">Enter the IP address or hostname of your WLED device. Your phone must be on the same network.</p>
                            <label className="field-label" htmlFor="ip">Device IP</label>
                            <input id="ip" className="field" value={ipDraft} onChange={(event) => setIpDraft(event.target.value)} placeholder="192.168.1.50" />
                            <div className="modal-actions">
                                <button
                                    className="button secondary"
                                    onClick={() => {
                                        connId.current++;
                                        wsRef.current?.close();
                                        wsRef.current = null;
                                        if (nativePollRef.current) clearInterval(nativePollRef.current);
                                        nativePollRef.current = null;
                                        localStorage.removeItem(HOST_KEY);
                                        setConnection("demo");
                                        closeDialog();
                                        setToast("Demo mode");
                                    }}
                                >
                                    Demo
                                </button>
                                <button className="button" disabled={connecting} onClick={() => connect(ipDraft.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || ip)}>
                                    {connecting ? "Connecting…" : "Connect"}
                                </button>
                            </div>
                        </>
                    )}

                    {(dialog.kind === "save" || dialog.kind === "rename") && (
                        <>
                            <h3>{dialog.kind === "save" ? "Save as preset" : "Rename preset"}</h3>
                            <label className="field-label" htmlFor="pname">Preset name</label>
                            <input id="pname" className="field" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="Custom preset" autoFocus />
                            <div className="modal-actions">
                                <button className="button secondary" onClick={closeDialog}>Cancel</button>
                                <button className="button" onClick={dialog.kind === "save" ? savePreset : renamePreset}>
                                    {dialog.kind === "save" ? "Save" : "Update"}
                                </button>
                            </div>
                        </>
                    )}

                    {dialog.kind === "delete" && (
                        <>
                            <h3>Delete preset?</h3>
                            <p className="hint">This preset will be removed from the device.</p>
                            <div className="modal-actions">
                                <button className="button secondary" onClick={closeDialog}>Cancel</button>
                                <button className="button danger" onClick={deletePreset}>Delete</button>
                            </div>
                        </>
                    )}

                    {dialog.kind === "timer" && (
                        <>
                            <h3>{dialog.timer ? "Edit timer" : "Add timer"}</h3>
                            <label className="field-label" htmlFor="timer-name">Timer name</label>
                            <input
                                id="timer-name"
                                className="field"
                                value={timerDraft.label}
                                onChange={(event) => setTimerDraft({ ...timerDraft, label: event.target.value })}
                                placeholder="Evening mode"
                                autoFocus
                            />

                            <label className="field-label" htmlFor="timer-on">Turn on at</label>
                            <input id="timer-on" type="time" className="field" value={timerDraft.onTime} onChange={(event) => setTimerDraft({ ...timerDraft, onTime: event.target.value })} />

                            <label className="field-label" htmlFor="timer-off">Turn off at</label>
                            <input id="timer-off" type="time" className="field" value={timerDraft.offTime} onChange={(event) => setTimerDraft({ ...timerDraft, offTime: event.target.value })} />

                            <label className="field-label">Repeat</label>
                            <div className="days modal-days">
                                {dayLabels.map((label, index) => (
                                    <button
                                        key={index}
                                        className={cx("day", timerDraft.days[index] && "active")}
                                        onClick={() => setTimerDraft({ ...timerDraft, days: timerDraft.days.map((active, day) => (day === index ? !active : active)) })}
                                        aria-label={`Toggle ${label}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="setting-row timer-enabled">
                                <span>Enabled</span>
                                <Switch on={timerDraft.enabled} label="Timer enabled" onClick={() => setTimerDraft({ ...timerDraft, enabled: !timerDraft.enabled })} />
                            </div>

                            <div className="modal-actions">
                                <button className="button secondary" onClick={closeDialog}>Cancel</button>
                                <button className="button" onClick={saveTimer}>{dialog.timer ? "Update" : "Add"}</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="app-page">
            <div className="app-shell">
                <header className="top-bar">
                    <div className="brand" role="img" aria-label="LuxPlant">
                        <span className="brand-logo" role="img" aria-label="LuxPlant logo" />
                    </div>
                    <button className={cx("power-button", power && "on")} onClick={() => setPower(!power)} aria-label="Toggle power" aria-pressed={power}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 3v8" /><path d="M6.3 6.8a8 8 0 1 0 11.4 0" /></svg>
                    </button>
                </header>

                <div className="device-bar">
                    <button className={cx("device-chip", connection)} onClick={openConnectDialog} aria-label={`${info.name}, ${status.label}. Open connection settings`}>
                        <span className="device-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21V11" /><path d="M12 14c-4 0-6-2.5-6-6 4 0 6 2 6 6z" /><path d="M12 12c0-3.5 2-5.5 6-5.5 0 3.5-2 5.5-6 5.5z" /></svg>
                            <span className="status-dot" />
                        </span>
                        <span className="device-text">
                            <strong>{info.name}</strong>
                            <span className="device-status">
                                <b>{status.label}</b>
                                <i aria-hidden="true">·</i>
                                <span>{status.hint}</span>
                            </span>
                        </span>
                        <svg className="device-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                </div>

                <main className="controller">
                    <section className="leaves card" aria-label="Choose leaves to customize">
                        <div className="card-header">
                            <div>
                                <h2>Leaves</h2>
                                <small>{allSelected ? `Customizing all ${segments.length} leaves` : `Customizing ${selection.length} of ${segments.length}`}</small>
                            </div>
                            <button className={cx("button", "small", !allSelected && "secondary")} onClick={() => setSelection(segments.map((segment) => segment.id))} disabled={allSelected}>
                                Select all
                            </button>
                        </div>

                        <div className="leaf-grid" role="group">
                            {segments.map((segment) => {
                                const selected = selection.includes(segment.id);
                                const shown = shownColors(segment);

                                return (
                                    <button
                                        key={segment.id}
                                        className={cx("leaf-chip", selected && "active", !segment.on && "off")}
                                        onClick={() => toggleLeaf(segment.id)}
                                        onDoubleClick={() => setSelection([segment.id])}
                                        aria-pressed={selected}
                                    >
                                        <span className="leaf-dot" style={{ background: `linear-gradient(135deg, ${shown[0]}, ${shown[1]})` }} />
                                        <span className="leaf-name">Leaf {segment.id + 1}</span>
                                        <span className="leaf-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="hint">Tap to pick the leaves you want to edit. Double-tap to edit just one.</p>
                    </section>

                    <div className="panel">{renderTabContent()}</div>
                </main>

                <footer className="dock">
                    <div className="dock-brightness">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
                        <input
                            type="range"
                            min={1}
                            max={255}
                            value={brightness}
                            aria-label="Master brightness"
                            className="slider-input"
                            style={{ "--percent": `${(brightness / 255) * 100}%` } as React.CSSProperties}
                            onChange={(event) => setBrightness(Number(event.target.value))}
                        />
                        <span className="dock-percent">{percent(brightness)}%</span>
                    </div>

                    <nav className="tabs" aria-label="Sections">
                        {tabs.map(([id, label]) => (
                            <button key={id} className={cx("tab", tab === id && "active")} onClick={() => setTab(id)}>
                                {label}
                            </button>
                        ))}
                    </nav>
                </footer>
            </div>

            {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
            {renderDialog()}
        </div>
    );
}

function isTauri() {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
