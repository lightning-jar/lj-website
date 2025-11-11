export function toCamelCase(string: string): string {
	return string
		.replace(/[^a-z0-9]/gi, " ")
		.toLowerCase()
		.split(" ")
		.map((el, ind) =>
			ind === 0 ? el : el[0].toUpperCase() + el.substring(1, el.length),
		)
		.join("");
}