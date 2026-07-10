// @ts-nocheck
// Chart rendering for the barkup-bench dashboard, transplanted from the
// original results artifact. Runs on mount; builds inline SVGs from DATA.
export function initBenchCharts() {

const DATA = {"crossover":{"A":[{"bucket":"xs","n":216,"ok":207,"rate":95.8,"low":92.3,"high":97.8},{"bucket":"s","n":232,"ok":225,"rate":97,"low":93.9,"high":98.5},{"bucket":"m","n":184,"ok":160,"rate":87,"low":81.3,"high":91.1},{"bucket":"l","n":168,"ok":143,"rate":85.1,"low":79,"high":89.7}],"B":[{"bucket":"xs","n":216,"ok":209,"rate":96.8,"low":93.5,"high":98.4},{"bucket":"s","n":232,"ok":223,"rate":96.1,"low":92.8,"high":97.9},{"bucket":"m","n":184,"ok":165,"rate":89.7,"low":84.4,"high":93.3},{"bucket":"l","n":168,"ok":151,"rate":89.9,"low":84.4,"high":93.6}],"C":[{"bucket":"xs","n":216,"ok":211,"rate":97.7,"low":94.7,"high":99},{"bucket":"s","n":232,"ok":225,"rate":97,"low":93.9,"high":98.5},{"bucket":"m","n":184,"ok":166,"rate":90.2,"low":85.1,"high":93.7},{"bucket":"l","n":168,"ok":149,"rate":88.7,"low":83,"high":92.6}],"D":[{"bucket":"xs","n":216,"ok":211,"rate":97.7,"low":94.7,"high":99},{"bucket":"s","n":232,"ok":224,"rate":96.6,"low":93.3,"high":98.2},{"bucket":"m","n":184,"ok":166,"rate":90.2,"low":85.1,"high":93.7},{"bucket":"l","n":168,"ok":151,"rate":89.9,"low":84.4,"high":93.6}],"E":[{"bucket":"xs","n":216,"ok":202,"rate":93.5,"low":89.4,"high":96.1},{"bucket":"s","n":232,"ok":218,"rate":94,"low":90.1,"high":96.4},{"bucket":"m","n":184,"ok":155,"rate":84.2,"low":78.3,"high":88.8},{"bucket":"l","n":168,"ok":117,"rate":69.6,"low":62.3,"high":76.1}],"F":[{"bucket":"xs","n":216,"ok":210,"rate":97.2,"low":94.1,"high":98.7},{"bucket":"s","n":232,"ok":226,"rate":97.4,"low":94.5,"high":98.8},{"bucket":"m","n":184,"ok":162,"rate":88,"low":82.6,"high":92},{"bucket":"l","n":168,"ok":143,"rate":85.1,"low":79,"high":89.7}]},"tokens":{"A":[1137,2919,7615,15638],"B":[1250,3672,10766,22961],"C":[4958,14535,12198,23733],"D":[4915,13187,9999,17451],"E":[1284,2999,6497,15412],"F":[1170,2725,6370,13155]},"reference":[{"model":"haiku-4.5","cells":{"A":{"ok":34,"rate":85,"low":70.9,"high":92.9},"B":{"ok":35,"rate":87.5,"low":73.9,"high":94.5},"C":{"ok":39,"rate":97.5,"low":87.1,"high":99.6},"D":{"ok":40,"rate":100,"low":91.2,"high":100},"E":{"ok":28,"rate":70,"low":54.6,"high":81.9},"F":{"ok":35,"rate":87.5,"low":73.9,"high":94.5}}},{"model":"sonnet-4.5","cells":{"A":{"ok":37,"rate":92.5,"low":80.1,"high":97.4},"B":{"ok":36,"rate":90,"low":76.9,"high":96},"C":{"ok":40,"rate":100,"low":91.2,"high":100},"D":{"ok":40,"rate":100,"low":91.2,"high":100},"E":{"ok":30,"rate":75,"low":59.8,"high":85.8},"F":{"ok":40,"rate":100,"low":91.2,"high":100}}},{"model":"gemini-3.5-flash","cells":{"A":{"ok":31,"rate":77.5,"low":62.5,"high":87.7},"B":{"ok":34,"rate":85,"low":70.9,"high":92.9},"C":{"ok":27,"rate":67.5,"low":52,"high":79.9},"D":{"ok":30,"rate":75,"low":59.8,"high":85.8},"E":{"ok":30,"rate":75,"low":59.8,"high":85.8},"F":{"ok":33,"rate":82.5,"low":68,"high":91.3}}},{"model":"gpt-5.4","cells":{"A":{"ok":39,"rate":97.5,"low":87.1,"high":99.6},"B":{"ok":39,"rate":97.5,"low":87.1,"high":99.6},"C":{"ok":40,"rate":100,"low":91.2,"high":100},"D":{"ok":40,"rate":100,"low":91.2,"high":100},"E":{"ok":31,"rate":77.5,"low":62.5,"high":87.7},"F":{"ok":37,"rate":92.5,"low":80.1,"high":97.4}}}],"perModel":[{"model":"haiku-4.5","cells":{"A":91,"B":92.5,"C":95,"D":95,"E":80.5,"F":92}},{"model":"sonnet-4.5","cells":{"A":94.5,"B":94,"C":95.5,"D":96,"E":88.5,"F":93.5}},{"model":"gemini-3.5-flash","cells":{"A":86.5,"B":92,"C":88.5,"D":88,"E":87.5,"F":91}},{"model":"gpt-5.4","cells":{"A":95.5,"B":95.5,"C":96.5,"D":97,"E":89.5,"F":94}}],"footgun":[{"model":"haiku-4.5","v1":{"ok":23,"n":80,"rate":28.7,"low":20,"high":39.5},"v2":{"ok":79,"n":80,"rate":98.8,"low":93.3,"high":99.8}},{"model":"sonnet-4.5","v1":{"ok":77,"n":80,"rate":96.3,"low":89.5,"high":98.7},"v2":{"ok":80,"n":80,"rate":100,"low":95.4,"high":100}},{"model":"gemini-3.5-flash","v1":{"ok":3,"n":80,"rate":3.8,"low":1.3,"high":10.5},"v2":{"ok":57,"n":80,"rate":71.3,"low":60.5,"high":80}},{"model":"gpt-5.4","v1":{"ok":77,"n":80,"rate":96.3,"low":89.5,"high":98.7},"v2":{"ok":80,"n":80,"rate":100,"low":95.4,"high":100}}],"sizeext":[{"model":"sonnet-4.5","condition":"A","cells":[{"bucket":"xl","ok":15,"n":15,"rate":100,"low":79.6,"high":100},{"bucket":"xxl","ok":14,"n":15,"rate":93.3,"low":70.2,"high":98.8},{"bucket":"xxxl","ok":12,"n":15,"rate":80,"low":54.8,"high":93}]},{"model":"sonnet-4.5","condition":"E","cells":[{"bucket":"xl","ok":8,"n":15,"rate":53.3,"low":30.1,"high":75.2},{"bucket":"xxl","ok":3,"n":15,"rate":20,"low":7,"high":45.2},{"bucket":"xxxl","ok":1,"n":15,"rate":6.7,"low":1.2,"high":29.8}]},{"model":"sonnet-4.5","condition":"F","cells":[{"bucket":"xl","ok":15,"n":15,"rate":100,"low":79.6,"high":100},{"bucket":"xxl","ok":15,"n":15,"rate":100,"low":79.6,"high":100},{"bucket":"xxxl","ok":13,"n":15,"rate":86.7,"low":62.1,"high":96.3}]},{"model":"gemini-3.5-flash","condition":"A","cells":[{"bucket":"xl","ok":9,"n":15,"rate":60,"low":35.7,"high":80.2},{"bucket":"xxl","ok":5,"n":15,"rate":33.3,"low":15.2,"high":58.3},{"bucket":"xxxl","ok":0,"n":15,"rate":0,"low":0,"high":20.4}]},{"model":"gemini-3.5-flash","condition":"E","cells":[{"bucket":"xl","ok":8,"n":15,"rate":53.3,"low":30.1,"high":75.2},{"bucket":"xxl","ok":3,"n":15,"rate":20,"low":7,"high":45.2},{"bucket":"xxxl","ok":2,"n":15,"rate":13.3,"low":3.7,"high":37.9}]},{"model":"gemini-3.5-flash","condition":"F","cells":[{"bucket":"xl","ok":14,"n":15,"rate":93.3,"low":70.2,"high":98.8},{"bucket":"xxl","ok":14,"n":15,"rate":93.3,"low":70.2,"high":98.8},{"bucket":"xxxl","ok":13,"n":15,"rate":86.7,"low":62.1,"high":96.3}]}]};
const CONDITIONS = ["A", "B", "C", "D", "E", "F"];
const COND_NAMES = {
	A: "HTML + rewrite", B: "JSON + rewrite", C: "JSON + tools",
	D: "HTML + tools", E: "JSON Patch",
	F: "anchored patch"
};
const COLOR = { A: "var(--s-a)", B: "var(--s-b)", C: "var(--s-c)", D: "var(--s-d)", E: "var(--s-e)", F: "var(--s-f)" };
const BUCKET_LABELS = ["~5 nodes", "~20", "~60", "~150"];
const BUCKET_KEYS = ["xs", "s", "m", "l"];

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

function legend(el) {
	document.getElementById(el).innerHTML = CONDITIONS.map(c =>
		`<span class="key"><span class="chip" style="background:${COLOR[c]}"></span><span class="code">${c}</span> ${COND_NAMES[c]}</span>`
	).join("");
}
legend("legend-1"); legend("legend-2"); legend("legend-3");

// --- shared tooltip ---
const tooltip = document.getElementById("tooltip");
function showTip(evt, text) {
	tooltip.textContent = text;
	tooltip.style.opacity = "1";
	const pad = 14;
	let x = evt.clientX + pad, y = evt.clientY + pad;
	const r = tooltip.getBoundingClientRect();
	if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
	if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
	tooltip.style.left = x + "px"; tooltip.style.top = y + "px";
}
function hideTip() { tooltip.style.opacity = "0"; }

// Resolve vertical label collisions: keep >= minGap between sorted positions.
function resolveLabels(items, minGap) {
	const sorted = [...items].sort((a, b) => a.y - b.y);
	for (let i = 1; i < sorted.length; i++) {
		if (sorted[i].y - sorted[i - 1].y < minGap) sorted[i].y = sorted[i - 1].y + minGap;
	}
	return items;
}

// --- generic multi-series line chart over the four size buckets ---
function lineChart(mount, opts) {
	const W = 880, H = 380, L = 56, R = 120, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const xs = BUCKET_KEYS.map((_, i) => L + (iw * i) / (BUCKET_KEYS.length - 1));
	const yOf = v => T + ih - ((v - opts.yMin) / (opts.yMax - opts.yMin)) * ih;
	let g = "";
	// grid + y ticks
	for (const tick of opts.ticks) {
		const y = yOf(tick);
		g += `<line x1="${L}" x2="${L + iw}" y1="${y}" y2="${y}" stroke="var(--grid)" stroke-width="1"/>`;
		g += `<text class="tick-label" x="${L - 8}" y="${y + 4}" text-anchor="end">${opts.fmt(tick)}</text>`;
	}
	// x labels
	BUCKET_LABELS.forEach((lab, i) => {
		g += `<text class="tick-label" x="${xs[i]}" y="${H - B + 22}" text-anchor="middle">${lab}</text>`;
	});
	g += `<text class="axis-label" x="${L + iw / 2}" y="${H - 6}" text-anchor="middle">tree size bucket</text>`;
	let marks = "", hits = "";
	const endLabels = [];
	CONDITIONS.forEach((c, ci) => {
		const series = opts.series[c];
		const jitter = (ci - 2) * 3;
		const pts = series.map((v, i) => ({ x: xs[i] + (opts.jitterCI ? jitter : 0), y: yOf(v.value), v }));
		// CI whiskers first (under the line)
		if (opts.jitterCI) {
			pts.forEach(p => {
				if (p.v.low === undefined) return;
				const y1 = yOf(p.v.low), y2 = yOf(p.v.high);
				marks += `<line x1="${p.x}" x2="${p.x}" y1="${y1}" y2="${y2}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
				marks += `<line x1="${p.x - 3}" x2="${p.x + 3}" y1="${y1}" y2="${y1}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
				marks += `<line x1="${p.x - 3}" x2="${p.x + 3}" y1="${y2}" y2="${y2}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.45"/>`;
			});
		}
		const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
		marks += `<path d="${path}" fill="none" stroke="${COLOR[c]}" stroke-width="2" stroke-linejoin="round"/>`;
		pts.forEach((p, i) => {
			marks += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${COLOR[c]}" stroke="var(--surface)" stroke-width="2"/>`;
			hits += `<circle cx="${p.x}" cy="${p.y}" r="13" fill="transparent" data-tip="${esc(opts.tip(c, i, p.v))}"/>`;
		});
		endLabels.push({ c, y: pts[pts.length - 1].y + 4, x: pts[pts.length - 1].x + 12 });
	});
	resolveLabels(endLabels, 15);
	let labels = "";
	for (const l of endLabels) {
		labels += `<text class="series-label" x="${l.x}" y="${l.y}" fill="${COLOR[l.c]}">${l.c} · ${opts.endLabel(l.c)}</text>`;
	}
	const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opts.aria)}" style="min-width:640px">${g}${marks}${labels}${hits}</svg>`;
	const el = document.getElementById(mount);
	el.innerHTML = svg;
	el.querySelectorAll("[data-tip]").forEach(n => {
		n.addEventListener("mousemove", e => showTip(e, n.dataset.tip));
		n.addEventListener("mouseleave", hideTip);
	});
}

