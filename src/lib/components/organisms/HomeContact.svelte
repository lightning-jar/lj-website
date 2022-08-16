<script lang='ts'>

  //components
  import TextHeading from "$a/TextHeading.svelte";
  import TextParagraphLG from "$a/TextParagraphLG.svelte";
  import SectionLight from "$m/SectionLight.svelte";
  import ShapeSquiggly from "$a/ShapeSquiggly.svelte";
  import ButtonLink from "$a/ButtonLink.svelte";

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

SectionLight(id!="{'services'}" classes="relative bg-[#F6F7F9] flex items-center justify-center h-screen max-h-[960px] text-center text-oxfordBlueLight")
  div(class="px-4 max-w-[860px]")
    //- label
    div.uppercase.font-bold.opacity-80(class="lg:text-lg") Get In Touch

    //- heading
    TextHeading(classes="mt-8 mb-12 text-oxfordBlueLight text-6xl lg:text-[6rem] xl:text-[8vw]") How Can We Help?

    //- text
    TextParagraphLG Drop us a line. We'd love to hear about the challenges you're facing or the big idea you have to transform your organization, website, app, in-store-experience, or product data workflow.

    //- button
    ButtonLink(href!="{'mailto:hey@lightningjar.com'}")
      | Let's Talk

  //- graphic
  .absolute.bottom-0.right-0(class="w-[40%] max-w-[260px]")
    ShapeSquiggly

</template>