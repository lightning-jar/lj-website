export function buildMetaTitle(metaKeywords: string[]) {
	const mk = metaKeywords;
	let string = "";

	mk.forEach((kw) => {
		string += kw;
		if (mk.indexOf(kw) != mk.length - 1) {
			string += " | ";
		}
	});

	//string += ' | ' + 'Lightning Jar';

	return string;
}