// Chart 1 — crossover
lineChart("fig-crossover", {
	series: Object.fromEntries(CONDITIONS.map(c => [c, DATA.crossover[c].map(d => ({ value: d.rate, low: d.low, high: d.high, n: d.n, ok: d.ok }))])),
	yMin: 60, yMax: 100, ticks: [60, 70, 80, 90, 100],
	fmt: v => v + "%",
	jitterCI: true,
	tip: (c, i, v) => `${c} — ${COND_NAMES[c]}\n${BUCKET_LABELS[i]} bucket: ${v.value}%\n${v.ok}/${v.n} tasks · CI [${v.low}%, ${v.high}%]`,
	endLabel: c => DATA.crossover[c][3].rate + "%",
	aria: "Task success rate by tree size for the five conditions; rewrite conditions lead at every size."
});

// Chart 2 — tokens per solved task
lineChart("fig-tokens", {
	series: Object.fromEntries(CONDITIONS.map(c => [c, DATA.tokens[c].map(v => ({ value: v }))])),
	yMin: 0, yMax: 24000, ticks: [0, 6000, 12000, 18000, 24000],
	fmt: v => (v / 1000) + "k",
	jitterCI: false,
	tip: (c, i, v) => `${c} — ${COND_NAMES[c]}\n${BUCKET_LABELS[i]} bucket: ${v.value.toLocaleString()} tokens\nmean in+out per solved task`,
	endLabel: c => (DATA.tokens[c][3] / 1000).toFixed(1) + "k",
	aria: "Mean tokens per solved task by tree size; tool conditions cost four to five times more on small and medium trees."
});

// Chart 3 — reference dot plot
(function () {
	const W = 880, ROW = 64, T = 8, B = 40, L = 150, R = 24;
	const H = T + DATA.reference.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + (v / 100) * iw;
	let g = "";
	for (const tick of [0, 25, 50, 75, 100]) {
		const x = xOf(tick);
		g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="var(--grid)" stroke-width="1"/>`;
		g += `<text class="tick-label" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}%</text>`;
	}
	g += `<text class="axis-label" x="${L + iw / 2}" y="${H - 4}" text-anchor="middle">reference-task success (n = 40 per cell)</text>`;
	let marks = "", hits = "";
	DATA.reference.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += `<line x1="${L}" x2="${L + iw}" y1="${cy}" y2="${cy}" stroke="var(--hairline)" stroke-width="1"/>`;
		g += `<text class="row-label" x="${L - 12}" y="${cy + 4}" text-anchor="end">${row.model}</text>`;
		CONDITIONS.forEach(c => {
			const cell = row.cells[c];
			const x = xOf(cell.rate);
			marks += `<line x1="${xOf(cell.low)}" x2="${xOf(cell.high)}" y1="${cy}" y2="${cy}" stroke="${COLOR[c]}" stroke-width="1.5" opacity="0.4"/>`;
			marks += `<circle cx="${x}" cy="${cy}" r="5.5" fill="${COLOR[c]}" stroke="var(--surface)" stroke-width="2"/>`;
			hits += `<circle cx="${x}" cy="${cy}" r="13" fill="transparent" data-tip="${esc(`${c} — ${COND_NAMES[c]}\n${row.model}: ${cell.rate}%\n${cell.ok}/40 · CI [${cell.low}%, ${cell.high}%]`)}"/>`;
		});
	});
	const el = document.getElementById("fig-reference");
	el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Reference-task success per model and condition; tools conditions collapse for haiku and gemini." style="min-width:640px">${g}${marks}${hits}</svg>`;
	el.querySelectorAll("[data-tip]").forEach(n => {
		n.addEventListener("mousemove", e => showTip(e, n.dataset.tip));
		n.addEventListener("mouseleave", hideTip);
	});
})();

