<script lang="ts">
	//- local functions
	function typewriter(
		node: { childNodes: string | any[]; textContent: string },
		{ speed = 1 }: any,
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
	let headlineText = "digital.";
	let headlineIndex = 0;
	export let animatedWords: string[] = [""];

	//- run
	updateHeadline();
</script>

<template lang="pug">
	+key('headlineText')
		span.text-maximumYellow.underline.underline-offset-8(transition:typewriter) { headlineText }
</template>
