<script lang="ts">
	// this component creates a stack of images in the picture tag
	// the breakpoint prop takes unique filename and media rules in this format:
	// ['unique slug', [ruleName, ruleValue] ... more rules]
	// example: ['-388', ['max-width', '420.99px'], ['orientation', 'portrait']]

	// components
	import PictureStackFallback from "$components/PictureStackFallback.svelte";
	import PictureStackSource from "$components/PictureStackSource.svelte";

	interface Props {
		alt: string;
		breakpoints: (string | string[])[];
		classes: string;
		draggable: boolean;
		fallback: string;
		folder: string;
		height: string | null;
		loading: string | null;
		onlyScreen: boolean;
		preload: string[];
		sourceFormats: string[];
		slugCommon: string;
		style: string | null;
		title: string | null;
		width: string | null;
	}

	// props
	let {
		alt = "",
		breakpoints = [[""]],
		classes = "",
		draggable = false,
		fallback = "",
		folder = "images",
		height = null,
		loading = "lazy",
		onlyScreen = true,
		preload = [],
		sourceFormats = ["avif", "webp"],
		slugCommon = "",
		style = null,
		title = null,
		width = null
	}: Props = $props();

	// local functions
	function getType(format: string): string {
		let type: string;
		type = `image/${format}`;
		type = format === "svg" ? "image/svg+xml" : type;
		type = format === "jpg" ? "image/jpeg" : type;
		return type;
	}
	function srcset(breakpoint: (string | string[])[], format: string): string {
		return `/${folder}/${slugCommon}${breakpoint[0]}.${format}`;
	}
	function media(breakpoint: (string | string[])[]): string | undefined {
		let media = "";
		const hasContent: boolean = breakpoint.length > 0;
		const hasRules: boolean = !!(breakpoint[1]?.[0] );

		// add 'only screen' if true
		media += onlyScreen && hasContent && hasRules ? "only screen and " : "";

		// iterate media rules
		breakpoint.forEach((datum) => {
			const index = breakpoint.indexOf(datum);

			if (index > 0) {
				// for additional rules
				if (index > 1) media += " and ";

				// all rules
				if (breakpoint[index][0]) {
					media += `(${breakpoint[index][0]}: ${breakpoint[index][1]})`;
				}
			}
		});

		return media ? media : undefined;
	}

</script>

<picture>
	{#each breakpoints as breakpoint }
		{#each sourceFormats as format }
			{#if srcset([breakpoint], format) && getType(format) }
				<PictureStackSource
					media={ media([breakpoint]) }
					srcset={ srcset([breakpoint], format) }
					type={ getType(format) }
				/>
			{/if}
		{/each}
	{/each}
	<PictureStackFallback
		classes={ classes }
		alt={ alt }
		draggable={ draggable }
		filename={ fallback }
		folder={ folder }
		height={ height }
		loading={ loading }
		style={ style }
		title={ title }
		width={ width }
	/>
</picture>

