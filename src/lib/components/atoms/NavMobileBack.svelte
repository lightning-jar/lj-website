<script lang="ts">

  // components
  import IconArrowRight from "$a/IconArrowRight.svelte";

  // svelte functions
  import { createEventDispatcher } from 'svelte';

  // types
  import type { NavDataItem } from "$types/navTypes";

  // props
  export let flyout: NavDataItem;

  // variables
  const dispatch = createEventDispatcher();

  // local functions
  function closeFlyout() {
    dispatch('closeFlyout', flyout, {});
  }

</script>

<template lang="pug">
  .flex.justify-center.items-center.mb-0
    a.flex.items-center.justify-center.cursor-pointer(
      data-role="back"
      href="/#"
      class="border-b border-transparent focus:border-slate-600 !outline-none"
      on:click|preventDefault!="{closeFlyout}"
      )
      .ml-3.w-5.h-5.rotate-180.fill-current.pointer-events-none
        IconArrowRight
      .text-center.p-3.text-3xl.text-current.pointer-events-none(
        ) Back
</template>