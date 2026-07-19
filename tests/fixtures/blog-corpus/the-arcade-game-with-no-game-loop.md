---
title: "The Arcade Game With No Game Loop"
metaTitle: "The Arcade Game With No Game Loop | Donut Shooter"
slug: the-arcade-game-with-no-game-loop
description: "Every game tutorial starts the same way: write the loop, tick sixty times a second, update every position, check every collision. Donut Shooter, our browser arcade game, has no loop at all. Donuts fall on closed-form animation curves, the hit is decided the instant you click, and the moment of visible impact is computed once, at fire time, by bisecting the gap between two known trajectories. An essay on what happens when you treat time as something you can query instead of something you must process."
date: 2026-07-13T18:00:00Z
draft: false
tags: [svelte, javascript, games, open-source, side-projects]
image: https://lj-01.nyc3.cdn.digitaloceanspaces.com/images/blog/donut.webp
imageDescription: A watercolor painting of a frosted donut
author: Kevin Peckham
quote:
  text: A game loop watches for the collision. We solved for it. When motion is a formula, "when do these two things meet" stops being surveillance and becomes algebra.
  attribution: Kevin Peckham, Principal at Lightning Jar
glossary:
  - term: Game loop
    definition: "The traditional heartbeat of a game: a function that runs every frame (typically sixty times a second) to advance positions, check collisions, and redraw. Donut Shooter does not have one."
  - term: Hitscan
    definition: "A shooting model where the hit is determined instantly at fire time rather than by simulating a projectile's flight. Common in shooters; here it is also what makes the no-loop design honest."
  - term: Closed-form trajectory
    definition: "Motion expressed as a formula of time (position = f(t)) rather than as state updated step by step. If you know f, you can evaluate any moment directly, including future ones."
  - term: Bisection
    definition: "A root-finding method: repeatedly halve an interval, keeping the half where the answer lives. Twenty-four halvings pin the impact time to a fraction of a millisecond."
  - term: Runes store
    definition: "Svelte 5's reactive state pattern. Donut Shooter keeps the entire game state machine in one store file; every component just renders what the store says."
additionalReading:
  - title: "Donut Shooter, the game itself"
    url: "https://www.donutshooter.com"
  - title: "donut-shooter on GitHub"
    url: "https://github.com/kevinpeckham/donut-shooter"
  - title: "The Number That Doesn't Fit in a Number"
    url: "/blog/the-number-that-doesnt-fit-in-a-number"
  - title: "The Browser Is an Instrument"
    url: "/blog/the-browser-is-an-instrument"
  - title: "Fun: side projects from the studio"
    url: "/fun"
---

Every game programming tutorial ever written starts in the same place: the loop. Sixty times a second you advance every position, test every object against every other object, and redraw the world. The loop is so fundamental that it is practically the definition of the genre. Game programming is loop programming.

