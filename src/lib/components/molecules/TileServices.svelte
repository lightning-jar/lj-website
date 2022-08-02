<script lang='ts'>


</script>

<template lang='pug'>
.flex.w-full.h-auto
  .w-12(class="mr-6 flex-none")
    slot(name="icon")
  div
    h3.text-2xl.mb-3.font-serif
      slot(name="heading")
    p.prose-lg.text-white.mb-8
      slot(name="text")
</template>