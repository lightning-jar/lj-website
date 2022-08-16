<script lang='ts'>

  // props
  export let classes = '';

</script>

<template lang='pug'>
h3.text-xl.font-semibold.mb-2(class!="{(classes) ? classes : ''}")
  slot
</template>