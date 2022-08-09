<script lang="ts">

  //- components
  import AnimatedHeadline from "$m/AnimatedHeadline.svelte";
  import BannerHomeText from "$a/BannerHomeText.svelte";
  import ColumnsTwo from "$m/ColumnsTwo.svelte";
  import ImageDotGrid from "$a/ImageDotGrid.svelte";
  import ImageTigers from "$a/ImageTigers.svelte";
  import SectionDark from "$m/SectionDark.svelte";

  //- variables
  const headlineText = {
    animatedWords:  ['digital.', 'mobile.', 'remote.', 'competitive.'],
    staticBegin: 'The world is <br>getting more',
    staticEnd: 'digital.'
  }
  const bannerText = 'Since 2004, Lightning Jar digital has been helping businesses thrive in a world that is more digital & mobile every day.'

</script>

<template lang="pug">

SectionDark(classes!="{''}")
  ColumnsTwo

    //- column 1 -- text content
    .flex.text-center.select-none.items-center(
      slot="column-1"
      class="h-full sm:text-left sm:pr-20 md:pr-8 lg:pr-[12vw]"
      )
      div
        AnimatedHeadline("{...headlineText}")
        BannerHomeText {bannerText}

    //-column 2 -- image content
    .relative(
      slot="column-2"
      class="h-full p-8 sm:p-24 md:p-4 lg:p-[7.5vw]"
      )
      .absolute(class="bottom-8 right-4 md:w-36 lg:bottom-[6.5vw] lg:right-[6vw] lg:w-[12.5vw] -z-10")
        ImageDotGrid
      .static
        ImageTigers

</template>
