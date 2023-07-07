<script lang="ts">
	//components
	import SectionFullBleed from "$molecules/SectionFullBleed.svelte";
	import Testimonial from "$molecules/Testimonial.svelte";
	import Slider from "$molecules/Slider.svelte";

	import IconArrowLeftAlt from "$atoms/IconArrowLeftAlt.svelte";

	const testimonialsHeading = `<span class='!text-white opacity-60'>Testimonials:&nbsp;&nbsp;</span>`;

	const panels = [
		{
			category: `${testimonialsHeading}Brand & Technology`,
			quote: `No other vendor delivers the <span class="underline-heading">depth of strategy</span> that Lightning&nbsp;Jar does.`,
			imageSlug: "david-h-testimonial",
			name: "David Heard",
			title: "CMO",
			companyName: "SecureLogix",
			companyUrl: "https://securelogix.com",
		},
		{
			category: `${testimonialsHeading}Pimcore Expertise`,
			quote:
				"Lightning Jar gave us a single source of truth for marketing data via Pimcore.",
			imageSlug: "liz-s-testimonial",
			name: "Liz Sterret",
			title: "Sr. Manager Marketing & Content",
			companyName: "Beam Suntory",
			companyUrl: "https://www.beamsuntory.com/",
		},
		{
			category: `${testimonialsHeading}PIM, Ecommerce, Mobile Apps`,
			quote:
				'Their technology team was my <span class="underline-heading">secret weapon</span> ...they helped me execute big ideas.',
			imageSlug: "frank-r-testimonial",
			name: "Frank Roth",
			title: "Former CMO",
			companyName: "United Rentals / BlueLine",
			companyUrl: "https://unitedrentals.com/",
		},
		{
			category: `${testimonialsHeading}Marketing & Brand Strategy`,
			quote:
				'LJ helped us <span class="underline-heading">focus and clarify</span> our brand vision during exponential growth.',
			imageSlug: "elizabeth-g-testimonial",
			name: "Elizabeth Grojean",
			title: "CEO & Founder",
			companyName: "Baloo Living",
			companyUrl: "https://balooliving.com/",
		},
		{
			category: `${testimonialsHeading}SAAS & Remote Solutions`,
			quote:
				'They helped us <span class="underline-heading">speed to launch</span> with our flagship remote SaaS solution.',
			imageSlug: "duane-v-testimonial",
			name: "Dr. Duane Varan",
			title: "CEO & Founder",
			companyName: "Media Science / Hark",
			companyUrl: "https://harkconnect.com/",
		},
		{
			category: `${testimonialsHeading}Kiosks / POS / Tablet Apps`,
			quote:
				'Our in-store app project was foundering... until LJ <span class="underline-heading">saved the day</span>.',
			imageSlug: "mubashir-m-testimonial",
			name: "Mubashir Memon",
			title: "Product Manager",
			companyName: "Northgate Markets",
			companyUrl: "https://prospera.northgatemarket.com/",
		},
	];
</script>

<template lang="pug">
	SectionFullBleed(
		classes="flex items-center justify-center h-screen max-h-[896px] sm:block sm:h-auto sm:max-h-[60rem] sm:py-32 md:py-36 lg:py-40 xl:py-40 border-b border-white/20 bg-gradient-to-b from-oxfordDark via-oxford to-oxfordDark",
		id!="{ 'testimonials' }"
	)
		//- horizontal rule
		//-.flex.w-100.justify-center
			div.border-maximumYellow.w-20.border-t-3.mb-8 &nbsp;

		Slider(
			classes!="{ '' }",
			{panels}
		)
			div(
				class="",
				let:panel,
				slot="panel"
			)
				Testimonial(
					category!="{ panel.category }",
					companyName!="{ panel.companyName }",
					companyUrl!="{ panel.companyUrl }",
					imageSlug!="{ panel.imageSlug }",
					name!="{ panel.name }",
					quote!="{ panel.quote }",
					title!="{ panel.title }"
				)
</template>
