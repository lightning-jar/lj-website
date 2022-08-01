

<script lang="ts">

//- imports
import type { NavDataItem } from "$types/navTypes";

//- props
export let navItem: NavDataItem;

//- variables
const label = navItem.label;
const slug = navItem.slug;


</script>
<template lang="pug">
a.font-serif.block.text-white.text-opacity-95.ml-10.group.transition-all(
  class="lg:text-lg xl:text-xl hover:text-opacity-100 hover:text-maximumYellow !outline-none"
  href="/{slug}"
  )
  span(class="group-focus:underline underline-offset-4") {label}
</template>