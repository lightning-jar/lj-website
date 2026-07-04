<script lang="ts">
import HomeBanner from "$components/HomeBanner.svelte";
import HomeLatestArticles from "$components/HomeLatestArticles.svelte";

// props
let { data } = $props();
</script>

<div>
	<HomeBanner topics={data.topics} ticker={data.ticker} />
	<HomeLatestArticles articles={data.latestArticles} />
</div>
