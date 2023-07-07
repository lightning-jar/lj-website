export function inertElements(array: HTMLElement[]) {
	array.forEach((link: HTMLElement) => {
		link.setAttribute("inert", "");
	});
}
export function unInertElements(array: HTMLElement[]) {
	array.forEach((link: HTMLElement) => {
		link.removeAttribute("inert");
	});
}