// Heatmap — per model × condition (sequential blue ramp, one hue)
(function () {
	const RAMP = [
		[74, "#cde2fb", "#0b0b0b"], [80, "#9ec5f4", "#0b0b0b"], [86, "#6da7ec", "#0b0b0b"],
		[91, "#3987e5", "#ffffff"], [94, "#256abf", "#ffffff"], [100, "#184f95", "#ffffff"]
	];
	const stepOf = v => RAMP.find(([max]) => v <= max);
	let html = `<table><thead><tr><th scope="col">model</th>${CONDITIONS.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`;
	for (const row of DATA.perModel) {
		html += `<tr><td>${row.model}</td>`;
		for (const c of CONDITIONS) {
			const v = row.cells[c];
			const [, bg, ink] = stepOf(v);
			html += `<td class="cell" style="background:${bg};color:${ink}">${v.toFixed(1)}%</td>`;
		}
		html += "</tr>";
	}
	html += "</tbody></table>";
	document.getElementById("fig-heat").innerHTML = html;
})();


// --- Study G footgun dumbbell ---
(function () {
	const W = 880, ROW = 64, T = 40, B = 44, L = 170, R = 30;
	const rows = [...DATA.footgun].sort((a, b) => a.v1.rate - b.v1.rate);
	const H = T + rows.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + (v / 100) * iw;
	let g = '';
	g += '<circle cx="' + L + '" cy="16" r="6" fill="var(--surface)" stroke="var(--s-c)" stroke-width="2.5"/><text class="tick-label" x="' + (L + 14) + '" y="20">v1 — tool calls hidden</text>';
	g += '<circle cx="' + (L + 220) + '" cy="16" r="6.5" fill="var(--s-a)" stroke="var(--surface)" stroke-width="2"/><text class="tick-label" x="' + (L + 234) + '" y="20">v2 — corrected history</text>';
	for (const tick of [0, 25, 50, 75, 100]) {
		const x = xOf(tick);
		g += '<line x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + x + '" y="' + (H - B + 20) + '" text-anchor="middle">' + tick + '%</text>';
	}
	let hits = '';
	rows.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += '<text class="row-label" x="' + (L - 12) + '" y="' + (cy + 4) + '" text-anchor="end">' + row.model + '</text>';
		g += '<line x1="' + xOf(row.v1.rate) + '" x2="' + xOf(row.v2.rate) + '" y1="' + cy + '" y2="' + cy + '" stroke="var(--s-c)" stroke-width="3" opacity="0.35"/>';
		g += '<circle cx="' + xOf(row.v1.rate) + '" cy="' + cy + '" r="6" fill="var(--surface)" stroke="var(--s-c)" stroke-width="2.5"/>';
		g += '<circle cx="' + xOf(row.v2.rate) + '" cy="' + cy + '" r="6.5" fill="var(--s-a)" stroke="var(--surface)" stroke-width="2"/>';
		hits += '<circle cx="' + xOf(row.v1.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(row.model + ' v1 (hidden history): ' + row.v1.rate + '% — ' + row.v1.ok + '/' + row.v1.n) + '"/>';
		hits += '<circle cx="' + xOf(row.v2.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(row.model + ' v2 (corrected): ' + row.v2.rate + '% — ' + row.v2.ok + '/' + row.v2.n) + '"/>';
	});
	const el = document.getElementById('fig-footgun');
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Reference-edit success per model with tool calls hidden from history versus corrected history." style="min-width:640px">' + g + hits + '</svg>';
	el.querySelectorAll('[data-tip]').forEach(n => { n.addEventListener('mousemove', e => showTip(e, n.dataset.tip)); n.addEventListener('mouseleave', hideTip); });
	table('tbl-footgun', ['model', 'v1 (hidden)', 'v2 (corrected)'], DATA.footgun.map(r => [r.model, r.v1.rate + '% (' + r.v1.ok + '/' + r.v1.n + ')', r.v2.rate + '% (' + r.v2.ok + '/' + r.v2.n + ')']));
})();

