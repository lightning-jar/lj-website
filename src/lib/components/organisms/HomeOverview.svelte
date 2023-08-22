<script lang="ts">
	// components
	import SectionLight from "$molecules/SectionLight.svelte";
	import TransitionShapeTop from "$molecules/TransitionShapeTop.svelte";

	const content = [
		{
			heading: "Technology",
			subheading:
				"We specialize in web-based technology transformations that give our clients an edge.",
			paragraph:
				"Whether you need to upgrade your eCommerce, build a mobile app, SaaS product, or best-in-class website, our strategists, designers and technologists can help you fully articulate & execute your vision.",
		},
		{
			heading: "Design",
			subheading:
				"Our rigorous design process ensures happy customers one user experience at a time.",
			paragraph:
				"Our strategists, designers, copywriters and multimedia creators work together to find the content solutions and user experiences your customers want and execute them in ways that make them compelling, on-brand & effective.",
		},
	];
</script>

<template lang="pug">
	.bg-neutral-100.text-OxfordBlue.relative.page-x-padding.w-full.flex.justify-center
		//- transition shape
		TransitionShapeTop(
			classes!="{ 'text-neutral-100 rotate-180 -translate-y-[12vw]' }"
		)

		.pb-20(class="py-20 pb-20")
			.relative.text-oxfordBlue(class="md:grid grid-cols-3")
				+each('content as item, index')
					div(
						class!="max-w-md lg:max-w-lg font-serif { index === 0 ? 'lg:pl-8' : 'text-right lg:pr-8' }"
					)
						//- heading
						h2(
							class=`
							mb-4
							sm:text-[2.25rem]
							lg:text-[2.5rem]
							xl:text-[3rem]
							font-bold
							text-4xl
							`
						) { item.heading }

						//- subheading
						div(
							class=`
							italic
							text-18
							sm:text-16
							lg:text-17
							text-oxfordDark
							font-bold
							font-sans
							mb-4
							opacity-90
							`
						)
							| { item.subheading }

						//- paragraph
						p.text-18.opacity-90(class="sm:text-16") { item.paragraph }

					//- plus
					+if('index === 0')
						.flex.w-full.h-full.justify-center.items-center
							div(class="font-normal text-[50px] text-androidGreen") +
</template>
