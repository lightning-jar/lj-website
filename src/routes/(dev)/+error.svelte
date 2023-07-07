<!-- <script context="module">

  // graphQl
  import { GraphQLClient } from 'graphql-request';

  //settings
  import { graphCMSEndpoint } from '../settings/apiSettings';
  import { footerQuery } from '../settings/querySettings';

  export async function load() {
    const graphcms = new GraphQLClient(graphCMSEndpoint, { headers: {} });
    const footerData = await graphcms.request(footerQuery);

    return {
      props: {
        footerData
        }
      }
    }
</script> -->

<script lang="ts">
	// components

	//import AboutHeader from "$components/AboutHeader.svelte";
	//import GlobalNav from "$components/GlobalNav.svelte";
	//import GlobalFooterStatic from "$components/GlobalFooterStatic.svelte";

	// variables
	//export let globalNavEl: HTMLHeadElement | null = null;
	//export let mainNav: HTMLDivElement | null = null;
</script>

<template lang="pug">
	div error
	//GlobalNav(
		bind:globalNav!="{globalNavEl}"
		bind:mainNav!="{mainNav}"
		)

	//AboutHeader {'404 Error'}
		svelte:fragment(slot="subheading") The page you requested could not be found.

	//GlobalFooterStatic
</template>