// --- Study H size extension ---
(function () {
	const el = document.getElementById('legend-4');
	el.innerHTML = ['A', 'E', 'F'].map(c =>
		'<span class="key"><span class="chip" style="background:' + COLOR[c] + '"></span><span class="code">' + c + '</span> ' + COND_NAMES[c] + '</span>'
	).join('') + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 380, L = 56, R = 170, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const SIZES = ['~300 nodes', '~600', '~1000'];
	const xs = SIZES.map((_, i) => L + (iw * i) / (SIZES.length - 1));
	const yOf = v => T + ih - (v / 100) * ih;
	let g = '';
	for (const tick of [0, 25, 50, 75, 100]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + tick + '%</text>';
	}
	SIZES.forEach((lab, i) => { g += '<text class="tick-label" x="' + xs[i] + '" y="' + (H - B + 22) + '" text-anchor="middle">' + lab + '</text>'; });
	let marks = '', hits = '';
	const endLabels = [];
	for (const series of DATA.sizeext) {
		const c = series.condition;
		const dashed = series.model.includes('gemini');
		const pts = series.cells.map((cell, i) => ({ x: xs[i], y: yOf(cell.rate), cell }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ') + '" fill="none" stroke="' + COLOR[c] + '" stroke-width="2" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach((p, i) => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + COLOR[c] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(c + ' — ' + COND_NAMES[c] + ' (' + series.model + ') — ' + SIZES[i] + ': ' + p.cell.rate + '% — ' + p.cell.ok + '/' + p.cell.n + ' · CI [' + p.cell.low + '%, ' + p.cell.high + '%]') + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ c, text: c + ' ' + (dashed ? 'gem' : 'son') + ' · ' + last.cell.rate + '%', x: last.x + 10, y: last.y + 4 });
	}
	resolveLabels(endLabels, 15);
	let labels = '';
	for (const l of endLabels) labels += '<text class="series-label" x="' + l.x + '" y="' + l.y + '" fill="' + COLOR[l.c] + '">' + l.text + '</text>';
	const el2 = document.getElementById('fig-sizeext');
	el2.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Task success at 300 to 1000 nodes: anchored patches hold for both models while rewrite falls to zero on the small model and positional patches decay." style="min-width:640px">' + g + marks + labels + hits + '</svg>';
	el2.querySelectorAll('[data-tip]').forEach(n => { n.addEventListener('mousemove', e => showTip(e, n.dataset.tip)); n.addEventListener('mouseleave', hideTip); });
	table('tbl-sizeext', ['series', ...SIZES], DATA.sizeext.map(s => [s.condition + ' — ' + s.model, ...s.cells.map(c => c.rate + '% (' + c.ok + '/' + c.n + ')')]));
})();

// --- Studies I/J focused views: input tokens by size ---
(function () {
	const VDATA = [
		{ model: 'sonnet-4.5', cond: 'F', name: 'full tree', tokens: [24365, 57585, 85642], ok: ['15/15', '15/15', '13/15'] },
		{ model: 'gemini-3.5-flash', cond: 'F', name: 'full tree', tokens: [20995, 39999, 70063], ok: ['14/15', '14/15', '13/15'] },
		{ model: 'sonnet-4.5', cond: 'FV', name: 'focused view', tokens: [2067, 2667, 3500], ok: ['15/15', '14/15', '14/15'] },
		{ model: 'gemini-3.5-flash', cond: 'FV', name: 'focused view', tokens: [2048, 2577, 3118], ok: ['14/15', '14/15', '14/15'] },
		{ model: 'sonnet-4.5', cond: 'FT', name: 'minimal view', tokens: [1331, 1491, 1531], ok: ['15/15', '15/15', '15/15'] },
		{ model: 'gemini-3.5-flash', cond: 'FT', name: 'minimal view', tokens: [1266, 1419, 1451], ok: ['13/15', '14/15', '14/15'] }
	];
	const VEXTRA = [
		{ model: 'sonnet-4.5', cond: 'FVH', name: 'focused view (HTML)', tokens: [1916, 2281, 2669], ok: ['15/15', '14/15', '14/15'] },
		{ model: 'gemini-3.5-flash', cond: 'FVH', name: 'focused view (HTML)', tokens: [1891, 2282, 2671], ok: ['14/15', '14/15', '14/15'] },
		{ model: 'sonnet-4.5', cond: 'FTH', name: 'minimal view (HTML)', tokens: [1281, 1376, 1391], ok: ['15/15', '15/15', '14/15'] },
		{ model: 'gemini-3.5-flash', cond: 'FTH', name: 'minimal view (HTML)', tokens: [1250, 1344, 1352], ok: ['13/15', '13/15', '14/15'] }
	];
	const VCOLOR = { F: 'var(--s-f)', FV: 'var(--s-c)', FT: 'var(--s-b)' };
	const VNAMES = { F: 'full tree in the prompt', FV: 'focused view (placeholders)', FT: 'minimal view (omission counts)' };
	document.getElementById('legend-5').innerHTML = ['F', 'FV', 'FT'].map(c =>
		'<span class="key"><span class="chip" style="background:' + VCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + VNAMES[c] + '</span>'
	).join('') + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 380, L = 64, R = 175, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const SIZES = ['~300 nodes', '~600', '~1000'];
	const xs = SIZES.map((_, i) => L + (iw * i) / (SIZES.length - 1));
	const yOf = v => T + ih - (v / 90000) * ih;
	let g = '';
	for (const tick of [0, 20000, 40000, 60000, 80000]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (tick / 1000) + 'k</text>';
	}
	SIZES.forEach((lab, i) => { g += '<text class="tick-label" x="' + xs[i] + '" y="' + (H - B + 22) + '" text-anchor="middle">' + lab + '</text>'; });
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">median input tokens per task (accuracy statistically identical across all rows)</text>';
	let marks = '', hits = '';
	const endLabels = [];
	for (const s of VDATA) {
		const dashed = s.model.includes('gemini');
		const pts = s.tokens.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ') + '" fill="none" stroke="' + VCOLOR[s.cond] + '" stroke-width="2" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach(p => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + VCOLOR[s.cond] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(s.cond + ' — ' + VNAMES[s.cond] + ' (' + s.model + ')\n' + SIZES[p.i] + ': ' + p.v.toLocaleString() + ' input tokens (median)\nsuccess ' + s.ok[p.i]) + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ c: s.cond, text: s.cond + ' ' + (dashed ? 'gem' : 'son') + ' · ' + (last.v >= 10000 ? (last.v / 1000).toFixed(1) + 'k' : (last.v / 1000).toFixed(1) + 'k'), x: last.x + 10, y: last.y + 4 });
	}
	resolveLabels(endLabels, 15);
	let labels = '';
	for (const l of endLabels) labels += '<text class="series-label" x="' + l.x + '" y="' + l.y + '" fill="' + VCOLOR[l.c] + '">' + l.text + '</text>';
	const el = document.getElementById('fig-views');
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Median input tokens by tree size: the full tree grows to 70 to 86 thousand tokens at 1000 nodes while focused and minimal views stay under 4 thousand, with accuracy unchanged." style="min-width:640px">' + g + marks + labels + hits + '</svg>';
	el.querySelectorAll('[data-tip]').forEach(n => { n.addEventListener('mousemove', e => showTip(e, n.dataset.tip)); n.addEventListener('mouseleave', hideTip); });
	table('tbl-views', ['input shown (model)', ...SIZES.map(s => s + ' — tokens · success')],
		[...VDATA, ...VEXTRA].map(s => [
			s.cond + ' ' + s.name + ' (' + s.model + ')',
			...s.tokens.map((v, i) => v.toLocaleString() + ' · ' + s.ok[i])
		]));
})();

// --- Study K sessions: drift by session third ---
(function () {
	const KDATA = [
		{ policy: 'K-once', name: 'tree shown once', model: 'sonnet-4.5', rate: [98.8, 92.5, 83.8], ok: ['79/80', '74/80', '67/80'], end: '8/20', tokens: '215.6k in + 0.7k out' },
		{ policy: 'K-once', name: 'tree shown once', model: 'gemini-3.5-flash', rate: [98.8, 100, 96.3], ok: ['79/80', '80/80', '77/80'], end: '17/20', tokens: '198.3k in + 0.6k out' },
		{ policy: 'K-refresh5', name: 'full re-serialize @ 6/11', model: 'sonnet-4.5', rate: [98.8, 92.5, 91.3], ok: ['79/80', '74/80', '73/80'], end: '11/20', tokens: '366.6k in + 0.7k out' },
		{ policy: 'K-refresh5', name: 'full re-serialize @ 6/11', model: 'gemini-3.5-flash', rate: [100, 100, 91.3], ok: ['80/80', '80/80', '73/80'], end: '15/20', tokens: '335.8k in + 0.6k out' },
		{ policy: 'K-view', name: 'fresh minimal view every turn', model: 'sonnet-4.5', rate: [100, 98.8, 100], ok: ['80/80', '79/80', '80/80'], end: '19/20', tokens: '55.7k in + 0.7k out' },
		{ policy: 'K-view', name: 'fresh minimal view every turn', model: 'gemini-3.5-flash', rate: [98.8, 100, 98.8], ok: ['79/80', '80/80', '79/80'], end: '19/20', tokens: '53.4k in + 0.7k out' },
		{ policy: 'K-rewrite', name: 'whole-tree rewrite', model: 'sonnet-4.5', rate: [97.2, 100, 94.4], ok: ['35/36', '36/36', '34/36'], end: '7/10', tokens: '836.0k in + 129.4k out' },
		{ policy: 'K-rewrite', name: 'whole-tree rewrite', model: 'gemini-3.5-flash', rate: [52.5, 67.5, 69.2], ok: ['21/40', '27/40', '27/39'], end: '2/10', tokens: '971.3k in + 138.1k out' }
	];
	const KCOLOR = { 'K-once': 'var(--s-c)', 'K-refresh5': 'var(--s-e)', 'K-view': 'var(--s-f)', 'K-rewrite': 'var(--s-a)' };
	const KNAMES = { 'K-once': 'tree shown once', 'K-refresh5': 'full refresh @ steps 6/11', 'K-view': 'fresh minimal view every turn', 'K-rewrite': 'whole-tree rewrite (anchor)' };
	document.getElementById('legend-6').innerHTML = Object.keys(KNAMES).map(p =>
		'<span class="key"><span class="chip" style="background:' + KCOLOR[p] + '"></span><span class="code">' + p + '</span> ' + KNAMES[p] + '</span>'
	).join('') + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 380, L = 56, R = 195, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const THIRDS = ['steps 1–4', 'steps 5–8', 'steps 9–12'];
	const xs = THIRDS.map((_, i) => L + (iw * i) / (THIRDS.length - 1));
	const yOf = v => T + ih - ((v - 50) / 50) * ih;
	let g = '';
	for (const tick of [50, 60, 70, 80, 90, 100]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + tick + '%</text>';
	}
	THIRDS.forEach((lab, i) => { g += '<text class="tick-label" x="' + xs[i] + '" y="' + (H - B + 22) + '" text-anchor="middle">' + lab + '</text>'; });
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">per-step success by session third (step judged on its own edit against the model’s current tree)</text>';
	let marks = '', hits = '';
	const endLabels = [];
	for (const s of KDATA) {
		const dashed = s.model.includes('gemini');
		const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ') + '" fill="none" stroke="' + KCOLOR[s.policy] + '" stroke-width="2" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach(p => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + KCOLOR[s.policy] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(s.policy + ' — ' + KNAMES[s.policy] + ' (' + s.model + ')\n' + THIRDS[p.i] + ': ' + p.v + '% (' + s.ok[p.i] + ')\nend-state intact: ' + s.end + ' · ' + s.tokens + '/session') + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ c: s.policy, text: s.policy.replace('K-', '') + ' ' + (dashed ? 'gem' : 'son') + ' · ' + last.v + '%', x: last.x + 10, y: last.y + 4 });
	}
	resolveLabels(endLabels, 15);
	let labels = '';
	for (const l of endLabels) labels += '<text class="series-label" x="' + l.x + '" y="' + l.y + '" fill="' + KCOLOR[l.c] + '">' + l.text + '</text>';
	const el = document.getElementById('fig-sessions');
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Per-step success across session thirds: serialize-once decays to 83.8 percent on sonnet while per-turn views stay flat near 100 percent; gemini whole-tree rewrite sessions run at 52 to 69 percent." style="min-width:640px">' + g + marks + labels + hits + '</svg>';
	el.querySelectorAll('[data-tip]').forEach(n => { n.addEventListener('mousemove', e => showTip(e, n.dataset.tip)); n.addEventListener('mouseleave', hideTip); });
	table('tbl-sessions', ['policy (model)', ...THIRDS, 'end-state intact', 'mean tokens/session'],
		KDATA.map(s => [
			s.policy + ' ' + s.name + ' (' + s.model + ')',
			...s.rate.map((v, i) => v + '% (' + s.ok[i] + ')'),
			s.end, s.tokens
		]));
})();

// --- Study L: grounding dot plot ---
(function () {
	const LCOND = ["oracle", "LG-full", "LG-nav", "LG-lex"];
	const LNAMES = {
		oracle: "oracle bound (ids in instructions, Study I)",
		"LG-full": "grounded · full tree shown",
		"LG-nav": "grounded · navigate (expand_node)",
		"LG-lex": "grounded · naive lexical retrieval"
	};
	const LCOLOR = { oracle: "var(--s-f)", "LG-full": "var(--s-a)", "LG-nav": "var(--s-e)", "LG-lex": "var(--s-c)" };
	const LDATA = [
		{ model: "sonnet-4.5", cells: {
			oracle: { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "" },
			"LG-full": { ok: 39, rate: 86.7, low: 73.8, high: 93.7, note: "median input 90k @ ~1000 nodes" },
			"LG-nav": { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "median 54 expands; 356k input @ ~1000 nodes" },
			"LG-lex": { ok: 27, rate: 60.0, low: 45.5, high: 73.0, note: "~2.5k input; 34/38 failures misgrounded" }
		}},
		{ model: "gemini-3.5-flash", cells: {
			oracle: { ok: 41, rate: 91.1, low: 79.3, high: 96.5, note: "" },
			"LG-full": { ok: 38, rate: 84.4, low: 71.2, high: 92.3, note: "median input 70k @ ~1000 nodes" },
			"LG-nav": { ok: 23, rate: 51.1, low: 37.0, high: 65.0, note: "budget exhaustion; up to 636k input" },
			"LG-lex": { ok: 25, rate: 55.6, low: 41.2, high: 69.1, note: "~2.4k input" }
		}}
	];
	document.getElementById("legend-7").innerHTML = LCOND.map(c =>
		'<span class="key"><span class="chip" style="background:' + LCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + LNAMES[c] + '</span>'
	).join("");
	const W = 880, ROW = 64, T = 8, B = 40, L = 150, R = 24;
	const H = T + LDATA.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + ((v - 30) / 70) * iw;
	let g = "";
	for (const tick of [30, 40, 50, 60, 70, 80, 90, 100]) {
		const x = xOf(tick);
		g += '<line x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + x + '" y="' + (H - B + 20) + '" text-anchor="middle">' + tick + '%</text>';
	}
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">task success on grounded (id-free) instructions, 45 tasks per cell</text>';
	let marks = "", hits = "";
	LDATA.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + cy + '" y2="' + cy + '" stroke="var(--hairline)" stroke-width="1"/>';
		g += '<text class="row-label" x="' + (L - 12) + '" y="' + (cy + 4) + '" text-anchor="end">' + row.model + '</text>';
		for (const c of LCOND) {
			const cell = row.cells[c];
			marks += '<line x1="' + xOf(cell.low) + '" x2="' + xOf(cell.high) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + LCOLOR[c] + '" stroke-width="1.5" opacity="0.4"/>';
			marks += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="5.5" fill="' + LCOLOR[c] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(c + ' — ' + LNAMES[c] + '\n' + row.model + ': ' + cell.rate + '% (' + cell.ok + '/45) · CI [' + cell.low + '%, ' + cell.high + '%]' + (cell.note ? '\n' + cell.note : '')) + '"/>';
		}
	});
	const el = document.getElementById("fig-grounding");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Grounded-instruction success per model: full-tree grounding sits 7 to 9 points under the oracle bound; navigation matches the oracle on sonnet but collapses on gemini; lexical retrieval is the floor." style="min-width:640px">' + g + marks + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-grounding", ["condition (model)", "success", "median input @ ~1000 nodes", "failure anatomy (pooled)"],
		[
			["oracle — sonnet-4.5", "43/45 (95.6%)", "85,642", "—"],
			["oracle — gemini-3.5-flash", "41/45 (91.1%)", "70,063", "—"],
			["LG-full — sonnet-4.5", "39/45 (86.7%)", "90,254", "misgrounded ×8, mechanics ×5 (both models)"],
			["LG-full — gemini-3.5-flash", "38/45 (84.4%)", "70,054", "(see above)"],
			["LG-nav — sonnet-4.5", "43/45 (95.6%) · 54 median expands", "355,643", "invalid ×20, misgrounded ×2, mechanics ×2 (both models)"],
			["LG-nav — gemini-3.5-flash", "23/45 (51.1%) · 58 median expands", "636,030", "(see above)"],
			["LG-lex — sonnet-4.5", "27/45 (60.0%)", "2,695", "misgrounded ×34, mechanics ×4 (both models)"],
			["LG-lex — gemini-3.5-flash", "25/45 (55.6%)", "2,659", "(see above)"]
		]);
})();

