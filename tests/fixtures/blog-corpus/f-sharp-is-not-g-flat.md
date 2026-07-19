---
title: "F♯ Is Not G♭: Music Theory as a Data-Modeling Problem"
metaTitle: "F♯ Is Not G♭ | Music Theory as a Data-Modeling Problem"
slug: f-sharp-is-not-g-flat
description: "On a piano they are the same key, and in our chord player they are the same frequency. But the moment our circle-of-fifths instrument had to display chord names, the same pitch needed different names in different keys, and a bug report taught us the difference between what a note is and what a note is called. A short essay on encoding domain rules in data and unit tests, from the smallest codebase we maintain."
date: 2026-07-12T18:00:00Z
draft: false
tags: [music, typescript, testing, open-source, side-projects]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/sheet-music.webp
imageDescription: A watercolor painting of handwritten sheet music
author: Kevin Peckham
quote:
  text: The frequency is a fact about physics. The spelling is a fact about the reader. Modeling them as one value is how you get a bug you can hear but not see.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Enharmonic equivalents
    definition: "Two note names that refer to the same pitch, like F♯ and G♭. On a piano they are the same key; in written music they are different names with different meanings depending on the key."
  - term: Circle of fifths
    definition: "A diagram arranging the twelve keys so each step clockwise is a perfect fifth higher. Neighbors share most of their notes, which is why the circle is a songwriter's map of what will sound good together."
  - term: Key signature
    definition: "The set of sharps or flats a key carries. Sharp keys (G, D, A, E, B, F♯, C♯) spell their accidentals as sharps; flat keys (F, B♭, E♭, A♭, D♭, G♭) spell them as flats."
  - term: Equal temperament
    definition: "The modern tuning system that divides an octave into twelve equal steps, so every semitone has the same frequency ratio: the twelfth root of two."
additionalReading:
  - title: "The Browser Is an Instrument"
    url: "/blog/the-browser-is-an-instrument"
  - title: "Fifths, the app this essay is about"
    url: "https://www.fifths.app"
  - title: "chord-player on GitHub"
    url: "https://github.com/kevinpeckham/chord-player"
  - title: "Fun: side projects from the studio"
    url: "/fun"
---

