<script lang="ts">

  //components
  import SectionFullBleed from "$m/SectionFullBleed.svelte";
  import Testimonial from "$m/Testimonial.svelte";
  import Slider from "$m/Slider.svelte";

  import IconArrowLeftAlt from "$a/IconArrowLeftAlt.svelte";

  const panels = [
    {
      category: "Strategy + Execution",
      quote: `No other vendor delivers the <span class="underline-heading">depth of strategy</span> that Lightning Jar does.`,
      imageSlug: "david-h-testimonial",
      name: "David Heard",
      title: "CMO",
      companyName: "SecureLogix",
      companyUrl: "https://securelogix.com"
    },
    {
      category: "Pimcore Expertise",
      quote: "Lightning Jar gave us a single source of truth for marketing data via Pimcore.",
      imageSlug: "liz-s-testimonial",
      name: "Liz Sterret",
      title: "Sr. Manager Marketing & Content",
      companyName: "Beam Suntory",
      companyUrl: "https://www.beamsuntory.com/"
    }
  ]

</script>

<template lang="pug">
SectionFullBleed

  //- horizontal rule
  .flex.w-100.justify-center
    div.border-maximumYellow.w-20.border-t-8.mb-24 &nbsp;

  Slider( "{panels}" )
    div(slot="panel" let:panel)
      Testimonial(
        category!="{panel.category}"
        quote!="{panel.quote}"
        imageSlug!="{panel.imageSlug}"
        name!="{panel.name}"
        title!="{panel.title}"
        companyName!="{panel.companyName}"
        companyUrl!="{panel.companyUrl}"
        )





  //- single testimonial: test
  //-.flex.w-100.justify-center.items-center.pb-96
   // +each("testimonials as testimonial")
      //Testimonial("{...testimonial}")
</template>