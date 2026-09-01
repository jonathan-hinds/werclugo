# Wurcluego Project Manifest

## Identity

**Canonical product name:** Wurcluego  
**Tagline:** “Get a clue.”  
**Form:** A real, functioning, mobile-first web game—not a mockup, concept page, or collection of disconnected screens.

Wurcluego presents an elaborate ecosystem in which people sniff for Clue Coins, convert them into Puzzle Points, discover Jicker Jigs, fight the Clue Gobbler, and contribute pieces to the 45,000,000-piece Big Clue. The application treats every part of this ecosystem as critically important while remaining vague about what any of it ultimately accomplishes.

The project’s defining principle is:

> **The software architecture is excellent. The UX architecture is terrible on purpose.**

When choosing between clean engineering with ridiculous UX and ridiculous engineering with ridiculous UX, always choose **clean engineering with ridiculous UX**.

## How to interpret the product

Wurcluego’s confusion is conceptual and theatrical. Its controls and systems must still be dependable.

Intentional product behavior includes:

- circular instructions, redundant terminology, and unnecessary ceremony;
- vague or contradictory hints that deepen the fiction;
- bizarre button labels and procedural confirmations;
- fake telemetry, gauges, warnings, diagnostics, and market language;
- many intermediate steps for actions that could technically be simple;
- the persistent implication that enormous progress is being made toward something consequential.

Actual defects include:

- controls that do not respond or cannot be reached;
- inadequate touch targets, horizontal overflow, unreadable essential text, or unsafe flashing;
- race conditions, duplicate rewards, client-authoritative currency, or lost progression;
- navigation that cannot reliably return home or survive a refresh;
- camera/geolocation denial making the scanner unusable;
- inconsistent domain rules, hidden implementation magic, unvalidated input, or unstructured API failures.

Do not remove intentional absurdity in the name of “better UX.” Do fix real usability, accessibility, reliability, data-integrity, performance, and implementation problems.

## Tone and narrative rule

The application never explains the joke and never breaks character.

Wurcluego sincerely believes:

- Clue Coins matter.
- Puzzle Points matter.
- Jicker Jigs are historically consequential.
- The Big Clue must be assembled.
- The Clue Gobbler is a serious threat and “a right grimy old git.”
- Select Mode and Choose are necessary, distinct procedures.
- Clue pressure, exchange readiness, jig phase, and related readings are valid technical concepts.

Copy should sound like a mixture of a bureaucratic manual, mystical prophecy, children’s arcade game, and malfunctioning scientific instrument. It may worsen understanding, but it must not say that the app is pointless, deliberately confusing, a joke, or parody.

Examples of the intended voice:

- “Selection successfully selected.”
- “The Sniffer cannot guarantee sniffability.”
- “Puzzle Points do not represent puzzle completion.”
- “Global clue coherence improving.”
- “The requested clue either moved, was gobbled, or was never properly chosen.”

Prefer reusable categorized copy collections over scattered one-off strings. Useful categories include home instructions, scanner warnings, Gobbler messages, exchange instructions, Big Clue messages, loading states, errors, and Clue Citizen dialogue.

## Canonical interaction loop

1. A persistent anonymous device profile represents the player.
2. On the home screen, the three major activities begin locked.
3. The player presses **SELECT MODE**, which enables **CHOOSE** after a ceremonial status sequence.
4. The player presses **CHOOSE**, unlocking **CLUE SNIFFER**, **THE CLUE EXCHANGE**, and **THE BIG CLUE**.
5. The Clue Sniffer finds nearby deterministic Clue Coins and rare Jicker Jigs.
6. Clue Coins are collected and exchanged for Puzzle Points.
7. Jicker Jigs may be contributed to the Big Clue or ceremonially converted into currency.
8. The Clue Gobbler may arrive, move toward an item, steal it, be stunned with Blaster Balls, or be induced to spew randomized server-determined loot.
9. Players use Jicker Jigs in a procedural, globally shared Big Clue linking system.
10. Progress survives reloads and later visits.

The loop should feel responsive and convincing even though its purpose remains aggressively unresolved.

## Home-screen invariant

The initial action state is canon:

