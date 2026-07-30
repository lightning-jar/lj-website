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
				tip: "adoption 45/72 markdown-arm cells (mostly Accept negotiation) · but savings only ~18% — opus was already frugal (2.7 fetches, 6.9k tokens per task)",
			},
			{
				model: "gemini-3.5-flash",
				vals: [40, 27],
				tip: "adoption 29/72 via the hidden directive · input cost fell to 26–27% of baseline — a 73–74% saving, inside Cloudflare's claim",
			},
			{
				model: "kimi-k3",
				vals: [3, 49],
				tip: "2/72 cells · too few adopters for a stable ratio (49% on n=2)",
			},
			{
				model: "sonnet-4.5",
				vals: [0, null],
				tip: "0/72 — never discovered the pathway; no ratio exists",
			},
			{
				model: "gpt-oss-120b",
				vals: [1, null],
				tip: "1/72 — effectively never; no stable ratio",
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
				"the fetch tool never mentioned markdown — adoption means the model found the hidden directive and acted on it · ratio bars absent where a model produced too few adopter cells to measure",
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
			`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart per model: unprompted markdown adoption is sixty-four percent for opus, forty percent for gemini, and near zero for sonnet, kimi, and gpt-oss; among adopters the input-cost ratio versus baseline is eighty-two percent for opus and twenty-seven percent for gemini — the savings are largest for the least frugal agent.">` +
			g +
			marks +
			hits +
			"</svg>" +
			figCap(
				"the two markdown findings in one frame: adoption is a model disposition (some models read the hidden directive and act, some never do), and the cost saving among adopters is proportional to how wasteful the agent's baseline was — the frugal frontier model saves least",
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
			],
			[
				[
					"present-class correct, all arms (v1 → 1′ grader)",
					"140/140",
					"140/140",
					"140/140",
					"140/140",
					"118 → 122/140",
				],
				[
					"absent-class correct, all arms (v1 → 1′ grader)",
					"40/40",
					"35/40",
					"31 → 39/40",
					"40/40",
					"6/40 (52 empty-text cells)",
				],
				["llms.txt fetches (of 180 cells)", "0", "0", "0", "0", "0"],
				["sitemap.xml fetches (of 180 cells)", "0", "0", "0", "0", "0"],
				["unprompted markdown adoption (of 72)", "29", "0", "45", "2", "1"],
				[
					"input-cost ratio among adopters",
					"26–27%",
					"n/a",
					"80–83%",
					"49% (n=2)",
					"n/a",
				],
				[
					"mean fetches / baseline input tokens",
					"4.9 / 18.1k",
					"3.5 / 9.5k",
					"2.7 / 6.9k",
					"4.4 / 9.3k",
					"2.2 / 3.8k",
				],
				["invented facts (of 180 cells)", "0", "0", "0", "0", "0"],
				[
					"model spend across the study",
					"$1.14",
					"$6.05",
					"$6.90",
					"$6.06",
					"$0.10",
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