// --- Study M: memory tercile lines ---
(function () {
	const MDATA = [
		{ policy: "K-view", name: "full history + per-turn view", model: "sonnet-4.5", rate: [100, 98.8, 100], ok: ["80/80", "79/80", "80/80"], end: "19/20", shape: "1.2k → 8.1k per step" },
		{ policy: "K-view", name: "full history + per-turn view", model: "gemini-3.5-flash", rate: [98.8, 100, 98.8], ok: ["79/80", "80/80", "79/80"], end: "19/20", shape: "1.2k → 7.8k per step" },
		{ policy: "M-window", name: "2-exchange window", model: "sonnet-4.5", rate: [100, 98.8, 95.0], ok: ["80/80", "79/80", "76/80"], end: "16/20", shape: "1.2k → 2.7k per step" },
		{ policy: "M-window", name: "2-exchange window", model: "gemini-3.5-flash", rate: [100, 98.8, 95.0], ok: ["80/80", "79/80", "76/80"], end: "15/20", shape: "1.2k → 2.6k per step" },
		{ policy: "M-stateless", name: "no history at all", model: "sonnet-4.5", rate: [98.8, 95.0, 96.3], ok: ["79/80", "76/80", "77/80"], end: "13/20", shape: "flat ~1.3k per step" },
		{ policy: "M-stateless", name: "no history at all", model: "gemini-3.5-flash", rate: [98.8, 100, 92.5], ok: ["79/80", "80/80", "74/80"], end: "14/20", shape: "flat ~1.3k per step" }
	];
	const MCOLOR = { "K-view": "var(--s-f)", "M-window": "var(--s-e)", "M-stateless": "var(--s-c)" };
	const MNAMES = { "K-view": "full history + per-turn view (Study K)", "M-window": "2-exchange window", "M-stateless": "no history at all" };
	document.getElementById("legend-8").innerHTML = Object.keys(MNAMES).map(p =>
		'<span class="key"><span class="chip" style="background:' + MCOLOR[p] + '"></span><span class="code">' + p + '</span> ' + MNAMES[p] + '</span>'
	).join("") + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 340, L = 56, R = 205, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const THIRDS = ["steps 1–4", "steps 5–8", "steps 9–12"];
	const xs = THIRDS.map((_, i) => L + (iw * i) / (THIRDS.length - 1));
	const yOf = v => T + ih - ((v - 88) / 12) * ih;
	let g = "";
	for (const tick of [88, 92, 96, 100]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + tick + '%</text>';
	}
	THIRDS.forEach((lab, i) => { g += '<text class="tick-label" x="' + xs[i] + '" y="' + (H - B + 22) + '" text-anchor="middle">' + lab + '</text>'; });
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">per-step success by session third (note the zoomed 88–100% scale)</text>';
	let marks = "", hits = "";
	const endLabels = [];
	for (const s of MDATA) {
		const dashed = s.model.includes("gemini");
		const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") + '" fill="none" stroke="' + MCOLOR[s.policy] + '" stroke-width="2" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach(p => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + MCOLOR[s.policy] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(s.policy + ' — ' + MNAMES[s.policy] + ' (' + s.model + ')\n' + THIRDS[p.i] + ': ' + p.v + '% (' + s.ok[p.i] + ')\nend-state intact ' + s.end + ' · input ' + s.shape) + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ c: s.policy, text: s.policy.replace("M-", "").replace("K-", "") + " " + (dashed ? "gem" : "son") + " · " + last.v + "%", x: last.x + 10, y: last.y + 4 });
	}
	resolveLabels(endLabels, 15);
	let labels = "";
	for (const l of endLabels) labels += '<text class="series-label" x="' + l.x + '" y="' + l.y + '" fill="' + MCOLOR[l.c] + '">' + l.text + '</text>';
	const el = document.getElementById("fig-memory");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Per-step success across session thirds for full history, a two-exchange window, and no history: statelessness degrades late-session accuracy despite identical per-turn views." style="min-width:640px">' + g + marks + labels + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-memory", ["policy (model)", ...THIRDS, "end-state intact", "input per step"],
		MDATA.map(s => [
			s.policy + " " + s.name + " (" + s.model + ")",
			...s.rate.map((v, i) => v + "% (" + s.ok[i] + ")"),
			s.end, s.shape
		]));
})();

