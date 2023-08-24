<script lang="ts">
	// components
	//import TextHeading from "$atoms/TextHeading.svelte";
	import PictureStack from "$atoms/PictureStack.svelte";

	// global functions
	import { deslugify } from "$functions/helperFunctions";

	interface Panel {
		category: string;
		quote: string;
		imageSlug: string;
		name: string;
		title: string;
		companyName: string;
		companyUrl: string;
	}

	// props
	export let panel: Panel;

	// variables
	const alt = deslugify(panel.imageSlug).replace("testimonial", "").trim();
	const quoteAttributes = {
		tag: "q",
		classes: "block !leading-normal !text-3xl md:!leading-tight",
	};
</script>

<template lang="pug">
	.text-center(class=`
			sm:max-w-sm
			md:max-w-md
			lg:max-w-lg
			xl:max-w-xl`)
		//- category
		h3(
			class=`
				font-sans
				leading-normal
				mb-8
				text-[.85em]
				text-maximumYellow
				tracking-widest
				uppercase
				sm:mb-20
				sm:text-[1em]`
		)
			.block.text-neutral-100.opacity-60.mb-2(
				class="text-[.9em] lg:inline-block lg:text-[1em] lg:mb-0"
			) Testimonials
			span.hidden(class="lg:inline-block") :&nbsp;&nbsp;
			span.block(class="lg:inline-block")
				+html('panel.category')

		//- quote
		.mb-8
			q.block.font-serif.font-semibold(
				class=`
				h-[12rem]
				text-[1.5em]
				sm:text-[2.25em]
				md:text-[2.75em]
				lg:text-[3em]
				leading-tight
				sm:h-[7em]
				md:h-[8em]
				xl:h-[7em]`
			)
				+html("panel.quote")

		//- Footer
		.grid.grid-cols-1.gap-y-2.place-content-end.justify-items-center.leading-none(
			class="min-h-[8em]"
		)
			//- Avatar
			img(
				class="aspect-square rounded-full w-[3.5em] h-auto mb-3",
				alt!="{ alt }",
				aria-hidden="true",
				height=78,
				src="/images/{panel.imageSlug}.avif",
				width=78
			)

			//- Name
			h4.opacity-90.font-medium { panel.name }

			//- Title & Company
			div
				| { panel.title },&nbsp;&nbsp;
				a.opacity-90.inline.underline.underline-offset-4(
					class="decoration-neutral-50/40 transition-opacity hover:opacity-100 hover:text-maximumYellow hover:decoration-current",
					href!="{ panel.companyUrl }",
					title!="visit { panel.companyName } website"
				) { panel.companyName }
</template>
