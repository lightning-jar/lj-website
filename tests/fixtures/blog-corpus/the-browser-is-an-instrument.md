---
title: "The Browser Is an Instrument: Building a Playable Synth with the Web Audio API"
metaTitle: "The Browser Is an Instrument | Web Audio API Synth"
slug: the-browser-is-an-instrument
description: "Fifths, our open-source circle-of-fifths chord player, ships no audio files. Every sound is synthesized in the browser: oscillators for the notes, a gain envelope to stop the clicks, a convolution reverb whose impulse response is generated from decaying noise, and multi-touch press-and-hold playback keyed by pointer id. A tour of what it takes to make a web page feel like an instrument, including the iOS unlock ritual and the tab-visibility etiquette nobody tells you about."
date: 2026-07-12T20:00:00Z
draft: false
tags: [music, web-audio, svelte, open-source, side-projects]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/baby-grand-piano.webp
imageDescription: A watercolor painting of a baby grand piano
author: Kevin Peckham
quote:
  text: An instrument is a latency budget with a user interface. The browser can meet the budget, but only if you treat the audio graph like an instrument and not like an alert sound.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Web Audio API
    definition: "The browser's built-in audio synthesis and processing engine: a graph of nodes (oscillators, gains, filters, convolvers) that you wire together in JavaScript and that renders on a dedicated audio thread."
  - term: Oscillator
    definition: "A node that generates a periodic waveform at a frequency. The four classic shapes (sine, triangle, square, sawtooth) are the four voices of our instrument."
  - term: Gain envelope
    definition: "A volume curve applied to a note over time. Even a 10 millisecond attack ramp is the difference between a musical note and an audible click."
  - term: Impulse response
    definition: "A recording (or synthesis) of how a space responds to a single instantaneous sound. Convolving a signal with an impulse response places the signal in that space; it is how convolution reverb works."
  - term: Chord voicing
    definition: "The specific octaves and doublings chosen for a chord's notes. The same C major triad can sound thin or rich depending on how its notes are spread across the keyboard."
additionalReading:
  - title: "F♯ Is Not G♭: Music Theory as a Data-Modeling Problem"
    url: "/blog/f-sharp-is-not-g-flat"
  - title: "Fifths, the instrument itself"
    url: "https://www.fifths.app"
  - title: "chord-player on GitHub"
    url: "https://github.com/kevinpeckham/chord-player"
  - title: "Fun: side projects from the studio"
    url: "/fun"
---

