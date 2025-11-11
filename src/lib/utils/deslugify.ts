export function deslugify(string: string):string {
	return string.replace(/-/g, " ");
}