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

	// --- Study 16b: the shipped two-clause samePiece on the full matrix (no figure) ---
	table(
		"tbl-samepiece-ship",
		[
			"pair class (shipped samePiece, ported verbatim and pinned by test)",
			"verdicts through the shipped code",
			"against Study 16's committed results",
		],
		[
			[
				"four right pairs (three gated plus exploratory mop-heart)",
				"4/4 samePiece true · gate PASS",
				"ratios 1.90 / 3.18 / 2.63 / 1.96, unchanged; every section placement and every hedge flag byte-equal, 74/74 comparisons · gate PASS",
			],
			[
				"six registered wrong pairs",
				"6/6 samePiece false",
				"ratios 1.13 to 1.57, under the ratio gate as in Study 16",
			],
			[
				"five alignable exploratory cross-pairs, including the escapee",
				"5/5 samePiece false · gate PASS",
				"the eat-all-the-clocks recording against the mop-heart chart crosses the ratio gate at 1.74 and is rejected by the shipped 0.30 local-cost clause; the previous ratio-only production check would have called it the same piece",
			],
			[
				"the one non-alignable pair",
				"refused",
				"by production's own chart-too-long rule, as in Study 16, the right answer by construction",
			],
		],
		"Stem Shovel shipped Study 16's urgent ask, citing the escapee pair by name in the commit message: samePiece = ratio at or above 1.6 AND median local cost at or below 0.30, constants exactly as the bench recommended, the 0.30 boundary inclusive and pinned by test before the run. Zero spend, zero model calls; both registered predictions hit.",
	);

	// --- Study 16: the two clauses on every real pair after the adoption ---
	(() => {
		const XMIN = 1.0,
			XMAX = 3.4,
			YMAX = 0.55;
		const POINTS = [
			{
				x: 1.9,
				y: 0.21,
				color: "#199e70",
				label: "letter-lands",
				labelBelow: true,
				tip: "letter-lands, migrated chart on its own recording · ratio 1.90, median local cost 0.210 · passes both clauses; Study 15's 2.04 moved by 0.14, inside the registered prediction, because the migrated chart's beat-level refinements change the rendered reference",
			},
			{
				x: 3.18,
				y: 0.177,
				color: "#199e70",
				label: "peaceful-dreams",
				tip: "peaceful-dreams, migrated chart on its own recording · ratio 3.18, median local cost 0.177 · the strongest point in the real set, within 0.03 of its Study 15 value",
			},
			{
				x: 2.63,
				y: 0.207,
				color: "#199e70",
				label: "eat-all-the-clocks",
				tip: "eat-all-the-clocks, the band's corrected chart on its own recording · ratio 2.63, median local cost 0.207 · above its Study 15 value, as registered: the chart only got truer",
			},
			{
				x: 1.96,
				y: 0.248,
				color: "#199e70",
				hollow: true,
				label: "mop-heart (exploratory)",
				tip: "mop-heart, first alignment ever: 3/4 at 224 bpm with a mid-chart key change · ratio 1.96, median local cost 0.248 · passes both clauses, exactly as predicted",
			},
			{
				x: 1.13,
				y: 0.475,
				color: "#e66767",
				tip: "letter-lands recording against the peaceful-dreams chart · ratio 1.13, median local cost 0.475 · fails both clauses",
			},
			{
				x: 1.21,
				y: 0.439,
				color: "#e66767",
				tip: "letter-lands recording against the eat-all-the-clocks chart · ratio 1.21, median local cost 0.439 · fails both clauses",
			},
			{
				x: 1.18,
				y: 0.397,
				color: "#e66767",
				tip: "peaceful-dreams recording against the letter-lands chart · ratio 1.18, median local cost 0.397 · fails both clauses",
			},
			{
				x: 1.55,
				y: 0.341,
				color: "#e66767",
				near: true,
				tip: "peaceful-dreams recording against the eat-all-the-clocks chart · ratio 1.55, five hundredths under the 1.6 gate · its median local cost of 0.341 sits above the 0.30 line, so the second clause catches it",
			},
			{
				x: 1.23,
				y: 0.333,
				color: "#e66767",
				tip: "eat-all-the-clocks recording against the letter-lands chart · ratio 1.23, median local cost 0.333 · fails both clauses",
			},
			{
				x: 1.57,
				y: 0.401,
				color: "#e66767",
				near: true,
				tip: "eat-all-the-clocks recording against the peaceful-dreams chart · ratio 1.57, three hundredths under the 1.6 gate · its median local cost of 0.401 sits well above the 0.30 line, so the second clause catches it",
			},
			{
				x: 1.19,
				y: 0.359,
				color: "#e66767",
				hollow: true,
				tip: "exploratory: mop-heart recording against the letter-lands chart · ratio 1.19, median local cost 0.359 · fails both clauses",
			},
			{
				x: 1.29,
				y: 0.437,
				color: "#e66767",
				hollow: true,
				tip: "exploratory: letter-lands recording against the mop-heart chart · ratio 1.29, median local cost 0.437 · fails both clauses",
			},
			{
				x: 1.56,
				y: 0.314,
				color: "#e66767",
				hollow: true,
				tip: "exploratory: peaceful-dreams recording against the mop-heart chart · ratio 1.56, median local cost 0.314 · fails both clauses, the cost clause by less than usual",
			},
			{
				x: 1.56,
				y: 0.341,
				color: "#e66767",
				hollow: true,
				tip: "exploratory: mop-heart recording against the eat-all-the-clocks chart · ratio 1.56, median local cost 0.341 · fails both clauses; it plots almost on top of the registered peaceful-against-eat pair at 1.55",
			},
			{
				x: 1.74,
				y: 0.323,
				color: "#e66767",
				hollow: true,
				headline: true,
				tip: "THE HEADLINE, exploratory: eat-all-the-clocks recording against the mop-heart chart · ratio 1.74, the first real wrong pair ABOVE the 1.6 ratio gate · rejected only by the second clause, median local cost 0.323 over the 0.30 line · production's shipped samePiece is still ratio-only, so the ask to AND the clause in is now urgent",
			},
		];
		byId("legend-s16").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>right chart on its own recording, registered (3)</span>' +
			'<span class="key"><span class="chip" style="background:transparent;border:2px solid #199e70"></span>right, exploratory: the first mop-heart alignment (1)</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>wrong cross-pair, registered (6)</span>' +
			'<span class="key"><span class="chip" style="background:transparent;border:2px solid #e66767"></span>wrong cross-pair, exploratory (5 plotted)</span>' +
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>the two clauses: ratio at 1.6, median local cost at 0.30</span>' +
			legendNote(
				"every real pair in the study on both same-piece clauses at once · solid marks are registered cells, hollow marks exploratory · the eat-all-the-clocks recording against the mop-heart chart is the first real wrong pair to cross the 1.6 ratio line, and only the 0.30 local-cost clause rejects it · the sixth exploratory pair, the mop-heart recording against the peaceful-dreams chart, cannot be plotted: production's own chart-too-long rule refused it before alignment ran, the right answer by construction · zero spend, no model calls",
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
		// the zone the headline pair exposes: past the ratio line, above the cost line
		g += `<rect x="${xOf(1.6)}" y="${T}" width="${L + iw - xOf(1.6)}" height="${yOf(0.3) - T}" fill="rgba(201,133,0,0.06)"/>`;
		const rx = xOf(1.6);
		g += `<line x1="${rx}" x2="${rx}" y1="${T}" y2="${H - B}" stroke="#8b93a3" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#8b93a3" font-size="11" x="${rx + 6}" y="${T + 12}" text-anchor="start">ratio 1.6</text>`;
		const cy30 = yOf(0.3);
		g += `<line x1="${L}" x2="${L + iw}" y1="${cy30}" y2="${cy30}" stroke="#8b93a3" stroke-width="1.5" stroke-dasharray="5 4"/>`;
		g += `<text fill="#8b93a3" font-size="11" x="${L + iw - 4}" y="${cy30 - 7}" text-anchor="end">median 0.30</text>`;
		g += `<text fill="#c98500" font-size="11" x="${L + iw - 4}" y="${T + 14}" text-anchor="end">ratio alone says same piece here; only the cost clause rejects</text>`;
		g += `<text fill="#199e70" font-size="11" x="${L + iw - 4}" y="${H - B - 10}" text-anchor="end">both clauses pass here</text>`;
		let marks = "";
		let hits = "";
		POINTS.forEach((p) => {
			const cx = xOf(p.x);
			const cy = yOf(p.y);
			marks += p.hollow
				? `<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="${p.color}" stroke-width="2.5"/>`
				: `<circle cx="${cx}" cy="${cy}" r="7" fill="${p.color}"/>`;
			if (p.headline) {
				marks += `<circle cx="${cx}" cy="${cy}" r="13" fill="none" stroke="#ebf92f" stroke-width="1.5" stroke-dasharray="3 3"/>`;
				marks += `<text fill="#ebf92f" font-size="11" x="${cx + 18}" y="${cy - 4}" text-anchor="start">the first wrong pair past the ratio gate</text>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${cx + 18}" y="${cy + 10}" text-anchor="start">eat recording against the mop-heart chart · 1.74 / 0.323</text>`;
			}
			if (p.label)
				marks += `<text fill="#c3c9d4" font-size="11" x="${cx}" y="${p.labelBelow ? cy + 20 : cy - 12}" text-anchor="middle">${p.label}</text>`;
			if (p.near)
				marks += `<text fill="#c3c9d4" font-size="11" x="${cx - 12}" y="${cy + 4}" text-anchor="end">${p.x.toFixed(2)} · ${p.y.toFixed(3)}</text>`;
			hits += `<circle cx="${cx}" cy="${cy}" r="16" fill="transparent" data-tip="${esc(p.tip)}"/>`;
		});
		const el = byId("fig-adoption");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of fifteen real pairs by tritone ratio and median local cost after the barmark adoption: four right charts sit right of the 1.6 ratio line and below the 0.30 cost line, ten wrong cross-pairs fail at least one clause, and the highlighted exploratory pair at ratio 1.74 and median 0.323 is the first wrong pair past the ratio line, rejected only by the cost clause.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the adoption's same-piece landscape: the four right charts land alone where both clauses pass, ten wrong pairs fail at least one clause, and the highlighted pair crosses the ratio line for the first time in the program, which is exactly the failure mode the AND of the two clauses exists to catch",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-adoption",
			["cell", "result", "the read"],
			[
				[
					"G1: cross-parser agreement",
					"the three committed app-dialect texts through the retired chordChartBars and through barmark 0.5.0 behind the production adapter: 76 / 152 / 86 bars, zero differences, zero warnings · PASS",
					"the retired parser is the yardstick and the new one matches it bar for bar: nothing the app could read was lost in the adoption",
				],
				[
					"G2: the migration, graded",
					"every public migrated chart parses with zero warnings and lands every band-declared section start at 0.0000 s on its own grid: letter-lands 76 bars / 10 sections, peaceful-dreams 153 / 10, eat-all-the-clocks 71 / 9, exploratory mop-heart 140 / 8 · letter and peaceful also match the verified content exactly · PASS",
					"grid-perfect against a ±0.10 s gate, including the hardest chart in the catalog, 3/4 at 224 bpm with a mid-chart key change",
				],
				[
					"G3: the two-clause same-piece",
					"right pairs 1.90 / 3.18 / 2.63 with medians 0.177 to 0.210 (exploratory mop-heart 1.96 / 0.248); all six registered wrong pairs fail, ratios 1.13 to 1.57 against medians 0.333 to 0.475 · PASS",
					"the headline: the exploratory eat-recording against mop-chart pair scores 1.74, the first real wrong pair above the 1.6 ratio gate, rejected only by the local-cost clause at 0.323 · production's shipped samePiece is still ratio-only, so the ask to AND the clause in is now urgent",
				],
				[
					"the refusal, recorded",
					"one exploratory pair, the mop-heart recording against the peaceful-dreams chart, was refused outright: production's own rule that a chart running more than twice the recording must be turned away",
					"the right answer by construction, recorded under Amendment 1; the production path rejected a wrong pair before alignment ever ran",
				],
				[
					"G4: placement no-regression, baseline named",
					"letter-lands median |section error| 0.05 s against Study 15's 0.08; peaceful-dreams 0.11 against 0.11 · and eat-all-the-clocks drops from 1.99 s to 0.09 s with the band's corrected chart · PASS",
					"the entirely new parse path costs nothing in placement, and the Study 12 verdict that the chart, not the aligner, was the bottleneck is confirmed by the fix",
				],
				[
					"the predictions, and the verdict",
					"4/4: bar counts exactly 76 / 153 / 71; eat gate-grade at 0.09 s; ratios moved at most 0.14 where content was preserved; mop-heart's first alignment passes both clauses · $0 spend, 95 cells, no model calls",
					"adoption validated, ship with confidence · the standing asks: the LAST-SOUND ring-out refinement from Study 15, and the medianLocal clause in production samePiece, promoted from recommendation to urgent",
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
			{
				x: 2.04,
				y: 0.243,
				color: "#199e70",
				label: "letter-lands",
				tip: "letter-lands, right chart on its own recording · ratio 2.04, median local cost 0.243 · passes both clauses",
			},
			{
				x: 3.21,
				y: 0.172,
				color: "#199e70",
				label: "peaceful-dreams",
				tip: "peaceful-dreams, the band's machine-true revision on its own recording · ratio 3.21, median local cost 0.172 · the strongest point in the real set, and the song that qualified as the second gated chart",
			},
			{
				x: 2.53,
				y: 0.224,
				color: "#199e70",
				label: "eat-all-the-clocks",
				tip: "eat-all-the-clocks, right chart on its own recording · ratio 2.53, median local cost 0.224 · lands near the 2.5 the bench predicted",
			},
			{
				x: 1.13,
				y: 0.47,
				color: "#e66767",
				tip: "letter-lands recording against the peaceful-dreams chart · ratio 1.13, median local cost 0.470 · fails both clauses",
			},
			{
				x: 1.17,
				y: 0.482,
				color: "#e66767",
				tip: "letter-lands recording against the eat-all-the-clocks chart · ratio 1.17, median local cost 0.482 · fails both clauses",
			},
			{
				x: 1.15,
				y: 0.456,
				color: "#e66767",
				tip: "peaceful-dreams recording against the letter-lands chart · ratio 1.15, median local cost 0.456 · fails both clauses",
			},
			{
				x: 1.58,
				y: 0.365,
				color: "#e66767",
				near: true,
				tip: "peaceful-dreams recording against the eat-all-the-clocks chart · ratio 1.58, two hundredths under the 1.6 constant · its median local cost of 0.365 sits well above the 0.30 line, so the second clause catches it comfortably",
			},
			{
				x: 1.24,
				y: 0.417,
				color: "#e66767",
				tip: "eat-all-the-clocks recording against the letter-lands chart · ratio 1.24, median local cost 0.417 · fails both clauses",
			},
			{
				x: 1.57,
				y: 0.4,
				color: "#e66767",
				near: true,
				tip: "eat-all-the-clocks recording against the peaceful-dreams chart · ratio 1.57, three hundredths under the 1.6 constant · its median local cost of 0.400 sits well above the 0.30 line, so the second clause catches it comfortably",
			},
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
			{
				label: "wrong charts, real",
				vals: [1.17, 1.24],
				color: "#e66767",
				tip: "the real-domain wrong pairs Amendment 1 added: 1.17 and 1.24 · the registered pairs could not see the collapse, which is why the amendment exists",
			},
			{
				label: "right charts, real",
				vals: [2.04, 2.53],
				color: "#199e70",
				tip: "the band's own correct charts on their real recordings: 2.04 and 2.53, both BELOW the shipped threshold of 3, so samePiece called them mismatches and hedged everything · on synthetic audio the same right charts score 24 to 49, far off this axis: the home-field lesson, third appearance",
			},
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
				rows: [
					{ name: "matcher at home", v: 95.8, color: "#8b93a3", note: "95.8%" },
				],
				tip: "Basic Pitch + the v0.142 matcher on the synthetic bench: 95.8%, the Study 10 winner over the neural reader · the material its templates were born on",
			},
			{
				label: "real recording (76 bars)",
				rows: [
					{ name: "matcher alone", v: 38.2, color: "#e66767", note: "29/76" },
					{
						name: "+ gemini reconciler",
						v: 47.4,
						color: "#c98500",
						note: "36/76",
					},
					{
						name: "+ fable reconciler",
						v: 53.9,
						color: "#199e70",
						note: "41/76",
					},
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
				"wrong declarations accepted on the three mirror items (straight running eighths declared wrongly at 2/3), the fixture Stem Shovel designed to defeat the bench's own rule · the full-corpus and x3-rung arms are in the table · zero model spend",
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
			"\"></span>D-activity (Study 9's per-stem detector, zero cost)</span>" +
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
				["blind: texture-contrast boundaries", "7/8", "8/8"],
				["blind: harmonic/tempo-change boundaries", "3/6", "3/6"],
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

	// --- Studies 20 and 20b: the color experiment and the held-out power hint ---
	(() => {
		const ROWS = [
			{
				song: "letter-lands (anchor)",
				v: 96,
				n: "24/25",
				color: "#199e70",
				tip: "power-chord rock, ~15.5 transcribed notes a bar · the rule fires 25 times, 24 right · every fire on a right root",
			},
			{
				song: "peaceful-dreams (HELD OUT)",
				v: 81,
				n: "39/48",
				color: "#199e70",
				tip: "held-out truth, never seen before registration · 48 fires, 39 right, and on bare power-chord truth it was PERFECT, 39 of 39 · six misses are the X5(7) vocabulary gap: power-class right, chart spelling absent · all 48 fires on a right root",
			},
			{
				song: "eat-all-the-clocks (anchor)",
				v: 63,
				n: "10/16",
				color: "#c98500",
				tip: "mixed material: 50 power slots but also 32 minor and 4 major · 16 fires, 10 right · 3 of the 6 misses are inherited wrong roots",
			},
			{
				song: "mop-heart (HELD OUT)",
				v: 0,
				n: "0/16",
				color: "#e66767",
				tip: "sparse 3/4 triads (Vox, Bass, Keys; ~5.5 transcribed notes a bar at 224 bpm) · 16 fires, 16 misses, every one on a plain major-triad bar: the transcription never wrote the third, and the rule read that silence as a power chord",
			},
		];
		byId("legend-s20").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>above the gate alone</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>below the gate</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>every fire a miss</span>' +
			legendNote(
				"the frozen power rule's strict precision per song (Study 20b) · the registered gate: combined HELD-OUT precision at least 75% · measured: 60.9% (39 of 64), S20B-G1 FAIL · the blind pitch-floor variant read 48.8% and is not recommended",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 230,
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
		const gateX = xOf(75);
		g += `<line x1="${gateX}" x2="${gateX}" y1="${T}" y2="${H - B}" stroke="#c3c9d4" stroke-width="1" stroke-dasharray="4 4"/>`;
		g += `<text class="chart-tick" x="${gateX}" y="${H - B + 34}" text-anchor="middle">the 75% gate</text>`;
		let marks = "";
		let hits = "";
		ROWS.forEach((row, i) => {
			const y = T + i * (BAR + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.song}</text>`;
			const w = Math.max((row.v / 100) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}% (${row.n})</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.song + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-colorhint");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of the frozen power rule's precision by song against the 75 percent gate: 96 percent on letter-lands and 81 percent on peaceful-dreams, both power-chord material; 63 percent on eat-all-the-clocks; zero percent on mop-heart, the sparse triadic waltz, where all sixteen fires missed.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the held-out verdict in one frame: the rule is near-perfect on dense power-chord material and wrong every single time on sparse triads, so its precision is a function of arrangement density, and the hint cannot tell which song it is in",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-colorhint",
			["cell", "result", "the read"],
			[
				[
					"Study 20, all four gates",
					"FAIL · strict 22/76 and 14/86 vs pass lines 46 and 38, after 438/440 on the synthetic fixture · root-level falls 59 to 55 and 53 to 33 · cost of guessing 4 and 20 · the negative control beats the candidate 48 to 36 strict",
					"the program's first full refutation: the recoloring destroys credit the bare model had, and the forced-root matcher with sevenths allowed outscores the hand rules, so the seventh fence was not the protective piece",
				],
				[
					"the cause",
					"on ~50 of the gated song's 74 power bars the re-transcription shows a third or fourth above the 12% line that the guitars never played",
					"the Study 13 smear class: on those bars the right color is unreachable by any profile-threshold rule, because the note evidence itself contradicts it · the sus rules were the damage (33 calls, 0 right), the slash rule fired 14 times with no slash truth anywhere, the flip was dropped by its registered decision rule",
				],
				[
					"Study 20b protocol",
					"the surviving power rule frozen verbatim; gates registered BEFORE the bench saw the held-out truth; charts committed verbatim with provenance on arrival; a blind pitch-floor variant as a disclosed secondary arm",
					"the program's first held-out-truth study: registration first, truth second, run third, nothing re-thresholded after",
				],
				[
					"S20B-G1 (held-out precision >= 75%)",
					"FAIL: 60.9% (39 of 64 fires) · peaceful-dreams 81% with 39/39 PERFECT on bare power truth · mop-heart 0% (16 fires, 16 misses, all on plain triads)",
					"precision is a function of arrangement density (~15.5 notes a bar vs ~5.5): an absent third is evidence only when density says a played third would have been transcribed · six peaceful misses are the X5(7) spelling gap, and crediting them still reads 70.3%, a fail either way",
				],
				[
					"S20B-G2 (anchors) and the bench's own errors",
					"FAIL as registered: 25/24 and 16/10 vs constants of 23/22 and 12/7 · diagnosed bar for bar: the constants counted bare X5 symbols where the rule counts firings (slash-dressed power calls included) · the pipeline itself reproduced bit-exactly",
					"disclosed beside Study 20's sus4-before-power interpretation (cost 3 + 11 bars, gates fail under either order): two bench errors, owned in the report, neither re-thresholded",
				],
				[
					"arm B (the blind pitch floor)",
					"48.8% (39 of 80) · on mop-heart 33 fires, all wrong",
					"the floor strips the bass register where that arrangement carries its thirds, manufacturing false absences · registered decision rule keeps A; the floor idea is dead on this material",
				],
				[
					"the ledger",
					"$0 across both studies, zero model calls · 941 cells · verdicts delivered same-day; nothing ships; the hedge stays 'never a power chord'",
					"banked for the program: bar-level truth for two more real songs, including the sparse-triad trap song every future chord study should keep",
				],
			],
		);
	})();

	// --- Study 21: the reader on the rest of the catalog ---
	(() => {
		const ROWS = [
			{
				song: "peaceful-dreams (HELD OUT)",
				v: 97.4,
				n: "149/153",
				color: "#199e70",
				tip: "the best root performance in the program · extended-allowance grade 73/153 (the registered gate misses by 4 bars) because 62 bars carry qualities outside the allowance vocabulary: the model answers X7 on 24 of 32 X5(7) bars (it hears the optional seventh) and X7/Xsus4 on the 7sus4 bars (roots 29/30, half-right, zero credit)",
			},
			{
				song: "letter-lands (anchor)",
				v: 92.1,
				n: "70/76",
				color: "#199e70",
				tip: "anchor reproduced exactly, fourth time: 59/76 under the power allowance · the root-only read from Study 17's disclosed anatomy",
			},
			{
				song: "eat-all-the-clocks (anchor)",
				v: 89.3,
				n: "75/84",
				color: "#199e70",
				tip: "anchor reproduced exactly, fourth time: 53/86 under the power allowance · 84 chord-bearing bars",
			},
			{
				song: "mop-heart (HELD OUT)",
				v: 82.1,
				n: "115/140",
				color: "#199e70",
				tip: "the program's first big STRICT result: 107/140 bars EXACTLY right, zero allowance credit, plain triads are the model's native vocabulary, on the same sparse 3/4 arrangement whose silence broke the note-channel power hint 16 times out of 16",
			},
		];
		byId("legend-s21").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>root-level accuracy</span>' +
			legendNote(
				"the shipped reader's roots per song, anchors and held-out: 409/453 = 90.3% combined · S21-G1 (anchors exact) PASS · S21-G2 (each held-out song at least 50% under the registered extended allowance) FAIL by 4 bars on peaceful-dreams, the anatomy puts the miss in the grade's vocabulary, not the hearing",
			);
		const W = 880,
			BAR = 16,
			GPAD = 12,
			T = 8,
			B = 42,
			L = 230,
			R = 100;
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
			g += `<text class="chart-tick" x="${L - 12}" y="${y + BAR - 3}" text-anchor="end">${row.song}</text>`;
			const w = Math.max((row.v / 100) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${row.color}" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 4}">${row.v}% (${row.n})</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${BAR}" fill="transparent" data-tip="${esc(row.song + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-reader21");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of the shipped chord reader's root-level accuracy by song: 97.4 percent on held-out peaceful-dreams, 92.1 and 89.3 percent on the two anchors, and 82.1 percent on held-out mop-heart, where 107 of 140 bars were exactly right with no allowance.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the generalization verdict: the reader's roots hold 82 to 97 percent on songs it never saw, with the held-out power-chord song reading best of all, so the two-song headline was not an artifact of the development material",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-reader21",
			["cell", "result", "the read"],
			[
				[
					"S21-G1: the anchors",
					"letter-lands 59/76 and eat-all-the-clocks 53/86, reproduced to the digit · PASS exact, the fourth reproduction",
					"the instrument proved before any new number was read, as in Studies 17, 19 and 20",
				],
				[
					"the registered grading decision",
					"the power allowance extends to truth quality 5(7) (a power chord with an optional seventh declares no third either), decided and committed before the data existed · a pin test proves the extended grade identical to Study 13's wherever 5(7) is absent",
					"no prior study's number could move, and the extension's effect is reported beside the verbatim grade on every song",
				],
				[
					"S21-G2: each held-out song at least 50%",
					"mop-heart 107/140 (76.4%) PASS · peaceful-dreams 73/153 (47.7%) FAIL by 4 bars · the gate fails as registered",
					"the honest headline and the anatomy sit side by side: the gate's grade speaks the anchors' chart dialect, and peaceful-dreams is written in a different one",
				],
				[
					"the anatomy: dialect, not hearing",
					"peaceful-dreams roots 149/153 (97.4%) · on the 32 X5(7) bars the model says X7 on 24 (it hears the optional seventh; 7 is not in the allowance set) · on the 30 7sus4 bars it says X7 or Xsus4 (roots 29/30, each half the truth, credit zero)",
					"62 bars (40% of the song) carry qualities outside the registered vocabulary, and the model's answers on them are more specific than the allowance anticipated, the predicted 5(7) windfall came to 6 bars instead of 15 to 30 for exactly that reason",
				],
				[
					"mop-heart: the first big strict result",
					"107/140 bars EXACTLY right, zero allowance credit · roots 115/140 · strict-first equals right, as predicted, to the bar",
					"plain triads are the model's native vocabulary, and the sparse 3/4 arrangement that broke the note-channel power hint (Study 20b: 16 fires, 16 misses) does not trouble a reader that hears the mix",
				],
				[
					"the ledger",
					"$0, zero model calls, no transcription · combined roots 409/453 = 90.3% · combined extended-allowance 292/453 = 64.5%, within ten points of the two-song 69.1% · predictions 3 right, 2 wrong",
					"the reader's numbers now stand on four songs instead of two; registered lesson: allowance vocabularies are set against each chart's own symbol census before the run, never patched after",
				],
			],
		);
	})();

	// --- Study 22: the bar grid from the recording alone (table only) ---
	(() => {
		table(
			"tbl-grid22",
			["cell", "result", "the read"],
			[
				[
					"S22-G1, first run: the sanity gate",
					"0% on all four synthetic renders, whose true bar starts are exact",
					"the bench's registered metric was defective: index-paired scoring against a phase that exists only modulo the bar period scored a 68 ms-accurate comb as zero, one bar shifted",
				],
				[
					"amendment 1, re-registered",
					"lattice distance: each truth bar start against the nearest lattice point, with each arm's period reported beside its rate (a half-period lattice contains the true one and would otherwise take silent octave credit) · thresholds untouched · the defective run's numbers disclosed as seen",
					"the program's defective-grader rule applied: stop, fix, re-register, re-run · re-run sanity: 100.0% on all four renders, S22-G1 PASS",
				],
				[
					"S22-G2: the decision gate (declared tempo + blind phase >= 80% per song)",
					"FAIL everywhere: 68.8% (letter-lands), 19.5% (eat), 16.2% (peaceful), 8.5% (mop-heart)",
					"the end-to-end draft study may NOT assume a derivable uniform grid; it runs grid-given",
				],
				[
					"the ceiling: least-squares fit to the truth itself",
					"27.3 to 37.9% with ~400 ms mean error, against tolerances of 122 to 280 ms",
					"when the best possible uniform grid misses two-thirds of the truth, the limit is the ruler: the chart-anchored DTW truth is quantized at 93 ms and its path wanders by hundreds of ms per bar, which per-bar chord grading tolerates (Study 21 read 97% roots on these grids) and a bar-position gate cannot see through · band drift and ruler wander are inseparable with current instruments",
				],
				[
					"the blind detector arm",
					"detected tempo on a Study 11 ladder rung of the declared on all four songs (1.0, 1.0, 1.499, 2.0) · raw-octave grids score under 30%",
					"the ladder fold is load-bearing for any future grid work; the 224 bpm waltz can only ever appear as half time (the detector's range caps at 210, disclosed at registration, as was the octave prior's tuning on this very catalog)",
				],
				[
					"the ledger",
					"$0 · 910 cells across the valid run's gated arms · what would unlock the question: human-tapped downbeats on one or two songs",
					"predictions: two right, two wrong (the ceiling, decisively), one not evaluable, and one wrong-then-right through the amendment its failure forced",
				],
			],
		);
	})();

	// --- Study 23: recording to chart, the end-to-end pilot ---
	(() => {
		const SONGS = [
			{
				song: "letter-lands",
				chart: 94.7,
				json: 94.7,
				chartN: "72/76",
				jsonN: "72/76",
				tip: "the one song whose chart carried the right bar count (76): both channels read 72/76 roots, ABOVE the hint's 70",
			},
			{
				song: "eat-all-the-clocks",
				chart: 35.7,
				json: 81.0,
				chartN: "30/84",
				jsonN: "68/84",
				tip: "the chart renders 68 of 86 bars, so index-paired roots collapse · the JSON is bar-exact at 68/84, the pilot's one true musical regression (hint 74/84) on the vocal-heavy song",
			},
			{
				song: "peaceful-dreams",
				chart: 0,
				json: 98.7,
				chartN: "unparseable",
				jsonN: "151/153",
				tip: "the chart does not parse: cell-level repeats (| D5 x8 |) the notation does not define, invited by the prompt's own compact example · the JSON reads 151/153 roots, above the reader's 149, with strict credit on 84 bars vs the reader's 20 and 11 of 62 dialect bars EXACTLY right (D7sus4 written strictly 11 times; G7 on the G5(7) bars)",
			},
			{
				song: "mop-heart",
				chart: 27.1,
				json: 93.6,
				chartN: "38/140",
				jsonN: "131/140",
				tip: "the chart under-writes its section repeats and loses 56 bars · the JSON is bar-exact: 131/140 roots and 129/140 strict on the all-triad waltz",
			},
		];
		byId("legend-s23").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>the chart the app parses (every gate sat here)</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>the same answer\u2019s JSON chords field</span>' +
			legendNote(
				"root-level accuracy over chord-bearing bars, per channel · all four gates FAIL on the chart channel (one chart unparseable, two missing 18 and 56 bars) · the JSON channel is bar-exact on every song and carries the program's best chord numbers · the verdict: build the chart from the JSON by code, stop trusting model markdown",
			);
		const W = 880,
			BAR = 13,
			PAIR = 3,
			GPAD = 16,
			T = 8,
			B = 42,
			L = 190,
			R = 110;
		const groupH = BAR * 2 + PAIR;
		const H = T + SONGS.length * (groupH + GPAD) + B;
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
		SONGS.forEach((row, i) => {
			const y = T + i * (groupH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + groupH / 2 + 4}" text-anchor="end">${row.song}</text>`;
			const wChart = Math.max((row.chart / 100) * iw, 2);
			const wJson = Math.max((row.json / 100) * iw, 2);
			marks += `<rect x="${L}" y="${y}" width="${wChart}" height="${BAR}" fill="#e66767" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + wChart + 8}" y="${y + BAR - 2}">${row.chart}% (${row.chartN})</text>`;
			marks += `<rect x="${L}" y="${y + BAR + PAIR}" width="${wJson}" height="${BAR}" fill="#199e70" rx="3"/>`;
			marks += `<text fill="#c3c9d4" font-size="11" x="${L + wJson + 8}" y="${y + BAR * 2 + PAIR - 2}">${row.json}% (${row.jsonN})</text>`;
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${groupH}" fill="transparent" data-tip="${esc(row.song + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-autochart");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Paired bar chart of root accuracy by song and channel: the chart channel reads 94.7, 35.7, 0 and 27.1 percent while the same answers' JSON channel reads 94.7, 81, 98.7 and 93.6 percent.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the pilot in one frame: the model hears the songs (green, the JSON it returns) and loses them in serialization (red, the markdown chart the app would parse), so the fix is deterministic rendering, not better ears",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-autochart",
			["cell", "result", "the read"],
			[
				[
					"S23-G1 (every chart parses) and G2 (bar count exact on >= 3 of 4)",
					"FAIL and FAIL: peaceful-dreams unparseable; eat renders 68/86 bars, mop-heart 84/140; only letter-lands exact (1/4)",
					"the failure modes are legible: cell-level repeats (| D5 x8 |) the notation does not define, invited by the production prompt's own compact example (D(7)sus4 \u00b7 D5 x2), and under-written section repeats",
				],
				[
					"S23-G3 (chart roots >= hint roots minus 5 points, every song)",
					"FAIL on the gated channel · on the JSON channel three of four songs sit ABOVE their hint (72/76 vs 70, 151/153 vs 149, 131/140 vs 115) and one below (eat: 68/84 vs 74)",
					"the draft layer preserves or improves the reader's roots whenever its answer is read at bar-exact granularity; the vocal-heavy song is the one true musical regression and the thing a re-test should examine",
				],
				[
					"S23-G4 (the color question: peaceful's 62 dialect bars, strict, >= 10)",
					"FAIL at 0 on the chart channel · 11/62 on the JSON channel, where the gate's line was 10",
					"the recovery the whole arc pointed at is real: D7sus4 (named in the prompt's examples) written strictly 11 times where the reader scores zero by vocabulary, and G7 on ten G5(7) bars, the seventh heard, the spelling absent from every example · one example line showing the 5(7) spelling would likely convert those ten",
				],
				[
					"the verdict to the app",
					"build the chart deterministically from the JSON's chords and sections fields; stop trusting model markdown as the document of record · constraining the prompt's examples to row notation is the weaker second option · any re-test is a new registration",
					"the composition is one deterministic step from viable: with a code-built chart, G1, G2 and G4 would have passed this pilot as run",
				],
				[
					"the ledger",
					"$0.31 of the registered $2 fence · 4 fable calls, production shape · 455 gated cells · all five predictions wrong on the gated channel, every predicted mechanism visible in the JSON",
					"the bench predicted the music and failed to predict the serialization; the gates stand as registered because the chart is what ships",
				],
			],
		);
	})();

	// --- Study 23b: the chartless-song grid (baseline vs tap vs blind comb) ---
	(() => {
		const SONGS = [
			{
				song: "letter-lands",
				base: 94.7,
				tap: 51.3,
				comb: 68.4,
				baseN: "72/76",
				tapN: "39/76",
				combN: "52/76",
				tip: "declared 132 bpm, exact per the correction \u00b7 the '7.15s intro' was the ruler's start error: the recording opens on chart bar one at t near 0, so the 'tap' anchor was four bars late",
			},
			{
				song: "eat-all-the-clocks",
				base: 81.0,
				tap: 25.0,
				comb: 60.7,
				baseN: "68/84",
				tapN: "21/84",
				combN: "51/84",
				tip: "the worst collapse: 21/84 \u00b7 corrected same day: the recording is exactly 120 bpm; its chart is ~13 bars longer than the recording plays (172s of chart, 147.5s of audio), so the tail bars are unchartable from the audio",
			},
			{
				song: "peaceful-dreams",
				base: 98.7,
				tap: 41.8,
				comb: 90.2,
				baseN: "151/153",
				tapN: "64/153",
				combN: "138/153",
				tip: "the dialect casualty: 11 of 62 chart-dialect bars exactly right grid-given, 4 under the tap, 6 under the comb \u00b7 color spelling needs the right notes in the right bar",
			},
			{
				song: "mop-heart",
				base: 93.6,
				tap: 37.9,
				comb: 95.0,
				baseN: "131/140",
				tapN: "53/140",
				combN: "133/140",
				tip: "the inversion's sharpest frame: the blind comb lands ABOVE the grid-given baseline (133 vs 131) while the perfect tap reads 53/140 \u00b7 repeating progressions forgive whole-bar shifts; the comb's grid is still not truth (6 lattice hits of 140)",
			},
		];
		byId("legend-s23b").innerHTML =
			'<span class="key"><span class="chip" style="background:#199e70"></span>grid-given baseline (Study 23, recomputed in-run)</span>' +
			'<span class="key"><span class="chip" style="background:#e66767"></span>B2: perfect tap, declared tempo</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>B1: blind onset comb, declared tempo</span>' +
			legendNote(
				"root-level accuracy over chord-bearing bars, JSON chords channel, index-paired against the chart \u00b7 S23B-G1 FAIL on every song (tap within 5 points of baseline: never) \u00b7 S23B-G2 PASS inverted (the comb beat the tap everywhere) \u00b7 corrected same day: the recordings are metronome-exact at declared bpm, and the tap arm was anchored four bars late by the bench's own ruler; see the correction section",
			);
		const W = 880,
			BAR = 11,
			PAIR = 2,
			GPAD = 16,
			T = 8,
			B = 42,
			L = 190,
			R = 110;
		const groupH = BAR * 3 + PAIR * 2;
		const H = T + SONGS.length * (groupH + GPAD) + B;
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
		const series = [
			["base", "baseN", "#199e70"],
			["tap", "tapN", "#e66767"],
			["comb", "combN", "#c98500"],
		];
		SONGS.forEach((row, i) => {
			const y = T + i * (groupH + GPAD);
			g += `<text class="chart-tick" x="${L - 12}" y="${y + groupH / 2 + 4}" text-anchor="end">${row.song}</text>`;
			series.forEach(([k, kn, color], j) => {
				const v = row[k];
				const w = Math.max((v / 100) * iw, 2);
				const by = y + j * (BAR + PAIR);
				marks += `<rect x="${L}" y="${by}" width="${w}" height="${BAR}" fill="${color}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${by + BAR - 1}">${v}% (${row[kn]})</text>`;
			});
			hits += `<rect x="${L}" y="${y}" width="${iw}" height="${groupH}" fill="transparent" data-tip="${esc(row.song + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-chartless");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of root accuracy by song: the grid-given baseline reads 94.7, 81, 98.7 and 93.6 percent; the perfect-tap arm reads 51.3, 25, 41.8 and 37.9; the blind comb reads 68.4, 60.7, 90.2 and 95.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the tap arm (red) is the worst arm measured, and the same-day correction explains why: its 'perfect' anchor was the bench ruler's first bar, four bars late on two songs, so index-paired grading punished every uniform arm by whole-bar shifts; the recordings themselves are metronome-exact at declared bpm",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-chartless",
			["cell", "result", "the read"],
			[
				[
					"S23B-G1 (tap arm roots within 5 points of the grid-given baseline, every song)",
					"FAIL on all four songs: 39/76 vs 72, 21/84 vs 68, 64/153 vs 151, 53/140 vs 131",
					"the registered prediction called the failure but not its universality (mop-heart was predicted to survive at 0.9% period error and lost 56 points) \u00b7 the declared-tempo rot is universal on this corpus",
				],
				[
					"the grid anatomy (mechanical, $0)",
					"B2 hits the truth lattice at EXACTLY ONE bar per song, its own anchor; mean per-bar error 3.3 to 8.4 seconds \u00b7 B1's mean error is roughly half of B2's with 3 to 7 lattice hits",
					"the phase was perfect by construction, so the entire tap-arm error is the period \u00b7 the comb's wrong-by-bars phase recenters a wrong-period lattice mid-song, which is compensation, not correctness",
				],
				[
					"S23B-G2 (blind comb within 5 points of the tap, every song)",
					"PASS, inverted: the comb BEAT the tap on all four songs, and mop-heart's 133/140 sits above its own grid-given baseline (131/140)",
					"repeating progressions forgive index shifts by whole loops, so a periodic song grades gently on a shifted grid \u00b7 registered lesson: any future grid gate should also report a shift-sensitive measure",
				],
				[
					"the downbeat shootout ($0, no gate)",
					"onset comb 3/4 hits within 15% of a bar (53, 15, 115 ms; misses peaceful at 766) \u00b7 chord-change comb 2/4 \u00b7 bass comb 1/4 \u00b7 music-start anchor 2/4 by circular error only (corrected same day: its letter-lands anchor is t=0, four bars before the charted music; 121 ms was mod-period coincidence)",
					"tap-free anchoring is already roughly tap-grade on this corpus, and the tap arm just proved anchors are not the problem \u00b7 the period is",
				],
				[
					"the registered decision and the ledger",
					"decision as first published: true-tempo estimation \u00b7 WITHDRAWN same day: the tempo is exact and the ruler was broken (see the correction section) \u00b7 \u2248$0.60 of the $2 fence, 8 fable calls, 922 cells \u00b7 predictions: 2 right, 2 half right, 2 wrong (the inversion was called in the opposite direction)",
					"the follow-up ran and its onset joint comb recovered the exact tempo on all four songs \u00b7 the corrected guidance: declared bpm as the period, bar one near t=0, arrangement mismatch as the open problem",
				],
			],
		);
	})();

	// --- Study 24: the joint phase-and-period combs, corrected same day (no figure) ---
	table(
		"tbl-tempo24",
		[
			"song",
			"first reading (as registered: combs vs the in-run fit to the aligned truth, draft vs baseline)",
			"re-read under the same-day correction (true periods: the declared ones, exactly)",
		],
		[
			[
				"letter-lands (132 bpm declared)",
				"P1 1.9142s, P2 1.8185s, both 'off' the 1.6534s fit \u00b7 draft 36/76 vs baseline 72/76",
				"true period 1.8182s: P2 was 0.02% from exact and the 'fit' was the broken ruler \u00b7 the draft collapse was a whole-bar index shift (the recording opens on chart bar one at t\u22480; the '7.15s intro' never existed) \u00b7 true-grid reader hints alone: 70/76",
			],
			[
				"eat-all-the-clocks (120 bpm declared)",
				"P1 2.0064s, P2 2.0004s vs a 1.6155s fit \u00b7 draft 24/84 vs baseline 68/84",
				"true period 2.0000s: P2 exact to 0.02%, P1 to 0.3% \u00b7 the apparent defect was arrangement; the second correction traced it to the bench's 86-bar fixture vs the band's live 71-bar chart \u00b7 true-grid hints on the corrected chart: 65/71, uniform",
			],
			[
				"peaceful-dreams (145 bpm declared)",
				"P1 1.6558s, P2 1.6552s \u00b7 draft 148/153 vs baseline 151/153 \u00b7 dialect 18/62 exact, above grid-given's 11",
				"P2 found the exact period \u00b7 the parity result and the program's best color number stand",
			],
			[
				"mop-heart (224 bpm declared, 3/4)",
				"P1 0.8031s, P2 0.8036s \u00b7 draft 136/140, ABOVE the 131/140 baseline",
				"P2 exact \u00b7 the above-baseline result stands",
			],
			[
				"gates and ledger",
				"S24-G1 PASS (disclosed hollow: a least-squares ceiling is the wrong objective for a hit-rate gate) \u00b7 S24-G2 FAIL on letter-lands and eat-all-the-clocks \u00b7 916 cells \u00b7 \u2248$0.30 of a $2 fence",
				"gates stand as registered measurements of their constructions; the tempo interpretation is withdrawn \u00b7 the standing lesson entered the ledger: take the alignment truth's BINS, never its GEOMETRY",
			],
		],
		"The registered study asked the joint phase-and-period comb search to find the tempo the bench believed the recordings had wandered from; Kevin's same-day correction, verified off the raw audio with a DTW-free comb sweep (131.97 to 131.99, 120.00, 144.96 to 144.98 and 223.82 to 223.97 bpm against declared 132, 120, 145, 224), showed the combs had found the exact truth and the bench had graded that perfection as failure against its own broken ruler. Corrected guidance to the app: use the declared bpm, anchor bar one near t equals zero, and audit the chart fixture before blaming the arrangement: the second same-day correction (Study 25b) traced eat's apparent mismatch to the bench's own fixture. Study 25, the corrected end-to-end draft on the true grid, registered as the follow-up.",
	);

	// --- Study 25: the corrected end-to-end on the true grid (no figure) ---
	table(
		"tbl-truegrid25",
		[
			"song",
			"anchor (derived chart bar one)",
			"B4 draft vs chart-given baseline, and the gate",
			"corrected shootout: E4 music-start's bar-one placement",
		],
		[
			[
				"letter-lands",
				"\u22120.121s (four bars before the ruler's start, as the correction predicted)",
				"72/76 vs 72/76 \u00b7 S25-G1 ok \u00b7 exact parity, where the ruler-anchored arms scored 36 and 52",
				"0.12s \u00b7 within a tenth of a bar",
			],
			[
				"peaceful-dreams",
				"\u22120.119s",
				"152/153 vs 151/153 \u00b7 S25-G1 ok \u00b7 above baseline, dialect 12/62 exact",
				"0.12s",
			],
			[
				"mop-heart",
				"0.315s \u00b7 carries the alignment start's 115ms sub-bar residue",
				"103/140 vs 131/140 \u00b7 S25-G1 MISS \u00b7 pure anchor phase: 115ms is ~43% of a beat at 224 bpm; Study 24's comb-phase arm drafted 136/140 on this song",
				"2.93s \u00b7 misses by 3.7 bars (quiet opening bars in the transcription)",
			],
			[
				"eat-all-the-clocks",
				"0.415s \u00b7 after Amendment 1 excluded a non-physical \u22127.59s candidate chosen on a one-root margin (void run preserved) \u00b7 Correction 4 (2026-11-08): this anchor is one beat late; the corrected truth is \u22120.085s (Study 31)",
				"prefix 49/71 vs 55/71 \u00b7 S25-G2 MISS, first read as the mismatch extending into the played span \u00b7 the second correction (Study 25b): the mismatch was the bench's 86-bar fixture; on the band's live 71-bar chart the draft reaches 56/69, the same 81% as the old baseline",
				"0.39s",
			],
		],
		"Gates S25-G1 and S25-G2 both FAIL as registered, and both failures carry the study's information; the parity results carry its verdict. The synthesis across Studies 24 and 25, handed to the app: declared bpm as the period, onset-comb phase, bar one near t=0 \u00b7 better arm per song 72/76, 152/153, 136/140 against baselines 72, 151, 131 \u00b7 open problem: beat-level phase at fast tempos; the apparent eat mismatch dissolved under the second correction (the bench's fixture, Study 25b). \u2248$0.35 of a $2 fence, 473 cells, predictions 3 of 4 scored right with the registered open question resolving to its disclosed FAIL reading.",
	);

	// --- Studies 26/26b/26c: the alignment-ends repair (no figure) ---
	table(
		"tbl-ends26",
		[
			"song",
			"baseline ends |err| vs the true grid (first 4 / last 4 bars)",
			"v1 (LSQ tempo) \u2192 v2 (comb, wide slide) \u2192 v3 (comb + quarter-bar fence)",
			"v3 verdict",
		],
		[
			[
				"letter-lands",
				"7.3\u20134.6s / 12.6\u201315.3s \u00b7 middle mean 0.18s",
				"intro fixed, tail 1.3s (1% LSQ bias \u00d7 29 bars) \u2192 perfect \u2192 perfect",
				"0.05s / 0.02s \u00b7 through the app's acceptance gate unloosened \u00b7 S26C-G1 ok",
			],
			[
				"peaceful-dreams",
				"6.6\u20134.2s / 21.1\u201323.3s \u00b7 middle mean 0.16s",
				"perfect \u2192 intro BROKEN +0.60s (the half-bar slide reached the backbeat) \u2192 perfect",
				"0.06s / 0.11s \u00b7 S26C-G1 ok",
			],
			[
				"mop-heart",
				"~3.1s / 2.5\u20133.6s \u00b7 middle mean 0.42s",
				"0.66s intro \u2192 0.11s intro, 0.32s tail \u2192 same",
				"app acceptance ok \u00b7 0.32s outro residual, read then as the middle's own phase offset; Study 27's anchor adjudication later showed it was mostly the truth anchor itself (the oracle sat 0.381s off the onset lattice) \u00b7 S26C-G2 ok",
			],
			[
				"eat-all-the-clocks",
				"2.0s / 25\u201327.5s \u00b7 middle mean 7.8s (the bench's fixture, as the second correction found)",
				"refused \u2192 refused \u2192 refused (interior-trust check: trusted span under half the bars)",
				"the refusal detected a real disagreement whose cause was the bench's 86-bar fixture vs the band's live 71-bar chart; on the corrected chart the recipe repairs eat's ends to within a quarter bar \u00b7 S26C-G3 ok",
			],
			[
				"the ablation and the lessons",
				"trim-to-drums: ends as broken as before \u2192 first read as refuting the hazy-audio cause; the second correction re-graded the construction as ill-posed (the slice removes audio the chart's first bars need), so the cause is OPEN",
				"estimators priced: duration median skew-biased (1.699 vs 1.818s) \u00b7 LSQ slope 1% biased \u00b7 onset comb \u22640.02% on all four \u00b7 the quarter-bar slide is a half-bar-ambiguity fence, not a knob",
				"the app's bar-1 rule fails ALL FOUR songs today: the shipped refusal refuses the whole MMKK set until the recipe lands",
			],
		],
		"Three registrations, each gate honestly failed and priced before the next (26: G1 FAIL on the LSQ bias, G3 FAIL with its construction later re-graded ill-posed; 26b: G1 FAIL on the wide slide; 26c: all gates PASS). The second same-day correction resolved the eat refusal's cause as the bench's own chart fixture, not the band's arrangement; see the entry's correction and Study 25b. $0 throughout: no model calls, pure DSP over the committed corpus. The worker recipe ships as a tested reference implementation in the bench; cost is one alignment as today plus comb sweeps.",
	);

	// --- Study 27: whole-grid re-phasing at fast tempos (no figure) ---
	table(
		"tbl-rephase27",
		["measurement", "result", "the read"],
		[
			[
				"Arm A: mop-heart anchor adjudication (hint roots on each 140-bar grid)",
				"oracle 0.315s \u2192 113/140 \u00b7 mix-comb \u22120.066s \u2192 115/140 \u00b7 drums-comb \u22120.066s \u2192 115/140",
				"the mix and drums lattices agree EXACTLY; the registered rule picks the comb anchor on a thin 2-root margin (disclosed: the hint instrument is phase-tolerant on long same-chord spans); Study 24's 136-vs-103 drafting split is the committed corroboration \u00b7 the oracle was 0.381s (47% of a bar) off \u00b7 third ruler correction of the arc",
			],
			[
				"mop-heart on v5 (vs the refined truth)",
				"delta \u22120.014s \u00b7 ends 0.00/0.00s \u00b7 middle mean 0.000s \u00b7 app acceptance ok",
				"S27-G1 ok \u00b7 the zeros are partly circular (the refined truth IS the lattice v5 names here, disclosed); the non-circular content is the comb agreement, the hint win and the acceptance pass",
			],
			[
				"letter-lands and peaceful-dreams on v5 (no-regression gate)",
				"deltas \u22120.047s / \u22120.037s \u00b7 ends 0.05\u20130.07s \u00b7 middles 0.060s / 0.064s",
				"S27-G2 ok \u00b7 both songs move ~40ms ONTO the lattice; the whole-grid slide helps even where v3 already passed",
			],
			[
				"eat-all-the-clocks on v5, both charts",
				"vs the superseded 86-bar fixture: REFUSED \u00b7 vs the corrected 71-bar chart: ends 0.45\u20130.48s, within the quarter-bar line \u00b7 Correction 4 (2026-11-08): the 0.47s was the ruler's missing beat; against the corrected anchor (\u22120.085s) v5's eat ends are 0.03\u20130.05s",
				"S27-G3 ok \u00b7 re-phasing does not blunt the wrong-chart detector, and the corrected chart still passes",
			],
			[
				"the recipe delta and the fence",
				"v5 = v3 + ONE whole-grid comb slide, fenced at \u00b10.5 beat (period / meter beats) \u00b7 unit test proves the fence cannot hop to a louder neighboring-beat lattice",
				"supersedes v3 as the recommended worker recipe \u00b7 cost: one comb slide over an envelope the worker already computes \u00b7 the 224 bpm problem named in the 26 answer is closed",
			],
		],
		"Registered before the run (docs/BRIEF-STUDY27.md), $0, pure DSP over the committed corpus. Predictions: the comb anchor winning was predicted, though the registered 'within 150 ms of the oracle' was wrong by construction of the surprise, the move was 381 ms; the gate predictions were right. Downstream consequence registered in the brief and applied: Study 26c's mop row was measured against the superseded anchor, noted there.",
	);

	// --- Study 28: the capstone chartless draft (no figure) ---
	table(
		"tbl-capstone28",
		[
			"song",
			"chartless grid: anchor vs truth \u00b7 derived bars vs chart",
			"draft vs reference",
			"the read",
		],
		[
			[
				"letter-lands",
				"+0.830s vs \u22120.121s: 2.1 beats late, the BACKBEAT \u00b7 75 vs 76 bars ok",
				"61/75 = 81.3% vs 94.7% \u00b7 S28-G1 MISS",
				"whole-bar index pairing grades every bar against its neighbor's window; 81% measures how much root information survives a wrong phase",
			],
			[
				"peaceful-dreams",
				"+0.770s vs \u22120.119s: 2.15 beats late, the backbeat again \u00b7 153 vs 153 ok",
				"137/153 = 89.5% vs 98.7% \u00b7 S28-G1 MISS",
				"same mechanism, same verdict",
			],
			[
				"mop-heart",
				"+0.200s vs \u22120.066s: one beat late \u00b7 140 vs 140 ok",
				"135/140 = 96.4% vs 93.6% \u00b7 S28-G1 ok",
				"long same-chord spans tolerate a beat; above its chart-given reference even so",
			],
			[
				"eat-all-the-clocks (corrected 71-bar chart)",
				"+0.430s vs +0.415s as then registered \u00b7 70 vs 71 ok \u00b7 Correction 4 (2026-11-08): the truth is \u22120.085s, so this anchor was one beat LATE like the ruler it matched, and the comb phase missed all four downbeats",
				"55/68 = 80.9% vs 81.2% \u00b7 S28-G1 ok",
				"at its corrected-chart baseline: eat's ceiling is song difficulty, not grid, confirmed chartless",
			],
			[
				"the gates and the lesson",
				"S28-G2 PASS: every derived bar count within 1 of the chart, from the audible span and the exact period alone",
				"S28-G1 FAIL on two songs \u00b7 \u2248$0.25 of a $1 fence",
				"the comb period is exact everywhere; the comb PHASE is a beat detector, not a downbeat detector \u00b7 named next remedy: downbeat disambiguation (the app's own shifted-grid check), a Study 30 candidate",
			],
		],
		"Registered before the run (docs/BRIEF-STUDY28.md). The grid used only feature-available inputs: declared tempo and meter plus the audio. Study 29, answered the same morning, explains why the tethered v5 placement is immune to the capture that broke this construction: the DTW line pins the index and the half-beat fence bounds the slide; the chartless anchor has no tether, so the fence has nothing to hold on to.",
	);

	// --- Study 29: the backbeat failure study (no figure) ---
	table(
		"tbl-backbeat29",
		["arm", "result", "the read"],
		[
			[
				"1 \u00b7 synthetic catch map (120 and 200 bpm, 60 bars, downbeat weight w vs backbeat 1.0)",
				"downbeat caught for x in about [\u22120.4, +0.45] beats at EVERY w in {1.0, 0.6, 0.3, 0.1} \u00b7 never 'elsewhere'",
				"inside the half-beat fence no other beat is reachable, so backbeat weight cannot matter; the shaved edges are the 0.05-beat sweep grid and the 10ms comb step \u00b7 the ask's fence arithmetic confirmed",
			],
			[
				"2 \u00b7 in-window competitors (weak downbeat w = 0.3)",
				"a 0.8-energy pickup takes the slide to \u22120.5 beat; hi-hat off-eighths take it to +0.5 at h \u2265 w",
				"the knife-edge exists exactly where the ask guessed, at the fence BOUNDARY (an eighth is half a beat, the ask's one unit slip), on synthetic impulses only",
			],
			[
				"3 \u00b7 kick-removed remixes (drum stems high-passed at 150 Hz, 4th-order), the gated arm",
				"all four songs keep every Study 27 standard \u00b7 deltas \u22120.05 to \u22120.14 beats \u00b7 letter 0.04\u20130.06s ends / 0.051s middle \u00b7 peaceful 0.02\u20130.07 / 0.042 \u00b7 mop exact \u00b7 eat-71 at 0.47s [Correction 4, 2026-11-08: the ruler's missing beat; truly 0.03\u20130.05s] \u00b7 S29-G1 PASS",
				"snare and hats alone cannot move the slide off the downbeat; the registered conditional remedy arm therefore did not run",
			],
			[
				"4 \u00b7 the real phase errors, in beats",
				"letter 0.10 \u00b7 peaceful 0.09 \u00b7 mop 0.05 (DTW phase to lattice: 0.05) \u00b7 eat 0.06",
				"an order of magnitude inside the fence \u00b7 the ask's '0.38s = 1.4 beats' was right arithmetic on the superseded truth anchor (the ruler Study 27 corrected), not on the alignment's phase",
			],
			[
				"control",
				"full-mix v5 reproduces Study 27's deltas within 2ms on all four songs \u00b7 S29-G2 PASS",
				"same code, same data, no instrument drift",
			],
		],
		"Registered before the run (docs/BRIEF-STUDY29.md) from the app's ask, $0, pure DSP. Verdict delivered: ship v5 as the chart placement; the downbeat check the ask proposed belongs to the auto-chart feature's chartless grid, whose capture Study 28 measured the same morning. Predictions: all five right, with arm 2's mechanism right and its geometry corrected (the pickup sits at the boundary, not inside the window).",
	);

	// --- Study 30: downbeat disambiguation fails both gates (no figure) ---
	table(
		"tbl-downbeat30",
		[
			"song",
			"D1 chroma novelty (registered primary)",
			"D2 kick band (secondary)",
			"the read",
		],
		[
			[
				"letter-lands",
				"kept the BACKBEAT (shift 0): the backbeat outscores the true downbeat 0.0585 vs 0.0468 \u00b7 re-draft 61/75 = 81.3%, Study 28 repeated",
				"shift 2 \u00b7 DOWNBEAT",
				"novelty prefers the wrong beat outright; the kick finds the right one",
			],
			[
				"peaceful-dreams",
				"shift 2, a DIFFERENT wrong beat (margin 0.0251 vs 0.0241, 4%, noise) \u00b7 re-draft 94/153 = 61.4%, WORSE than Study 28's 89.5%",
				"kept the backbeat \u00b7 wrong",
				"both scorers wrong, two different ways",
			],
			[
				"mop-heart",
				"kept shift 0, one beat late: the two leading candidates TIE to four decimals (0.0349 = 0.0349)",
				"shift 2 \u00b7 DOWNBEAT",
				"novelty has no opinion at beat granularity; the kick does",
			],
			[
				"eat-all-the-clocks",
				"moved OFF the already correct anchor to shift 3 (0.0577 vs 0.0398 for the truth) [Correction 4, 2026-11-08: that base was one beat late, and shift 3 was the correct class]",
				"moved off to shift 3 \u00b7 wrong [Correction 4: the right class]",
				"the one song Study 28 got right, derailed by both scorers",
			],
			[
				"the gates and the tally",
				"D1: 0/4 as registered \u00b7 S30-G1 FAIL \u00b7 S30-G2 FAIL by consequence \u00b7 Correction 4 re-read by class: D1 2/4, D2 3/4",
				"D2: 2/4, as the registered half-bar-ambiguity expectation predicted in shape",
				"three cheap chartless scorers measured across Studies 28 and 30 (comb phase, novelty, kick band): on every song at least one preferred a wrong shift over a correct base \u00b7 named remedy: a one-tap bar-one gesture from the user; the grid is already machine-exact, so bar one is one bit",
			],
		],
		"Registered before the run (docs/BRIEF-STUDY30.md), \u2248$0.15 of a $0.5 fence. The mechanism behind the zero is the chroma smear first measured in Study 26: long analysis windows blur harmony across neighboring beats, so frame-to-frame novelty has no beat-level resolution. The alignment feature's v5 placement is unaffected; its DTW tether supplies the bar-one bit mechanically (Study 29). Predictions: 1 and 2 wrong, published with the result; spend right. Correction 4 (2026-11-08): re-read by beat class against the corrected eat anchor, novelty was 2/4 and the kick band 3/4, and eat's base was not correct to begin with; Study 31 supplies the witnesses that work.",
	);

	// --- Study 31 family: the witness vote (no figure) ---
	table(
		"tbl-witnesses31",
		["stage", "result", "the read"],
		[
			[
				"Study 31 as registered (reg 7a821f4)",
				"all three gates FAIL \u00b7 time zero, harmonic rhythm (margin 35) and all 20 section boundaries agree with the truth exactly on letter/peaceful/mop and WITH EACH OTHER on eat, one beat before the registered truth",
				"the witnesses did not fail the gate; the gate's ruler failed the witnesses",
			],
			[
				"Correction 4 (2026-11-08)",
				"eat's truth anchor is \u22120.085s, not +0.415s \u00b7 the old value: Study 25's hint-fit (55/84) against the phantom-bars chart, pre-Correction-2, with an instrument measured flat across two beats (65/66/66 of 69)",
				"four constructions agree on \u22120.06 to \u22120.07s: the chart DTW (the committed 0.474s 'eat quarter-bar edge' of Studies 27/29 was the ruler's missing beat; v5 was right on eat all along), chord changes, sections, time zero \u00b7 the non-drum stems sound from the first sample: bar line AT time zero, the app's DAW-export argument",
			],
			[
				"31b: the vote on the corrected ruler (reg b90a3b6)",
				"S31B-G1 PASS: the vote finds the true class on ALL FOUR (5\u20131, 6\u20131, 3\u20131, 5\u20131), none undecided \u00b7 A2 harmonic rhythm ALONE 4/4 \u00b7 A1 time zero 3/4 (mop abstains, never wrong)",
				"crashes 1/4 and the stem witness self-vetoed on every song \u00b7 G2 vacuous once the ruler was fixed: the app's fifth and sixth songs are the registered condition for shipping the vote",
			],
			[
				"31c: the whole-bar placement (reg b26da2d)",
				"a beat class is modulo one bar; placing the voted anchor at base + shift put bar one a whole bar wrong and collapsed the re-drafts (68.0/61.4%) \u00b7 with the registered rule (bar one contains the first sound): letter 71/75 = 94.7%, EXACTLY the chart-grid reference \u00b7 peaceful 152/153 = 99.3%, ABOVE its 98.7% reference",
				"the first chartless drafts at reference parity \u00b7 the defect also re-reads Study 30's peaceful 61.4% as right class, wrong bar",
			],
			[
				"31d: the app's review acted on (reg a545263)",
				"the app's agent caught the bench's 90s envelope cap (the ends witnesses were unmeasured, not measured) and read time zero's four distances as the envelope's 0.07s lead \u00b7 uncapped: the ends abstain by ritardando on all four full songs \u00b7 lead-corrected time zero: 4/4 at 0.02/0.03/0.008/0.000 beat \u00b7 both vote variants PASS",
				"the review ran both directions \u00b7 every family truth is the downbeat at or near time zero read ~0.07s early: a uniform ruler bias that beat-class scoring is immune to",
			],
			[
				"the roster the app ships",
				"lead-corrected time zero, harmonic rhythm and section scale: each 4/4 ALONE \u00b7 the vote over them \u00b7 undecided keeps the base \u00b7 the bar-one tap stays out",
				"with bar one from the witnesses, the chartless pipeline is machine-complete on this corpus: period exact, length within a bar, downbeat voted, drafts at chart parity",
			],
		],
		"Registered in four committed stages (docs/BRIEF-STUDY31.md, 31B, 31C, 31D), family spend \u2248$0.39 of a $0.5 fence; weights and margins fixed before the first run and never tuned. Source: the app's downbeat-witnesses brief, amended per the bench's accepted review (categorical gate, corrected reference numbers, the eat adjudication as a named arm, nchord as the disclosed chord-run substitution). The gateway ignores temperature on this model family, so draft scores carry a few bars of sampling noise, disclosed in the 31b registration.",
	);

	// --- Study 32 family: the adversarial corpus (no figure) ---
	table(
		"tbl-adversarial32",
		["arm", "result", "the read"],
		[
			[
				"Study 32 as registered (reg 4981bbb, the app's own brief)",
				"S32-G1 FAIL by fixture: the mini-synth's pure 65 Hz kick is nearly invisible to spectral flux, so every synthetic 'correct base' sat on beat 2 \u00b7 S32-G3 PASS: all four real originals keep their 31d verdicts 5\u20130 by class \u00b7 arm 7 PASS",
				"the backbeat fooled the bench's own synthesizer design \u00b7 the real songs supplied the correct bases instead, and the gate's teeth bit there: the crash witness voted to move a correct base 3/3 times and is formally dead \u00b7 no shipping witness ever moved a correct base",
			],
			[
				"32b: the flux-visible kick (reg b424c7c, 6 ms beater click, committed with tests)",
				"every synthetic base correct as constructed \u00b7 S32B-G1: every SHIPPING witness clean on 6/6 correct bases at 100/132/180 bpm, 3/4 and 6/8 \u00b7 S32B-G2 PASS: eleven adversarial synthetics, zero wrong decisions, one honest undecided",
				"the humility gate finally has teeth and the ship vote passes through them",
			],
			[
				"the hostile starts",
				"one-beat pickup, half-bar silence, 2 s silence, 4-click count-in: all resolve to the correct class \u00b7 the count-in is self-defeating in 4/4 (four clicks = one bar), as registered",
				"time zero is fooled by a pickup but the chord and section witnesses hold the base through the humility margin",
			],
			[
				"the harmonic foolers",
				"changes on 1 and 3 equally: run one decided WRONG; with the honest fixture it resolves UNDECIDED, held by the humility margin, not the registered 1.2 ratio rule (the histogram cleared 1.2 and voted wrong) \u00b7 vamp: chord and section witnesses abstain, time zero holds \u00b7 anticipations an eighth early did NOT fool the chord model (it snaps to the bar)",
				"the margin rule earns its keep where the confidence rule failed; both predictions about mechanisms were wrong, published with the result",
			],
			[
				"the backbeat, both directions",
				"run one (base wrong by the flux defect): vote moves it to the truth 5\u20130 \u00b7 run two (base correct): vote keeps it 5\u20130",
				"the vote neither chases the snare nor freezes on its starting guess",
			],
			[
				"the real songs re-cut (16 cuts + 4 originals)",
				"fifteen right, four undecided (base kept, honest), ONE WRONG: mop-heart's 0.3-beat pad \u00b7 the fractional start puts time zero off-lattice (uncorrected time zero was RIGHT there; the 0.07 s lead correction hurts on non-beat-aligned starts) and thins the chord ratio at once, leaving a lone 1-point section vote holding a wrong base",
				"the do-not-place rule, detectable at decision time: time zero off-lattice AND chord ratio under threshold firing together means keep the declared grid or ask",
			],
			[
				"the end witness, auditioned and declined",
				"the app's eighth-note fix implemented as v2 with tests \u00b7 real songs: still abstains on all 12 reads, now a measurement (endings run 8\u201322% short of the lattice beat; swing intervals pass the 0.75-beat filter) \u00b7 synthetics: votes the LAST onset's class, a beat-4 snare, wrong on the waltz's correct base, the sole 32b humility violation",
				"'songs end on a downbeat' fails even on steady renders \u00b7 the weight-1 seat is declined on the evidence; the gate bit the applicant",
			],
			[
				"arm 7: the re-drafts follow the moved bar one",
				"drafts on the 1.0-beat pads with the voted class under the 31c placement rule: letter 72/76 = 94.7%, EXACTLY the chart-grid reference \u00b7 peaceful 152/153 = 99.3%, above its reference",
				"a one-beat cut of the audio moves bar one, the vote follows it, and the draft loses nothing",
			],
		],
		"Registered in two committed stages (docs/BRIEF-STUDY32.md, 32B) from the app's own adversarial brief, adopted whole with six reconciliations; weights, margins and gates fixed before each run. Spend 41,478 in / 6,976 out \u2248 $0.16 of a $0.3 fence; 744 cells. The registered stand-in for the missing fifth and sixth songs resolves: humility gate passed by every shipping witness, no false moves on synthetics, one named real-world do-not-place case. The real songs remain the confirmation when they arrive.",
	);

	// --- Study 33: the stereo file as two stems (no figure) ---
	table(
		"tbl-stereo33",
		["arm", "letter-lands \u00b7 peaceful-dreams", "the read"],
		[
			[
				"the scoping measurement ($0, pre-registration)",
				"corr(L,R) 0.83\u20130.90 across the four mixes \u00b7 side channel 10\u201313 dB under the mid, weakest below 200 Hz",
				"kick and bass dead center: each channel is a near copy of the whole band, not anything stem-like",
			],
			[
				"R \u00b7 the non-drum stem sum (the stems ceiling)",
				"72/76 = 94.7% \u00b7 151/153 = 98.7%",
				"S33-G1 PASS twice, to the bar: the frozen 31c references reproduced exactly on both songs",
			],
			[
				"A \u00b7 the plain mono downmix (the naive path)",
				"74/76 = 97.4% \u00b7 152/153 = 99.3%",
				"the unregistered headline, twice: ABOVE the stems sum on both songs \u00b7 Basic Pitch transcribes drums weakly and the draft model reads through the bleed",
			],
			[
				"B \u00b7 L and R as two pseudo-stems (the question)",
				"73/76 = 96.1% \u00b7 152/153 = 99.3%",
				"S33-G2 PASS twice: one bar under mono, then a tie, at double the transcription cost \u00b7 not worth it, final",
			],
			[
				"C \u00b7 mid and side (the steelman)",
				"75/76 = 98.7% \u00b7 146/153 = 95.4%",
				"the pilot's one-bar edge was noise with the sign flipped: the side channel's \u22482,270 extra cymbal and reverb notes poisoned six bars on peaceful",
			],
			[
				"D \u00b7 the HPSS harmonic of the mono mix (the comparator)",
				"72/76 = 94.7% \u00b7 152/153 = 99.3%",
				"S33-G3 FAIL on the pilot (published as found), PASS on the matrix: inconsistent per song and never better, pure cost",
			],
			[
				"the panned-synthetic sweep ($0, chord-tone purity, ceiling 99.7%)",
				"HPSS 99.6\u201399.7% at every pan width \u00b7 side channel: silence at width 0, 99.7% at width 0.5 and 1.0 \u00b7 mono 96.1% \u2192 94.5% as width grows",
				"the trap named: clean synthetic sustains are the median filter's best case, and the side channel is pure harmony exactly when the mix pans harmony, which these mixes do not",
			],
			[
				"the production answer",
				"a chartless stereo upload goes in as its mono downmix: same grid, same hints, same draft, stems-ceiling quality on both songs measured",
				"no channel splitting, no mid/side, no source separation",
			],
		],
		"Registered 88fceeb before any scored run (docs/BRIEF-STUDY33.md); pilot letter-lands \u2248$0.30 at the $0.3 fence, matrix peaceful-dreams alone per the registered scope (runner corrected c396220 before any paid call) \u2248$0.68 against the $0.6 fence, exceeded and disclosed: the two-buffer arms carry nearly twice the notes, so peaceful's drafts grew to \u224838k tokens in each. Study total \u2248$0.98 across 1,158 cells (5 arms \u00d7 229 graded bars + 13 sweep purities). The gateway ignores temperature on this model family; all five arms span three bars on letter, the disclosed noise scale.",
	);

	// --- Study 39: free tempo ---
	table(
		"tbl-freetempo39",
		[
			"system",
			"Winterreise (48): F \u00b7 P \u00b7 R at 70 ms",
			"strict bar \u00b7 folded (half, double)",
			"chartable (R \u2265 0.8 at bar or half)",
			"JAAH 78s (3): F at 70 \u00b7 150 ms",
		],
		[
			[
				"Beat This final0, peak-picking",
				"0.66 \u00b7 0.55 \u00b7 0.86",
				"6 \u00b7 19 (14, 2)",
				"11",
				"0.49 \u00b7 0.75",
			],
			[
				"Beat This small0, peak-picking",
				"0.60 \u00b7 0.48 \u00b7 0.75",
				"7 \u00b7 23 (20, 2)",
				"8",
				"0.39 \u00b7 0.60",
			],
			[
				"Beat This final0 + DBN",
				"0.55 \u00b7 0.62 \u00b7 0.54",
				"24 \u00b7 36 (5, 7)",
				"10",
				"0.47 \u00b7 0.76",
			],
			[
				"madmom 3/4, \u03bb 100 (Studies 36, 38)",
				"0.39 \u00b7 0.43 \u00b7 0.37",
				"16 \u00b7 28 (4, 10)",
				"7",
				"0.69 \u00b7 0.97",
			],
			[
				"madmom 3/4, \u03bb 30",
				"0.46 \u00b7 0.49 \u00b7 0.45",
				"16 \u00b7 29 (4, 12)",
				"7",
				"0.39 \u00b7 0.45",
			],
			[
				"madmom 3/4, \u03bb 10",
				"0.50 \u00b7 0.56 \u00b7 0.44",
				"17 \u00b7 28 (4, 12)",
				"5",
				"0.47 \u00b7 0.53",
			],
			[
				"madmom 3/4, \u03bb 3",
				"0.47 \u00b7 0.51 \u00b7 0.43",
				"17 \u00b7 26 (4, 10)",
				"3",
				"0.29 \u00b7 0.33",
			],
			[
				"madmom 3/4/6, \u03bb 100",
				"0.28 \u00b7 0.38 \u00b7 0.23",
				"7 \u00b7 26 (0, 9)",
				"4",
				"0.28 \u00b7 0.39",
			],
			[
				"recall at 70 ms by edition, 2006 / 1933",
				"final0 0.87 / 0.84 \u00b7 small0 0.87 / 0.71 \u00b7 final0 + DBN 0.65 / 0.54 \u00b7 madmom \u03bb 100 0.37 / 0.37 \u00b7 \u03bb 10 0.55 / 0.39",
				"\u2014",
				"floor for adoption: 36 of 48",
				"\u2014",
			],
		],
		"Registered ca362ee (docs/BRIEF-STUDY39.md) before any tracker ran; zero model spend; 51 recordings \u00d7 8 systems. Winterreise: Schubert Winterreise Dataset v2.1, 24 songs in the 2006 and 1933 editions, annotated bars; JAAH: three 1930s jazz 78s with annotated bars. Group medians. Predictions: P1, P3, P4 right; P2 (loosened penalty gains 0.15 of recall) and P5 (editions agree within 0.10 for every system) wrong. S39-D1: no system chartable on 75 percent, no free-tempo tracker adopted.",
	);

	// --- Study 52: another reader ---
	table(
		"tbl-reader52",
		[
			"song (bars)",
			"Basic Pitch at its best: bars right \u00b7 wrong",
			"the bass model: bars right \u00b7 wrong",
			"MuScriptor: bars right \u00b7 wrong",
			"notes, octave-exact F: Basic Pitch \u00b7 bass model \u00b7 MuScriptor",
			"extra onsets: Basic Pitch \u00b7 bass model \u00b7 MuScriptor",
			"bars the two new readers write the same",
		],
		[
			[
				"Peaceful Dreams (110)",
				"36 \u00b7 38 %",
				"53 \u00b7 25 %",
				"55 \u00b7 25 %",
				"0.76 \u00b7 0.88 \u00b7 0.89",
				"40 \u00b7 9 \u00b7 7",
				"91 % shown \u00b7 60 % right \u00b7 19 % wrong",
			],
			[
				"Interbellum (69)",
				"32 \u00b7 49 %",
				"39 \u00b7 54 %",
				"48 \u00b7 42 %",
				"0.77 \u00b7 0.83 \u00b7 0.86",
				"23 \u00b7 8 \u00b7 12",
				"52 % shown \u00b7 53 % right \u00b7 47 % wrong",
			],
			[
				"Letter Lands (68)",
				"76 \u00b7 13 %",
				"51 \u00b7 9 %",
				"85 \u00b7 3 %",
				"0.89 \u00b7 0.91 \u00b7 0.93",
				"23 \u00b7 38 \u00b7 6",
				"43 % shown \u00b7 88 % right \u00b7 4 % wrong",
			],
			[
				"Eat All the Clocks (71)",
				"42 \u00b7 35 %",
				"82 \u00b7 7 %",
				"70 \u00b7 6 %",
				"0.72 \u00b7 0.95 \u00b7 0.94",
				"40 \u00b7 3 \u00b7 5",
				"79 % shown \u00b7 84 % right \u00b7 2 % wrong",
			],
			[
				"Downline, 5/4 and 3/4 (186)",
				"63 \u00b7 20 %",
				"74 \u00b7 8 %",
				"75 \u00b7 8 %",
				"0.80 \u00b7 0.93 \u00b7 0.94",
				"53 \u00b7 21 \u00b7 21",
				"93 % shown \u00b7 76 % right \u00b7 8 % wrong",
			],
			[
				"Mop Heart, 3/4 at 224 (95)",
				"40 \u00b7 47 %",
				"87 \u00b7 9 %",
				"89 \u00b7 8 %",
				"0.85 \u00b7 0.99 \u00b7 0.98",
				"82 \u00b7 11 \u00b7 12",
				"90 % shown \u00b7 95 % right \u00b7 5 % wrong",
			],
		],
		"Registered at 2f6e186 and, after the truth's defect was found and fixed, again at d3561c5; MuScriptor's arm by amendment at 6d4468f, before its notes were scored (docs/BRIEF-STUDY52.md, docs/CORRECTION-2026-11-13-bass-truth.md); $0, no gateway call. The bass model is the bass checkpoint of xavriley/hf_midi_transcription, run as shipped; MuScriptor is its medium model, greedy, constrained to electric bass; Basic Pitch at its best is Study 49's selected configuration. Every line is under the bass constraint (E1 to C4), the registered primary; without it MuScriptor's Peaceful Dreams is 62 % right and 18 % wrong, because the part goes below E1. Bars right and wrong are Study 48's bar grade on the tracker's grid, every pitch, octave and slot matched with no extra onset. Note scores are mir_eval's, onset within 50 ms, exact pitch. The last column shows the bars where the two new readers write the same pitches in the same slots, and how those bars grade. S52-D1 (the line shown: 70 % right and at most 10 % wrong on every song): three songs for the bass model, four for MuScriptor, no. S52-D2 (a better first reader: 10 points on the mean, no song down more than 2): the bass model plus 15.9 with one song down 25, no; MuScriptor plus 22.1 with no song down, yes. S52-D3 (trusted bars on every song): four songs at best, no. Predictions: five of six for the bass model, one of three for MuScriptor.",
	);

	// --- Study 51: trusted bars ---
	table(
		"tbl-trust51",
		[
			"song (bars with notes)",
			"every bar",
			"agrees with the app's setting",
			"survives two loosened settings",
			"agrees with pYIN",
			"agrees with all four",
		],
		[
			[
				"Peaceful Dreams (109)",
				"36 % right \u00b7 39 % wrong",
				"93 % shown \u00b7 38 % right \u00b7 36 % wrong",
				"66 % shown \u00b7 46 % right \u00b7 24 % wrong",
				"30 % shown \u00b7 76 % right \u00b7 0 % wrong",
				"26 % shown \u00b7 75 % right \u00b7 0 % wrong",
			],
			[
				"Interbellum (64)",
				"27 % right \u00b7 53 % wrong",
				"84 % shown \u00b7 30 % right \u00b7 50 % wrong",
				"39 % shown \u00b7 44 % right \u00b7 36 % wrong",
				"20 % shown \u00b7 46 % right \u00b7 54 % wrong",
				"11 % shown \u00b7 43 % right \u00b7 57 % wrong",
			],
			[
				"Letter Lands (61)",
				"74 % right \u00b7 15 % wrong",
				"92 % shown \u00b7 77 % right \u00b7 14 % wrong",
				"51 % shown \u00b7 74 % right \u00b7 10 % wrong",
				"13 % shown \u00b7 100 % right \u00b7 0 % wrong",
				"13 % shown \u00b7 100 % right \u00b7 0 % wrong",
			],
			[
				"Eat All the Clocks (61)",
				"36 % right \u00b7 38 % wrong",
				"70 % shown \u00b7 44 % right \u00b7 30 % wrong",
				"70 % shown \u00b7 49 % right \u00b7 19 % wrong",
				"2 % shown \u00b7 100 % right \u00b7 0 % wrong",
				"2 % shown \u00b7 100 % right \u00b7 0 % wrong",
			],
			[
				"Downline (160)",
				"62 % right \u00b7 22 % wrong",
				"60 % shown \u00b7 62 % right \u00b7 22 % wrong",
				"83 % shown \u00b7 68 % right \u00b7 20 % wrong",
				"45 % shown \u00b7 81 % right \u00b7 10 % wrong",
				"24 % shown \u00b7 71 % right \u00b7 16 % wrong",
			],
			[
				"Mop Heart (90)",
				"38 % right \u00b7 50 % wrong",
				"89 % shown \u00b7 42 % right \u00b7 46 % wrong",
				"57 % shown \u00b7 45 % right \u00b7 43 % wrong",
				"14 % shown \u00b7 69 % right \u00b7 31 % wrong",
				"9 % shown \u00b7 75 % right \u00b7 25 % wrong",
			],
			[
				"All six (545)",
				"47 % right \u00b7 35 % wrong",
				"79 % shown \u00b7 49 % right \u00b7 33 % wrong",
				"65 % shown \u00b7 57 % right \u00b7 24 % wrong",
				"26 % shown \u00b7 76 % right \u00b7 13 % wrong",
				"17 % shown \u00b7 73 % right \u00b7 13 % wrong",
			],
		],
		"Registered at 95b4089 (docs/BRIEF-STUDY51.md); $0, no model call. The line shown is Study 49's selected Basic Pitch configuration under the bass constraint, on the tracker's grid; a bar is shown under a rule when the named reading writes the same pitches in the same slots. Right and wrong are Study 48's bar grade, as shares of the bars shown; bars the line leaves empty are counted apart. S51-D1 (on every song at least 70 % of shown bars right, at most 10 % wrong, at least a quarter of the bars shown): no rule qualifies. Four of five predictions held. Re-run 2026-11-13 on a corrected truth: the first truth was missing back-to-back notes of one pitch (docs/CORRECTION-2026-11-13-bass-truth.md); the rows are the re-run's. All five predictions held on the re-run.",
	);

	// --- Study 50: the grid ---
	table(
		"tbl-grid50",
		[
			"song",
			"tracker beats on a composer's beat",
			"composer's beats dropped",
			"tracker bar lines on a composer's",
			"tracker's grid, per bar: bars right \u00b7 notes right",
			"tracker's grid, per song",
			"composer's grid, per song",
		],
		[
			[
				"Peaceful Dreams",
				"100 %",
				"6 %",
				"99 %",
				"36 % of 110 \u00b7 0.77",
				"36 % of 110 \u00b7 0.78",
				"36 % of 112 \u00b7 0.78",
			],
			[
				"Interbellum",
				"84 %",
				"16 %",
				"76 %",
				"32 % of 69 \u00b7 0.82",
				"32 % of 69 \u00b7 0.82",
				"25 % of 63 \u00b7 0.82",
			],
			[
				"Letter Lands",
				"100 %",
				"9 %",
				"100 %",
				"76 % of 68 \u00b7 0.92",
				"76 % of 68 \u00b7 0.94",
				"78 % of 72 \u00b7 0.95",
			],
			[
				"Eat All the Clocks",
				"100 %",
				"0 %",
				"92 %",
				"42 % of 71 \u00b7 0.79",
				"42 % of 71 \u00b7 0.79",
				"42 % of 66 \u00b7 0.78",
			],
			[
				"Downline, 5/4 and 3/4",
				"100 %",
				"11 %",
				"48 %",
				"63 % of 186 \u00b7 0.81",
				"64 % of 186 \u00b7 0.85",
				"60 % of 156 \u00b7 0.85",
			],
			[
				"Mop Heart, 3/4 at 224",
				"100 %",
				"9 %",
				"18 %",
				"40 % of 95 \u00b7 0.75",
				"40 % of 95 \u00b7 0.77",
				"48 % of 128 \u00b7 0.77",
			],
		],
		"Registered at 6911bcc (docs/BRIEF-STUDY50.md); $0, no model call. The notes are Study 49's selected Basic Pitch configuration under the bass constraint; the truth and the bar grade are Study 48's. Bars right is the share of that grid's own bars with every pitch, octave and slot matched and no extra onset; notes right is a slot-level F, truth onsets matched in slot and pitch over transcribed and over truth onsets, which does not move with the bar lines. The composer's grid is the MIDI's tempo and signature map on the mix timeline. Per bar and per song name how sixteenths or triplets are chosen. S50-D2 (the grid is a bottleneck if the composer's gains 10 points of mean bars right): minus 0.5, no. S50-D1 (the per-song rule, if bars right rises on five of six): one, not recommended. Three of six predictions held. Re-run 2026-11-13 on a corrected truth: the first truth was missing back-to-back notes of one pitch (docs/CORRECTION-2026-11-13-bass-truth.md); the rows are the re-run's. S50-D2 on the re-run: minus 0.4, no.",
	);

	// --- Study 49: the wrong onsets ---
	table(
		"tbl-onsets49",
		[
			"song (bars)",
			"the app's settings",
			"no inferred onsets, no melodia pass",
			"sixteenth merge",
			"amplitude floor 0.6",
			"shorter minimum note",
			"onset threshold 0.35",
		],
		[
			["Peaceful Dreams (110)", "35 %", "36 %", "36 %", "35 %", "28 %", "2 %"],
			["Interbellum (69)", "26 %", "32 %", "25 %", "26 %", "20 %", "9 %"],
			["Letter Lands (68)", "72 %", "76 %", "62 %", "75 %", "41 %", "18 %"],
			[
				"Eat All the Clocks (71)",
				"35 %",
				"42 %",
				"45 %",
				"38 %",
				"35 %",
				"10 %",
			],
			[
				"Downline, 5/4 and 3/4 (186)",
				"40 %",
				"63 %",
				"39 %",
				"61 %",
				"30 %",
				"24 %",
			],
			[
				"Mop Heart, 3/4 at 224 (95)",
				"39 %",
				"40 %",
				"39 %",
				"40 %",
				"28 %",
				"8 %",
			],
		],
		"Bars entirely right, every pitch, octave and slot matched with no extra onset; Study 48's truth, grid and grader, unchanged. Registered at 772a253 (docs/BRIEF-STUDY49.md); $0, no model call. Every column is Basic Pitch under the bass constraint. Columns three to seven change one thing from the app's settings: both onset-free passes off (the selected configuration of 32); a same-pitch note within 0.375 beat of the last joined to it; notes under 0.6 of the stem's median amplitude dropped; a minimum note of 6 frames instead of 11; an onset threshold of 0.35 instead of 0.5. S49-D1 (a setting: mean gain of 10 points, no song down 2, held-out gain on five of six): 6.2 points, not recommended. S49-D2 (a filter within 3 % of real notes lost on every song): none qualifies. Two of eight predictions held. Re-run 2026-11-13 on a corrected truth: the first truth was missing back-to-back notes of one pitch (docs/CORRECTION-2026-11-13-bass-truth.md); the rows are the re-run's. S49-D1 on the re-run: 7.1 points, not recommended. Three of eight predictions held.",
	);

	// --- Study 48: bass lines ---
	table(
		"tbl-bass48",
		[
			"song (bars)",
			"Basic Pitch: exact F \u00b7 octave errors",
			"constrained: exact F",
			"pYIN: exact F",
			"bars right \u00b7 one error \u00b7 wrong (Basic Pitch)",
			"notes on the right slot",
		],
		[
			[
				"Peaceful Dreams (110)",
				"0.601 \u00b7 37 %",
				"0.759",
				"0.755",
				"35 \u00b7 27 \u00b7 37 %",
				"82 %",
			],
			[
				"Interbellum (69)",
				"0.682 \u00b7 34 %",
				"0.768",
				"0.753",
				"25 \u00b7 23 \u00b7 52 %",
				"77 %",
			],
			[
				"Letter Lands (68)",
				"0.725 \u00b7 35 %",
				"0.892",
				"0.604",
				"72 \u00b7 13 \u00b7 15 %",
				"95 %",
			],
			[
				"Eat All the Clocks (71)",
				"0.614 \u00b7 38 %",
				"0.716",
				"0.695",
				"35 \u00b7 21 \u00b7 44 %",
				"90 %",
			],
			[
				"Downline, 5/4 and 3/4 (186)",
				"0.689 \u00b7 33 %",
				"0.801",
				"0.790",
				"40 \u00b7 30 \u00b7 30 %",
				"77 %",
			],
			[
				"Mop Heart, 3/4 at 224 (95)",
				"0.789 \u00b7 13 %",
				"0.854",
				"0.865",
				"38 \u00b7 12 \u00b7 51 %",
				"86 %",
			],
		],
		"Registered, then re-registered twice with the numbers seen disclosed (docs/BRIEF-STUDY48.md: the MIDI at written pitch, 3fbeb94; the early-onset slot, ff3dc83); $0, no model call. Truth: Kevin's session MIDI per bass stem, placed on the app's mix timeline by the committed intake (scripts/ingest-bass-pair.py). Note level: mir_eval, onset within 50 ms, pitch within 50 cents, offsets ignored; octave errors among notes matched on pitch class, all upward. Bars: the app's stored beats (Downline on the bench's Beat This reading of the band's mix), a sixteenth or an eighth-note triplet per beat chosen per bar, notes under 0.4 of a sixteenth dropped, a bar right only with every pitch, octave and slot matched and no extra onset. S48-D1 (70 % right and at most 10 % wrong on every song): no, for every pipeline. Predictions P1 to P5 wrong, P6 right. Re-run 2026-11-13 on a corrected truth: the first truth was missing back-to-back notes of one pitch (docs/CORRECTION-2026-11-13-bass-truth.md); the rows are the re-run's.",
	);

	// --- Study 47: the hint sentence ---
	table(
		"tbl-sentence47",
		[
			"measure",
			"quality clause (Study 45, v0.262.1)",
			"advisory sentence (Study 47)",
		],
		[
			[
				"guitar, 12 paired takes: qualities up \u00b7 down \u00b7 roots down",
				"\u2014",
				"2 \u00b7 1 \u00b7 0",
			],
			[
				"guitar: good drafts \u00b7 drafts with a power chord \u00b7 half-diminished spelled",
				"5 \u00b7 5 \u00b7 7 of 12",
				"6 \u00b7 4 \u00b7 7 of 12 (the same seven)",
			],
			[
				"Woodward, 10 paired songs: qualities up \u00b7 down \u00b7 roots down \u00b7 class lowered",
				"\u2014",
				"0 \u00b7 1 \u00b7 1 \u00b7 0",
			],
			[
				"drafts with identical root and quality counts",
				"\u2014",
				"17 of 22 (corrected 2026-11-13 from 19)",
			],
			[
				"predictions",
				"\u2014",
				"P1 (qualities up on 5+) wrong \u00b7 P2 (half-diminished in 10+) wrong \u00b7 P3, P4, P5 right",
			],
			["spend", "\u2014", "$1.46 of $1.50"],
		],
		"Registered 12f1553 (docs/BRIEF-STUDY47.md) before any draft. Study 45's pipeline on Beat This small0's bars as read, with the production hint sentence replaced by Study 46's finding (src/study47/prompt47.ts, pinned to differ in that sentence only); the twelve GuitarSet SS2 takes and ten Woodward songs paired with Study 45's quality-clause drafts of the same items, same hints. S47-D1 by the registered rule: between, reported without a recommendation. The gateway ignores temperature for this model, so the moves on five drafts, four by one position and one by two, are within unmeasured draft-to-draft variance.",
	);

	// --- Study 46: the hint's ceiling ---
	table(
		"tbl-hint46",
		[
			"input (bars)",
			"root right",
			"quality family right",
			"both right",
			"hint absent (N.C.)",
		],
		[
			[
				"comping, Rock + Singer-Songwriter (1,056)",
				"95.1 %",
				"83.1 %",
				"82.4 %",
				"under 1 %",
			],
			[
				"comping, Bossa Nova + Jazz + Funk (1,584)",
				"65.8 %",
				"56.1 %",
				"52.7 %",
				"8 %",
			],
			[
				"comping, all five styles (2,640)",
				"77.5 %",
				"66.9 %",
				"64.6 %",
				"8.2 %",
			],
			[
				"single melodic line, all styles (2,640)",
				"11.1 %",
				"21.1 %",
				"7.8 %",
				"56.2 %",
			],
			[
				"by the sheet's quality, comping: major (1,680) \u00b7 minor (600) \u00b7 dominant (240) \u00b7 diminished (120)",
				"81 \u00b7 76 \u00b7 74 \u00b7 38 %",
				"77 \u00b7 63 \u00b7 41 \u00b7 2 %",
				"\u2014",
				"8 \u00b7 8 \u00b7 9 \u00b7 10 %",
			],
			[
				"against the performed chords instead of the sheet",
				"unchanged",
				"comping +4.8 \u00b7 solo \u22120.3 \u00b7 all +2.3 points",
				"\u2014",
				"\u2014",
			],
		],
		"Registered 3bcaa68 (docs/BRIEF-STUDY46.md) before the run; $0, no gateway call. All 360 GuitarSet excerpts (6 players, 5 styles, comp and solo), 5,280 bars whose sheet chord parses. The hint is the bench's ChordMini majority vote per annotated bar (scripts/study10/nchord.py), the per-bar hint every draft since Study 23 received; truth is the lead sheet's chord at the bar start; families are Study 34's. Predictions: P1 (comp roots at least 85 %) wrong at 77.5; P2 (family at least 70 % overall) wrong at 44.0; P3 (diminished under 25 %) right at 1.7; P4 (dominant under 60 %) right at 23.8; P5 (solos at least 10 points under comping on roots) right by 66; P6 (performed truth at least 3 points above the sheet) wrong at +2.3. S46-D1: minor, dominant and diminished under 50 % over all excerpts, so the hint's quality is recommended advisory for those families; the comp-only cut is a labelled post-hoc view.",
	);

	// --- Study 45: chord quality ---
	table(
		"tbl-quality45",
		[
			"measure",
			"dense sheet SS2-107-Ab",
			"control sheet SS2-88-F",
			"ten Woodward songs (guard)",
		],
		[
			[
				"Arm 0, bar grid: quality positions lost \u00b7 hint already wrong \u00b7 power chord \u00b7 model's own",
				"40 of 97 \u00b7 25 \u00b7 13 \u00b7 2",
				"38 of 91 \u00b7 12 \u00b7 25 \u00b7 1",
				"\u2014",
			],
			[
				"paired takes: qualities up \u00b7 down \u00b7 roots down",
				"6 takes paired with the control: up 6 \u00b7 down 1 \u00b7 roots down 0 (both sheets together)",
				"\u2014",
				"up 1 \u00b7 down 0 \u00b7 roots down 1 (50 \u2192 48, class unchanged)",
			],
			[
				"good drafts, production \u2192 quality clause",
				"1 of 6 \u2192 2 of 6 (04 from confidently wrong to good)",
				"2 of 4 answered (2 refused) \u2192 3 of 6",
				"8 of 10 \u2192 8 of 10",
			],
			[
				"half-diminished spelled (m7b5)",
				"1 of 6 \u2192 3 of 6",
				"2 of 4 answered \u2192 4 of 6",
				"\u2014",
			],
			[
				"drafts with a power chord",
				"1 of 6 \u2192 3 of 6",
				"2 of 4 \u2192 2 of 6",
				"\u2014",
			],
			[
				"content-filter stops",
				"0 \u2192 0",
				"2 of 6 \u2192 0 of 6",
				"0 \u2192 0",
			],
		],
		"Registered cedaf0b (docs/BRIEF-STUDY45.md) before any draft. Arm 0 ($0): Study 43's 24 guitar cells, hints recomputed with the same ChordMini vote, truth the sheet's chord at each cell, each quality-bearing bar classed by Study 34's quality families. Arm 1 ($1.46 of $2.50): Study 43's pipeline on Beat This small0's bars as read with the production system prompt's rock clause replaced by a style-neutral quality clause (src/study45/prompt45.ts, pinned to differ in that clause only); twelve SS2 takes paired with Study 43's bar-grid drafts, ten Woodward songs paired with Study 41's. Predictions: P1, P3, P4 right; P2 (two more good) and P5 (no power chords) wrong. S45-D1 by the registered rule: reported without a recommendation; the runner's printed line was looser and is corrected in the brief.",
	);

	// --- Study 43: the draft format ---
	table(
		"tbl-format43",
		[
			"set",
			"bar grid (as read)",
			"half grid (two cells a bar)",
			"Study 38 on madmom bars",
		],
		[
			[
				"dense sheet SS2-107-Ab, 6 takes: roots right of 14",
				"14, 14, 14, 12, 11, 14 \u00b7 1 good",
				"14, 14, 14, 12, 14, 14 \u00b7 1 good",
				"11, 14, 10, 11, refused, 13 \u00b7 3 confidently wrong",
			],
			[
				"dense sheet: qualities right of 11",
				"9, 7, 2, 7, 8, 7",
				"7, 7, 1, 9, 9, 7",
				"7, 7, 3, 7, \u2014, 6",
			],
			[
				"control sheet SS2-88-F, 6 takes: roots right of 14",
				"refused, 14, 12, refused, 14, 14 \u00b7 2 good",
				"14, 14, 14, 14, 14, 14 \u00b7 4 good",
				"14, 14, 12, 13, 14, 14 \u00b7 4 good",
			],
			[
				"guitar, 12 takes: half grid against bar grid",
				"\u2014",
				"lifts 2 \u00b7 lowers 0 \u00b7 equal 8 \u00b7 roots median 1.00 both",
				"\u2014",
			],
			[
				"Winterreise, 8 shortest songs: roots median",
				"0.36 (7 graded, 1 refused) \u00b7 D911-19 good at 37/41",
				"0.58 \u00b7 lifts 5 \u00b7 lowers 2 \u00b7 none good",
				"0.25 \u00b7 none good",
			],
			[
				"input tokens, half grid against bar grid \u00b7 spend",
				"126,701",
				"141,474 (1.12\u00d7) \u00b7 $1.54 of $3",
				"\u2014",
			],
		],
		"Registered 8bfdacd (docs/BRIEF-STUDY43.md) before any draft. Study 41's pipeline verbatim on Beat This small0's downbeats; the half grid splits each bar at the tracker beat nearest its middle, typed tempo scaled to the cell. Sequence grading (LCS over collapsed roots and quality families), Study 35's class rule (roots under 80 % confidently wrong; roots 90 % and qualities 80 % good). Three drafts stopped at the gateway's content filter with empty text, counted and ungraded. Predictions: P4 right; P1, P2, P3 wrong (P3 at 0.58 against 0.60). S43-D1: no grid change.",
	);

	// --- Study 44: grid rules ---
	table(
		"tbl-gridrules44",
		[
			"measure",
			"threshold",
			"census readings removed (of 261)",
			"bar wrong at every fold among them (of 27)",
			"bar right at some fold among them",
		],
		[
			[
				"the app's share after joining",
				"< 0.6 (the app's rule)",
				"35",
				"13",
				"22",
			],
			[
				"the app's share after joining",
				"< 0.7 (the registered criterion's pick)",
				"57",
				"17",
				"40",
			],
			[
				"the app's share after joining",
				"< 0.4 (the bench's judgment)",
				"12",
				"5",
				"7",
			],
			["share as read (before joining)", "< 0.6", "62", "17", "45"],
			["fold-tolerant share", "< 0.6", "19", "8", "11"],
			["beat interval CV", "> 0.3", "61", "12", "49"],
			[
				"joining: bar count against the declared count",
				"census: toward 73 \u00b7 away 61",
				"at the declared level: toward 44 \u00b7 away 36 \u00b7 mean error 8.7 % \u2192 6.1 %",
				"gravity 118 \u2192 94 bars (94 declared), share 0.46 \u2192 0.84",
				"the app's five: toward 2 \u00b7 away 2",
			],
			[
				"mop heart, 3/4 at 224: share \u00b7 stands",
				"small0 0.30 \u00b7 no",
				"final0 0.47 \u00b7 no",
				"final0 + DBN 1.00 \u00b7 yes, 3/4 at 111",
				"madmom 1.00 \u00b7 yes, 3/4 at 111",
			],
		],
		"Registered f007124 (docs/BRIEF-STUDY44.md) before the run; $0. The app's trackerBarGrid.ts and beatThisGrid.ts (dev 36e7a919) ported verbatim and pinned to its thirteen tests. Readings: Beat This small0 over the 261-song Josh Woodward census (Study 36b, declared tempo and meter), the ten Woodward songs and five MMKK recordings (Study 36), the twelve Study 43 guitar takes; 887 cells with final0, final0 + DBN and madmom beside. Among the 22 drafts on small0 bars the app's rule removes two sound drafts and misses the one confidently wrong (share 0.93). The app's beats-per-bar counts match the package on all five of its recordings. Predictions: P2, P3, P5 right; P1, P4 wrong.",
	);

	// --- Study 42: the export ---
	table(
		"tbl-export42",
		[
			"item",
			"static 1500-frame export",
			"dynamic-length export (cache off)",
			"Study 10 export (for contrast)",
		],
		[
			[
				"exporter \u00b7 size",
				"TorchScript, opset 17 \u00b7 9.9 MB",
				"dynamo, opset 18 \u00b7 10.5 MB",
				"third-party \u00b7 10.4 MB",
			],
			[
				"frame logits vs the package, max abs difference (3 songs)",
				"3e-5 to 4e-5 at 1500 frames",
				"1e-5 to 7e-5 at 750, 1500, 3000 frames",
				"identical at 250 frames; breaks past 300",
			],
			[
				"reference inference vs the package, ten songs",
				"beat F 1.000 \u00b7 downbeat F 1.000 \u00b7 counts identical on 10 of 10",
				"\u2014",
				"downbeat F 0.51 to 0.78 \u00b7 bar counts off by up to 82",
			],
			[
				"model time per 30 s chunk: torch (16 threads) \u00b7 ONNX Runtime CPU 4 threads \u00b7 1 thread",
				"0.56 s \u00b7 0.54 s \u00b7 1.31 s",
				"\u2014",
				"\u2014",
			],
			[
				"ONNX Runtime Web 1.31.1, WebAssembly, Node 22: 1 thread \u00b7 4 requested",
				"4.46 s \u00b7 4.86 s (threads did not engage)",
				"\u2014",
				"\u2014",
			],
			[
				"per minute of audio, wasm \u00b7 placement rule (browser if under 15 s)",
				"8.9 s \u00b7 browser, server fallback at about 1 s",
				"\u2014",
				"\u2014",
			],
		],
		"Registered 4792e1f (docs/BRIEF-STUDY42.md) before any run; zero model spend. Exports from the package's small0 checkpoint (sha256 6074be2c), torch 2.15; static export sha256 d57ae630, dynamic 8c009d90; files not committed, hashes are. Timings: mean of 5 after warm-up on the bench VM (16 vCPU EPYC 9554P). Predictions: P1, P2, P3, P5 right; P4 (ONNX Runtime at default threads no slower than torch) wrong, parity at four threads.",
	);

	// --- Study 41: one tracker ---
	table(
		"tbl-onetracker41",
		[
			"song",
			"declared grid (Studies 34, 35)",
			"madmom bars (Study 38)",
			"Beat This small0 bars",
			"Beat This final0 bars",
		],
		[
			["let it in", "18/21 saved", "18/21 saved", "18/21 saved", "18/21 saved"],
			["same boat", "15/18 saved", "16/18 saved", "16/18 saved", "16/18 saved"],
			[
				"gravity (6/8)",
				"16/26 wrong",
				"24/26 good",
				"24/26 good",
				"24/26 good",
			],
			[
				"my favorite regret (6/8)",
				"26/42 wrong",
				"40/42 good",
				"42/42 good (half bar)",
				"41/42 good (half bar)",
			],
			[
				"california lullabye",
				"49/53 good",
				"48/53 good",
				"50/53 good",
				"48/53 good",
			],
			["swansong", "28/30 good", "29/30 good", "29/30 good", "29/30 good"],
			["afterglow", "15/15 good", "15/15 good", "15/15 good", "15/15 good"],
			["cherubs", "28/28 good", "28/28 good", "28/28 good", "28/28 good"],
			[
				"goodbye to spring",
				"43/43 good",
				"43/43 good",
				"43/43 good (half bar)",
				"43/43 good",
			],
			[
				"i'm letting go",
				"28/33 saved",
				"33/33 good",
				"33/33 good",
				"30/33 good",
			],
			[
				"the app's rule: within two roots of madmom on every song, none wrong",
				"\u2014",
				"\u2014",
				"10 of 10, passes",
				"9 of 10, fails on one",
			],
			[
				"holds over the 46 tracker-bar drafts of Study 38: would hold \u00b7 good among them \u00b7 catches of 3 bad",
				"detected grid: 46 \u00b7 32 \u00b7 3",
				"drift over 4%: 17 \u00b7 12 \u00b7 1",
				"under 3 notes a bar: 0 \u00b7 0 \u00b7 0",
				"\u2014",
			],
			[
				"ONNX small0 (Study 10) vs the torch package, ten songs",
				"downbeat F at 70 ms 0.51 to 0.78",
				"bar counts off by up to 82",
				"same spectrogram, 250-frame chunks: logits equal to 0.00",
				"cause: the export breaks past 300 frames",
			],
		],
		"Registered 2d3dd48 (docs/BRIEF-STUDY41.md) before any draft; Kevin approved the spend. Roots right of bearing against the artist's chart, Study 35 class rule; 20 drafts at $2.01 (the $2.00 fence is a pre-draft check and stood at $1.93 before the last registered draft). Bars are the committed Study 36 readings. Holds are stem-shovel's constants (drift 4 percent, 3 notes a bar). Predictions: P1, P4, P5 right; P2 (the all-ten rule fails) and P6 (ONNX agrees at F 0.95) wrong; P3 unscored.",
	);

	// --- Study 40: detector sweeps ---
	table(
		"tbl-detector40",
		[
			"variant",
			"bar strict \u00b7 folded \u00b7 meter right (of 261)",
			"6/8 named: false \u00b7 true (of 37)",
			"right to wrong \u00b7 wrong to right",
		],
		[
			[
				"production detector (Study 36b baseline)",
				"95 \u00b7 176 \u00b7 180",
				"63 \u00b7 21",
				"\u2014",
			],
			[
				"duple-bar witness, r 0.80",
				"109 \u00b7 195 \u00b7 192",
				"19 \u00b7 4",
				"3 \u00b7 17",
			],
			[
				"duple-bar witness, r 1.00",
				"114 \u00b7 201 \u00b7 214",
				"10 \u00b7 4",
				"0 \u00b7 19",
			],
			[
				"duple-bar witness, r 1.15",
				"112 \u00b7 201 \u00b7 216",
				"3 \u00b7 1",
				"2 \u00b7 19",
			],
			[
				"never emit 6/8",
				"112 \u00b7 200 \u00b7 217",
				"0 \u00b7 0",
				"2 \u00b7 19",
			],
			[
				"sub-beat test off, super-beat kept",
				"100 \u00b7 191 \u00b7 207",
				"22 \u00b7 10",
				"2 \u00b7 7",
			],
			[
				"sub-beat grid, best of 60 cells (margin 1.50, share 0.80)",
				"100 \u00b7 179 \u00b7 188",
				"45 \u00b7 13",
				"1 \u00b7 6",
			],
			[
				"finer bar: take \u00d72 at strength \u2265 0.60",
				"51 \u00b7 159 \u00b7 180",
				"63 \u00b7 21",
				"71 \u00b7 27 (147 moves)",
			],
			[
				"finer bar: \u00d72 at \u2265 0.85",
				"73 \u00b7 167 \u00b7 180",
				"63 \u00b7 21",
				"34 \u00b7 12 (67 moves)",
			],
			[
				"finer bar: \u00d72 at \u2265 1.00",
				"80 \u00b7 172 \u00b7 180",
				"63 \u00b7 21",
				"17 \u00b7 2 (27 moves)",
			],
			[
				"finer bar, tempo cap",
				"fixable songs detected 70 to 149 bpm (median 89.5); strict-right 80 to 170 (median 119)",
				"cap 90: fixes 19, endangers 13",
				"cap 100: fixes 29, endangers 29",
			],
		],
		"Registered 8ba7ec3 (docs/BRIEF-STUDY40.md) before any sweep; zero model spend; 261 regular mixes, one feature extraction each, probe pinned to the detector on 261 of 261 (two earlier extractions failed the pin on 15 and 16 songs and are disclosed). Grading as Study 36b: bar = beats of the named meter \u00d7 60 / bpm against the declared bar, strict within 4%, folded, meter class. Answers the app's brief of 2026-11-10; written back into that brief. Predictions: P2, P3 right; P1, P4 wrong; P5 wrong by two points.",
	);

	// --- Study 38: the fully automatic chart ---
	table(
		"tbl-automatic38",
		[
			"arm \u00b7 slot or system",
			"automatic draft",
			"baseline or oracle",
			"note",
		],
		[
			[
				"A \u00b7 ten modern songs on madmom's bar",
				"10 of 10 within 2 roots of baseline or above; 8 good, 0 wrong",
				"declared-grid drafts of Studies 34 and 35",
				"no tempo, meter or key typed",
			],
			[
				"A \u00b7 gravity (6/8)",
				"24/26 roots, good",
				"16/26, confidently wrong at the typed 6/8 tempo",
				"madmom's 3-beat bar is the dotted-quarter bar",
			],
			[
				"A \u00b7 my-favorite-regret (6/8)",
				"40/42, good",
				"26/42, confidently wrong",
				"three-dotted-quarter bar lands on true bar lines every other bar",
			],
			[
				"A \u00b7 im-letting-go (half bar) \u00b7 goodbye-to-spring (double bar)",
				"33/33 \u00b7 43/43",
				"28/33 \u00b7 43/43",
				"the Study 37 fold policy at work",
			],
			[
				"B \u00b7 36 GuitarSet comping excerpts, annotated bars",
				"mean roots 99%, 28 good, 0 wrong (35 graded)",
				"the chord-reading ceiling",
				"qualities 89%: sevenths the sheet does not name",
			],
			[
				"B \u00b7 same excerpts, madmom's bars",
				"mean roots 96%, 24 good, 3 wrong (32 graded)",
				"2.9 points under the oracle, paired",
				"all 3 wrong on one dense lead sheet",
			],
			[
				"B \u00b7 trackers vs annotated bars (36)",
				"madmom strict 61%, folded 100%, downbeat F 0.69",
				"Beat This strict 86%, folded 97%, F 0.97",
				"without drums Beat This wins the bar",
			],
			[
				"C \u00b7 24 Winterreise songs (SC06), madmom's bars",
				"roots median 41% (sequence), 67% (per bar); 24 of 24 confidently wrong",
				"1.5 chord changes per tracker bar",
				"a one-chord bar is bounded near 50% before any error",
			],
			[
				"C \u00b7 trackers vs annotated measures (SC06 \u00b7 HU33 1933)",
				"madmom downbeat F 0.39 \u00b7 0.38; bar count within 10% on 12 \u00b7 11 of 24",
				"Beat This F 0.68 \u00b7 0.61",
				"the DBN does not follow rubato; Beat This does, at half the written bar",
			],
			[
				"gateway",
				"5 of 72 guitar answers empty or cut off, labelled refused",
				"3 of 5 empty again on an unregistered retry, finish reason content filter",
				"the gateway's content filter stops the draft on three excerpts; production needs a visible retry",
			],
		],
		"Registered 62c3d63 (docs/BRIEF-STUDY38.md) before any paid draft; 106 drafts at $3.84 of an $8 fence plus 168 metrical cells at $0. Truth: artist charts (A), GuitarSet's instructed chord annotation (B), the Winterreise audio-time chord annotation (C). Decision rules: S38-D1 fires (automatic mode is the tracker's bar as read, shorter bar preferred, no confidence refusal); S38-D2 fires (the chord reader is the next target on acoustic material); S38-D3 sends free tempo to a tracker comparison (Study 39) before more drafts. Predictions: A1, A3, A4, B1, B2, B4 right; A2, B3, C3 half right; C1, C2, C4 wrong, C4 reversed.",
	);

	// --- Study 37: witness and policy ---
	table(
		"tbl-witness37",
		["arm \u00b7 base or slot", "before", "after", "note"],
		[
			[
				"C \u00b7 Beat This final, 4/4 (223)",
				"strict 165 (74%)",
				"strict 136 (61%)",
				"fixed 1, broke 30, abstained 146; strict bar among candidates on 199",
			],
			[
				"C \u00b7 Beat This final, 6/8 (36)",
				"strict 13",
				"strict 13",
				"fixed 1, broke 1",
			],
			[
				"C \u00b7 madmom [3, 4], 4/4 (223)",
				"strict 164",
				"strict 135",
				"fixed 4, broke 33",
			],
			[
				"C \u00b7 madmom [3, 4], 6/8 (37)",
				"strict 6",
				"strict 12",
				"fixed 6, broke 0: the 2/3 ratio undoes a double bar",
			],
			[
				"C \u00b7 production, 4/4 (223)",
				"strict 92",
				"strict 89",
				"fixed 13, broke 16",
			],
			[
				"C \u00b7 production, 6/8 (37)",
				"strict 3",
				"strict 9",
				"fixed 6, broke 0",
			],
			[
				"C \u00b7 anatomy, Beat This final 4/4",
				"77 actions",
				"26 at ratio 1/2, 11 at ratio 2",
				"60 to 124 chord changes per song; the stability term votes for the shorter bar",
			],
			[
				"D \u00b7 let-it-in at 242 (half bar)",
				"18/21 roots, saved below threshold",
				"20/21 roots, 21/25 quals, good",
				"240 bars drafted, 98 merged, 120 at the declared grid",
			],
			[
				"D \u00b7 same-boat at 186 (half bar)",
				"15/18, saved below threshold",
				"16/18, 11/11, saved below threshold",
				"151 drafted, 56 merged, 74 declared",
			],
			[
				"D \u00b7 im-letting-go at 152 (half bar)",
				"28/33, saved below threshold",
				"33/33, 15/15, good",
				"117 drafted, 51 merged, 58 declared",
			],
			[
				"D \u00b7 gravity at 144 (6/8 adapter)",
				"16/26, confidently wrong",
				"23/26, 12/12, saved below threshold",
				"grid 1.4% off the typed value, the largest drift",
			],
			[
				"D \u00b7 my-favorite-regret at 195 (6/8 adapter)",
				"26/42, confidently wrong",
				"40/42, 17/17, good",
				"both 6/8 drafts saved",
			],
		],
		"Registered 3dc106b (docs/BRIEF-STUDY37.md) before any scored run; part C zero spend over 1,043 cells (261 songs \u00d7 4 base systems), part D five drafts at $0.452 of a $0.60 fence. Disclosed: the first witness pass measured the bar from the mean beat interval and failed to reproduce Study 36b; it is preserved as results/study37c-defective-run1.json and the corrected median run, which reproduces 1,022 of 1,043 Study 36b grades, is the result. Predictions: C5, D2, D3, D4 right; C1 to C4, C6, C7 and D1 wrong (D1 in the favourable direction).",
	);

	// --- Study 36b: the catalog census ---
	table(
		"tbl-census36b",
		["system \u00b7 class (n)", "bar strict", "bar folded", "meter right"],
		[
			["production \u00b7 all regular (261)", "36%", "67%", "69%"],
			["production \u00b7 4/4 straight (177)", "38%", "64%", "68%"],
			["production \u00b7 4/4 swing (46)", "54%", "85%", "83%"],
			[
				"production \u00b7 6/8 (37)",
				"8%",
				"62%",
				"57% (names 6/8 on 21; bar strict on 2 of those)",
			],
			["Beat This final \u00b7 all regular (261)", "70%", "90%", "85%"],
			[
				"Beat This final \u00b7 4/4 straight (177)",
				"76% (Wilson 70 to 81)",
				"93%",
				"92%",
			],
			["Beat This final \u00b7 4/4 swing (46)", "76%", "96%", "85%"],
			["Beat This final \u00b7 6/8 (37)", "32%", "68%", "57%"],
			["Beat This small \u00b7 all regular (261)", "69%", "90%", "87%"],
			["Beat This small \u00b7 4/4 straight (177)", "75%", "92%", "91%"],
			["madmom [3, 4] \u00b7 all regular (261)", "66%", "89%", "85%"],
			["madmom [3, 4] \u00b7 4/4 straight (177)", "73%", "91%", "100%"],
			["madmom [3, 4] \u00b7 6/8 (37)", "16%", "68%", "0% (no compound class)"],
			[
				"production \u00b7 false 6/8 on 4/4 songs",
				"63 of 223 (28%)",
				"56 straight, all via subdivision 3",
				"59 of the 63 bars fold to nothing",
			],
			[
				"paired arm \u00b7 Beat This final (244 songs)",
				"instrumental fixes 10 of 74 failures",
				"breaks 11 of 170 passes",
				"production changes on 35 of 244",
			],
			[
				"fold direction \u00b7 Beat This final, 4/4 folded not strict (39)",
				"28 at half the declared bar (declared median 72)",
				"8 at twice it (declared median 212)",
				"merge-safe direction 28 of 39",
			],
		],
		"Registered a249201 after the corpus freeze ba8b277 (docs/BRIEF-STUDY36B.md); zero model spend; 1,776 cells (261 regular mixes \u00d7 4 systems + 244 instrumental mixes \u00d7 3). Audio from the artist's purchased catalog bundle, hashes committed, audio not. Truth is the artist's declared tempo and meter; a 6/8 bar is two dotted quarters. Neither registered decision rule fired: no tracker reaches 80% strict and 95% folded on 4/4, and the instrumental fix rate of 14% keeps source separation down the list.",
	);

	// --- Study 36: tracker bake-off ---
	table(
		"tbl-trackers36",
		[
			"system",
			"modern ten: strict \u00b7 folded \u00b7 meter",
			"acoustic six: bar strict",
			"downbeat phase and bar counts on the 78s",
		],
		[
			[
				"production (v0.200 detector + shipped placement)",
				"3 \u00b7 7 \u00b7 8",
				"0 of 6",
				"livery 68 bars vs 125, dippermouth 56 vs 114, st-louis 30 vs 53",
			],
			[
				"Beat This final (78 MB, peak-picking)",
				"6 \u00b7 9 \u00b7 8",
				"4 of 6",
				"livery F 0.86, 128 bars; dippermouth F 0.00 (downbeats on beat 3), 114 bars; st-louis 57",
			],
			[
				"Beat This small (8 MB)",
				"7 \u00b7 8 \u00b7 8",
				"3 of 6",
				"livery F 0.83, 127; dippermouth F 0.00, 115; st-louis halved the bar, 80",
			],
			[
				"Beat This final + madmom DBN",
				"6 \u00b7 9 \u00b7 8",
				"4 of 6",
				"livery F 0.85, 126; dippermouth F 0.00, 114; st-louis 53 of 53",
			],
			[
				"madmom RNN + DBN, bars of 3 or 4",
				"7 \u00b7 10 \u00b7 8 (meets S36-D1)",
				"3 of 6",
				"livery F 0.96, 126; dippermouth F 0.66, 114; st-louis F 0.69, 52",
			],
			[
				"madmom, bars of 3, 4 or 6 (exploratory)",
				"7 \u00b7 10 \u00b7 9",
				"1 of 6",
				"hears six-beat bars in dippermouth and st-louis",
			],
			[
				"librosa unseeded (tempo only)",
				"4 \u00b7 10 \u00b7 n/a",
				"3 of 6",
				"beats only, no downbeats",
			],
			[
				"6/8 songs (gravity, my-favorite-regret)",
				"production: gravity EXACT in automatic mode (2.466 s vs 2.5)",
				"Beat This: three-beat bars on both",
				"madmom with a 6 class names both, then hears sixes in jazz",
			],
			[
				"the hymn (declared 97.1, bar 2.47 s)",
				"every system wrong",
				"2.30 Beat This, 3.01 madmom, 3.33 production",
				"the field's own hard class",
			],
		],
		"Registered 6ed6b20 (docs/BRIEF-STUDY36.md) before any run; zero model spend; 161 cells (23 recordings \u00d7 7 systems). Truth: the Study 34 and 35 union with bar-level truth (click-exact Badverbs grids, JAAH beat annotations, the 34b self-similarity tempos, the artist's declared values). Disclosed: on eat-all-the-clocks every tracker sits 85 ms after the registered grid, exactly the registered bar-one offset, so downbeat F is 0.00 for all of them at the 70 ms window while production scores 0.99 from the same onset grid that made the truth. Predictions: P2, P3, P5 right; P1 and P4 wrong.",
	);

	// --- Study 35: modern material ---
	table(
		"tbl-modern35",
		["slot (declared)", "grid landing", "roots \u00b7 qualities", "class"],
		[
			[
				"let-it-in (121, 4/4) \u00b7 Study 34 record reused",
				"121 bars, 0.0% off",
				"18/21 = 85.7% \u00b7 20/25",
				"saved below threshold",
			],
			[
				"same-boat (93, 4/4) \u00b7 redrafted at declared",
				"75 bars, 0.0% off",
				"15/18 = 83.3% \u00b7 11/11",
				"saved below threshold",
			],
			[
				"gravity (48, 6/8 swing)",
				"1.4% off the misread 7.5 s bar (true bar 2.5 s)",
				"16/26 = 61.5% \u00b7 12/12",
				"confidently wrong AND saved: the units bug",
			],
			[
				"my-favorite-regret (65, 6/8 straight)",
				"0.0% off the misread bar, same 3\u00d7 stretch",
				"26/42 = 61.9% \u00b7 13/17",
				"confidently wrong AND saved: the units bug",
			],
			[
				"california-lullabye (176, 4/4)",
				"181 bars, 0.0% off",
				"49/53 = 92.5% \u00b7 33/35",
				"good",
			],
			[
				"swansong (170, 4/4)",
				"178 bars, 0.0% off",
				"28/30 = 93.3% (interval-invariant) \u00b7 19/19",
				"good",
			],
			[
				"afterglow (98, 4/4)",
				"85 bars, 1.0% off",
				"15/15 = 100% \u00b7 5/5",
				"good",
			],
			[
				"cherubs (165, 4/4)",
				"171 bars, 0.0% off",
				"28/28 = 100% (interval-invariant) \u00b7 17/17",
				"good",
			],
			[
				"goodbye-to-spring (240, 4/4)",
				"223 bars, 0.0% off at the extreme declared tempo",
				"43/43 = 100% (interval-invariant) \u00b7 22/23",
				"good",
			],
			[
				"im-letting-go (76, 4/4, sparse)",
				"59 bars, 0.3% off",
				"28/33 = 84.8% \u00b7 15/15",
				"saved below threshold",
			],
			[
				"automatic mode, the 0.84 refusal (reported)",
				"detector tempo wrong on 8 of 10",
				"refuses BOTH right detections (0.809, 0.797)",
				"passes only wrong ones (88.0 at 0.845, 82.5 at 0.860)",
			],
			[
				"arm D (exploratory): tempo-following tracker",
				"livery: 510 beats \u2192 128 bars vs 125 truth",
				"livery 112/125 = 89.6% vs 17\u201331% on every fixed comb",
				"st-louis stays 3/53 with bars landing: transcription, not grid",
			],
		],
		"Registered 4f8f831 after the corpus freeze 69ea88c (docs/BRIEF-STUDY35.md); nine paid drafts plus two arm D, $1.000 of the $3.00 fence across 1,904 cells. Same-day grading correction disclosed in the registration: tier-3 roots regraded at the calibrated capo transposition at zero model spend, both gradings preserved. Holds: grid drift and notes-per-bar fire on nothing (S35-G3 passes) and catch neither 6/8 failure. The gateway ignores temperature on this model family.",
	);

	// --- Study 34b: declared priors ---
	table(
		"tbl-declared34b",
		[
			"slot",
			"declared grid's landing",
			"roots: detected -> declared priors",
			"failure stage",
		],
		[
			[
				"dippermouth-blues (186 bpm declared)",
				"114 bars of 114, 0.8% off declared",
				"46% -> 66% (unknown share 0.000)",
				"transcription: 2.2 notes/bar on the 1923 side; the draft fills the silence confidently",
			],
			[
				"st-louis-blues (67 bpm declared)",
				"49 bars vs 53, settled 7.2% off",
				"8% -> 6%; 39% with the key declared too",
				"comb: an unevenly cut 78 has no single tempo to find",
			],
			[
				"livery-stable-blues (164 bpm declared)",
				"115 bars vs 125, settled 8.9% off",
				"64% -> 53%",
				"comb: the same drift",
			],
			[
				"roll-called-up-yonder (97 bpm declared)",
				"76 bars, the committed form expectation exactly",
				"0% -> 17%; 31% with the key declared too",
				"transcription: 1.9 notes/bar from four a cappella voices",
			],
			[
				"three-oclock-waltz (142 bpm, 3/4 declared)",
				"149 bars, the published 118 plus the repeated strain exactly",
				"8% -> 6%; 8% with the key declared too",
				"transcription: 1.3 notes/bar on the 1921 orchestra",
			],
			[
				"Part A over fifteen recordings",
				"tempo confidence separates at \u22480.84 (2 errors of 12, both the safe direction)",
				"truth on a ladder rung for only 3 of 7 wrong tempos",
				"key confidence does not separate: one wrong key at confidence 1.000",
			],
			[
				"Part C over ten recordings",
				"half-bar pickup bound: zero false calls",
				"a real 3.3-beat late entrance correctly left alone",
				"the corpus holds no true pickups, so the catch rate stays unmeasured",
			],
		],
	);

	// --- Study 34: the chartless draft outside MMKK ---
	table(
		"tbl-breadth34",
		["recording", "tier \u00b7 detected prior", "roots", "class"],
		[
			[
				"eat-all-the-clocks (control)",
				"1 \u00b7 page 120 4/4 Em",
				"67/68 = 98.5%",
				"control reproduces its ceiling; quality families 59% on power-chord notation scope",
			],
			[
				"interbellum",
				"1 \u00b7 page 115 4/4 C",
				"\u2014",
				"refused: the only draft with no parseable answer, on the clean DAW export",
			],
			[
				"dippermouth-blues (1923)",
				"1 \u00b7 dsp 91 bpm 4/4 C",
				"26/56 = 46.4%",
				"confidently wrong: grid at exactly half tempo, 57 bars against 114",
			],
			[
				"st-louis-blues (1925)",
				"1 \u00b7 dsp 106 bpm 4/4 Bb",
				"6/75 = 8.0%",
				"confidently wrong: wrong tempo level entirely",
			],
			[
				"livery-stable-blues (1917)",
				"1 \u00b7 dsp 83 bpm 4/4 Eb",
				"43/67 = 64.2%",
				"confidently wrong on bar count, yet 11/11 section boundaries placed",
			],
			[
				"roll-called-up-yonder (quartet)",
				"2 \u00b7 dsp 78.6 bpm 4/4 Cm",
				"0/16 = 0%",
				"confidently wrong: the detector missed tempo and key on sparse voices",
			],
			[
				"three-oclock-waltz (1921)",
				"2 \u00b7 dsp 77.9 bpm 4/4 Am",
				"5/61 = 8.2%",
				"confidently wrong: a 3/4 waltz read as 4/4",
			],
			[
				"jw-let-it-in",
				"3 \u00b7 dsp 121.0 bpm 4/4 Dm",
				"18/21 = 85.7% (sequence)",
				"saved just below threshold; the detector matched the artist's declared 121",
			],
			[
				"jw-same-boat",
				"3 \u00b7 dsp 123.1 bpm 4/4 Bbm",
				"16/18 = 88.9% (sequence)",
				"saved just below threshold; quality families 11/11",
			],
			[
				"kitten-on-the-keys \u00b7 sp-today-live \u00b7 irish-jigs-medley",
				"class-only",
				"\u2014",
				"all three saved a draft; the 6/8 jig was declared 4/4, the detector cannot say 6/8",
			],
		],
	);

	// --- Study 19: the ChordMini port gated (no figure) ---
	table(
		"tbl-chordmini-port",
		["cell", "result", "the read"],
		[
			[
				"S19-G1: frame parity (pass line 99.5%, the app's own)",
				"100.000% on all four public mixes: 0 of 7,102 frames differ (1,522 + 1,588 + 2,764 + 1,228), frame counts exact per song",
				"the TS constant-Q transform (Kaiser resampler included), the wasm ONNX inference and the smoothing reproduce numpy + librosa at argmax level; the registered prediction said at least 99.9% with differences at window edges, and the measurement left nothing to locate",
			],
			[
				"S19-G2: bar parity (within one of Study 17)",
				"59/76 gated and 53/86 exploratory: Study 17's registered numbers to the bar, not merely within tolerance",
				"the dashboard's real-audio chord numbers now describe the production feature itself, not a Python harness that resembles it",
			],
			[
				"pre-registration map checks",
				"the app's chart-symbol file is the bench's vocabulary map: 170 entries, zero diffs, index order equal",
				"pinned before the run, so a label-mapping drift could not masquerade as model behavior",
			],
			[
				"the tie-break anatomy (disclosed)",
				"the app's vote on the reference's own frames differs from the reference's per-bar answer at exactly 2 bars of one song: both exact 5-to-5 frame ties between F# and F#m",
				"numpy argmax breaks a tie toward the lower vocabulary index, the app's vote toward the first label the bar encounters; truth at both bars is F#5, either reading grades right, and tie order on exact ties is the entire remaining daylight",
			],
			[
				"the standing rule",
				"the app never runs the AI reconciler on the model's chords; the shipped code's comment carries Study 17 G4 (16 right bars broken)",
				"restated, not re-gated; nothing here changes it",
			],
			[
				"the ledger",
				"$0, zero model calls, ~30 seconds of compute per song · 7,264 cells",
				"drafted by the Stem Shovel agent (its promised parity table was missing from the committed brief, so these are the canonical numbers), registered and run by the bench from a worktree pinned at the shipping commit",
			],
		],
	);

	// --- Study 18: the v0.231 matcher rules on real audio (no figure) ---
	table(
		"tbl-matcher231",
		["cell", "result", "the read"],
		[
			[
				"S18-G1: the anchor",
				"v0.142 constants over re-transcribed notes: 29/76 (strict-first 20, power 9) and 24/86 · PASS exact, the third reproduction",
				"every comparison sits on the stored footing, not the app's lossy barNotes reconstruction (whose baseline read 48/76)",
			],
			[
				"S18-G2: the fixture table",
				"424 / 432 / 432 / 439 / 439 of 440 across the five configurations, static-bloom 20 → 28 of 28 · PASS to the digit",
				"re-derived through the bench's registered port, pinned bar for bar (440/440) to the retired matcher at the old constants; matcher3 fields added beside v0.141/v0.142",
			],
			[
				"S18-G3: the bass rule alone (15% duration to earn the root bonus)",
				"29 → 39/76 gated, 24 → 26/86 exploratory · PASS, both central estimates hit",
				"the pickup class closed on real audio: a bar no longer renames after the chord that follows it",
			],
			[
				"S18-G4: the presence rule (12% line, 0.12 cost)",
				"shipped 41/76 + 30/86 = 71 vs bass-only 65: net +6 · PASS by the author's own registered decision rule",
				"the overturned hedge: the handoff read this rule as a wash or a loss from reconstructed notes, and the bench registered that hedge as its prediction; both were wrong, the reconstruction was the artifact · strict-first rises 20 → 24 and 18 → 23, genuine readings, not allowance credit",
			],
			[
				"the sweep (disclosed, ungated)",
				"presentShare 0.08–0.15 × bassMinShare 0.10–0.25: shipped (0.12/0.15) on the plateau; bass 0.10 readmits pickups (41 → 37), bass 0.25 regresses the faster-bass song",
				"no re-tuning recommended, none performed; the constants were set before the real measurement and survive it",
			],
			[
				"the floor and the ceiling",
				"the real chord path moves 38.2% → 53.9% gated, exactly Study 13's reconciled 41/76, from two constants and one duration check",
				"ChordMini on the mix still reads 59/76 (+18), so Study 17's ship order is unchanged: v0.231.0 raises the shipped floor, the front-end swap remains the ceiling move · hint baseline for future studies moves 29 → 41",
			],
			[
				"the ledger",
				"$0, zero model calls, ~8 minutes of transcription CPU · 2,686 cells",
				"drafted by the Stem Shovel agent from the bench's own fixture, registered and run by the bench: the cross-agent loop, fourth instrument class",
			],
		],
	);

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

	// --- Study 17: the cliff, the successors, and the reconciler's first breaks ---
	(() => {
		const GROUPS = [
			{
				label: "production today",
				rows: [
					{
						name: "Basic Pitch + matcher",
						v: 38.2,
						color: "#e66767",
						note: "29/76",
					},
					{
						name: "+ the reconciler (Study 14)",
						v: 57.9,
						color: "#c98500",
						note: "44/76",
					},
				],
				tip: "the anchor, reproduced to the digit before any new number was read (gate S17-G1 PASS exact): the shipped chord path at 29/76 on the gated real recording, and production's reconciled ceiling at 44/76",
			},
			{
				label: "the successors, registered grade",
				rows: [
					{
						name: "per-stem Basic Pitch",
						v: 42.1,
						color: "#8b93a3",
						note: "32/76",
					},
					{
						name: "bar-pooled chroma",
						v: 0,
						color: "#8b93a3",
						note: "0/76 (roots 68/76)",
					},
					{
						name: "ChordMini on the mix",
						v: 77.6,
						color: "#199e70",
						note: "59/76",
					},
				],
				tip: "per-stem helps here (no vocal stem) and falls to 15/86 on the exploratory song, whose vocal stem's transcribed melody pollutes the merged harmony · chroma holds 68/76 roots but dresses them in hallucinated sevenths, the disclosed self-proof class at full scale · ChordMini passes the successor gate (37) and production's reconciled number (44): gates S17-G2 and S17-G3 both PASS",
			},
			{
				label: "the reconciler stacked on ChordMini",
				rows: [
					{
						name: "4 fixes, 16 breaks",
						v: 61.8,
						color: "#e66767",
						note: "47/76",
					},
				],
				tip: "gate S17-G4 FAIL, the reconciler's first breaks in three studies: ChordMini's chords are better than the transcribed notes support, so a pass that corrects the chords toward the notes destroys information · on the exploratory song it changed nothing",
			},
		];
		const BAR = 14,
			GAP = 4,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 255,
			R = 118,
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
		byId("legend-s17").innerHTML =
			'<span class="key"><span class="chip" style="background:#e66767"></span>the current path, and the harmful stack</span>' +
			'<span class="key"><span class="chip" style="background:#c98500"></span>production’s reconciled ceiling</span>' +
			'<span class="key"><span class="chip" style="background:#8b93a3"></span>successor arms that lost</span>' +
			'<span class="key"><span class="chip" style="background:#199e70"></span>ChordMini on the mix, the rematch winner</span>' +
			legendNote(
				"bar-level chord accuracy on the gated real recording (letter-lands, 76 bars) · every arm shares Study 12’s bar grid and Study 13’s grader · arms A to D cost nothing; the whole study ran at about $0.30",
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
		const el = byId("fig-rematch");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of chord accuracy on the real recording: the current path reads 38.2 percent and production's reconciled ceiling is 57.9 percent; among the successors, per-stem transcription reads 42.1 percent, bar-pooled chroma zero, and ChordMini on the mix 77.6 percent; stacking the reconciler on ChordMini falls back to 61.8 percent with sixteen broken bars.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the rematch in one frame: the neural reader that lost every synthetic comparison reads the real recording at 78 percent, past the reconciled ceiling of the shipped path, and the reconciler that never broke a bar in two studies breaks sixteen the moment the draft no longer comes from the notes it reads",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-rematch",
			["cell", "result", "the read"],
			[
				[
					"S17-G1: the anchor",
					"arm A reproduces Study 13 arm 1 to the digit: 29/76 (strict-first 20, power allowance 9), exploratory 24/86 · PASS exact",
					"the instrument proved before any new number was read; the pipeline is deterministic end to end",
				],
				[
					"S17-G2 and G3: a successor exists, and beats code-plus-model",
					"ChordMini on the mix: 59/76 (77.6%) gated, 53/86 exploratory · both PASS",
					"past the 37/76 successor gate AND production's reconciled 44/76, so the front-end swap outranks the reconciler in ship order · Study 10's synthetic verdict reversed, the home-field lesson's third instrument class · the disclosed harmonic-sum read won the gated song and collapsed exploratory, so the registered mix choice survives",
				],
				[
					"the anatomy: roots, not dressings",
					"gated truth: 74 power-chord and 50 sus4 slots · ChordMini's credit all through the power-chord allowance (strict-first 0) · disclosed root-only read: current path 53/76, per-stem 65, chroma 68, ChordMini 70 (75/84 exploratory)",
					"every successor out-reads the anchor at the root level; the registered differences are quality dressing, and ChordMini will never spell F#5 or Esus4, so the draft layer decides the dressing",
				],
				[
					"arm C: bar-pooled chroma into the shipped matcher",
					"0/76 registered while holding 68/76 roots",
					"right roots dressed in hallucinated sevenths, the exact over-read class the pre-registration self-proof surfaced and the brief disclosed; a quality fix needs a tuned mass threshold the arm was registered not to have, so it belongs to a registered follow-up or nowhere",
				],
				[
					"arm B: per-stem transcription",
					"32/76 gated (up from 29) · 15/86 exploratory (down from 24)",
					"the split is legible: the gated song has no vocal stem, the exploratory one does, and transcribed melody pollutes the merged harmony · one song each way is a hypothesis, with a rule attached: vocal-labeled stems stay out of chord evidence",
				],
				[
					"S17-G4: the reconciler stacked on the winner",
					"59 → 47/76: 4 fixes, 16 breaks · FAIL, the first breaks in three studies",
					"ChordMini's chords are better than the transcribed notes support, so correcting toward the notes destroys information; the reconciler's value is conditional on its evidence channel producing the draft, and it stays on the Basic Pitch path only",
				],
				[
					"the scorecard, and the ledger",
					"predictions 2 right, 1 half, 3 wrong (the reconciler clause wrong in the instructive direction: 2 or fewer breaks predicted, 16 measured) · ~$0.30 of the $2 fence · 650 cells",
					"ship guidance delivered: ChordMini on the mix as the real-recording chord front end (~30 MB pinned ONNX, 4 to 6 s a song on CPU, zero API spend), a root-plus-power draft layer, and no reconciler on its output",
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
