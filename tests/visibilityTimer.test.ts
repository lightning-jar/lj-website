import "./setup.dom";

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { startVisibilityTimer } from "../src/lib/utils/visibilityTimer"; // adjust path

// ---- Test environment/mocks ----

// Simple RAF clock controller
let now = 0;
let rafQueue: Array<FrameRequestCallback> = [];
let rafIdCounter = 1;
const rafIds = new Map<number, FrameRequestCallback>();

const _onExit = mock(() => {});

function _flushRAFFrames(times = 1) {
	for (let i = 0; i < times; i++) {
		// Advance time minimally to simulate frame progression
		now += 16.67;
		// Copy callbacks to avoid mutation during iteration
		const toRun = [...rafQueue];
		rafQueue = [];
		for (const cb of toRun) cb(now);
	}
}

function advance(ms: number) {
	// Advance time in ~60fps steps, ensuring tick loops get chances to run
	const frames = Math.max(1, Math.ceil(ms / 16.67));
	for (let i = 0; i < frames; i++) {
		now += 16.67;
		const toRun = [...rafQueue];
		rafQueue = [];
		for (const cb of toRun) cb(now);
	}
}

beforeEach(() => {
	now = 0;
	rafQueue = [];
	rafIdCounter = 1;
	rafIds.clear();

	// performance.now mock
	globalThis.performance = {
		now: () => now,
	} as Performance;

	// requestAnimationFrame/cancelAnimationFrame mocks
	globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
		const id = rafIdCounter++;
		rafIds.set(id, cb);
		rafQueue.push(cb);
		return id;
	};
	globalThis.cancelAnimationFrame = (id: number) => {
		rafIds.delete(id);
		// No need to remove from queue; we operate on copied arrays per frame
	};

	// IntersectionObserver mock
	class IO implements IntersectionObserver {
		root: Element | null;
		rootMargin: string;
		scrollMargin = "0px";
		thresholds: number[];
		callback: IntersectionObserverCallback;
		observed = new Set<Element>();
		readonly rootBounds: DOMRectReadOnly | null = null;

		constructor(
			cb: IntersectionObserverCallback,
			opts?: IntersectionObserverInit,
		) {
			this.callback = cb;
			// @ts-expect-error intentional
			this.root = opts?.root ?? null;
			this.rootMargin = opts?.rootMargin ?? "0px";
			const th = opts?.threshold ?? 0;
			this.thresholds = Array.isArray(th) ? th : [th];
		}
		observe(el: Element) {
			this.observed.add(el);
		}
		unobserve(el: Element) {
			this.observed.delete(el);
		}
		disconnect() {
			this.observed.clear();
		}
		takeRecords(): IntersectionObserverEntry[] {
			return [];
		}
		// Helper to simulate visibility changes
		trigger(
			target: Element,
			isIntersecting: boolean,
			ratio = isIntersecting ? 1 : 0,
		) {
			const entry: IntersectionObserverEntry = {
				boundingClientRect: {} as DOMRectReadOnly,
				intersectionRect: {} as DOMRectReadOnly,
				isIntersecting,
				intersectionRatio: ratio,
				rootBounds: null,
				target,
				time: now,
			};
			this.callback([entry], this as unknown as IntersectionObserver);
		}
	}

	globalThis.IntersectionObserver =
		IO as unknown as typeof IntersectionObserver;
});

// Utility target element
function makeTarget(): Element {
	const el = globalThis.document?.createElement?.("div");
	if (el) return el;
	// Minimal Element substitute for non-DOM env
	return {
		nodeType: 1,
	} as unknown as Element;
}

// To capture last created IO instance, we rewrap and store reference
type TestIOInstance = {
	root: Element | null;
	rootMargin: string;
	thresholds: number[];
	observed: Set<Element>;
	trigger: (target: Element, isIntersecting: boolean, ratio?: number) => void;
};

let lastIO: TestIOInstance;
beforeEach(() => {
	const RealIO = globalThis.IntersectionObserver as unknown as new (
		cb: IntersectionObserverCallback,
		opts?: IntersectionObserverInit,
	) => TestIOInstance;

	const Wrapper = function (
		this: TestIOInstance,
		cb: IntersectionObserverCallback,
		opts?: IntersectionObserverInit,
	) {
		const inst = new RealIO(cb, opts);
		lastIO = inst;
		return inst;
	} as unknown as typeof IntersectionObserver;

	// Preserve prototype to behave like an IntersectionObserver constructor
	Object.setPrototypeOf(Wrapper, RealIO);
	// @ts-expect-error assigning prototype for test shim
	Wrapper.prototype = (RealIO as unknown as { prototype: object }).prototype;

	globalThis.IntersectionObserver = Wrapper;
});

