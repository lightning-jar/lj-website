// @ts-nocheck
// Chart rendering for the stem-bench dashboard, following the barkup-bench
// semantic chart system (chart container, chart-legend, chart-tick,
// chart-caption, data-table). Runs on mount; builds inline SVGs.
export function initStemCharts() {
	const byId = (id) =>
		document.getElementById(id) ?? document.createElement("div");

	function esc(s) {
		return String(s)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/"/g, "&quot;");
	}
	function figCap(text) {
		return '<div class="chart-caption">' + text + "</div>";
	}
	function legendNote(text, label) {
		return (
			'<span class="key note">' +
			(label ? '<span class="note-label">' + label + ":</span> " : "") +
			text +
			"</span>"
		);
	}
	function table(el, headers, rows, note) {
		byId(el).innerHTML =
			"<table><thead><tr>" +
			headers.map((h) => '<th scope="col">' + h + "</th>").join("") +
			"</tr></thead><tbody>" +
			rows
				.map(
					(r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>",
				)
				.join("") +
			"</tbody></table>" +
			(note ? '<div class="chart-caption">' + note + "</div>" : "");
	}

	// --- shared tooltip (canonical bench-charts behavior: opacity +
	// client coordinates + viewport-edge flipping; the page's #tooltip div
	// is a fixed, opacity-0 element styled for exactly this) ---
	const tooltip = byId("tooltip");
	function showTip(evt, text) {
		tooltip.textContent = text;
		tooltip.style.opacity = "1";
		const pad = 14;
		let x = evt.clientX + pad;
		let y = evt.clientY + pad;
		const r = tooltip.getBoundingClientRect();
		if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
		if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
		tooltip.style.left = x + "px";
		tooltip.style.top = y + "px";
	}
	function hideTip() {
		tooltip.style.opacity = "0";
	}

	// --- Study 1: wrong-hint flip rate by model ---
	(() => {
		const ROWS = [
			{
				model: "fable-5-1",
				v: 0,
				color: "#199e70",
				tip: "the production draft model: 0 flips of 405 chances, 0 copies of 438 · and it flagged the wrong hint in its notes in 11/16 songs",
			},
			{
				model: "gemini-3.5-flash",
				v: 0,
				color: "#199e70",
				tip: "the pilot model: 0 flips of 412, 0 copies of 438 · took only the notation style (the 5 suffixes) from hints, never a pitch",
			},
			{
				model: "gpt-oss-120b",
				v: 22.6,
				color: "#c98500",
				tip: "65 flips of 288 · bimodal: surrendered two songs to the wrong hints wholesale (0/32, 0/28) and read the rest clean",
			},
			{
				model: "haiku-4.5",
				v: 49.5,
				color: "#e66767",
				tip: "107 flips of 216 · with the hint wrong, accuracy fell from 49.5% unaided to 30.9%",
			},
			{
				model: "kimi-k2.6",
				v: 69.1,
				color: "#e66767",
				tip: "85 flips of 123 · with the hint wrong, accuracy fell to 11.4%; it also flagged zero disagreements",
			},
		];
		byId("legend-s1").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>zero flips (the frontier tier)</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>partial hint-following</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>the hint outweighs the notes</span>' +
			legendNote(
				"flip rate: of the bars a model answered correctly with NO hint, the share it surrendered to a systematically wrong hint (root up a fourth, quality kept) · lower is better · the matcher baseline for context: the free heuristic alone scores 90.5% of bars",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 168,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 50, 100]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}%</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.model}</text>`;
			const w = Math.max((row.v / 100) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}%</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.model + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-flip");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of wrong-hint flip rates by model: zero percent for fable-5-1 and gemini-3.5-flash, 22.6 percent for gpt-oss-120b, 49.5 percent for haiku-4.5, and 69.1 percent for kimi-k2.6.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the study's registered headline number: hint-following under pressure is a capability gradient, with the frontier tier at exactly zero and the cheapest model surrendering 69% of bars it could read on its own",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-matrix",
			[
				"cell",
				"fable-5-1",
				"gemini-3.5-flash",
				"gpt-oss-120b",
				"haiku-4.5",
				"kimi-k2.6",
			],
			[
				[
					"bar accuracy, no hint (A-none)",
					"92.3%*",
					"94.1%",
					"65.9%",
					"49.5%",
					"28.2%",
				],
				[
					"with the production matcher's hint (A-matcher, the shipped design)",
					"99.8%",
					"94.3%",
					"85.9%",
					"87.5%",
					"75.5%",
				],
				[
					"with the truth as hint (A-correct)",
					"100.0%",
					"99.5%",
					"96.1%",
					"94.5%",
					"95.7%",
				],
				[
					"with a wrong hint (A-wrong)",
					"99.3%",
					"99.5%",
					"77.7%",
					"30.9%",
					"11.4%",
				],
				[
					"wrong-hint copy rate (of 438 bars)",
					"0.0%",
					"0.0%",
					"15.3%",
					"42.7%",
					"56.2%",
				],
				[
					"flip rate (bars right unaided, surrendered)",
					"0/405",
					"0/412",
					"65/288",
					"107/216",
					"85/123",
				],
				[
					"wrong-hint disagreement flagged in notes (of 16 songs)",
					"11",
					"4",
					"7",
					"2",
					"0",
				],
				[
					"model spend (64 cells)",
					"$6.42",
					"$0.74",
					"$0.11",
					"$0.60",
					"$1.54 (+$8.70 archived)",
				],
			],
			"* includes one reproducibly empty completion (zero output tokens, twice) scored 0/28 under the registered no-retry rule; excluding it, 98.5%. The free template matcher alone scores 90.5% (398/440). Full per-arm records and the archived default-reasoning kimi run: the stem-bench repository.",
		);
	})();

	// --- Study 2: combined score, reasoning off vs provider default ---
	(() => {
		const GROUPS = [
			{
				model: "kimi-k2.6 (prod.)",
				vals: [95, 44],
				tip: "the gate: claim upheld 51 points beyond its wording (p = .0015) · default reasoning exhausted the 8k budget on 14/25 tasks and returned nothing; the retry cannot replay an empty reply · 20.3x latency, 29.7x tokens",
			},
			{
				model: "fable-5-1",
				vals: [100, 100],
				tip: "indifferent to the field: perfect in both arms, 1.2x latency and 1.4x tokens under adaptive thinking",
			},
			{
				model: "haiku-4.5",
				vals: [92, 92],
				tip: "identical arms: 23/25 valid both ways, multiples of 1.0",
			},
			{
				model: "gpt-oss-120b",
				vals: [77, 92],
				tip: "the one model reasoning helps: +15 points (p = .14, not significant) at 2.8x cost, mostly rescuing weak first-try formatting (13/25 first-try, 8 retry rescues)",
			},
			{
				model: "gemini-3.5-flash",
				vals: [0, 99],
				tip: "accepts effort none and disobeys it: thinks ~3,000 tokens regardless, burned production's 1,500-token cap twice per request, 0/25 valid · and the off arm is SLOWER (26 s vs 16 s medians)",
			},
		];
		const COFF = "#3987e5",
			CDEF = "#c98500";
		byId("legend-s2").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			COFF +
			'"></span>R-off: production verbatim (reasoning effort none, 1,500-token cap)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CDEF +
			'"></span>R-default: reasoning field omitted (8,000-token cap, the registered asymmetry)</span>' +
			legendNote(
				"combined score over 25 beat prompts: 0 without a valid beat (production's own validator, ported and pinned), else mechanical checks passed over total, tied only to explicit prompt text · total spend about $4.85 of the $28 fences",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 215,
			R = 84;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 50, 100]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}%</text>`;
		}
		let marks = "";
		let hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${top + GH / 2 + 4}" text-anchor="end">${row.model}</text>`;
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / 100) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? COFF : CDEF}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}%</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.model + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-reasoning");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of combined beat score per model with reasoning off versus the provider default: the production model kimi scores 95 percent off and 44 percent on; fable one hundred both; haiku 92 both; gpt-oss 77 off and 92 on; and gemini zero percent off and 99 percent on, the two reversals in one picture.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the two reversals in one picture: the production model loses 51 points the moment its reasoning is allowed to run, and gemini loses everything the moment it is not, because it ignores the field and thinks into the cap; the same call shape is optimal for one model and fatal for another",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-reasoning",
			[
				"cell",
				"kimi-k2.6 (production)",
				"fable-5-1",
				"haiku-4.5",
				"gpt-oss-120b",
				"gemini-3.5-flash",
			],
			[
				[
					"combined score: R-off / R-default",
					"95.0% / 44.0%",
					"100% / 100%",
					"92.0% / 92.0%",
					"77.0% / 92.0%",
					"0.0% / 99.0%",
				],
				[
					"valid beats, off → default",
					"24/25 → 11/25",
					"25/25 → 25/25",
					"23/25 → 23/25",
					"21/25 → 24/25",
					"0/25 → 25/25",
				],
				[
					"latency multiple, default over off",
					"20.3x",
					"1.2x",
					"1.0x",
					"2.7x",
					"0.7x (the off arm is slower: 26 s vs 16 s medians)",
				],
				["output-token multiple", "29.7x", "1.4x", "1.0x", "2.8x", "1.0x"],
				[
					"gate / registered read",
					"S2-H1 PASS: claim upheld, 51 pts (p = .0015)",
					"indifferent (adaptive thinking)",
					"indifferent",
					"+15 pts from reasoning (p = .14, n.s.)",
					"call-shape breakage, not reasoning quality",
				],
				[
					"failure anatomy",
					"default reasoning exhausted the 8k budget on 14/25 tasks; the retry cannot replay an empty reply (gateway 400)",
					"n/a",
					"n/a",
					"weak first-try formatting: 13/25, retry rescued 8",
					"ignores effort none, thinks ~3,000 tokens into a 1,500-token cap, twice per request",
				],
			],
		);
	})();

	// Legend title post-pass (idempotent), mirroring bench-charts.js.
	document.querySelectorAll(".chart-legend").forEach((el) => {
		if (!el.firstElementChild?.classList?.contains("legend-title")) {
			const h = document.createElement("p");
			h.className = "legend-title";
			h.textContent = "Legend";
			el.prepend(h);
		}
	});
}
