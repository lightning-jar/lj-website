

<script lang="ts">

  // components
  import NavLogoBlock from "$m/NavLogoBlock.svelte";

  // types
  import type { Footer } from "$types/footerTypes";
  import type { LinkList } from "$types/linkTypes";

  // settings
  import { pageXPadding } from "$settings/paddingSettings";

  // props
  export let footerData: Record<'footer', Footer>;

  // variables
  const footerContent: Footer = footerData.footer;
  const footerLinks: LinkList[] = footerContent.linkLists;
  const legalLinks: LinkList[] = footerContent.legalLinks;
  const copyright: string = footerContent.copyright;

</script>

<template lang="pug">
footer.bg-dark.text-white.pt-16.relative.justify-self-end.mt-auto(class!="{pageXPadding}")

  //- upper footer
  div

    //- list links
    .grid.grid-cols-1.mb-12(class="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5")
      +each('footerLinks as list')
        .mb-8
          .font-medium.text-md.mb-4.text-white(class="xl:text-sub") {list.heading}
          ul.list-none
            +each('list.listItems as li')
              li.mb-2(class="xl:mb-1")
                a.bg-opacity-100.cursor-pointer.text-white.text-opacity-70.transition-all.underline-offset-4.outline-none(
                  class="hover:text-opacity-100 hover:underline focus:underline xl:text-sm"
                  title!="{li.toolTip}"
                  href!="{(li.url) ? li.url : '/' + li.slug}"
                  ) {li.label}

  //- lower footer
  div.py-12.border-t.border-t-white.border-opacity-40

    //- legal links
    .mb-4.flex
      +each('legalLinks[0].listItems as link')
        a.text-sm.mr-4.text-white.text-opacity-70.cursor-pointer.underline-offset-4.transition-all.underline.underline-offset-4.outline-none.transition-colors(
          href!="{(link.url) ? link.url : '/' + link.slug}"
          title!="{link.toolTip}"
          class="decoration-[#fff]/10 hover:text-opacity-100  hover:decoration-white focus:decoration-white xl:text-xs"
          ) {link.label}

    div.justify-between(class="sm:flex")
      //- copyright
      .mb-12.mr-2.text-xs.text-white.text-opacity-60(class="sm:mb-4 xl:text-xxs") {@html copyright}

      //- credits
      a.text-xs.text-white.text-opacity-60.transition-colors.outline-none(
        href="https://lightningjar.com"
        title="checkout Lightning Jar digital studio"
        class="hover:text-accent hover:text-opacity-100 focus:underline focus:text-accent underline-offset-4 xl:text-xxs"
        ) website by ⚡️ Lightning Jar

</template>