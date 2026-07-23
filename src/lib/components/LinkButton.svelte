<script lang="ts">
import type { Snippet } from "svelte";
import type { Link } from "$types/Link";

import * as sfx from "$lib/sfx";

interface Props {
	/** Base button shortcut; swap for e.g. "button-small". */
	base?: string;
	children?: Snippet | null;
	classes?: string;
	link: Link;
	onclick?: (e: MouseEvent) => void;
}

let {
	base = "button",
	children,
	classes = "",
	link,
	onclick,
}: Props = $props();
</script>

<a
  href={link?.href ?? null}
  rel={link.rel ?? null}
  target={link.target ?? null}
  title={link.title ?? null}
  class="{base} {classes || ''}"
  onmouseenter={(e) => {
    sfx.play("click");
    if (onclick) {
      onclick(e);
    }
  }}
  onclick={(e) => {
    sfx.play("click");
    if (onclick) {
      onclick(e);
    }
  }}
>
  <!-- children -->
  {@render children?.()}
</a>
