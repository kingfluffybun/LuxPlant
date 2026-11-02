"use client";

import "../../public/app.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Tab = "color" | "fx" | "pal" | "presets" | "more";
type Connection = "demo" | "live" | "offline";
type Slot = [string, string, string];

type Segment = {id: number; name: string; start: number; stop: number; on: boolean; colors: Slot; effect: number; palette: number; speed: number; intensity: number};

type Effect = { id: number; name: string; tag: string };
type Palette = { id: number; name: string; gradient: string };
type Preset = { id: string; slot: number; name: string; effect: number; palette: number; accent: string };
type Timer = { id: number; label: string; onTime: string; offTime: string; days: boolean[]; enabled: boolean };
type DeviceInfo = { name: string; ver: string; leds: number; rssi: number | null; uptime: string };

type DeviceSegmentState = {id?: number;start?: number;stop?: number;on?: boolean;col?: number[][];pal?: number;fx?: number;sx?: number;ix?: number;};

type DialogState =
    | { kind: "none" }
    | { kind: "connect" }
    | { kind: "save" }
    | { kind: "rename"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "timer"; timer: Timer | null };

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

function hexToHsv(hex: string): [number, number, number] {
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

function normalizeLiveEffects(source?: Record<string, unknown>) {
    return Object.entries(source ?? {}).map(([id, value]) => ({
        id: Number(id),
        name: String(value ?? id),
        tag: "Live",
    }));
}

function normalizeLivePalettes(source?: Record<string, unknown>) {
    return Object.entries(source ?? {}).map(([id, value]) => ({
        id: Number(id),
        name: String(value ?? id),
        gradient: "linear-gradient(90deg, #ff5d8f, #7cc8ff, #5eead4)",
    }));
}

function mapLiveSegment(segment: DeviceSegmentState, index: number): Segment {
    const colors = Array.isArray(segment.col) && segment.col[0] ? segment.col[0] : [0, 0, 0];
    const id = Number(segment.id ?? index);

    return {
        id,
        name: `Leaf ${id + 1}`,
        start: Number(segment.start ?? index * 14),
        stop: Number(segment.stop ?? Number(segment.start ?? index * 14) + 14),
        on: segment.on ?? true,
        colors: [rgbToHex(colors[0] ?? 0, colors[1] ?? 0, colors[2] ?? 0), rgbToHex(colors[0] ?? 0, colors[1] ?? 0, colors[2] ?? 0), "#000000"],
        effect: Number(segment.fx ?? 79),
        palette: Number(segment.pal ?? 0),
        speed: Number(segment.sx ?? 128),
        intensity: Number(segment.ix ?? 128),
    };
}

async function request(host: string, path: string, body?: object) {
    const init = body && { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
    const response = await fetch(`http://${host}${path}`, init);

    if (!response.ok) throw new Error(String(response.status));
    return response.json();
}

type SliderProps = {
    id: string;
    label: string;
    value: number;
    min?: number;
    max?: number;
    display?: string;
    track?: string;
    onChange: (value: number) => void;
};

function Slider({ id, label, value, min = 0, max = 255, display, track, onChange }: SliderProps) {
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
                className={cx("slider-input", !!track && "custom")}
                style={{ "--percent": `${filled}%`, "--track": track } as React.CSSProperties}
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

export default function App() {
    const [connection, setConnection] = useState<Connection>("demo");
    const [ip, setIp] = useState("192.168.50.42");
    const [ipDraft, setIpDraft] = useState(ip);
    const [connecting, setConnecting] = useState(false);
    const [info, setInfo] = useState<DeviceInfo>({ name: "LuxPlant", ver: "0.14.x (demo)", leds: 72, rssi: null, uptime: "—" });

    const [power, setPower] = useState(true);
    const [brightness, setBrightness] = useState(200);
    const [transition, setTransition] = useState(7);
    const [segments, setSegments] = useState<Segment[]>(() => buildLeafSegments());
    const [selection, setSelection] = useState([0]);
    const [effectCatalog, setEffectCatalog] = useState<Effect[]>(effects);
    const [paletteCatalog, setPaletteCatalog] = useState<Palette[]>(palettes);
    const [slot, setSlot] = useState(0);

    const [tab, setTab] = useState<Tab>("color");
    const [search, setSearch] = useState("");
    const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
    const [nameDraft, setNameDraft] = useState("");
    const [timerDraft, setTimerDraft] = useState(blankTimer);
    const [toast, setToast] = useState<string | null>(null);

    const [presets, setPresets] = useState(initialPresets);
    const [activePreset, setActivePreset] = useState<string | null>("p2");
    const [playlistOn, setPlaylistOn] = useState(false);
    const [playlistSeconds, setPlaylistSeconds] = useState(30);
    const [playlistRepeat, setPlaylistRepeat] = useState(true);

    const [nightlightOn, setNightlightOn] = useState(false);
    const [nightlightMinutes, setNightlightMinutes] = useState(30);
    const [nightlightBrightness, setNightlightBrightness] = useState(0);
    const [nightlightMode, setNightlightMode] = useState<NightlightMode>("fade");
    const [timers, setTimers] = useState(initialTimers);
    const [syncSend, setSyncSend] = useState(false);
    const [syncReceive, setSyncReceive] = useState(true);

    const firstPush = useRef(true);

    const leaf = segments[Math.min(...selection)] ?? segments[0];
    const [hue, saturation] = hexToHsv(leaf.colors[slot]);
    const allSelected = selection.length === segments.length;
    const activeEffect = effectCatalog.find((effect) => effect.id === leaf.effect);
    const activePalette = paletteCatalog.find((palette) => palette.id === leaf.palette);
    const filteredEffects = effectCatalog.filter((effect) => effect.name.toLowerCase().includes(search.trim().toLowerCase()));

    const selectionLabel = allSelected ? "All leaves" : selection.length === 1 ? leaf.name : `${selection.length} leaves`;

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

    useEffect(() => {
        if (connection !== "live") return;

        if (firstPush.current) {
            firstPush.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            request(ip, "/json/state", {
                on: power,
                bri: brightness,
                transition,
                nl: {
                    on: nightlightOn,
                    dur: nightlightMinutes,
                    mode: nightlightModes.indexOf(nightlightMode),
                    tbri: nightlightBrightness,
                },
                udpn: { send: syncSend, recv: syncReceive },
                seg: segments.map((segment) => ({
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
            }).catch(() => {
                setConnection("offline");
                setToast("Lost connection to controller");
            });
        }, 250);

        return () => clearTimeout(timeout);
    }, [brightness, connection, ip, nightlightBrightness, nightlightMinutes, nightlightMode, nightlightOn, power, segments, syncReceive, syncSend, transition]);

    const closeDialog = () => { setDialog({ kind: "none" }); };

    const openConnectDialog = () => {
        setIpDraft(ip);
        setDialog({ kind: "connect" });
    };

    async function connect(target: string) {
        setConnecting(true);

        try {
            const [infoData, stateData, effectData, paletteData] = await Promise.all([
                request(target, "/json/info"),
                request(target, "/json/state"),
                request(target, "/json/eff"),
                request(target, "/json/pal"),
            ]);
            const uptime = infoData.uptime ?? 0;

            const deviceEffects = normalizeLiveEffects(effectData as Record<string, unknown> | undefined);
            const devicePalettes = normalizeLivePalettes(paletteData as Record<string, unknown> | undefined);

            if (Array.isArray(stateData?.seg) && stateData.seg.length > 0) {
                const mappedSegments = stateData.seg.map((segment: DeviceSegmentState, index: number) => mapLiveSegment(segment, index));

                if (mappedSegments.length > 1 || mappedSegments[0]?.stop !== 126) {
                    setSegments(mappedSegments);
                    setSelection([mappedSegments[0]?.id ?? 0]);
                }
            }

            setEffectCatalog(deviceEffects.length > 0 ? deviceEffects : effects);
            setPaletteCatalog(devicePalettes.length > 0 ? devicePalettes : palettes);
            setIp(target);
            setInfo({
                name: infoData.name ?? "WLED",
                ver: infoData.ver ?? "?",
                leds: infoData.leds?.count ?? 0,
                rssi: infoData.wifi?.rssi ?? null,
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
            });
            firstPush.current = true;
            setConnection("live");
            closeDialog();
            setToast(`Connected to ${target}`);
        } catch {
            setConnection("offline");
            setToast(`Can't reach ${target}`);
        } finally {
            setConnecting(false);
        }
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
        setSegments((current) => current.map((segment) => (segment.id === id ? { ...segment, on: !segment.on } : segment)));
    };

    const updateLeaves = (changes: Partial<Segment>) => {
        setSegments((current) => current.map((segment) => (selection.includes(segment.id) ? { ...segment, ...changes } : segment)));
    };

    const setSlotColor = (hex: string) => {
        setSegments((current) =>
            current.map((segment) => {
                if (!selection.includes(segment.id)) return segment;

                const colors = [...segment.colors] as Slot;
                colors[slot] = hex;
                return { ...segment, colors };
            }),
        );
    };

    const applyPreset = (preset: Preset) => {
        setSegments((current) => current.map((segment) => ({ ...segment, effect: preset.effect, palette: preset.palette })));
        setActivePreset(preset.id);
        setToast(`${preset.name} applied`);

        if (connection === "live") {
            request(ip, "/json/state", { ps: preset.slot }).catch(() => {});
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
        const slotNumber = presets.reduce((max, preset) => Math.max(max, preset.slot), 0) + 1;
        const preset: Preset = {
            id: `p-${Date.now()}`,
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
            request(ip, "/json/state", { psave: slotNumber, n: name, ib: true, sb: true }).catch(() => {});
        }
    };

    const renamePreset = () => {
        if (dialog.kind !== "rename") return;

        const name = nameDraft.trim();
        if (!name) return;

        setPresets((current) => current.map((preset) => (preset.id === dialog.id ? { ...preset, name } : preset)));
        closeDialog();
        setToast("Preset renamed");
    };

    const deletePreset = () => {
        if (dialog.kind !== "delete") return;

        setPresets((current) => current.filter((preset) => preset.id !== dialog.id));
        if (activePreset === dialog.id) setActivePreset(null);
        closeDialog();
        setToast("Preset deleted");
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

                <Slider
                    id="hue"
                    label="Hue"
                    value={Math.round(hue)}
                    min={0}
                    max={360}
                    display={`${Math.round(hue)}°`}
                    track="linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"
                    onChange={(value) => setSlotColor(hsvToHex(value, Math.max(saturation, 0.05), 1))}
                />
                <Slider
                    id="sat"
                    label="Saturation"
                    value={Math.round(saturation * 100)}
                    min={0}
                    max={100}
                    track={`linear-gradient(90deg,#fff,${hsvToHex(hue, 1, 1)})`}
                    onChange={(value) => setSlotColor(hsvToHex(hue, value / 100, 1))}
                />

                <div className="swatches">
                    {quickColors.map((color) => (
                        <button key={color} className="swatch" style={{ background: color }} aria-label={`Use ${color}`} onClick={() => setSlotColor(color)} />
                    ))}
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

    const renderMoreTab = () => (
        <>
            <div className="card">
                <div className="card-header">
                    <h2>Segments</h2>
                    <small>{segments.length} leaves · {info.leds} LEDs</small>
                </div>
                <div className="list">
                    {segments.map((segment) => (
                        <div key={segment.id} className={cx("segment-row", selection.includes(segment.id) && "active")}>
                            <button className="segment-main" onClick={() => setSelection([segment.id])}>
                                <span className="segment-dot" style={{ background: segment.colors[0] }} />
                                <span>
                                    <strong>{segment.name}</strong>
                                    <small>{`LED ${segment.start}–${segment.stop - 1}`}</small>
                                </span>
                            </button>
                            <Switch on={segment.on} label={`${segment.name} on`} onClick={() => toggleSegment(segment.id)} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Nightlight</h2>
                    <Switch on={nightlightOn} label="Nightlight" onClick={() => setNightlightOn(!nightlightOn)} />
                </div>
                <Slider id="nl-dur" label="Duration" value={nightlightMinutes} min={1} max={120} display={`${nightlightMinutes} min`} onChange={setNightlightMinutes} />
                <Slider id="nl-bri" label="Target brightness" value={nightlightBrightness} onChange={setNightlightBrightness} />
                <div className="chips">
                    {nightlightModes.map((mode) => (
                        <button key={mode} className={cx("chip", nightlightMode === mode && "active")} onClick={() => setNightlightMode(mode)}>
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Timers</h2>
                    <button className="button small" onClick={() => openTimerDialog()}>Add timer</button>
                </div>
                <small>{timers.filter((timer) => timer.enabled).length} enabled</small>
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
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Sync &amp; device</h2>
                    <button className="button small secondary" onClick={openConnectDialog}>Connect</button>
                </div>
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
            </div>
        </>
    );

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
                                        setConnection("demo");
                                        closeDialog();
                                        setToast("Demo mode");
                                    }}
                                >
                                    Demo
                                </button>
                                <button className="button" disabled={connecting} onClick={() => connect(ipDraft.trim() || ip)}>
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
                        <Image src="/assets/logo/logo-white.png" alt="LuxPlant logo" width={104} height={32} className="brand-logo" />
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

                                return (
                                    <button
                                        key={segment.id}
                                        className={cx("leaf-chip", selected && "active", !segment.on && "off")}
                                        onClick={() => toggleLeaf(segment.id)}
                                        onDoubleClick={() => setSelection([segment.id])}
                                        aria-pressed={selected}
                                    >
                                        <span className="leaf-dot" style={{ background: `linear-gradient(135deg, ${segment.colors[0]}, ${segment.colors[1]})` }} />
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