// --- Study N: retrieval ladder dot plot ---
(function () {
	const NCOND = ["oracle", "LG-full", "N-search", "N-ground2x", "N-embed"];
	const NNAMES = {
		oracle: "oracle bound (ids in instructions, Study I)",
		"LG-full": "grounded · full tree shown (Study L)",
		"N-search": "grounded · find_nodes search tool",
		"N-ground2x": "grounded · cheap model grounds, sonnet patches",
		"N-embed": "grounded · embedding retrieval (no agent)"
	};
	const NCOLOR = { oracle: "var(--s-f)", "LG-full": "var(--s-a)", "N-search": "var(--s-b)", "N-ground2x": "var(--s-e)", "N-embed": "var(--s-c)" };
	const NDATA = [
		{ model: "sonnet-4.5", cells: {
			oracle: { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "" },
			"LG-full": { ok: 39, rate: 86.7, low: 73.8, high: 93.7, note: "median input 90k @ ~1000 nodes" },
			"N-search": { ok: 43, rate: 95.6, low: 85.2, high: 98.8, note: "median 1 search call · ~6.5k input @ ~1000 nodes\nsame two failures as the oracle-matching nav arm" },
			"N-ground2x": { ok: 41, rate: 91.1, low: 79.3, high: 96.5, note: "gemini grounds (45/45 valid) · sonnet-side median input 1,484 tokens (−97.4%)" },
			"N-embed": { ok: 25, rate: 55.6, low: 41.2, high: 69.1, note: "top-5 target coverage 23/45 — no better than keyword overlap (24/45)" }
		}},
		{ model: "gemini-3.5-flash", cells: {
			oracle: { ok: 41, rate: 91.1, low: 79.3, high: 96.5, note: "" },
			"LG-full": { ok: 38, rate: 84.4, low: 71.2, high: 92.3, note: "median input 70k @ ~1000 nodes" },
			"N-search": { ok: 39, rate: 86.7, low: 73.8, high: 93.7, note: "median 1 search call · ~3.7k input @ ~1000 nodes\nvs 23/45 navigating (16–0 paired, p < 0.001)" },
			"N-embed": { ok: 24, rate: 53.3, low: 39.1, high: 67.1, note: "statistically identical to the lexical floor" }
		}}
	];
	document.getElementById("legend-9").innerHTML = NCOND.map(c =>
		'<span class="key"><span class="chip" style="background:' + NCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + NNAMES[c] + '</span>'
	).join("");
	const W = 880, ROW = 64, T = 8, B = 40, L = 150, R = 24;
	const H = T + NDATA.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + ((v - 30) / 70) * iw;
	let g = "";
	for (const tick of [30, 40, 50, 60, 70, 80, 90, 100]) {
		const x = xOf(tick);
		g += '<line x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + x + '" y="' + (H - B + 20) + '" text-anchor="middle">' + tick + '%</text>';
	}
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">task success on grounded (id-free) instructions, 45 tasks per cell</text>';
	let marks = "", hits = "";
	NDATA.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + cy + '" y2="' + cy + '" stroke="var(--hairline)" stroke-width="1"/>';
		g += '<text class="row-label" x="' + (L - 12) + '" y="' + (cy + 4) + '" text-anchor="end">' + row.model + '</text>';
		for (const c of NCOND) {
			const cell = row.cells[c];
			if (!cell) continue;
			marks += '<line x1="' + xOf(cell.low) + '" x2="' + xOf(cell.high) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + NCOLOR[c] + '" stroke-width="1.5" opacity="0.4"/>';
			marks += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="5.5" fill="' + NCOLOR[c] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(c + ' — ' + NNAMES[c] + '\n' + row.model + ': ' + cell.rate + '% (' + cell.ok + '/45) · CI [' + cell.low + '%, ' + cell.high + '%]' + (cell.note ? '\n' + cell.note : '')) + '"/>';
		}
	});
	const el = document.getElementById("fig-retrieval");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Grounded-instruction success per model on the retrieval ladder: the find_nodes search tool matches the oracle bound on sonnet and full-tree grounding on gemini at a median of one call; embedding retrieval sits at the lexical floor; cheap-model grounding preserves accuracy with 97% less frontier input." style="min-width:640px">' + g + marks + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-retrieval", ["condition (model)", "success", "median input @ ~1000 nodes", "mechanism"],
		[
			["N-search — sonnet-4.5", "43/45 (95.6%)", "6,550", "median 1 find_nodes call; failures: misgrounded ×5, mechanics ×3 (both models)"],
			["N-search — gemini-3.5-flash", "39/45 (86.7%)", "3,741", "vs LG-nav 23/45: 16–0 paired, p < 0.001"],
			["N-embed — sonnet-4.5", "25/45 (55.6%)", "3,076", "top-5 covers targets 23/45 vs lexical 24/45; 39/41 failures misgrounded"],
			["N-embed — gemini-3.5-flash", "24/45 (53.3%)", "2,845", "(see above)"],
			["N-ground2 — sonnet-4.5", "41/45 (91.1%)", "79,511", "same-model two-stage: accuracy holds, total savings only 18%"],
			["N-ground2 — gemini-3.5-flash", "37/45 (82.2%)", "71,404", "same-model two-stage: total savings 5%"],
			["N-ground2x — gemini grounds, sonnet patches", "41/45 (91.1%)", "71,497 total · 1,484 sonnet-side", "grounder coverage identical across tiers (41/45 both)"]
		]);
})();

// --- Study O: positional views dot plot ---
(function () {
	const OCOND = ["K-view", "O-view", "M-stateless", "O-stateless"];
	const ONAMES = {
		"K-view": "full history, plain view (Study K)",
		"O-view": "full history + positions",
		"M-stateless": "no history, plain view (Study M)",
		"O-stateless": "no history + positions"
	};
	const OCOLOR = { "K-view": "var(--s-f)", "O-view": "var(--s-e)", "M-stateless": "var(--s-c)", "O-stateless": "var(--s-b)" };
	const ODATA = [
		{ model: "sonnet-4.5", cells: {
			"K-view": { ok: "80/80", rate: 100.0, low: 95.4, high: 100.0, end: "19/20", note: "" },
			"O-view": { ok: "79/80", rate: 98.8, low: 93.3, high: 99.8, end: "19/20", note: "1–1 paired vs K-view, p = 1.0" },
			"M-stateless": { ok: "77/80", rate: 96.3, low: 89.5, high: 98.7, end: "13/20", note: "all stateless-only failures are placements" },
			"O-stateless": { ok: "77/80", rate: 96.3, low: 89.5, high: 98.7, end: "15/20", note: "3–1 paired vs M-stateless, p = 0.625 — positions printed, still misplaced" }
		}},
		{ model: "gemini-3.5-flash", cells: {
			"K-view": { ok: "79/80", rate: 98.8, low: 93.3, high: 99.8, end: "19/20", note: "" },
			"O-view": { ok: "80/80", rate: 100.0, low: 95.4, high: 100.0, end: "20/20", note: "best cell in the series; 2–0 vs K-view, p = 0.5 (n.s.)" },
			"M-stateless": { ok: "74/80", rate: 92.5, low: 84.6, high: 96.5, end: "14/20", note: "" },
			"O-stateless": { ok: "75/80", rate: 93.8, low: 86.2, high: 97.3, end: "15/20", note: "1–0 paired vs M-stateless, p = 1.0" }
		}}
	];
	document.getElementById("legend-10").innerHTML = OCOND.map(c =>
		'<span class="key"><span class="chip" style="background:' + OCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + ONAMES[c] + '</span>'
	).join("");
	const W = 880, ROW = 64, T = 8, B = 40, L = 150, R = 24;
	const H = T + ODATA.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + ((v - 84) / 16) * iw;
	let g = "";
	for (const tick of [84, 88, 92, 96, 100]) {
		const x = xOf(tick);
		g += '<line x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + x + '" y="' + (H - B + 20) + '" text-anchor="middle">' + tick + '%</text>';
	}
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">late-session (steps 9–12) per-step success — the window where statelessness fails (zoomed 84–100% scale)</text>';
	let marks = "", hits = "";
	ODATA.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + cy + '" y2="' + cy + '" stroke="var(--hairline)" stroke-width="1"/>';
		g += '<text class="row-label" x="' + (L - 12) + '" y="' + (cy + 4) + '" text-anchor="end">' + row.model + '</text>';
		for (const c of OCOND) {
			const cell = row.cells[c];
			marks += '<line x1="' + xOf(cell.low) + '" x2="' + xOf(Math.min(cell.high, 100)) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + OCOLOR[c] + '" stroke-width="1.5" opacity="0.4"/>';
			marks += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="5.5" fill="' + OCOLOR[c] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(c + ' — ' + ONAMES[c] + '\n' + row.model + ' steps 9–12: ' + cell.rate + '% (' + cell.ok + ') · CI [' + cell.low + '%, ' + cell.high + '%]\nend-state intact ' + cell.end + (cell.note ? '\n' + cell.note : '')) + '"/>';
		}
	});
	const el = document.getElementById("fig-positions");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Late-session per-step success for the history-by-positions two-by-two: position annotations barely move stateless accuracy while full history stays at the top; positions plus history is descriptively best but not significantly better." style="min-width:640px">' + g + marks + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-positions", ["policy (model)", "steps 9–12", "placements, steps 5–12", "end-state intact", "input per step"],
		[
			["K-view (sonnet)", "100% (80/80)", "59/60", "19/20", "1.2k → 8.1k"],
			["O-view (sonnet)", "98.8% (79/80)", "59/60", "19/20", "1.3k → 8.8k"],
			["M-stateless (sonnet)", "96.3% (77/80)", "53/60", "13/20", "flat ~1.3k"],
			["O-stateless (sonnet)", "96.3% (77/80)", "54/60", "15/20", "flat ~1.4k (+9% for positions)"],
			["K-view (gemini)", "98.8% (79/80)", "59/60", "19/20", "1.2k → 7.8k"],
			["O-view (gemini)", "100% (80/80)", "60/60", "20/20", "1.3k → 8.4k"],
			["M-stateless (gemini)", "92.5% (74/80)", "54/60", "14/20", "flat ~1.2k"],
			["O-stateless (gemini)", "93.8% (75/80)", "55/60", "15/20", "flat ~1.4k"]
		]);
})();

