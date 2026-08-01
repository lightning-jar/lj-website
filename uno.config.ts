import extractorSvelte from "@unocss/extractor-svelte";
import presetWind4 from "@unocss/preset-wind4";
import {
	defineConfig,
	presetIcons,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	content: {
		pipeline: {
			// the chart builders emit utility classes in generated markup
			include: [
				/\.(svelte|md|json|html)($|\?)/,
				/barkup-bench\/bench-charts\.js$/,
				/aeo-bench\/aeo-charts\.js$/,
			],
		},
		filesystem: ["./src/app.html"],
	},
	extractors: [extractorSvelte()],
	preflights: [
		// svelte announcer bug fix
		// https://github.com/sveltejs/kit/issues/11993
		{
			layer: "components",
			getCSS: () =>
				"#svelte-announcer { position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px }",
		},
		{
			// Metric-matched local fallbacks for the two web fonts, so text
			// laid out before the webfont arrives occupies the same space and
			// the swap causes no layout shift (CLS). Overrides computed from
			// @capsizecss/metrics against Arial (fontaine formulas).
			layer: "preflights",
			getCSS: () =>
				`@font-face {
        font-family: "Atkinson Hyperlegible Fallback";
        src: local("Arial");
        size-adjust: 99.37%;
        ascent-override: 95.6%;
        descent-override: 29.18%;
        line-gap-override: 0%;
      }
      @font-face {
        font-family: "Bungee Shade Fallback";
        src: local("Arial");
        size-adjust: 161.06%;
        ascent-override: 63.33%;
        descent-override: 18.63%;
        line-gap-override: 0%;
      }`,
		},
		{
			layer: "preflights",
			getCSS: () =>
				`@keyframes rumble {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-2px) rotate(-0.75deg); }
        20% { transform: translateX(2px) rotate(1deg); }
        30% { transform: translateX(-1px) rotate(-0.5deg); }
        40% { transform: translateX(1px) rotate(0.5deg); }
        50% { transform: translateX(-2px) rotate(0deg); }
        60% { transform: translateX(2px) rotate(0.75deg); }
        70% { transform: translateX(-3px) rotate(-0.5deg); }
        80% { transform: translateX(3px) rotate(0.75deg); }
        90% { transform: translateX(-2px) rotate(-0.5deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
     html { --accent: #ebf92f}
     body.lightning {
        animation-name: rumble;
        animation-duration: 0.3s;
        animation-delay: 0.1s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: 10;
     }`,
		},
	],
	presets: [
		presetWind4({ preflights: { reset: true } }),
		presetIcons({
			warn: true,
		}),
		presetWebFonts({
			provider: "bunny",
			fonts: {
				display: "Bungee Shade",
				sans: {
					name: "Atkinson Hyperlegible",
					weights: ["400", "700"],
				},
			},
		}),
	],
	theme: {
		// full stacks with the metric-matched fallbacks (declared in the
		// preflight above) slotted right after each webfont; `font` is the
		// wind4 theme key (fontFamily is ignored by presetWind4)
		font: {
			display: '"Bungee Shade", "Bungee Shade Fallback", cursive',
			sans: '"Atkinson Hyperlegible", "Atkinson Hyperlegible Fallback", ui-sans-serif, system-ui, sans-serif',
		},
		colors: {
			accent: "var(--accent)",
			oxfordBlue: "hsl(217, 48%, 15%)",
			oxford: "hsl(217, 48%, 15%)",
			oxfordLight: "#21355B",
			oxfordDark: "hsla(217, 48%, 12%, 1.0)",
			oxfordBlueLight: "#21355B",
			darkCornflowerBlue: "hsl(217, 45%, 30%)",
			cornflower: "hsl(217, 45%, 30%)",
			cornflowerDark: "hsl(217, 45%, 30%)",
			middleBlue: "hsl(188, 55%, 64%)",
			androidGreen: "hsla(71, 82%, 43%, 1.0)",
			yellowGreen: "hsl(71, 69%, 70%)",
			titaniumYellow: "hsl(58, 100%, 47%)",
			maximumYellow: "#ebf92f",
			culturedGray: "hsl(220, 20%, 97%)",
			cultured: "hsl(220, 20%, 97%)",
			offWhite: "hsl(240, 33%, 99%)",
			xanthous: "#f7b32b",
		},
	},
	rules: [
		// content-visibility: skip rendering + layout for off-screen items.
		// `content-auto` defaults to a 400px intrinsic-size placeholder;
		// `content-auto-<n>` overrides it (e.g. content-auto-480 → 480px).
		// The `auto` keyword remembers each element's real size once rendered,
		// so the fallback only applies to items that have never been on screen.
		[
			/^content-auto(?:-(\d+))?$/,
			([, px]: string[]) => ({
				"content-visibility": "auto",
				"contain-intrinsic-size": `auto ${px ?? 400}px`,
			}),
		],
	],
	safelist: [
		"contents",
		"bg-oxford",
		"filter-invert",
		"flex",
		"flex-col",
		"font-serif",
		"text-neutral-100",
		"max-w-screen",
		"overflow-x-hidden",
		"overflow-y-scroll",
		"relative",
		"grid",
		"grid-cols-1",
		"grid-rows-[auto_1fr_auto]",
		"min-h-screen",
		"w-full",
	],
	shortcuts: [
		// A legend row: color chip + series code + description (generated
		// markup on the research pages). The series code child gets its
		// weight here so the generated markup stays bare.
		[
			"key",
			"flex gap-2 flex-wrap items-start opacity-95 [&>.code]:font-600 [&>.note-label]:font-600",
		],
		// The color swatch inside a legend row; background color arrives
		// inline per series. mt aligns it with the first text line.
		["chip", "inline-block w-2.5 h-2.5 rounded-sm shrink-0 mt-[0.28em]"],
		// Caption typography only — font-sans resets the chart container's
		// font-mono; spacing/width within a chart ride on the `chart`
		// shortcut's child rules.
		["chart-caption", "font-sans text-0.95em leading-snug"],
		// The legend box rendered above a chart.
		[
			"chart-legend",
			"grid grid-cols-1 gap-2 leading-snug rounded-sm bg-white/5 px-4 pt-1 pb-5 mt-3 text-0.85em [&>.legend-title]:(font-600 mt-2)",
		],
		// The scrollable container each generated chart SVG sits in; svg
		// sizing lives here as child rules so the generated markup carries
		// no width/style attributes (min-width preserves horizontal scroll
		// on narrow screens; block kills the inline-svg baseline gap).
		[
			"chart",
			"overflow-x-auto font-mono tabular-nums mt-5 mb-5 bg-white/5 rounded-sm px-4 pt-2 pb-5 [&>svg]:(block w-full h-auto min-w-[640px]) [&_.chart-caption]:(mt-2 max-w-[56rem]) [&_td.heat]:(border-2 border-oxford px-3.5 py-2 text-right) [&_td.heat:first-child]:(text-left font-sans)",
		],
		[
			"chat-response",
			`
			grid
			grid-cols-1
			gap-2
			underline-offset-4
			w-full
			[&_strong]:font-600
			[&_em]:italic
			[&_code]-font-mono
			[&_code]-bg-slate-200/10
			[&_code]-rounded
			[&_code]-px-1
			[&_code]-py-0.5
			[&_ul]-list-disc
			[&_ul]-pl-5
			[&_ul]-grid
			[&_ul]-gap-1
			[&_ol]-list-decimal
			[&_ol]-pl-5
			[&_ol]-grid
			[&_ol]-gap-1
			[&_a]-underline
			[&_a]-decoration-current/40
			hover-[&_a]-decoration-current
			`,
		],
		// The clickable summary of a collapsed data-table <details> on the
		// dashboard — its own identity (was borrowing chart-caption), with
		// its interaction affordances built in.
		[
			"table-summary",
			"font-sans text-0.95em leading-snug cursor-pointer select-none opacity-90 hover:opacity-100",
		],
		// The container each generated data table mounts into — symmetric
		// with `chart`: chrome on the container, table styles via child
		// rules on the bare generated <table>. Any non-visible overflow is
		// what lets the corner rounding clip a border-collapse table; it
		// also scrolls wide tables instead of breaking the page.
		[
			"data-table",
			"overflow-x-auto mt-2.5 rounded-sm bg-white/5 [&>table]:(w-full border-collapse tabular-nums text-14px) [&_th]:(border border-white/14 px-2.5 py-1 font-400 text-blue-200 text-right leading-snug) [&_thead]:bg-black/10 [&_th:first-child]:text-left [&_td]:(border border-white/14 px-2.5 py-1 text-right) [&_td:first-child]:text-left",
		],
		// Tick/axis labels inside the generated SVG charts (CSS font-size
		// on svg <text> overrides the presentational attribute it replaced).
		["chart-tick", "opacity-95 fill-current"],
		[
			"max-w-article",
			"max-w-none sm:max-w-[34rem] md:max-w-[36rem] lg:max-w-[38rem] xl:max-w-[40rem] 2xl:max-w-[45rem]",
		],
		[
			"main-y-padding",
			"pt-10 pb-14 lg:(pt-12 pb-16) xl:(pt-14 pb-20) 2xl:(pt-16 pb-22)",
		],
		[
			"body-1",
			`font-sans
			leading-[1.5]
			mb-6
			opacity-95
			pl-0
			text-18px
			text-yellow-50
			lg-text-17px`,
		],
		[
			"button",
			`
      flex
      max-w-fit
      gap-2
      px-3
      py-2
      rounded
      border
      border-current
      opacity-90
      text-[0.9em]
      hover:text-accent
      hover:opacity-100`,
		],
		["button-accent", "button text-accent hover:text-oxford hover:bg-accent"],
		// Compact button (e.g. package links in sidebars). Self-contained
		// rather than composing `button` so no same-specificity padding
		// conflicts arise.
		[
			"button-small",
			`inline-flex
			max-w-fit
			justify-center
			items-center
			gap-2
			border
			border-current
			leading-none
			opacity-90
			text-0.85em
			px-3
			py-1
			rounded-sm
			hover-text-accent
			hover-opacity-100`,
		],
		[
			"button-xsmall",
			`inline-flex
			max-w-fit
			justify-center
			items-center
			gap-2
			border
			border-current
			leading-none
			opacity-90
			text-0.80em
			px-2
			py-1
			rounded-sm
			hover-text-accent
			hover-opacity-100`,
		],

		["page-x-padding", "px-4 sm:px-6 md:px-7 lg:px-8 xl:px-16 2xl:px-24"],
		[
			// The semantic heading scale (replaced the retired "display" shortcut).
			"heading-1",
			`
			font-sans
			font-700
			leading-tight
			mb-3
			text-32px
			text-balance
			text-maximumYellow
			text-pretty
			uppercase
			sm-font-display
			sm-font-700
			sm-leading-snug
			sm-text-34px
			lg-text-40px
			xl-text-44px
			`,
		],
		[
			"heading-2",
			`font-700
			font-sans
			text-20px
			text-maximumYellow
			sm-font-serif
			lg-text-24px`,
		],
		[
			"heading-3",
			`font-700
			font-sans
			leading-snug
			text-18px
			text-maximumYellow
			sm-font-serif
			lg-text-18px`,
		],
		[
			"body-article",
			`
			[&_h2]:(font-700 text-1.05em mt-5)
			[&_h3]:(font-600 mt-4)
		  [&_p]:mb-3
			[&_ul]:(mb-4 list-disc decoration-white list-outside ml-3)

			[&_li]:(mb-3 mt-2 leading-tight)
			[&_strong]:font-600
		`,
		],
		[
			"blog-article",
			`
			[&_h2]:(font-700 font-serif text-maximumYellow text-1.133em mt-8 mb-2 opacity-98 text-pretty text-balance)
			[&_h2:first-child]:mt-0
			[&_h3]:(font-500 mt-5 text-maximumYellow/95 text-1.05em)
			[&_h4]:(font-400 mt-3 text-blue-200)
		  [&_p]:(mb-3 mt-1 opacity-90)
			[&_ul]:(mb-4 mt-2 list-disc decoration-white list-outside ml-3)
			[&_ol]:(mb-4 list-decimal decoration-white list-outside ml-4)
			[&_li]:(mb-2 mt-2 leading-tight opacity-90)
			[&_p_a,_&_li_a]:(underline underline-offset-2)
			[&_a:hover]:text-maximumYellow
			[&_strong]:(font-700)
			[&_img]:(w-full h-auto max-w-full my-4)
			[&_img+p]:(text-13px opacity-70 mt-2 mb-6 leading-snug)
			[&_table:not(.data-table_table)]:(hidden md:block w-full border-collapse text-15px text-left relative border border-slate-100/40 rounded pb-0 overflow-hidden my-4)
			[&_table:not(.data-table_table)_thead]:(flex items-center justify-between text-slate-100)
			[&_table:not(.data-table_table)_thead_tr]:(w-full grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_150px),_1fr))])
			[&_table:not(.data-table_table)_thead_tr_th]:(block bg-blue/40 leading-tight font-700 px-3 py-2 truncate w-full border-b border-slate-100/40)
			[&_table:not(.data-table_table)_thead_tr_th:not(:last-child)]:(border-r)
			[&_table:not(.data-table_table)_tbody]:(grid grid-cols-1)
			[&_table:not(.data-table_table)_tbody_tr]:(w-full grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_150px),_1fr))])
			[&_table:not(.data-table_table)_tbody_tr:has(em)]:(bg-blue/10)
			[&_table:not(.data-table_table)_tbody_tr:has(strong_em)]:(bg-blue/40)
			[&_table:not(.data-table_table)_tbody_tr:has(em_strong)]:(bg-blue/40)
			[&_table:not(.data-table_table)_tbody_tr_td]:(flex bg-blue/0 leading-tight px-3 py-2 w-full border-b border-slate-100/40 opacity-90 text-15px)
			[&_table:not(.data-table_table)_tbody_tr:last-child_td]:(border-b-none pb-3)
			[&_table:not(.data-table_table)_tbody_tr_td:not(:last-child)]:(border-r)
			[&_pre]:(bg-black/40 px-4 pt-4 pb-5 rounded my-4 overflow-x-auto)
			[&_pre_code]:(font-mono text-13px leading-relaxed text-slate-100/90)
			[&_:not(pre)>code]:(font-mono text-0.9em bg-black/30 rounded px-1 py-0.5)
			`,
		],
		[
			"article-columns",
			`gap-8
			grid
			grid-cols-1
			place-content-start
			md:grid-cols-[minmax(36ch,_640px)_minmax(30ch,_420px)]
			`,
		],
		[
			"tile-meta",
			`font-sans
			font-400
			uppercase
			text-15px
			text-maximumYellow
			lg-text-14px
			`,
		],
		[
			"tile-text",
			`font-sans
			font-400
			leading-snug
			opacity-90
			text-17px
			lg-text-16px
			`,
		],
		[
			"view-all-link",
			`font-sans
			font-400
			flex
			items-center
			gap-1
			opacity-90
			text-maximumYellow
			underline-offset-4
			text-17px
			hover-underline
			hover-opacity-100
			[&_span]:i-ph-arrow-right-bold
			[&_span]:flex
			lg-text-16px

			`,
		],
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
