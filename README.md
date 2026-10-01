# Makan Picker 🍜

*"Makan apa hari ni?"* Can't decide where to eat? Set your mood, spin the wheel, and go.

**Live:** https://www.williamchanwinghong.com/projects/makan-picker/

## Features
- Spinning food wheel drawn with **SVG**, eased with a CSS cubic-bezier for a natural slow-down
- Filter by budget (Cheap eats / Mid / Treat), cuisine and halal-friendly
- Add your own spots; they're saved in your browser
- "Find nearby" opens Google Maps for the result
- Recent picks history, dark mode, mobile friendly
- Respects **reduced motion**: if the visitor's system asks for less animation, it picks instantly instead of spinning

## How it works
- **No framework.** It uses one `state` object and a `render()` function that redraws the UI from it, so events update state, save it, then re-render. This is the same idea React uses, done by hand.
- **The winner is picked first, then the wheel is aimed at it.** A random slice is chosen with `crypto.getRandomValues`, which is fairer than `Math.random`. `targetRotation()` then works out exactly how far to spin so that slice stops under the pointer, landing at a random spot inside the slice and never on an edge.
- **Double-checked.** When the spin ends, `indexAtPointer()` reads which slice is actually at the top. The unit tests check that every winner, for wheels of 2 to 15 slices, lands where it should.
- **Safe DOM.** User input is only ever inserted with `textContent`, never `innerHTML`.

## Tech
TypeScript · SVG · CSS animations · Vite · Vitest

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests
npm run build    # production build → dist/
```

## Structure
```
src/
├── main.ts           state, rendering, events
├── data.ts           starter food list, labels, colours
├── store.ts          load/save to localStorage
├── lib/wheel.ts      slice geometry + spin maths
├── lib/filter.ts     filtering
├── lib/random.ts     crypto-based randomness
└── lib/wheel.test.ts unit tests
```
