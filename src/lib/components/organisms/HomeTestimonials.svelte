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
    },
    {
      category: "Sales Tools, PIM, Ecommerce, Mobile Apps",
      quote: 'Their technology team was my <span class="underline-heading">secret weapon</span> ...they helped me execute big ideas.',
      imageSlug: "frank-r-testimonial",
      name: "Frank Roth",
      title: "Former CMO",
      companyName: "United Rentals / BlueLine",
      companyUrl: "https://unitedrentals.com/"
    },
    {
      category: "Marketing Strategy & Brand Strategy",
      quote: 'LJ helped us <span class="underline-heading">focus and clarify</span> our brand vision during exponential growth.',
      imageSlug: "elizabeth-g-testimonial",
      name: "Elizabeth Grojean",
      title: "CEO & Founder",
      companyName: "Baloo Living",
      companyUrl: "https://balooliving.com/"
    },
    {
      category: "SAAS / Remote Solutions",
      quote: 'They helped us <span class="underline-heading">speed to launch</span> with our flagship remote SaaS soluton.',
      imageSlug: "duane-v-testimonial",
      name: "Dr. Duane Varan",
      title: "CEO & Founder",
      companyName: "Media Science / Hark",
      companyUrl: "https://harkconnect.com/"
    },
    {
      category: "In-Store Experience / Kiosks / Tablet Apps",
      quote: 'Our in-store app project was foundering... until LJ <span class="underline-heading">saved the day</span>.',
      imageSlug: "mubashir-m-testimonial",
      name: "Mubashir Memon",
      title: "Senior Product Manager",
      companyName: "Northgate Markets / Prospera",
      companyUrl: "https://prospera.northgatemarket.com/"
    }
  ]

</script>

<template lang="pug">
SectionFullBleed(id!="{'testimonials'}")

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





</template>