<script lang="ts">
	// components
	import TextHeading from "$atoms/TextHeading.svelte";
	import PictureStack from "$atoms/PictureStack.svelte";

	// global functions
	import { deslugify } from "$functions/helperFunctions";

	// props
	export let category = "";
	export let quote = "";
	export let imageSlug = "";
	export let name = "";
	export let title = "";
	export let companyName = "";
	export let companyUrl = "";

	// variables
	const quoteAttributes = {
		tag: "q",
		classes: "block !leading-normal !text-3xl md:!leading-tight",
	};

	const image = {
		alt: deslugify(imageSlug).replace("testimonial", "").trim(),
		breakpoints: [[""]],
		classes: "block rounded-full",
		folder: "images",
		height: "64",
		width: "64",
		fallback: `${imageSlug}.jpg`,
		slugCommon: imageSlug,
	};
</script>

<template lang="pug">
	.text-center(class="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl")
		//- Categories
		.font-sans.uppercase.mb-6.text-maximumYellow.tracking-widest.px-16.leading-normal(
			class="text-[.825rem] h-[2.5rem] "
		) {  @html category  }

		//- Quote
		.mb-8
			q.block.font-serif.font-semibold(
				class="text-[2rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.5rem leading-[1.33] h-[12rem] sm:h-[13rem] md:h-[20rem] lg:h-[23rem] xl:h-[25rem] overflow-hidden"
			) {  @html quote  }

		//- Footer
		.flex.justify-center(class="h-[12rem]")
			div(class="max-w-[65%] font-serif")
				// Avatar
				.flex.w-100.justify-center
					.mb-4.w-16
						PictureStack(
							classes!="{ image.classes }",
							alt!="{ image.alt }",
							breakpoints!="{ image.breakpoints }",
							fallback!="{ image.fallback }",
							folder!="{ image.folder }",
							height!="{ image.height }",
							slugCommon!="{ image.slugCommon }",
							width!="{ image.width }"
						)
				// Name
				h4.mb-1.font-sans.text-md.opacity-90.font-semibold { name }
				// Position
				p.text-md.opacity-90.font-sans
					| { title },&nbsp;
					a.text-body-light(href!="{ companyUrl }") {  @html companyName  }
</template>