// --- Study P: synthetic history dot plot (late-session window) ---
(function () {
	const PCOND = ["K-view", "P-canned", "P-system", "M-stateless"];
	const PNAMES = {
		"K-view": "full history (Study K)",
		"P-canned": "no history + examples as fake turns",
		"P-system": "no history + examples in system prompt",
		"M-stateless": "no history, no examples (Study M)"
	};
	const PCOLOR = { "K-view": "var(--s-f)", "P-canned": "var(--s-b)", "P-system": "var(--s-e)", "M-stateless": "var(--s-c)" };
	const PDATA = [
		{ model: "sonnet-4.5", cells: {
			"K-view": { ok: "80/80", rate: 100.0, low: 95.4, high: 100.0, end: "19/20", note: "" },
			"P-canned": { ok: "79/80", rate: 98.8, low: 93.3, high: 99.8, end: "18/20", note: "vs K-view 1–0, p = 1.0 · vs M-stateless 7–1, p = 0.070" },
			"P-system": { ok: "78/80", rate: 97.5, low: 91.3, high: 99.3, end: "18/20", note: "vs K-view 2–0, p = 0.5 · ties P-canned" },
			"M-stateless": { ok: "77/80", rate: 96.3, low: 89.5, high: 98.7, end: "13/20", note: "" }
		}},
		{ model: "gemini-3.5-flash", cells: {
			"K-view": { ok: "79/80", rate: 98.8, low: 93.3, high: 99.8, end: "19/20", note: "" },
			"P-canned": { ok: "80/80", rate: 100.0, low: 95.4, high: 100.0, end: "20/20", note: "vs M-stateless 7–0, p = 0.016 · 60/60 late placements · output bloat 309 → 55 tok/step" },
			"P-system": { ok: "79/80", rate: 98.8, low: 93.3, high: 99.8, end: "19/20", note: "vs M-stateless 6–0, p = 0.031" },
			"M-stateless": { ok: "74/80", rate: 92.5, low: 84.6, high: 96.5, end: "14/20", note: "" }
		}}
	];
	document.getElementById("legend-11").innerHTML = PCOND.map(c =>
		'<span class="key"><span class="chip" style="background:' + PCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + PNAMES[c] + '</span>'
	).join("");
	const W = 880, ROW = 64, T = 8, B = 40, L = 150, R = 24;
	const H = T + PDATA.length * ROW + B;
	const iw = W - L - R;
	const xOf = v => L + ((v - 84) / 16) * iw;
	let g = "";
	for (const tick of [84, 88, 92, 96, 100]) {
		const x = xOf(tick);
		g += '<line x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + x + '" y="' + (H - B + 20) + '" text-anchor="middle">' + tick + '%</text>';
	}
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">late-session (steps 9–12) per-step success (zoomed 84–100% scale)</text>';
	let marks = "", hits = "";
	PDATA.forEach((row, ri) => {
		const cy = T + ri * ROW + ROW / 2;
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + cy + '" y2="' + cy + '" stroke="var(--hairline)" stroke-width="1"/>';
		g += '<text class="row-label" x="' + (L - 12) + '" y="' + (cy + 4) + '" text-anchor="end">' + row.model + '</text>';
		for (const c of PCOND) {
			const cell = row.cells[c];
			marks += '<line x1="' + xOf(cell.low) + '" x2="' + xOf(Math.min(cell.high, 100)) + '" y1="' + cy + '" y2="' + cy + '" stroke="' + PCOLOR[c] + '" stroke-width="1.5" opacity="0.4"/>';
			marks += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="5.5" fill="' + PCOLOR[c] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + xOf(cell.rate) + '" cy="' + cy + '" r="13" fill="transparent" data-tip="' + esc(c + ' — ' + PNAMES[c] + '\n' + row.model + ' steps 9–12: ' + cell.rate + '% (' + cell.ok + ') · CI [' + cell.low + '%, ' + cell.high + '%]\nend-state intact ' + cell.end + (cell.note ? '\n' + cell.note : '')) + '"/>';
		}
	});
	const el = document.getElementById("fig-teaching");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Late-session per-step success: stateless sessions with two canned worked examples match full history on both models, in both delivery framings, while plain stateless lags." style="min-width:640px">' + g + marks + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-teaching", ["policy (model)", "steps 9–12", "placements, steps 5–12", "end-state intact", "tokens/session"],
		[
			["K-view (sonnet)", "100% (80/80)", "59/60", "19/20", "55,746 in"],
			["P-canned (sonnet)", "98.8% (79/80)", "58/60", "18/20", "26,921 in"],
			["P-system (sonnet)", "97.5% (78/80)", "57/60", "18/20", "26,598 in"],
			["M-stateless (sonnet)", "96.3% (77/80)", "53/60", "13/20", "17,888 in"],
			["K-view (gemini)", "98.8% (79/80)", "59/60", "19/20", "53,358 in"],
			["P-canned (gemini)", "100% (80/80)", "60/60", "20/20", "26,051 in"],
			["P-system (gemini)", "98.8% (79/80)", "59/60", "19/20", "25,921 in"],
			["M-stateless (gemini)", "92.5% (74/80)", "54/60", "14/20", "15,752 in + 3,709 out (bloat)"]
		]);
})();

// --- Study Q: fan-out collapse lines ---
(function () {
	const QDATA = [
		{ cond: "Q-view", name: "oracle retrieval (all targets in view)", model: "sonnet-4.5", rate: [92.9, 69.2, 50.0], ok: ["13/14", "9/13", "9/18"] },
		{ cond: "Q-view", name: "oracle retrieval (all targets in view)", model: "gemini-3.5-flash", rate: [92.9, 53.8, 44.4], ok: ["13/14", "7/13", "8/18"] },
		{ cond: "Q-full", name: "whole tree in prompt", model: "sonnet-4.5", rate: [85.7, 30.8, 33.3], ok: ["12/14", "4/13", "6/18"] },
		{ cond: "Q-full", name: "whole tree in prompt", model: "gemini-3.5-flash", rate: [100.0, 69.2, 72.2], ok: ["14/14", "9/13", "13/18"] },
		{ cond: "Q-search", name: "find_nodes recipe (barkup 0.4, untuned)", model: "sonnet-4.5", rate: [85.7, 46.2, 16.7], ok: ["12/14", "6/13", "3/18"] },
		{ cond: "Q-search", name: "find_nodes recipe (barkup 0.4, untuned)", model: "gemini-3.5-flash", rate: [85.7, 46.2, 38.9], ok: ["12/14", "6/13", "7/18"] },
		{ cond: "R-decomp", name: "app-side decomposition (Study R, both models)", model: "both", rate: [100.0, 100.0, 100.0], ok: ["28/28", "26/26", "36/36"] }
	];
	const QCOLOR = { "Q-view": "var(--s-e)", "Q-full": "var(--s-a)", "Q-search": "var(--s-b)", "R-decomp": "var(--s-f)" };
	const QNAMES = { "Q-view": "oracle retrieval", "Q-full": "whole tree", "Q-search": "search recipe", "R-decomp": "decomposition (Study R)" };
	document.getElementById("legend-12").innerHTML = Object.keys(QNAMES).map(c =>
		'<span class="key"><span class="chip" style="background:' + QCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + QNAMES[c] + '</span>'
	).join("") + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 360, L = 56, R = 215, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const BINS = ["2–3 targets", "4–6 targets", "7+ targets"];
	const xs = BINS.map((_, i) => L + (iw * i) / (BINS.length - 1));
	const yOf = v => T + ih - ((v - 10) / 90) * ih;
	let g = "";
	for (const tick of [10, 25, 50, 75, 100]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + tick + '%</text>';
	}
	BINS.forEach((lab, i) => { g += '<text class="tick-label" x="' + xs[i] + '" y="' + (H - B + 22) + '" text-anchor="middle">' + lab + '</text>'; });
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">task success by target count (45 fan-out tasks per condition per model)</text>';
	let marks = "", hits = "";
	const endLabels = [];
	for (const s of QDATA) {
		const dashed = s.model.includes("gemini");
		const both = s.model === "both";
		const pts = s.rate.map((v, i) => ({ x: xs[i], y: yOf(v), v, i }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") + '" fill="none" stroke="' + QCOLOR[s.cond] + '" stroke-width="' + (both ? 3 : 2) + '" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach(p => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + QCOLOR[s.cond] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(s.cond + ' — ' + s.name + '\n' + BINS[p.i] + ': ' + p.v + '% (' + s.ok[p.i] + ')') + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ c: s.cond, text: (both ? "decomp both" : s.cond.replace("Q-", "") + " " + (dashed ? "gem" : "son")) + " · " + last.v + "%", x: last.x + 10, y: last.y + 4 });
	}
	resolveLabels(endLabels, 15);
	let labels = "";
	for (const l of endLabels) labels += '<text class="series-label" x="' + l.x + '" y="' + l.y + '" fill="' + QCOLOR[l.c] + '">' + l.text + '</text>';
	const el = document.getElementById("fig-fanout");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Fan-out task success falls with target count in every condition: even oracle retrieval drops to about half at seven-plus targets, and the models invert between view and whole-tree strategies." style="min-width:640px">' + g + marks + labels + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-fanout", ["condition (model)", "overall", "2–3", "4–6", "7+", "failure anatomy", "median input @ ~1000 nodes"],
		[
			["Q-view (sonnet)", "31/45 (68.9%)", "13/14", "9/13", "9/18", "partial ×14 (mean coverage 47%)", "2,023"],
			["Q-view (gemini)", "28/45 (62.2%)", "13/14", "7/13", "8/18", "partial ×17 (mean coverage 35%)", "1,894"],
			["Q-full (sonnet)", "22/45 (48.9%)", "12/14", "4/13", "6/18", "partial ×14, collateral ×9", "85,628"],
			["Q-full (gemini)", "36/45 (80.0%)", "14/14", "9/13", "13/18", "partial ×5, collateral ×4", "70,071"],
			["Q-search (sonnet)", "21/45 (46.7%)", "12/14", "6/13", "3/18", "partial ×21, collateral ×2, invalid ×1 · median 6 calls", "14,514 (18/45 runs > 100k)"],
			["Q-search (gemini)", "25/45 (55.6%)", "12/14", "6/13", "7/18", "partial ×13, invalid ×5, collateral ×2 · median 6 calls", "24,995 (16/45 runs > 100k)"],
			["R-decomp (sonnet)", "45/45 (100%)", "14/14", "13/13", "18/18", "none — 337/337 subtasks", "7,974"],
			["R-decomp (gemini)", "45/45 (100%)", "14/14", "13/13", "18/18", "none — 337/337 subtasks", "7,731"]
		]);
})();

