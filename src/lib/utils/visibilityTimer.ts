type VisibilityTimerOptions = {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number | number[];
	debug?: boolean;
};
type StartVisibilityTimerArgs = {
	target: Element;
	durationMs: number;
	onEnter?: () => void; // called on every re-entry (first frame of new visible period)
	onExit?: () => void; // called on every exit (last frame of current visible period)
	onFinish: () => void; // called when visible time reaches duration of the current entry
	options?: VisibilityTimerOptions;
};

export function startVisibilityTimer({
	target,
	durationMs,
	onEnter,
	onExit,
	onFinish,
	options = {},
}: StartVisibilityTimerArgs) {
	if (!(target instanceof Element)) throw new Error("target must be Element");
	if (!Number.isFinite(durationMs) || durationMs <= 0)
		throw new Error("durationMs must be > 0");
	if (typeof onFinish !== "function")
		throw new Error("onFinish must be function");
	if (onEnter && typeof onEnter !== "function")
		throw new Error("onEnter must be function");
	if (onExit && typeof onExit !== "function")
		throw new Error("onExit must be function");

	const debug = !!options.debug;
	const log = (...args: unknown[]) =>
		debug && console.log("[visibilityTimer]", ...args);

	// State for the current cycle
	let remaining = durationMs;
	let visibleSince: number | null = null;
	let isVisible = false;
	let rafId: number | null = null;
	let observer: IntersectionObserver | null = null;

	// Public flags
	let lastFinishedAt: number | null = null;

	const stopRAF = () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = null;
	};

	const tick = () => {
		const now = performance.now();
		if (visibleSince !== null) {
			const elapsed = now - visibleSince;
			if (elapsed >= remaining) {
				// Finish this cycle
				visibleSince = null;
				remaining = 0;
				lastFinishedAt = now;
				log("finish");
				try {
					onFinish();
				} catch (e) {
					console.error("onFinish error", e);
				}
				// Do NOT disconnect; future re-entries start a fresh cycle
			}
		}
		rafId = requestAnimationFrame(tick);
	};

	const ensureRAF = () => {
		if (rafId === null) rafId = requestAnimationFrame(tick);
	};

	const startNewCycle = (now: number) => {
		remaining = durationMs;
		visibleSince = now;
		try {
			onEnter?.();
		} catch (e) {
			console.error("onEnter error", e);
		}
		log("enter -> new cycle start", { remaining });
	};

	const pauseCurrentCycle = (now: number) => {
		if (visibleSince === null) return;
		const elapsed = now - visibleSince;
		remaining -= elapsed;
		visibleSince = null;
		log("hidden -> cancel/pause", { elapsed, remaining });
		// Auto-reset semantics: next re-entry starts a fresh cycle, so partial progress is discarded.
	};

	const setVisible = (nextVisible: boolean) => {
		if (isVisible === nextVisible) return;
		const prevVisible = isVisible;
		isVisible = nextVisible;

		const now = performance.now();

		if (isVisible) {
			// Transition: hidden -> visible
			startNewCycle(now);
		} else {
			// Transition: visible -> hidden
			pauseCurrentCycle(now);
			if (prevVisible) {
				// Fire onExit exactly once on the transition to hidden
				try {
					onExit?.();
				} catch (e) {
					console.error("onExit error", e);
				}
			}
		}
	};

	const ioCallback: IntersectionObserverCallback = (entries) => {
		const entry = entries.find((e) => e.target === target);
		if (!entry) return;
		const nextVisible = entry.isIntersecting && entry.intersectionRatio > 0;
		log("IO", {
			isIntersecting: entry.isIntersecting,
			ratio: entry.intersectionRatio,
		});
		setVisible(nextVisible);
	};

	observer = new IntersectionObserver(ioCallback, {
		root: options.root ?? null,
		rootMargin: options.rootMargin ?? "0px",
		threshold: options.threshold ?? 0.1,
	});
	observer.observe(target);

	ensureRAF();

	const destroy = (opts?: { fireExitIfVisible?: boolean }) => {
		// Optionally signal exit when tearing down while visible
		if (opts?.fireExitIfVisible && isVisible) {
			setVisible(false);
		}
		stopRAF();
		observer?.disconnect();
		observer = null;
	};

	// Manual controls (optional)
	const forceEnter = () => setVisible(true);
	const forceExit = () => setVisible(false);

	return {
		destroy,
		forceEnter,
		forceExit,
		// Read-only state
		get visible() {
			return isVisible;
		},
		get remaining() {
			if (!isVisible || visibleSince === null) return remaining;
			const now = performance.now();
			const elapsed = now - visibleSince;
			return Math.max(0, remaining - elapsed);
		},
		get lastFinishedAt() {
			return lastFinishedAt;
		},
		// For external reset semantics (if you need to restart immediately while visible)
		resetNow: () => {
			const now = performance.now();
			remaining = durationMs;
			visibleSince = isVisible ? now : null;
			log("manual reset", { isVisible, remaining });
		},
	};
}
