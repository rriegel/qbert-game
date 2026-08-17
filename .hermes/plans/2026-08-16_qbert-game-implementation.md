# Q*bert Phaser.js Game — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a modernized Q*bert arcade game in the browser using Phaser.js 3 + TypeScript — faithful to the original mechanics with expanded content (new levels, power-ups, modern polish).

**Architecture:** Phaser 3 game with isometric tile-based pyramid rendering. Game state managed via Phaser scenes (Boot → Title → Game → GameOver). Entity system for player, enemies, and cubes. Tilemap data structure for the pyramid with color-state tracking.

**Tech Stack:**
- Phaser 3 (game engine)
- TypeScript
- Vite (dev server + bundler)
- HTML5 Canvas renderer

---

## Game Design Reference

### Original Q*bert Mechanics
- **Pyramid:** 7-row isometric pyramid of cubes (28 cubes total: 1+2+3+4+5+6+7)
- **Player (Q*bert):** Hops between cubes in 4 diagonal directions (up-left, up-right, down-left, down-right)
- **Cube colors:** Each cube cycles through colors when landed on; goal is to change all cubes to target color
- **Enemies:** Coily (snake that chases Q*bert), Slick/Sam (gremlins that revert cube colors), Ugg/Chop (move along sides), Red balls (bounce up)
- **Death:** Falling off pyramid edges, touching enemies
- **Lives:** 3 lives, bonus life at score thresholds
- **Levels:** Each level has different cube color sequences; completing all cubes advances level

### Modernized Additions
- **Power-ups:** Shield (survive one hit), Slow-mo (slows enemies), Paintbrush (instant-color a cube)
- **New enemy patterns:** Varied per level
- **Particle effects:** Cube color changes, death animations, level complete
- **Sound effects & music:** Retro-styled chiptune
- **Multiple pyramid shapes:** Classic pyramid + diamond, hourglass variants in later levels
- **Score multipliers & combos:** Consecutive cubes without dying
- **High score persistence:** localStorage

---

## Project Structure

```
qbert-game/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── assets/
│       ├── sprites/
│       ├── audio/
│       └── fonts/
└── src/
    ├── main.ts              # Phaser Game config + boot
    ├── scenes/
    │   ├── BootScene.ts     # Load assets
    │   ├── TitleScene.ts    # Title screen
    │   ├── GameScene.ts     # Main gameplay
    │   └── GameOverScene.ts # Score display
    ├── entities/
    │   ├── Player.ts        # Q*bert character
    │   ├── Cube.ts          # Single pyramid cube
    │   ├── Pyramid.ts       # Pyramid data structure + rendering
    │   └── enemies/
    │       ├── Enemy.ts     # Base enemy class
    │       ├── Coily.ts     # Snake enemy (chases player)
    │       ├── Slick.ts     # Reverts cube colors
    │       └── RedBall.ts   # Bouncing hazard
    ├── systems/
    │   ├── InputSystem.ts   # Keyboard + touch input
    │   ├── CollisionSystem.ts # Entity collision detection
    │   ├── ScoreSystem.ts   # Score tracking + combos
    │   └── LevelSystem.ts   # Level progression + config
    ├── config/
    │   ├── levels.ts        # Level definitions
    │   └── constants.ts     # Game constants (speeds, sizes, colors)
    └── utils/
        ├── Isometric.ts     # Iso coordinate math
        └── Storage.ts       # localStorage wrapper
```

---

## Phase 1: Project Setup & Core Rendering

### Task 1: Scaffold project with Vite + Phaser + TypeScript

**Objective:** Get a running dev server that displays a blank Phaser canvas.

**Steps:**
1. Create project directory `qbert-game/`
2. Initialize: `npm init -y`
3. Install deps: `npm install phaser` + `npm install -D typescript vite vite-plugin-checker`
4. Create `tsconfig.json`, `vite.config.ts`, `index.html`
5. Create `src/main.ts` with minimal Phaser Game config (800x600 canvas)
6. Run `npm run dev` and verify canvas renders

**Verification:** Browser shows empty Phaser canvas at localhost:5173

### Task 2: Isometric coordinate system

**Objective:** Math utilities for converting between grid (row, col) and screen (x, y) coordinates.

**Files:**
- Create: `src/utils/Isometric.ts`
- Create: `src/config/constants.ts`

**Key math:**
```typescript
// Cube dimensions
const CUBE_WIDTH = 64;
const CUBE_HEIGHT = 32; // half for iso

// Grid to screen (isometric)
function gridToScreen(row: number, col: number): { x: number; y: number } {
  const x = (col - row / 2) * CUBE_WIDTH + ORIGIN_X;
  const y = row * CUBE_HEIGHT + ORIGIN_Y;
  return { x, y };
}
```

**Verification:** Unit tests pass for known grid→screen conversions.

### Task 3: Render a single isometric cube

**Objective:** Draw one 3D-looking isometric cube using Phaser graphics (no sprite assets needed initially).

**Files:**
- Create: `src/entities/Cube.ts`

