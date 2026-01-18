import { Window } from "happy-dom";

const window = new Window();

Object.assign(globalThis, {
	window,
	document: window.document,
	Node: window.Node,
	Element: window.Element,
	HTMLElement: window.HTMLElement,
	// Optional: add any other DOM classes you need
});
