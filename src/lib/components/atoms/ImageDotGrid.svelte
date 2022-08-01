<template lang='pug'>
picture
  source(
    type="image/svg+xml"
    srcset="/images/dot-grid.svg"
    )
  img.select-none(
    class="w-full h-auto"
    height="185"
    width="185"
    draggable="false"
    loading="lazy"
    alt="circle pattern"
    src="/images/dot-grid.png"
    )
</template>