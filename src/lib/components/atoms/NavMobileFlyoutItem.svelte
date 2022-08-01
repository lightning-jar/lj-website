<script lang="ts">

  // types
  import type { NavMenuItem } from "$types/navTypes";

  // props
  export let item: NavMenuItem;


</script>

<template lang="pug">
.flex.justify-center.items-center.mb-0
  a.text-center.p-3.text-3xl(
    class="border-b border-transparent focus:border-slate-600 !outline-none"
    href!="{(item.slug) ? '/' + item.slug : item.url}"
    )
    | {item.label}
</template>