# Q*bert Game Architecture

## System Overview

A Phaser 3 browser game built with TypeScript, using an isometric tile-based rendering system for the pyramid structure. The game follows a scene-based architecture with clear separation between rendering, game logic, and data management.

## High-Level Architecture

```
+-------------------------------------------------------------+
|                        Game Engine (Phaser 3)                |
|  +--------------+  +--------------+  +--------------+       |
|  |  Boot Scene  |->| Title Scene  |->| Game Scene   |       |
|  +--------------+  +--------------+  +--------------+       |
|                                            |                 |
|                                     +--------------+        |
|                                     |Game Over Scene|        |
|                                     +--------------+        |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                      Game Systems Layer                      |
|  +------------+ +------------+ +------------+ +----------+  |
|  |   Input    | | Collision  | |   Score    | |  Level   |  |
|  |  System    | |  System    | |  System    | |  System  |  |
|  +------------+ +------------+ +------------+ +----------+  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                      Entity Layer                            |
|  +----------+  +----------+  +----------+  +------------+   |
|  |  Player  |  |  Pyramid |  |  Enemies |  | Power-ups  |   |
|  | (Q*bert) |  |  & Cubes |  | (Coily,  |  | (Shield,   |   |
|  |          |  |          |  | RedBall) |  |  SlowMo)   |   |
|  +----------+  +----------+  +----------+  +------------+   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                      Data Layer                              |
|  +------------+  +------------+  +------------+             |
|  |   Level    |  |   Score    |  |   Config   |             |
|  |   Data     |  |  Storage   |  |  Constants |             |
|  +------------+  +------------+  +------------+             |
+-------------------------------------------------------------+
```

## Scene Flow

```
BootScene --> TitleScene --> GameScene --> GameOverScene
    ^                                         |
    +-----------------------------------------+
```

## Component Architecture

### Scene Management

**BootScene**
- Loads all assets (sprites, audio, fonts)
- Initializes game systems
- Transitions to TitleScene

**TitleScene**
- Displays title screen with high scores
- Handles "Press Start" input
- Initializes new game state
- Transitions to GameScene

**GameScene**
- Main gameplay loop
- Manages pyramid, player, enemies, power-ups
- Handles game logic and state transitions
- Transitions to GameOverScene when lives = 0

**GameOverScene**
- Displays final score
- Shows high score list
- Handles restart/quit input
- Transitions back to TitleScene

### Core Systems

**InputSystem**
- Handles keyboard input (arrow keys, WASD)
- Handles touch/swipe input for mobile
- Maps input to directional commands
- Provides input buffering during animations

**CollisionSystem**
- Detects player-enemy collisions
- Detects player-powerup collisions
- Uses bounding box or circle collision
- Triggers appropriate callbacks

**ScoreSystem**
- Tracks current score
- Manages combo multipliers
- Calculates level completion bonuses
- Persists high scores to localStorage

**LevelSystem**
- Manages level progression
- Loads level configuration
- Tracks cube color states
- Detects level completion

### Entity Architecture

**Player (Q*bert)**
- State machine: idle, hopping, falling, dead
- Position tracking (grid coordinates)
- Animation management
- Life/health tracking

**Pyramid & Cubes**
- 2D array data structure (7 rows)
- Each cube has: row, col, colorIndex, screenPosition
- Rendering: isometric projection
- Color state management

**Enemies**
- Base Enemy class with common behavior
- RedBall: bouncing movement pattern
- Coily: egg -> snake transformation, chase AI
- Slick/Sam: downward movement, color reversion

**Power-ups**
- Shield: temporary invincibility
- SlowMo: reduces enemy speed
- Paintbrush: instant cube coloring

## Data Flow

### Game Loop (per frame)
1. **Input Phase**: InputSystem polls keyboard/touch
2. **Update Phase**:
   - Player updates position/animation
   - Enemies update positions/AI
   - CollisionSystem checks collisions
   - ScoreSystem updates if needed
