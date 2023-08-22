<script lang="ts">
	// components
	import FooterHeading from "$atoms/FooterHeading.svelte";
	import FooterLink from "$atoms/FooterLink.svelte";
	import FooterText from "$atoms/FooterText.svelte";
	import FooterLegalLink from "$atoms/FooterLegalLink.svelte";
	import FooterLegalText from "$atoms/FooterLegalText.svelte";
	import NavLogoBlock from "$molecules/NavLogoBlock.svelte";
	import PimcoreBadge from "$atoms/PimcoreBadge.svelte";
	import TextHeading from "$atoms/TextHeading.svelte";

	// components
	import PictureStack from "$atoms/PictureStack.svelte";

	// variables
	const image = {
		alt: "Lightning Jar logo",
		breakpoints: [[""]],
		classes: "block",
		fallback: "pimcore-gold-partner.png",
		folder: "images",
		height: "120",
		loading: "lazy",
		slugCommon: "pimcore-gold-partner",
		sourceFormats: ["svg"],
		preload: [],
		width: "100",
	};

	// settings
	import { pageXPadding } from "$settings/layoutSettings";
</script>

<template lang="pug">
	footer(class!="{ pageXPadding + ' text-white font-serif ' }")
		//- upper
		.mt-16(class="md:grid grid-cols-2 gap-16")
			//- col 1: logo & messaging
			.max-w-sm
				.mb-6
					NavLogoBlock

				.mb-6
				FooterHeading(classes!="{ '!text-maximumYellow' }")
					| Helping business thrive in a world that is more digital &amp; mobile every day.

				.mb-20
					FooterText
						| For over 20 years Lightning Jar has provided premium digital strategy, design and technology services to national and international business clients.

				//- badge
				.w-20.mb-20
					PimcoreBadge(href!="{ '/blog/what-is-pimcore' }")

			//- col:2 links
			.mt-14
				.mb-8
					FooterHeading Contact
					FooterLink(href!="{ 'mailto:hey@lightningjar.com' }") hey@lightningjar.com

				.mb-8
					//- FooterHeading Headquarters
					//- //- FooterText 230 S Broad Street
					//- FooterText Philadelphia, PA

				.mb-8
					FooterHeading Locations
					//- FooterText 230 S Broad Street
					FooterText
						| Philadelphia &CenterDot; New York &CenterDot; Texas
						br
						| Proudly remote and distributed since 2018.

				//-.mb-24
					FooterHeading More
					FooterLink(href!="{ 'https://pugify.dev/' }") HTML to Pug Converter

		.mb-4.flex
			FooterLegalLink(
				classes="mr-4",
				href="/legal/privacy"
			) Privacy Policy
			FooterLegalLink(
				classes="mr-4",
				href="/legal/terms"
			) Terms

		.mb-36
			FooterLegalText &copy; Copyright { new Date().getFullYear() } SiiTE Interactive LLC dba Lightning Jar.
</template>
