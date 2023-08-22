// types
type SourceUrl = string;
type TargetUrl = string;
type Redirect = [SourceUrl, TargetUrl];

// redirects
export const redirects: Redirect[] = [
	// test
	["/test", "/test/test"],
];
