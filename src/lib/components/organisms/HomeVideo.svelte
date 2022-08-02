<script lang='ts'>

  // components
  import VideoEmbed from "$m/VideoEmbed.svelte";
  import SectionLight from "$m/SectionLight.svelte";
  import TransitionShapeBottom from "$m/TransitionShapeBottom.svelte";

  // variables
  const bauhaus = '2a45UBCIbJc'
  const youTube = bauhaus

</script>

<template lang='pug'>

SectionLight(classes!="{'-translate-y-24 !pt-0 -mt-4'}")

  //- video player
  .relative.z-20.flex.justify-center.text-white.translate-y-24
    div(class="lg:max-w-[70vw]")
      VideoEmbed("{youTube}")
      div.italic.mt-3 What we're watching this week:
      div.italic "100 Years of Bauhuas | Walter Gropius - BBC Documentary"


  //- transition shape
  div.mb-24
    TransitionShapeBottom





</template>