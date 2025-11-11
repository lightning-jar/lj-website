<script lang="ts">
	let { children } = $props();
</script>

<h1 class="text-lg font-serif font-light opacity-95 text-cultured sm:text-lg lg:text-lg xl:text-xl 2xl:text-[1.25rem] !leading-[1.6]">
	{@render children?.()}
</h1>

