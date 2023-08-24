<script lang="ts">
	// assets
	import { default as iconCustomSoftware } from "$assets/icon-custom-software.svg";
	import { default as iconEcommerce } from "$assets/icon-ecommerce.svg";
	import { default as iconKiosk } from "$assets/icon-kiosk.svg";
	import { default as iconUX } from "$assets/icon-ux.svg";
	import { default as iconWebDesign } from "$assets/icon-web-design.svg";
	import { default as iconSalesTools } from "$assets/icon-sales-tools.svg";

	const icons: { [key: string]: unknown } = {
		"icon-custom-software": iconCustomSoftware,
		"icon-ecommerce": iconEcommerce,
		"icon-kiosk": iconKiosk,
		"icon-ux": iconUX,
		"icon-web-design": iconWebDesign,
		"icon-sales-tools": iconSalesTools,
	};

	// global functions
	import { deslugify } from "$functions/helperFunctions";

	// props
	export let slug = "";
	export let classes = "";

	const noBreakpoint = [[""]];
	$: alt = deslugify(slug);
</script>

<template lang="pug">
	img(
		class="w-full h-auto block {classes}",
		alt!="{ alt }",
		height="48",
		loading="lazy",
		src!="{ icons[slug] }",
		width="48"
	)
</template>
