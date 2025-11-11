import extractorSvelte from "@unocss/extractor-svelte";
import presetWind4 from "@unocss/preset-wind4";
import { defineConfig, transformerDirectives, transformerVariantGroup } from "unocss";

// just a little hack for disappearing comments
const disappearingComment = (_str: string) => "";

// settings
const _sansStack = `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
			"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
			"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
			"Noto Color Emoji"`;

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
	],
	presets: [presetWind4({preflights: {reset: true}})],
	theme: {
		colors: {
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
			maximumYellow: "hsl(64, 94%, 58%)",
			culturedGray: "hsl(220, 20%, 97%)",
			cultured: "hsl(220, 20%, 97%)",
			offWhite: "hsl(240, 33%, 99%)",
			xanthous: "#f7b32b",
		},
		//text: {
		//	font: {}
		//}
	},
	rules: [],
	safelist: ["grid-rows-[auto_1fr_auto]", "flex-col", "min-h-screen"],
	shortcuts: [
		[
			"article-body",
			`
			${disappearingComment("_hr")}
			[&>hr]:(my-8)

			${disappearingComment("_font_sizes")}
			text-[1.25rem] sm:text-[1.1875rem] md:text-[1.125rem] lg:text-[1.0625rem] 2xl:text-[1.1875rem]

			${disappearingComment("_anchor_tag")}
			[&>a]:(block decoration-current mb-3 underline underline-offset-4 opacity-90)
			[&>a:hover]:(text-accent opacity-100)
			[&>p_+a,&>a_+a,&>ul_+a,&>h2_+a,&>h3_+a]:(mt-4)
			[&>ul_>li_a]:(underline underline-offset-4 opacity-90)
			[&>ul_>li_a:hover]:(text-accent opacity-100)
			[&>ol_>li_a]:(underline underline-offset-4 opacity-90)
			[&>ol_>li_a:hover]:(text-accent opacity-100)

			${disappearingComment("_inline_anchor_tag")}
			[&>p_>a]:(inline underline underline-offset-4 opacity-90 decoration-current)
			[&>p_>a:hover]:(text-accent opacity-100)

			${disappearingComment("_h2")}
			[&>h2]:(font-800 text-[1.25em] capitalize)
			[&>p_+h2,&>a_+h2,&>ul_+h2,&>ol_+h2]:(mt-6)

			${disappearingComment("_h3")}
			[&>h3]:(text-[1.125em] font-700 capitalize)
			[&>p_+h3,&>a_+h3,&>ul_+h3,&>ol_+h3,&>h2_+h3,&>h3_+h3,&>h4_+h3]:(mt-8)

			${disappearingComment("_h4")}
			[&>h4]:(block font-600 italic)
			[&>p+h4,&>a+h4,&>ul+h4]:(font-600 mt-5)
			[&>h4+a]:(font-600)

			${disappearingComment("_p")}
			[&>p]:(leading-[1.65] opacity-90 md:max-w-[36rem] lg:max-w-[38rem] xl:max-w-[40rem] 2xl:max-w-[45rem])
			[&>h2_+p]:(mt-4)
			[&>h3_+p,&>p_+p,&>a_+p,&>ul_+p,&>ol_+p]:(mt-3)
			[&>ul_li_p,&>ol_li_p]:(block mb-3)

			${disappearingComment("_strong")}
			[&>strong]:(block font-600)
			[&>p_+strong,&>a_+strong,&>ul_+strong,&>ol_+strong,&>p_strong]:(block mb-2 mt-3)

			${disappearingComment("_in_list_strong")}
			[&>ol_>li_strong,&>ul_>li_strong]:(block mb-2 font-700)

			${disappearingComment("_in_line_em")}
			[&>p_>em,&>ul_>li_>em,&>a_>em]:(inline-block text-accent font-800)

			${disappearingComment("_ul_&&_ol")}
			[&>ul]:(list-disc pl-4)
			[&>ol]:(list-decimal pl-4)
			[&>h2_+ul,&>h3_+ul,&>h4_+ul,&>p_+ul]:(mt-4)
			[&>h2_+ol,&>h3_+ol,&>h4_+ol,&>p_+ol]:(mt-4)
			[&>ul,&>ol]:(grid grid-cols-1 gap-3)
			[&>ul_li,&>ol_li]:opacity-90
			[&>div>p+ul]:(mt-4)`,
		],
		[
			"max-w-article",
			"max-w-none sm:max-w-[34rem] md:max-w-[36rem] lg:max-w-[38rem] xl:max-w-[40rem] 2xl:max-w-[45rem]",
		],
		[
			"main-y-padding",
			"pt-10 pb-14 lg:(pt-12 pb-16) xl:(pt-14 pb-20) 2xl:(pt-16 pb-22)",
		],
		["page-x-padding", "px-4 sm:px-6 md:px-7 lg:px-8 xl:px-16 2xl:px-24"],




	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
