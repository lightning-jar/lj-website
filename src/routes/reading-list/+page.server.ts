// types

import type { Article } from "$types/Article";
import type { Banner } from "$types/Banner";
import type { PageMeta } from "$types/PageMeta";

// data
import { allReadingListArticles } from "$content/getters/getReadingList";
import { default as landing } from "$content/landing-pages/reading-list.json";

const banner: Banner = landing.banner;
const meta: PageMeta = landing.meta;

export function load(): {
	banner: Banner;
	meta: PageMeta;
	articles: Article[];
} {
	return {
		articles: allReadingListArticles,
		banner,
		meta,
	};
}
