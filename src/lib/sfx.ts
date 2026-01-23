// src/lib/sfx.ts
import {
	ensureAudioReady,
	loadDecodedBuffer,
	playOneShot,
	setBusVolume,
	setMasterVolume,
} from "$lib/audio";

type SfxDef = {
	url: string;
	bus?: string; // defaults to 'sfx'
	volume?: number; // 0..1 default gain
	playbackRate?: number;
	pan?: number;
};

const SFX: Record<string, SfxDef> = {
	magic: {
		url: "https://lj-01.nyc3.cdn.digitaloceanspaces.com/sounds/magic-click.mp3",
		bus: "sfx",
		volume: 0.8,
	},
	click: {
		url: "https://lj-01.nyc3.cdn.digitaloceanspaces.com/sounds/click-short.mp3",
		bus: "sfx",
		volume: 0.033,
	},
};

export async function warmup() {
	await ensureAudioReady();
	await Promise.all(Object.values(SFX).map((s) => loadDecodedBuffer(s.url)));
}

export function setGlobalVolume(v: number) {
	setMasterVolume(v);
}

export function setSfxVolume(v: number) {
	setBusVolume("sfx", v);
}

export function play(
	name: keyof typeof SFX,
	overrides: { volume?: number; playbackRate?: number; pan?: number } = {},
) {
	const s = SFX[name];
	const gain = overrides.volume ?? s.volume ?? 1.0;
	return playOneShot(s.url, {
		gain,
		bus: s.bus ?? "sfx",
		playbackRate: overrides.playbackRate ?? s.playbackRate,
		pan: overrides.pan ?? s.pan,
	});
}
