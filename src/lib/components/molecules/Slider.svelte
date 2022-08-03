<script lang='ts'>

  //- components
  import SliderButton from "$m/SliderButton.svelte";

  //- data
  export let panels;
  //const panels = ["Number One", "Number Two", "Number Three"];


  $: currentPanel = 0;

  function next() {
    if (panels.length > currentPanel + 1) currentPanel = currentPanel + 1
    else currentPanel = 0
  }

  function previous() {
    if (currentPanel > 0) currentPanel = currentPanel -1;
    else currentPanel = panels.length - 1;
  }

</script>

<template lang='pug'>
.relative.w-full.mb-24.overflow-hidden


  //- content container
  .flex.justify-center.items-center.w-100.px-4(class="md:px-24")
    .relative.w-full.flex.justify-center.items-center &nbsp;
      +each('panels as panel, index')
        div(class!="{(currentPanel == index) ? '' : 'hidden'}")
          slot( name="panel" "{panel}")

  //- buttons
  div(on:click="{previous}")
    SliderButton(direction!="{'left'}")
  div(on:click="{next}")
    SliderButton(direction!="{'right'}")




</template>