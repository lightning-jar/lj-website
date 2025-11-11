<script lang="ts">
	interface Props {
		alt: string;
		classes: string;
		draggable: boolean;
		filename: string;
		folder: string;
		height: string | null;
		loading: string | null;
		width: string | null;
		style: string | null;
		title: string | null;
	}
	// props
	let {
		alt = "",
		classes = "",
		draggable = false,
		filename = "",
		folder = "images",
		height = null,
		loading = "lazy",
		width = null,
		style = null,
		title = null
	}: Props = $props();

	// src
	let src = $derived(`${folder}/${filename}`);
</script>


	<img
		class="w-full h-auto select-none {classes}"
		{alt}
		draggable={ draggable }
		height={ height }
		loading={ loading === "eager" ? "eager" : "lazy" }
		{src}
		style={ style }
		title={ title }
		width={ width }
		/>

