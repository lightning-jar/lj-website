<script lang="ts">
	// props
	let { type = "", srcset = "", media = "" } = $props();

</script>


<source
	{media}
	{srcset}
	{type}
/>

