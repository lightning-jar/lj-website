<script lang="ts">
import HomeBanner from "$components/HomeBanner.svelte";
import HomeLatestArticles from "$components/HomeLatestArticles.svelte";
import HomeLatestStories from "$components/HomeLatestStories.svelte";

// props
let { data } = $props();
</script>

<div>
	<!-- ticker hidden for now: pass ticker={data.ticker} to bring it back -->
	<HomeBanner topics={data.topics} />
	<HomeLatestArticles articles={data.latestArticles} />
	<HomeLatestStories stories={data.latestStories} />
</div>