So when we built [Donut Shooter](https://www.donutshooter.com), a small [open-source](https://github.com/kevinpeckham/donut-shooter) browser arcade game where donuts rain from the sky and you shoot them down before they land, the most interesting thing about the finished code is what is missing. There is no `requestAnimationFrame`. There is no tick. There is no per-frame collision check. Search the repository for a game loop and you will not find one, because the game never needed to watch time pass. It schedules time instead.

## Motion as a formula

A falling donut in Donut Shooter is not an object whose `y` gets incremented every frame. It is a Svelte `Tween`: a declaration that `y` travels from just below the header to the top of the ground, over a duration derived from the window height, along a `cubicIn` easing curve, so the fall accelerates like gravity ought to. The component mounts, the tween starts, and the browser renders the motion. Position is a formula of time, and nobody updates it.

The bullet is the same idea pointed the other way: a `Tween` with `cubicOut` easing, fast off the barrel and decelerating as it climbs, gone in three hundred milliseconds.

This declarative style has a consequence that is easy to miss and impossible to overstate: because every trajectory is a closed-form curve, any moment of any object's future is a function call away. You do not have to wait for frame 37 to find out where the donut will be at frame 37. And that turns the hardest problem in the genre, collision detection, into algebra.

## The hit is decided instantly. The explosion is scheduled.

When you click, the game does not launch a projectile and wait to see what happens. It runs a hitscan: is there a donut whose horizontal span contains the shooter's `x` right now? If so, that donut is claimed as hit, immediately, before the bullet sprite has moved a pixel. The code even claims it eagerly on purpose, so the donut's miss timer (more on that in a moment) can never fire for a donut that is already doomed.

But an arcade game where donuts explode the instant you click would feel broken. The bullet visibly takes time to fly. So the second half of the trick is a pure function called `bulletInterceptDelay`: given how long the donut has been falling and the two easing curves, compute the delay from firing until the bullet's top edge visually meets the donut's bottom edge. The gap between them shrinks monotonically (the bullet only rises, the donut only falls), so the function finds the crossing with twenty-four iterations of bisection, pinning the impact to a fraction of a millisecond. Then the store simply schedules the show: at impact, dim the donut and retire the bullet; two hundred milliseconds later, replace it with a puff of smoke; two hundred after that, remove it from the board.

Read that again, because it is the whole essay in one sentence: the outcome is decided at click time, and the collision you see is theater, scheduled in advance by solving an equation. A game loop watches for the collision. We solved for it.

## Misses are scheduled too

The same move handles failure. The moment a donut drops, its landing time is already known (distance over speed, times the level's multiplier), so the store schedules the miss right then: in `fallDuration` milliseconds, if this donut is still unclaimed, mark it missed, dock a health point, and, in the game's finest artistic decision, replace the donut with an alien emoji and the caption "huh?". Three of those and the game ends.

Nothing polls. Every future event, impact, smoke, disappearance, landing, level banner, is a timer set at the moment its cause occurs. The store wraps `setTimeout` in a `schedule` helper so pause and reset can sweep every pending timer at once. Time in this game is not a stream to be processed. It is an appointment book.

## The state machine is the game

The other half of the architecture is aggressively boring, which is a compliment. One runes store holds the entire game: the status (`ready`, `playing`, `paused`, and friends), the arrays of donuts and bullets, health, level, and stats. Every entity carries a status of its own (`dropped`, `hit`, `missed`, `spent`), and every transition lives in one file. Components render what the store says and nothing else: a donut sprite is an emoji (🍩, no image assets in the whole game), a label, an opacity, and a tween. The sound system is eleven lines that fire-and-forget an `Audio` element and swallow errors on platforms without playback, which is what lets the whole store run headless under test.

That separation is why the intercept math can be a pure function with its own unit tests, why the tuning constants (fall speed, drop cadence, three-miss limit) live in one settings file a non-programmer could edit, and why the components have no logic worth testing beyond rendering.

## What the loop would have bought us

Honesty requires the trade-off. The no-loop design works because nothing in Donut Shooter changes course mid-flight: once a donut drops or a bullet fires, its future is fully determined. The moment you want homing missiles, wind, bouncing, or donuts that dodge, positions become genuine state again and the loop earns its keep. The game even admits its one awkward corner in the README: resizing the window changes every trajectory's coordinate space, so rather than remapping curves in flight, it pauses the game and discards the airborne donuts. A real engine would handle that. A toy gets to choose simplicity and say so.

That is the recurring lesson of [our](/blog/the-number-that-doesnt-fit-in-a-number) [toys](/blog/the-browser-is-an-instrument), and the reason we keep a [Fun page](/fun): each one is a small bet that the obvious architecture is not the only one. The obvious type for a number is not always a number, the obvious way to make sound is not an audio file, and the obvious heartbeat of a game is not always a loop. Sometimes it is just math, a calendar of consequences, and a donut that turns into a bewildered alien when you let it land.

[Go shoot some donuts.](https://www.donutshooter.com) Three misses and you're out.
