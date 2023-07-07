<script lang="ts">
	// ignore spelling errors CSpell
	/* cspell:disable */
	//components
	import TextHeading from "$atoms/TextHeading.svelte";
	import SectionDark from "$molecules/SectionDark.svelte";
	import TileCustomer from "$molecules/TileCustomer.svelte";
	import Slider from "$molecules/Slider.svelte";
	import type { Mouse } from "@playwright/test";

	const customers = [
		{
			category: "Customer Story",
			color: "#56CAD9",
			customer: "SecureLogix",
			imageAlt: "Doctor on phone",
			imageSlug: "securelogix",
			logoAlt: "SecureLogix logo",
			logoSlug: "securelogix-logo",
			tags: [
				"website",
				"knowledge-base",
				"partner-portal",
				"brand-strategy",
				"product-naming",
				"videos",
				"saas-ui",
			],
			text: "Anim esse mollit commodo non sunt excepteur adipisicing esse proident quis qui eiusmod veniam nostrud eiusmod culpa nostrud irure proident minim non est culpa reprehenderit id excepteur adipisicing enim.",
			url: "https://petroskills.com",
		},
		{
			category: "Customer Story",
			color: "#EBC500",
			customer: "PetroSkills",
			imageAlt: "Hardhat",
			imageSlug: "petroskills",
			logoAlt: "Petroskills logo",
			logoSlug: "petroskills-logo",
			tags: ["Pimcore", "PIM", "eCommerce", "Pardot"],
			text: "Petroskills is the global leader for remote, on-demand, and on-site training for energy industry workers. We helped Petroskills architect, design and deploy a custom WCM, PIM, and eCommerce solution powered by Pimcore.",
			url: "https://petroskills.com",
		},
		{
			category: "Customer Story",
			color: "#53C1D8",
			customer: "Beam Suntory",
			imageAlt: "Old Fashioned cocktail",
			imageSlug: "beam",
			logoAlt: "Beam Suntory logo",
			logoSlug: "beam-logo",
			tags: ["Pimcore", "PIM", "MDM", "Web-to-Print"],
			text: "Beam Suntory found a single source of truth for marketing data with Pimcore. Do nisi laborum cillum magna officia ullamco excepteur ullamco labore ad culpa dolor cupidatat exercitation amet duis consequat consectetur ea pariatur. ",
			url: "https://pimcore.com/en/customers/suntory-group_c132768",
		},
		/*{
			imageAlt: 'Construction superintendent',
			imageSlug: 'blueline-tile',
			logoAlt: 'Blueline Rental Logo',
			logoSlug: 'blueline-logo',
			text: 'Blueline Rental transforms customer experience and product data management with the power of Pimcore.',
			url: 'https://pimcore.com/en/customers/united-rentals-inc_c7709'
			},*/
		{
			category: "Customer Story",
			color: "#E6E0F3",
			imageAlt: "Woman wrapped in weighted blanket",
			imageSlug: "baloo",
			logoAlt: "Baloo Living Logo",
			logoSlug: "baloo-logo",
			tags: ["Brand Strategy", "Identity"],
			text: "We helped Baloo Living founder Elizabeth Grojean find her brand voice and refine her brand strategy. Do nisi laborum cillum magna officia ullamco excepteur ullamco labore ad culpa dolor cupidatat exercitation.",
			url: "https://www.thestartupstory.co/episodes/elizabeth-grojean-founder-of-baloo-living",
		},
		{
			category: "Customer Story",
			imageAlt: "Couple working on home improvement project",
			imageSlug: "builddirect",
			logoAlt: "Build Direct logo",
			logoSlug: "builddirect-logo",
			text: "BuildDirect automates product data and creates a supplier-side portal for manufacturers. Do nisi laborum cillum magna officia ullamco excepteur ullamco labore ad culpa dolor cupidatat exercitation amet duis consequat consectetur ea pariatur.",
			url: "https://pimcore.com/en/customers/builddirect_c666",
		},
	];

	function hoverOnTile(e: MouseEvent) {
		const customerTiles = document.querySelectorAll("[data-customerTile]");
		customerTiles.forEach((tile) => {
			tile.classList.add("opacity-40");
		});
		const target = e.target as HTMLElement;
		target.firstElementChild?.classList.remove("opacity-40");
	}

	function hoverOffTile(e: MouseEvent) {
		const customerTiles = document.querySelectorAll("[data-customerTile]");
		customerTiles.forEach((tile) => {
			tile.classList.remove("opacity-40");
		});
	}
</script>

<template lang="pug">
	SectionDark(
		classes!="{ 'py-24 bg-gradient-to-b from-oxfordDark via-oxford to-oxfordDark border-t border-t-titaniumYellow ' }",
		id!="{ 'clients' }"
	)
		//- heading
		.text-center.mt-20.mb-20.grid-cols-5.gap-8(
			class="hidden md:grid md:text-left lg:grid-cols-9"
		)
			.col-span-2.mb-4(class="md:mb-0 lg:col-span-4")
				TextHeading(classes!="{ 'mb-0 inline' }") Every client has unique challenges to solve
				span.inline-block.ml-8 ( that's our jam )
			.col-span-3.flex(class="lg:col-span-5 items-end")
				p.prose-lg.hidden Doing what we do, we get to meet a lot of different people from very different industries. Each day we get to learn something new, think about something we've never considered before. There's true pleasure for us in confronting and solving novel problems.

		//- tiles grid
		.gap-8.grid-cols-2.mb-20(class="hidden sm:grid md:grid-cols-3 lg:grid-cols-3")
			+each('customers as customer')
				.rounded.outline.px-0.py-6(
					class="sm:bg-white/5 outline-white/10",
					on:mouseenter|stopPropagation!="{ hoverOnTile }",
					on:mouseleave|stopPropagation!="{ hoverOffTile }"
				)
					TileCustomer(
						category!="{ customer.category }",
						color!="{ customer.color }",
						customer!="{ customer.customer }",
						imageAlt!="{ customer.imageAlt }",
						imageSlug!="{ customer.imageSlug }",
						logoAlt!="{ customer.logoAlt }",
						logoSlug!="{ customer.logoSlug }",
						tags!="{ customer.tags }",
						text!="{ customer.text }",
						url!="{ customer.url }"
					)

		//- slider
		div(class="sm:hidden")
			Slider(
				classes!="{ '' }",
				panels!="{ customers }"
			)
				div(
					class="",
					let:panel,
					slot="panel"
				)
					TileCustomer(
						category!="{ panel.category }",
						color!="{ panel.color }",
						customer!="{ panel.customer }",
						imageAlt!="{ panel.imageAlt }",
						imageSlug!="{ panel.imageSlug }",
						logoAlt!="{ panel.logoAlt }",
						logoSlug!="{ panel.logoSlug }",
						tags!="{ panel.tags }",
						text!="{ panel.text }",
						url!="{ panel.url }"
					)
</template>
