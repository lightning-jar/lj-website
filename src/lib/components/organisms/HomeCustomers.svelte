<script lang='ts'>

  //components
  import TextHeading from "$a/TextHeading.svelte";
  import SectionDark from "$m/SectionDark.svelte";
  import TileCustomer from "$m/TileCustomer.svelte";

  const customers = [
    {
      imageAlt: 'Old Fashioned cocktail',
      imageSlug: 'beam-alt',
      logoAlt: 'Beam Suntory logo',
      logoSlug: 'beam-logo',
      text: 'Beam Suntory found a single source of truth for marketing data with Pimcore.',
      url: 'https://pimcore.com/en/customers/suntory-group_c132768'
      },
    {
      imageAlt: 'Construction superintendent',
      imageSlug: 'blueline-tile',
      logoAlt: 'Blueline Rental Logo',
      logoSlug: 'blueline-logo',
      text: 'Blueline Rental transforms customer experience and product data management with the power of Pimcore.',
      url: 'https://pimcore.com/en/customers/united-rentals-inc_c7709'
      },
    {
      imageAlt: 'Woman wrapped in weighted blanket',
      imageSlug: 'baloo-blankets',
      logoAlt: 'Baloo Living Logo',
      logoSlug: 'baloo-logo',
      text: 'We helped Baloo Living founder Elizabeth Grojean find her brand voice and refine her brand strategy.',
      url: 'https://www.thestartupstory.co/episodes/elizabeth-grojean-founder-of-baloo-living'
      },
    {
      imageAlt: 'Couple working on home improvement project',
      imageSlug: 'build-direct-tile',
      logoAlt: 'Build Direct logo',
      logoSlug: 'build-direct-logo',
      text: 'BuildDirect automates product data and creates a supplier-side portal for manufacturers.',
      url: 'https://pimcore.com/en/customers/builddirect_c666'
      }
    ]

    function hoverOnTile(e) {
      const customerTiles = document.querySelectorAll('[data-customerTile]')
      customerTiles.forEach(tile => {
        tile.classList.add('opacity-40')
      })
      e.target.firstElementChild.classList.remove('opacity-40');
    }

    function hoverOffTile(e) {
      const customerTiles = document.querySelectorAll('[data-customerTile]')
      customerTiles.forEach(tile => {
        tile.classList.remove('opacity-40')
      })
    }



</script>

<template lang='pug'>

SectionDark(
  id!="{'clients'}"
  classes!="{'py-24'}"
  )

  //- heading
  .text-center.mt-20.mb-20.grid-cols-5.gap-8(class="md:grid md:text-left lg:grid-cols-9")
    .col-span-2.mb-4(class="md:mb-0 lg:col-span-4")
      TextHeading(classes!="{'mb-0'}") Every client has unique challenges to solve.
    .col-span-3.flex(class="lg:col-span-5 items-end")
      p.prose-lg Doing what we do, we get to meet a lot of different people from very different industries. Each day we get to learn something new, think about something we've never considered before. There's true pleasure for us in confronting and solving novel problems.

  //- tiles grid
  .gap-8.grid-cols-2.mb-20(class="sm:grid md:grid-cols-3 lg:grid-cols-4")
    +each('customers as customer')
      div(
        on:mouseenter|stopPropagation!="{hoverOnTile}"
        on:mouseleave|stopPropagation!="{hoverOffTile}"
        )
        TileCustomer("{...customer}")

</template>