<script lang="ts">
  import LogoDark from "$a/LogoDark.svelte";
</script>

<template lang="pug">
.flex.justify-start.items-center(class="w-full" tab-index="-1")
  a.block.relative.h-auto(
    href="/"
    class="!outline-none select-none text-lg w-48 lg:w-[12.5rem] xl:w-[13rem]"
    tile="Go to homepage"
    draggable="false"
    )
    span.sr-only Lightning Jar
    .w-full.h-full
      LogoDark(
        loading!="{'eager'}"
        preload!="{['svg']}")

</template>