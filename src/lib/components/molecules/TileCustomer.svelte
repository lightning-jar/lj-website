<script lang='ts'>

  // components
  import PictureStack from "$a/PictureStack.svelte";
  import IconArrowRight from "$a/IconArrowRight.svelte";
  import ShapeTriangle from "$a/ShapeTriangle.svelte";

  // props
  export let imageAlt = '';
  export let imageSlug = '';
  export let logoAlt = '';
  export let logoSlug = '';
  export let text = '';
  export let url = ''

  // variables
  const image = {
    alt: imageAlt,
    classes: '',
    draggable: 'false',
    height: '648',
    fallback: `${imageSlug}.jpg`,
    folder: 'images',
    loading: 'lazy',
    width: '810',
    slugCommon: imageSlug,
    style: null,
  }
  const logo = {
    alt: logoAlt,
    classes: '!w-auto !h-full',
    draggable: 'false',
    height: '32',
    fallback: `${logoSlug}.png`,
    folder: 'images',
    loading: 'lazy',
    width: '178',
    slugCommon: logoSlug,
    style: null,
  }

</script>

<template lang='pug'>
a.w-full.bg-white.text-oxfordBlue.block(
  class="rounded-tl-3xl rounded-br-3xl overflow-hidden transition-opacity"
  data-customerTile
  href!="{url}"
  )

  //- tile header
  .relative.overflow-hidden
    PictureStack("{...image}")
    span.text-white.absolute.left-0.bottom-0.w-full.h-8.rotate-180
      ShapeTriangle

  //- tile body
  .px-8.py-8
    .flex.items-center.justify-between.mb-8
      .w-full(class="h-[30px] grow ")
        PictureStack("{...logo}")
      .mr-0.w-5.shrink-0.translate-x-2
        IconArrowRight
    div
      p.prose-md.mb-8(class="h-48")
        | {@html text}
</template>