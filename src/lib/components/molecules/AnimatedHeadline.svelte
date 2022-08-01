<script lang="ts">

  // stores
  import { width } from "$lib/stores/windowStore";

  // components
  import AnimatedText from "$a/AnimatedText.svelte";
  import BlinkingCursor from "$a/AnimatedCursor.svelte";
  import { onMount } from "svelte";

  // variables
  export let staticBegin = '';
  export let staticEnd = '';
  export let animatedWords = [''];

</script>



<template lang="pug">

//- headline
.mb-8.font-serif.text-4xl.font-bold(class="lg:text-[4vw] leading-[1.2em]")
  span(class="md:block") {@html staticBegin}&nbsp;
  span.text-maximumYellow.underline.underline-offset-8.ml-2.inline-block(class="sm:hidden") {staticEnd}

  span(class="md:block leading-[1.2em]")
    //- animated text
    +if('$width > 640 && animatedWords[0]')
      AnimatedText("{animatedWords}")

    //- fake cursor
    +if('$width > 640')
      BlinkingCursor

    | &nbsp;




</template>