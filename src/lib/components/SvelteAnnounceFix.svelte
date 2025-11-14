<script lang="ts">
import type { Attachment } from 'svelte/attachments';

const onLoad: Attachment = (_el) => {
	// intercept innerHTML invocation
	// to catch svelte-announcer being created and strip inline style
	// to prevent CSP violation
	// note: styles are re-added in css -- see uno.css config

	// set up
	const originalInnerHTML = Object.getOwnPropertyDescriptor(
		Element.prototype,
		"innerHTML",
	);
	Object.defineProperty(Element.prototype, "innerHTML", {
		set(value: unknown) {
			if (
				value &&
				typeof value === "string" &&
				value.includes('id="svelte-announcer"')
			) {
				const safeValue = value.replace(/style=".*?"/i, "");
				originalInnerHTML?.set?.call(this, safeValue);
			} else {
				originalInnerHTML?.set?.call(this, value);
			}
		},
	});

		return () => {

		};
	};
	</script>

	<div id="hack" {@attach onLoad} class="hidden">hack</div>