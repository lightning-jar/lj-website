import extractorSvelte from "@unocss/extractor-svelte";
import presetWind4 from "@unocss/preset-wind4";
import {
	defineConfig,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	content: {
		pipeline: {
			include: [/\.(svelte|md|json|html)($|\?)/],
		},
		filesystem: ["./src/app.html"],
	},
	extractors: [extractorSvelte()],
	layers: {
		reset: 1,
		preflights: 2,
		variables: 3,
		components: 4,
		base: 5,
		default: 7,
		utilities: 8,
		shortcuts: 9,
	},
	outputToCssLayers: {
		cssLayerName: (layer) => {
			// The default layer will be output to the "utilities" CSS layer.
			if (layer === "default") return "utilities";
		},
	},
	preflights: [
		// svelte announcer bug fix
		// https://github.com/sveltejs/kit/issues/11993
		{
			layer: "components",
			getCSS: () =>
				"#svelte-announcer { position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px }",
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
		presetWebFonts({
			provider: "bunny",
			fonts: {
				display: "Bungee Shade",
				sans: "Atkinson Hyperlegible",
			},
		}),
	],
	theme: {
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
		[
			"max-w-article",
			"max-w-none sm:max-w-[34rem] md:max-w-[36rem] lg:max-w-[38rem] xl:max-w-[40rem] 2xl:max-w-[45rem]",
		],
		[
			"main-y-padding",
			"pt-10 pb-14 lg:(pt-12 pb-16) xl:(pt-14 pb-20) 2xl:(pt-16 pb-22)",
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
      hover:opacity-100
      hover:shadow
      hover:shadow-current`,
		],
		["button-accent", "button text-accent hover:text-oxford hover:bg-accent"],

		["page-x-padding", "px-4 sm:px-6 md:px-7 lg:px-8 xl:px-16 2xl:px-24"],
		[
			"display",
			"text-balance font-700 font-display text-maximumYellow mb-3 text-32px lg:text-42px leading-snug",
		],
		[
			"heading-2",
			"font-700 text-maximumYellow mb-3 text-20px lg:text-24px font-serif",
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
			[&_img]:(w-full h-auto aspect-video overflow-hidden rounded flex object-cover mb-5)
			[&_table]:(hidden md:block w-full border-collapse text-15px text-left relative border border-slate-100/40 rounded pb-0 overflow-hidden my-4)
			[&_table_thead]:(flex items-center justify-between text-slate-100)
			[&_table_thead_tr]:(w-full grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_150px),_1fr))])
			[&_table_thead_tr_th]:(block bg-blue/40 leading-tight font-700 px-3 py-2 truncate w-full border-b border-slate-100/40)
			[&_table_thead_tr_th:not(:last-child)]:(border-r)
			[&_table_tbody]:(grid grid-cols-1)
			[&_table_tbody_tr]:(w-full grid grid-cols-[repeat(auto-fit,_minmax(min(100%,_150px),_1fr))])
			[&_table_tbody_tr:has(em)]:(bg-blue/10)
			[&_table_tbody_tr:has(strong_em)]:(bg-blue/40)
			[&_table_tbody_tr_td]:(flex bg-blue/0 leading-tight px-3 py-2 w-full border-b border-slate-100/40 opacity-90 text-15px)
			[&_table_tbody_tr:last-child_td]:(border-b-none pb-3)
			[&_table_tbody_tr_td:not(:last-child)]:(border-r)
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
			lg:grid-cols-[minmax(58ch,_640px)_minmax(30ch,_1fr)]
			`,
		],
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
