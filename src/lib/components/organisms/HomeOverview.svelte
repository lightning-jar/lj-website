<script lang='ts'>

  // components
  import ColumnsTwoPlus from "$m/ColumnsTwoPlus.svelte";
  import TextHeading from "$a/TextHeading.svelte";
  import TextSubheading from "$a/TextSubheading.svelte";
  import TextParagraph from "$a/TextParagraph.svelte";
  import SectionLight from "$m/SectionLight.svelte";
  import TransitionShapeTop from "$m/TransitionShapeTop.svelte";

</script>

<template lang='pug'>

SectionLight(classes!="{'bg-gradient-to-b from-culturedGray via-white to-culuturedGray'}")
  TransitionShapeTop(classes!="{'text-cultured rotate-180 -translate-y-[12vw]'}")

  div.pb-20(class='pt-16')



    .relative.text-oxfordBlue
      ColumnsTwoPlus(classes!="{''}")

        //- column 1
        div(slot="column-1" class="text-oxfordLight md:pt-0")
          div.max-w-lg
            TextHeading Technology
            TextSubheading(classes!="{'italic'}")
              | We specialize in web-based technology transformations that give our clients an edge.
            TextParagraph
              | Whether you need to upgrade your eCommerce, build a mobile app, SaaS product, or best-in-class website, our strategists, designers and technologists can help you fully articulate &amp; execute your vision.

        //- column 2
        div.text-right(slot="column-2" class="lg:-translate-y-24 text-oxfordLight").flex.justify-end
          div.max-w-lg
            TextHeading Design
            TextSubheading Our rigorous design process ensures happy customers one user experience at a time.
            TextParagraph
              | Our strategists, designers, copywriters and multimedia creators work together to find the content solutions your customers want and execute them in ways that make them compelling, on-brand &amp; effective.



</template>