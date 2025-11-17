import extractorSvelte from "@unocss/extractor-svelte";
import presetWind4 from "@unocss/preset-wind4";
import {
	defineConfig,
	presetWebFonts,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

// just a little hack for disappearing comments
const disappearingComment = (_str: string) => "";

export default defineConfig({
	content: {
		pipeline: {
			include: [/\.(svelte|md|json|html|md)($|\?)/],
		},
		filesystem: ["./app.html"],
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
				`@keyframes shake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        10% { transform: translateX(-2px) rotate(-1deg); }
        20% { transform: translateX(2px) rotate(1deg); }
        30% { transform: translateX(-3px) rotate(-0.5deg); }
        40% { transform: translateX(3px) rotate(0.5deg); }
        50% { transform: translateX(-2px) rotate(0deg); }
        60% { transform: translateX(2px) rotate(1deg); }
        70% { transform: translateX(-3px) rotate(-1deg); }
        80% { transform: translateX(3px) rotate(0.5deg); }
        90% { transform: translateX(-2px) rotate(-0.5deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
      @keyframes bolt {
          0%, 100% { scale:1; }
          50% { scale:1.2; }
      }
     html { --accent: #ebf92f}`,
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
	rules: [],
	safelist: [
		"contents",
		"bg-oxford",
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
			"flex max-w-fit gap-2 px-3 py-2 rounded border border-current opacity-90 text-[0.9em] hover:text-accent hover:opacity-100",
		],
		["button-accent", "button text-accent hover:text-oxford hover:bg-accent"],

		["page-x-padding", "px-4 sm:px-6 md:px-7 lg:px-8 xl:px-16 2xl:px-24"],
		[
			"display",
			"font-700 font-display text-maximumYellow mb-3 text-32px lg:text-42px",
		],
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