**Approach:** Draw 3 parallelograms (top face, left face, right face) with different shading to create 3D illusion. Each face is a filled polygon.

**Verification:** Single cube renders centered on screen with visible 3D effect.

### Task 4: Render the full pyramid

**Objective:** Draw all 28 cubes in the classic 7-row pyramid arrangement.

**Files:**
- Create: `src/entities/Pyramid.ts`
- Modify: `src/scenes/BootScene.ts` (or create GameScene to host it)

**Data structure:**
```typescript
// 2D array: pyramid[row][col] where row 0 = top (1 cube), row 6 = bottom (7 cubes)
type CubeState = { row: number; col: number; colorIndex: number };
```

**Verification:** Full pyramid renders on screen, all 28 cubes visible and properly aligned.

---

## Phase 2: Player Movement

### Task 5: Q*bert sprite & idle state

**Objective:** Render Q*bert character on top of a cube, idle animation.

**Files:**
- Create: `src/entities/Player.ts`

**Approach:** Start with a simple circle/rectangle placeholder sprite. Position on pyramid using grid coords.

**Verification:** Character appears on top cube of pyramid.

### Task 6: Diagonal hopping movement

**Objective:** Player hops in 4 diagonal directions on keypress (arrow keys or WASD).

**Files:**
- Modify: `src/entities/Player.ts`
- Create: `src/systems/InputSystem.ts`

**Movement mapping:**
- Up-Left (↖): row-1, col-1
- Up-Right (↗): row-1, col
- Down-Left (↙): row+1, col
- Down-Right (↘): row+1, col+1

**Hop animation:** Tween arc (parabolic jump) over ~300ms. Lock input during hop.

**Verification:** Press arrow keys → Q*bert hops diagonally with arc animation.

### Task 7: Edge detection & falling

**Objective:** If player hops off pyramid edge, trigger fall animation and lose life.

**Files:**
- Modify: `src/entities/Player.ts`

**Logic:** After calculating target (row, col), check if valid (col >= 0 && col <= row && row < 7). If invalid, play fall-off animation (tween downward + fade).

**Verification:** Hopping off edge triggers fall, player respawns at top.

### Task 8: Cube color change on landing

**Objective:** When Q*bert lands on a cube, it cycles to the next color in the sequence.

**Files:**
- Modify: `src/entities/Cube.ts`, `src/entities/Pyramid.ts`, `src/entities/Player.ts`

**Logic:** On successful landing, call `pyramid.changeCubeColor(row, col)`. Update the cube's rendered colors.

**Verification:** Landing on cubes changes their color visibly.

---

## Phase 3: Game Loop & Win/Lose Conditions

### Task 9: Level completion detection

**Objective:** When all cubes reach target color, advance to next level.

**Files:**
- Create: `src/systems/LevelSystem.ts`
- Modify: `src/entities/Pyramid.ts`

**Logic:** After each color change, check if all cubes have `colorIndex === targetColorIndex`. If yes → level complete animation → next level config.

**Verification:** Color all cubes → level advances (pyramid resets with new color sequence).

### Task 10: Lives system & game over

**Objective:** Track lives (start with 3). Death reduces lives. 0 lives → game over.

**Files:**
- Create: `src/scenes/GameOverScene.ts`
- Modify: `src/scenes/GameScene.ts`

**Verification:** Die 3 times → Game Over screen with final score.

### Task 11: Score system with combos

**Objective:** Points for coloring cubes. Consecutive cubes without dying = multiplier.

**Files:**
- Create: `src/systems/ScoreSystem.ts`

**Scoring:**
- Base: 25 points per cube colored to target
- Combo: 2x, 3x, 4x multiplier for consecutive cubes
- Level complete bonus: 250 × level number

**Verification:** Score increments correctly, combo multiplier displayed.

---

## Phase 4: Enemies

### Task 12: Base enemy class & spawn system

**Objective:** Abstract Enemy class with movement, collision bounds, spawn timing.

**Files:**
- Create: `src/entities/enemies/Enemy.ts`

**Verification:** Enemy spawns on pyramid, moves between cubes.

### Task 13: Red Ball enemy

**Objective:** Bouncing ball that starts at top, bounces down the pyramid. Kills Q*bert on contact.

**Files:**
- Create: `src/entities/enemies/RedBall.ts`

**Movement:** Moves down-left or down-right randomly at each row. Bouncing animation.

**Verification:** Red ball spawns, bounces down pyramid, kills player on contact.

### Task 14: Coily (snake enemy)

**Objective:** Egg that bounces down, hatches into snake that chases Q*bert. Can be defeated by hopping on it.

**Files:**
- Create: `src/entities/enemies/Coily.ts`

**Behavior:** Phase 1 = egg bouncing down (like RedBall). Phase 2 = hatches, moves toward player's position each turn.

**Verification:** Egg bounces down → hatches → chases player → player can escape by hopping to higher rows.

### Task 15: Slick & Sam (color reverters)

**Objective:** Gremlins that move down the pyramid, reverting colored cubes back to original.

