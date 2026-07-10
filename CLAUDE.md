# CLAUDE.md — AI Avatar Component Library

## Project Overview

**Meli** is an interactive AI Avatar component library built with vanilla JavaScript. It provides an animated, state-based SVG avatar component with particle effects and smooth CSS animations — no external dependencies, no build step required.

- **Package name:** `ai-avatar`
- **Version:** `1.0.0`
- **License:** MIT
- **Module type:** ES6 modules (`"type": "module"`)

---

## Repository Structure

```
Meli/
├── index.html          # Interactive demo page (full feature showcase)
├── package.json        # NPM configuration, scripts
├── avatar-screenshot.png  # Screenshot of demo
└── src/
    ├── AIAvatar.js     # Core component class (498 lines)
    └── index.js        # Module entry point and re-exports
```

---

## Tech Stack

- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Rendering:** SVG for avatar graphics, CSS animations for glow effects
- **Animation:** `requestAnimationFrame` loop + CSS `@keyframes`
- **Module system:** Native ES6 modules (no bundler)
- **Dependencies:** None (zero external dependencies)
- **Node.js:** Used only for dev server (`npx serve .`)

---

## Development Workflow

### Running locally

```bash
npm run dev
# Starts a static file server at http://localhost:3000 (or similar port)
# Open index.html in the browser to see the interactive demo
```

### Available scripts

```bash
npm run dev    # Start dev server via `npx serve .`
npm run build  # No-op (no build step needed for vanilla JS)
npm run test   # No-op (tests not yet configured)
```

### No build step

There is no compilation, transpilation, or bundling. Files are served directly as-is. ES6 modules are loaded natively by the browser using `<script type="module">`.

---

## Core Component: `AIAvatar`

### Location
`src/AIAvatar.js` — the only source file of consequence.

### Instantiation

```js
import { AIAvatar } from './src/AIAvatar.js';

const avatar = new AIAvatar('#container', {
  size: 200,
  primaryColor: '#6366f1',
  showParticles: true,
  showGlow: true
});
```

The constructor accepts a CSS selector string or a DOM element reference. It throws if the container is not found.

### States

Five distinct states defined in the static `AIAvatar.STATES` constant:

| State       | Constant                    | Visual behavior                                      |
|-------------|-----------------------------|----------------------------------------------------|
| `idle`      | `AIAvatar.STATES.IDLE`      | Subtle eye movement, occasional blink, gentle smile |
| `thinking`  | `AIAvatar.STATES.THINKING`  | Eyes look up, bouncing dots, glow pulse             |
| `speaking`  | `AIAvatar.STATES.SPEAKING`  | Animated mouth movement, glow flicker               |
| `listening` | `AIAvatar.STATES.LISTENING` | Enlarged eyes, sound waves, soft glow               |
| `error`     | `AIAvatar.STATES.ERROR`     | Shaking eyes, sad mouth, red glow pulse             |

### Public API

```js
// Convenience state setters (all return `this` for chaining)
avatar.idle();
avatar.think();
avatar.speak();
avatar.listen();
avatar.error();

// Generic state setter
avatar.setState('thinking');   // validates against STATES, warns on unknown

// Get current state
avatar.getState();             // returns state string

// Update configuration (triggers DOM rebuild)
avatar.setConfig({ primaryColor: '#ff0000', size: 250 });

// Destroy and clean up (cancels animation loop, removes particles)
avatar.destroy();
```

Method chaining is supported: `avatar.think().listen()`.

### Events

The component emits a `statechange` custom event on the container element:

```js
container.addEventListener('statechange', (e) => {
  console.log(e.detail.state); // e.g. 'thinking'
});
```

### Default Configuration

```js
AIAvatar.DEFAULT_CONFIG = {
  size: 200,               // Avatar diameter in pixels (100–300 recommended)
  primaryColor: '#6366f1', // Main fill and SVG gradient start
  secondaryColor: '#818cf8', // Gradient end and accent color
  backgroundColor: '#1e1b4b', // Container background
  glowColor: '#a5b4fc',    // Color of the glow blur layer
  animationSpeed: 1,       // Time scale multiplier for animation loop
  showParticles: true,     // Toggle particle system
  showGlow: true,          // Toggle glow layer
  rounded: true            // Toggle circular border-radius
}
```

---

## Architecture and Conventions

### Class design