// ---- Tests ----

describe("startVisibilityTimer - input validation", () => {
	it("throws if target is not Element", () => {
		expect(() =>
			// @ts-expect-error intentional
			startVisibilityTimer({ target: null, durationMs: 1000, onFinish() {} }),
		).toThrow("target must be Element");
	});

	it("throws if durationMs <= 0 or not finite", () => {
		const target = makeTarget();

		expect(() =>
			startVisibilityTimer({ target, durationMs: 0, onFinish() {} }),
		).toThrow("durationMs must be > 0");

		expect(() =>
			startVisibilityTimer({ target, durationMs: NaN, onFinish() {} }),
		).toThrow("durationMs must be > 0");
	});

	it("throws if onFinish not a function", () => {
		const target = makeTarget();

		expect(() =>
			// @ts-expect-error intentional
			startVisibilityTimer({ target, durationMs: 1000, onFinish: null }),
		).toThrow("onFinish must be function");
	});

	it("throws if onEnter/onExit not functions", () => {
		const target = makeTarget();
		expect(() =>
			startVisibilityTimer({
				target,
				durationMs: 1000,
				onFinish() {},
				// Intentionally wrong type; cast via unknown to avoid any
				onEnter: 1 as unknown as never,
			}),
		).toThrow("onEnter must be function");
		expect(() =>
			startVisibilityTimer({
				target,
				durationMs: 1000,
				onFinish() {},
				// Intentionally wrong type; cast via unknown to avoid any
				onExit: {} as unknown as never,
			}),
		).toThrow("onExit must be function");
	});
});

describe("startVisibilityTimer - lifecycle", () => {
	it("calls onEnter on first visible, onExit on hide, and onFinish after visible duration", () => {
		const target = makeTarget();

		const onEnter = mock(() => {});
		const onExit = mock(() => {});
		const onFinish = mock(() => {});

		const api = startVisibilityTimer({
			target,
			durationMs: 1000,
			onEnter,
			onExit,
			onFinish,
		});

		expect(api.visible).toBe(false);
		expect(api.remaining).toBe(1000);

		// Simulate visible
		lastIO.trigger(target, true, 1);
		expect(api.visible).toBe(true);
		expect(onEnter.mock.calls.length).toBe(1);

		// Advance less than required
		advance(600);
		expect(onFinish.mock.calls.length).toBe(0);
		expect(api.remaining).toBeGreaterThan(300);
		expect(api.remaining).toBeLessThan(1000);

		// Hide triggers pause and exit
		lastIO.trigger(target, false, 0);
		expect(api.visible).toBe(false);
		expect(onExit.mock.calls.length).toBe(1);

		// Remaining should reflect auto-reset semantics on next visible (fresh cycle),
		// but while hidden, getter returns last computed remaining of paused cycle
		const pausedRemaining = api.remaining;
		expect(pausedRemaining).toBeGreaterThan(0);
		expect(pausedRemaining).toBeLessThan(1000);

		// Re-enter: should start new cycle and discard progress
		lastIO.trigger(target, true, 1);
		expect(onEnter.mock.calls.length).toBe(2);
		expect(api.visible).toBe(true);
		// Remaining should be near full when just re-entered
		expect(api.remaining).toBeGreaterThan(900);

		// Finish this cycle
		advance(1000);
		expect(onFinish.mock.calls.length).toBe(1);
		expect(api.lastFinishedAt).not.toBeNull();
		// After finish, still observing; remaining getter should be 0
		expect(Math.round(api.remaining)).toBe(0);
	});

	it("does not double-fire onExit if already hidden", () => {
		const target = makeTarget();
		const onExit = mock(() => {});
		const _api = startVisibilityTimer({
			target,
			durationMs: 300,
			onFinish() {},
			onExit,
		});

		// Hide while already hidden: no-op
		lastIO.trigger(target, false, 0);
		expect(onExit.mock.calls.length).toBe(0);

		// Show then hide
		lastIO.trigger(target, true, 1);
		lastIO.trigger(target, false, 0);
		expect(onExit.mock.calls.length).toBe(1);

		// Hide again remains hidden
		lastIO.trigger(target, false, 0);
		expect(onExit.mock.calls.length).toBe(1);
	});

	it("finish while visible does not disconnect; future re-entries start fresh cycles", () => {
		const target = makeTarget();
		const onEnter = mock(() => {});
		const onFinish = mock(() => {});
		startVisibilityTimer({
			target,
			durationMs: 200,
			onFinish,
			onEnter,
		});

		lastIO.trigger(target, true, 1);
		expect(onEnter.mock.calls.length).toBe(1);

		advance(250);
		expect(onFinish.mock.calls.length).toBe(1);
		// Remains observed; re-enter should start new cycle
		lastIO.trigger(target, false, 0);
		lastIO.trigger(target, true, 1);
		expect(onEnter.mock.calls.length).toBe(2);
		advance(210);
		expect(onFinish.mock.calls.length).toBe(2);
	});
});

