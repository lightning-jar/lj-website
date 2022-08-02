<script lang='ts'>

  // props
  export let alt = '';
  export let classes = '';
  export let draggable = 'false';
  export let filename = '';
  export let folder = 'images'
  export let height: string | null = null;
  export let loading = 'lazy';
  export let width: string | null = null;
  export let style: string | null = null;

  const attributes = {
    alt: alt,
    class: `w-full h-auto select-none ${classes}`,
    draggable: draggable,
    height: height,
    loading: loading,
    width: width,
    src: `${folder}/${filename}`,
    style: style
  }

</script>

<!-- svelte-ignore a11y-missing-attribute -->
<template lang='pug'>

img("{...attributes}")

</template>