[Fifths](https://www.fifths.app) is our [open-source](https://github.com/kevinpeckham/chord-player) circle-of-fifths chord player, and it has a property that surprises people when they hear about it: the app ships no audio files. No samples, no MP3s, no sprite sheets of piano notes. Every sound you hear is synthesized in your browser at the moment you press, by the Web Audio API, from about three hundred lines of TypeScript. The browser is the instrument.

This post is a tour of those three hundred lines: the audio graph, the envelope that keeps notes from clicking, the reverb we synthesize from random noise, the multi-touch bookkeeping, and the two platform rituals (iOS unlock, tab-visibility etiquette) that separate a demo from something that feels like an instrument.

## The graph: one master, two paths

The Web Audio API is a node graph. You create sources, wire them through processors, and land at the destination, which is the speaker. Our whole instrument hangs off one master gain node with two paths to the speaker, drawn in the source as a comment because a diagram in the code is worth three paragraphs near it:

```
masterGain ─┬────────────────────────→ destination
            └→ convolver → wetGain ──→ destination
```

The top path is the dry signal. The bottom path runs the same signal through a convolver node, which applies reverb, then through a wet-gain node that controls how much of the reverberant copy you hear. Blending dry and wet this way means the reverb slider never touches the notes themselves; it just raises and lowers the room.

And the room is fake, in the most satisfying way. Convolution reverb needs an impulse response, normally a recording of a real space. Ours is synthesized at startup: two and a half seconds of stereo white noise with an exponential decay curve.

```ts
data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
```

Random samples, fading according to a power curve. That is the entire recipe for a plausible small hall, and it costs zero bytes of assets.

## The envelope: ten milliseconds between music and clicks

Each note in a chord gets its own oscillator, and each oscillator gets its own tiny gain node. When a note starts, we do not simply turn it on; we ramp its gain from zero to full over ten milliseconds:

```ts
noteGain.gain.setValueAtTime(0, ctx.currentTime);
noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
```

Skip this and every note begins with an audible click, because starting a waveform mid-swing is a discontinuity, and a discontinuity is a broadband pop. Ten milliseconds is short enough to feel instant under your finger and long enough for the waveform to enter politely. Most of what makes synthesized sound feel cheap is not the oscillator; it is the missing envelope.

The oscillators themselves come in the four classic shapes (sine, triangle, square, sawtooth), and switching between them is the app's voice control. Same notes, same envelope, very different personality.

## Press and hold, with more than one finger

An instrument is not a jukebox: sound should start when your finger lands and stop when it lifts, and two fingers should mean two chords. The bookkeeping for that is a map from pointer id to active chord:

```ts
const activeChords = new Map<number, ActiveChord>();
```

Every pointer event carries a stable id for the finger (or mouse, or stylus) that produced it, so each finger gets its own set of oscillators and its own cleanup. Press a chord, drag to another wedge, and the code checks whether that pointer is already sounding exactly those frequencies before restarting anything, so holding a chord never stutters. Lift the finger and only that finger's oscillators stop. Multi-touch chord playing falls out of choosing the right map key.

## Voicings: the same chord, dressed four ways

A C major triad is three pitch classes, but an instrument that always plays three sine waves in the same octave sounds like a doorbell. So each chord in Fifths carries five pre-computed voicings: standard (the plain triad), spread (notes fanned across octaves), rich (doubled roots and added color), bass-enhanced, and root-bass (a low root under a first inversion). The voicing selector changes which frequency list gets handed to the oscillator factory; the audio engine neither knows nor cares about the theory.

The frequencies themselves are pure equal-temperament math from a 440 Hz anchor, where every semitone multiplies by the twelfth root of two. We benchmarked stored-versus-generated frequency tables while building this and the stored table's worst-case error was 0.0017 percent, roughly five hundred times finer than human pitch discrimination. Either approach is fine; knowing that is what let us choose for simplicity instead of superstition.

## The platform rituals

Two pieces of the code exist purely because of how browsers guard audio, and anyone building browser sound will meet them.

**The iOS unlock.** Safari on iOS will not produce sound until audio is initiated inside a user gesture, and not just any initiation: a sound must actually be scheduled. So the first tap anywhere runs a small ritual: create the context, play a ten-millisecond oscillator at zero volume, resume the context. The user hears nothing. The platform sees a sound played inside a gesture and unlocks the instrument for the rest of the session.

**Tab etiquette.** An instrument in a background tab should go quiet, and come back instantly. A visibility-change listener suspends the audio context when the page hides and resumes it when the page returns, which also stops the instrument from burning battery rendering silence. One subtlety: resuming a suspended context is asynchronous, so playback waits for the resume (plus a fifty-millisecond grace period) before scheduling notes, or the first chord after returning to the tab would vanish into a context that was not ready.

## What a toy is for

None of this required a framework or an audio library; the platform's own API carried the whole instrument. What the project required was the thing side projects are best at supplying: a reason to learn a corner of the platform deeply, with no deadline and no client, so that the next time a real project needs sound, latency budgets, or pointer bookkeeping, the scars already exist. That is why we keep a [Fun page](/fun) now. The toys pay rent.

And this particular toy also taught us [a data-modeling lesson about note names](/blog/f-sharp-is-not-g-flat), which is a story of its own. Meanwhile: [go play it](https://www.fifths.app). Hold a chord. Try the sawtooth. The browser has been an instrument all along.
