// guidance from https://navillus.dev/blog/json-ld-in-sveltekit

// import schema.org type definitions
import type { Organization, WithContext } from "schema-dts";

// create interface using type definitions
export type Schema = Organization | WithContext<Organization>;

// structured data for Lightning Jar
export const LjSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	"name": "Lightning Jar",
	"disambiguatingDescription": "Digital Agency",
	"description":
		"A digital agency that builds websites, apps, custom-software and eCommerce solutions for national and international business clients.",
	"knowsAbout": "Pimcore",
	"logo": "https://lightningjar.com/lj-favicon.svg",
	"url": "https://lightningjar.com",
	"email": "hey@lightningjar.com",
	"telephone": "(215) 995-6628",
	"location": {
		"@type": "Place",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "230 S Broad St",
			"addressLocality": "Philadelphia",
			"addressRegion": "PA",
			"postalCode": "19102",
		},
	},
	"areaServed": {
		"@type": "Country",
		"name:": "United States",
	},
	"hasOfferCatalog": {
		"@type": "OfferCatalog",
		"name": "Digital Agency Services",
		"itemListElement": [
			{
				"@type": "OfferCatalog",
				"name": "Web Technology Services",
				"itemListElement": [
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Website Development",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Mobile App Development",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "eCommerce Development",
						},
					},
				],
			},
			{
				"@type": "OfferCatalog",
				"name": "Pimcore Services",
				"itemListElement": [
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Pimcore Consulting",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Pimcore Development",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Pimcore Support",
						},
					},
				],
			},
			{
				"@type": "OfferCatalog",
				"name": "Digital Design",
				"itemListElement": [
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "UX Optimization",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "UI Design",
						},
					},
					{
						"@type": "Offer",
						"itemOffered": {
							"@type": "Service",
							"name": "Digital Content",
						},
					},
				],
			},
		],
	},
	"foundingDate": "12/30/2002",
	"foundingLocation": "New York",
	"naics": "541511",
	"duns": "191355317",
	"slogan": "The world is more digital & more mobile every day.",
	"memberOf": "Pimcore Gold Partner Program",
	"legalName": "SiiTE Interactive LLC dba Lightning Jar",
	"alternateName": "SiiTE Interactive",
	"numberOfEmployees": 12,
};

// function to render structured data on the page -- see 'StructuredData.svelte' component
export function serializeSchema(schema: Schema) {
	return `<script type="application/ld+json">${JSON.stringify(
		schema,
		null,
		2,
	)}</script>`;
}
