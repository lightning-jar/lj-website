<script lang='ts'>

  // components
  import ColumnsTwoPlus from "$m/ColumnsTwoPlus.svelte";
  import TextHeading from "$a/TextHeading.svelte";
  import TextSubheading from "$a/TextSubheading.svelte";
  import SectionLight from "$m/SectionLight.svelte";
  import TransitionShapeTop from "$m/TransitionShapeTop.svelte";

</script>

<template lang='pug'>

SectionLight
  TransitionShapeTop

  div.pb-20(class='pt-[14vw]')



    .relative
      ColumnsTwoPlus

        //- column 1
        div(slot="column-1" class="prose-lg prose-p:text-darkCornflowerBlue")
          TextHeading Technology
          TextSubheading
            | We specialize in web-based technology transformations that give our clients an edge.
          p
            | Whether you need to upgrade your eCommerce, build a mobile app, SaaS product, or best-in-class website, our strategists, designers and technologists can help you fully articulate & execute your vision.

        //- column 2
        div.text-right(slot="column-2" class="prose-lg prose-p:text-darkCornflowerBlue")
          TextHeading Design
          TextSubheading
            | Our rigorous design process ensures happy customers one user experience at a time.
          p
            | Our strategists, designers, copywriters and multimedia creators work together to find the content solutions your customers want and execute them in ways that make them compelling, on-brand &amp; effective.



</template>