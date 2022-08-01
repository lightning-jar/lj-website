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

SectionLight

  //- video player
  .relative.z-20.flex.justify-center
    div(class="lg:max-w-[70vw]")
      VideoEmbed("{youTube}")


  //- transition shape
  div.mb-24
    TransitionShapeBottom





</template>