**Files:**
- Create: `src/entities/enemies/Slick.ts`

**Behavior:** Move downward, each cube they touch reverts to initial color. Player must re-color those cubes.

**Verification:** Slick moves down, cubes it touches revert color.

---

## Phase 5: Power-ups & Polish

### Task 16: Power-up system

**Objective:** Floating power-up items appear on pyramid edges. Collecting grants ability.

**Files:**
- Create power-up entity + integrate with Player

**Power-ups:**
- 🛡️ Shield: Survive one enemy hit
- ⏱️ Slow-mo: Enemies move at half speed for 10s
- 🖌️ Paintbrush: Next 3 cubes colored instantly

**Verification:** Power-ups spawn, can be collected, effects apply correctly.

### Task 17: Particle effects

**Objective:** Visual juice — particles on cube color change, death explosion, level complete.

**Files:**
- Modify: `src/entities/Cube.ts`, `src/entities/Player.ts`

**Approach:** Phaser particle emitters. Small burst on color change, larger on death.

**Verification:** Visual particles appear on events.

### Task 18: Sound effects & music

**Objective:** Retro chiptune SFX for hop, death, color change, level complete. Background music loop.

**Files:**
- Add to: `public/assets/audio/`
- Create: `src/systems/AudioSystem.ts` (or use Phaser's built-in audio)

**Approach:** Generate or source free chiptune SFX. Phaser's WebAudio support.

**Verification:** Sounds play on appropriate events.

### Task 19: Title screen & game over screen

**Objective:** Polished title screen with "Press Start" and game over with high score.

**Files:**
- Modify: `src/scenes/TitleScene.ts`
- Modify: `src/scenes/GameOverScene.ts`

**Verification:** Full game flow: Title → Game → Game Over → Title (with high score saved).

### Task 20: High score persistence

**Objective:** Save top 5 scores to localStorage. Display on title/game-over screens.

**Files:**
- Create: `src/utils/Storage.ts`

**Verification:** Scores persist across page reloads.

---

## Phase 6: Advanced Levels & Variants

### Task 21: Multiple pyramid shapes

**Objective:** Later levels use diamond, hourglass, or truncated pyramid layouts.

**Files:**
- Modify: `src/config/levels.ts`
- Modify: `src/entities/Pyramid.ts` (support arbitrary layouts)

**Verification:** Different pyramid shapes render and play correctly.

### Task 22: Level-specific enemy configurations

**Objective:** Each level defines which enemies appear, spawn rates, and speeds.

**Files:**
- Modify: `src/config/levels.ts`
- Modify: `src/systems/LevelSystem.ts`

**Verification:** Levels 1-3 easy (just red balls), levels 4+ add Coily, levels 7+ add Slick.

### Task 23: Touch/mobile controls

**Objective:** Swipe gestures for mobile play. Tap directional areas of screen.

**Files:**
- Modify: `src/systems/InputSystem.ts`

**Verification:** Game playable on mobile browser with touch input.

---

## Phase 7: Final Polish

### Task 24: Responsive scaling

**Objective:** Game scales to fit any screen size while maintaining aspect ratio.

**Files:**
- Modify: `src/main.ts` (Phaser scale config)

**Verification:** Game looks correct at different window sizes.

### Task 25: Performance optimization

**Objective:** Ensure 60fps on mid-range hardware. Profile and fix any hotspots.

**Verification:** No frame drops during gameplay with all enemies active.

### Task 26: Deploy to GitHub Pages / static host

**Objective:** Build production bundle, deploy to static hosting.

**Files:**
- Add: `vite.config.ts` build config
- Add: GitHub Actions workflow for deploy

**Verification:** Game playable at deployed URL.

---

## Open Questions

1. **Art style:** Pixel art sprites or geometric/vector style? (Geometric is easier to start, can upgrade later)
2. **Audio:** Generate chiptune with jsfxr/BFXR, or source free assets?
3. **Multiplayer:** Any interest in competitive/leaderboard features? (out of scope for v1)
4. **Deployment target:** GitHub Pages? Your own server? CloudFront (since you have infra)?

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Isometric math gets complex | Start with simple grid, verify math with unit tests early |
| Enemy AI pathfinding on iso grid | Use simple greedy movement toward target cube |
| Performance with many particles | Cap particle count, use object pooling |
| Scope creep on "modernized" features | Ship core game first (Phase 1-4), then add polish |

---

## Suggested Execution Order

1. Phase 1 (Tasks 1-4): ~2 hours — get pyramid on screen
2. Phase 2 (Tasks 5-8): ~3 hours — playable movement
3. Phase 3 (Tasks 9-11): ~2 hours — game loop works
4. Phase 4 (Tasks 12-15): ~4 hours — enemies add challenge
5. Phase 5 (Tasks 16-20): ~3 hours — power-ups and juice
6. Phase 6 (Tasks 21-23): ~3 hours — content variety
7. Phase 7 (Tasks 24-26): ~2 hours — ship it

**Total estimate: ~19 hours of focused work**
