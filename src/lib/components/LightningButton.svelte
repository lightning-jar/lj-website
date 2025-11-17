<script lang="ts">
  // components
  import LightningBolt from "$components/LightningBolt.svelte";

  // props
  let { classes = "", onclick = () => {} } = $props();
</script>

<button
  title="Click me."
  class="
  text-maximumYellow
  hover:bg-maximumYellow
  hover:text-oxford
  rounded-full
  border
  flex
  items-center
  justify-center
  aspect-square
  w-8
  h-8
  p-10px
  leading-none
  {classes}"
  onclick={() => onclick()}><LightningBolt /></button
>