[Fifths](https://www.fifths.app) is a side project of ours: an [open-source](https://github.com/kevinpeckham/chord-player) instrument that plays chords through a circle-of-fifths interface. Click a wedge of the circle and you hear the chord. Rotate the circle and any key moves to twelve o'clock. It is a toy, in the best sense, and like most toys it taught us something we did not expect to learn: a lesson about data modeling that we have since applied to systems far from music.

The lesson starts with a piano key. The black key between F and G is one physical key, one string, one frequency. But it has two names: F♯ and G♭. Which name is correct depends entirely on what key the music is in. In the key of D, that pitch is F♯, because D major's scale spells it that way. In the key of D♭, the same pitch is G♭. Write the wrong name on a score and every musician who reads it will wince: the note sounds right and reads wrong.

Naive code does not know any of this.

## The bug you can hear but not see

The first version of the chord player treated a note as one thing: a pitch. And for playback, that is completely correct. Our frequency generator is pure physics, equal temperament from a 440 Hz anchor:

```ts
const A4_FREQUENCY = 440; // Hz
const TWELFTH_ROOT_OF_TWO = 2 ** (1 / 12);
```

Every note's frequency is the anchor multiplied by that ratio raised to the right number of semitones. The math does not care whether you call the pitch F♯ or G♭; it produces 369.99 Hz either way, and the speaker cannot tell the difference. If your instrument never displayed a note name, you could ship this and be done.

Ours displays note names on every wedge of the circle. And the moment you rotate the key center, the naive model falls apart. With the circle centered on A (a sharp key), the wedge two steps clockwise should read C♯. Rotate the center to F (a flat key) and a nearby wedge holding the very same pitch class should now read D♭. Same pitch, same frequency, different correct name. A note, it turns out, is not one thing. It is a pitch plus a spelling, and the spelling is a function of context.

## The domain rule, as data

The fix is small, and its smallness is the point. Music notation has a rule every first-year theory student learns: sharp keys spell with sharps, flat keys spell with flats. That rule became a seven-element array:

```ts
// Keys that prefer sharps; all others (F, Bb, Eb, Ab, Db, Gb) prefer flats
const SHARP_KEYS = ["G", "D", "A", "E", "B", "F#", "C#"];
```

The enharmonic pairs became a lookup table, ten pitch classes and their mirror names, majors and minors:

```ts
const ENHARMONIC_MAP: Record<string, string> = {
	"C♯": "D♭",
	"D♭": "C♯",
	"F♯": "G♭",
	"G♭": "F♯",
	// ...and so on, including the minor chords
};
```

And the correction became one function: given a chord name and the current key center, return the spelling that key prefers. If the name has no enharmonic twin (C is just C), pass it through. If it already uses the preferred accidental, keep it. Otherwise, swap it for its mirror.

One decision in that function is worth pausing on, because it is the kind of decision data modeling always forces. The key of C has no sharps and no flats, so the rule gives no answer for it. Which spelling should the wedges around C use? We chose flats, purely for readability, and we wrote the choice down in a comment: "C can go either way, but we'll default to flats." That is a design decision masquerading as a technical one, and putting it in code made us make it once, on purpose, instead of many times by accident.

## Two maps, because there are two questions

Here is the wrinkle that makes this a data-modeling essay and not a music lesson. The codebase ended up with two enharmonic maps, and that is not a mistake.

The display layer's map, shown above, uses the real typographic symbols, ♯ and ♭, because its output goes in front of human eyes. The frequency generator has its own, smaller map, in plain ASCII:

```ts
const ENHARMONIC_MAP: Record<string, string> = {
	Db: "C#",
	Eb: "D#",
	Gb: "F#",
	Ab: "G#",
	Bb: "A#",
};
```

This one answers a different question. It does not care what the reader should see; it normalizes any incoming spelling to a canonical pitch class so the physics can proceed. One direction only, flats to sharps, because canonicalization needs one answer, not a preference.

So the same musical fact, "these two names share a pitch," appears twice, shaped differently for each consumer: a bidirectional, context-sensitive map for display, and a one-way normalization map for math. The pitch is a fact about physics. The spelling is a fact about the reader. The canonical id is a fact about the program. Three representations of one note, and the code got simpler, not more complicated, when we stopped pretending they were the same thing. We see this everywhere now: the customer's name as legal record versus display string, the timestamp as instant versus wall-clock rendering, the [document node as stable id versus visible label](/blog/stable-ids-are-all-you-need).

## The tests are the theory book

Because the rule is data plus one pure function, testing it is almost embarrassingly direct. The test file reads like a theory quiz:

```ts
it("converts flat names to sharps in sharp keys", () => {
	expect(getEnharmonicChordName("D♭", "A")).toBe("C♯");
	expect(getEnharmonicChordName("G♭", "G")).toBe("F♯");
});

it("converts sharp names to flats in flat keys", () => {
	expect(getEnharmonicChordName("C♯", "F")).toBe("D♭");
	expect(getEnharmonicChordName("F♯m", "Bb")).toBe("G♭m");
});

it("defaults C to flats", () => {
	expect(prefersSharp("C")).toBe(false);
});
```

Every rule from the theory book has a corresponding assertion, including the C-defaults-to-flats judgment call, so the decision we made once on purpose can never be unmade by accident. This is the same conviction that runs through [our benchmark work](/research/barkup-bench), where the rule is that graders get unit tests: when a correctness rule lives in your head, it is an opinion; when it lives in a test file, it is a specification.

None of this needed a music theory library, a dependency, or a clever abstraction. It needed the domain's actual rules written down as data, one function that applies them, and tests that quote the textbook. That is usually what data modeling comes down to: noticing that a thing your code treats as one value is actually two or three, and giving each one a home.

The instrument is free and open source. [Go play a G♭](https://www.fifths.app). Or an F♯, depending on where you are standing.
