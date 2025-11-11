export function parseRichText(string: string) {
	let output = string;

	//- add margins below paragraph
	output = output.replace(/<p>/gi, '<p class="mb-4">');

	//- convert all headings to h3 headings
	output = output.replace(
		/<h[0-9]>/gi,
		'<h3 class="mb-2 font-medium text-lg">',
	);

	//- style anchor tags
	output = output.replace(
		/<a/gi,
		'<a class="underline underline-offset-4 hover:text-primary-dark outline-none focus:text-primary-dark focus:decoration-primary-dark transition-all"',
	);

	//- replace <strong> transform-gpu
	output = output.replace(/<strong>/gi, '<div class="font-semibold">');
	output = output.replace(/<\/strong>/gi, "</div>");

	//- remove extraneous non-breaking spaces
	output = output.replace(/\s{2,}/gi, " ");

	return output;
}