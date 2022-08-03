<script lang="ts">
  import LogoDark from "$a/LogoDark.svelte";
</script>

<template lang="pug">
.flex.justify-start.items-center(class="w-full" tab-index="-1")
  a.block.relative.h-auto(
    href="/"
    class="w-52 !outline-none select-none text-lg"
    tile="Go to homepage"
    draggable="false"
    )
    span.sr-only Lightning Jar
    .w-full.h-full
      LogoDark

</template>