<script lang="ts">
	// components
	import PictureStack from "$atoms/PictureStack.svelte";
	import IconArrowRight from "$atoms/IconArrowRight.svelte";
	import ShapeTriangle from "$atoms/ShapeTriangle.svelte";

	// props
	export let category = "test category";
	export let color = "#EAF81D";
	// export let customer = "";
	export let imageAlt = "";
	export let imageSlug = "";
	export let logoAlt = "";
	export let logoSlug = "";
	export let text = "";
	export let tags: string[] = [];
	export let url = "";

	// variables
	const image = {
		alt: imageAlt,
		classes: "opacity-full",
		draggable: "false",
		height: "648",
		fallback: `${imageSlug}.png`,
		folder: "images",
		loading: "lazy",
		width: "810",
		slugCommon: imageSlug,
		style: null,
	};
	const logo = {
		alt: logoAlt,
		classes: "!w-auto !h-full",
		draggable: "false",
		height: "32",
		fallback: `${logoSlug}.png`,
		folder: "images",
		loading: "lazy",
		width: "178",
		slugCommon: logoSlug,
		style: null,
	};
</script>

<template lang="pug">
	.font-sans.uppercase.tracking-widest.px-16.leading-normal.mb-4.text-center(
		class="text-white/60 text-[.825rem] h-[1rem] sm:hidden"
	) {  @html category  }
	//-.font-sans.font-xl.tracking-widest.px-16.leading-normal.mb-16.text-center(class="text-white/90 h-[1rem] ") {@html customer}

	a.w-full.text-oxfordBlue.block.outline-white.outline.outline-0(
		class="rounded-t-lg overflow-hidden transition-opacity ",
		data-customerTile,
		href!="{ url }"
	)
		//- logo
		.flex.justify-center.w-full
			.h-auto.border-y-0.border-white.py-4.border-opacity-60(class="w-72 sm:hidden")
				PictureStack(
					classes!="{ logo.classes }",
					alt!="{ logo.alt }",
					breakpoints!="{ logo.breakpoints }",
					fallback!="{ logo.fallback }",
					folder!="{ logo.folder }",
					height!="{ logo.height }",
					loading!="{ logo.loading }",
					slugCommon!="{ logo.slugCommon }",
					style!="{ logo.style }",
					width!="{ logo.width }"
				)

		//- tile header
		.relative.overflow-hidden.mb-6.rounded-lg(class="bg-white/0")
			PictureStack(
				classes!="{ image.classes }",
				alt!="{ image.alt }",
				breakpoints!="{ image.breakpoints }",
				fallback!="{ image.fallback }",
				folder!="{ image.folder }",
				height!="{ image.height }",
				loading!="{ image.loading }",
				slugCommon!="{ image.slugCommon }",
				style!="{ image.style }",
				width!="{ image.width }"
			)

		//- logo position two
		.hidden.justify-center.w-full.bottom-0.z-10.mb-4(class="sm:flex bg-oxford/20")
			div(class="w-3/4")
				PictureStack(
					classes!="{ logo.classes }",
					alt!="{ logo.alt }",
					breakpoints!="{ logo.breakpoints }",
					fallback!="{ logo.fallback }",
					folder!="{ logo.folder }",
					height!="{ logo.height }",
					loading!="{ logo.loading }",
					slugCommon!="{ logo.slugCommon }",
					style!="{ logo.style }",
					width!="{ logo.width }"
				)

		//- tile body
		.px-0.pb-8.relative(class="")
			//-.flex.items-center.justify-center.mb-4.w-full
				.h-auto(class="w-72").border-y-0.border-white.py-4.border-opacity-60
					PictureStack(
						classes!="{ logo.classes }",
						alt!="{ logo.alt }",
						breakpoints!="{ logo.breakpoints }",
						fallback!="{ logo.fallback }",
						folder!="{ logo.folder }",
						height!="{ logo.height }",
						loading!="{ logo.loading }",
						width!="{ logo.width }",
						slugCommon!="{ logo.slugCommon }",
						style!="{ logo.style }",
					)


			div
				p.prose-md.mb-2.line-clamp-6(
					class="text-cultured/90 font-light md:text-oxford text-center sm:hidden"
				)
					| { text }
				.flex.justify-center.flex-wrap
					+each('tags as tag')
						span.text-maximumYellow.text-sm.inline-block.mr-2.opacity-80.transition-opacity(
							class="hover:opacity-100",
							style!="{ 'color:' + color }"
						) { "#" + tag }
</template>
