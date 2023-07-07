// slugify
export const slugify = (string: string) =>
	string.replace(/ /g, "-").toLowerCase();

// parse markdown
export function parseMarkdown(string: string) {
	const sp = '<p class="mb-4">';
	const ep = "</p>";
	let output: string = sp;
	output += string.replace(/\n/g, `${ep}${sp}`);
	output += ep;
	return output;
}

// parse rich text
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

// format enumerator
// e.g. "Crude_Tall_Oil" => "Crude Tall Oil"
export const formatEnumerator = (string: string) => string.replace(/_/g, " ");

// cspell: disable-next-line
export const underscorify = (string: string) => string.replace(/\s/gi, "_");

// toCamelCase
export function toCamelCase(string: string) {
	return string
		.replace(/[^a-z0-9]/gi, " ")
		.toLowerCase()
		.split(" ")
		.map((el, ind) =>
			ind === 0 ? el : el[0].toUpperCase() + el.substring(1, el.length),
		)
		.join("");
}

// deslugify
export const deslugify = (string: string) => string.replace(/-/g, " ");
