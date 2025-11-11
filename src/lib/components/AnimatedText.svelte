<script lang="ts">
	//- local functions
	function typewriter(
		node: HTMLElement,
		{ speed = 1 },
	) {
		const valid =
			node.childNodes.length === 1 &&
			node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(
				`This transition only works on elements with a single text node child`,
			);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t: number) => {
				const i = Math.trunc(text.length * t);
				node.textContent = text.slice(0, i);
			},
		};
	}
	function switchHeadline() {
		const length = animatedWords.length;
		headlineIndex = headlineIndex < length - 1 ? headlineIndex + 1 : 0;
		const index = headlineIndex;

		//- wipe text
		headlineText = "";

		//- wait a bit before animating in the next word
		setTimeout(() => {
			headlineText = animatedWords[index];
		}, 1000);
	}

	function updateHeadline() {
		setInterval(switchHeadline, 3000);
	}

	//- variables
	let headlineText = $state("digital.");
	let headlineIndex = $state(0);

	// props
	let {animatedWords}: {animatedWords: string[]} = $props();

	//- run
	updateHeadline();
</script>


	{#key headlineText}
		<span class="text-maximumYellow underline underline-offset-8" transition:typewriter={{ speed: 1 }}> { headlineText }</span>
	{/key}
