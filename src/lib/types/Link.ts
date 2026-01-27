import type { HTMLAnchorAttributes } from "svelte/elements";

export interface Link extends HTMLAnchorAttributes {
	"data-text"?: string;
}
