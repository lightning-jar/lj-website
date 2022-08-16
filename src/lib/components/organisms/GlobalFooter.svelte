<script lang="ts">

  // components
  import FooterHeading from "$a/FooterHeading.svelte";
  import FooterLink from "$a/FooterLink.svelte";
  import FooterText from "$a/FooterText.svelte";
  import FooterLegalLink from "$a/FooterLegalLink.svelte";
  import FooterLegalText from "$a/FooterLegalText.svelte";
  import NavLogoBlock from "$m/NavLogoBlock.svelte";
  import PimcoreBadge from "$a/PimcoreBadge.svelte";
  import TextHeading from "$a/TextHeading.svelte";


  // components
  import PictureStack from "$a/PictureStack.svelte";

  // variables
  const image = {
    alt:"Lightning Jar logo",
    breakpoints: [['']],
    classes:"block",
    fallback: "pimcore-gold-partner.png",
    folder: "images",
    height:"120",
    loading: "lazy",
    slugCommon: "pimcore-gold-partner",
    sourceFormats: ['svg'],
    preload: [],
    width:"100",
  }

  // types
  //import type { Footer } from "$types/footerTypes";
  //import type { LinkList } from "$types/linkTypes";

  // settings
  import { pageXPadding } from "$settings/paddingSettings";

  // props
  //export let footerData: Record<'footer', Footer>;

  // variables
  //const footerContent: Footer = footerData.footer;
  //const footerLinks: LinkList[] = footerContent.linkLists;
  //const legalLinks: LinkList[] = footerContent.legalLinks;
  //const copyright: string = footerContent.copyright;

</script>

<template lang="pug">
footer(class!="{pageXPadding + ' text-white font-serif '}")

  //- upper
  .mt-16(class="md:grid grid-cols-2 gap-16")

    //- col 1: logo & messaging
    div.max-w-sm
      .mb-6
        NavLogoBlock

      .mb-6
      FooterHeading(classes!="{'!text-maximumYellow'}")
        | Helping business thrive in a world that is more digital &amp; mobile every day.

      .mb-20
        FooterText
          | For over 20 years Lightning Jar has provided premium digital strategy, design and technology services to national and international business clients.

      //- badge
      .w-20.mb-20
        PimcoreBadge(href!="{'/blog/what-is-pimcore'}")

    //- col:2 links
    div.mt-14
      .mb-8
        FooterHeading Contact
        FooterLink(href!="{'mailto:hey@lightningjar.com'}") hey@lightningjar.com

      .mb-8
        FooterHeading Headquarters
        FooterText 230 S Broad Street
        FooterText Philadelphia, PA 19102

      .mb-24
        FooterHeading More
        FooterLink(href!="{'https://pugify.dev/'}") HTML to Pug Converter

  .mb-4.flex
    FooterLegalLink(href="/legal/privacy" classes="mr-4") Privacy Policy
    FooterLegalLink(href="/legal/terms" classes="mr-4") Terms

  .mb-36
    FooterLegalText &copy; Copyright 2022 SiiTE Interactive LLC dba Lightning Jar.




</template>