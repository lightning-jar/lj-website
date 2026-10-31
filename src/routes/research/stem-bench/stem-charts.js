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
				["blind confidence on fabricated answers", "1.0", "1.0"],
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

	// --- Study 15: the two-clause complementarity on real audio ---
	(() => {
		const XMIN = 1.0,
			XMAX = 3.4,
			YMAX = 0.55;
		const POINTS = [
			{ x: 2.04, y: 0.243, color: "#199e70", label: "letter-lands", tip: "letter-lands, right chart on its own recording · ratio 2.04, median local cost 0.243 · passes both clauses" },
			{ x: 3.21, y: 0.172, color: "#199e70", label: "peaceful-dreams", tip: "peaceful-dreams, the band's machine-true revision on its own recording · ratio 3.21, median local cost 0.172 · the strongest point in the real set, and the song that qualified as the second gated chart" },
			{ x: 2.53, y: 0.224, color: "#199e70", label: "eat-all-the-clocks", tip: "eat-all-the-clocks, right chart on its own recording · ratio 2.53, median local cost 0.224 · lands near the 2.5 the bench predicted" },
			{ x: 1.13, y: 0.47, color: "#e66767", tip: "letter-lands recording against the peaceful-dreams chart · ratio 1.13, median local cost 0.470 · fails both clauses" },
			{ x: 1.17, y: 0.482, color: "#e66767", tip: "letter-lands recording against the eat-all-the-clocks chart · ratio 1.17, median local cost 0.482 · fails both clauses" },
			{ x: 1.15, y: 0.456, color: "#e66767", tip: "peaceful-dreams recording against the letter-lands chart · ratio 1.15, median local cost 0.456 · fails both clauses" },
			{ x: 1.58, y: 0.365, color: "#e66767", near: true, tip: "peaceful-dreams recording against the eat-all-the-clocks chart · ratio 1.58, two hundredths under the 1.6 constant · its median local cost of 0.365 sits well above the 0.30 line, so the second clause catches it comfortably" },
			{ x: 1.24, y: 0.417, color: "#e66767", tip: "eat-all-the-clocks recording against the letter-lands chart · ratio 1.24, median local cost 0.417 · fails both clauses" },
			{ x: 1.57, y: 0.4, color: "#e66767", near: true, tip: "eat-all-the-clocks recording against the peaceful-dreams chart · ratio 1.57, three hundredths under the 1.6 constant · its median local cost of 0.400 sits well above the 0.30 line, so the second clause catches it comfortably" },
		];
		byId("legend-s15").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>right chart on its own recording (3)</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>wrong cross-pair (6)</span>' +
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>the two clauses: ratio at 1.6, median local cost at 0.30</span>' +
			legendNote(
				"every real pair in the study, placed by both same-piece checks at once · a right chart must land right of the ratio line AND below the local-cost line · the two wrong pairs that come within hundredths of the ratio carry medians a third above the cost line, so the clauses fail in different directions and AND-ing them restores the margin · zero spend, no model calls",
			);
		const W = 880,
			T = 18,
			B = 46,
			L = 70,
			R = 24,
			H = 380;
		const iw = W - L - R;
		const ih = H - T - B;
		const xOf = (v) => L + ((v - XMIN) / (XMAX - XMIN)) * iw;
		const yOf = (v) => T + (1 - v / YMAX) * ih;
		let g = "";
		for (const tick of [1.0, 1.5, 2.0, 2.5, 3.0]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick.toFixed(1)}</text>`;
		}
		for (const tick of [0.1, 0.2, 0.3, 0.4, 0.5]) {
			const y = yOf(tick);
			g += `<line x1="${L}" x2="${L + iw}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${L - 10}" y="${y + 4}" text-anchor="end">${tick.toFixed(1)}</text>`;
		}
		g += `<text class="chart-tick" x="${L + iw / 2}" y="${H - 6}" text-anchor="middle">tritone-probe path-cost ratio (higher is more same-piece)</text>`;
		g += `<text class="chart-tick" x="14" y="${T + ih / 2}" text-anchor="middle" transform="rotate(-90 14 ${T + ih / 2})">median local cost (lower is better)</text>`;
		// the pass region: right of the ratio clause AND below the cost clause
		g += `<rect x="${xOf(1.6)}" y="${yOf(0.3)}" width="${L + iw - xOf(1.6)}" height="${H - B - yOf(0.3)}" fill="rgba(25,158,112,0.07)"/>`;
		const rx = xOf(1.6);
		g += `<line x1="${rx}" x2="${rx}" y1="${T}" y2="${H - B}" stroke="#8b93a3" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#8b93a3" font-size="11" x="${rx + 6}" y="${T + 12}" text-anchor="start">ratio 1.6</text>`;
		const cy30 = yOf(0.3);
		g += `<line x1="${L}" x2="${L + iw}" y1="${cy30}" y2="${cy30}" stroke="#8b93a3" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#8b93a3" font-size="11" x="${L + iw - 4}" y="${cy30 - 7}" text-anchor="end">median 0.30</text>`;
		g += `<text fill="#199e70" font-size="11" x="${L + iw - 4}" y="${H - B - 10}" text-anchor="end">both clauses pass here</text>`;
		let marks = "";
		let hits = "";
		POINTS.forEach((p) => {
			const cx = xOf(p.x);
			const cy = yOf(p.y);
			marks += `<circle cx="${cx}" cy="${cy}" r="7" fill="${p.color}"/>`;
			if (p.label)
				marks += `<text fill="#c3c9d4" font-size="11" x="${cx}" y="${cy - 12}" text-anchor="middle">${p.label}</text>`;
			if (p.near)
				marks += `<text fill="#c3c9d4" font-size="11" x="${cx - 12}" y="${cy + 4}" text-anchor="end">${p.x.toFixed(2)} · ${p.y.toFixed(3)}</text>`;
			hits += `<circle cx="${cx}" cy="${cy}" r="16" fill="transparent" data-tip="${esc(p.tip)}"/>`;
		});
		const el = byId("fig-complement");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of all nine real pairs by tritone ratio and median local cost: three right charts sit right of the 1.6 ratio line and below the 0.30 cost line, six wrong cross-pairs sit left and above, and the two near-miss pairs at ratios 1.57 and 1.58 carry medians of 0.400 and 0.365, well above the cost line.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the complementarity at a glance: the three right charts land alone in the quadrant where both clauses pass, and the two wrong pairs that come within hundredths of the ratio line sit a third above the local-cost line, so each clause catches exactly the cases the other nearly misses",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-complement",
			["cell", "result", "the read"],
			[
				[
					"G1: the 1.6 constant at n = 3 right / 6 wrong",
					"right charts 2.04 / 3.21 / 2.53; all six wrong cross-pairs under 1.6, the two Peaceful-vs-Eat pairings at 1.57 and 1.58 · PASS by two hundredths",
					"the constant survives its first expansion of n and is officially thin: same-key, same-tonality wrong pairings close most of the gap",
				],
				[
					"G3: the local-cost clause, stated by number",
					"right-real medians 0.172 to 0.243 vs wrong-real 0.365 to 0.482 · the clause: median local cost at or below 0.30 · PASS clean",
					"the deliverable: the ratio's two near-misses carry medians of 0.365 and 0.400, so the clauses fail in different directions and AND-ing them restores the margin · disclosed: three synthetic wrong pairs would pass both, in a domain production never sees",
				],
				[
					"G2: the edge rules",
					"letter-lands intro 3.61 to 0.00 s, outro 9.11 to 0.08 s; peaceful's intro to 0.00 · peaceful's outro +3.33 s against the 1.0 s gate · FAIL by letter",
					"the rules work where aimed; a 20-bar single-chord decay rings out above audibleSpan's 2 percent floor (a bounded refinement left open with the app); and the interior clause was mis-drafted as an absolute ceiling, with zero actual regressions against Study 14's values",
				],
				[
					"registration lesson seven",
					"the interior clause asserted a 0.5 s ceiling that letter-lands' pre-existing stragglers never met in any prior study",
					"a no-regression clause must name its baseline, not restate a hope: the gate failed by the letter the bench wrote",
				],
				[
					"the scorecard",
					"1 right (including eat near 2.5) · 2 half (the repairs traced exactly; the ring-out and the mis-draft were not) · 3 right in full, including the margin claim",
					"the local statistic's band gap now beats the ratio's, which is what makes the second clause load-bearing rather than belt and braces",
				],
				[
					"the verdict, and the queue",
					"$0 spend · 50 cells, no model calls · constant and edge rules registered as validated at this n with the margin stated; the LAST-SOUND ring-out refinement open",
					"Study 16 queued: the band's five stored chart texts through the production parser once the app's chart-idiom work lands · point of record corrected: the Peaceful Dreams eight-bar audit predates the band's revision, whose stored text now parses 152 bars clean",
				],
			],
		);
	})();

	// --- Study 14: the same-piece ratios against both thresholds ---
	(() => {
		const MIN = 1.0,
			MAX = 3.4;
		const ITEMS = [
			{ label: "wrong charts, real", vals: [1.17, 1.24], color: "#e66767", tip: "the real-domain wrong pairs Amendment 1 added: 1.17 and 1.24 · the registered pairs could not see the collapse, which is why the amendment exists" },
			{ label: "right charts, real", vals: [2.04, 2.53], color: "#199e70", tip: "the band's own correct charts on their real recordings: 2.04 and 2.53, both BELOW the shipped threshold of 3, so samePiece called them mismatches and hedged everything · on synthetic audio the same right charts score 24 to 49, far off this axis: the home-field lesson, third appearance" },
		];
		byId("legend-s14").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>wrong charts (real recordings)</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>right charts (real recordings)</span>' +
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>thresholds: shipped 3.0, recommended and now shipped 1.6</span>' +
			legendNote(
				"tritone-probe path-cost ratios on real audio, the only domain production sees · right charts on synthetic audio score 24 to 49, far beyond this axis, which is where the shipped 3.0 came from · the control separates on real audio (wrongs at or below 1.24, rights at or above 2.04), just not at 3 · caveats owned: n = 2 per class, one band, a 1.6x margin vs Study 12's order of magnitude",
			);
		const W = 880,
			ROWH = 30,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + ITEMS.length * ROWH + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - MIN) / (MAX - MIN)) * iw;
		let g = "";
		for (const tick of [1.0, 2.0, 3.0]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick.toFixed(1)}</text>`;
		}
		const oldX = xOf(3.0);
		g += `<line x1="${oldX}" x2="${oldX}" y1="${T}" y2="${H - B}" stroke="#e66767" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#e66767" font-size="11" x="${oldX}" y="${H - B + 34}" text-anchor="middle">shipped 3.0</text>`;
		const newX = xOf(1.6);
		g += `<line x1="${newX}" x2="${newX}" y1="${T}" y2="${H - B}" stroke="#199e70" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#199e70" font-size="11" x="${newX}" y="${H - B + 34}" text-anchor="middle">now 1.6</text>`;
		let marks = "";
		let hits = "";
		ITEMS.forEach((item, i) => {
			const cy = T + i * ROWH + ROWH / 2;
			g += `<text class="chart-tick" x="${L - 12}" y="${cy + 4}" text-anchor="end">${item.label}</text>`;
			g += `<line x1="${L}" x2="${L + iw}" y1="${cy}" y2="${cy}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
			item.vals.forEach((v, vi) => {
				marks += `<circle cx="${xOf(v)}" cy="${cy}" r="7" fill="${item.color}"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${xOf(v)}" y="${vi % 2 === 0 ? cy - 11 : cy + 20}" text-anchor="middle">${v.toFixed(2)}</text>`;
			});
			hits += `<rect x="${L}" y="${cy - ROWH / 2}" width="${iw}" height="${ROWH}" fill="transparent" data-tip="${esc(item.label + "\n" + item.tip)}"/>`;
		});
		const el = byId("fig-samepiece");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot plot of same-piece tritone ratios on real recordings: wrong charts at 1.17 and 1.24, right charts at 2.04 and 2.53, with the shipped threshold of 3 above all of them and the recommended 1.6 cleanly between the classes.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the constant that would have rejected the band's own charts, at a glance: every real ratio, right or wrong, sits below the shipped 3.0 that synthetic numbers inspired, while the recommended 1.6 splits the real classes cleanly; production took the fix within hours and wrote the standing rule into its own log",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-samepiece",
			["cell", "result", "the read"],
			[
				[
					"G1: the production parsers",
					"76/76 and 86/86 bars round-tripped with sections; 24/24 on a marked summary; the 6/8 convention to the millisecond · PASS exact",
					"future bench studies can feed production's own parsers instead of maintaining ports",
				],
				[
					"G2: the same-piece constant",
					"right charts 2.04 and 2.53 on real audio vs 24 to 49 synthetic, both under the shipped 3 · FAIL, the study's reason to exist",
					"Amendment 1 measured the real wrong pairs (1.17, 1.24): the control separates on real audio, just not at 3 · recommended ~1.6, shipped by the app the same day with its caveats owned",
				],
				[
					"G3: the shipped aligner through its own parser path",
					"six of eight non-edge boundaries within 0.11 s of declared starts; 1.1 s to align a 141 s song · FAIL by letter via samePiece and nothing else",
					"Study 12's precision reproduced in the production code path; the only failing clause is the constant above",
				],
				[
					"G4: the reconciler under production's thinking config",
					"44/76 (15 fixes, 0 breaks) vs the bench's thinking-off 41/76, in half the output tokens · PASS",
					"adaptive thinking absorbs the narration that forced Study 13's cap amendment; zero breaks across every reconciler run in two studies; left as shipped",
				],
				[
					"arm D: the edge rules",
					"first-onset snap: both real intros to 0.00 s · last-sound rule: the 9.11 s outro miss to 0.03 s, but inherits chart quality",
					"both shipped by the app gated on samePiece and hedged, exactly as the measurement suggested",
				],
				[
					"the loop, and the ledger",
					"~$0.40 of the $2 fence · 26 cells · request, ship, validate, catch, fix shipped: four turns in under 36 hours",
					"the constant is 1.6 in production, and the app's log now carries the rule the catch earned: a constant gating real recordings is provisional until measured on real recordings",
				],
			],
		);
	})();

	// --- Study 13: the home-field gap and the reconciler's climb ---
	(() => {
		const GROUPS = [
			{
				label: "synthetic bench",
				rows: [{ name: "matcher at home", v: 95.8, color: "#8b93a3", note: "95.8%" }],
				tip: "Basic Pitch + the v0.142 matcher on the synthetic bench: 95.8%, the Study 10 winner over the neural reader · the material its templates were born on",
			},
			{
				label: "real recording (76 bars)",
				rows: [
					{ name: "matcher alone", v: 38.2, color: "#e66767", note: "29/76" },
					{ name: "+ gemini reconciler", v: 47.4, color: "#c98500", note: "36/76" },
					{ name: "+ fable reconciler", v: 53.9, color: "#199e70", note: "41/76" },
				],
				tip: "the real letter-lands recording: the matcher reads 29/76 (strict-first 20; the power-chord allowance did 9 bars of work) · one text-only reconciler pass lifts it to 36/76 (gemini, 7 fixes 0 breaks) and 41/76 (fable, 12 fixes 0 breaks across 27 changed bars) · the binding constraint is the transcription on real timbres",
			},
		];
		const BAR = 14,
			GAP = 4,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 255,
			R = 84,
			W = 880;
		let totalRows = 0;
		for (const g0 of GROUPS) totalRows += g0.rows.length;
		const H = T + totalRows * (BAR + GAP) + GROUPS.length * GPAD + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 100) * iw;
		let g = "";
		for (const tick of [0, 50, 100]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}%</text>`;
		}
		byId("legend-s13").innerHTML =
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>synthetic home field</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>the matcher on real audio</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>reconciled by gemini-3.5-flash</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>reconciled by claude-fable-5-1 (production)</span>' +
			legendNote(
				"bar-level chord accuracy · the home-field gap is near 60 points against a predicted 15 to 30, and both reconciler passes fixed bars without breaking a single right answer, passing the anti-agreement-trap gate at infinity · total spend about $0.60",
			);
		let marks = "";
		let hits = "";
		let y = T;
		GROUPS.forEach((grp) => {
			const top = y;
			grp.rows.forEach((row) => {
				g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.name}</text>`;
				const w = Math.max((row.v / 100) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${row.note}</text>`;
				y += BAR + GAP;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${y - top - GAP}" fill="transparent" data-tip="${esc(grp.label + "\n" + grp.tip)}"/>`;
			y += GPAD;
		});
		const el = byId("fig-reconcile");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of chord accuracy: the matcher scores 95.8 percent on the synthetic bench but 38.2 percent on a real recording; one reconciler pass lifts the real number to 47.4 percent with gemini and 53.9 percent with the production model, both with zero broken answers.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the cliff and the climb in one frame: the chord path that won every synthetic comparison falls to 38 percent on real audio, a text-only reconciler pass recovers 16 of those points without breaking a single correct bar, and the remaining gap belongs to the transcription, not the matcher or the model",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-reconcile",
			["cell", "result", "the read"],
			[
				[
					"arm 1: the chord path on real audio",
					"38.2% on letter-lands (29/76; strict-first 20; the power-chord allowance 9 bars) · 27.9% exploratory · the <90% trigger fired",
					"a near-60-point home-field gap against the predicted 15 to 30: Study 1's rich-harmonics gotcha, measured in production conditions; the transcription is the binding constraint",
				],
				[
					"Amendment 1",
					"all four pilot cells truncated at the 4000-token cap (narrate-then-JSON); cap to 16,000, re-run under the fence, truncated run kept",
					"the Study 8 budget-conflation class, in the bench's own harness again · also disclosed: the production model ignores the temperature-0 deviation (gateway unsupported)",
				],
				[
					"arm 2, S13-G2: claude-fable-5-1 (production)",
					"29 → 41/76 (53.9%) · 12 fixes, 0 breaks, 27 changed bars · PASS at infinity",
					"the double-fix gate, registered against Study 9's agreement trap, came back spotless",
				],
				[
					"arm 2: gemini-3.5-flash",
					"29 → 36/76 (47.4%) · 7 fixes, 0 breaks · PASS",
					"on the exploratory song it burned the full 16k budget narrating 86 bars and never reached the JSON: the budget failure mode of that family (Studies 2 and 8), not the predicted over-editing",
				],
				[
					"the exploratory song",
					"fable +3 bars, 0 breaks",
					"the same direction, under a transcription even weaker than letter-lands",
				],
				[
					"ship guidance",
					"a UI hedge on chord drafts now; the reconciler inside the chart-draft job (symbols in, symbols out; keep the detector's chord on a non-parse; cap output generously)",
					"the honest ceiling: 54% reconciled is better, not good; the next investment is a stronger transcription on real timbres, not more model",
				],
				[
					"the arc note, and the ledger",
					"~$0.60 of the $3 fence · 170 cells",
					"the program's first study in which an LLM improved a hearing pipeline, by never hearing anything: the twelve-study law applied rather than broken",
				],
			],
		);
	})();

	// --- Study 12: the half-second precision league ---
	(() => {
		const ROWS = [
			{
				label: "Study 8: models, blind",
				v: 0,
				color: "#8b93a3",
				tip: "both gemini generations found most contrast boundaries at a loose tolerance but placed about none of the 8 within half a second · the literature's best model reader scores 0.423 at this tolerance on real music",
			},
			{
				label: "Study 10: neural segmenter",
				v: 0,
				color: "#8b93a3",
				tip: "LinkSeg at ±0.5 s: 0/8 on the synthetic contrast set (5/8 even at ±4 s) · it later edges alignment 7/9 to 6/9 on one real song only at the edges, by being merely mediocre everywhere",
			},
			{
				label: "Study 12: alignment",
				v: 8,
				color: "#199e70",
				tip: "all 8 contrast boundaries within ±0.5 s, plus 7/8 tempo/key-change boundaries at the same tolerance (invisible to stem activity, half-found by blind models): the warp does not care that the tempo moved · zero model spend",
			},
		];
		byId("legend-s12").innerHTML =
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>listeners and published models</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>chart-render alignment (no model)</span>' +
			legendNote(
				"the 8 synthetic contrast boundaries placed within half a second, the precision metric every listener in the program failed · the real-recording anatomy (six mid-song boundaries at 0.02 to 0.11 s, the misses at the chart's edges) and the 6/6 wrong-chart probe are in the table",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 290,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 8) * iw;
		let g = "";
		for (const tick of [0, 4, 8]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}/8</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.label}</text>`;
			const w = Math.max((row.v / 8) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}/8</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-align");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of contrast section boundaries placed within half a second: about zero of eight for the blind models, zero of eight for the neural segmenter, and eight of eight for chart-render alignment with no model.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the precision league across the program: the metric every listener failed is swept by rendering the chart and aligning it to the recording, with no model in the loop; the program's one genuine model hearing ability, texture contrast, is now overtaken twice, by stems in Study 9 and by charts here",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-align",
			["cell", "result", "the read"],
			[
				[
					"G1a: synthetic bar starts within ±0.25 s",
					"532/560 (95.0%) · PASS at exactly the letter",
					"errors live in reverb tails (worst 1.3 to 1.4 s) and dense mixes; mediant modulations perfect to the hop",
				],
				[
					"G1b: contrast boundaries within ±0.5 s",
					"8/8 · PASS, the headline · plus 7/8 tempo/key-change boundaries at the same tolerance",
					"the warp does not care that the tempo moved; boundaries invisible to stem activity and half-found by blind models fall out of the method",
				],
				[
					"the wrong-chart probe",
					"6/6 pairs separated, path-cost ratios 8.6 to 16.3",
					"the is-this-chart-this-recording question, asked by ear in production today, is now a number with an order-of-magnitude margin",
				],
				[
					"G2: real letter-lands boundaries within ±0.5 s",
					"6/9 vs the registered 7/9 · FAIL by one",
					"the six mid-song boundaries landed at 0.02 to 0.11 s; the misses are the edges (intro 3.6 s, outro 9.1 s): sub-tenth wherever the performance follows the chart, lost where the chart stops describing it",
				],
				[
					"the exploratory song",
					"clean until the bench's own uncertain Bridge reading, then 2 to 8 s adrift, re-anchoring at the outro",
					"a wrong transcription degrades locally and visibly, which is exactly what a shipping path-cost and edge gate can catch",
				],
				[
					"the transcription scoping",
					"one song gated, one exploratory with a disclosed 26 s mismatch, one excluded as untranscribable",
					"chart quality is the binding constraint: a data problem, not a hearing problem",
				],
				[
					"ship guidance",
					"alignment takes placement behind the path-cost gate and an edge flag (the rung-picker pattern); the probe replaces the by-ear same-piece clause",
					"with the edge flag accepted as UI, the model's remaining role in this feature is nothing",
				],
				[
					"the arc, and the ledger",
					"$0 · 583 cells · every hearing task measured across twelve stem studies now has a code-or-data answer that beats or matches the model",
					"the bench's own registration, approved from the candidates memo; the Badverbs transcriptions committed before any alignment ran",
				],
			],
		);
	})();

	// --- Study 11c: the two-rule mirror verdict ---
	(() => {
		const ROWS = [
			{
				label: "the declared-lag rule",
				v: 3,
				color: "#e66767",
				tip: "3/3 wrong mirror values accepted, exactly as the bench's registered prediction traced: on straight running eighths, a 2/3-wrong declared tempo puts its lag's third on the eighth grid and every clause licenses the rung · retired on the record, by the measurement its proposer registered",
			},
			{
				label: "the gate: opens",
				v: 0,
				color: "#199e70",
				tip: "the gates themselves never opened on any mirror item: the 3:2 and x3 rungs stay closed under a declared 4/4 · C1 over the full corpus: 0/332 wrong rows accepted, three true matches gained over v0.200.0",
			},
			{
				label: "rung-1 collision",
				v: 1,
				color: "#c98500",
				tip: "the by-letter miss, stated plainly: on mirror-138 the DETECTOR itself misread straight eighths at 92 with a false compound flag (the confound's first synthetic reproduction), and the wrong declared 92 matched the wrong detection directly at rung 1, which no gate governs · lesson-six collision class, not a gate leak",
			},
		];
		byId("legend-s11c").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>the bench\'s proposed rule, defeated as registered</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>the shipped patch\'s gate, which never opened</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>the ungoverned rung-1 collision</span>' +
			legendNote(
				"wrong declarations accepted on the three mirror items (straight running eighths declared wrongly at 2/3), the fixture Stem Shovel designed to defeat the bench\'s own rule · the full-corpus and x3-rung arms are in the table · zero model spend",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 290,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const xOf = (v) => L + (v / 3) * iw;
		let g = "";
		for (const tick of [0, 1, 2, 3]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}/3</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.label}</text>`;
			const w = Math.max((row.v / 3) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}/3</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-mirror");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of wrong declarations accepted on the three mirror items: the bench's declared-lag rule accepts all three, the shipped declared-meter gate opens on none, and one collision passes at rung one where the wrong declaration equals the wrong detection, which no gate governs.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the mirror did its job twice over: the bench's rule lost 3 of 3 exactly as its own registered prediction traced, the shipped gate never opened, and the one accept is a rung-1 collision with a misread detection, the lesson-six class no ladder can govern; the fixture that caused it is now the detector confound's first synthetic regression test",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-mirror",
			["cell", "result", "the read"],
			[
				[
					"C1: the declared-meter gate over the full 11b corpus",
					"0/332 wrong rows accepted, no true match lost, THREE gained · PASS",
					"lilt-a and verb-y match at 2/3 through their declared 6/8 where the acoustic margin missed; mop-heart at x3 through declared 3/4, 224 counted three to the bar; peaceful-dreams stays loud, by data instead of by luck",
				],
				[
					"C2: the mirror fixture",
					"declared-lag 3/3 accepted · declared-meter 1/3 by letter",
					"the bench's rule retired on the record as registered; the 1 is the rung-1 collision with a misread detection (lesson six), not a gate leak",
				],
				[
					"C3: the x3 rung",
					"opens nowhere but declared-triple meters; 0 leaks, 0 off-tolerance; exact-3x accepted on all 5 triple-declared items · PASS",
					"the x2-class count ambiguity quantified, living where it belongs: in the rung picker",
				],
				[
					"the bonus fixture",
					"mirror-138: truth 138, detected 92 with a false compound flag, the truth on the alternates at strength 0.96",
					"the first synthetic reproduction of the detection-side confound; a committed regression fixture replacing a single real recording",
				],
				[
					"the verdict delivered",
					"ship the patch to production as is",
					"the declared-meter gate strictly dominates both predecessors on everything a gate controls; the one accept is detection-side and pre-existing",
				],
				[
					"the thread ledger",
					"$0 this study · 534 cells · five ladder studies for ~$0.08 of model spend total",
					"the sixth cross-agent study, closing the thread with each side having corrected the other on the record",
				],
			],
		);
	})();

	// --- Study 11b: the super-beat margin band ---
	(() => {
		const MIN = 0.9,
			MAX = 1.12;
		const ITEMS = [
			{
				label: "lilt-b",
				v: 1.063,
				color: "#199e70",
				tip: "1.063, above the 1.05 margin: detects its 6/8 exactly at 76 bpm, one of Study 10's octave misses fixed outright by the re-pick",
			},
			{
				label: "lilt-a",
				v: 1.029,
				color: "#c98500",
				tip: "1.029, under the 1.05 margin: the app's own fixtures measured 1.02 to 1.12, and the bench's lighter accents land at the bottom of that band · the true dotted tempo still sits on the alternates ladder at top-rung strength",
			},
			{
				label: "verb-y",
				v: 0.991,
				color: "#e66767",
				tip: "0.991, reverb-smeared down among the straight items' own ratios: no margin reaches it without letting straight songs through, which is why the verdict says do not lower the margin",
			},
		];
		byId("legend-s11b").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>fires correctly (above the margin)</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>missed, between the band and the margin</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>missed, among the straight-item ratios</span>' +
			legendNote(
				"each compound item's shipped super-beat ratio against the straight items' 0.91 to 0.97 band (shaded) and the shipped 1.05 margin (dashed) · the distributions overlap, so the margin cannot be tuned: lowering it trades missed 6/8 for false 6/8 · contrast-c also fires correctly; the real-recording flips and the shipped confound are in the table",
			);
		const W = 880,
			ROWH = 26,
			T = 8,
			B = 42,
			L = 150,
			R = 84;
		const H = T + ITEMS.length * ROWH + B;
		const iw = W - L - R;
		const xOf = (v) => L + ((v - MIN) / (MAX - MIN)) * iw;
		let g = "";
		// the straight band, shaded across the plot
		g += `<rect x="${xOf(0.91)}" y="${T}" width="${xOf(0.97) - xOf(0.91)}" height="${H - T - B}" fill="rgba(139,147,163,0.18)"/>`;
		g += `<text fill="#8b93a3" font-size="11" x="${(xOf(0.91) + xOf(0.97)) / 2}" y="${H - B + 34}" text-anchor="middle">straight band 0.91 to 0.97</text>`;
		for (const tick of [0.9, 1.0, 1.1]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick.toFixed(2)}</text>`;
		}
		const mx = xOf(1.05);
		g += `<line x1="${mx}" x2="${mx}" y1="${T}" y2="${H - B}" stroke="#e66767" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#e66767" font-size="11" x="${mx}" y="${H - B + 34}" text-anchor="middle">1.05 margin</text>`;
		let marks = "";
		let hits = "";
		ITEMS.forEach((item, i) => {
			const cy = T + i * ROWH + ROWH / 2;
			g += `<text class="chart-tick" x="${L - 12}" y="${cy + 4}" text-anchor="end">${item.label}</text>`;
			g += `<line x1="${L}" x2="${L + iw}" y1="${cy}" y2="${cy}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
			marks += `<circle cx="${xOf(item.v)}" cy="${cy}" r="7" fill="${item.color}"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${xOf(item.v) + 12}" y="${cy + 4}">${item.v.toFixed(3)}</text>`;
			hits += `<rect x="${L}" y="${cy - ROWH / 2}" width="${iw}" height="${ROWH}" fill="transparent" data-tip="${esc(item.label + "\n" + item.tip)}"/>`;
		});
		const el = byId("fig-margins");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dot plot of three compound items' super-beat ratios against the shipped 1.05 margin and the straight items' 0.91 to 0.97 band: lilt-b at 1.063 fires correctly above the margin, lilt-a at 1.029 is missed between band and margin, and verb-y at 0.991 falls among the straight items' own ratios where no margin can reach it.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"why the verdict says do not lower the margin: one missed item sits between the band and the margin, where tuning could reach it, but the other falls among the straight items' own ratios, so any margin low enough to catch it lets straight songs through; the alternates ladder carries the right count for both",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-margins",
			["cell", "result", "the read"],
			[
				[
					"V3: the swing-stress sweep (15 items, ratios 0.60 to 0.70)",
					"15/15 straight, every tempo exact · PASS",
					"TRIPLET_SHARE 0.55 and the swing-cannot-exceed-half argument validated in full, including the 0.67 triplet swing the bench's sketch rule misread",
				],
				[
					"V4: the corrected wrong-tempo set",
					"0/332 false accepts · PASS",
					"retro-confirms Study 11's by-letter failures as generator collisions, not ladder defects",
				],
				[
					"the super-beat re-pick",
					"two of Study 10's octave misses now detect their 6/8 exactly",
					"a detector-level fix that fell out of shipping the ladder",
				],
				[
					"V1: the four compound items",
					"2/4 fire · FAIL",
					"the margin numbers forbid tuning (see the figure); the alternates ladder carries the true dotted tempo on all 4 at top-rung strength, so the rung picker surfaces the right count",
				],
				[
					"V2: the real recordings",
					"both scorable songs flipped to 6/8 · FAIL, the headline",
					"mop-heart re-picked to 74.7, exactly declared 224 over 3: a defensible hearing with no rung to land on · peaceful-dreams fired on the detector's own 2/3-wrong pulse: Study 11 Amendment 1's confound, now in shipped code, silencing the warning the gates required to stay loud",
				],
				[
					"the verdict delivered",
					"keep the triplet share, the ladder util, and the re-pick; evaluate the compound flag at the DECLARED tempo's lag (0.72 vs 0.03 separates the two cases); add the times-3 rung; do not lower the margin",
					"not a stop-ship: the flag fix contains the false fires at the warning surface, and the alternates carry the truth",
				],
				[
					"the thread ledger",
					"$0 this study · 384 cells · the four ladder-thread studies total about $0.08 of model spend, all of it Study 9's pilot",
					"the fifth cross-agent study: requested by the production side, run verbatim-pinned by the bench",
				],
			],
		);
	})();

	// --- Study 11: wrong-value acceptance under the ladder ---
	(() => {
		const ROWS = [
			{
				label: "open: ×1.5 accepted",
				v: 30,
				total: 33,
				color: "#e66767",
				tip: "the ungated ladder accepts 30/33 wrong ×1.5 declarations (it also accepts peaceful-dreams, the true hearing error): the measured cost of open 3:2 rungs, exactly as the gate design predicted",
			},
			{
				label: "gated: ×1.5 accepted",
				v: 1,
				total: 33,
				color: "#c98500",
				tip: "G2's by-letter failure, and the 1 is a true value: the generator built a wrong 108 from section 1's 72 on a song whose own second section is declared at 108 · registration lesson six: a wrong-value generator must respect every true label",
			},
			{
				label: "genuinely wrong accepted",
				v: 0,
				total: 255,
				color: "#199e70",
				tip: "across all 255 mechanically wrong rows, the gated ladder accepted zero genuinely wrong values; both by-letter gate failures transfer to the generator, not the rule",
			},
		];
		byId("legend-s11").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>the open ladder (no rung gate)</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>the gated ladder, by letter</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>the gated ladder, genuinely wrong values</span>' +
			legendNote(
				"wrong declared tempos accepted as matching the stored Study 10 detections, as a share of each row's cells · zero model spend, two pure functions, three runs · the six-miss recovery map (5/5 recovered at their rungs, the one true hearing error correctly refused) is in the table",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const xOf = (f) => L + f * iw;
		let g = "";
		for (const tick of [0, 0.5, 1]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${Math.round(tick * 100)}%</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.label}</text>`;
			const w = Math.max((row.v / row.total) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}/${row.total}</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-ladder");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of wrong tempo values accepted: the open ladder accepts thirty of thirty-three wrong one-point-five-times rows, the gated ladder accepts one of thirty-three by letter, and that one is a true value, so genuinely wrong acceptances across all two hundred fifty-five rows are zero.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the case for gating in three bars: open 3:2 rungs accept nearly everything, the gate's single by-letter acceptance turns out to be the song's own second-section tempo mislabeled wrong by the generator, and zero genuinely wrong values pass in 255 rows; both failed gates failed on their own measuring stick",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-ladder",
			["cell", "result", "the read"],
			[
				[
					"S11-G1: the six-miss recovery map",
					"5/5 recovered at their rungs (both lilts, contrast-c and verb-y at 2/3 on genuine compound evidence; mop-heart at 2) and peaceful-dreams correctly refused · PASS",
					"the octave error class retired by representation; the one true hearing error stays an error, which is the design working",
				],
				[
					"S11-G3: subdivision and meter",
					"3 on 4/4 compound items, 2 on 31/31 straight; the swing pair splits honestly (0.67 reads 3, 0.62 reads 2) · PASS",
					"6/8 is expressible for the first time, at the registered cost of one swing item: the swing-needs-its-own-flag caveat confirmed",
				],
				[
					"S11-G2: wrong ×1.5 rows",
					"L-gated 1/33 · FAIL by letter",
					"the 1 is shift-b's declared 108, which IS the song's second-section tempo: the generator respected only the first truth label",
				],
				[
					"S11-G4: the Study 7 cells",
					"1/221 silenced · FAIL by letter",
					"a pairing artifact: truth-derived wrongness compared against an already-wrong detection lands on the double rung of the wrong grid",
				],
				[
					"registration lesson six",
					"earned twice in one study",
					"a mechanical wrong-value generator must respect every true label of an item and define wrongness against the value actually compared",
				],
				[
					"the two instrument amendments",
					"the subdivision hypothesis moved to the declared tempo (the slower-of-pair form is mathematically confounded); a beat floor added (a claim about a pulse that does not exist is no claim)",
					"both caught by the first runs and fixed by registered amendment before any result was accepted; superseded runs kept in history",
				],
				[
					"the shipped rule",
					"built by Stem Shovel while the study ran, with a sharper subdivision rule than the sketch tested here",
					"NOT validated by this study; a follow-up validation plus a swing-stress set is committed and pending",
				],
				[
					"spend",
					"$0 · 329 cells · three runs, all local arithmetic",
					"the fourth cross-agent study: specified by the production agent, registered and run by the bench",
				],
			],
		);
	})();

	// --- Study 10: the two-arm section reversal, synthetic vs real ---
	(() => {
		const GROUPS = [
			{
				label: "synthetic (22 loops)",
				vals: [54, 0],
				max: 60,
				tip: "the bench's home field: LinkSeg invented 54 false boundaries (~2.5/item, worse than Study 8's chart-anchored models) and found only 5/8 contrast boundaries · D-activity: 8/8 found, zero invented, by construction",
			},
			{
				label: "real (7 songs)",
				vals: [10, 19],
				max: 60,
				tip: "the models' home field, scored against the band's declared section seconds: LinkSeg finds real form, 29/33 declared boundaries within 4 s (one song 8/9 with ZERO false) · D-activity drops to 25/33 with 19 false boundaries: the plain correction of Study 9's ship suggestion",
			},
		];
		const CLINK = "#c98500",
			CACT = "#199e70";
		byId("legend-s10").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CLINK +
			'"></span>LinkSeg 7-class (published neural segmenter, CC-BY, 1.5 MB)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CACT +
			'"></span>D-activity (Study 9\'s per-stem detector, zero cost)</span>' +
			legendNote(
				"false section boundaries invented, total per arm · the same two instruments swap verdicts when the material changes domain, which is why the amendment existed: neither home field decides alone · detection rates, the other three gates and the amended guidance are in the table",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const max = 60;
		const xOf = (v) => L + (v / max) * iw;
		let g = "";
		for (const tick of [0, 30, 60]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}</text>`;
		}
		let marks = "";
		let hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${top + GH / 2 + 4}" text-anchor="end">${row.label}</text>`;
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / max) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? CLINK : CACT}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-mir");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of false section boundaries invented: on synthetic loops LinkSeg invents 54 and the activity detector zero; on real recordings LinkSeg invents 10 while the activity detector invents 19; the two instruments swap verdicts when the material changes domain.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the two-arm reversal in one frame: the published segmenter that drowned the synthetic fixture in invented boundaries finds real form on the band's recordings, and the bench's own detector, perfect at home, does the inventing on real stems; the measured no-chart fallback flips accordingly",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-mir",
			["cell", "production (shipped)", "neural candidate"],
			[
				[
					"G-beat: exact tempo at the registered ±1 (33 synthetic items)",
					"29/33",
					"18/33 · but the miss is 20 ms frame-grid quantization (142.9 for 140): a disclosed ±3 read is a dead tie 29/29, the program's fifth registration lesson",
				],
				[
					"what the letter cannot take away",
					"no per-beat grid exists in production",
					"beat F-measure 0.892 at ±70 ms, downbeats 0.867, honest nulls on both pulseless pads",
				],
				[
					"G-meter (synthetic)",
					"27/29, and 4/4 on the real waltz",
					"21/29; 6/8 named on 1 of 4 compound items; misread the real waltz",
				],
				[
					"G-key: synthetic, then real",
					"Krumhansl 29/33 · 4/6 on real mixes: keep-KK confirmed",
					"Albrecht-Shanahan 29/33 and Temperley 30/33 tie on synth, then collapse to 1/6 each on real mixes (parallel-minor and subdominant flips)",
				],
				[
					"G-seg: sections, synthetic then real",
					"D-activity 8/8 with 0 false · drops to 25/33 with 19 false on real stems",
					"LinkSeg 5/8 with 54 false · flips to 29/33 at ±4 s with 10 false on real songs: the measured no-chart fallback",
				],
				[
					"G-chord (504 bars + 64 hard-set)",
					"matcher 483/504 full-vocab, 59/64 hard set, 27/28 on the N.C. song",
					"ChordMini 418/504; edges the hard set on maj-min 61/64; collapses to 4/28 on the N.C. song",
				],
				[
					"real-recording tempo (4 declared, n too small for proof)",
					"2/4 at ±1, both misses GROSS: exact half of 224, exact 2/3 of 145, the 3:2 family on real material",
					"3/4 at ±3, one 4% miss; degrades gracefully where autocorrelation octave-jumps",
				],
				[
					"the ledger",
					"1.2 s per 90 s of audio, 0 MB of weights",
					"all candidates fit the budget (≤ 10 s, ~30 MB hash-pinned); accuracy, not deployment, decided every gate",
				],
			],
		);
	})();

	// --- Study 9: false boundaries per uniform loop across three designs ---
	(() => {
		const ROWS = [
			{
				label: "Study 8: models blind",
				v: 3.3,
				color: "#e66767",
				tip: "the production model blind invented 3 to 6 sections per uniform loop (3.3 false boundaries per item overall); 3.5-flash cleaner at 1.0 but not clean",
			},
			{
				label: "Study 8: chart-anchored",
				v: 1.2,
				color: "#c98500",
				tip: "even with the marked chart beside the mix, uniform loops gained about 1.2 invented boundaries per item: the chart's silence does not beat the form prior",
			},
			{
				label: "Study 9: D-activity",
				v: 0,
				color: "#199e70",
				tip: "the per-stem activity detector: 0 false boundaries on loops AND change items, 8/8 contrast boundaries found, identical on both grids, zero model cost · on a loop the active-stem set never changes, so the failure is excluded by construction · caveat: a sustained-noise stem toggles its own bit (+2 on one mislead item), hence the atonal-stem guard",
			},
		];
		byId("legend-s9").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>model, blind</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>model, chart-anchored</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>per-stem activity detector (zero model cost)</span>' +
			legendNote(
				"false section boundaries invented per uniform-loop item, same fixture family across both studies · the detector angle: a boundary only where the active-stem set changes and holds two bars · the tempo face-off (the sum beats the sharpest stem 18/21 to 11/21) is in the table",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const max = 4;
		const xOf = (v) => L + (v / max) * iw;
		let g = "";
		for (const tick of [0, 2, 4]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${tick}</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.label}</text>`;
			const w = Math.max((row.v / max) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v.toFixed(1)}/item</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-stems");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of false section boundaries invented per uniform loop: 3.3 per item for models listening blind in Study 8, about 1.2 even chart-anchored, and zero for Study 9's per-stem activity detector, which cannot invent a boundary on a loop by construction.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"three designs against the same failure: the model blind invents structure, the chart reduces it but cannot zero it because silence does not beat the form prior, and the zero-cost activity detector excludes it by construction while finding every contrast boundary the models heard",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-stems",
			["cell", "result", "the read"],
			[
				[
					"S9-G1: D-activity section boundaries",
					"8/8 contrast found, 0 false on loops and change items, identical on truth and detected grids · PASS",
					"the loop-invention failure is excluded by construction; the six tempo/key-change boundaries are structurally invisible, as registered: those belong to the chart",
				],
				[
					"S9-G2: sharpest-stem tempo vs the summed envelope",
					"D-prod 18/21 exact, D-stem-tempo 11/21, 7 regressions (5 octave errors), 0 rescues · FAIL, decisively",
					"the failure is the finding: the sum survived all six misleading stems, so cross-stem reinforcement at the true period IS the tempo signal and production's design is vindicated",
				],
				[
					"the shared tempo miss",
					"two 6/8 lilts and one 3/4 item read at 1.5x in both paths",
					"the 3:2 dotted-pulse confusion; no stem-aware variant fixed it",
				],
				[
					"the registered octave-disagreement flag",
					"fired on 10/21 items including clean ones",
					"a half-time bass is normal music, not a hazard signal: useless as shipped, reported as measured",
				],
				[
					"S9-G3: per-stem key agreement",
					"UNEVALUABLE by registered fallback (keys 20/21 right)",
					"the sting: the one wrong answer carried agreement 1.00 while production's own confidence ranked it 3rd-lowest of 21; the proposed score pointed the wrong way on the only available error",
				],
				[
					"Q4 pilot (gemini-3-flash, 12 cells)",
					"isolated stems helped nowhere, hurt twice; the 120/126/128 genre prior in both conditions",
					"Study 4's reading-not-hearing, unchanged by stem isolation · the fenced matrix stays open, unneeded by the gates",
				],
				[
					"spend",
					"$0 for the gates; ~$0.08 pilot of the $8 cap",
					"drafted by the Stem Shovel agent, finished and registered by the bench: the second cross-agent study, in the other direction",
				],
			],
		);
	})();

	// --- Study 8: boundary detection by class, blind vs chart-anchored ---
	(() => {
		const GROUPS = [
			{
				label: "texture contrast (8)",
				vals: [7, 8],
				total: 8,
				tip: "the loophole, confirmed: sparse-to-dense arrangement changes heard blind, 7/8 production and 8/8 on 3.5-flash · the program's first genuine listening result",
			},
			{
				label: "harmonic/tempo change (6)",
				vals: [3, 6],
				total: 6,
				tip: "the form half of hearing: boundaries with no arrangement change landed 3/6 blind · chart-anchored, all found and placed within 4 s",
			},
		];
		const CBLIND = "#c98500",
			CCHART = "#199e70";
		byId("legend-s8").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CBLIND +
			'"></span>blind (audio alone)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CCHART +
			'"></span>chart-anchored (the marked chart beside the mix)</span>' +
			legendNote(
				"true section boundaries found by the production model, by boundary class · detection is only half the story: blind runs also INVENTED 3.3 false boundaries per item (3 to 6 per uniform loop), and even chart-anchored, uniform loops gained ~1.2 invented boundaries per item while contrast and change items sat at zero · the gate and both models' noise are in the table",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + GROUPS.length * (GH + GPAD) + B;
		const iw = W - L - R;
		const xOf = (f) => L + f * iw;
		let g = "";
		for (const tick of [0, 0.5, 1]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${Math.round(tick * 100)}%</text>`;
		}
		let marks = "";
		let hits = "";
		GROUPS.forEach((row, gi) => {
			const top = T + gi * (GH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${top + GH / 2 + 4}" text-anchor="end">${row.label}</text>`;
			row.vals.forEach((v, ai) => {
				const y = top + ai * (BAR + GAP);
				const w = Math.max((v / row.total) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? CBLIND : CCHART}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}/${row.total}</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-sections");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of section boundaries found by the production model: texture-contrast boundaries seven of eight blind and eight of eight chart-anchored; harmonic and tempo-change boundaries three of six blind and six of six chart-anchored.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the texture-versus-form split: arrangement contrast is genuinely heard blind, musical form is not, and the chart arm finds everything while the false-boundary noise on uniform loops, about 1.2 invented sections per item even with the chart in view, is what cost the gate by half a boundary",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-sections",
			["cell", "gemini-3-flash (production)", "gemini-3.5-flash"],
			[
				[
					"S8-G1: chart-arm detection and noise",
					"14/14 found, every placement within 4 s · noise 0.53/item vs the registered 0.50 bound: FAIL, eight false boundaries where it allowed seven and a half",
					"14/14 · 0.47/item · passes",
				],
				[
					"blind: texture-contrast boundaries",
					"7/8",
					"8/8",
				],
				[
					"blind: harmonic/tempo-change boundaries",
					"3/6",
					"3/6",
				],
				[
					"blind false boundaries per item",
					"3.3 (3 to 6 invented sections per uniform loop)",
					"1.0: Study 4's generational equality does not extend to structural hearing",
				],
				[
					"chart-anchored false boundaries, uniform loops",
					"~1.2/item (0.0 on contrast and change items): the chart's silence does not beat the form prior",
					"cleaner, and passes the bound",
				],
				[
					"section names",
					"8/8 from the chart · 3/8 or worse without",
					"the same pattern: names come from text",
				],
				[
					"Amendment 1",
					"the bench's own 2000-token cap truncated 16 cells mid-JSON (the Study 2 shape, caught in our own harness); cap to 4000, failed cells re-run · two cells never produced JSON at any budget, counted as misses",
					"unaffected",
				],
			],
		);
	})();

	// --- Study 7: wrong values echoed and applied, before and after the redesign ---
	(() => {
		const ROWS = [
			{
				label: "retired design: echoed",
				v: 10,
				total: 12,
				color: "#e66767",
				tip: "Study 4's L-wrong arm on the retired confirm/correct design: the production model echoed the wrong candidate on 10/12 tempo, 9/12 meter, 11/12 key · the anchor this redesign is measured against",
			},
			{
				label: "redesign: echoed raw",
				v: 0,
				total: 12,
				color: "#199e70",
				tip: "wrong settings beside a truth-stating chart: raw echo 0/12 on the production model · told settings say 240 while the chart's mark reads 120, it follows the chart",
			},
			{
				label: "redesign: applied",
				v: 0,
				total: 24,
				color: "#199e70",
				tip: "S7-G1 PASS: zero wrong settings survived to application, 0/24 per field, production model · the successor model leaked one through the presence-based gate (1/22), naming the value-substitution refinement",
			},
			{
				label: "chord-only: echoed raw",
				v: 24,
				total: 24,
				color: "#c98500",
				tip: "S7-G2 FAIL: no tempo mark exists and the correct answer is null, yet every invented tempo equals the settings value verbatim, 47/47 cells across both models · the instruction loses to the text, the law's fourth appearance",
			},
			{
				label: "chord-only: applied",
				v: 0,
				total: 24,
				color: "#199e70",
				tip: "harm containment is total: chartStatedAnswer nulls tempo and meter on a chart that states neither, 24/24 correct refusals · the gate fails by letter while nothing wrong can reach a song",
			},
		];
		byId("legend-s7").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>the retired design (Study 4)</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>raw echo under the redesign</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>zero, raw or applied</span>' +
			legendNote(
				"wrong tempo values echoed into answers, production model, as a share of each row's cells · raw is the model's answer before the chartStatedAnswer gate; applied is what the gate lets through · v0.192.0 ported verbatim over Study 4's truth-by-construction mixes · spend about $0.40 of the $5 fence",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 255,
			R = 84;
		const H = T + ROWS.length * (BAR + GPAD) + B;
		const iw = W - L - R;
		const xOf = (f) => L + f * iw;
		let g = "";
		for (const tick of [0, 0.5, 1]) {
			const x = xOf(tick);
			g += `<line x1="${x}" x2="${x}" y1="${T}" y2="${H - B}" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>`;
			g += `<text class="chart-tick" x="${x}" y="${H - B + 20}" text-anchor="middle">${Math.round(tick * 100)}%</text>`;
		}
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.label}</text>`;
			const w = Math.max((row.v / row.total) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}/${row.total}</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.label + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-redesign");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of wrong tempo values echoed and applied: the retired design echoed ten of twelve; the redesign echoes zero of twelve raw and zero of twenty-four applied under a truth-stating chart; on chord-only charts the raw echo is twenty-four of twenty-four, every value the settings number verbatim, and the application gate reduces it to zero of twenty-four.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the loop that began with Study 4, closed and measured: deference to wrong settings fell from ten of twelve to zero wherever the chart states the truth, the instruction still loses to the settings text on chord-only charts (every invented value the settings number verbatim), and the application gate visibly catches what the instruction drops",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-redesign",
			["cell", "gemini-3-flash (production)", "gemini-3.5-flash"],
			[
				[
					"S7-G1: wrong settings applied (the gate's output)",
					"0/24 per field · PASS (the gate is production-scoped)",
					"1/22: one echoed wrong tempo passed the presence-based gate, the design limit named for value substitution",
				],
				[
					"raw echo, wrong settings beside a truth-stating chart",
					"0/12",
					"one cell (the same one the gate then passed)",
				],
				[
					"S7-G2: chord-only charts, raw invented tempo equals the settings value",
					"24/24 · FAIL",
					"23/23 (47/47 pooled, verbatim in every cell; meter identically)",
				],
				[
					"chord-only charts, applied after chartStatedAnswer",
					"0/24 · 24/24 correct refusals",
					"the same containment",
				],
				["key from chords alone", "12/12", "12/12"],
				[
					"keyChange placement under wrong-tempo bar-following",
					"3/3 → 1/3 (the arithmetic inherits the lie)",
					"3/3 → 0/3",
				],
				[
					"the retired design's anchor (Study 4 L-wrong echo)",
					"10/12 tempo · 9/12 meter · 11/12 key",
					"4/11 · 3/11 · 10/11",
				],
			],
		);
	})();

	// --- Study 6b: the key-in-force rule on unseen pages (no figure) ---
	table(
		"tbl-keyinforce",
		[
			"instrument (production reader, 24 unseen charts)",
			"detectable corrupted reads caught",
			"undetectable corrupted reads silent",
			"clean reads flagged",
		],
		[
			[
				"H-prod (the shipped key-in-force rule, pinned at its own commit)",
				"8/8 · gate PASS",
				"16/16 · gate PASS",
				"0/24: zeros in every named false-positive class",
			],
			[
				"H-bench (Study 6's exploratory variant, the only-quieter check)",
				"8/8",
				"16/16",
				"0/24: not one read where it flagged and the shipped rule stayed silent",
			],
			[
				"reproduction gate (Study 6's 148 texts, re-run before any new read)",
				"10/10",
				"0/12 fired",
				"1/42: Study 6 reproduced exactly, zero spend",
			],
		],
		"Registered by the stem-shovel agent, run by the bench unmodified: 24 new charts engraved clean and corrupted through a registered generator option, each named false-positive class 8 items strong; 48 reads, about $1.60 of the $6 cap; all four registered predictions held.",
	);

	// --- Study 6: the warning-heuristic validation table (no figure) ---
	table(
		"tbl-warnings",
		[
			"instrument (production reader)",
			"detectable corrupted reads caught",
			"undetectable reads fired",
			"clean false positives",
		],
		[
			["H-shipped (as in production)", "10/10", "2/12", "4/42"],
			["H-letters (registered refinement)", "10/10", "0/12", "2/42"],
			[
				"H-scoped, key-in-force (exploratory, post-hoc)",
				"10/10",
				"0/12",
				"1/42, and the one flag caught a read whose modulation sat three bars late",
			],
		],
		"148 existing reader texts (52 corrupted, 96 clean) from Studies 3 and 5; expected labels mechanical from the committed specs; zero model calls. Undetectable reads are stub texts that never reach the rule's eight-chord floor.",
	);

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