describe("startVisibilityTimer - manual controls and destroy", () => {
	it("forceEnter/forceExit toggle visibility and callbacks", () => {
		const target = makeTarget();
		const onEnter = mock(() => {});
		const onExit = mock(() => {});
		const api = startVisibilityTimer({
			target,
			durationMs: 500,
			onFinish() {},
			onEnter,
			onExit,
		});

		api.forceEnter();
		expect(api.visible).toBe(true);
		expect(onEnter.mock.calls.length).toBe(1);

		advance(100);
		api.forceExit();
		expect(api.visible).toBe(false);
		expect(onExit.mock.calls.length).toBe(1);
	});

	it("destroy stops RAF and IO, optionally fires exit if visible", () => {
		const target = makeTarget();
		const onExit = mock(() => {});
		const api = startVisibilityTimer({
			target,
			durationMs: 500,
			onFinish() {},
			onExit,
		});

		// Become visible
		lastIO.trigger(target, true, 1);
		expect(api.visible).toBe(true);

		// Destroy without exit signal
		api.destroy();
		onExit.mockReset();
		const prevRemaining = api.remaining;
		advance(1000);
		// Remaining should not change after destroy (RAF stopped and state frozen)
		expect(api.remaining).toBe(prevRemaining);

		// New instance to test fireExitIfVisible
		const api2 = startVisibilityTimer({
			target,
			durationMs: 500,
			onFinish() {},
			onExit,
		});
		lastIO.trigger(target, true, 1);
		expect(api2.visible).toBe(true);
		api2.destroy({ fireExitIfVisible: true });
		expect(onExit.mock.calls.length).toBe(1); // only from the second instance’s destroy
	});

	it("resetNow restarts remaining immediately when visible", () => {
		const target = makeTarget();
		const onEnter = mock(() => {});
		const onFinish = mock(() => {});
		const _api = startVisibilityTimer({
			target,
			durationMs: 1000,
			onFinish,
			onEnter,
		});

		lastIO.trigger(target, true, 1);
		advance(400);
		const beforeResetRemaining = _api.remaining;
		expect(beforeResetRemaining).toBeGreaterThan(500);

		_api.resetNow();
		const afterResetRemaining = _api.remaining;
		expect(afterResetRemaining).toBeGreaterThan(900);

		advance(1000);
		expect(onFinish.mock.calls.length).toBe(1);
	});
});

describe("startVisibilityTimer - options", () => {
	it("passes options to IntersectionObserver", () => {
		const target = makeTarget();
		const opts = {
			root: makeTarget() as unknown as Element,
			rootMargin: "10px",
			threshold: [0.2, 0.5],
			debug: true,
		};
		startVisibilityTimer({
			target,
			durationMs: 500,
			onFinish() {},
			options: opts,
		});

		// Validate options by inspecting lastIO instance
		expect(lastIO.root).toBe(opts.root);
		expect(lastIO.rootMargin).toBe("10px");
		expect(lastIO.thresholds).toEqual([0.2, 0.5]);
	});

	it("io visible only when isIntersecting and ratio > 0", () => {
		const target = makeTarget();
		const onEnter = mock(() => {});
		const _api = startVisibilityTimer({
			target,
			durationMs: 200,
			onFinish() {},
			onEnter,
		});

		// Intersecting false -> hidden
		lastIO.trigger(target, false, 1);
		expect(_api.visible).toBe(false);

		// Intersecting true but ratio 0 -> hidden
		lastIO.trigger(target, true, 0);
		expect(_api.visible).toBe(false);

		// Intersecting true and ratio > 0 -> visible
		lastIO.trigger(target, true, 0.2);
		expect(_api.visible).toBe(true);
		expect(onEnter.mock.calls.length).toBe(1);
	});
});
