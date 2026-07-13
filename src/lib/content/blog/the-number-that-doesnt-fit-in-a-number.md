---
title: "The Number That Doesn't Fit in a Number: What a Kindergartner's Question Taught Us About Types"
metaTitle: "The Number That Doesn't Fit in a Number | Numberoo"
slug: the-number-that-doesnt-fit-in-a-number
description: "When our principal's son came home from kindergarten fascinated by how big numbers could get, we built him Numberoo: type any number up to a googol and it names it in English, out loud. The catch is that a googol does not fit in a JavaScript number, and the fix is the whole lesson: the app never parses your input at all. The digit string is the data structure. A short essay on picking the representation the problem actually wants, from a 157-line engine with 157 lines of tests."
date: 2026-07-12T22:00:00Z
draft: false
tags: [javascript, typescript, testing, open-source, side-projects, kids]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/calculator.webp
imageDescription: A watercolor painting of a calculator
author: Kevin Peckham
quote:
  text: The bug was never in the arithmetic, because there is no arithmetic. The moment you refuse to convert the string, an entire class of impossible-precision problems stops existing.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Googol
    definition: "The number 10^100: a one followed by one hundred zeros. Coined in 1920 by a nine-year-old, which feels right for this story."
  - term: Float64 (double precision)
    definition: "The 64-bit floating-point format behind every JavaScript number. It spends 52 bits on precision, which is why it can only represent integers exactly up to 2^53."
  - term: MAX_SAFE_INTEGER
    definition: "JavaScript's name for 2^53 minus 1, or 9,007,199,254,740,991. Above it, integers start silently rounding to their nearest representable neighbor."
  - term: BigInt
    definition: "JavaScript's arbitrary-precision integer type. It can hold a googol easily, but it cannot hold leading zeros or a half-typed input, which is why Numberoo does not use it either."
  - term: Short scale
    definition: "The naming system English uses for large numbers, where each new -illion is a thousand times the last: million, billion, trillion, and onward to duotrigintillion at 10^99."
additionalReading:
  - title: "Numberoo, the toy itself"
    url: "https://www.numberoo.dev"
  - title: "numberoo on GitHub"
    url: "https://github.com/kevinpeckham/numberoo"
  - title: "F♯ Is Not G♭: Music Theory as a Data-Modeling Problem"
    url: "/blog/f-sharp-is-not-g-flat"
  - title: "Fun: side projects from the studio"
    url: "/fun"
---

My son Leo came home from kindergarten with a question that has launched a thousand mathematicians: how big can numbers get? He had just learned about a googol, a one followed by a hundred zeros, and he wanted to see it. Not hear about it. See it, and hear its name said out loud, and then change one digit and hear the new name.

So we built him [Numberoo](https://www.numberoo.dev), a toy that does exactly that: type digits, and the page names the number in English, up to one googol, and reads it to you if you press the button. It is the smallest [open-source project we maintain](https://github.com/kevinpeckham/numberoo), a single page and a single utility module. It is also, quietly, the best small lesson in choosing data representations that we have shipped all year, because of one fact:

A googol does not fit in a JavaScript number.

## Nine quadrillion, and then lies

Every number in JavaScript is a float64: sixty-four bits, fifty-two of them for precision. That budget represents integers exactly up to 2^53, which is 9,007,199,254,740,992. Nine quadrillion and change. The language even names the boundary for you: `Number.MAX_SAFE_INTEGER`.

Past it, integers do not error. They round, silently, to the nearest value the format can hold. `9007199254740993` becomes `9007199254740992` without a whisper of complaint. For a toy whose entire purpose is naming the number you typed, that is disqualifying roughly ninety digits before the destination. A kindergartner asking about a googol has, without knowing it, asked a question his father's programming language cannot represent the answer to.

The obvious fix is `BigInt`, JavaScript's arbitrary-precision integer. It would hold a googol without breaking a sweat. But watch what a naming toy actually receives: a half-typed `"00"`, a pasted `"1,000,000"` with commas, a small hand leaning on the zero key. `BigInt` cannot hold leading zeros (they are meaningless to an integer, but they are on the screen), cannot hold commas, and turning each keystroke into a parse-validate-convert pipeline buys you nothing, because Numberoo never does arithmetic. It never adds, compares, or increments. It only ever needs to look at the digits.

So the engine refuses to convert at all. The input is a string of digits, and the string is the data structure.

## Naming by triplets

Once you commit to the string, the algorithm becomes almost mechanical, because English big-number names are themselves organized around digit strings. Scrub the input to bare digits (capped at 101 of them, exactly a googol's worth). Strip leading zeros. Pad the front so the length divides by three. Split into triplets. Name each triplet with the vocabulary every kid learns (ones, teens, tens, hundreds), then attach the scale word for its position: thousand, million, billion, and on up a thirty-four entry table that ends at duotrigintillion, which is 10^99.

Two details in that loop earn their keep. Empty triplets are skipped entirely, because, as the comment in the source puts it, "zero million is not a thing." And exactly one input gets a special case: the string of a one and a hundred zeros returns "one googol" instead of "ten duotrigintillion," both because it is correct and because it is the whole reason the toy exists. The test right beside it makes sure a near-googol, one digit off, never borrows the name.

There is no arithmetic anywhere in the file. The bug class we all fear with big numbers, precision loss, cannot occur, not because we handled it carefully but because we chose a representation in which it is not expressible. That is the lesson we keep re-learning from these toys: [in the chord player](/blog/f-sharp-is-not-g-flat), it was that one value was secretly three; here, it is that the right type for a number is sometimes not a number. The best error handling is a representation where the error has nothing to attach to.

## Tests a five-year-old could grade

The engine is 157 lines. The test file is also 157 lines, a symmetry we noticed after the fact and have chosen to treat as a sign of virtue. The tests read like a spelling quiz: seven is "seven," 42 is "forty-two" with the hyphen, even tens carry no trailing hyphen, "007" is "seven," commas are tolerated, and one sweep asserts that no output ever contains doubled spaces or stray hyphens no matter what the triplets produce. Every rule of the naming system, including the fussy typographic ones, is pinned where a refactor cannot quietly break it.

And then there is the button that makes the whole thing land for its intended audience: the Web Speech API. One call, `synth.speak(new SpeechSynthesisUtterance(output))`, plus the courtesy that pressing again mid-sentence stops the reading instead of stacking a second voice on top. No audio files, no service, no dependency, the same lesson [the browser keeps teaching us](/blog/the-browser-is-an-instrument): the platform already knows how. A five-year-old types a one and then holds down the zero key, and the browser solemnly reads him four quattuorvigintillion. This is, reliably, the funniest thing either of us has heard all week.

## What the toys are for

Numberoo will never appear on a client invoice. But the discipline it exercised, looking at a problem until you see the representation it actually wants instead of the one the language hands you first, appears on every invoice. We keep a [Fun page](/fun) for exactly this reason: the projects are small, the lessons are not.

Leo, for his part, is unimpressed by float64 precision limits. He would like to know what comes after a googol, and whether we can make the voice say it faster.
