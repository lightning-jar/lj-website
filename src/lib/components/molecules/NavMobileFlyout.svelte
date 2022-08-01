




<script lang="ts">
  // components
  import IconArrowRight from "$a/IconArrowRight.svelte";
  import MobileMenuBack from "$a/NavMobileBack.svelte";
  import MobileMenuFlyoutItem from "$a/NavMobileFlyoutItem.svelte";

  // types
  import type { NavDataItem } from "$types/navTypes";

  // imorted functions
  import { slugify } from "$functions/helperFunctions";

  // svelte functions
  import { createEventDispatcher } from 'svelte';

  // props
  export let flyout: NavDataItem;
  export let flyouts: NavDataItem[];

  // variables
  const dispatch = createEventDispatcher();

</script>

<template lang="pug">
+if('!flyout.slug')
  nav.absolute.w-full.transition-transform(
    id!="{slugify(flyout.label) + '-mobile-flyout'}"
    class="translate-x-full open:translate-x-0"
    bind:this!="{flyouts[slugify(flyout.label)]}"
    )
    MobileMenuBack(
      "{flyout}"
      on:closeFlyout
      )

    +each('flyout.items as item')
      MobileMenuFlyoutItem("{item}")

</template>