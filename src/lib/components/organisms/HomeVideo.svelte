<script lang='ts'>

  // components
  import VideoEmbed from "$m/VideoEmbed.svelte";
  import SectionLight from "$m/SectionLight.svelte";
  import TransitionShapeBottom from "$m/TransitionShapeBottom.svelte";

</script>

<template lang='pug'>

SectionLight

  //- video player
  .relative.z-20.flex.justify-center
    div(class="lg:max-w-[70vw]")
      VideoEmbed


  //- transition shape
  div.mb-24
    TransitionShapeBottom





</template>