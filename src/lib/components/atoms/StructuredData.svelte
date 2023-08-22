<script lang="ts">
	// note: svelte doesn't like putting script tags in the body
	// this work-around for injecting structured data is inspired by:
	// https://navillus.dev/blog/json-ld-in-sveltekit

	import { LjSchema, serializeSchema } from "$settings/structuredData";

	// const schema = serializeSchema(LjSchema);
</script>

<template lang="pug">
	span
	//- 		+html(schema)
	//-
</template>
