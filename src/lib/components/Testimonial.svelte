<script lang="ts">
	// utils
	import { deslugify } from "$utils/deslugify";

	// types
	interface Panel {
		category: string;
		quote: string;
		imageSlug: string;
		name: string;
		title: string;
		companyName: string;
		companyUrl: string;
	}

	// props
	let { panel }: { panel: Panel } = $props();

	// variables
	let alt = $derived(deslugify(panel.imageSlug).replace("testimonial", "").trim());
	// let quoteAttributes = $derived({
	// 	tag: "q",
	// 	classes: "block !leading-normal !text-3xl md:!leading-tight",
	// });
</script>

<div
	class="
		text-center
		sm:max-w-sm
		md:max-w-md
		lg:max-w-lg
		xl:max-w-xl">

	<!-- category-->
	<h3
		class="
			font-sans
			leading-normal
			mb-8
			text-[.85em]
			text-maximumYellow
			tracking-widest
			uppercase
			sm:mb-20
			sm:text-[1em]">
		<div class="block.text-neutral-100.opacity-60.mb-2 text-[.9em] lg:inline-block lg:text-[1em] lg:mb-0"> Testimonials</div>
		<span class="hidden lg:inline-block">:&nbsp;&nbsp;</span>
		<span class="block lg:inline-block">
			{@html panel.category}
		</span>
	</h3>

	<!-- quote -->
	<div class="mb-8">
		<q
			class="
				h-[12rem]
				text-[1.5em]
				sm:text-[2.25em]
				md:text-[2.75em]
				lg:text-[3em]
				leading-tight
				sm:h-[7em]
				md:h-[8em]
				xl:h-[7em]"
		>
			{@html panel.quote}
		</q>
	</div>

	<!-- Footer -->
	<div class="grid grid-cols-1 gap-y-2 place-content-end justify-items-center leading-none min-h-[8em]">
		<!-- Avatar -->
		<img
			class="aspect-square rounded-full w-[3.5em] h-auto mb-3"
			alt={ alt }
			aria-hidden="true"
			height=78
			src="/images/{panel.imageSlug}.avif"
			width=78
		/>

		<!-- Name -->
		<h4 class="opacity-90 font-medium">{ panel.name }</h4>

		<!-- Title & Company -->
		<div>
			{ panel.title },&nbsp;&nbsp;
			<a
				class="opacity-90 inline underline underline-offset-4 decoration-neutral-50/40 transition-opacity hover:opacity-100 hover:text-maximumYellow hover:decoration-current"
				href={ panel.companyUrl }
				title="visit { panel.companyName } website"
			>{ panel.companyName }</a>
		</div>
	</div>
</div>

