<script lang="ts">
	//components
	import Testimonial from "$molecules/Testimonial.svelte";
	import Slider from "$molecules/Slider.svelte";

	import IconArrowLeftAlt from "$atoms/IconArrowLeftAlt.svelte";

	const testimonialsHeading = `<span class='!text-white opacity-60'>Testimonials:&nbsp;&nbsp;</span>`;

	interface Testimonial {
		category: string;
		quote: string;
		imageSlug: string;
		name: string;
		title: string;
		companyName: string;
		companyUrl: string;
	}
	// props
	export let testimonials: Testimonial[] = [];
</script>

<template lang="pug">
	section#testimonials(
		class=`
		border-y
		border-neutral-100/10
		flex
		h-screen
		items-center
		justify-center
		page-x-padding
		relative
		sm:block
		sm:h-auto
		sm:max-h-[60rem]
		sm:py-32
		md:py-36
		lg:py-40
		xl:py-40`
	)
		//- horizontal rule
		//-.flex.w-100.justify-center
			div.border-maximumYellow.w-20.border-t-3.mb-8 &nbsp;

		Slider(
			classes!="",
			panels!="{ testimonials }"
		)
			svelte:fragment(
				let:panel,
				slot="panel"
			)
				Testimonial(panel!="{ panel }")
</template>
