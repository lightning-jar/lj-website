<script lang='ts'>
  // note: svelte doesn't like putting script tags in the body
  // this work-around for injecting structured data is inspired by:
  // https://navillus.dev/blog/json-ld-in-sveltekit

  // note: there is a bug in sveltekit, which is why we're not putting this inside svelte:head
  //https://github.com/sveltejs/svelte/issues/7444

  import { LjSchema, serializeSchema } from "$settings/structuredData";



</script>

<template lang='pug'>
| {@html serializeSchema(LjSchema)}

</template>