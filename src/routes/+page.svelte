<script lang="ts">
import HomeBanner from "$components/HomeBanner.svelte";

// props
let { data } = $props();
</script>

<HomeBanner topics={data.topics} ticker={data.ticker} />
