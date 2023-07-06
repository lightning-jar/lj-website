<script lang="ts">

  /**
   * ! comment syntax?
  */



  //- stores
  import { width, scroll, height } from "$stores/windowStore";

  //- prop
  export let w = 0;
  export let y = 0;
  export let h = 0;

  //- reactive expressions
  $: { $width = w; $scroll = y; $height = h; }

</script>

<svelte:window bind:innerWidth={w} bind:scrollY={y} bind:innerHeight={h}/>
