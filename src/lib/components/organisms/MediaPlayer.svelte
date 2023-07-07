<script lang="ts">
	// stores
	import { mediaPlayer, youTubeCode } from "$lib/stores/mediaPlayerStore";

	// props
	let src = "";
	$: {
		src = `https://www.youtube.com/embed/${$youTubeCode}?html5=1&rel=0&playsinline=1&autoplay=1`;
	}

	// function
	function killPlayer() {
		$mediaPlayer = false;
	}
	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") killPlayer();
	}
</script>

<template lang="pug">
	+if('$mediaPlayer && $youTubeCode')
		.fixed.w-screen.h-screen.bg-oxfordBlue.bg-opacity-95.flex.items-center.justify-center.z-50.p-8(
			on:click!="{ killPlayer }",
			on:keydown|preventDefault!="{ onKeydown }",
			role="presentation"
		)
			.w-full(class="aspect-w-16 aspect-h-9")
				+if('$youTubeCode')
					iframe(
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture allowfullscreen",
						allowfullscreen="true",
						frameborder="0",
						src!="{ src }",
						style="border: 0px",
						title="youtube video player"
					)
</template>
