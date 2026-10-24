<script lang="ts">
import HomeBanner from "#lib/components/HomeBanner.svelte";
import HomeFeaturedContent from "#lib/components/HomeFeaturedContent.svelte";
import HomeLatestArticles from "#lib/components/HomeLatestArticles.svelte";
import HomeLatestReadingList from "#lib/components/HomeLatestReadingList.svelte";
import HomeLatestResearch from "#lib/components/HomeLatestResearch.svelte";
import HomeLatestStories from "#lib/components/HomeLatestStories.svelte";
import HomeWhatWeDo from "#lib/components/HomeWhatWeDo.svelte";

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