3. **Render Phase**:
   - Pyramid renders cubes
   - Entities render at their positions
   - UI elements render (score, lives)

### Player Hop Sequence
1. Input detected -> InputSystem validates
2. Calculate target grid position
3. Check if valid (on pyramid) or invalid (fall off)
4. If valid:
   - Animate hop (parabolic arc)
   - Update player grid position
   - Change cube color on landing
   - Check level completion
5. If invalid:
   - Animate fall off edge
   - Decrement lives
   - Respawn at top or game over

### Enemy Spawn Sequence
1. LevelSystem determines spawn timing
2. Select enemy type based on level config
3. Spawn at top of pyramid
4. Enemy begins movement pattern
5. CollisionSystem monitors for player contact

## State Management

### Game State
```typescript
interface GameState {
  currentScene: 'boot' | 'title' | 'game' | 'gameover';
  lives: number;
  score: number;
  combo: number;
  currentLevel: number;
  pyramid: PyramidState;
  player: PlayerState;
  enemies: Enemy[];
  powerups: Powerup[];
}
```

### Pyramid State
```typescript
interface PyramidState {
  cubes: CubeState[][];  // [row][col]
  targetColorIndex: number;
  completionCount: number;
}
```

### Player State
```typescript
interface PlayerState {
  gridPosition: { row: number; col: number };
  screenPosition: { x: number; y: number };
  state: 'idle' | 'hopping' | 'falling' | 'dead';
  hasShield: boolean;
}
```

## Rendering Pipeline

### Isometric Projection
- Grid coordinates (row, col) -> Screen coordinates (x, y)
- Formula:
  - x = (col - row/2) * CUBE_WIDTH + ORIGIN_X
  - y = row * CUBE_HEIGHT + ORIGIN_Y
- Cubes rendered as 3 parallelograms (top, left, right faces)
- Depth sorting: render back-to-front (row 0 first, row 6 last)

### Animation System
- Phaser Tween Manager for smooth animations
- Hop animation: parabolic arc over 300ms
- Fall animation: downward tween with fade
- Enemy animations: bounce, transform, move

### Particle System
- Phaser Particle Emitter for effects
- Cube color change: small burst
- Player death: explosion effect
- Level complete: celebration particles

## Performance Considerations

### Optimization Strategies
- Object pooling for enemies and particles
- Batch rendering for pyramid cubes
- Limit particle count (max 50 active)
- Use Phaser's built-in physics (Arcade Physics) for collision
- Avoid creating objects in game loop

### Memory Management
- Preload all assets in BootScene
- Reuse enemy objects when possible
- Clean up off-screen entities
- Use texture atlases for sprites

## Extensibility

### Adding New Enemies
1. Extend base Enemy class
2. Implement movement pattern
3. Add to LevelSystem spawn config
4. Define collision behavior

### Adding New Levels
1. Define level config (pyramid shape, colors, enemies)
2. Add to levels.ts configuration
3. Set spawn rates and speeds
4. Test difficulty progression

### Adding New Power-ups
1. Create Powerup entity class
2. Define effect logic
3. Add to spawn configuration
4. Implement visual feedback

## Technology Stack

- **Game Engine**: Phaser 3.60+
- **Language**: TypeScript 5.0+
- **Build Tool**: Vite 5.0+
- **Renderer**: HTML5 Canvas (WebGL fallback)
- **Audio**: Web Audio API (via Phaser)
- **Storage**: localStorage API
- **Testing**: Vitest (unit tests)

## Development Workflow

1. **Setup**: `npm install` -> `npm run dev`
2. **Development**: Hot reload with Vite
3. **Testing**: `npm test` (unit tests)
4. **Build**: `npm run build` -> `dist/`
5. **Deploy**: Static hosting (GitHub Pages, CloudFront, etc.)

## Future Enhancements

- Multiplayer (WebSocket server)
- Leaderboard (backend API)
- Achievements system
- Daily challenges
- Custom level editor
- Mobile app wrapper (Capacitor)