// --- Study S: long-session cost divergence lines ---
(function () {
	const STEPS = [1, 6, 12, 18, 24, 30, 36];
	const SDATA = [
		{ cond: "S-view", model: "sonnet-4.5", tok: [1250, 4693, 8325, 11955, 15855, 20164, 23614], acc: "360/360 steps" },
		{ cond: "S-view", model: "gemini-3.5-flash", tok: [1216, 4519, 8012, 11522, 15187, 19279, 22581], acc: "359/360 steps" },
		{ cond: "S-system", model: "sonnet-4.5", tok: [2124, 2160, 2085, 2120, 2276, 2547, 2190], acc: "357/360 steps" },
		{ cond: "S-system", model: "gemini-3.5-flash", tok: [2083, 2107, 2031, 2065, 2232, 2485, 2130], acc: "356/360 steps" }
	];
	const SCOLOR = { "S-view": "var(--s-f)", "S-system": "var(--s-e)" };
	const SNAMES = { "S-view": "full history + fresh view per turn (K-view recipe)", "S-system": "no history + two worked examples (P-system recipe)" };
	document.getElementById("legend-13").innerHTML = Object.keys(SNAMES).map(c =>
		'<span class="key"><span class="chip" style="background:' + SCOLOR[c] + '"></span><span class="code">' + c + '</span> ' + SNAMES[c] + '</span>'
	).join("") + '<span class="key">solid = sonnet-4.5 · dashed = gemini-3.5-flash</span>';
	const W = 880, H = 360, L = 64, R = 170, T = 16, B = 44;
	const iw = W - L - R, ih = H - T - B;
	const xOf = s => L + (iw * (s - 1)) / 35;
	const yOf = v => T + ih - (v / 25000) * ih;
	let g = "";
	for (const tick of [0, 5000, 10000, 15000, 20000, 25000]) {
		const y = yOf(tick);
		g += '<line x1="' + L + '" x2="' + (L + iw) + '" y1="' + y + '" y2="' + y + '" stroke="var(--grid)" stroke-width="1"/>';
		g += '<text class="tick-label" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (tick / 1000) + 'k</text>';
	}
	for (const s of STEPS) {
		g += '<text class="tick-label" x="' + xOf(s) + '" y="' + (H - B + 22) + '" text-anchor="middle">' + s + '</text>';
	}
	g += '<text class="axis-label" x="' + (L + iw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">median input tokens per step across a 36-edit session (accuracy at parity throughout)</text>';
	let marks = "", hits = "";
	const endLabels = [];
	for (const s of SDATA) {
		const dashed = s.model.includes("gemini");
		const pts = s.tok.map((v, i) => ({ x: xOf(STEPS[i]), y: yOf(v), v, i }));
		marks += '<path d="' + pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ") + '" fill="none" stroke="' + SCOLOR[s.cond] + '" stroke-width="2" stroke-linejoin="round"' + (dashed ? ' stroke-dasharray="6 5"' : '') + '/>';
		pts.forEach(p => {
			marks += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + SCOLOR[s.cond] + '" stroke="var(--surface)" stroke-width="2"/>';
			hits += '<circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="transparent" data-tip="' + esc(s.cond + ' — ' + SNAMES[s.cond] + '\n' + s.model + ', step ' + STEPS[p.i] + ': median ' + p.v.toLocaleString() + ' input tokens\nsession accuracy: ' + s.acc) + '"/>';
		});
		const last = pts[pts.length - 1];
		endLabels.push({ text: s.cond.replace("S-", "") + " " + (dashed ? "gem" : "son") + " · " + (last.v / 1000).toFixed(1) + "k", x: last.x + 10, y: last.y + 4 });
	}
	endLabels.sort((a, b) => a.y - b.y);
	for (let i = 1; i < endLabels.length; i += 1) {
		if (endLabels[i].y - endLabels[i - 1].y < 14) endLabels[i].y = endLabels[i - 1].y + 14;
	}
	for (const lab of endLabels) {
		g += '<text class="row-label" x="' + lab.x + '" y="' + lab.y + '">' + lab.text + '</text>';
	}
	const el = document.getElementById("fig-horizon");
	el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Line chart: median input tokens per step over a 36-edit session. Keep-history grows linearly to about 24k tokens by step 36; the stateless worked-examples recipe stays flat at about 2.1k. Accuracy is at parity throughout." style="min-width:640px">' + g + marks + hits + '</svg>';
	el.querySelectorAll("[data-tip]").forEach(n => { n.addEventListener("mousemove", e => showTip(e, n.dataset.tip)); n.addEventListener("mouseleave", hideTip); });
	table("tbl-horizon", ["recipe (model)", "steps 1–12", "steps 13–24", "steps 25–36", "end-state intact", "input tokens/session"],
		[
			["S-view (sonnet)", "120/120", "120/120", "120/120", "10/10", "449,028"],
			["S-system (sonnet)", "119/120", "120/120", "118/120", "8/10", "80,890"],
			["S-view (gemini)", "119/120", "120/120", "120/120", "9/10", "428,920"],
			["S-system (gemini)", "120/120", "117/120", "119/120", "9/10", "78,788"]
		]);
})();

// --- data tables ---
function table(mount, head, rows) {
	document.getElementById(mount).innerHTML =
		`<table><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>` +
		rows.map(r => `<tr>${r.map((v, i) => `<td>${v}</td>`).join("")}</tr>`).join("") +
		"</tbody></table>";
}
table("tbl-crossover",
	["condition", ...BUCKET_LABELS.map(b => b + " (95% CI)")],
	CONDITIONS.map(c => [
		`${c} — ${COND_NAMES[c]}`,
		...DATA.crossover[c].map(d => `${d.rate}% [${d.low}, ${d.high}] · ${d.ok}/${d.n}`)
	]));
table("tbl-reference",
	["model", ...CONDITIONS.map(c => `${c} (95% CI)`)],
	DATA.reference.map(r => [
		r.model,
		...CONDITIONS.map(c => `${r.cells[c].rate}% [${r.cells[c].low}, ${r.cells[c].high}] · ${r.cells[c].ok}/40`)
	]));
table("tbl-tokens",
	["condition", ...BUCKET_LABELS],
	CONDITIONS.map(c => [`${c} — ${COND_NAMES[c]}`, ...DATA.tokens[c].map(v => v.toLocaleString())]));


}
