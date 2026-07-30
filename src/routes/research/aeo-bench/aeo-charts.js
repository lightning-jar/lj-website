// @ts-nocheck
// Chart rendering for the aeo-bench dashboard, following the barkup-bench
// semantic chart system (chart container, chart-legend, chart-tick,
// chart-caption, data-table). Runs on mount; builds inline SVGs.
export function initAeoCharts() {
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
	function table(el, headers, rows) {
		byId(el).innerHTML =
			"<table><thead><tr>" +
			headers.map((h) => '<th scope="col">' + h + "</th>").join("") +
			"</tr></thead><tbody>" +
			rows
				.map(
					(r) => "<tr>" + r.map((c) => "<td>" + c + "</td>").join("") + "</tr>",
				)
				.join("") +
			"</tbody></table>";
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

	// --- Study 1: unprompted markdown adoption + input-cost ratio ---
	(() => {
		const GROUPS = [
			{
				model: "opus-4.8",
				vals: [64, 82],
				tip: "adoption 45/72 markdown-arm cells (mostly Accept negotiation) · but savings only ~18%; opus was already frugal (2.7 fetches, 6.9k tokens per task)",
			},
			{
				model: "gemini-3.5-flash",
				vals: [40, 27],
				tip: "adoption 29/72 via the hidden directive · input cost fell to 26–27% of baseline, a 73–74% saving, inside Cloudflare's claim",
			},
			{
				model: "kimi-k3",
				vals: [3, 49],
				tip: "2/72 cells · too few adopters for a stable ratio (49% on n=2)",
			},
			{
				model: "sonnet-4.5",
				vals: [0, null],
				tip: "0/72: never discovered the pathway; no ratio exists",
			},
			{
				model: "gpt-oss-120b",
				vals: [1, null],
				tip: "1/72: effectively never; no stable ratio",
			},
			{
				model: "haiku-4.5",
				vals: [0, null],
				tip: "0/72 (registered backfill): never discovered the pathway, like sonnet; moot for a first-party agent whose harness sets the Accept header",
			},
		];
		const CADOPT = "#3987e5",
			CRATIO = "#c98500";
		byId("legend-1").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CADOPT +
			'"></span>unprompted markdown adoption (% of 72 markdown-arm cells)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CRATIO +
			'"></span>input-cost ratio vs own baseline among adopters (lower is better)</span>' +
			legendNote(
				"the fetch tool never mentioned markdown: adoption means the model found the hidden directive and acted on it · ratio bars absent where a model produced too few adopter cells to measure",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 150,
			R = 70;
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
				if (v === null) {
					marks += `<text fill="#8b93a3" font-size="11" x="${L + 4}" y="${y + BAR - 3}">n/a</text>`;
					return;
				}
				const w = Math.max((v / 100) * iw, 2);
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? CADOPT : CRATIO}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}%</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.model + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-adoption");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart per model: unprompted markdown adoption is sixty-four percent for opus, forty percent for gemini, and near zero for sonnet, kimi, and gpt-oss; among adopters the input-cost ratio versus baseline is eighty-two percent for opus and twenty-seven percent for gemini; the savings are largest for the least frugal agent.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the two markdown findings in one frame: adoption is a model disposition (some models read the hidden directive and act, some never do), and the cost saving among adopters is proportional to how wasteful the agent's baseline was; the frugal frontier model saves least",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-adoption",
			[
				"cell",
				"gemini-3.5-flash",
				"sonnet-4.5",
				"opus-4.8",
				"kimi-k3",
				"gpt-oss-120b",
				"haiku-4.5",
			],
			[
				[
					"present-class correct, all arms (v1 → 1′ grader)",
					"140/140",
					"140/140",
					"140/140",
					"140/140",
					"118 → 122/140",
					"140/140",
				],
				[
					"absent-class correct, all arms (v1 → 1′ grader)",
					"40/40",
					"35/40",
					"31 → 39/40",
					"40/40",
					"6/40 (52 empty-text cells)",
					"35 → 40/40",
				],
				["llms.txt fetches (of 180 cells)", "0", "0", "0", "0", "0", "0"],
				["sitemap.xml fetches (of 180 cells)", "0", "0", "0", "0", "0", "0"],
				[
					"unprompted markdown adoption (of 72)",
					"29",
					"0",
					"45",
					"2",
					"1",
					"0",
				],
				[
					"input-cost ratio among adopters",
					"26–27%",
					"n/a",
					"80–83%",
					"49% (n=2)",
					"n/a",
					"n/a",
				],
				[
					"mean fetches / baseline input tokens",
					"4.9 / 18.1k",
					"3.5 / 9.5k",
					"2.7 / 6.9k",
					"4.4 / 9.3k",
					"2.2 / 3.8k",
					"3.4 / 8.2k",
				],
				["invented facts (of 180 cells)", "0", "0", "0", "0", "0", "0"],
				[
					"model spend across the study",
					"$1.14",
					"$6.05",
					"$6.90",
					"$6.06",
					"$0.10",
					"$1.82",
				],
			],
		);
	})();

	// --- Study 2: orphan success, file-bearing arms vs the hint ---
	(() => {
		const GROUPS = [
			{
				model: "opus-4.8",
				vals: [0, 100],
				tip: "file arms 0/40 pooled (consulted a discovery file 0 times in 128 chances) · hinted: 10/10, consultation 15/32",
			},
			{
				model: "kimi-k3",
				vals: [0, 100],
				tip: "file arms 0/40 (11/128 consultations, none decisive) · hinted: 10/10, path guesses fell to zero, input cost down 28%",
			},
			{
				model: "gemini-3.5-flash",
				vals: [0, 90],
				tip: "file arms 0/40 (7/128 consultations) · hinted: 9/10, consultation 19/32",
			},
			{
				model: "sonnet-4.5",
				vals: [0, 80],
				tip: "file arms 0/40 (1/128 consultations; 100+ path guesses per arm) · hinted: 8/10",
			},
			{
				model: "gpt-oss-120b",
				vals: [0, 0],
				tip: "protocol collapse: skipped submit_answer in 144/192 cells; its numbers measure compliance, not discovery",
			},
			{
				model: "haiku-4.5",
				vals: [0, 100],
				tip: "registered backfill: file arms 0/40 (0/128 consultations, the frontier pattern) · hinted: 10/10, guesses 95 to 16, input cost down 12%",
			},
		];
		const CFILES = "#8b93a3",
			CHINT = "#199e70";
		byId("legend-2").innerHTML =
			'<span class="key"><span class="chip" style="background:' +
			CFILES +
			'"></span>best of the four file-bearing arms (sitemap, curated, giant, hierarchical llms.txt)</span>' +
			'<span class="key"><span class="chip" style="background:' +
			CHINT +
			'"></span>hinted arm: same site, one sentence in the fetch tool description</span>' +
			legendNote(
				"orphan-task success (percent of 10 tasks whose facts live on pages linked from nowhere) · file arms shown as their best single arm, which was 0/10 for every model",
			);
		const W = 880,
			BAR = 14,
			GAP = 4,
			GH = 2 * BAR + GAP,
			GPAD = 18,
			T = 8,
			B = 42,
			L = 150,
			R = 70;
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
				marks += `<rect x="${L}" y="${y}" width="${w}" height="${BAR}" fill="${ai === 0 ? CFILES : CHINT}" rx="3"/>`;
				marks += `<text fill="#c3c9d4" font-size="11" x="${L + w + 8}" y="${y + BAR - 3}">${v}%</text>`;
			});
			hits += `<rect x="${L}" y="${top}" width="${iw}" height="${GH}" fill="transparent" data-tip="${esc(row.model + "\n" + row.tip)}"/>`;
		});
		const el = byId("fig-orphans");
		el.innerHTML =
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart per model: orphan-page success is zero percent in every file-bearing arm for all five models, and rises to one hundred percent on opus and kimi, ninety on gemini, and eighty on sonnet when one sentence in the fetch tool description mentions machine-readable indexes; gpt-oss stays at zero due to protocol collapse.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the mechanism study's verdict in one frame: on a site where discovery files are the only path to the answers, the files alone move nothing at any tier because nothing reads them; the identical site plus one sentence of agent-side affordance solves the class outright",
			);
		el.querySelectorAll("[data-tip]").forEach((n) => {
			n.addEventListener("mousemove", (e) => showTip(e, n.dataset.tip));
			n.addEventListener("mouseleave", hideTip);
		});
		table(
			"tbl-orphans",
			[
				"cell",
				"gemini-3.5-flash",
				"sonnet-4.5",
				"opus-4.8",
				"kimi-k3",
				"gpt-oss-120b",
				"haiku-4.5",
			],
			[
				[
					"orphans, best file-bearing arm",
					"0/10",
					"0/10",
					"0/10",
					"0/10",
					"0/10",
					"0/10",
				],
				[
					"orphans, hinted arm",
					"9/10",
					"8/10",
					"10/10",
					"10/10",
					"0/10",
					"10/10",
				],
				[
					"unprompted discovery consultation (of 128)",
					"7",
					"1",
					"0",
					"11",
					"0",
					"0",
				],
				["hinted-arm consultation (of 32)", "19", "17", "15", "20", "9", "13"],
				["path-guess 404s, baseline arm", "104", "114", "12", "63", "7", "95"],
				["path-guess 404s, hinted arm", "15", "13", "7", "0", "21", "16"],
				[
					"orphans declared not-on-site (non-hinted, of 50)",
					"50",
					"48",
					"50",
					"50",
					"2 (48 no-submit)",
					"49",
				],
				[
					"linked-class correctness (deep + shallow, baseline)",
					"13/14",
					"13/14",
					"13/14",
					"13/14",
					"7/14",
					"14/14",
				],
				["no-submit cells (of 192)", "0", "3", "0", "0", "144", "0"],
				[
					"model spend",
					"$3.77",
					"$30.83",
					"$20.79",
					"$19.66",
					"$0.27",
					"$9.69",
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
