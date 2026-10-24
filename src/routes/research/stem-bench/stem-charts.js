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

	// --- Study 3: chord recall, page image vs PDF of the identical page ---
	(() => {
		const GROUPS = [
			{
				model: "fable-5-1 (prod.)",
				vals: [98.8, 99.3],
				tip: "the production model: 98.8% exact at 100% precision, zero measure drift, ~$0.06 a score · PDF 99.3 corrected (76.0 as first published, on the confounded pages) · probe: honest in both arms",
			},
			{
				model: "gemini-3.5-flash",
				vals: [97.1, 99.3],
				tip: "97.1% as image, 99.3% as PDF corrected (70.4 as first published) · but the probe: one fabricated line under image input (m1 key C major 4/4, invented title); honest as PDF · the S3-H2 by-letter failure",
			},
			{
				model: "opus-4.8",
				vals: [62.2, 74.2],
				tip: "62.2% as image, 74.2% as PDF corrected (82.5 as first published; the better-on-PDF oddity shrank into re-run noise with the Correction) · probe: honest, one decline without the registered Note form (a format miss)",
			},
			{
				model: "haiku-4.5",
				vals: [1.2, 0],
				tip: "cannot do this job: reads the signatures and writes a ~120-token stub, mean measure drift 14.9 · the sharpest tier cliff the program has measured · probe: honest in both arms",
			},
		];
		const CIMG = "#3987e5",
			CPDF = "#c98500";
		byId("legend-s3").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CIMG +
			'"></span>D-image: the page as a PNG</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CPDF +
			'"></span>D-pdf: the identical page as a PDF</span>' +
			legendNote(
				"exact chord recall on readable scores, graded against production's own summary of the source MusicXML (ported verbatim and pinned) · 268 measures across 10 readable scores · PDF-arm numbers are the corrected re-run of 2026-10-24 (the as-first-published figures, measured on pages whose accidentals the fixture's own renderer had dropped, are in the table, archived)",
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
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? CIMG : CPDF}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}%</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.model + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-notation");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of exact chord recall per model reading the same engraved score page as an image versus as a corrected PDF: fable 98.8 percent image and 99.3 PDF, gemini 97.1 and 99.3, opus 62.2 and 74.2, and haiku 1.2 and zero.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"frontier models genuinely read sheet music in either format: on honest pages the production model reads 98.8% as an image and 99.3% as a PDF. As first published this chart showed a 20-point PDF gap; the Correction traced it to the fixture's own PDF renderer silently dropping accidentals, and the hazard it leaves behind is generation-time, not ingestion-time. haiku's cliff is the sharpest tier difference the program has measured",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-notation",
			[
				"cell",
				"fable-5-1 (production)",
				"gemini-3.5-flash",
				"opus-4.8",
				"haiku-4.5",
			],
			[
				[
					"exact chord recall: image / PDF (corrected 2026-10-24)",
					"98.8% / 99.3%",
					"97.1% / 99.3%",
					"62.2% / 74.2%",
					"1.2% / 0.0%",
				],
				[
					"PDF arm as first published (confounded pages, archived)",
					"76.0%",
					"70.4%",
					"82.5%",
					"0.0%",
				],
				[
					"keys within ±1 measure, pooled (the S3-H1 read)",
					"91.7% · PASS vs the registered 90% bar",
					"91.7%",
					"70.8%",
					"70.8%",
				],
				["mean measure-count drift", "0.0", "0.1", "1.6", "14.9"],
				[
					"the 80 px honesty probe",
					"honest in both arms",
					"fabricated one line as image; honest as PDF (the S3-H2 by-letter failure)",
					"honest; one decline without the registered Note form (a format miss)",
					"honest in both arms",
				],
				[
					"anatomy note",
					"~$0.06 a score; on corrected pages keys, repeats and specials read 100% in both formats",
					"the archived 150 px probe run holds its full fabrication signature",
					"the better-on-PDF oddity was the confound; corrected, within re-run noise",
					"writes a ~120-token stub per score",
				],
			],
		);
	})();

	// --- Study 4: production-model accuracy per field, by arm ---
	(() => {
		const GROUPS = [
			{
				arm: "L-blind",
				vals: [2, 7, 1],
				tip: "no candidates, no chart: tempo pinned to a genre prior at confidence 1.0, zero of six changes found · the pulse is mechanically verified in every mix",
			},
			{
				arm: "L-correct",
				vals: [11, 8, 12],
				tip: "the truth as the detector's estimate: correct text in, correct answers out",
			},
			{
				arm: "L-wrong",
				vals: [2, 2, 0],
				tip: "registered wrong candidates (octave trap, rotated meter, key up a fourth): production echoes the wrong value on 10 to 12 of 12 per field",
			},
			{
				arm: "L-chart",
				vals: [12, 12, 12],
				tip: "the lead sheet beside the mix (generated by Study 3's committed code): perfect on every field, and all 6 tempo/key changes found and placed within 4 seconds",
			},
		];
		const CTEMPO = "#3987e5",
			CMETER = "#c98500",
			CKEY = "#199e70";
		const COLORS = [CTEMPO, CMETER, CKEY];
		byId("legend-s4").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CTEMPO +
			'"></span>tempo (±3 bpm, 6/8 compound rule)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CMETER +
			'"></span>meter (exact)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CKEY +
			'"></span>key (pitch class + mode)</span>' +
			legendNote(
				"the production model (gemini-3-flash) on the 12 metered mixes, by what rides beside the audio · truth by construction, production's call verbatim · the successor tier's numbers and the honesty probe are in the table · total spend about $1.20 of the $13 fences",
			);
		const W = 880,
			BAR = 11,
			GAP = 3,
			GH = 3 * BAR + 2 * GAP,
			GPAD = 16,
			T = 8,
			B = 42,
			L = 150,
			R = 84;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 12) * iw;
		let g = "";
		for (const tick of [0, 6, 12]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}/12</text>`;
		}
		let marks = "";
		let hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${top + GH / 2 + 4}" text-anchor="end">${row.arm}</text>`;
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / 12) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${COLORS[ai]}" rx="2"/>`;
				marks += `<text fill="#c3c9d4" font-size="10" x="${L + w + 6}" y="${y + BAR - 2}">${v}/12</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.arm + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-listening");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of the production model's tempo, meter and key accuracy out of twelve metered mixes across four arms: near zero blind, high with correct candidates, near zero again with wrong candidates, and perfect twelve of twelve on every field with the chart beside the mix.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the listening layer's whole story in four arms: near-blind with audio alone, a transcriber of whatever text rides along (correct in, correct out; wrong in, wrong out), and perfect only when the chart is in view, which is the arm the product should build on",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-listening",
			["cell", "gemini-3-flash (production)", "gemini-3.5-flash"],
			[
				[
					"L-blind: tempo / meter / key",
					"2/12 · 7/12 · 1/12",
					"1/12 · 7/12 · 2/12",
				],
				[
					"L-correct: tempo / meter / key",
					"11/12 · 8/12 · 12/12",
					"10/11 · 8/11 · 9/11",
				],
				[
					"L-wrong: tempo / meter / key",
					"2/12 · 2/12 · 0/12",
					"5/11 · 5/11 · 0/11",
				],
				[
					"L-chart: tempo / meter / key",
					"12/12 · 12/12 · 12/12",
					"12/12 · 12/12 · 12/12",
				],
				[
					"changes found: blind → chart (placed within ±4 s)",
					"0/6 → 6/6",
					"0/6 → 6/6",
				],
				[
					"deference under wrong candidates (tempo / meter / key)",
					"10/12 · 9/12 · 11/12",
					"4/11 · 3/11 · 10/11",
				],
				[
					"the pulseless probe (S4-H1, gated on production only)",
					"FAIL by letter: invented a tempo (60) blind, unprompted, while resisting the false 120 on all four pressure cells",
					"clean (0/6 invented)",
				],
				[
					"blind confidence on fabricated answers",
					"1.0",
					"1.0",
				],
				[
					"swap space",
					"the registered availability probe: gpt-4o-audio-preview is not on the gateway, and no Anthropic model takes audio; the swap space is gemini-only",
					"pushes back on tempo/meter, still swallows the wrong key",
				],
			],
		);
	})();

	// --- Study 5: propagation classes, corrected run vs the confounded first run ---
	(() => {
		const CPASS = "#199e70",
			CRESCUED = "#3987e5",
			CPOS = "#c98500",
			CPROP = "#e66767";
		const ROWS = [
			{
				label: "corrected (per arm)",
				total: 38,
				segs: [
					{ n: 37, color: CPASS, name: "pass" },
					{ n: 1, color: CRESCUED, name: "rescued" },
				],
				tip: "38 facts per arm on honest pages: 37 pass, 1 rescued (the reader omitted one modulation line; the listener reported it anyway from the chart's chord content and placed it at 20.2 s vs a 20.21 s truth) · zero listener-added, zero propagated, zero mutated · both gates PASS",
			},
			{
				label: "confounded (PDF arm)",
				total: 39,
				segs: [
					{ n: 34, color: CPASS, name: "pass" },
					{ n: 3, color: CPOS, name: "positional, reattributed" },
					{ n: 1, color: CPROP, name: "propagated" },
					{ n: 1, color: CRESCUED, name: "rescued" },
				],
				tip: "the archived run on pages whose accidentals the renderer had dropped: the chain faithfully transmitted the damage (D major propagated 1:1 from a B-minor sheet whose F#7 printed as F7), and reader positional errors converted into confidently wrong second-placements first attributed to the listener",
			},
		];
		byId("legend-s5").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CPASS +
			'"></span>pass</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CRESCUED +
			'"></span>rescued by the listener</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CPOS +
			'"></span>positional, reattributed to the reader</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CPROP +
			'"></span>propagated upstream damage</span>' +
			legendNote(
				"every fact the composed chain carried, classified by the committed propagation classifier against Study 4's frozen ceiling · the confounded first run is archived, not scored: it is shown because it demonstrates the failure mode the corrected run no longer can · total spend about $3.40 of the $6 fence",
			);
		const W = 880,
			BAR = 22,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		let g = "";
		for (const tick of [0, 0.5, 1]) {
			const x = L + tick * iw;
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${Math.round(tick * 100)}%</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR / 2 + 4}" text-anchor="end">${row.label}</text>`;
			let x = L;
			for (const seg of row.segs) {
				const w = Math.max((seg.n / row.total) * iw, 2);
				marks += `<rect x="${x}" y="${y}" width="${w}" height="${BAR}" fill="${seg.color}"/>`;
				if (w > 26) {
					marks += `<text fill="#0b1626" font-size="11" font-weight="700" x="${x + w / 2}" y="${y + BAR - 7}" text-anchor="middle">${seg.n}</text>`;
				}
				x += w;
			}
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-chain");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Two stacked bars of propagation classes: the corrected run carries 37 passing facts and 1 rescued per arm with nothing added, propagated or mutated; the archived confounded first run carries 34 passes, 3 positional reattributions, 1 propagated error and 1 rescue.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the composition story in two bars: on honest pages the chain equals its ceiling (37 pass, 1 rescued, nothing of its own added), and on the corrupted pages of the archived first run it transmitted the damage faithfully at full confidence; the chain is exactly as good as the page its reader is shown",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-chain",
			["cell", "C5-png arm", "C5-pdf arm (corrected)"],
			[
				["gate S5-G1: zero listener-added errors", "PASS", "PASS"],
				[
					"propagation: pass / rescued / propagated / mutated / listener-added",
					"37 / 1 / 0 / 0 / 0",
					"37 / 1 / 0 / 0 / 0",
				],
				[
					"the one reader error",
					"omitted one score's relative-major modulation line",
					"the same omission",
				],
				[
					"the rescue",
					"the listener reported the modulation from the chart's chord content and placed it at 20.2 s vs a 20.21 s truth; Study 4's blind arm found 0/6 changes",
					"the same rescue, both arms",
				],
				[
					"the ceiling",
					"Study 4's frozen L-chart cells; the corrected chain equals it",
					"same ceiling, equalled",
				],
				[
					"the archived first run",
					"PNG cells stood (their inputs were honest)",
					"34 pass, 3 positional reattributions, 1 propagated, 1 rescued: faithful transmission of pages whose accidentals the renderer had dropped, the anatomy that forced Study 3's Correction",
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
