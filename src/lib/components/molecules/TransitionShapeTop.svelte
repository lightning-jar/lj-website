<script lang="ts">

  export let classes = "text-oxford"
  export let fill = "currentColor"

</script>

<template lang='pug'>
.absolute.top-0.left-0.right-0.w-full.first-letter(class!="{'h-[12vw]' + ' ' + classes}")
  svg(
    viewBox="0 0 500 500"
    preserveAspectRatio="none"
    class="w-full h-full"
    )
    polygon(
      points="0,0 0,500 500,0"
      fill!="{fill}"
      )
</template>