<script lang='ts'>

  // components
  import TextHeading from "$a/TextHeading.svelte";
  import PictureStack from "$a/PictureStack.svelte";

  // global functions
  import { deslugify } from "$functions/helperFunctions";

  // props
  export let category = '';
  export let quote = '';
  export let imageSlug = '';
  export let name = '';
  export let title = '';
  export let companyName = '';
  export let companyUrl = '';

  // variables
  const headingAttributes = {
    tag: 'q',
    classes: 'block !leading-tight'
  }

  const image = {
    alt: deslugify(imageSlug).replace('testimonial', '').trim(),
    breakpoints: [['']],
    classes:"block rounded-full",
    folder: "images",
    height:"64",
    width:"64",
    fallback: `${imageSlug}.jpg`,
    slugCommon: imageSlug,
  }

</script>


<template lang='pug'>
div.text-center(class="md:max-w-3xl xl:max-w-4xl")

  //- Category
  .mb-3.text-maximumYellow.uppercase.font-semibold.tracking-widest.text-sm {category}

  //- Heading
  .mb-5
    TextHeading("{...headingAttributes}") {@html quote}

  //- Footer

  div
    // Avatar
    .flex.w-100.justify-center
      .mb-4.w-16
        PictureStack("{...image}")
    // Heading
    h4 {name}
    // Position
    p.text-sm
      | {title},&nbsp;
      a.text-body-light(href!="{companyUrl}") {@html companyName}
</template>