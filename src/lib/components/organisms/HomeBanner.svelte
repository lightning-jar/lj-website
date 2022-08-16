<script lang="ts">

  //- svelte
  import { onMount } from "svelte";

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


  let imageContent: HTMLDivElement | null = null;


  // fade in image content
  $: { if (imageContent) imageContent.classList.add("!opacity-100") }



</script>

<template lang="pug">

SectionDark(classes!="{'bg-gradient-to-tr from-oxford via-oxfordDark to-oxford !pt-24 pb-[12vw]'}")
  .items-center(class="md:flex md:h-full")
    ColumnsTwo(classes!="{'py-8 w-full'}")

      //- column 1 -- text content
      .flex.text-center.select-none.items-center(
        slot="column-1"
        class="h-full sm:text-left sm:pr-20 md:pr-8 w-full"
        )
        //- col inner
        div(class="sm:max-w-md text-white")
          .mb-8(class="lg:mb-10")
            AnimatedHeadline("{...headlineText}")
          .mb-4
            BannerHomeText {bannerText}

      //-column 2 -- image content
      .opacity-0.transition-opacity.w-full(
        bind:this!="{imageContent}"
        slot="column-2"
        class="h-full w-full py-8 md:p-0 flex justify-center xl:justify-start"
        style=""
        )
        //- col inner
        .relative(
          class="max-w-sm lg:max-w-sm xl:max-w-lg"
          style=""
          )
          .absolute(
            class="bottom-0 right-0 w-2/5 h-1/3 -z-10")
            ImageDotGrid
          .static
            ImageTigers

</template>
