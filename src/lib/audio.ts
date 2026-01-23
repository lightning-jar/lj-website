// src/lib/audio.ts
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

declare global {
	interface Window {
		webkitAudioContext?: {
			new (): AudioContext;
		};
	}
}

type StereoPannerCapableContext = AudioContext & {
	createStereoPanner?: () => StereoPannerNode;
};

// Optional category buses
const buses = new Map<string, GainNode>();

// Cache of decoded buffers
const bufferCache = new Map<string, AudioBuffer>();

export function getAudioContext(): AudioContext {
	if (typeof window === "undefined") {
		throw new Error("AudioContext is only available in the browser");
	}

	if (!audioCtx) {
		const Ctor = window.AudioContext ?? window.webkitAudioContext;
		if (!Ctor) {
			throw new Error("Web Audio API is not supported in this environment");
		}

		audioCtx = new Ctor();
		masterGain = audioCtx.createGain();
		masterGain.gain.value = 1.0;
		masterGain.connect(audioCtx.destination);

		return audioCtx; // TS knows it's defined here
	}

	return audioCtx; // TS knows audioCtx was already defined
}

export function getBus(name: string): GainNode {
	const ctx = getAudioContext();

	if (!masterGain) {
		throw new Error("Master gain not initialized");
	}

	const existing = buses.get(name);
	if (existing) {
		return existing;
	}

	const bus = ctx.createGain();
	bus.gain.value = 1.0;
	bus.connect(masterGain);
	buses.set(name, bus);
	return bus;
}

export function setMasterVolume(v: number) {
	getAudioContext(); // initializes masterGain

	if (!masterGain) {
		throw new Error("Master gain not initialized");
	}

	const clamped = Math.max(0, Math.min(1, v));
	masterGain.gain.value = clamped;
}

export function setBusVolume(name: string, v: number) {
	const bus = getBus(name);
	bus.gain.value = Math.max(0, Math.min(1, v));
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status} loading audio: ${url}`);
	return await res.arrayBuffer();
}

export async function loadDecodedBuffer(url: string): Promise<AudioBuffer> {
	const cached = bufferCache.get(url);
	if (cached) {
		return cached;
	}

	const ctx = getAudioContext();
	const ab = await fetchArrayBuffer(url);
	const decoded = await ctx.decodeAudioData(ab);
	bufferCache.set(url, decoded);
	return decoded;
}

export async function ensureAudioReady(): Promise<void> {
	const ctx = getAudioContext();
	if (ctx.state === "suspended") {
		try {
			await ctx.resume();
		} catch {}
	}
}

type OneShotOptions = {
	gain?: number; // 0..1 per-sound volume
	bus?: string; // route through a named bus (e.g., 'sfx', 'music')
	playbackRate?: number; // speed/pitch; 1 = normal
	detune?: number; // cents; not supported in all browsers
	when?: number; // ctx.currentTime offset
	loop?: boolean; // for longer sounds
	pan?: number; // -1..1 (requires StereoPanner support)
};

export async function playOneShot(
	url: string,
	opts: OneShotOptions = {},
): Promise<void> {
	const ctx = getAudioContext();
	const buffer = await loadDecodedBuffer(url);

	// Create nodes
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	if (opts.playbackRate != null) src.playbackRate.value = opts.playbackRate;
	if (src.detune && opts.detune != null) src.detune.value = opts.detune;

	const gainNode = ctx.createGain();
	gainNode.gain.value =
		opts.gain != null ? Math.max(0, Math.min(1, opts.gain)) : 1.0;

	// Optional panner
	let output: AudioNode = gainNode;

	const ctxWithPanner = ctx as StereoPannerCapableContext;

	if (
		opts.pan != null &&
		typeof ctxWithPanner.createStereoPanner === "function"
	) {
		const panner = ctxWithPanner.createStereoPanner();
		panner.pan.value = Math.max(-1, Math.min(1, opts.pan));
		gainNode.connect(panner);
		output = panner;
	}

	// Route to bus -> master -> destination
	if (opts.bus) {
		output.connect(getBus(opts.bus));
	} else {
		const _ctx = getAudioContext(); // ensures initialization
		const mg = masterGain;
		if (!mg) {
			throw new Error("Master gain not initialized");
		}
		output.connect(mg);
	}

	// Connect source to gain
	src.connect(gainNode);

	src.loop = !!opts.loop;

	const when = opts.when != null ? opts.when : 0;
	src.start(ctx.currentTime + when);
}
