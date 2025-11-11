<script lang="ts">
	import { default as logoSVG } from "$assets/lightning-jar-logo.svg";

	let { classes }: { classes?: string } = $props();
</script>

<a
	class="
	block
	group
	h-auto
	!outline-none
	relative
	text-maximumYellow
	underline-offset-8
	w-[9em]
	sm:w-[10em]
	lg:w-[12.5em]
	xl:w-[13em]
	hover:after:opacity-100
	focus:after:opacity-100
	after:pointer-events-none
	after:opacity-0
	after:absolute
	after:inset-0
	after:border-b
	after:border-b-2
	after:border-current
	after:translate-y-2
	after:z-0
	{classes}"
	draggable="false"
	href="/"
	title="Go to homepage"
>
	<span class="sr-only">Lightning Jar</span>
	<div class="picture.w-full.h-full.flex">
		<img
			class="block pointer-events-none"
			alt="Lightning Jar Logo"
			draggable="false"
			height=30
			src={logoSVG}
			width=200
		/>
	</div>
</a>