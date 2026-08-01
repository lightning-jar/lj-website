<script lang="ts">
import HomeBanner from "$components/HomeBanner.svelte";
import HomeFeaturedContent from "$components/HomeFeaturedContent.svelte";
import HomeLatestArticles from "$components/HomeLatestArticles.svelte";
import HomeLatestReadingList from "$components/HomeLatestReadingList.svelte";
import HomeLatestResearch from "$components/HomeLatestResearch.svelte";
import HomeLatestStories from "$components/HomeLatestStories.svelte";
import HomeWhatWeDo from "$components/HomeWhatWeDo.svelte";

// props
let { data } = $props();
</script>

<main id="main">
	<!-- ticker hidden for now: pass ticker={data.ticker} to bring it back -->
	<HomeBanner topics={data.topics} />
	<HomeWhatWeDo />
	<HomeFeaturedContent />
	<HomeLatestArticles articles={data.latestArticles} />
	<HomeLatestStories stories={data.latestStories} />
	<HomeLatestResearch studies={data.latestStudies} />
	<HomeLatestReadingList entries={data.latestReading} />
</main>
