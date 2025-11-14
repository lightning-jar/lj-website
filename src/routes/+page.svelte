<script lang="ts">
  import HomeBanner from "$components/HomeBanner.svelte";

  // props
  let { data } = $props();
</script>

<HomeBanner headline={data.headline} text={data.text} ticker={data.ticker} />
