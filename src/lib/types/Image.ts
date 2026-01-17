export interface Image {
	[key: string]: unknown;
	alt?: string | null;
	class?: string | null;
	height?: string | number | null;
	loading?: "eager" | "lazy" | null;
	mimeType?: string | null;
	src?: string | null;
	url?: string | null;
	width?: string | number | null;
}
