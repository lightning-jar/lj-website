<script lang="ts">
	// components
	import { LjSchema } from "$lib/settings/structuredData";

	// props
	export let additionalMetaTags: MetaTag[] = [];
	export let additionalLinkTags: MetaTag[] = [];
	export let canonical: string = "https://lightningjar.com";
	export let metaKeywords: string[];
	export let metaSection: string;
	export let metaNoindex: boolean = false;
	export let metaNofollow: boolean = false;
	export let metaDescription: string | null;

	// imported functions
	import { buildMetaTitle } from "$functions/metadataFunctions";

	// variables
	const title = buildMetaTitle(metaKeywords);

	// types
	interface MetaTag {
		tag: string;
		content?: string;
		att?: {
			name?: string;
			content?: string | null;
		};
	}

	// local functions
	function indexFollow() {
		const index = metaNoindex ? "noindex" : "index";
		const follow = metaNofollow ? "nofollow" : "follow";
		return `${index}, ${follow}`;
	}

	const data: MetaTag[] = [
		{
			tag: "title",
			content: buildMetaTitle(metaKeywords),
		},
		{
			tag: "meta",
			att: {
				name: "description",
				content: metaDescription,
			},
		},
		{
			tag: "meta",
			att: {
				name: "section",
				content: metaSection,
			},
		},
		{
			tag: "meta",
			att: {
				name: "robots",
				content: indexFollow(),
			},
		},
		{
			tag: "meta",
			att: {
				name: "googlebot",
				content: indexFollow(),
			},
		},
		{
			tag: "link",
			att: {
				name: "canonical",
				content: canonical,
			},
		},
	];

	//- add additional meta tags to data object
	additionalMetaTags.forEach((item) => {
		const obj = { tag: "meta", att: item };
		data.push(obj);
	});

	//- add additional link tags to data object
	additionalLinkTags.forEach((item) => {
		const obj = { tag: "link", att: item };
		data.push(obj);
	});

	const og = {
		type: "website",
		url: "https://lightningjar.com",
		title: "Lightning Jar",
		description: metaDescription,
		images: [
			{
				url: "https://lightningjar.com/images/lightning-jar-og.jpg",
				width: 864,
				height: 128,
				alt: "Lightning Jar Logo",
			},
			{
				url: "https://lightningjar.com/images/lightning-jar-og-b.jpg",
				width: 864,
				height: 128,
				alt: "Lightning Jar Logo - B",
			},
		],
	};
</script>

<template lang="pug">
	svelte:head
		+each('data as datum')
			svelte:element(
				content!="{ datum.content }",
				name!="{ datum.att ? datum.att.name : null }",
				this!="{ datum.tag ? datum.att.tag : null }"
			)
</template>