- Single class `AIAvatar` in `src/AIAvatar.js`, exported as both named and default export.
- Static constants use `SCREAMING_SNAKE_CASE`: `STATES`, `DEFAULT_CONFIG`.
- Private/internal methods are prefixed with `_`: `_init()`, `_createStyles()`, `_createDOM()`, `_createSVG()`, `_startAnimationLoop()`, `_updateAnimation()`, `_animateIdle()`, etc.
- Public API methods use `camelCase` without underscore prefix.

### CSS conventions

- Injected styles use the ID `ai-avatar-styles` to prevent duplicate injection.
- BEM-like CSS class names: `.ai-avatar-container`, `.ai-avatar-glow`, `.ai-avatar-svg`, `.ai-avatar-particles`, `.ai-avatar-particle`.
- State-specific CSS is applied via `data-state` attribute on the container: `data-state="thinking"`.

### Animation system

- A single `requestAnimationFrame` loop runs continuously while the avatar is alive.
- A `this.time` counter increments by `0.016 * animationSpeed` per frame (~60fps).
- State-specific animation is dispatched with a `switch` statement in `_updateAnimation()`.
- Mathematical sinusoidal functions (`Math.sin`, `Math.cos`) drive smooth movement.

### Particle system

- Particles are DOM elements (`.ai-avatar-particle`) appended to a dedicated layer.
- Only created during `thinking` and `speaking` states at 10% probability per frame.
- Each particle tracks `{ element, x, y, speed, life }` in `this.particles` array.
- Dead particles (`life <= 0`) are removed from DOM and filtered from the array.
- The system is disabled if `showParticles: false` in config.

### Memory management

- Always call `avatar.destroy()` when removing the component to cancel the animation frame and clean up particles.
- `setConfig()` calls `_createDOM()` which fully rebuilds the DOM (sets `container.innerHTML = ''`), so any external references to child elements become stale after a config update.

### SVG structure

The avatar SVG uses a fixed `viewBox="0 0 200 200"`. Key elements queried by class during animation:

| CSS class              | SVG element          | Role                         |
|------------------------|----------------------|------------------------------|
| `.avatar-head`         | `<circle>`           | Main head, breathing scale   |
| `.avatar-eye-left`     | `<g>`                | Left eye group               |
| `.avatar-eye-right`    | `<g>`                | Right eye group              |
| `.avatar-pupil`        | `<ellipse>`          | Pupil within each eye        |
| `.avatar-mouth`        | `<path>`             | Mouth, `d` attribute animated|
| `.avatar-antenna-light`| `<circle>`           | Pulsing indicator on antenna |
| `.avatar-thinking-dots`| `<g>`                | Three bouncing dots           |
| `.avatar-sound-waves`  | `<g>`                | Wave paths for listening      |

---

## Key Files Reference

| File              | Purpose                                               |
|-------------------|-------------------------------------------------------|
| `src/AIAvatar.js` | Core component — all logic, animation, DOM, styles   |
| `src/index.js`    | Re-exports `AIAvatar` (entry point for module users) |
| `index.html`      | Demo page — live usage example, state controls, customization panel |
| `package.json`    | Package metadata and npm scripts                      |

---

## What Does Not Exist (yet)

- No test suite — `npm run test` is a no-op placeholder
- No linting or formatting config (no ESLint, Prettier, etc.)
- No CI/CD pipeline (no `.github/workflows/`)
- No TypeScript types or `.d.ts` files
- No bundler (Webpack, Vite, Rollup)
- No README.md

When adding these, follow the existing vanilla JS, zero-dependency philosophy unless there is a strong reason to introduce tooling.

---

## Common Tasks for AI Assistants

### Adding a new state

1. Add the state key to `AIAvatar.STATES` in `src/AIAvatar.js`.
2. Add a convenience method (e.g., `pause() { return this.setState(AIAvatar.STATES.PAUSE); }`).
3. Add a `case` in the `switch` inside `_updateAnimation()` calling a new `_animateXxx()` method.
4. Implement the `_animateXxx()` method following the same signature pattern as existing ones.
5. Add corresponding CSS animation to `_createStyles()` if a glow variant is needed (via `data-state="xxx"`).

### Changing default colors

Edit the `DEFAULT_CONFIG` static property in `src/AIAvatar.js`.

### Updating the demo

Edit `index.html`. The script block at the bottom of the file wires up controls to the avatar instance.

### Running/testing changes

Open the demo in a browser after starting `npm run dev`. There is no automated test runner — test manually through the demo UI.
