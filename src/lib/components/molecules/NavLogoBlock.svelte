<script lang="ts">
	import LogoDark from "$atoms/LogoDark.svelte";
</script>

<template lang="pug">
	.flex.justify-start.items-center(class="w-full", tab-index="-1")
		a.block.relative.h-auto(
			class="!outline-none select-none text-lg w-48 lg:w-[12.5rem] xl:w-[13rem]",
			draggable="false",
			href="/",
			tile="Go to homepage"
		)
			span.sr-only Lightning Jar
			.w-full.h-full
				LogoDark(
					loading!="{ 'eager' }",
					preload!="{ ['svg'] }"
				)
</template>
