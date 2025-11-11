<script lang="ts">
	// components
	import BlinkingCursor from "$components/AnimatedCursor.svelte";
	import AnimatedText from "$components/AnimatedText.svelte";


	// types
	interface AnimatedHeadline {
		animatedWords: string[];
		staticBegin: string;
		staticEnd?: string;
	}
	interface Props {
		classes: string;
		animatedHeadline: AnimatedHeadline;
	}
	// props
	let {
		classes = "",
		animatedHeadline = {
			animatedWords: [],
			staticBegin: "",
			staticEnd: "",
		} }: Props = $props();

	let staticBegin = $derived(animatedHeadline.staticBegin ?? "");
	// let staticEnd = $derived(animatedHeadline.staticEnd ?? "");
	let animatedWords = $derived(animatedHeadline.animatedWords ?? []);

	// variables used in template
</script>

<div
	class={ classes }
	aria-hidden="true"
>
	<span>{@html staticBegin  }</span>

	<span class="sm:block md:inline-block lg:block xl:inline-block">
		<!-- animated text -->
		{#if animatedWords[0]}
			<span hidden class="sm:inline-block">
				<AnimatedText animatedWords={ animatedWords } />
			</span>
		{/if}

		<!-- fake cursor -->
		{#if animatedWords[0]}
			<span hidden class="sm:inline-block">
				<BlinkingCursor />
			</span>
		{/if}
	</span>

</div>