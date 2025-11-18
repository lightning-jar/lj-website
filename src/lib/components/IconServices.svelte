<script lang="ts">
// utils
import { deslugify } from "$utils/deslugify";

// assets
import { default as iconCustomSoftware } from "$assets/icon-custom-software.svg";
import { default as iconEcommerce } from "$assets/icon-ecommerce.svg";
import { default as iconKiosk } from "$assets/icon-kiosk.svg";
import { default as iconSalesTools } from "$assets/icon-sales-tools.svg";
import { default as iconUX } from "$assets/icon-ux.svg";
import { default as iconWebDesign } from "$assets/icon-web-design.svg";

const icons: { [key: string]: string } = {
	"icon-custom-software": iconCustomSoftware as string,
	"icon-ecommerce": iconEcommerce as string,
	"icon-kiosk": iconKiosk as string,
	"icon-ux": iconUX as string,
	"icon-web-design": iconWebDesign as string,
	"icon-sales-tools": iconSalesTools as string,
};

// props
let { slug = "", classes = "" } = $props();

// derive alt
let alt = $derived(deslugify(slug));

// derive src
let src = $derived(icons[slug]);
</script>

{#if src}
<img
		class="w-full h-auto block {classes}"
		alt={ alt }
		height="48"
		loading="lazy"
		src={ src }
		width="48"
	/>
{/if}