| Action | Initial state | After SELECT MODE | After CHOOSE |
| --- | --- | --- | --- |
| CLUE SNIFFER | Disabled | Disabled | Enabled |
| THE CLUE EXCHANGE | Disabled | Disabled | Enabled |
| THE BIG CLUE | Disabled | Disabled | Enabled |
| SELECT MODE | Enabled | Interactive | Interactive |
| CHOOSE | Disabled | Enabled | Interactive |

Do not collapse Select Mode and Choose into one sensible button. The ceremonial dependency is a core product mechanic, not onboarding friction to eliminate.

## Domain glossary and rules

### Clue Coins

The common nearby collectible. Collection is satisfying, persisted, logged, and validated by the server. A client may request a known generated item claim but may never submit an arbitrary balance increase.

### Puzzle Points

A derived currency created through deliberately over-prepared exchange steps. The underlying formula remains deterministic and centrally configured. Puzzle Points fund Gobbler Spew, inefficient Jicker Jig attempts, and other scanner operations.

### Jicker Jigs

Rare scanner discoveries that represent potential Big Clue pieces. Discovery is presented as a major historical event. Contribution and conversion are consequential actions and require meaningful confirmation even when the surrounding wording is strange.

### The Big Clue

A conceptual 45,000,000-piece collaborative puzzle. Never create or render 45 million records or elements. Materialize pieces only when discovered or otherwise relevant. Linking uses procedural connector/signature compatibility and server-authoritative validation. A successful link persists globally, updates progress, and rewards the player.

The Big Clue does not need a predetermined final picture. It must feel massive, shared, scalable, and mostly unresolved.

### The Clue Gobbler

A filthy, greedy, cybernetic junk-goblin antagonist. During a real lightweight encounter, it chooses a nearby item and advances toward it. The player can collect first, fire a toy-like Blaster Ball to stun it, or spend Puzzle Points on a server-resolved Gobbler Spew outcome. The frontend never chooses rewards.

### Clue Citizens

Flat, synthetic-looking billboard characters inhabiting the scanner. They stare, jitter, wave, and give useless in-universe advice. They do not require a live generative-AI service, and the asset system should make new citizens easy to add.

### Scanner effects

Stackable filters such as Wet Radar, Wrong Spectrum, Jig Phase, Gobbler Contrast, and Uncertain Night Vision may be mostly cosmetic or actively strange. Persist these as device preferences and keep their performance bounded.

## Technical shape

The repository is a TypeScript npm-workspace monorepo:

- `client/`: React, Vite, routing, state, animations, responsive UI, and optional 3D scanner presentation.
- `server/`: Node/Express REST API, validation, domain services, persistence, structured errors, and production static-file serving.
- `shared/`: shared contracts, constants, and cross-boundary types.

The production Express process serves the compiled frontend and versioned API from one service. SPA routes fall back to `index.html`; API misses remain structured API errors. The server listens on the runtime-provided port and binds so a hosting service can reach it.

Maintain separation between routes, validation, controllers, domain services, repositories/data access, and Mongoose models. Business rules do not belong in route handlers or React components. Use classes only when they provide real encapsulation or testability.

## Data authority and persistence

MongoDB is authoritative for meaningful progression:

- anonymous profile and balances;
- Gobbler encounters, defeats, thefts, and spews;
- discovered Jicker Jigs and Big Clue pieces;
- successful global links and contribution totals;
- economy and collection activity.

Local storage is appropriate only for device preferences such as filters, mute state, tutorial state, and motion settings. It is not authoritative for balances or rewards.

The server must create required collections, indexes, and application metadata automatically. An empty database should become usable through normal startup; no manual collection creation should be required.

Nearby objects should be generated reproducibly from a coarse geographic cell plus a time window and seed. Refreshing must not completely reroll the local world. Collection validation should prevent basic duplicate claims and avoid creating an unnecessary permanent precise-location history.

## API contract philosophy

Use conventional versioned REST behavior beneath unconventional copy. Payloads are validated, errors are structured, and rewards are server-authoritative.

Representative routes include:

- `/api/v1/profile`
- `/api/v1/sniffer/nearby`
- `/api/v1/sniffer/collect`
- `/api/v1/exchange`
- `/api/v1/gobbler/start`
- `/api/v1/gobbler/fire`
- `/api/v1/gobbler/spew`
- `/api/v1/big-clue/status`
- `/api/v1/big-clue/pieces`
- `/api/v1/big-clue/link`

