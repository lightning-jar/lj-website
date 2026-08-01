<script lang="ts">
/**
 * Dictation button for Ask Eljay (ported from replicator's chat
 * surfaces). Tap to record (mic pulses red), tap again to stop → the
 * clip posts to /api/transcribe (Deepgram Nova-3) and the text lands
 * via `onTranscript` — the host appends it to its input so the user
 * can review/edit before sending. Renders nothing when the browser
 * can't record (no MediaRecorder/getUserMedia). A 90s auto-stop
 * guards against forgotten open mics.
 */
let {
	onTranscript,
	disabled = false,
}: {
	onTranscript: (text: string) => void;
	disabled?: boolean;
} = $props();

const AUTO_STOP_MS = 90_000;

let recording = $state(false);
let transcribing = $state(false);
let errorMessage = $state<string | null>(null);
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let autoStop: ReturnType<typeof setTimeout> | null = null;

const supported =
	typeof navigator !== "undefined" &&
	typeof MediaRecorder !== "undefined" &&
	!!navigator.mediaDevices?.getUserMedia;

async function toggle() {
	errorMessage = null;
	if (recording) {
		recorder?.stop();
		return;
	}
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
			? "audio/webm;codecs=opus"
			: "";
		recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
		chunks = [];
		recorder.ondataavailable = (event) => {
			if (event.data.size > 0) chunks.push(event.data);
		};
		recorder.onstop = async () => {
			if (autoStop) clearTimeout(autoStop);
			for (const track of stream.getTracks()) track.stop();
			recording = false;
			const blob = new Blob(chunks, {
				type: recorder?.mimeType || "audio/webm",
			});
			// Ignore accidental taps that captured (near) nothing.
			if (blob.size < 1000) return;
			transcribing = true;
			try {
				const res = await fetch("/api/transcribe", {
					body: blob,
					headers: { "content-type": blob.type },
					method: "POST",
				});
				const body = (await res.json().catch(() => null)) as {
					error?: string;
					text?: string;
				} | null;
				if (!res.ok) {
					throw new Error(
						body?.error ?? `Transcription failed (${res.status}).`,
					);
				}
				const text = body?.text?.trim();
				if (text) onTranscript(text);
				else errorMessage = "No speech detected.";
			} catch (e) {
				errorMessage = e instanceof Error ? e.message : "Transcription failed.";
			} finally {
				transcribing = false;
			}
		};
		recorder.start();
		recording = true;
		autoStop = setTimeout(() => recorder?.stop(), AUTO_STOP_MS);
	} catch {
		errorMessage = "Microphone unavailable — check browser permissions.";
	}
}
</script>

{#if supported}
	<button
		type="button"
		onclick={toggle}
		disabled={disabled || transcribing}
		aria-label={recording ? "Stop recording" : "Dictate a message"}
		aria-pressed={recording}
		title={errorMessage ??
			(transcribing
				? "Transcribing…"
				: recording
					? "Stop recording"
					: "Dictate (voice input)")}
		class="shrink-0 p-1.5 rounded transition-colors disabled:opacity-40 {recording
			? 'text-red-400 animate-pulse'
			: errorMessage
				? 'text-maximumYellow'
				: 'opacity-60 hover-opacity-100'}"
	>
		{#if transcribing}
			<span
				class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
			></span>
		{:else}
			<span aria-hidden="true" class="i-ph-microphone-bold block text-16px"
			></span>
		{/if}
	</button>
{/if}
