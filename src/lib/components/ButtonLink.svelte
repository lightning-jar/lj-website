<script lang="ts">
	// props
	let {children, href = "", label = ""} = $props();
</script>

<a
	class="bg-[#EAF92E] transition-shadow hover:shadow-xl inline-block.shadow-md.px-8.py-4.text-xl.mt-8"
	href={ href }
	title="Send a message"
>
	<span>{ label }</span>
	{@render children?.()}
</a>

