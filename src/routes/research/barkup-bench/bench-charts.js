// @ts-nocheck
// Chart rendering for the barkup-bench dashboard, transplanted from the
// original results artifact. Runs on mount; builds inline SVGs from DATA.
export function initBenchCharts() {
	// Absent-mount tolerance (per-study pages render a subset of
	// figures): missing ids write into a detached node instead of throwing.
	const byId = (id) =>
		document.getElementById(id) ?? document.createElement("div");
	const DATA = {
		crossover: {
			A: [
				{ bucket: "xs", n: 216, ok: 207, rate: 95.8, low: 92.3, high: 97.8 },
				{ bucket: "s", n: 232, ok: 225, rate: 97, low: 93.9, high: 98.5 },
				{ bucket: "m", n: 184, ok: 160, rate: 87, low: 81.3, high: 91.1 },
				{ bucket: "l", n: 168, ok: 143, rate: 85.1, low: 79, high: 89.7 },
			],
			B: [
				{ bucket: "xs", n: 216, ok: 209, rate: 96.8, low: 93.5, high: 98.4 },
				{ bucket: "s", n: 232, ok: 223, rate: 96.1, low: 92.8, high: 97.9 },
				{ bucket: "m", n: 184, ok: 165, rate: 89.7, low: 84.4, high: 93.3 },
				{ bucket: "l", n: 168, ok: 151, rate: 89.9, low: 84.4, high: 93.6 },
			],
			C: [
				{ bucket: "xs", n: 216, ok: 211, rate: 97.7, low: 94.7, high: 99 },
				{ bucket: "s", n: 232, ok: 225, rate: 97, low: 93.9, high: 98.5 },
				{ bucket: "m", n: 184, ok: 166, rate: 90.2, low: 85.1, high: 93.7 },
				{ bucket: "l", n: 168, ok: 149, rate: 88.7, low: 83, high: 92.6 },
			],
			D: [
				{ bucket: "xs", n: 216, ok: 211, rate: 97.7, low: 94.7, high: 99 },
				{ bucket: "s", n: 232, ok: 224, rate: 96.6, low: 93.3, high: 98.2 },
				{ bucket: "m", n: 184, ok: 166, rate: 90.2, low: 85.1, high: 93.7 },
				{ bucket: "l", n: 168, ok: 151, rate: 89.9, low: 84.4, high: 93.6 },
			],
			E: [
				{ bucket: "xs", n: 216, ok: 202, rate: 93.5, low: 89.4, high: 96.1 },
				{ bucket: "s", n: 232, ok: 218, rate: 94, low: 90.1, high: 96.4 },
				{ bucket: "m", n: 184, ok: 155, rate: 84.2, low: 78.3, high: 88.8 },
				{ bucket: "l", n: 168, ok: 117, rate: 69.6, low: 62.3, high: 76.1 },
			],
			F: [
				{ bucket: "xs", n: 216, ok: 210, rate: 97.2, low: 94.1, high: 98.7 },
				{ bucket: "s", n: 232, ok: 226, rate: 97.4, low: 94.5, high: 98.8 },
				{ bucket: "m", n: 184, ok: 162, rate: 88, low: 82.6, high: 92 },
				{ bucket: "l", n: 168, ok: 143, rate: 85.1, low: 79, high: 89.7 },
			],
		},
		tokens: {
			A: [1137, 2919, 7615, 15638],
			B: [1250, 3672, 10766, 22961],
			C: [4958, 14535, 12198, 23733],
			D: [4915, 13187, 9999, 17451],
			E: [1284, 2999, 6497, 15412],
			F: [1170, 2725, 6370, 13155],
		},
		reference: [
			{
				model: "haiku-4.5",
				cells: {
					A: { ok: 34, rate: 85, low: 70.9, high: 92.9 },
					B: { ok: 35, rate: 87.5, low: 73.9, high: 94.5 },
					C: { ok: 39, rate: 97.5, low: 87.1, high: 99.6 },
					D: { ok: 40, rate: 100, low: 91.2, high: 100 },
					E: { ok: 28, rate: 70, low: 54.6, high: 81.9 },
					F: { ok: 35, rate: 87.5, low: 73.9, high: 94.5 },
				},
			},
			{
				model: "sonnet-4.5",
				cells: {
					A: { ok: 37, rate: 92.5, low: 80.1, high: 97.4 },
					B: { ok: 36, rate: 90, low: 76.9, high: 96 },
					C: { ok: 40, rate: 100, low: 91.2, high: 100 },
					D: { ok: 40, rate: 100, low: 91.2, high: 100 },
					E: { ok: 30, rate: 75, low: 59.8, high: 85.8 },
					F: { ok: 40, rate: 100, low: 91.2, high: 100 },
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					A: { ok: 31, rate: 77.5, low: 62.5, high: 87.7 },
					B: { ok: 34, rate: 85, low: 70.9, high: 92.9 },
					C: { ok: 27, rate: 67.5, low: 52, high: 79.9 },
					D: { ok: 30, rate: 75, low: 59.8, high: 85.8 },
					E: { ok: 30, rate: 75, low: 59.8, high: 85.8 },
					F: { ok: 33, rate: 82.5, low: 68, high: 91.3 },
				},
			},
			{
				model: "gpt-5.4",
				cells: {
					A: { ok: 39, rate: 97.5, low: 87.1, high: 99.6 },
					B: { ok: 39, rate: 97.5, low: 87.1, high: 99.6 },
					C: { ok: 40, rate: 100, low: 91.2, high: 100 },
					D: { ok: 40, rate: 100, low: 91.2, high: 100 },
					E: { ok: 31, rate: 77.5, low: 62.5, high: 87.7 },
					F: { ok: 37, rate: 92.5, low: 80.1, high: 97.4 },
				},
			},
		],
		perModel: [
			{
				model: "haiku-4.5",
				cells: { A: 91, B: 92.5, C: 95, D: 95, E: 80.5, F: 92 },
			},
			{
				model: "sonnet-4.5",
				cells: { A: 94.5, B: 94, C: 95.5, D: 96, E: 88.5, F: 93.5 },
			},
			{
				model: "gemini-3.5-flash",
				cells: { A: 86.5, B: 92, C: 88.5, D: 88, E: 87.5, F: 91 },
			},
			{
				model: "gpt-5.4",
				cells: { A: 95.5, B: 95.5, C: 96.5, D: 97, E: 89.5, F: 94 },
			},
		],
		footgun: [
			{
				model: "haiku-4.5",
				v1: { ok: 23, n: 80, rate: 28.7, low: 20, high: 39.5 },
				v2: { ok: 79, n: 80, rate: 98.8, low: 93.3, high: 99.8 },
			},
			{
				model: "sonnet-4.5",
				v1: { ok: 77, n: 80, rate: 96.3, low: 89.5, high: 98.7 },
				v2: { ok: 80, n: 80, rate: 100, low: 95.4, high: 100 },
			},
			{
				model: "gemini-3.5-flash",
				v1: { ok: 3, n: 80, rate: 3.8, low: 1.3, high: 10.5 },
				v2: { ok: 57, n: 80, rate: 71.3, low: 60.5, high: 80 },
			},
			{
				model: "gpt-5.4",
				v1: { ok: 77, n: 80, rate: 96.3, low: 89.5, high: 98.7 },
				v2: { ok: 80, n: 80, rate: 100, low: 95.4, high: 100 },
			},
		],
		sizeext: [
			{
				model: "sonnet-4.5",
				condition: "A",
				cells: [
					{ bucket: "xl", ok: 15, n: 15, rate: 100, low: 79.6, high: 100 },
					{ bucket: "xxl", ok: 14, n: 15, rate: 93.3, low: 70.2, high: 98.8 },
					{ bucket: "xxxl", ok: 12, n: 15, rate: 80, low: 54.8, high: 93 },
				],
			},
			{
				model: "sonnet-4.5",
				condition: "E",
				cells: [
					{ bucket: "xl", ok: 8, n: 15, rate: 53.3, low: 30.1, high: 75.2 },
					{ bucket: "xxl", ok: 3, n: 15, rate: 20, low: 7, high: 45.2 },
					{ bucket: "xxxl", ok: 1, n: 15, rate: 6.7, low: 1.2, high: 29.8 },
				],
			},
			{
				model: "sonnet-4.5",
				condition: "F",
				cells: [
					{ bucket: "xl", ok: 15, n: 15, rate: 100, low: 79.6, high: 100 },
					{ bucket: "xxl", ok: 15, n: 15, rate: 100, low: 79.6, high: 100 },
					{ bucket: "xxxl", ok: 13, n: 15, rate: 86.7, low: 62.1, high: 96.3 },
				],
			},
			{
				model: "gemini-3.5-flash",
				condition: "A",
				cells: [
					{ bucket: "xl", ok: 9, n: 15, rate: 60, low: 35.7, high: 80.2 },
					{ bucket: "xxl", ok: 5, n: 15, rate: 33.3, low: 15.2, high: 58.3 },
					{ bucket: "xxxl", ok: 0, n: 15, rate: 0, low: 0, high: 20.4 },
				],
			},
			{
				model: "gemini-3.5-flash",
				condition: "E",
				cells: [
					{ bucket: "xl", ok: 8, n: 15, rate: 53.3, low: 30.1, high: 75.2 },
					{ bucket: "xxl", ok: 3, n: 15, rate: 20, low: 7, high: 45.2 },
					{ bucket: "xxxl", ok: 2, n: 15, rate: 13.3, low: 3.7, high: 37.9 },
				],
			},
			{
				model: "gemini-3.5-flash",
				condition: "F",
				cells: [
					{ bucket: "xl", ok: 14, n: 15, rate: 93.3, low: 70.2, high: 98.8 },
					{ bucket: "xxl", ok: 14, n: 15, rate: 93.3, low: 70.2, high: 98.8 },
					{ bucket: "xxxl", ok: 13, n: 15, rate: 86.7, low: 62.1, high: 96.3 },
				],
			},
		],
	};
	const CONDITIONS = ["A", "B", "C", "D", "E", "F"];
	const COND_NAMES = {
		A: "HTML + rewrite",
		B: "JSON + rewrite",
		C: "JSON + tools",
		D: "HTML + tools",
		E: "JSON Patch",
		F: "anchored patch",
	};
	const COLOR = {
		A: "#3987e5",
		B: "#199e70",
		C: "#c98500",
		D: "#008300",
		E: "#9085e9",
		F: "#e66767",
	};
	const BUCKET_LABELS = ["~5 nodes", "~20", "~60", "~150"];
	const BUCKET_KEYS = ["xs", "s", "m", "l"];

	function figCap(text) {
		return '<div class="chart-caption">' + text + "</div>";
	}

	function esc(s) {
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/"/g, "&quot;");
	}

	// A chipless legend note row; `label` is an optional inline heading
	// (e.g. "bars"), bolded via the key shortcut's .note-label selector.
	function legendNote(text, label) {
		return (
			'<span class="key note">' +
			(label ? '<span class="note-label">' + label + ":</span> " : "") +
			text +
			"</span>"
		);
	}

	function legend(el) {
		byId(el).innerHTML = CONDITIONS.map(
			(c) =>
				`<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:${COLOR[c]}"></span><span class="font-mono font-700 text-white">${c}</span> ${COND_NAMES[c]}</span>`,
		).join("");
	}
	legend("legend-1");
	legend("legend-2");
	legend("legend-3");

	// --- shared tooltip ---
	const tooltip = byId("tooltip");
	function showTip(evt, text) {
		tooltip.textContent = text;
		tooltip.style.opacity = "1";
		const pad = 14;
		let x = evt.clientX + pad,
			y = evt.clientY + pad;
		const r = tooltip.getBoundingClientRect();
		if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
		if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
		tooltip.style.left = x + "px";
		tooltip.style.top = y + "px";
	}
	function hideTip() {
		tooltip.style.opacity = "0";
	}

	// Resolve vertical label collisions: keep >= minGap between sorted positions.
	function resolveLabels(items, minGap) {
		const sorted = [...items].sort((a, b) => a.y - b.y);
		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i].y - sorted[i - 1].y < minGap)
				sorted[i].y = sorted[i - 1].y + minGap;
		}
		return items;
	}

	// --- generic multi-series line chart over the four size buckets ---
	function lineChart(mount, opts) {
		const W = 880,
			H = 380,
			L = 56,
			R = 120,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const xs = BUCKET_KEYS.map(
			(_, i) => L + (iw * i) / (BUCKET_KEYS.length - 1),
		);
		const yOf = (v) =>
			T + ih - ((v - opts.yMin) / (opts.yMax - opts.yMin)) * ih;
		let g = "";
		// grid + y ticks
		for (const tick of opts.ticks) {
			const y = yOf(tick);
			g += `<line x1="${L}" x2="${L + iw}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${L - 8}" y="${y + 4}" text-anchor="end">${opts.fmt(tick)}</text>`;
		}
		// x labels
		BUCKET_LABELS.forEach((lab, i) => {
			g += `<text class="chart-tick" x="${xs[i]}" y="${H - B + 22}" text-anchor="middle">${lab}</text>`;
		});
		let marks = "",
			hits = "";
		const endLabels = [];
		CONDITIONS.forEach((c, ci) => {
			const series = opts.series[c];
			const jitter = (ci - 2) * 3;
			const pts = series.map((v, i) => ({
				x: xs[i] + (opts.jitterCI ? jitter : 0),
				y: yOf(v.value),
				v,
			}));
			// CI whiskers first (under the line)
			if (opts.jitterCI) {
				pts.forEach((p) => {
					if (p.v.low === undefined) return;
					const y1 = yOf(p.v.low),
						y2 = yOf(p.v.high);
					marks += `<line x1="${p.x}" x2="${p.x}" y1="${y1}" y2="${y2}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
					marks += `<line x1="${p.x - 3}" x2="${p.x + 3}" y1="${y1}" y2="${y1}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
					marks += `<line x1="${p.x - 3}" x2="${p.x + 3}" y1="${y2}" y2="${y2}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
				});
			}
			const path = pts
				.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
				.join(" ");
			marks += `<path d="${path}" fill="none" stroke="${COLOR[c]}" stroke-width="2" stroke-linejoin="round"/>`;
			pts.forEach((p, i) => {
				marks += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${COLOR[c]}" stroke="hsl(217,48%,15%)" stroke-width="2"/>`;
				hits += `<circle cx="${p.x}" cy="${p.y}" r="13" fill="transparent" data-tip="${esc(opts.tip(c, i, p.v))}"/>`;
			});
			endLabels.push({
				c,
				y: pts[pts.length - 1].y + 4,
				x: pts[pts.length - 1].x + 12,
			});
		});
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels) {
			labels += `<text font-size="12" font-weight="700" x="${l.x}" y="${l.y}" fill="${COLOR[l.c]}">${l.c} · ${opts.endLabel(l.c)}</text>`;
		}
		const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.aria)}">${g}${marks}${labels}${hits}</svg>`;
		const el = byId(mount);
		el.innerHTML = svg + figCap("tree size bucket");
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
	}

	// Chart 1 · crossover
	lineChart("fig-crossover", {
		series: Object.fromEntries(
			CONDITIONS.map((c) => [
				c,
				DATA.crossover[c].map((d) => ({
					value: d.rate,
					low: d.low,
					high: d.high,
					n: d.n,
					ok: d.ok,
				})),
			]),
		),
		yMin: 60,
		yMax: 100,
		ticks: [60, 70, 80, 90, 100],
		fmt: (v) => v + "%",
		jitterCI: true,
		tip: (c, i, v) =>
			`${c} · ${COND_NAMES[c]}\n${BUCKET_LABELS[i]} bucket: ${v.value}%\n${v.ok}/${v.n} tasks · CI [${v.low}%, ${v.high}%]`,
		endLabel: (c) => DATA.crossover[c][3].rate + "%",
		aria: "Task success rate by tree size for the five conditions; rewrite conditions lead at every size.",
	});

	// Chart 2 · tokens per solved task
	lineChart("fig-tokens", {
		series: Object.fromEntries(
			CONDITIONS.map((c) => [c, DATA.tokens[c].map((v) => ({ value: v }))]),
		),
		yMin: 0,
		yMax: 24000,
		ticks: [0, 6000, 12000, 18000, 24000],
		fmt: (v) => v / 1000 + "k",
		jitterCI: false,
		tip: (c, i, v) =>
			`${c} · ${COND_NAMES[c]}\n${BUCKET_LABELS[i]} bucket: ${v.value.toLocaleString()} tokens\nmean in+out per solved task`,
		endLabel: (c) => (DATA.tokens[c][3] / 1000).toFixed(1) + "k",
		aria: "Mean tokens per solved task by tree size; tool conditions cost four to five times more on small and medium trees.",
	});

	// Chart 3 · reference dot plot
	(() => {
		const W = 880,
			ROW = 64,
			T = 8,
			B = 40,
			L = 150,
			R = 24;
		const H = T + DATA.reference.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 25, 50, 75, 100]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}%</text>`;
		}
		let marks = "",
			hits = "";
		DATA.reference.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g += `<line x1="${L}" x2="${L + iw}" y1="${cy}" y2="${cy}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>`;
			g += `<text fill="#ffffff" font-size="12.5" x="${L - 12}" y="${cy + 4}" text-anchor="end">${row.model}</text>`;
			CONDITIONS.forEach((c) => {
				const cell = row.cells[c];
				const x = xOf(cell.rate);
				marks += `<line x1="${xOf(cell.low)}" x2="${xOf(cell.high)}" y1="${cy}" y2="${cy}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.4"/>`;
				marks += `<circle cx="${x}" cy="${cy}" r="5.5" fill="${COLOR[c]}" stroke="hsl(217,48%,15%)" stroke-width="2"/>`;
				hits += `<circle cx="${x}" cy="${cy}" r="13" fill="transparent" data-tip="${esc(`${c} · ${COND_NAMES[c]}\n${row.model}: ${cell.rate}%\n${cell.ok}/40 · CI [${cell.low}%, ${cell.high}%]`)}"/>`;
			});
		});
		const el = byId("fig-reference");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reference-task success per model and condition; tools conditions collapse for haiku and gemini.">${g}${marks}${hits}</svg>` +
			figCap("reference-task success (n = 40 per cell)");
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
	})();

	// Heatmap · per model × condition (sequential blue ramp, one hue)
	(() => {
		const RAMP = [
			[74, "#cde2fb", "#0b0b0b"],
			[80, "#9ec5f4", "#0b0b0b"],
			[86, "#6da7ec", "#0b0b0b"],
			[91, "#3987e5", "#0b0b0b"],
			[94, "#256abf", "#ffffff"],
			[100, "#184f95", "#ffffff"],
		];
		const stepOf = (v) => RAMP.find(([max]) => v <= max);
		let html = `<table><thead><tr><th scope="col">model</th>${CONDITIONS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`;
		for (const row of DATA.perModel) {
			html += `<tr><td class="heat">${row.model}</td>`;
			for (const c of CONDITIONS) {
				const v = row.cells[c];
				const [, bg, ink] = stepOf(v);
				html += `<td class="heat" style="background:${bg};color:${ink}">${v.toFixed(1)}%</td>`;
			}
			html += "</tr>";
		}
		html += "</tbody></table>";
		byId("fig-heat").innerHTML = html;
	})();

	// --- Study G footgun dumbbell ---
	(() => {
		const W = 880,
			ROW = 64,
			T = 40,
			B = 44,
			L = 170,
			R = 30;
		const rows = [...DATA.footgun].sort((a, b) => a.v1.rate - b.v1.rate);
		const H = T + rows.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		g +=
			'<circle cx="' +
			L +
			'" cy="16" r="6" fill="hsl(217,48%,15%)" stroke="#c98500" stroke-width="2.5"/><text class="chart-tick" x="' +
			(L + 14) +
			'" y="20">v1 · tool calls hidden</text>';
		g +=
			'<circle cx="' +
			(L + 220) +
			'" cy="16" r="6.5" fill="#3987e5" stroke="hsl(217,48%,15%)" stroke-width="2"/><text class="chart-tick" x="' +
			(L + 234) +
			'" y="20">v2 · corrected history</text>';
		for (const tick of [0, 25, 50, 75, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		let hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			g +=
				'<line x1="' +
				xOf(row.v1.rate) +
				'" x2="' +
				xOf(row.v2.rate) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="#c98500" stroke-width="3" opacity="0.35"/>';
			g +=
				'<circle cx="' +
				xOf(row.v1.rate) +
				'" cy="' +
				cy +
				'" r="6" fill="hsl(217,48%,15%)" stroke="#c98500" stroke-width="2.5"/>';
			g +=
				'<circle cx="' +
				xOf(row.v2.rate) +
				'" cy="' +
				cy +
				'" r="6.5" fill="#3987e5" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
			hits +=
				'<circle cx="' +
				xOf(row.v1.rate) +
				'" cy="' +
				cy +
				'" r="13" fill="transparent" data-tip="' +
				esc(
					row.model +
						" v1 (hidden history): " +
						row.v1.rate +
						"% · " +
						row.v1.ok +
						"/" +
						row.v1.n,
				) +
				'"/>';
			hits +=
				'<circle cx="' +
				xOf(row.v2.rate) +
				'" cy="' +
				cy +
				'" r="13" fill="transparent" data-tip="' +
				esc(
					row.model +
						" v2 (corrected): " +
						row.v2.rate +
						"% · " +
						row.v2.ok +
						"/" +
						row.v2.n,
				) +
				'"/>';
		});
		const el = byId("fig-footgun");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Reference-edit success per model with tool calls hidden from history versus corrected history.">' +
			g +
			hits +
			"</svg>";
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-footgun",
			["model", "v1 (hidden)", "v2 (corrected)"],
			DATA.footgun.map((r) => [
				r.model,
				r.v1.rate + "% (" + r.v1.ok + "/" + r.v1.n + ")",
				r.v2.rate + "% (" + r.v2.ok + "/" + r.v2.n + ")",
			]),
		);
	})();

	// --- Study H size extension ---
	(() => {
		const el = byId("legend-4");
		el.innerHTML =
			["A", "E", "F"]
				.map(
					(c) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						COLOR[c] +
						'"></span><span class="font-mono font-700 text-white">' +
						c +
						"</span> " +
						COND_NAMES[c] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 380,
			L = 56,
			R = 170,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const SIZES = ["~300 nodes", "~600", "~1000"];
		const xs = SIZES.map((_, i) => L + (iw * i) / (SIZES.length - 1));
		const yOf = (v) => T + ih - (v / 100) * ih;
		let g = "";
		for (const tick of [0, 25, 50, 75, 100]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick +
				"%</text>";
		}
		SIZES.forEach((lab, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xs[i] +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				lab +
				"</text>";
		});
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const series of DATA.sizeext) {
			const c = series.condition;
			const dashed = series.model.includes("gemini");
			const pts = series.cells.map((cell, i) => ({
				x: xs[i],
				y: yOf(cell.rate),
				cell,
			}));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				COLOR[c] +
				'" stroke-width="2" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p, i) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					COLOR[c] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						c +
							" · " +
							COND_NAMES[c] +
							" (" +
							series.model +
							") · " +
							SIZES[i] +
							": " +
							p.cell.rate +
							"% · " +
							p.cell.ok +
							"/" +
							p.cell.n +
							" · CI [" +
							p.cell.low +
							"%, " +
							p.cell.high +
							"%]",
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				c,
				text: c + " " + (dashed ? "gem" : "son") + " · " + last.cell.rate + "%",
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels)
			labels +=
				'<text font-size="12" font-weight="700" x="' +
				l.x +
				'" y="' +
				l.y +
				'" fill="' +
				COLOR[l.c] +
				'">' +
				l.text +
				"</text>";
		const el2 = byId("fig-sizeext");
		el2.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Task success at 300 to 1000 nodes: anchored patches hold for both models while rewrite falls to zero on the small model and positional patches decay.">' +
			g +
			marks +
			labels +
			hits +
			"</svg>";
		el2.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-sizeext",
			["series", ...SIZES],
			DATA.sizeext.map((s) => [
				s.condition + " · " + s.model,
				...s.cells.map((c) => c.rate + "% (" + c.ok + "/" + c.n + ")"),
			]),
		);
	})();

	// --- Studies I/J focused views: input tokens by size ---
	(() => {
		const VDATA = [
			{
				model: "sonnet-4.5",
				cond: "F",
				name: "full tree",
				tokens: [24365, 57585, 85642],
				ok: ["15/15", "15/15", "13/15"],
			},
			{
				model: "gemini-3.5-flash",
				cond: "F",
				name: "full tree",
				tokens: [20995, 39999, 70063],
				ok: ["14/15", "14/15", "13/15"],
			},
			{
				model: "sonnet-4.5",
				cond: "FV",
				name: "focused view",
				tokens: [2067, 2667, 3500],
				ok: ["15/15", "14/15", "14/15"],
			},
			{
				model: "gemini-3.5-flash",
				cond: "FV",
				name: "focused view",
				tokens: [2048, 2577, 3118],
				ok: ["14/15", "14/15", "14/15"],
			},
			{
				model: "sonnet-4.5",
				cond: "FT",
				name: "minimal view",
				tokens: [1331, 1491, 1531],
				ok: ["15/15", "15/15", "15/15"],
			},
			{
				model: "gemini-3.5-flash",
				cond: "FT",
				name: "minimal view",
				tokens: [1266, 1419, 1451],
				ok: ["13/15", "14/15", "14/15"],
			},
		];
		const VEXTRA = [
			{
				model: "sonnet-4.5",
				cond: "FVH",
				name: "focused view (HTML)",
				tokens: [1916, 2281, 2669],
				ok: ["15/15", "14/15", "14/15"],
			},
			{
				model: "gemini-3.5-flash",
				cond: "FVH",
				name: "focused view (HTML)",
				tokens: [1891, 2282, 2671],
				ok: ["14/15", "14/15", "14/15"],
			},
			{
				model: "sonnet-4.5",
				cond: "FTH",
				name: "minimal view (HTML)",
				tokens: [1281, 1376, 1391],
				ok: ["15/15", "15/15", "14/15"],
			},
			{
				model: "gemini-3.5-flash",
				cond: "FTH",
				name: "minimal view (HTML)",
				tokens: [1250, 1344, 1352],
				ok: ["13/15", "13/15", "14/15"],
			},
		];
		const VCOLOR = { F: "#e66767", FV: "#c98500", FT: "#199e70" };
		const VNAMES = {
			F: "full tree in the prompt",
			FV: "focused view (placeholders)",
			FT: "minimal view (omission counts)",
		};
		byId("legend-5").innerHTML =
			["F", "FV", "FT"]
				.map(
					(c) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						VCOLOR[c] +
						'"></span><span class="font-mono font-700 text-white">' +
						c +
						"</span> " +
						VNAMES[c] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 380,
			L = 64,
			R = 175,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const SIZES = ["~300 nodes", "~600", "~1000"];
		const xs = SIZES.map((_, i) => L + (iw * i) / (SIZES.length - 1));
		const yOf = (v) => T + ih - (v / 90000) * ih;
		let g = "";
		for (const tick of [0, 20000, 40000, 60000, 80000]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick / 1000 +
				"k</text>";
		}
		SIZES.forEach((lab, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xs[i] +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				lab +
				"</text>";
		});
		const figCaption =
			"median input tokens per task (accuracy statistically identical across all rows)";
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const s of VDATA) {
			const dashed = s.model.includes("gemini");
			const pts = s.tokens.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				VCOLOR[s.cond] +
				'" stroke-width="2" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					VCOLOR[s.cond] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						s.cond +
							" · " +
							VNAMES[s.cond] +
							" (" +
							s.model +
							")\n" +
							SIZES[p.i] +
							": " +
							p.v.toLocaleString() +
							" input tokens (median)\nsuccess " +
							s.ok[p.i],
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				c: s.cond,
				text:
					s.cond +
					" " +
					(dashed ? "gem" : "son") +
					" · " +
					(last.v >= 10000
						? (last.v / 1000).toFixed(1) + "k"
						: (last.v / 1000).toFixed(1) + "k"),
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels)
			labels +=
				'<text font-size="12" font-weight="700" x="' +
				l.x +
				'" y="' +
				l.y +
				'" fill="' +
				VCOLOR[l.c] +
				'">' +
				l.text +
				"</text>";
		const el = byId("fig-views");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Median input tokens by tree size: the full tree grows to 70 to 86 thousand tokens at 1000 nodes while focused and minimal views stay under 4 thousand, with accuracy unchanged.">' +
			g +
			marks +
			labels +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-views",
			["input shown (model)", ...SIZES.map((s) => s + " · tokens · success")],
			[...VDATA, ...VEXTRA].map((s) => [
				s.cond + " " + s.name + " (" + s.model + ")",
				...s.tokens.map((v, i) => v.toLocaleString() + " · " + s.ok[i]),
			]),
		);
	})();

	// --- Study K sessions: drift by session third ---
	(() => {
		const KDATA = [
			{
				policy: "K-once",
				name: "tree shown once",
				model: "sonnet-4.5",
				rate: [98.8, 92.5, 83.8],
				ok: ["79/80", "74/80", "67/80"],
				end: "8/20",
				tokens: "215.6k in + 0.7k out",
			},
			{
				policy: "K-once",
				name: "tree shown once",
				model: "gemini-3.5-flash",
				rate: [98.8, 100, 96.3],
				ok: ["79/80", "80/80", "77/80"],
				end: "17/20",
				tokens: "198.3k in + 0.6k out",
			},
			{
				policy: "K-refresh5",
				name: "full re-serialize @ 6/11",
				model: "sonnet-4.5",
				rate: [98.8, 92.5, 91.3],
				ok: ["79/80", "74/80", "73/80"],
				end: "11/20",
				tokens: "366.6k in + 0.7k out",
			},
			{
				policy: "K-refresh5",
				name: "full re-serialize @ 6/11",
				model: "gemini-3.5-flash",
				rate: [100, 100, 91.3],
				ok: ["80/80", "80/80", "73/80"],
				end: "15/20",
				tokens: "335.8k in + 0.6k out",
			},
			{
				policy: "K-view",
				name: "fresh minimal view every turn",
				model: "sonnet-4.5",
				rate: [100, 98.8, 100],
				ok: ["80/80", "79/80", "80/80"],
				end: "19/20",
				tokens: "55.7k in + 0.7k out",
			},
			{
				policy: "K-view",
				name: "fresh minimal view every turn",
				model: "gemini-3.5-flash",
				rate: [98.8, 100, 98.8],
				ok: ["79/80", "80/80", "79/80"],
				end: "19/20",
				tokens: "53.4k in + 0.7k out",
			},
			{
				policy: "K-rewrite",
				name: "whole-tree rewrite",
				model: "sonnet-4.5",
				rate: [97.2, 100, 94.4],
				ok: ["35/36", "36/36", "34/36"],
				end: "7/10",
				tokens: "836.0k in + 129.4k out",
			},
			{
				policy: "K-rewrite",
				name: "whole-tree rewrite",
				model: "gemini-3.5-flash",
				rate: [52.5, 67.5, 69.2],
				ok: ["21/40", "27/40", "27/39"],
				end: "2/10",
				tokens: "971.3k in + 138.1k out",
			},
		];
		const KCOLOR = {
			"K-once": "#c98500",
			"K-refresh5": "#9085e9",
			"K-view": "#e66767",
			"K-rewrite": "#3987e5",
		};
		const KNAMES = {
			"K-once": "tree shown once",
			"K-refresh5": "full refresh @ steps 6/11",
			"K-view": "fresh minimal view every turn",
			"K-rewrite": "whole-tree rewrite (anchor)",
		};
		byId("legend-6").innerHTML =
			Object.keys(KNAMES)
				.map(
					(p) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						KCOLOR[p] +
						'"></span><span class="font-mono font-700 text-white">' +
						p +
						"</span> " +
						KNAMES[p] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 380,
			L = 56,
			R = 195,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const THIRDS = ["steps 1–4", "steps 5–8", "steps 9–12"];
		const xs = THIRDS.map((_, i) => L + (iw * i) / (THIRDS.length - 1));
		const yOf = (v) => T + ih - ((v - 50) / 50) * ih;
		let g = "";
		for (const tick of [50, 60, 70, 80, 90, 100]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick +
				"%</text>";
		}
		THIRDS.forEach((lab, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xs[i] +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				lab +
				"</text>";
		});
		const figCaption =
			"per-step success by session third (step judged on its own edit against the model’s current tree)";
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const s of KDATA) {
			const dashed = s.model.includes("gemini");
			const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				KCOLOR[s.policy] +
				'" stroke-width="2" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					KCOLOR[s.policy] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						s.policy +
							" · " +
							KNAMES[s.policy] +
							" (" +
							s.model +
							")\n" +
							THIRDS[p.i] +
							": " +
							p.v +
							"% (" +
							s.ok[p.i] +
							")\nend-state intact: " +
							s.end +
							" · " +
							s.tokens +
							"/session",
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				c: s.policy,
				text:
					s.policy.replace("K-", "") +
					" " +
					(dashed ? "gem" : "son") +
					" · " +
					last.v +
					"%",
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels)
			labels +=
				'<text font-size="12" font-weight="700" x="' +
				l.x +
				'" y="' +
				l.y +
				'" fill="' +
				KCOLOR[l.c] +
				'">' +
				l.text +
				"</text>";
		const el = byId("fig-sessions");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Per-step success across session thirds: serialize-once decays to 83.8 percent on sonnet while per-turn views stay flat near 100 percent; gemini whole-tree rewrite sessions run at 52 to 69 percent.">' +
			g +
			marks +
			labels +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-sessions",
			["policy (model)", ...THIRDS, "end-state intact", "mean tokens/session"],
			KDATA.map((s) => [
				s.policy + " " + s.name + " (" + s.model + ")",
				...s.rate.map((v, i) => v + "% (" + s.ok[i] + ")"),
				s.end,
				s.tokens,
			]),
		);
	})();

	// --- Study L: grounding dot plot ---
	(() => {
		const LCOND = ["oracle", "LG-full", "LG-nav", "LG-lex"];
		const LNAMES = {
			oracle: "oracle bound (ids in instructions, Study I)",
			"LG-full": "grounded · full tree shown",
			"LG-nav": "grounded · navigate (expand_node)",
			"LG-lex": "grounded · naive lexical retrieval",
		};
		const LCOLOR = {
			oracle: "#e66767",
			"LG-full": "#3987e5",
			"LG-nav": "#9085e9",
			"LG-lex": "#c98500",
		};
		const LDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					oracle: { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "" },
					"LG-full": {
						ok: 39,
						rate: 86.7,
						low: 73.8,
						high: 93.7,
						note: "median input 90k @ ~1000 nodes",
					},
					"LG-nav": {
						ok: 43,
						rate: 95.6,
						low: 85.2,
						high: 98.8,
						note: "median 54 expands; 356k input @ ~1000 nodes",
					},
					"LG-lex": {
						ok: 27,
						rate: 60.0,
						low: 45.5,
						high: 73.0,
						note: "~2.5k input; 34/38 failures misgrounded",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					oracle: { ok: 41, rate: 91.1, low: 79.3, high: 96.5, note: "" },
					"LG-full": {
						ok: 38,
						rate: 84.4,
						low: 71.2,
						high: 92.3,
						note: "median input 70k @ ~1000 nodes",
					},
					"LG-nav": {
						ok: 23,
						rate: 51.1,
						low: 37.0,
						high: 65.0,
						note: "budget exhaustion; up to 636k input",
					},
					"LG-lex": {
						ok: 25,
						rate: 55.6,
						low: 41.2,
						high: 69.1,
						note: "~2.4k input",
					},
				},
			},
		];
		byId("legend-7").innerHTML = LCOND.map(
			(c) =>
				'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
				LCOLOR[c] +
				'"></span><span class="font-mono font-700 text-white">' +
				c +
				"</span> " +
				LNAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 64,
			T = 8,
			B = 40,
			L = 150,
			R = 24;
		const H = T + LDATA.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 30) / 70) * iw;
		let g = "";
		for (const tick of [30, 40, 50, 60, 70, 80, 90, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"task success on grounded (id-free) instructions, 45 tasks per cell";
		let marks = "",
			hits = "";
		LDATA.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			for (const c of LCOND) {
				const cell = row.cells[c];
				marks +=
					'<line x1="' +
					xOf(cell.low) +
					'" x2="' +
					xOf(cell.high) +
					'" y1="' +
					cy +
					'" y2="' +
					cy +
					'" stroke="' +
					LCOLOR[c] +
					'" stroke-width="1.5" opacity="0.4"/>';
				marks +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					LCOLOR[c] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="13" fill="transparent" data-tip="' +
					esc(
						c +
							" · " +
							LNAMES[c] +
							"\n" +
							row.model +
							": " +
							cell.rate +
							"% (" +
							cell.ok +
							"/45) · CI [" +
							cell.low +
							"%, " +
							cell.high +
							"%]" +
							(cell.note ? "\n" + cell.note : ""),
					) +
					'"/>';
			}
		});
		const el = byId("fig-grounding");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grounded-instruction success per model: full-tree grounding sits 7 to 9 points under the oracle bound; navigation matches the oracle on sonnet but collapses on gemini; lexical retrieval is the floor.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-grounding",
			[
				"condition (model)",
				"success",
				"median input @ ~1000 nodes",
				"failure anatomy (pooled)",
			],
			[
				["oracle · sonnet-4.5", "43/45 (95.6%)", "85,642", "-"],
				["oracle · gemini-3.5-flash", "41/45 (91.1%)", "70,063", "-"],
				[
					"LG-full · sonnet-4.5",
					"39/45 (86.7%)",
					"90,254",
					"misgrounded ×8, mechanics ×5 (both models)",
				],
				[
					"LG-full · gemini-3.5-flash",
					"38/45 (84.4%)",
					"70,054",
					"(see above)",
				],
				[
					"LG-nav · sonnet-4.5",
					"43/45 (95.6%) · 54 median expands",
					"355,643",
					"invalid ×20, misgrounded ×2, mechanics ×2 (both models)",
				],
				[
					"LG-nav · gemini-3.5-flash",
					"23/45 (51.1%) · 58 median expands",
					"636,030",
					"(see above)",
				],
				[
					"LG-lex · sonnet-4.5",
					"27/45 (60.0%)",
					"2,695",
					"misgrounded ×34, mechanics ×4 (both models)",
				],
				["LG-lex · gemini-3.5-flash", "25/45 (55.6%)", "2,659", "(see above)"],
			],
		);
	})();

	// --- Study M: memory tercile lines ---
	(() => {
		const MDATA = [
			{
				policy: "K-view",
				name: "full history + per-turn view",
				model: "sonnet-4.5",
				rate: [100, 98.8, 100],
				ok: ["80/80", "79/80", "80/80"],
				end: "19/20",
				shape: "1.2k → 8.1k per step",
			},
			{
				policy: "K-view",
				name: "full history + per-turn view",
				model: "gemini-3.5-flash",
				rate: [98.8, 100, 98.8],
				ok: ["79/80", "80/80", "79/80"],
				end: "19/20",
				shape: "1.2k → 7.8k per step",
			},
			{
				policy: "M-window",
				name: "2-exchange window",
				model: "sonnet-4.5",
				rate: [100, 98.8, 95.0],
				ok: ["80/80", "79/80", "76/80"],
				end: "16/20",
				shape: "1.2k → 2.7k per step",
			},
			{
				policy: "M-window",
				name: "2-exchange window",
				model: "gemini-3.5-flash",
				rate: [100, 98.8, 95.0],
				ok: ["80/80", "79/80", "76/80"],
				end: "15/20",
				shape: "1.2k → 2.6k per step",
			},
			{
				policy: "M-stateless",
				name: "no history at all",
				model: "sonnet-4.5",
				rate: [98.8, 95.0, 96.3],
				ok: ["79/80", "76/80", "77/80"],
				end: "13/20",
				shape: "flat ~1.3k per step",
			},
			{
				policy: "M-stateless",
				name: "no history at all",
				model: "gemini-3.5-flash",
				rate: [98.8, 100, 92.5],
				ok: ["79/80", "80/80", "74/80"],
				end: "14/20",
				shape: "flat ~1.3k per step",
			},
		];
		const MCOLOR = {
			"K-view": "#e66767",
			"M-window": "#9085e9",
			"M-stateless": "#c98500",
		};
		const MNAMES = {
			"K-view": "full history + per-turn view (Study K)",
			"M-window": "2-exchange window",
			"M-stateless": "no history at all",
		};
		byId("legend-8").innerHTML =
			Object.keys(MNAMES)
				.map(
					(p) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						MCOLOR[p] +
						'"></span><span class="font-mono font-700 text-white">' +
						p +
						"</span> " +
						MNAMES[p] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 340,
			L = 56,
			R = 205,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const THIRDS = ["steps 1–4", "steps 5–8", "steps 9–12"];
		const xs = THIRDS.map((_, i) => L + (iw * i) / (THIRDS.length - 1));
		const yOf = (v) => T + ih - ((v - 88) / 12) * ih;
		let g = "";
		for (const tick of [88, 92, 96, 100]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick +
				"%</text>";
		}
		THIRDS.forEach((lab, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xs[i] +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				lab +
				"</text>";
		});
		const figCaption =
			"per-step success by session third (note the zoomed 88–100% scale)";
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const s of MDATA) {
			const dashed = s.model.includes("gemini");
			const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				MCOLOR[s.policy] +
				'" stroke-width="2" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					MCOLOR[s.policy] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						s.policy +
							" · " +
							MNAMES[s.policy] +
							" (" +
							s.model +
							")\n" +
							THIRDS[p.i] +
							": " +
							p.v +
							"% (" +
							s.ok[p.i] +
							")\nend-state intact " +
							s.end +
							" · input " +
							s.shape,
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				c: s.policy,
				text:
					s.policy.replace("M-", "").replace("K-", "") +
					" " +
					(dashed ? "gem" : "son") +
					" · " +
					last.v +
					"%",
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels)
			labels +=
				'<text font-size="12" font-weight="700" x="' +
				l.x +
				'" y="' +
				l.y +
				'" fill="' +
				MCOLOR[l.c] +
				'">' +
				l.text +
				"</text>";
		const el = byId("fig-memory");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Per-step success across session thirds for full history, a two-exchange window, and no history: statelessness degrades late-session accuracy despite identical per-turn views.">' +
			g +
			marks +
			labels +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-memory",
			["policy (model)", ...THIRDS, "end-state intact", "input per step"],
			MDATA.map((s) => [
				s.policy + " " + s.name + " (" + s.model + ")",
				...s.rate.map((v, i) => v + "% (" + s.ok[i] + ")"),
				s.end,
				s.shape,
			]),
		);
	})();

	// --- Study N: retrieval ladder dot plot ---
	(() => {
		const NCOND = ["oracle", "LG-full", "N-search", "N-ground2x", "N-embed"];
		const NNAMES = {
			oracle: "oracle bound (ids in instructions, Study I)",
			"LG-full": "grounded · full tree shown (Study L)",
			"N-search": "grounded · find_nodes search tool",
			"N-ground2x": "grounded · cheap model grounds, sonnet patches",
			"N-embed": "grounded · embedding retrieval (no agent)",
		};
		const NCOLOR = {
			oracle: "#e66767",
			"LG-full": "#3987e5",
			"N-search": "#199e70",
			"N-ground2x": "#9085e9",
			"N-embed": "#c98500",
		};
		const NDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					oracle: { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "" },
					"LG-full": {
						ok: 39,
						rate: 86.7,
						low: 73.8,
						high: 93.7,
						note: "median input 90k @ ~1000 nodes",
					},
					"N-search": {
						ok: 43,
						rate: 95.6,
						low: 85.2,
						high: 98.8,
						note: "median 1 search call · ~6.5k input @ ~1000 nodes\nsame two failures as the oracle-matching nav arm",
					},
					"N-ground2x": {
						ok: 41,
						rate: 91.1,
						low: 79.3,
						high: 96.5,
						note: "gemini grounds (45/45 valid) · sonnet-side median input 1,484 tokens (−97.4%)",
					},
					"N-embed": {
						ok: 25,
						rate: 55.6,
						low: 41.2,
						high: 69.1,
						note: "top-5 target coverage 23/45 · no better than keyword overlap (24/45)",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					oracle: { ok: 41, rate: 91.1, low: 79.3, high: 96.5, note: "" },
					"LG-full": {
						ok: 38,
						rate: 84.4,
						low: 71.2,
						high: 92.3,
						note: "median input 70k @ ~1000 nodes",
					},
					"N-search": {
						ok: 39,
						rate: 86.7,
						low: 73.8,
						high: 93.7,
						note: "median 1 search call · ~3.7k input @ ~1000 nodes\nvs 23/45 navigating (16–0 paired, p < 0.001)",
					},
					"N-embed": {
						ok: 24,
						rate: 53.3,
						low: 39.1,
						high: 67.1,
						note: "statistically identical to the lexical floor",
					},
				},
			},
		];
		byId("legend-9").innerHTML = NCOND.map(
			(c) =>
				'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
				NCOLOR[c] +
				'"></span><span class="font-mono font-700 text-white">' +
				c +
				"</span> " +
				NNAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 64,
			T = 8,
			B = 40,
			L = 150,
			R = 24;
		const H = T + NDATA.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 30) / 70) * iw;
		let g = "";
		for (const tick of [30, 40, 50, 60, 70, 80, 90, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"task success on grounded (id-free) instructions, 45 tasks per cell";
		let marks = "",
			hits = "";
		NDATA.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			for (const c of NCOND) {
				const cell = row.cells[c];
				if (!cell) continue;
				marks +=
					'<line x1="' +
					xOf(cell.low) +
					'" x2="' +
					xOf(cell.high) +
					'" y1="' +
					cy +
					'" y2="' +
					cy +
					'" stroke="' +
					NCOLOR[c] +
					'" stroke-width="1.5" opacity="0.4"/>';
				marks +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					NCOLOR[c] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="13" fill="transparent" data-tip="' +
					esc(
						c +
							" · " +
							NNAMES[c] +
							"\n" +
							row.model +
							": " +
							cell.rate +
							"% (" +
							cell.ok +
							"/45) · CI [" +
							cell.low +
							"%, " +
							cell.high +
							"%]" +
							(cell.note ? "\n" + cell.note : ""),
					) +
					'"/>';
			}
		});
		const el = byId("fig-retrieval");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grounded-instruction success per model on the retrieval ladder: the find_nodes search tool matches the oracle bound on sonnet and full-tree grounding on gemini at a median of one call; embedding retrieval sits at the lexical floor; cheap-model grounding preserves accuracy with 97% less frontier input.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-retrieval",
			[
				"condition (model)",
				"success",
				"median input @ ~1000 nodes",
				"mechanism",
			],
			[
				[
					"N-search · sonnet-4.5",
					"43/45 (95.6%)",
					"6,550",
					"median 1 find_nodes call; failures: misgrounded ×5, mechanics ×3 (both models)",
				],
				[
					"N-search · gemini-3.5-flash",
					"39/45 (86.7%)",
					"3,741",
					"vs LG-nav 23/45: 16–0 paired, p < 0.001",
				],
				[
					"N-embed · sonnet-4.5",
					"25/45 (55.6%)",
					"3,076",
					"top-5 covers targets 23/45 vs lexical 24/45; 39/41 failures misgrounded",
				],
				["N-embed · gemini-3.5-flash", "24/45 (53.3%)", "2,845", "(see above)"],
				[
					"N-ground2 · sonnet-4.5",
					"41/45 (91.1%)",
					"79,511",
					"same-model two-stage: accuracy holds, total savings only 18%",
				],
				[
					"N-ground2 · gemini-3.5-flash",
					"37/45 (82.2%)",
					"71,404",
					"same-model two-stage: total savings 5%",
				],
				[
					"N-ground2x · gemini grounds, sonnet patches",
					"41/45 (91.1%)",
					"71,497 total · 1,484 sonnet-side",
					"grounder coverage identical across tiers (41/45 both)",
				],
			],
		);
	})();

	// --- Study O: positional views dot plot ---
	(() => {
		const OCOND = ["K-view", "O-view", "M-stateless", "O-stateless"];
		const ONAMES = {
			"K-view": "full history, plain view (Study K)",
			"O-view": "full history + positions",
			"M-stateless": "no history, plain view (Study M)",
			"O-stateless": "no history + positions",
		};
		const OCOLOR = {
			"K-view": "#e66767",
			"O-view": "#9085e9",
			"M-stateless": "#c98500",
			"O-stateless": "#199e70",
		};
		const ODATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"K-view": {
						ok: "80/80",
						rate: 100.0,
						low: 95.4,
						high: 100.0,
						end: "19/20",
						note: "",
					},
					"O-view": {
						ok: "79/80",
						rate: 98.8,
						low: 93.3,
						high: 99.8,
						end: "19/20",
						note: "1–1 paired vs K-view, p = 1.0",
					},
					"M-stateless": {
						ok: "77/80",
						rate: 96.3,
						low: 89.5,
						high: 98.7,
						end: "13/20",
						note: "all stateless-only failures are placements",
					},
					"O-stateless": {
						ok: "77/80",
						rate: 96.3,
						low: 89.5,
						high: 98.7,
						end: "15/20",
						note: "3–1 paired vs M-stateless, p = 0.625 · positions printed, still misplaced",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"K-view": {
						ok: "79/80",
						rate: 98.8,
						low: 93.3,
						high: 99.8,
						end: "19/20",
						note: "",
					},
					"O-view": {
						ok: "80/80",
						rate: 100.0,
						low: 95.4,
						high: 100.0,
						end: "20/20",
						note: "best cell in the series; 2–0 vs K-view, p = 0.5 (n.s.)",
					},
					"M-stateless": {
						ok: "74/80",
						rate: 92.5,
						low: 84.6,
						high: 96.5,
						end: "14/20",
						note: "",
					},
					"O-stateless": {
						ok: "75/80",
						rate: 93.8,
						low: 86.2,
						high: 97.3,
						end: "15/20",
						note: "1–0 paired vs M-stateless, p = 1.0",
					},
				},
			},
		];
		byId("legend-10").innerHTML = OCOND.map(
			(c) =>
				'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
				OCOLOR[c] +
				'"></span><span class="font-mono font-700 text-white">' +
				c +
				"</span> " +
				ONAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 64,
			T = 8,
			B = 40,
			L = 150,
			R = 24;
		const H = T + ODATA.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 84) / 16) * iw;
		let g = "";
		for (const tick of [84, 88, 92, 96, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"late-session (steps 9–12) per-step success · the window where statelessness fails (zoomed 84–100% scale)";
		let marks = "",
			hits = "";
		ODATA.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			for (const c of OCOND) {
				const cell = row.cells[c];
				marks +=
					'<line x1="' +
					xOf(cell.low) +
					'" x2="' +
					xOf(Math.min(cell.high, 100)) +
					'" y1="' +
					cy +
					'" y2="' +
					cy +
					'" stroke="' +
					OCOLOR[c] +
					'" stroke-width="1.5" opacity="0.4"/>';
				marks +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					OCOLOR[c] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="13" fill="transparent" data-tip="' +
					esc(
						c +
							" · " +
							ONAMES[c] +
							"\n" +
							row.model +
							" steps 9–12: " +
							cell.rate +
							"% (" +
							cell.ok +
							") · CI [" +
							cell.low +
							"%, " +
							cell.high +
							"%]\nend-state intact " +
							cell.end +
							(cell.note ? "\n" + cell.note : ""),
					) +
					'"/>';
			}
		});
		const el = byId("fig-positions");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Late-session per-step success for the history-by-positions two-by-two: position annotations barely move stateless accuracy while full history stays at the top; positions plus history is descriptively best but not significantly better.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-positions",
			[
				"policy (model)",
				"steps 9–12",
				"placements, steps 5–12",
				"end-state intact",
				"input per step",
			],
			[
				["K-view (sonnet)", "100% (80/80)", "59/60", "19/20", "1.2k → 8.1k"],
				["O-view (sonnet)", "98.8% (79/80)", "59/60", "19/20", "1.3k → 8.8k"],
				[
					"M-stateless (sonnet)",
					"96.3% (77/80)",
					"53/60",
					"13/20",
					"flat ~1.3k",
				],
				[
					"O-stateless (sonnet)",
					"96.3% (77/80)",
					"54/60",
					"15/20",
					"flat ~1.4k (+9% for positions)",
				],
				["K-view (gemini)", "98.8% (79/80)", "59/60", "19/20", "1.2k → 7.8k"],
				["O-view (gemini)", "100% (80/80)", "60/60", "20/20", "1.3k → 8.4k"],
				[
					"M-stateless (gemini)",
					"92.5% (74/80)",
					"54/60",
					"14/20",
					"flat ~1.2k",
				],
				[
					"O-stateless (gemini)",
					"93.8% (75/80)",
					"55/60",
					"15/20",
					"flat ~1.4k",
				],
			],
		);
	})();

	// --- Study P: synthetic history dot plot (late-session window) ---
	(() => {
		const PCOND = ["K-view", "P-canned", "P-system", "M-stateless"];
		const PNAMES = {
			"K-view": "full history (Study K)",
			"P-canned": "no history + examples as fake turns",
			"P-system": "no history + examples in system prompt",
			"M-stateless": "no history, no examples (Study M)",
		};
		const PCOLOR = {
			"K-view": "#e66767",
			"P-canned": "#199e70",
			"P-system": "#9085e9",
			"M-stateless": "#c98500",
		};
		const PDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"K-view": {
						ok: "80/80",
						rate: 100.0,
						low: 95.4,
						high: 100.0,
						end: "19/20",
						note: "",
					},
					"P-canned": {
						ok: "79/80",
						rate: 98.8,
						low: 93.3,
						high: 99.8,
						end: "18/20",
						note: "vs K-view 1–0, p = 1.0 · vs M-stateless 7–1, p = 0.070",
					},
					"P-system": {
						ok: "78/80",
						rate: 97.5,
						low: 91.3,
						high: 99.3,
						end: "18/20",
						note: "vs K-view 2–0, p = 0.5 · ties P-canned",
					},
					"M-stateless": {
						ok: "77/80",
						rate: 96.3,
						low: 89.5,
						high: 98.7,
						end: "13/20",
						note: "",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"K-view": {
						ok: "79/80",
						rate: 98.8,
						low: 93.3,
						high: 99.8,
						end: "19/20",
						note: "",
					},
					"P-canned": {
						ok: "80/80",
						rate: 100.0,
						low: 95.4,
						high: 100.0,
						end: "20/20",
						note: "vs M-stateless 7–0, p = 0.016 · 60/60 late placements · output bloat 309 → 55 tok/step",
					},
					"P-system": {
						ok: "79/80",
						rate: 98.8,
						low: 93.3,
						high: 99.8,
						end: "19/20",
						note: "vs M-stateless 6–0, p = 0.031",
					},
					"M-stateless": {
						ok: "74/80",
						rate: 92.5,
						low: 84.6,
						high: 96.5,
						end: "14/20",
						note: "",
					},
				},
			},
		];
		byId("legend-11").innerHTML = PCOND.map(
			(c) =>
				'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
				PCOLOR[c] +
				'"></span><span class="font-mono font-700 text-white">' +
				c +
				"</span> " +
				PNAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 64,
			T = 8,
			B = 40,
			L = 150,
			R = 24;
		const H = T + PDATA.length * ROW + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 84) / 16) * iw;
		let g = "";
		for (const tick of [84, 88, 92, 96, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"late-session (steps 9–12) per-step success (zoomed 84–100% scale)";
		let marks = "",
			hits = "";
		PDATA.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			for (const c of PCOND) {
				const cell = row.cells[c];
				marks +=
					'<line x1="' +
					xOf(cell.low) +
					'" x2="' +
					xOf(Math.min(cell.high, 100)) +
					'" y1="' +
					cy +
					'" y2="' +
					cy +
					'" stroke="' +
					PCOLOR[c] +
					'" stroke-width="1.5" opacity="0.4"/>';
				marks +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					PCOLOR[c] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(cell.rate) +
					'" cy="' +
					cy +
					'" r="13" fill="transparent" data-tip="' +
					esc(
						c +
							" · " +
							PNAMES[c] +
							"\n" +
							row.model +
							" steps 9–12: " +
							cell.rate +
							"% (" +
							cell.ok +
							") · CI [" +
							cell.low +
							"%, " +
							cell.high +
							"%]\nend-state intact " +
							cell.end +
							(cell.note ? "\n" + cell.note : ""),
					) +
					'"/>';
			}
		});
		const el = byId("fig-teaching");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Late-session per-step success: stateless sessions with two canned worked examples match full history on both models, in both delivery framings, while plain stateless lags.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-teaching",
			[
				"policy (model)",
				"steps 9–12",
				"placements, steps 5–12",
				"end-state intact",
				"tokens/session",
			],
			[
				["K-view (sonnet)", "100% (80/80)", "59/60", "19/20", "55,746 in"],
				["P-canned (sonnet)", "98.8% (79/80)", "58/60", "18/20", "26,921 in"],
				["P-system (sonnet)", "97.5% (78/80)", "57/60", "18/20", "26,598 in"],
				[
					"M-stateless (sonnet)",
					"96.3% (77/80)",
					"53/60",
					"13/20",
					"17,888 in",
				],
				["K-view (gemini)", "98.8% (79/80)", "59/60", "19/20", "53,358 in"],
				["P-canned (gemini)", "100% (80/80)", "60/60", "20/20", "26,051 in"],
				["P-system (gemini)", "98.8% (79/80)", "59/60", "19/20", "25,921 in"],
				[
					"M-stateless (gemini)",
					"92.5% (74/80)",
					"54/60",
					"14/20",
					"15,752 in + 3,709 out (bloat)",
				],
			],
		);
	})();

	// --- Study Q: fan-out collapse lines ---
	(() => {
		const QDATA = [
			{
				cond: "Q-view",
				name: "oracle retrieval (all targets in view)",
				model: "sonnet-4.5",
				rate: [92.9, 69.2, 50.0],
				ok: ["13/14", "9/13", "9/18"],
			},
			{
				cond: "Q-view",
				name: "oracle retrieval (all targets in view)",
				model: "gemini-3.5-flash",
				rate: [92.9, 53.8, 44.4],
				ok: ["13/14", "7/13", "8/18"],
			},
			{
				cond: "Q-full",
				name: "whole tree in prompt",
				model: "sonnet-4.5",
				rate: [85.7, 30.8, 33.3],
				ok: ["12/14", "4/13", "6/18"],
			},
			{
				cond: "Q-full",
				name: "whole tree in prompt",
				model: "gemini-3.5-flash",
				rate: [100.0, 69.2, 72.2],
				ok: ["14/14", "9/13", "13/18"],
			},
			{
				cond: "Q-search",
				name: "find_nodes recipe (barkup 0.4, untuned)",
				model: "sonnet-4.5",
				rate: [85.7, 46.2, 16.7],
				ok: ["12/14", "6/13", "3/18"],
			},
			{
				cond: "Q-search",
				name: "find_nodes recipe (barkup 0.4, untuned)",
				model: "gemini-3.5-flash",
				rate: [85.7, 46.2, 38.9],
				ok: ["12/14", "6/13", "7/18"],
			},
			{
				cond: "R-decomp",
				name: "app-side decomposition (Study R, both models)",
				model: "both",
				rate: [100.0, 100.0, 100.0],
				ok: ["28/28", "26/26", "36/36"],
			},
		];
		const QCOLOR = {
			"Q-view": "#9085e9",
			"Q-full": "#3987e5",
			"Q-search": "#199e70",
			"R-decomp": "#e66767",
		};
		const QNAMES = {
			"Q-view": "oracle retrieval",
			"Q-full": "whole tree",
			"Q-search": "search recipe",
			"R-decomp": "decomposition (Study R)",
		};
		byId("legend-12").innerHTML =
			Object.keys(QNAMES)
				.map(
					(c) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						QCOLOR[c] +
						'"></span><span class="font-mono font-700 text-white">' +
						c +
						"</span> " +
						QNAMES[c] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 360,
			L = 56,
			R = 215,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const BINS = ["2–3 targets", "4–6 targets", "7+ targets"];
		const xs = BINS.map((_, i) => L + (iw * i) / (BINS.length - 1));
		const yOf = (v) => T + ih - ((v - 10) / 90) * ih;
		let g = "";
		for (const tick of [10, 25, 50, 75, 100]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick +
				"%</text>";
		}
		BINS.forEach((lab, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xs[i] +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				lab +
				"</text>";
		});
		const figCaption =
			"task success by target count (45 fan-out tasks per condition per model)";
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const s of QDATA) {
			const dashed = s.model.includes("gemini");
			const both = s.model === "both";
			const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				QCOLOR[s.cond] +
				'" stroke-width="' +
				(both ? 3 : 2) +
				'" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					QCOLOR[s.cond] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						s.cond +
							" · " +
							s.name +
							"\n" +
							BINS[p.i] +
							": " +
							p.v +
							"% (" +
							s.ok[p.i] +
							")",
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				c: s.cond,
				text:
					(both
						? "decomp both"
						: s.cond.replace("Q-", "") + " " + (dashed ? "gem" : "son")) +
					" · " +
					last.v +
					"%",
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		resolveLabels(endLabels, 15);
		let labels = "";
		for (const l of endLabels)
			labels +=
				'<text font-size="12" font-weight="700" x="' +
				l.x +
				'" y="' +
				l.y +
				'" fill="' +
				QCOLOR[l.c] +
				'">' +
				l.text +
				"</text>";
		const el = byId("fig-fanout");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Fan-out task success falls with target count in every condition: even oracle retrieval drops to about half at seven-plus targets, and the models invert between view and whole-tree strategies.">' +
			g +
			marks +
			labels +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-fanout",
			[
				"condition (model)",
				"overall",
				"2–3",
				"4–6",
				"7+",
				"failure anatomy",
				"median input @ ~1000 nodes",
			],
			[
				[
					"Q-view (sonnet)",
					"31/45 (68.9%)",
					"13/14",
					"9/13",
					"9/18",
					"partial ×14 (mean coverage 47%)",
					"2,023",
				],
				[
					"Q-view (gemini)",
					"28/45 (62.2%)",
					"13/14",
					"7/13",
					"8/18",
					"partial ×17 (mean coverage 35%)",
					"1,894",
				],
				[
					"Q-full (sonnet)",
					"22/45 (48.9%)",
					"12/14",
					"4/13",
					"6/18",
					"partial ×14, collateral ×9",
					"85,628",
				],
				[
					"Q-full (gemini)",
					"36/45 (80.0%)",
					"14/14",
					"9/13",
					"13/18",
					"partial ×5, collateral ×4",
					"70,071",
				],
				[
					"Q-search (sonnet)",
					"21/45 (46.7%)",
					"12/14",
					"6/13",
					"3/18",
					"partial ×21, collateral ×2, invalid ×1 · median 6 calls",
					"14,514 (18/45 runs > 100k)",
				],
				[
					"Q-search (gemini)",
					"25/45 (55.6%)",
					"12/14",
					"6/13",
					"7/18",
					"partial ×13, invalid ×5, collateral ×2 · median 6 calls",
					"24,995 (16/45 runs > 100k)",
				],
				[
					"R-decomp (sonnet)",
					"45/45 (100%)",
					"14/14",
					"13/13",
					"18/18",
					"none · 337/337 subtasks",
					"7,974",
				],
				[
					"R-decomp (gemini)",
					"45/45 (100%)",
					"14/14",
					"13/13",
					"18/18",
					"none · 337/337 subtasks",
					"7,731",
				],
			],
		);
	})();

	// --- Study S: long-session cost divergence lines ---
	(() => {
		const STEPS = [1, 6, 12, 18, 24, 30, 36];
		const SDATA = [
			{
				cond: "S-view",
				model: "sonnet-4.5",
				tok: [1250, 4693, 8325, 11955, 15855, 20164, 23614],
				acc: "360/360 steps",
			},
			{
				cond: "S-view",
				model: "gemini-3.5-flash",
				tok: [1216, 4519, 8012, 11522, 15187, 19279, 22581],
				acc: "359/360 steps",
			},
			{
				cond: "S-system",
				model: "sonnet-4.5",
				tok: [2124, 2160, 2085, 2120, 2276, 2547, 2190],
				acc: "357/360 steps",
			},
			{
				cond: "S-system",
				model: "gemini-3.5-flash",
				tok: [2083, 2107, 2031, 2065, 2232, 2485, 2130],
				acc: "356/360 steps",
			},
		];
		const SCOLOR = { "S-view": "#e66767", "S-system": "#9085e9" };
		const SNAMES = {
			"S-view": "full history + fresh view per turn (K-view recipe)",
			"S-system": "no history + two worked examples (P-system recipe)",
		};
		byId("legend-13").innerHTML =
			Object.keys(SNAMES)
				.map(
					(c) =>
						'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
						SCOLOR[c] +
						'"></span><span class="font-mono font-700 text-white">' +
						c +
						"</span> " +
						SNAMES[c] +
						"</span>",
				)
				.join("") +
			legendNote("solid = sonnet-4.5 · dashed = gemini-3.5-flash");
		const W = 880,
			H = 360,
			L = 64,
			R = 170,
			T = 16,
			B = 44;
		const iw = W - L - R,
			ih = H - T - B;
		const xOf = (s) => L + (iw * (s - 1)) / 35;
		const yOf = (v) => T + ih - (v / 25000) * ih;
		let g = "";
		for (const tick of [0, 5000, 10000, 15000, 20000, 25000]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 8) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick / 1000 +
				"k</text>";
		}
		for (const s of STEPS) {
			g +=
				'<text class="chart-tick" x="' +
				xOf(s) +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				s +
				"</text>";
		}
		const figCaption =
			"median input tokens per step across a 36-edit session (accuracy at parity throughout)";
		let marks = "",
			hits = "";
		const endLabels = [];
		for (const s of SDATA) {
			const dashed = s.model.includes("gemini");
			const pts = s.tok.map((v, i) => ({ x: xOf(STEPS[i]), y: yOf(v), v, i }));
			marks +=
				'<path d="' +
				pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") +
				'" fill="none" stroke="' +
				SCOLOR[s.cond] +
				'" stroke-width="2" stroke-linejoin="round"' +
				(dashed ? ' stroke-dasharray="6 5"' : "") +
				"/>";
			pts.forEach((p) => {
				marks +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="4" fill="' +
					SCOLOR[s.cond] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					p.x +
					'" cy="' +
					p.y +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						s.cond +
							" · " +
							SNAMES[s.cond] +
							"\n" +
							s.model +
							", step " +
							STEPS[p.i] +
							": median " +
							p.v.toLocaleString() +
							" input tokens\nsession accuracy: " +
							s.acc,
					) +
					'"/>';
			});
			const last = pts[pts.length - 1];
			endLabels.push({
				text:
					s.cond.replace("S-", "") +
					" " +
					(dashed ? "gem" : "son") +
					" · " +
					(last.v / 1000).toFixed(1) +
					"k",
				x: last.x + 10,
				y: last.y + 4,
			});
		}
		endLabels.sort((a, b) => a.y - b.y);
		for (let i = 1; i < endLabels.length; i += 1) {
			if (endLabels[i].y - endLabels[i - 1].y < 14)
				endLabels[i].y = endLabels[i - 1].y + 14;
		}
		for (const lab of endLabels) {
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				lab.x +
				'" y="' +
				lab.y +
				'">' +
				lab.text +
				"</text>";
		}
		const el = byId("fig-horizon");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Line chart: median input tokens per step over a 36-edit session. Keep-history grows linearly to about 24k tokens by step 36; the stateless worked-examples recipe stays flat at about 2.1k. Accuracy is at parity throughout.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-horizon",
			[
				"recipe (model)",
				"steps 1–12",
				"steps 13–24",
				"steps 25–36",
				"end-state intact",
				"input tokens/session",
			],
			[
				[
					"S-view (sonnet)",
					"120/120",
					"120/120",
					"120/120",
					"10/10",
					"449,028",
				],
				[
					"S-system (sonnet)",
					"119/120",
					"120/120",
					"118/120",
					"8/10",
					"80,890",
				],
				["S-view (gemini)", "119/120", "120/120", "120/120", "9/10", "428,920"],
				[
					"S-system (gemini)",
					"120/120",
					"117/120",
					"119/120",
					"9/10",
					"78,788",
				],
			],
		);
	})();

	// --- data tables ---
	function table(mount, head, rows) {
		byId(mount).innerHTML =
			`<table><thead><tr>${head.map((h, i) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>` +
			rows
				.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`)
				.join("") +
			"</tbody></table>";
	}
	table(
		"tbl-crossover",
		["condition", ...BUCKET_LABELS.map((b) => b + " (95% CI)")],
		CONDITIONS.map((c) => [
			`${c} · ${COND_NAMES[c]}`,
			...DATA.crossover[c].map(
				(d) => `${d.rate}% [${d.low}, ${d.high}] · ${d.ok}/${d.n}`,
			),
		]),
	);
	table(
		"tbl-reference",
		["model", ...CONDITIONS.map((c) => `${c} (95% CI)`)],
		DATA.reference.map((r) => [
			r.model,
			...CONDITIONS.map(
				(c) =>
					`${r.cells[c].rate}% [${r.cells[c].low}, ${r.cells[c].high}] · ${r.cells[c].ok}/40`,
			),
		]),
	);
	table(
		"tbl-tokens",
		["condition", ...BUCKET_LABELS],
		CONDITIONS.map((c) => [
			`${c} · ${COND_NAMES[c]}`,
			...DATA.tokens[c].map((v) => v.toLocaleString()),
		]),
	);

	// --- Study T: callback dissociation dumbbells ---
	(() => {
		const TARMS = ["T-history", "T-system", "T-notes"];
		const TNAMES = {
			"T-history": "full history (K-view recipe)",
			"T-system": "stateless + worked examples (P-system recipe)",
			"T-notes": "stateless + examples + session-notes memo",
		};
		const TCOLOR = {
			"T-history": "#e66767",
			"T-system": "#c98500",
			"T-notes": "#9085e9",
		};
		const TDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"T-history": {
						cb: 100.0,
						cbOk: "80/80",
						ord: 98.1,
						ordOk: "157/160",
						end: "17/20",
					},
					"T-system": {
						cb: 0.0,
						cbOk: "0/80",
						ord: 100.0,
						ordOk: "160/160",
						end: "0/20",
					},
					"T-notes": {
						cb: 100.0,
						cbOk: "80/80",
						ord: 99.4,
						ordOk: "159/160",
						end: "19/20",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"T-history": {
						cb: 100.0,
						cbOk: "80/80",
						ord: 99.4,
						ordOk: "159/160",
						end: "19/20",
					},
					"T-system": {
						cb: 0.0,
						cbOk: "0/80",
						ord: 100.0,
						ordOk: "160/160",
						end: "0/20",
					},
					"T-notes": {
						cb: 100.0,
						cbOk: "80/80",
						ord: 100.0,
						ordOk: "160/160",
						end: "20/20",
					},
				},
			},
		];
		byId("legend-14").innerHTML =
			TARMS.map(
				(c) =>
					'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
					TCOLOR[c] +
					'"></span><span class="font-mono font-700 text-white">' +
					c +
					"</span> " +
					TNAMES[c] +
					"</span>",
			).join("") + legendNote("● = callback steps · ○ = ordinary steps");
		const W = 880,
			ROW = 34,
			T = 8,
			B = 40,
			L = 210,
			R = 24;
		const rows = [];
		for (const m of TDATA)
			for (const c of TARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 16;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 25, 50, 75, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"per-step success · callback steps (filled) vs ordinary self-contained steps (hollow)";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				(row.model.includes("gemini") ? "gem" : "son") +
				"</text>";
			const c = row.cell;
			marks +=
				'<line x1="' +
				xOf(Math.min(c.cb, c.ord)) +
				'" x2="' +
				xOf(Math.max(c.cb, c.ord)) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="' +
				TCOLOR[row.arm] +
				'" stroke-width="2" opacity="0.45"/>';
			marks +=
				'<circle cx="' +
				xOf(c.ord) +
				'" cy="' +
				cy +
				'" r="5.5" fill="hsl(217,48%,15%)" stroke="' +
				TCOLOR[row.arm] +
				'" stroke-width="2.5"/>';
			marks +=
				'<circle cx="' +
				xOf(c.cb) +
				'" cy="' +
				cy +
				'" r="5.5" fill="' +
				TCOLOR[row.arm] +
				'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
			hits +=
				'<circle cx="' +
				xOf(c.cb) +
				'" cy="' +
				cy +
				'" r="12" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						TNAMES[row.arm] +
						"\n" +
						row.model +
						" callback steps: " +
						c.cb +
						"% (" +
						c.cbOk +
						")\nend-state intact " +
						c.end,
				) +
				'"/>';
			hits +=
				'<circle cx="' +
				xOf(c.ord) +
				'" cy="' +
				cy +
				'" r="12" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						TNAMES[row.arm] +
						"\n" +
						row.model +
						" ordinary steps: " +
						c.ord +
						"% (" +
						c.ordOk +
						")",
				) +
				'"/>';
		});
		const el = byId("fig-memo");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Dumbbell chart: the stateless recipe scores 100% on ordinary steps but 0% on callback steps; full history and the memo arm score 100% on both.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-memo",
			[
				"arm (model)",
				"callbacks",
				"fact / rule",
				"ordinary steps",
				"end-state intact",
				"input tokens/session",
			],
			[
				[
					"T-history (sonnet)",
					"80/80",
					"40/40 · 40/40",
					"157/160",
					"17/20",
					"58,222",
				],
				[
					"T-system (sonnet)",
					"0/80",
					"0/40 · 0/40",
					"160/160",
					"0/20",
					"27,047",
				],
				[
					"T-notes (sonnet)",
					"80/80",
					"40/40 · 40/40",
					"159/160",
					"19/20",
					"27,515",
				],
				[
					"T-history (gemini)",
					"80/80",
					"40/40 · 40/40",
					"159/160",
					"19/20",
					"55,751",
				],
				[
					"T-system (gemini)",
					"0/80",
					"0/40 · 0/40",
					"160/160",
					"0/20",
					"26,245",
				],
				[
					"T-notes (gemini)",
					"80/80",
					"40/40 · 40/40",
					"160/160",
					"20/20",
					"26,813",
				],
			],
		);
	})();

	// --- Study U: dependent-edit dot plot ---
	(() => {
		const UARMS = ["U-full", "U-view1", "U-view2", "U-search"];
		const UNAMES = {
			"U-full": "whole tree in prompt",
			"U-view1": "target-only minimal view",
			"U-view2": "target + source in view",
			"U-search": "skeleton + find_nodes (0.4 recipe)",
		};
		const UCOLOR = {
			"U-full": "#3987e5",
			"U-view1": "#c98500",
			"U-view2": "#e66767",
			"U-search": "#199e70",
		};
		const UDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"U-full": {
						rate: 93.3,
						low: 82,
						high: 98,
						ok: "42/45",
						note: "3 structure-reads fumbled at ~1000 nodes",
					},
					"U-view1": {
						rate: 0,
						low: 0,
						high: 8,
						ok: "0/45",
						note: "all 45 failures: valid patch, silently invented value",
					},
					"U-view2": {
						rate: 100,
						low: 92,
						high: 100,
						ok: "45/45",
						note: "median input 1,780 tokens · 25× less than the full tree",
					},
					"U-search": {
						rate: 84.4,
						low: 71,
						high: 92,
						ok: "38/45",
						note: "median 2 search calls; value-copies 18/24",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"U-full": { rate: 100, low: 92, high: 100, ok: "45/45", note: "" },
					"U-view1": {
						rate: 0,
						low: 0,
						high: 8,
						ok: "0/45",
						note: "all 45 failures: valid patch, silently invented value",
					},
					"U-view2": {
						rate: 100,
						low: 92,
						high: 100,
						ok: "45/45",
						note: "median input 1,702 tokens",
					},
					"U-search": {
						rate: 82.2,
						low: 69,
						high: 91,
						ok: "37/45",
						note: "significantly below U-full (8–0, p = 0.008); value-copies 18/24",
					},
				},
			},
		];
		byId("legend-15").innerHTML = UARMS.map(
			(c) =>
				'<span class="inline-flex items-center gap-[7px]"><span class="inline-block w-3.5 h-1 rounded-sm" style="background:' +
				UCOLOR[c] +
				'"></span><span class="font-mono font-700 text-white">' +
				c +
				"</span> " +
				UNAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 34,
			T = 8,
			B = 40,
			L = 210,
			R = 24;
		const rows = [];
		for (const m of UDATA)
			for (const c of UARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 16;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 25, 50, 75, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"dependent-edit success by arm (45 tasks per cell; Wilson 95% intervals)";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text fill="#ffffff" font-size="12.5" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				(row.model.includes("gemini") ? "gem" : "son") +
				"</text>";
			const c = row.cell;
			marks +=
				'<line x1="' +
				xOf(c.low) +
				'" x2="' +
				xOf(c.high) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="' +
				UCOLOR[row.arm] +
				'" stroke-width="1.5" opacity="0.4"/>';
			marks +=
				'<circle cx="' +
				xOf(c.rate) +
				'" cy="' +
				cy +
				'" r="5.5" fill="' +
				UCOLOR[row.arm] +
				'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
			hits +=
				'<circle cx="' +
				xOf(c.rate) +
				'" cy="' +
				cy +
				'" r="12" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						UNAMES[row.arm] +
						"\n" +
						row.model +
						": " +
						c.rate +
						"% (" +
						c.ok +
						") · CI [" +
						c.low +
						"%, " +
						c.high +
						"%]" +
						(c.note ? "\n" + c.note : ""),
				) +
				'"/>';
		});
		const el = byId("fig-dependent");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Dot plot: dependent-edit success. The target-only view sits at 0% on both models; the both-nodes view and the whole tree sit at or near 100%; the search recipe sits at 82 to 84%.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-dependent",
			[
				"arm (model)",
				"all",
				"value-copy",
				"structure-read",
				"failure anatomy",
				"median input",
			],
			[
				[
					"U-full (sonnet)",
					"42/45 (93.3%)",
					"24/24",
					"18/21",
					"3 structure-reads wrong",
					"44,594",
				],
				[
					"U-view1 (sonnet)",
					"0/45 (0%)",
					"0/24",
					"0/21",
					"45/45 valid-but-wrong invented values",
					"1,559",
				],
				["U-view2 (sonnet)", "45/45 (100%)", "24/24", "21/21", "none", "1,780"],
				[
					"U-search (sonnet)",
					"38/45 (84.4%)",
					"18/24",
					"20/21",
					"reads missed, median 2 calls",
					"6,200",
				],
				["U-full (gemini)", "45/45 (100%)", "24/24", "21/21", "none", "40,030"],
				[
					"U-view1 (gemini)",
					"0/45 (0%)",
					"0/24",
					"0/21",
					"45/45 valid-but-wrong invented values",
					"1,342",
				],
				["U-view2 (gemini)", "45/45 (100%)", "24/24", "21/21", "none", "1,702"],
				[
					"U-search (gemini)",
					"37/45 (82.2%)",
					"18/24",
					"19/21",
					"reads missed, median 3 calls",
					"8,997",
				],
			],
		);
	})();

	// --- Study V: qualitative rewrites (judge-graded) win/loss bars ---
	(() => {
		const VARMS = [
			"V-doc-view1",
			"V-doc-view2",
			"V-conv-memo",
			"V-conv-nomemo",
		];
		const VNAMES = {
			"V-doc-view1": "goal in doc · target-only view",
			"V-doc-view2": "goal's node IN the view",
			"V-conv-memo": "goal in the application memo",
			"V-conv-nomemo": "goal said earlier · no memo",
		};
		const VCOLOR = {
			"V-doc-view1": "#c98500",
			"V-doc-view2": "#199e70",
			"V-conv-memo": "#e66767",
			"V-conv-nomemo": "#9085e9",
		};
		// Primary judge (gpt-5.4): wins / losses / ties vs V-instr control, 30 tasks per cell.
		const VDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"V-doc-view1": { w: 0, l: 30, t: 0 },
					"V-doc-view2": { w: 0, l: 30, t: 0 },
					"V-conv-memo": { w: 10, l: 2, t: 18 },
					"V-conv-nomemo": { w: 0, l: 30, t: 0 },
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"V-doc-view1": { w: 0, l: 30, t: 0 },
					"V-doc-view2": { w: 0, l: 30, t: 0 },
					"V-conv-memo": { w: 8, l: 11, t: 11 },
					"V-conv-nomemo": { w: 0, l: 30, t: 0 },
				},
			},
		];
		byId("legend-16").innerHTML =
			VARMS.map(
				(c) =>
					'<span class="key"><span class="chip" style="background:' +
					VCOLOR[c] +
					'"></span><span class="code">' +
					c +
					"</span> " +
					VNAMES[c] +
					"</span>",
			).join("") +
			legendNote(
				"wins · ties · losses vs the explicit-instruction control (primary judge)",
				"bar segments",
			);
		const W = 880,
			ROW = 34,
			T = 8,
			B = 40,
			L = 235,
			R = 24;
		const rows = [];
		for (const m of VDATA)
			for (const c of VARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 16;
		const iw = W - L - R;
		let g = "";
		for (const tick of [0, 10, 20, 30]) {
			const x = L + (tick / 30) * iw;
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"judged comparisons vs control (30 per cell): wins, then ties, then losses";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				(row.model.includes("gemini") ? "gem" : "son") +
				"</text>";
			const c = row.cell;
			const seg = (from, n, opacity) => {
				const x1 = L + (from / 30) * iw,
					wpx = (n / 30) * iw;
				return (
					'<rect x="' +
					x1 +
					'" y="' +
					(cy - 9) +
					'" width="' +
					Math.max(wpx, 0) +
					'" height="18" fill="' +
					VCOLOR[row.arm] +
					'" opacity="' +
					opacity +
					'" rx="3"/>'
				);
			};
			marks += seg(0, c.w, 1);
			marks += seg(c.w, c.t, 0.5);
			const lx = L + ((c.w + c.t) / 30) * iw,
				lw = (c.l / 30) * iw;
			marks +=
				'<rect x="' +
				lx +
				'" y="' +
				(cy - 9) +
				'" width="' +
				Math.max(lw, 0) +
				'" height="18" fill="rgba(255,255,255,0.16)" rx="3"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 12) +
				'" width="' +
				iw +
				'" height="24" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						VNAMES[row.arm] +
						"\n" +
						row.model +
						" vs control: " +
						c.w +
						" wins / " +
						c.t +
						" ties / " +
						c.l +
						" losses",
				) +
				'"/>';
		});
		const el = byId("fig-goals");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Stacked bars: the memo arm ties or beats the explicit-instruction control; every other arm, including goal-node-in-view, loses nearly all judged comparisons.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-goals",
			[
				"arm (editor)",
				"W / T / L (gpt-5.4)",
				"W / T / L (haiku-4.5)",
				"proxy Δ thesis coverage",
			],
			[
				["V-doc-view1 (sonnet)", "0 / 0 / 30", "0 / 0 / 30", "+0.00"],
				["V-doc-view2 (sonnet)", "0 / 0 / 30", "0 / 3 / 27", "+0.75"],
				["V-conv-memo (sonnet)", "10 / 18 / 2", "13 / 10 / 7", "+1.00"],
				["V-conv-nomemo (sonnet)", "0 / 0 / 30", "0 / 0 / 30", "+0.00"],
				["V-doc-view1 (gemini)", "0 / 0 / 30", "0 / 0 / 30", "+0.00"],
				["V-doc-view2 (gemini)", "0 / 0 / 30", "0 / 3 / 27", "+0.66"],
				["V-conv-memo (gemini)", "8 / 11 / 11", "6 / 20 / 4", "+1.00"],
				["V-conv-nomemo (gemini)", "0 / 0 / 30", "0 / 0 / 30", "+0.00"],
			],
		);
	})();

	// --- Study W: agent-maintained memo extraction dumbbells ---
	(() => {
		const WARMS = ["W-oracle", "W-agent", "W-agent-history"];
		const WNAMES = {
			"W-oracle": "harness-written memo (the T ceiling)",
			"W-agent": "agent-written memo, stateless",
			"W-agent-history": "agent memo + 32-message window (shipped config)",
		};
		const WCOLOR = {
			"W-oracle": "#e66767",
			"W-agent": "#199e70",
			"W-agent-history": "#3987e5",
		};
		// Callback success (72 cells; history arm split by recorded window membership).
		const WDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"W-oracle": { all: 98.6, ok: "71/72" },
					"W-agent": { all: 98.6, ok: "71/72" },
					"W-agent-history": {
						all: 93.1,
						ok: "67/72",
						win: 100.0,
						winOk: "36/36",
						post: 86.1,
						postOk: "31/36",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"W-oracle": { all: 100.0, ok: "72/72" },
					"W-agent": { all: 100.0, ok: "72/72" },
					"W-agent-history": {
						all: 98.6,
						ok: "71/72",
						win: 100.0,
						winOk: "36/36",
						post: 97.2,
						postOk: "35/36",
					},
				},
			},
			{
				model: "opus-4.8",
				cells: {
					"W-oracle": { all: 100.0, ok: "72/72" },
					"W-agent": { all: 98.6, ok: "71/72" },
					"W-agent-history": {
						all: 100.0,
						ok: "72/72",
						win: 100.0,
						winOk: "36/36",
						post: 100.0,
						postOk: "36/36",
					},
				},
			},
		];
		byId("legend-17").innerHTML =
			WARMS.map(
				(c) =>
					'<span class="key"><span class="chip" style="background:' +
					WCOLOR[c] +
					'"></span><span class="code">' +
					c +
					"</span> " +
					WNAMES[c] +
					"</span>",
			).join("") +
			legendNote("○ within-window · ● post-truncation", "history rows");
		const W = 880,
			ROW = 34,
			T = 8,
			B = 40,
			L = 250,
			R = 24;
		const rows = [];
		for (const m of WDATA)
			for (const c of WARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 16;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 60) / 40) * iw;
		let g = "";
		for (const tick of [60, 70, 80, 90, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"callback success (72 cells per arm-model; zoomed 60–100% scale)";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				row.model
					.replace("-3.5-flash", "")
					.replace("-4.5", "")
					.replace("-4.8", "") +
				"</text>";
			const c = row.cell;
			if (c.win !== undefined) {
				marks +=
					'<line x1="' +
					xOf(Math.min(c.win, c.post)) +
					'" x2="' +
					xOf(Math.max(c.win, c.post)) +
					'" y1="' +
					cy +
					'" y2="' +
					cy +
					'" stroke="' +
					WCOLOR[row.arm] +
					'" stroke-width="2" opacity="0.45"/>';
				marks +=
					'<circle cx="' +
					xOf(c.win) +
					'" cy="' +
					cy +
					'" r="5.5" fill="hsl(217,48%,15%)" stroke="' +
					WCOLOR[row.arm] +
					'" stroke-width="2.5"/>';
				marks +=
					'<circle cx="' +
					xOf(c.post) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					WCOLOR[row.arm] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(c.post) +
					'" cy="' +
					cy +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						row.arm +
							"\n" +
							row.model +
							" POST-TRUNCATION: " +
							c.post +
							"% (" +
							c.postOk +
							")",
					) +
					'"/>';
				hits +=
					'<circle cx="' +
					xOf(c.win) +
					'" cy="' +
					cy +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						row.arm +
							"\n" +
							row.model +
							" within-window: " +
							c.win +
							"% (" +
							c.winOk +
							")",
					) +
					'"/>';
			} else {
				marks +=
					'<circle cx="' +
					xOf(c.all) +
					'" cy="' +
					cy +
					'" r="5.5" fill="' +
					WCOLOR[row.arm] +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<circle cx="' +
					xOf(c.all) +
					'" cy="' +
					cy +
					'" r="12" fill="transparent" data-tip="' +
					esc(
						row.arm +
							" · " +
							WNAMES[row.arm] +
							"\n" +
							row.model +
							" callbacks: " +
							c.all +
							"% (" +
							c.ok +
							")",
					) +
					'"/>';
			}
		});
		const el = byId("fig-extraction");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Dot plot: agent-written memos tie the harness-written oracle on all three models; in the shipped history-window configuration post-truncation callbacks hold, with opus at a perfect 36 of 36.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-extraction",
			[
				"arm (model)",
				"callbacks",
				"post-truncation",
				"memo recall",
				"retraction",
				"noise",
				"tool calls/session",
				"input/session",
			],
			[
				[
					"W-oracle (sonnet)",
					"71/72",
					"-",
					"harness",
					"harness",
					"-",
					"-",
					"84,450",
				],
				[
					"W-agent (sonnet)",
					"71/72",
					"-",
					"36/36",
					"12/12",
					"0.0",
					"4.0",
					"136,983",
				],
				[
					"W-agent-history (sonnet)",
					"67/72",
					"31/36",
					"36/36",
					"12/12",
					"0.0",
					"4.0",
					"370,550",
				],
				[
					"W-oracle (gemini)",
					"72/72",
					"-",
					"harness",
					"harness",
					"-",
					"-",
					"82,323",
				],
				[
					"W-agent (gemini)",
					"72/72",
					"-",
					"36/36",
					"12/12",
					"0.0",
					"4.3",
					"104,628",
				],
				[
					"W-agent-history (gemini)",
					"71/72",
					"35/36",
					"36/36",
					"12/12",
					"0.0",
					"4.1",
					"327,396",
				],
				[
					"W-oracle (opus)",
					"72/72",
					"-",
					"harness",
					"harness",
					"-",
					"-",
					"103,569",
				],
				[
					"W-agent (opus)",
					"71/72",
					"-",
					"35/36",
					"12/12",
					"0.0",
					"4.3",
					"151,950",
				],
				[
					"W-agent-history (opus)",
					"72/72",
					"36/36",
					"36/36",
					"12/12",
					"0.0",
					"4.0",
					"420,899",
				],
			],
		);
	})();

	// --- Study X: edit-anaphora carrier dot plot ---
	(() => {
		const XARMS = ["X-history", "X-window2", "X-lastedit", "X-stateless"];
		const XNAMES = {
			"X-history": "full conversation history",
			"X-window2": "last 2 exchanges",
			"X-lastedit": "one-line app-side last-edit echo",
			"X-stateless": "no carrier (skeleton view only)",
		};
		const XCOLOR = {
			"X-history": "#e66767",
			"X-window2": "#9085e9",
			"X-lastedit": "#199e70",
			"X-stateless": "#c98500",
		};
		const XDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"X-history": {
						rate: 100.0,
						low: 93,
						high: 100,
						ok: "48/48",
						note: "",
					},
					"X-window2": {
						rate: 93.8,
						low: 83,
						high: 98,
						ok: "45/48",
						note: "repeat 9/12",
					},
					"X-lastedit": {
						rate: 89.6,
						low: 78,
						high: 95,
						ok: "43/48",
						note: "repeat 7/12 · the compressed-carrier strain point; amend + undo perfect",
					},
					"X-stateless": {
						rate: 0,
						low: 0,
						high: 7,
						ok: "0/48",
						note: "all 48 failures: valid silently-guessed patches",
					},
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"X-history": {
						rate: 100.0,
						low: 93,
						high: 100,
						ok: "48/48",
						note: "",
					},
					"X-window2": {
						rate: 85.4,
						low: 73,
						high: 93,
						ok: "41/48",
						note: "repeat 5/12 (p = 0.016 vs history)",
					},
					"X-lastedit": {
						rate: 97.9,
						low: 89,
						high: 100,
						ok: "47/48",
						note: "p = 1.0 vs history",
					},
					"X-stateless": {
						rate: 0,
						low: 0,
						high: 7,
						ok: "0/48",
						note: "all 48 failures: valid silently-guessed patches",
					},
				},
			},
			{
				model: "opus-4.8",
				cells: {
					"X-history": {
						rate: 95.8,
						low: 86,
						high: 99,
						ok: "46/48",
						note: "history itself dropped two undos",
					},
					"X-window2": {
						rate: 89.6,
						low: 78,
						high: 95,
						ok: "43/48",
						note: "repeat 8/12",
					},
					"X-lastedit": {
						rate: 100.0,
						low: 93,
						high: 100,
						ok: "48/48",
						note: "the echo BEATS the transcript on the production tier",
					},
					"X-stateless": {
						rate: 0,
						low: 0,
						high: 7,
						ok: "0/48",
						note: "all 48 failures: valid silently-guessed patches",
					},
				},
			},
		];
		byId("legend-18").innerHTML = XARMS.map(
			(c) =>
				'<span class="key"><span class="chip" style="background:' +
				XCOLOR[c] +
				'"></span><span class="code">' +
				c +
				"</span> " +
				XNAMES[c] +
				"</span>",
		).join("");
		const W = 880,
			ROW = 34,
			T = 8,
			B = 40,
			L = 235,
			R = 24;
		const rows = [];
		for (const m of XDATA)
			for (const c of XARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 16;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 25, 50, 75, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"anaphora-cell success by carrier (48 cells per arm-model; Wilson 95% intervals)";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(L + iw) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				row.model
					.replace("-3.5-flash", "")
					.replace("-4.5", "")
					.replace("-4.8", "") +
				"</text>";
			const c = row.cell;
			marks +=
				'<line x1="' +
				xOf(c.low) +
				'" x2="' +
				xOf(c.high) +
				'" y1="' +
				cy +
				'" y2="' +
				cy +
				'" stroke="' +
				XCOLOR[row.arm] +
				'" stroke-width="1.5" opacity="0.4"/>';
			marks +=
				'<circle cx="' +
				xOf(c.rate) +
				'" cy="' +
				cy +
				'" r="5.5" fill="' +
				XCOLOR[row.arm] +
				'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
			hits +=
				'<circle cx="' +
				xOf(c.rate) +
				'" cy="' +
				cy +
				'" r="12" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						XNAMES[row.arm] +
						"\n" +
						row.model +
						": " +
						c.rate +
						"% (" +
						c.ok +
						") · CI [" +
						c.low +
						"%, " +
						c.high +
						"%]" +
						(c.note ? "\n" + c.note : ""),
				) +
				'"/>';
		});
		const el = byId("fig-anaphora");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Dot plot: without a carrier, anaphora resolution sits at 0% on every model; the one-line last-edit echo ties full history and beats it on opus.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-anaphora",
			[
				"carrier (model)",
				"anaphora",
				"amend",
				"repeat",
				"undo",
				"failure anatomy",
				"input/session",
			],
			[
				[
					"X-history (sonnet)",
					"48/48",
					"24/24",
					"12/12",
					"12/12",
					"-",
					"53,480",
				],
				[
					"X-window2 (sonnet)",
					"45/48",
					"24/24",
					"9/12",
					"12/12",
					"3/3 guessed",
					"29,565",
				],
				[
					"X-lastedit (sonnet)",
					"43/48",
					"24/24",
					"7/12",
					"12/12",
					"5/5 guessed",
					"27,795",
				],
				[
					"X-stateless (sonnet)",
					"0/48",
					"0/24",
					"0/12",
					"0/12",
					"48/48 guessed",
					"36,563",
				],
				[
					"X-history (gemini)",
					"48/48",
					"24/24",
					"12/12",
					"12/12",
					"-",
					"50,530",
				],
				[
					"X-window2 (gemini)",
					"41/48",
					"24/24",
					"5/12",
					"12/12",
					"7/7 guessed",
					"27,834",
				],
				[
					"X-lastedit (gemini)",
					"47/48",
					"23/24",
					"12/12",
					"12/12",
					"1/1 guessed",
					"26,244",
				],
				[
					"X-stateless (gemini)",
					"0/48",
					"0/24",
					"0/12",
					"0/12",
					"48/48 guessed",
					"33,654",
				],
				[
					"X-history (opus)",
					"46/48",
					"24/24",
					"12/12",
					"10/12",
					"2/2 guessed",
					"58,091",
				],
				[
					"X-window2 (opus)",
					"43/48",
					"24/24",
					"8/12",
					"11/12",
					"5/5 guessed",
					"32,169",
				],
				[
					"X-lastedit (opus)",
					"48/48",
					"24/24",
					"12/12",
					"12/12",
					"-",
					"31,827",
				],
				[
					"X-stateless (opus)",
					"0/48",
					"0/24",
					"0/12",
					"0/12",
					"48/48 guessed",
					"41,175",
				],
			],
		);
	})();

	// --- Study Y: naturalistic extraction twin bars ---
	(() => {
		const YARMS = ["Y-formulaic", "Y-casual", "Y-casual-history"];
		const YNAMES = {
			"Y-formulaic": "formulaic declarations (the W control)",
			"Y-casual": "casual declarations (registered pools)",
			"Y-casual-history": "casual + the shipped history window",
		};
		const YCOLOR = {
			"Y-formulaic": "#9085e9",
			"Y-casual": "#199e70",
			"Y-casual-history": "#3987e5",
		};
		// callbacks/48 · recall/36 · retraction/12 · noise per session
		const YDATA = [
			{
				model: "sonnet-4.5",
				cells: {
					"Y-formulaic": [48, 36, 12, 0],
					"Y-casual": [48, 36, 12, 0],
					"Y-casual-history": [47, 35, 12, 0],
				},
			},
			{
				model: "gemini-3.5-flash",
				cells: {
					"Y-formulaic": [48, 36, 12, 0],
					"Y-casual": [48, 36, 12, 0],
					"Y-casual-history": [48, 34, 12, 0],
				},
			},
			{
				model: "opus-4.8",
				cells: {
					"Y-formulaic": [48, 36, 12, 0],
					"Y-casual": [48, 36, 12, 0],
					"Y-casual-history": [48, 35, 12, 0],
				},
			},
		];
		byId("legend-19").innerHTML =
			YARMS.map(
				(c) =>
					'<span class="key"><span class="chip" style="background:' +
					YCOLOR[c] +
					'"></span><span class="code">' +
					c +
					"</span> " +
					YNAMES[c] +
					"</span>",
			).join("") +
			legendNote(
				"callback success out of 48 · tooltip carries recall, retractions, noise",
				"bars",
			);
		const W = 880,
			ROW = 30,
			T = 8,
			B = 40,
			L = 250,
			R = 24;
		const rows = [];
		for (const m of YDATA)
			for (const c of YARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 12;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 48) * iw;
		let g = "";
		for (const tick of [0, 12, 24, 36, 48]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"callback cells passed (of 48) · casual and formulaic twins tie exactly on every model";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				row.model
					.replace("-3.5-flash", "")
					.replace("-4.5", "")
					.replace("-4.8", "") +
				"</text>";
			const [cb, recall, retract, noise] = row.cell;
			marks +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 8) +
				'" width="' +
				(cb / 48) * iw +
				'" height="16" fill="' +
				YCOLOR[row.arm] +
				'" rx="3"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 11) +
				'" width="' +
				iw +
				'" height="22" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						YNAMES[row.arm] +
						"\n" +
						row.model +
						": callbacks " +
						cb +
						"/48 · recall " +
						recall +
						"/36 · retractions " +
						retract +
						"/12 · noise " +
						noise.toFixed(2) +
						"/session",
				) +
				'"/>';
		});
		const el = byId("fig-speech");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Bar chart: casual and formulaic declaration phrasing tie exactly on callback success across all three models, with zero chatter-induced false notes.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-speech",
			[
				"arm (model)",
				"callbacks",
				"recall",
				"retractions",
				"noise/session",
				"tool calls/session",
			],
			[
				["Y-formulaic (sonnet)", "48/48", "36/36", "12/12", "0.00", "4.0"],
				["Y-casual (sonnet)", "48/48", "36/36", "12/12", "0.00", "4.0"],
				["Y-casual-history (sonnet)", "47/48", "35/36", "12/12", "0.00", "3.9"],
				["Y-formulaic (gemini)", "48/48", "36/36", "12/12", "0.00", "4.1"],
				["Y-casual (gemini)", "48/48", "36/36", "12/12", "0.00", "4.2"],
				["Y-casual-history (gemini)", "48/48", "34/36", "12/12", "0.00", "3.8"],
				["Y-formulaic (opus)", "48/48", "36/36", "12/12", "0.00", "4.0"],
				["Y-casual (opus)", "48/48", "36/36", "12/12", "0.00", "4.0"],
				["Y-casual-history (opus)", "48/48", "35/36", "12/12", "0.00", "3.9"],
			],
		);
	})();

	// --- Study Z: standing context · combined-task interpretation split ---
	(() => {
		const ZARMS = ["Z-full", "Z-slice", "Z-memo"];
		const ZNAMES = {
			"Z-full": "whole pack in the system prompt (the shipped shape)",
			"Z-slice": "oracle relevant slice only",
			"Z-memo": "whole pack + rules distilled into the memo tail",
		};
		// stacked: obey-both (green) vs strict-form literal reading (orange); violations were ZERO everywhere
		const ZCOLOR = { both: "#199e70", strict: "#c98500" };
		// per model per arm: [obey-both, strict-form] of 12 combined cells
		const ZDATA = [
			{
				model: "sonnet-4.5",
				cells: { "Z-full": [2, 10], "Z-slice": [3, 9], "Z-memo": [11, 1] },
			},
			{
				model: "gemini-3.5-flash",
				cells: { "Z-full": [3, 9], "Z-slice": [11, 1], "Z-memo": [8, 4] },
			},
			{
				model: "opus-4.8",
				cells: { "Z-full": [6, 6], "Z-slice": [0, 12], "Z-memo": [4, 8] },
			},
		];
		byId("legend-20").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			ZCOLOR.both +
			'"></span>satisfied BOTH (format + product™ appended)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			ZCOLOR.strict +
			'"></span>obeyed the format rule LITERALLY (exact email | city, no mention)</span>' +
			legendNote(
				"every one of 324 cells landed in one of these two readings · zero rule violations, zero contamination; facts and rules were 100% in every arm",
			);
		const W = 880,
			ROW = 30,
			T = 8,
			B = 40,
			L = 250,
			R = 24;
		const rows = [];
		for (const m of ZDATA)
			for (const c of ZARMS)
				rows.push({ model: m.model, arm: c, cell: m.cells[c] });
		const H = T + rows.length * ROW + B + 12;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 12) * iw;
		let g = "";
		for (const tick of [0, 3, 6, 9, 12]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"conflicted combined cells (of 12) by how the model resolved the rule-vs-instruction collision";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				row.model
					.replace("-3.5-flash", "")
					.replace("-4.5", "")
					.replace("-4.8", "") +
				"</text>";
			const [both, strict] = row.cell;
			const wBoth = (both / 12) * iw,
				wStrict = (strict / 12) * iw;
			if (both > 0)
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					(cy - 8) +
					'" width="' +
					Math.max(wBoth - 2, 1) +
					'" height="16" fill="' +
					ZCOLOR.both +
					'" rx="3"/>';
			if (strict > 0)
				marks +=
					'<rect x="' +
					(L + wBoth) +
					'" y="' +
					(cy - 8) +
					'" width="' +
					Math.max(wStrict - 2, 1) +
					'" height="16" fill="' +
					ZCOLOR.strict +
					'" rx="3"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 11) +
				'" width="' +
				iw +
				'" height="22" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						ZNAMES[row.arm] +
						"\n" +
						row.model +
						": satisfied both " +
						both +
						"/12 · literal form reading " +
						strict +
						"/12 · violations 0 · contamination 0",
				) +
				'"/>';
		});
		const el = byId("fig-standing");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Stacked bar chart: every conflicted cell resolved into one of two clean readings, and the strongest model took the literal rule reading most often; the memo arm shifts sonnet toward satisfying both.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-standing",
			[
				"arm (model)",
				"facts",
				"rules",
				"combined (registered)",
				"obeyed both",
				"literal reading",
				"input cost vs uncached",
			],
			[
				["Z-full (sonnet)", "12/12", "12/12", "2/12", "2", "10", "\u221224.6%"],
				["Z-slice (sonnet)", "12/12", "12/12", "3/12", "3", "9", "\u22120.0%"],
				[
					"Z-memo (sonnet)",
					"12/12",
					"12/12",
					"11/12",
					"11",
					"1",
					"\u221242.5%",
				],
				["Z-full (gemini)", "12/12", "12/12", "3/12", "3", "9", "\u22120.0%"],
				[
					"Z-slice (gemini)",
					"12/12",
					"12/12",
					"11/12",
					"11",
					"1",
					"\u22120.0%",
				],
				["Z-memo (gemini)", "12/12", "12/12", "8/12", "8", "4", "\u22120.0%"],
				["Z-full (opus)", "12/12", "12/12", "6/12", "6", "6", "\u221224.9%"],
				["Z-slice (opus)", "12/12", "12/12", "0/12", "0", "12", "+10.8%"],
				["Z-memo (opus)", "12/12", "12/12", "4/12", "4", "8", "\u221243.0%"],
			],
		);
	})();

	// --- Study AA: conflict resolution · literal readings by arm (the refuted gradient) ---
	(() => {
		const AARMS = ["AA-base", "AA-priority", "AA-soft", "AA-memo"];
		const ANAMES = {
			"AA-base": "pack as-is (the confirmation arm)",
			"AA-priority": "+ priority meta-rule (user wins)",
			"AA-soft": "rules soft-phrased (generally prefer)",
			"AA-memo": "rules restated in the memo tail",
		};
		const ACOLOR = {
			"AA-base": "#3987e5",
			"AA-priority": "#9085e9",
			"AA-soft": "#199e70",
			"AA-memo": "#c98500",
		};
		// literal readings out of 24 (ri form + override enforced)
		const ADATA = [
			{
				model: "sonnet-4.5",
				cells: { "AA-base": 10, "AA-priority": 8, "AA-soft": 2, "AA-memo": 10 },
			},
			{
				model: "gemini-3.5-flash",
				cells: { "AA-base": 7, "AA-priority": 3, "AA-soft": 0, "AA-memo": 0 },
			},
			{
				model: "opus-4.8",
				cells: { "AA-base": 0, "AA-priority": 0, "AA-soft": 0, "AA-memo": 12 },
			},
		];
		// memo-arm literal on opus/sonnet is the countermand trampling (enforced ™), not form-strictness
		byId("legend-21").innerHTML =
			AARMS.map(
				(c) =>
					'<span class="key"><span class="chip" style="background:' +
					ACOLOR[c] +
					'"></span><span class="code">' +
					c +
					"</span> " +
					ANAMES[c] +
					"</span>",
			).join("") +
			legendNote(
				"literal/rule-enforced readings out of 24 conflicted cells · the refuted prediction said opus would have the LONGEST base bar; it has none",
				"bars",
			);
		const W = 880,
			ROW = 30,
			T = 8,
			B = 40,
			L = 250,
			R = 24;
		const rows = [];
		for (const m of ADATA)
			for (const c of AARMS)
				rows.push({ model: m.model, arm: c, v: m.cells[c] });
		const H = T + rows.length * ROW + B + 12;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 24) * iw;
		let g = "";
		for (const tick of [0, 6, 12, 18, 24]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"literal readings (of 24 conflicted cells) · memo-arm bars on opus/sonnet are the countermand-trampling footgun, not form-strictness";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.arm +
				" · " +
				row.model
					.replace("-3.5-flash", "")
					.replace("-4.5", "")
					.replace("-4.8", "") +
				"</text>";
			if (row.v > 0)
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					(cy - 8) +
					'" width="' +
					(row.v / 24) * iw +
					'" height="16" fill="' +
					ACOLOR[row.arm] +
					'" rx="3"/>';
			else
				marks +=
					'<circle cx="' +
					(L + 4) +
					'" cy="' +
					cy +
					'" r="3.5" fill="' +
					ACOLOR[row.arm] +
					'"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 11) +
				'" width="' +
				iw +
				'" height="22" fill="transparent" data-tip="' +
				esc(
					row.arm +
						" · " +
						ANAMES[row.arm] +
						"\n" +
						row.model +
						": literal readings " +
						row.v +
						"/24 · violations 0 · contamination 0",
				) +
				'"/>';
		});
		const el = byId("fig-conflict");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Bar chart: opus took zero literal readings in the confirmation arm, inverting the refuted capability-strictness prediction; soft phrasing collapses literal readings; the memo arm shows the countermand-trampling footgun.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-conflict",
			[
				"arm (model)",
				"literal (of 24)",
				"instruction-favored (of 24)",
				"countermand honored (of 12)",
				"violations",
				"contamination",
			],
			[
				["AA-base (sonnet)", "10", "14", "12/12", "0", "0"],
				["AA-priority (sonnet)", "8", "16", "12/12", "0", "0"],
				["AA-soft (sonnet)", "2", "22", "12/12", "0", "0"],
				["AA-memo (sonnet)", "10", "14", "3/12 ← memo tramples", "0", "0"],
				["AA-base (gemini)", "7", "17", "12/12", "0", "0"],
				["AA-priority (gemini)", "3", "21", "12/12", "0", "0"],
				["AA-soft (gemini)", "0", "24", "12/12", "0", "0"],
				["AA-memo (gemini)", "0", "24", "12/12", "0", "0"],
				["AA-base (opus)", "0", "24", "12/12", "0", "0"],
				["AA-priority (opus)", "0", "24", "12/12", "0", "0"],
				["AA-soft (opus)", "0", "24", "12/12", "0", "0"],
				["AA-memo (opus)", "12", "12", "0/12 ← memo tramples", "0", "0"],
			],
		);
	})();

	// --- Study AC: ask versus guess · the villain flips ---
	(() => {
		const ROWS = [
			{
				label: "no hatch (the U replication)",
				key: "base",
				asked: [0, 0, 0],
				guessed: [45, 45, 45],
			},
			{
				label: "NEED-INFO prompt rule",
				key: "rule",
				asked: [45, 45, 45],
				guessed: [0, 0, 0],
			},
			{
				label: "ask_user tool",
				key: "tool",
				asked: [45, 45, 45],
				guessed: [0, 0, 0],
			},
		];
		const MODELS = ["sonnet-4.5", "gemini-3.5-flash", "opus-4.8"];
		const CASK = "#199e70",
			CGUESS = "#e66767";
		byId("legend-22").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CASK +
			'"></span>asked (named the exact missing node)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CGUESS +
			'"></span>silent wrong patch (valid, applied, confidently wrong)</span>' +
			legendNote(
				"45 provably-unsolvable cells per model per arm · solvable twins: zero false asks, solve untouched (in the table)",
				"bars",
			);
		const W = 880,
			ROW = 30,
			T = 8,
			B = 40,
			L = 250,
			R = 24;
		const rows = [];
		ROWS.forEach((a) =>
			MODELS.forEach((m, mi) =>
				rows.push({
					arm: a.label,
					model: m,
					asked: a.asked[mi],
					guessed: a.guessed[mi],
				}),
			),
		);
		const H = T + rows.length * ROW + B + 12;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 45) * iw;
		let g = "";
		for (const tick of [0, 15, 30, 45]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"outcomes on 45 unsolvable cells · one sentence of permission flips every silent guess into a precise question";
		let marks = "",
			hits = "";
		rows.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.model +
				" · " +
				row.arm.split(" (")[0] +
				"</text>";
			if (row.asked > 0)
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					(cy - 8) +
					'" width="' +
					(row.asked / 45) * iw +
					'" height="16" fill="' +
					CASK +
					'" rx="3"/>';
			if (row.guessed > 0)
				marks +=
					'<rect x="' +
					xOf(row.asked) +
					'" y="' +
					(cy - 8) +
					'" width="' +
					Math.max((row.guessed / 45) * iw - 2, 1) +
					'" height="16" fill="' +
					CGUESS +
					'" rx="3"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 11) +
				'" width="' +
				iw +
				'" height="22" fill="transparent" data-tip="' +
				esc(
					row.arm +
						"\n" +
						row.model +
						": asked " +
						row.asked +
						"/45 · silent wrong patch " +
						row.guessed +
						"/45 · false asks on solvable twins 0/45",
				) +
				'"/>';
		});
		const el = byId("fig-ask");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Bar chart: without a hatch every model silently guessed on all 45 unsolvable cells; with either escape hatch every model asked on all 45, with zero false asks on solvable twins.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-ask",
			[
				"arm (model)",
				"unsolvable: asked",
				"unsolvable: silent guess",
				"solvable: false asks",
				"solvable: solved",
			],
			[
				["no hatch (sonnet)", "0/45", "45/45", "0/45", "45/45"],
				["no hatch (gemini)", "0/45", "45/45", "0/45", "45/45"],
				["no hatch (opus)", "0/45", "45/45", "0/45", "45/45"],
				["NEED-INFO rule (sonnet)", "45/45", "0/45", "0/45", "45/45"],
				["NEED-INFO rule (gemini)", "45/45", "0/45", "0/45", "45/45"],
				["NEED-INFO rule (opus)", "45/45", "0/45", "0/45", "45/45"],
				["ask_user tool (sonnet)", "45/45", "0/45", "0/45", "45/45"],
				["ask_user tool (gemini)", "45/45", "0/45", "0/45", "45/45"],
				["ask_user tool (opus)", "45/45", "0/45", "0/45", "45/45"],
			],
		);
	})();

	// --- Study AD: the Opus confirmation · prior bands vs the shipped tier ---
	(() => {
		const ROWS = [
			{
				label: "patch dialect · main corpus",
				lo: 91.0,
				hi: 94.0,
				opus: 97.0,
				tip: "condition F, 200 tasks, parity regime\nprior band: gemini 182/200 (91.0%) to gpt-5.4 188/200 (94.0%), 4 tiers\nopus-4.8: 194/200 (97.0%), best F ever measured\ngate ≥182: PASS",
			},
			{
				label: "focused views · FVH",
				lo: 93.3,
				hi: 95.6,
				opus: 100,
				tip: "HTML focused views, 45 tasks at 300-1000 nodes\nprior band: gemini 42/45 to sonnet 43/45\nopus-4.8: 45/45\ngate ≥40: PASS",
			},
			{
				label: "focused views · FTH",
				lo: 88.9,
				hi: 97.8,
				opus: 100,
				tip: "HTML minimal views, 45 tasks at 300-1000 nodes\nprior band: gemini 40/45 to sonnet 44/45\nopus-4.8: 45/45\ngate ≥40: PASS",
			},
			{
				label: "search grounding · N-search",
				lo: 86.7,
				hi: 95.6,
				opus: 95.6,
				tip: "skeleton view + one find_nodes tool, 45 id-free tasks\nprior band: gemini 39/45 to sonnet 43/45 (sonnet = its id-oracle bound)\nopus-4.8: 43/45, the same bound, median ONE search call\ngate ≥39: PASS",
			},
			{
				label: "sessions · intact end states",
				lo: 90.0,
				hi: 95.0,
				opus: 100,
				tip: "12-edit sessions, 20 per policy\nprior band (surviving recipes): stateless+examples 18/20 (sonnet) to history+views 19/20 (both)\nopus-4.8: 20/20 in ALL THREE policies, including bare stateless (240/240 steps each)\ngate ≥17: PASS",
			},
			{
				label: "fan-out · views",
				lo: 62.2,
				hi: 68.9,
				opus: 80.0,
				tip: "one instruction, 2-32 targets, oracle views, 45 tasks\nprior band: gemini 28/45 to sonnet 31/45\nopus-4.8: 36/45, but 7+-target tasks still 12/18\ndescriptive: the decomposition fence stands",
			},
			{
				label: "fan-out · full tree",
				lo: 48.9,
				hi: 80.0,
				opus: 88.9,
				tip: "one instruction, 2-32 targets, whole tree in context, 45 tasks\nprior band: sonnet 22/45 to gemini 36/45 (the Study Q inversion)\nopus-4.8: 40/45, a third mitigation profile (full-tree-leaning, n.s.)\ndescriptive: the decomposition fence stands",
			},
		];
		const CBAND = "#8b93a3",
			COPUS = "#199e70";
		byId("legend-23").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CBAND +
			'"></span>prior tiers, weakest to best measured (Studies F, I/J, N, K/M/P, Q)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			COPUS +
			'"></span>claude-opus-4.8, the shipped tier (Study AD)</span>' +
			legendNote(
				"scale starts at 40%; hover a row for exact counts and the gate",
			);
		const W = 880,
			ROW = 34,
			T = 8,
			B = 42,
			L = 250,
			R = 30;
		const H = T + ROWS.length * ROW + B + 6;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - 40) / 60) * iw;
		let g = "";
		for (const tick of [40, 50, 60, 70, 80, 90, 100]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"%</text>";
		}
		const figCaption =
			"task success: the gray band is where sonnet and gemini landed; the green dot is the tier the product ships";
		let marks = "",
			hits = "";
		ROWS.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.label +
				"</text>";
			marks +=
				'<rect x="' +
				xOf(row.lo) +
				'" y="' +
				(cy - 5) +
				'" width="' +
				Math.max(xOf(row.hi) - xOf(row.lo), 3) +
				'" height="10" fill="' +
				CBAND +
				'" opacity="0.55" rx="5"/>';
			marks +=
				'<circle cx="' +
				xOf(row.opus) +
				'" cy="' +
				cy +
				'" r="6.5" fill="' +
				COPUS +
				'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 14) +
				'" width="' +
				iw +
				'" height="28" fill="transparent" data-tip="' +
				esc(row.label + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-opus");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Band chart: claude-opus-4.8 lands at or above the top of every prior band on the core stack (dialect, views, search, sessions) and raises the fan-out floor without closing it.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-opus",
			["arm", "prior band", "opus-4.8", "gate"],
			[
				[
					"patch dialect, main corpus (n=200)",
					"182-188/200 (4 tiers)",
					"194/200",
					"≥182: PASS",
				],
				["focused views FVH (n=45)", "42-43/45", "45/45", "≥40: PASS"],
				["focused views FTH (n=45)", "40-44/45", "45/45", "≥40: PASS"],
				["search grounding N-search (n=45)", "39-43/45", "43/45", "≥39: PASS"],
				[
					"sessions, steps per policy (n=240)",
					"see Study K/M/P sections",
					"240/240 in all three policies",
					"≥95%: PASS",
				],
				[
					"sessions, intact end states (n=20)",
					"18-19/20 (surviving recipes)",
					"20/20 in all three policies",
					"≥17: PASS",
				],
				[
					"full-tree patches at ~1000 nodes (n=15)",
					"13/15 both tiers",
					"14/15",
					"descriptive",
				],
				[
					"fan-out Q-view / Q-full (n=45)",
					"62.2-68.9% / 48.9-80.0%",
					"80.0% / 88.9%",
					"descriptive; fence stands",
				],
			],
		);
	})();

	// --- Study AE: the calibration ladder · ask rate by ambiguity level ---
	(() => {
		const LEVELS = [
			"L0 precise",
			"L1 indirect, unique",
			"L2 discretionary",
			"L3 two referents",
			"L4 missing info",
		];
		const SERIES = [
			{
				name: "opus-4.8",
				color: "#199e70",
				asks: [0, 0, 2, 15, 15],
				note: [
					"solved 15/15",
					"solved 15/15",
					"acted 13, asked 2",
					"asked 15/15, naming BOTH candidate ids every time",
					"asked 15/15",
				],
			},
			{
				name: "sonnet-4.5",
				color: "#c98500",
				asks: [0, 0, 0, 1, 15],
				note: [
					"solved 15/15",
					"solved 15/15",
					"acted 15/15",
					"asked 1/15; edited BOTH matches 12/15",
					"asked 15/15",
				],
			},
			{
				name: "gemini-3.5-flash",
				color: "#3987e5",
				asks: [0, 0, 0, 1, 15],
				note: [
					"solved 15/15",
					"solved 15/15",
					"acted 15/15",
					"asked 1/15; silently picked one match 9/15",
					"asked 15/15",
				],
			},
		];
		byId("legend-24").innerHTML =
			SERIES.map(
				(m) =>
					'<span class="key"><span class="chip" style="background:' +
					m.color +
					'"></span>' +
					m.name +
					"</span>",
			).join("") +
			legendNote(
				"ask rate on 15 cells per level, shipped NEED-INFO rule verbatim · the correct behavior is to ask only at L3 and L4",
			);
		const W = 880,
			H = 300,
			T = 16,
			B = 58,
			L = 64,
			R = 30;
		const iw = W - L - R;
		const ih = H - T - B;
		const xOf = (i) => L + (i / (LEVELS.length - 1)) * iw;
		const yOf = (v) => T + (1 - v / 15) * ih;
		let g = "";
		for (const tick of [0, 5, 10, 15]) {
			const y = yOf(tick);
			g +=
				'<line x1="' +
				L +
				'" x2="' +
				(W - R) +
				'" y1="' +
				y +
				'" y2="' +
				y +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				(L - 10) +
				'" y="' +
				(y + 4) +
				'" text-anchor="end">' +
				tick +
				"/15</text>";
		}
		LEVELS.forEach((label, i) => {
			g +=
				'<text class="chart-tick" x="' +
				xOf(i) +
				'" y="' +
				(H - B + 22) +
				'" text-anchor="middle">' +
				label +
				"</text>";
		});
		const figCaption =
			"asks per 15 cells across the ambiguity ladder: flat zero on clear requests, a tier split at two referents, ceiling at missing info";
		let marks = "",
			hits = "";
		for (const series of SERIES) {
			let path = "";
			series.asks.forEach((v, i) => {
				path += (i === 0 ? "M" : "L") + xOf(i) + " " + yOf(v) + " ";
			});
			marks +=
				'<path d="' +
				path +
				'" fill="none" stroke="' +
				series.color +
				'" stroke-width="2"/>';
			series.asks.forEach((v, i) => {
				marks +=
					'<circle cx="' +
					xOf(i) +
					'" cy="' +
					yOf(v) +
					'" r="6" fill="' +
					series.color +
					'" stroke="hsl(217,48%,15%)" stroke-width="2"/>';
				hits +=
					'<rect x="' +
					(xOf(i) - 18) +
					'" y="' +
					(yOf(v) - 14) +
					'" width="36" height="28" fill="transparent" data-tip="' +
					esc(
						series.name +
							" · " +
							LEVELS[i] +
							"\nasked " +
							v +
							"/15\n" +
							series.note[i],
					) +
					'"/>';
			});
		}
		const el = byId("fig-calibration");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Line chart: ask rate across five ambiguity levels. All models at zero asks on clear requests and 15 of 15 on missing info; on two-referent requests opus asks 15 of 15 while sonnet and gemini ask 1 of 15.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-calibration",
			["level (rule arm)", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				["L0 precise: solved / asked", "15 / 0", "15 / 0", "15 / 0"],
				["L1 indirect, unique: solved / asked", "15 / 0", "15 / 0", "15 / 0"],
				["L2 discretionary: acted / asked", "15 / 0", "15 / 0", "13 / 2"],
				[
					"L3 two referents: asked / edited-both / picked-one",
					"1 / 12 / 2",
					"1 / 5 / 9",
					"15 / 0 / 0",
				],
				["L4 missing info: asked", "15", "15", "15"],
				["resume loop: resumed-solved (of 45)", "45", "45", "45"],
				["L3 asks naming both candidate ids", "1/1", "1/1", "15/15"],
			],
		);
	})();

	// --- Study AF: restate-before-rewrite · W/L/T vs control (Track 2) ---
	(() => {
		const ROWS = [
			{
				editor: "sonnet-4.5",
				arm: "memo + restate",
				win: 6,
				tie: 19,
				loss: 5,
				tip: "primary judge 6/5/19 (sign p=1.0)\nsensitivity judge 7/5/18\nStudy V's bare memo had BEATEN control 10-2 here",
			},
			{
				editor: "sonnet-4.5",
				arm: "view + restate",
				win: 0,
				tie: 1,
				loss: 29,
				tip: "primary judge 0/29/1\nGOAL-line compliance 30/30: restated the thesis, then orbited it",
			},
			{
				editor: "gemini-3.5-flash",
				arm: "memo + restate",
				win: 3,
				tie: 17,
				loss: 10,
				tip: "primary judge 3/10/17 (sign p=.09, not significant)\nsensitivity judge 1/13/16 (p=.0018, control-favored) · the disclosed dissent",
			},
			{
				editor: "gemini-3.5-flash",
				arm: "view + restate",
				win: 0,
				tie: 0,
				loss: 30,
				tip: "primary judge 0/30/0\nGOAL-line compliance 30/30",
			},
			{
				editor: "opus-4.8",
				arm: "memo + restate",
				win: 2,
				tie: 19,
				loss: 9,
				tip: "primary judge 2/9/19 (sign p=.07, not significant)\nsensitivity judge 5/15/10 (p=.04, control-favored) · the disclosed dissent",
			},
			{
				editor: "opus-4.8",
				arm: "view + restate",
				win: 0,
				tie: 10,
				loss: 20,
				tip: "primary judge 0/20/10\nGOAL-line compliance 30/30: even the frontier tier repeats a read goal and then orbits it",
			},
		];
		const CWIN = "#199e70",
			CTIE = "#8b93a3",
			CLOSS = "#e66767";
		byId("legend-25").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CWIN +
			'"></span>arm wins</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CTIE +
			'"></span>tie (order-inconsistent)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CLOSS +
			'"></span>control wins</span>' +
			legendNote(
				"30 judged pairs per row, primary judge, both presentation orders · JUDGE-GRADED (Track 2), never pooled with the deterministic studies",
			);
		const W = 880,
			ROW = 34,
			T = 8,
			B = 42,
			L = 250,
			R = 24;
		const H = T + ROWS.length * ROW + B + 6;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 30) * iw;
		let g = "";
		for (const tick of [0, 10, 20, 30]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		const figCaption =
			"judged pairs vs an explicit-goal control: restating a READ goal never wins; restating a MEMO goal changes nothing";
		let marks = "",
			hits = "";
		ROWS.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.editor +
				" · " +
				row.arm +
				"</text>";
			let x = L;
			for (const seg of [
				{ v: row.win, c: CWIN },
				{ v: row.tie, c: CTIE },
				{ v: row.loss, c: CLOSS },
			]) {
				if (seg.v > 0) {
					const w = (seg.v / 30) * iw;
					marks +=
						'<rect x="' +
						x +
						'" y="' +
						(cy - 8) +
						'" width="' +
						Math.max(w - 2, 1) +
						'" height="16" fill="' +
						seg.c +
						'" rx="3"/>';
					x += w;
				}
			}
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 12) +
				'" width="' +
				iw +
				'" height="24" fill="transparent" data-tip="' +
				esc(row.editor + " · " + row.arm + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-restate");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Stacked bar chart: restate arms vs explicit-goal control. View-plus-restate loses or ties every pair on all three editors with zero wins; memo-plus-restate is tie-heavy parity.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(figCaption);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-restate",
			[
				"cell (30 pairs)",
				"primary W/L/T",
				"sensitivity W/L/T",
				"GOAL compliance",
			],
			[
				["sonnet memo+restate", "6/5/19", "7/5/18", "30/30"],
				["sonnet view+restate", "0/29/1", "0/26/4", "30/30"],
				["gemini memo+restate", "3/10/17", "1/13/16 (p=.0018)", "30/30"],
				["gemini view+restate", "0/30/0", "0/26/4", "30/30"],
				["opus memo+restate", "2/9/19", "5/15/10 (p=.0414)", "30/30"],
				["opus view+restate", "0/20/10", "0/19/11", "30/30"],
				["mechanical validity", "270/270 across all arms", "", ""],
			],
		);
	})();

	// --- Study AH: memo saturation · below-cap vs the cap edge ---
	(() => {
		const ROWS = [
			{
				label: "sonnet-4.5 · below cap",
				segs: [{ v: 20, c: "#199e70", k: "clean update" }],
				tip: "K=10 and K=19 full-replace updates: 20/20 clean\nevery old needle preserved, every new declaration recorded",
			},
			{
				label: "sonnet-4.5 · at the cap",
				segs: [
					{ v: 3, c: "#c98500", k: "pruned a note itself" },
					{ v: 7, c: "#e66767", k: "clamp chose the victim" },
				],
				tip: "K=20 + a 21st declaration: 10/10 cells lost a note\npruned deliberately 3, over-sent 21 and the shipped clamp cut one 7\nvictim: a GOAL note in 10/10",
			},
			{
				label: "gemini-3.5-flash · below cap",
				segs: [{ v: 20, c: "#199e70", k: "clean update" }],
				tip: "K=10 and K=19 full-replace updates: 20/20 clean",
			},
			{
				label: "gemini-3.5-flash · at the cap",
				segs: [
					{ v: 8, c: "#c98500", k: "pruned a note itself" },
					{ v: 2, c: "#e66767", k: "clamp chose the victim" },
				],
				tip: "K=20 + a 21st declaration: 10/10 cells lost a note\npruned deliberately 8, clamp cut one 2\nvictim: a GOAL note in 10/10",
			},
			{
				label: "opus-4.8 · below cap",
				segs: [{ v: 20, c: "#199e70", k: "clean update" }],
				tip: "K=10 and K=19 full-replace updates: 20/20 clean",
			},
			{
				label: "opus-4.8 · at the cap",
				segs: [{ v: 10, c: "#e66767", k: "clamp chose the victim" }],
				tip: "K=20 + a 21st declaration: 10/10 cells lost a note\nover-sent 21 notes every time; the shipped clamp kept the first 20\nvictim: a GOAL note in 10/10",
			},
		];
		byId("legend-26").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>clean full-replace (nothing lost)</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>model pruned a note (silent)</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>shipped clamp cut a note (silent)</span>' +
			legendNote(
				"below cap = 20 update scenarios per model · at the cap = 10 per model · every lost note was a goal · read side (recall/rules at N=20): 90/90, in the table",
			);
		const W = 880,
			ROW = 34,
			T = 8,
			B = 42,
			L = 250,
			R = 24;
		const H = T + ROWS.length * ROW + B + 6;
		const iw = W - L - R;
		let g = "";
		for (const tick of [0, 5, 10, 15, 20]) {
			const x = L + (tick / 20) * iw;
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		let marks = "",
			hits = "";
		ROWS.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			const denom =
				row.segs.reduce((s2, seg) => s2 + seg.v, 0) === 20 ? 20 : 10;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.label +
				"</text>";
			let x = L;
			for (const seg of row.segs) {
				const w = (seg.v / 20) * iw;
				marks +=
					'<rect x="' +
					x +
					'" y="' +
					(cy - 8) +
					'" width="' +
					Math.max(w - 2, 1) +
					'" height="16" fill="' +
					seg.c +
					'" rx="3"/>';
				x += w;
			}
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 12) +
				'" width="' +
				iw +
				'" height="24" fill="transparent" data-tip="' +
				esc(row.label + " (of " + denom + ")\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-saturation");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Stacked bar chart: full-replace memo updates are clean 20 of 20 per model below the cap; at the twenty-note cap every cell loses a note, split between deliberate prunes and the silent clamp, and every lost note was a goal.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"full-replace update outcomes: clean below the cap, a silent loss in every cap-edge cell · and all 30 lost notes were goals, the class only the memo carries",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-saturation",
			["measure", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				[
					"recall from a FULL 20-note memo (first/middle/last)",
					"15/15",
					"15/15",
					"15/15",
				],
				[
					"unprompted rule application, 12-rule memo",
					"15/15",
					"15/15",
					"15/15",
				],
				["cross-note contamination events", "0", "0", "0"],
				["full-replace clean at K=10 and K=19", "20/20", "20/20", "20/20"],
				["cap edge: cells losing a note", "10/10", "10/10", "10/10"],
				["cap edge: lost note was a goal", "10/10", "10/10", "10/10"],
				["edit applied alongside the memo update", "30/30", "30/30", "30/30"],
			],
		);
	})();

	// --- Study AI: the multiplicity hatch · L3 asks, amended vs shipped ---
	(() => {
		const ROWS = [
			{
				model: "sonnet-4.5",
				control: 3,
				rule2: 15,
				tip: "shipped sentence: 3/15 asks (12 unilateral resolutions)\n+ multiplicity clause: 15/15 asks, every ask naming both candidate ids\nMcNemar p = 5e-4 · complete rescue",
			},
			{
				model: "gemini-3.5-flash",
				control: 0,
				rule2: 11,
				tip: "shipped sentence: 0/15 asks (11 coin-flips, 4 edit-both)\n+ multiplicity clause: 11/15 asks · one short of the ≥12 bar (p = .059)\nresiduals: 4 silent edit-boths; the coin-flips vanished",
			},
			{
				model: "opus-4.8",
				control: 15,
				rule2: 15,
				tip: "already 15/15 with the shipped sentence · the clause adds nothing here\nthe one cost signal: discretionary-request asks rose 2/15 → 5/15 (n.s.)",
			},
		];
		const CCONTROL = "#8b93a3",
			CRULE2 = "#3987e5";
		byId("legend-27").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CCONTROL +
			'"></span>shipped sentence alone (contemporaneous control)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CRULE2 +
			'"></span>+ the multiplicity clause</span>' +
			legendNote(
				"asks on 15 two-referent (L3) cells per model · registered detection bar: 12 · zero false asks on clear requests in either arm",
			);
		const W = 880,
			GROUP = 56,
			BAR = 18,
			T = 8,
			B = 42,
			L = 190,
			R = 24;
		const H = T + ROWS.length * GROUP + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 15) * iw;
		let g = "";
		for (const tick of [0, 5, 10, 15]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		// the registered bar
		g +=
			'<line x1="' +
			xOf(12) +
			'" x2="' +
			xOf(12) +
			'" y1="' +
			T +
			'" y2="' +
			(H - B) +
			'" stroke="#e66767" stroke-width="1.5" stroke-dasharray="4 4"/>';
		let marks = "",
			hits = "";
		ROWS.forEach((row, ri) => {
			const top = T + ri * GROUP + 8;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(top + BAR) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			for (const [i, v] of [row.control, row.rule2].entries()) {
				if (v > 0) {
					marks +=
						'<rect x="' +
						L +
						'" y="' +
						(top + i * (BAR + 3)) +
						'" width="' +
						(v / 15) * iw +
						'" height="' +
						BAR +
						'" fill="' +
						(i === 0 ? CCONTROL : CRULE2) +
						'" rx="3"/>';
				}
			}
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				top +
				'" width="' +
				iw +
				'" height="' +
				(2 * BAR + 3) +
				'" fill="transparent" data-tip="' +
				esc(row.model + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-multiplicity");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grouped bar chart: with the multiplicity clause sonnet reaches 15 of 15 asks on ambiguous references, gemini reaches 11 of 15 just under the registered bar of 12, and opus stays at 15 of 15 with or without it.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"asks on two-referent requests, shipped sentence vs the amended one; the dashed line is the registered detection bar · the clause rescues sonnet, leaves gemini one short, and changes nothing on the tier the product ships",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-multiplicity",
			["cell", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				["L3 asked, shipped sentence", "3/15", "0/15", "15/15"],
				["L3 asked, + multiplicity clause", "15/15", "11/15", "15/15"],
				["L3 residuals under the clause", "none", "4 edit-both", "none"],
				["asks naming both candidate ids", "15/15", "11/11", "15/15"],
				["false asks on clear requests (L0+L1)", "0/30", "0/30", "0/30"],
				[
					"L2 discretionary asks, control → clause",
					"0 → 0",
					"0 → 0",
					"2 → 5 (n.s.)",
				],
				["L4 missing-info asked (clause arm)", "15/15", "15/15", "15/15"],
			],
		);
	})();

	// --- Study AG: the anaphora hatch · outcomes on 48 anaphora cells ---
	(() => {
		const ROWS = [
			{
				label: "sonnet-4.5 · no hatch",
				asked: 0,
				solved: 0,
				silent: 48,
				tip: "the Study X replication: every cell a valid silently-guessed patch",
			},
			{
				label: "sonnet-4.5 · + hatch",
				asked: 47,
				solved: 0,
				silent: 1,
				tip: "47/48 asks, each naming the dangling antecedent",
			},
			{
				label: "sonnet-4.5 · echo + hatch",
				asked: 34,
				solved: 14,
				silent: 0,
				tip: "the echo supplies id, key, and both values · the model quotes them, then asks anyway because the node is not visible in the skeleton view (the visibility clause)",
			},
			{
				label: "gemini-3.5-flash · no hatch",
				asked: 0,
				solved: 0,
				silent: 48,
				tip: "the Study X replication: every cell a valid silently-guessed patch",
			},
			{
				label: "gemini-3.5-flash · + hatch",
				asked: 43,
				solved: 0,
				silent: 5,
				tip: "43/48 asks on the discourse gap",
			},
			{
				label: "gemini-3.5-flash · echo + hatch",
				asked: 36,
				solved: 12,
				silent: 0,
				tip: "36 false asks despite the complete echo · the visibility clause",
			},
			{
				label: "opus-4.8 · no hatch",
				asked: 0,
				solved: 0,
				silent: 48,
				tip: "the Study X replication: every cell a valid silently-guessed patch",
			},
			{
				label: "opus-4.8 · + hatch",
				asked: 48,
				solved: 0,
				silent: 0,
				tip: "48/48 asks · the discourse gap is letter-covered on every tier",
			},
			{
				label: "opus-4.8 · echo + hatch",
				asked: 33,
				solved: 15,
				silent: 0,
				tip: "even the frontier tier obeys the visibility letter: 33 asks despite holding everything needed to patch",
			},
		];
		const CASK = "#3987e5",
			CSOLVE = "#199e70",
			CSILENT = "#e66767";
		byId("legend-28").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CASK +
			'"></span>asked</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CSOLVE +
			'"></span>solved</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CSILENT +
			'"></span>silent wrong patch</span>' +
			legendNote(
				"48 anaphora cells per row · echo-only (no hatch) solved 48/48 in Study X · ordinary steps: zero false asks in 288 cells",
			);
		const W = 880,
			ROW = 30,
			T = 8,
			B = 42,
			L = 250,
			R = 24;
		const H = T + ROWS.length * ROW + B + 6;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 48) * iw;
		let g = "";
		for (const tick of [0, 12, 24, 36, 48]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		let marks = "",
			hits = "";
		ROWS.forEach((row, ri) => {
			const cy = T + ri * ROW + ROW / 2;
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(cy + 4) +
				'" text-anchor="end">' +
				row.label +
				"</text>";
			let x = L;
			for (const seg of [
				{ v: row.asked, c: CASK },
				{ v: row.solved, c: CSOLVE },
				{ v: row.silent, c: CSILENT },
			]) {
				if (seg.v > 0) {
					const w = (seg.v / 48) * iw;
					marks +=
						'<rect x="' +
						x +
						'" y="' +
						(cy - 8) +
						'" width="' +
						Math.max(w - 2, 1) +
						'" height="16" fill="' +
						seg.c +
						'" rx="3"/>';
					x += w;
				}
			}
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				(cy - 12) +
				'" width="' +
				iw +
				'" height="24" fill="transparent" data-tip="' +
				esc(row.label + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-anaphora-hatch");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Stacked bar chart: without the hatch every anaphora cell is a silent wrong patch; with the hatch nearly all become questions on every model; with the echo plus the hatch most cells are asks despite the echo supplying everything, the visibility-clause tax.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"anaphora-cell outcomes: the hatch converts silent guesses into antecedent-naming questions on every tier, and then keeps asking under the echo because the target is not visible in the skeleton view · zero tax holds only where views carry their targets",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-anaphora-hatch",
			["cell", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				["no hatch: silent wrong patches", "48/48", "48/48", "48/48"],
				["+ hatch: asked", "47/48", "43/48", "48/48"],
				["echo + hatch: asked / solved", "34 / 14", "36 / 12", "33 / 15"],
				["echo only, Study X (no hatch): solved", "48/48", "48/48", "48/48"],
				[
					"ordinary steps: false asks (both hatch arms)",
					"0/192",
					"0/192",
					"0/192",
				],
				[
					"asks by kind (+hatch): amend / repeat / undo",
					"24 / 12 / 11",
					"24 / 12 / 7",
					"24 / 12 / 12",
				],
			],
		);
	})();

	// --- Study AJ: the correction loop in isolation · recovery by arm ---
	(() => {
		const GROUPS = [
			{
				model: "sonnet-4.5",
				vals: [45, 44, 42],
				tip: "structured 45/45 · codes 44/45 · bare 42/45 · the only gradient, and it is not significant (p=.25)",
			},
			{
				model: "gemini-3.5-flash",
				vals: [42, 42, 42],
				tip: "42/45 in every arm, and the three misses are the SAME cells each time (bad anchors) · zero discordant pairs, feedback quality changed nothing",
			},
			{
				model: "opus-4.8",
				vals: [45, 45, 45],
				tip: "45/45 in every arm, including from nothing but “the anchored patch was invalid”",
			},
		];
		const CSTRUCT = "#3987e5",
			CCODES = "#c98500",
			CBARE = "#8b93a3";
		const ARMC = [CSTRUCT, CCODES, CBARE];
		byId("legend-29").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CSTRUCT +
			'"></span>full structured issues</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CCODES +
			'"></span>issue codes only</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CBARE +
			'"></span>bare “the patch was invalid”</span>' +
			legendNote(
				"45 seeded failures per arm · one feedback message, single-shot reply",
			);
		const W = 880,
			BAR = 16,
			GAP = 4,
			GH = 3 * BAR + 2 * GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 150,
			R = 24;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 45) * iw;
		let g = "";
		for (const tick of [0, 15, 30, 45]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		let marks = "",
			hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(top + GH / 2 + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / 45) * iw, 1);
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					y +
					'" width="' +
					w +
					'" height="' +
					BAR +
					'" fill="' +
					ARMC[ai] +
					'" rx="3"/>';
				marks +=
					'<text fill="#c3c9d4" font-size="11" x="' +
					(L + w + 8) +
					'" y="' +
					(y + BAR - 4) +
					'">' +
					v +
					"/45</text>";
			});
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				top +
				'" width="' +
				iw +
				'" height="' +
				GH +
				'" fill="transparent" data-tip="' +
				esc(row.model + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-correction");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grouped bar chart: single-shot recovery from seeded patch failures is at parity across feedback arms on all three models; opus recovers 45 of 45 in every arm, gemini an identical 42 of 45 in every arm, sonnet shows a non-significant 45 to 44 to 42 gradient.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"single-shot recovery from 45 seeded patch failures, by feedback arm; the structured issues barkup has returned verbatim in every study measure no better than a bare “the patch was invalid” · told a patch failed, models re-derive the edit from the task and the tree",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-correction",
			["cell", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				["recovered, full structured issues", "45/45", "42/45", "45/45"],
				["recovered, issue codes only", "44/45", "42/45", "45/45"],
				["recovered, bare “invalid”", "42/45", "42/45", "45/45"],
				[
					"structured vs bare, McNemar",
					"p=.25 n.s.",
					"0 discordant pairs",
					"0 discordant pairs",
				],
				[
					"bad-anchor class, pooled: structured / codes / bare",
					"15/18 · 14/18 · 14/18",
					"-",
					"-",
				],
				[
					"every other class, pooled: structured / codes / bare",
					"117/117 · 117/117 · 115/117",
					"-",
					"-",
				],
				[
					"valid-but-wrong, pooled: structured / codes / bare",
					"3 · 3 · 3",
					"-",
					"-",
				],
				[
					"still-invalid, pooled: structured / codes / bare",
					"0 · 1 · 3",
					"-",
					"-",
				],
			],
		);
	})();

	// --- Study AK: eviction validation · goal survival at the K=20 cap edge ---
	(() => {
		const GROUPS = [
			{
				model: "sonnet-4.5",
				vals: [0, 6],
				tip: "0/10 → 6/10 (p=.0313) · the residue is 4 client-side prunes the app never saw, victims still goals",
			},
			{
				model: "gemini-3.5-flash",
				vals: [0, 4],
				tip: "0/10 → 4/10 (n.s., as pre-registered) · gemini prunes client-side in 6 of 10 cells, outside the fix's reach",
			},
			{
				model: "opus-4.8",
				vals: [0, 10],
				tip: "0/10 → 10/10 (p=.0020) · 9 designed evictions plus one cell where opus answered the eviction notice by consolidating 21 needles into 11 notes",
			},
		];
		const CCONTROL = "#8b93a3",
			CEVICT = "#199e70";
		byId("legend-30").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CCONTROL +
			'"></span>silent clamp (control)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CEVICT +
			'"></span>v3.213.0 eviction pipeline</span>' +
			legendNote(
				"goal-safe cells of 10 at the K=20 cap edge · 19/19 over-cap sends were designed evictions · 60/60 no-op under the cap",
			);
		const W = 880,
			BAR = 16,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 150,
			R = 24;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 10) * iw;
		let g = "";
		for (const tick of [0, 5, 10]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		let marks = "",
			hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(top + GH / 2 + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / 10) * iw, 2);
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					y +
					'" width="' +
					w +
					'" height="' +
					BAR +
					'" fill="' +
					(ai === 0 ? CCONTROL : CEVICT) +
					'" rx="3"/>';
				marks +=
					'<text fill="#c3c9d4" font-size="11" x="' +
					(L + w + 8) +
					'" y="' +
					(y + BAR - 4) +
					'">' +
					v +
					"/10</text>";
			});
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				top +
				'" width="' +
				iw +
				'" height="' +
				GH +
				'" fill="transparent" data-tip="' +
				esc(row.model + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-eviction");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grouped bar chart: goal survival at the memo cap edge rises from zero of ten under the silent clamp to ten of ten on opus, six of ten on sonnet, and four of ten on gemini once the goal-preserving eviction pipeline replaces the clamp.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"goal survival at the memo's 20-note cap edge, silent clamp vs the measured eviction pipeline; the fix closes the injury wherever the app receives the over-cap list, and the residue below the frontier is the model pruning a goal before sending · outside any app-side fix's reach",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-eviction",
			["cell", "sonnet-4.5", "gemini-3.5-flash", "opus-4.8"],
			[
				["K=20 goal-safe, silent clamp (control)", "0/10", "0/10", "0/10"],
				["K=20 goal-safe, eviction pipeline", "6/10", "4/10", "10/10"],
				["McNemar, eviction vs control", "p=.0313", "p=.1250 n.s.", "p=.0020"],
				[
					"pathway at K=20: over-sends / client prunes",
					"6 / 4",
					"4 / 6",
					"9 / 0",
				],
				[
					"prune victims (outside the fix's reach)",
					"4 goals",
					"6 goals",
					"none",
				],
				["designed evictions on over-cap sends (pooled)", "19/19", "-", "-"],
				["goals evicted by the pipeline (pooled)", "0", "-", "-"],
				["clean updates under the cap, K=10+K=19", "20/20", "20/20", "20/20"],
				[
					"reacted to the eviction notice",
					"0",
					"0",
					"1 (consolidated 21 needles into 11 notes)",
				],
			],
		);
	})();

	// --- Study AP: the off-catalog fork · foreign-topic empty rate by arm ---
	(() => {
		const GROUPS = [
			{
				model: "gemini-3.5-flash",
				vals: [7, 12, 12],
				tip: "7/12 → 12/12 under either sentence · unaided it stretched general canonical tags onto 5 foreign topics (zero invention)",
			},
			{
				model: "sonnet-4.5",
				vals: [7, 11, 12],
				tip: "7/12 → 11/12 (fork text) and 12/12 (empty text) · the one fork miss stretched Design Systems and UX Design onto watercolor illustration",
			},
			{
				model: "opus-4.8",
				vals: [12, 12, 12],
				tip: "12/12 in every arm · the frontier tier refuses unaided; guidance adds nothing here",
			},
		];
		const CSHIPPED = "#8b93a3",
			CFORK = "#3987e5",
			CEMPTY = "#199e70";
		byId("legend-31").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CSHIPPED +
			'"></span>shipped stack (no off-catalog guidance)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CFORK +
			'"></span>+ fork text (nearest-general or empty)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CEMPTY +
			'"></span>+ empty text (leave empty when nothing fits)</span>' +
			legendNote(
				"empty tag lists out of 12 wholly-foreign topics · tag_create arm excluded (minting is allowed there; see table)",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 3 * BAR + 2 * GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 150,
			// Wide right margin: full-scale bars carry their "12/12" label
			// OUTSIDE the bar end, which must stay inside the viewBox.
			R = 70;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 12) * iw;
		let g = "";
		for (const tick of [0, 6, 12]) {
			const x = xOf(tick);
			g +=
				'<line x1="' +
				x +
				'" x2="' +
				x +
				'" y1="' +
				T +
				'" y2="' +
				(H - B) +
				'" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>';
			g +=
				'<text class="chart-tick" x="' +
				x +
				'" y="' +
				(H - B + 20) +
				'" text-anchor="middle">' +
				tick +
				"</text>";
		}
		let marks = "",
			hits = "";
		const COLORS = [CSHIPPED, CFORK, CEMPTY];
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g +=
				'<text class="chart-tick" x="' +
				(L - 12) +
				'" y="' +
				(top + GH / 2 + 4) +
				'" text-anchor="end">' +
				row.model +
				"</text>";
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / 12) * iw, 2);
				marks +=
					'<rect x="' +
					L +
					'" y="' +
					y +
					'" width="' +
					w +
					'" height="' +
					BAR +
					'" fill="' +
					COLORS[ai] +
					'" rx="3"/>';
				marks +=
					'<text fill="#c3c9d4" font-size="11" x="' +
					(L + w + 8) +
					'" y="' +
					(y + BAR - 3) +
					'">' +
					v +
					"/12</text>";
			});
			hits +=
				'<rect x="' +
				L +
				'" y="' +
				top +
				'" width="' +
				iw +
				'" height="' +
				GH +
				'" fill="transparent" data-tip="' +
				esc(row.model + "\n" + row.tip) +
				'"/>';
		});
		const el = byId("fig-offcatalog");
		el.innerHTML =
			'<svg viewBox="0 0 ' +
			W +
			" " +
			H +
			'" role="img" aria-label="Grouped bar chart: empty tag lists on twelve wholly-foreign topics rise from seven of twelve on gemini and sonnet under the shipped stack to eleven or twelve of twelve under either guidance sentence; opus returns twelve of twelve empty in every arm, refusing unaided.">' +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"empty tag lists on the 12 wholly-foreign topics (sourdough, beekeeping, birdsong) by guidance arm; the frontier tier refuses unaided, one sentence of tool-description guidance closes the sub-frontier gap, and the minimal empty text is sufficient on all three tiers",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-offcatalog",
			["cell", "gemini-3.5-flash", "sonnet-4.5", "opus-4.8"],
			[
				["foreign empty, shipped stack (control)", "7/12", "7/12", "12/12"],
				["foreign empty, with fork text", "12/12", "11/12", "12/12"],
				["foreign empty, with empty text", "12/12", "12/12", "12/12"],
				[
					"foreign under tag_create: minted / empty / stretched",
					"12 / 0 / 0",
					"3 / 6 / 3",
					"1 / 11 / 0",
				],
				[
					"adjacent conformant, registered sets (pooled arms)",
					"43/48",
					"36/48",
					"31/48",
				],
				[
					"adjacent, anchored exploratory reading",
					"48/48",
					"48/48",
					"48/48",
				],
				["adjacent empty cells (any arm)", "0", "0", "0"],
				["covered + trap discipline (min across arms)", "23/24", "24/24", "23/24"],
				["mints accepted / attempted (guard never fired)", "26/26", "10/10", "4/4"],
				["covered/trap cells with a mint attempt", "1", "0", "0"],
				["invented tags, all 192 cells", "0", "0", "0"],
			],
		);
	})();

	// Every legend gets a "Legend" label as its first child — a styled
	// paragraph, not a heading, so legends don't skip levels in the
	// document outline. Runs after the builders above have set each
	// container's innerHTML; idempotent so re-inits don't stack labels.
	document.querySelectorAll(".chart-legend").forEach((el) => {
		if (!el.firstElementChild?.classList?.contains("legend-title")) {
			const h = document.createElement("p");
			h.className = "legend-title";
			h.textContent = "Legend";
			el.prepend(h);
		}
	});
}
