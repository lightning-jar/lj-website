<script lang='ts'>

  //components
  import TextHeading from "$a/TextHeading.svelte";
  import SectionDark from "$m/SectionDark.svelte";
  import TileServices from "$m/TileServices.svelte";

  const tiles = [
    {
      heading: "Web Design & Development",
      iconSlug: "icon-web-design",
      text: "Our process-driven approach to web design and development is engineered to help your organization quickly strategize, prioritize, and execute digital experiences that matter to customers."
    },
    {
      heading: "Custom Software & Apps",
      iconSlug: "icon-custom-software",
      text: "Non-software companies with great ideas on how to digitize their services or solutions, or solve a business challenge through custom software often need help turning their vision into reality. That\'s where we come in."
    },
    {
      heading: "eCommerce, PIM, MDM",
      iconSlug: "icon-ecommerce",
      text: `Our technology studio specializes in PIM, DAM, MDM implementations and eCommerce transformations leveraging the <a href="/blog/what-is-pimcore" class="text-underline">power of Pimcore</a> -- the world's most flexible and powerful unified digital platform.`
    },
    {
      heading: "Kiosks & In-Store Experiences",
      iconSlug: "icon-kiosk",
      text: "Customer experience and user experience intersect at the in-store Kiosk. Whether it's an in-room directory at a four star hotel, or a food-ordering system for a cafe, these projects demand excellence in user interface design and execution -- that's what we do."
    },
    {
      heading: "Sales & Pricing Tools",
      iconSlug: "icon-sales-tools",
      text: "What are the challenges and friction points slowing down your sales team or agents in the call center? Too often the sales organization is the last to benefit from digital transformations -- ask yourself what happens if you turn that equation around?"
    },
    {
      heading: "UX Optimization",
      iconSlug: "icon-ux",
      text: "There's a big gap between usability and great user experience. Our user experience team can help you push beyond interfaces that simply work to best-in-class experiences that increase affinity, encourage sales and encourage customer loyalty."
    }
  ]

</script>

<template lang='pug'>

SectionDark(id!="{'services'}")
  .text-center.mt-20.mb-20
    TextHeading(classes!="{''}") Digital Services

  // tiles grid
  .gap-8.grid-cols-2.mb-20(class="md:grid lg:grid-cols-3 ")
    +each('tiles as tile')
      TileServices("{...tile}")

</template>