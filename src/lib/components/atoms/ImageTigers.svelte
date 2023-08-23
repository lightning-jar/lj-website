<script lang="ts">
</script>

<template lang="pug">
	picture.flex
		source(
			media="(max-width: 420px",
			srcset="https://res.cloudinary.com/dn0pqjjbq/image/upload/c_scale,dpr_auto,f_auto,q_39,w_700/v1692813712/lj-tigers-transparent-800_cbisg2.avif"
		)
		source(
			media="(max-width: 1023.99px",
			srcset="https://res.cloudinary.com/dn0pqjjbq/image/upload/c_scale,dpr_auto,f_auto,q_39,w_800/v1692813712/lj-tigers-transparent-800_cbisg2.avif"
		)
		source(
			media="(min-width: 1024px) and (max-width: 1799.99)",
			srcset="https://res.cloudinary.com/dn0pqjjbq/image/upload/c_scale,dpr_auto,f_auto,q_39,w_1000/v1692813712/lj-tigers-transparent-800_cbisg2.avif"
		)
		img#tigers.block.z-10(
			class="w-full h-auto pinter-events-none",
			alt="two tigers circle each other",
			height="966",
			loading="lazy",
			src="https://res.cloudinary.com/dn0pqjjbq/image/upload/f_auto,q_60/v1692813712/lj-tigers-transparent-800_cbisg2.avif",
			width="912"
		)
</template>
