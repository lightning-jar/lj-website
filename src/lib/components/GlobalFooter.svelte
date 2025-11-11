<script lang="ts">
	// components
	import NavLogoBlock from "$components/NavLogoBlock.svelte";

	// variables
	const image = {
		alt: "Lightning Jar logo",
		breakpoints: [[""]],
		classes: "block",
		fallback: "pimcore-gold-partner.png",
		folder: "images",
		height: "120",
		loading: "lazy",
		slugCommon: "pimcore-gold-partner",
		sourceFormats: ["svg"],
		preload: [],
		width: "100",
	};
</script>


	<footer class="page-x-padding main-y-padding text-white font-serif bg-oxford">
		<!-- upper -->
		<div class="mt-16 md:grid grid-cols-2 gap-16">

			<!-- col 1: logo & messaging -->
			<div class="grid grid-cols-1 gap-6 max-w-sm">

				<!-- logo -->
				<NavLogoBlock />

				<!-- heading -->
				<h3 class="text-xl font-semibold mb-2 text-maximumYellow">Helping business thrive in a world that is more digital &amp; mobile every day.</h3>

				<!-- text -->
				<div class="mb-16 font-sans opacity-80">
					For over 20 years Lightning Jar has provided premium digital strategy, design and technology services to national and international business clients.
				</div>
			</div>

			<!-- col:2 links -->
			<div class="mt-14 grid grid-cols-1 gap-8">

				<!-- contact -->
				<div>
					<h3 class="text-xl font-semibold mb-2 text-maximumYellow">Contact</h3>
					<a
						class="hover:text-maximumYellow hover:opacity-100 transition-all underline underline-offset-4 decoration-slate-500"
						href="mailto:hey@lightningjar.com"
					>hey@lightningjar.com</a>
				</div>

				<div class="mb-8">
					<h3 class="text-xl font-semibold mb-2 text-maximumYellow">Locations</h3>
					<div class="mb-16 font-sans opacity-80">
						Philadelphia &CenterDot; New York &CenterDot; Texas
						<br />
						Proudly remote and distributed since 2018.
					</div>
				</div>

				<!-- More -->
				<!-- <div class="mb-24">
					<h3 class="text-xl font-semibold mb-2 text-maximumYellow">More</h3>
				</div> -->
			</div>
		</div>

		<!-- legal links -->
		<div class="mb-4 flex gap-4">

			{#each [{href: '/legal/privacy', text: 'Privacy Policy'}, {href: '/legal/terms', text: 'Terms'}] as {href, text} }
				<a
					class="font-sans inline-block text-xs opacity-80 hover:text-maximumYellow underline underline-offset-4 decoration-slate-500"
					{href}>
					{text}
				</a>
			{/each}
		</div>

		<!-- copyright text-->
		<div class="font-sans text-xs opacity-80 mb-36"> &copy; Copyright { new Date().getFullYear() } SiiTE Interactive LLC dba Lightning Jar.</div>
	</footer>