Humorous user-facing messages may accompany standard status codes and stable machine-readable error codes. Real technical details belong in server logs, not in vague client errors.

## Scanner behavior

The Clue Sniffer is the central feature and should resemble an augmented-reality junk-science scanner.

Use camera, geolocation, and orientation/motion where browser support and permission allow. Never make real camera or AR capability a prerequisite. The fallback—simulated radar, animated scene, compass motion, and camera-style backdrop—is a first-class supported experience, not a temporary mock.

Leaving the scanner must clean up camera tracks, geolocation/orientation listeners, animation frames, and 3D resources.

## Visual direction

The visual phrase is **“glitch psychedelic psychosis cyber mess.”** The intended mixture includes early-2000s cyber toys, corrupted HUDs, neon scanner hardware, fake diagnostics, arcade hardware, psychedelic educational software, and cyberpunk cereal packaging.

Use deliberate design tokens and reusable primitives for color, spacing, type, motion, borders, noise, scanlines, RGB separation, gradients, and holographic effects. The composition can look chaotic without being arbitrarily implemented.

Essential text and controls remain operable. Prefer transform/opacity animation, cap expensive effects, lazy-load heavy scanner code, and respect reduced-motion preferences.

## Mobile and accessibility invariants

Phones are the primary design target. Preserve:

- safe-area padding and dynamic viewport units;
- finger-sized touch targets and pointer/touch interaction;
- portrait-first layouts with non-catastrophic landscape behavior;
- no horizontal overflow at approximately 320, 375, 390, and 430 pixels;
- semantic controls, labels, focus behavior, and keyboard access for primary functions;
- sufficient contrast for essential information;
- reduced-motion and mute controls;
- no dangerous rapid flashing or seizure-risk effects;
- no interaction that depends exclusively on hover.

Accessibility is not part of the joke.

## Performance and reliability invariants

- Lazy-load routes and the 3D scanner.
- Bound particle counts and device pixel ratio where appropriate.
- Reuse 3D materials and geometries.
- Avoid unnecessary React rerenders and layout-triggering animation.
- Clean up media tracks, listeners, timers, and animation loops.
- Keep all economy values and probability rules in centralized configuration.
- Test domain behavior rather than relying on superficial snapshots.
- Preserve deep-link refresh behavior and browser back navigation.
- Provide in-universe loading and error states without concealing real failures from logs.

## Core release capabilities

Future changes should assume these systems are intentional parts of the product, not disposable demo content:

1. Select Mode → Choose unlock ceremony
2. Persistent anonymous profile
3. Clue Coin, Puzzle Point, and Jicker Jig balances
4. Clue Sniffer with permission handling and pseudo-AR fallback
5. Deterministic nearby generation and validated collection
6. Jicker Jig discovery and conversion/contribution choices
7. Gobbler encounter, target race, Blaster Ball stun, and Spew
8. Ceremonial Clue Exchange
9. Procedural global Big Clue linking
10. Clue Citizens and stackable scanner effects
11. Mobile-responsive, accessible, animated UI
12. MongoDB persistence and automatic initialization
13. Single-service production build with SPA deep-link support
14. PWA metadata and installable presentation

Do not replace any of these with static demonstrations without an explicit owner request.

## Change checklist for agents

Before completing a meaningful change, ask:

1. Does this preserve Wurcluego’s complete sincerity?
2. Is any apparent confusion intentional, or did the change introduce a real reliability/usability bug?
3. Are currency, rewards, collection claims, and Big Clue links still server-authoritative?
4. Does progression persist correctly across reloads?
5. Does the feature still work when camera, motion, or location permission is unavailable?
6. Are mobile touch targets, safe areas, overflow, reduced motion, and essential contrast intact?
7. Are domain constants centralized and meaningful logic testable outside route handlers/components?
8. Do production deep links, API errors, startup, and MongoDB initialization still work?
9. Did the change accidentally explain the joke or make the fiction self-aware?
10. Did the change make the code stranger when only the experience was supposed to be strange?

If the answer to the last question is yes, simplify the implementation—not the product.

