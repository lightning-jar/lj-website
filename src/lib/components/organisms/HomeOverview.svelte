<script lang="ts">
	// components
	import ColumnsTwoPlus from "$molecules/ColumnsTwoPlus.svelte";
	import TextHeading from "$atoms/TextHeading.svelte";
	import TextSubheading from "$atoms/TextSubheading.svelte";
	import TextParagraph from "$atoms/TextParagraph.svelte";
	import SectionDark from "$molecules/SectionLight.svelte";
	import TransitionShapeTop from "$molecules/TransitionShapeTop.svelte";
</script>

<template lang="pug">
	SectionDark(classes!="{ 'bg-gradient-to-b from-oxford to-oxfordDark' }")
		TransitionShapeTop(
			classes!="{ 'text-oxford rotate-180 -translate-y-[12vw]' }"
		)

		.pb-20(class="pt-16")
			.relative.text-oxfordBlue
				ColumnsTwoPlus(classes!="{ '' }")
					//- column 1
					.text-right(class="text-cultured p-12 ", slot="column-1")
						//-TransitionShapeTop(classes="rotate-180 text-transparent h-[3vw] translate-y-[-99%]")
						.max-w-lg
							TextHeading(classes="mb-6")
								.inline-block.px-6.py-1 Design
							TextSubheading Our rigorous design process ensures happy customers one user experience at a time.
							//-TextParagraph
								| Our strategists, designers, copywriters and multimedia creators work together to find the content solutions and user experiences your customers want and execute them in ways that make them compelling, on-brand &amp; effective.


					//- column 2
					div(class="text-cultured p-12 relative", slot="column-2")
						//-TransitionShapeTop(classes="rotate-180 text-oxford h-[3vw] translate-y-[-99%]")
						.max-w-lg
							TextHeading(classes="mb-6")
								.inline-block.px-6.py-1 Build
							TextSubheading(classes!="{ 'italic' }")
								| We specialize in web-based technology transformations that give our clients an edge.
							//-TextParagraph
								| Whether you need to upgrade your eCommerce, build a mobile app, SaaS product, or best-in-class website, our strategists, designers and technologists can help you fully articulate &amp; execute your vision.
</template>
