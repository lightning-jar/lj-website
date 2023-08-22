<script lang="ts">
	// stores
	import { page } from "$app/stores";

	// components
	import HomeBanner from "$organisms/HomeBanner.svelte";
	import HomeCustomers from "$organisms/HomeCustomers.svelte";
	import HomeOverview from "$organisms/HomeOverview.svelte";
	import HeadMeta from "$molecules/AnimatedHeadline.svelte";
	import HomeVideo from "$organisms/HomeVideo.svelte";
	import HomeServices from "$organisms/HomeServices.svelte";
	import HomeTestimonials from "$organisms/HomeTestimonials.svelte";
	import HomeContact from "$organisms/HomeContact.svelte";
	import MediaPlayer from "$organisms/MediaPlayer.svelte";
	import OpenGraph from "$atoms/OpenGraph.svelte";
	import StructuredData from "$atoms/StructuredData.svelte";
	import WindowUpdater from "$molecules/WindowStoreUpdater.svelte";

	// types
	import type { PageData } from "./$types";

	export let data: PageData;

	// content for open graph
	// const og = {
	// 	type: "website",
	// 	url: "https://lightningjar.com",
	// 	title: "Lightning Jar",
	// 	description:
	// 		"Lightning Jar is a technology studio & digital agency helping businesses thrive in a world that is more digital &amp; mobile every day",
	// 	images: [
	// 		{
	// 			src: "https://lightningjar.com/images/lightning-jar-og.jpg",
	// 			alt: "Lightning Jar Logo",
	// 			width: "800",
	// 			height: "600",
	// 		},
	// 	],
	// };
</script>

<template lang="pug">
	//- OpenGraph(
	//- 	description!="{ og.description }",
	//- 	images!="{ og.images }",
	//- 	title!="{ og.title }",
	//- 	type!="{ og.type }",
	//- 	url!="{ og.url }"
	//- )
	//- StructuredData
	//- MediaPlayer

	HomeBanner
	HomeOverview
	HomeVideo
	//- HomeServices
	//- HomeTestimonials
	//- HomeCustomers
	//- HomeContact

	//- HeadMeta(
	//- 	additionalLinkTags!="{ headAttributes.additionalLinkTags }",
	//- 	additionalMetaTags!="{ headAttributes.additionalMetaTags }",
	//- 	metaDescription!="{ headAttributes.metaDescription }",
	//- 	metaKeywords!="{ headAttributes.metaKeywords }",
	//- 	metaNofollow!="{ headAttributes.metaNofollow }",
	//- 	metaNoindex!="{ headAttributes.metaNoindex }",
	//- 	metaSection!="{ headAttributes.metaSection }"
	//- )
</template>
