1|# Q*bert Technical Design Document
2|
3|## Technology Stack
4|
5|### Core Technologies
6|- **Game Engine:** Phaser 3.60+
7|  - Scene management
8|  - Sprite/graphics rendering
9|  - Tween animation system
10|  - Input handling
11|  - Audio management
12|  - Particle systems
13|  
14|- **Language:** TypeScript 5.0+
15|  - Strict mode enabled
16|  - Type safety for game state
17|  - Interface definitions for all entities
18|  
19|- **Build Tool:** Vite 5.0+
20|  - Fast HMR during development
21|  - TypeScript compilation
22|  - Asset optimization
23|  - Production bundling
24|
25|- **Renderer:** HTML5 Canvas
26|  - WebGL primary (automatic fallback to Canvas 2D)
27|  - 60 FPS target
28|  - Responsive scaling
29|
30|- **Testing:** Vitest
31|  - Unit tests for game logic
32|  - Integration tests for systems
33|  - No DOM rendering in tests (pure logic)
34|
35|### Development Dependencies
36|```json
37|{
38|  "devDependencies": {
39|    "typescript": "^5.0.0",
40|    "vite": "^5.0.0",
41|    "vitest": "^1.0.0",
42|    "@types/node": "^20.0.0"
43|  },
44|  "dependencies": {
45|    "phaser": "^3.60.0"
46|  }
47|}
48|```
49|
50|## Project Structure
51|
52|```
53|qbert-game/
54|├── index.html                    # Entry HTML
55|├── package.json                  # Dependencies & scripts
56|├── tsconfig.json                 # TypeScript config
57|├── vite.config.ts                # Vite build config
58|├── vitest.config.ts              # Test config
59|├── docs/                         # Documentation
60|│   ├── ARCHITECTURE.md
61|│   ├── GAME_DESIGN.md
62|│   └── TECHNICAL_DESIGN.md
63|├── public/                       # Static assets (copied to dist)
64|│   └── assets/
65|│       ├── sprites/              # Image assets
66|│       ├── audio/                # Sound effects & music
67|│       └── fonts/                # Custom fonts
68|├── src/
69|│   ├── main.ts                   # Game initialization
70|│   ├── scenes/                   # Phaser scenes
71|│   │   ├── BootScene.ts
72|│   │   ├── TitleScene.ts
73|│   │   ├── GameScene.ts
74|│   │   └── GameOverScene.ts
75|│   ├── entities/                 # Game objects
76|│   │   ├── Player.ts
77|│   │   ├── Cube.ts
78|│   │   ├── Pyramid.ts
79|│   │   └── enemies/
80|│   │       ├── Enemy.ts          # Base class
81|│   │       ├── RedBall.ts
82|│   │       ├── Coily.ts
83|│   │       └── Slick.ts
84|│   ├── systems/                  # Game systems
85|│   │   ├── InputSystem.ts
86|│   │   ├── CollisionSystem.ts
87|│   │   ├── ScoreSystem.ts
88|│   │   └── LevelSystem.ts
89|│   ├── config/                   # Game configuration
90|│   │   ├── constants.ts          # Game constants
91|│   │   └── levels.ts             # Level definitions
92|│   └── utils/                    # Utilities
93|│       ├── Isometric.ts          # Coordinate math
94|│       └── Storage.ts            # localStorage wrapper
95|└── tests/                        # Test files
96|    ├── utils/
97|    │   └── Isometric.test.ts
98|    ├── entities/
99|    │   ├── Player.test.ts
100|    │   └── Pyramid.test.ts
101|    └── systems/
102|        ├── ScoreSystem.test.ts
103|        └── LevelSystem.test.ts
104|```
105|
106|## Core Data Structures
107|
108|### Grid Coordinate System
109|
110|```typescript
111|interface GridPosition {
112|  row: number;  // 0 = top, 6 = bottom
113|  col: number;  // 0 = leftmost in row, max = row number
114|}
115|
116|// Validation: col >= 0 && col <= row && row >= 0 && row < ROWS
117|```
118|
119|### Screen Coordinate System
120|
121|```typescript
122|interface ScreenPosition {
123|  x: number;  // Pixel X
124|  y: number;  // Pixel Y
125|}
126|```
127|
128|### Isometric Conversion
129|
130|```typescript
131|// Constants
132|const CUBE_WIDTH = 64;   // Width of cube top face
133|const CUBE_HEIGHT = 32;  // Height of cube (half of width for iso)
134|const ORIGIN_X = 400;    // Center X of canvas
135|const ORIGIN_Y = 100;    // Top of pyramid
136|
137|// Grid to Screen
138|function gridToScreen(row: number, col: number): ScreenPosition {
139|  const x = (col - row / 2) * CUBE_WIDTH + ORIGIN_X;
140|  const y = row * CUBE_HEIGHT + ORIGIN_Y;
141|  return { x, y };
142|}
143|
144|// Screen to Grid (for touch input)
145|function screenToGrid(x: number, y: number): GridPosition | null {
146|  const row = Math.floor((y - ORIGIN_Y) / CUBE_HEIGHT);
147|  const col = Math.floor((x - ORIGIN_X) / CUBE_WIDTH + row / 2);
148|  
149|  // Validate
150|  if (row < 0 || row >= 7) return null;
151|  if (col < 0 || col > row) return null;
152|  
153|  return { row, col };
154|}
155|```
156|
157|### Cube State
158|
159|```typescript
160|interface CubeState {
161|  row: number;
162|  col: number;
163|  colorIndex: number;      // Current color (0 = start, max = target)
164|  isComplete: boolean;     // colorIndex === targetColorIndex
165|}
166|```
167|
168|### Pyramid State
169|
170|```typescript
171|interface PyramidState {
172|  cubes: CubeState[][];    // [row][col] - 2D array
173|  targetColorIndex: number;
174|  totalCubes: number;
175|  completedCubes: number;
176|  isComplete: boolean;     // completedCubes === totalCubes
177|}
178|```
179|
180|### Player State
181|
182|```typescript
183|interface PlayerState {
184|  gridPosition: GridPosition;
185|  screenPosition: ScreenPosition;
186|  animationState: 'idle' | 'hopping' | 'falling' | 'dead';
187|  lives: number;
188|  hasShield: boolean;
189|  isInvincible: boolean;   // Brief invincibility after respawn
190|}
191|```
192|
193|### Enemy State
194|
195|```typescript
196|interface EnemyState {
197|  type: 'redball' | 'coily' | 'slick';
198|  gridPosition: GridPosition;
199|  screenPosition: ScreenPosition;
200|  animationState: 'moving' | 'transforming' | 'dead';
201|  speed: number;           // Cubes per second
202|  phase?: number;          // For Coily (1 = egg, 2 = snake)
203|}
204|```
205|
206|### Power-up State
207|
208|```typescript
209|interface PowerupState {
210|  type: 'shield' | 'slowmo' | 'paintbrush';
211|  gridPosition: GridPosition | null;  // null = collected
212|  screenPosition: ScreenPosition;
213|  isActive: boolean;
214|  duration?: number;       // For timed effects
215|  charges?: number;        // For paintbrush
216|}
217|```
218|
219|### Game State
220|
221|```typescript
222|interface GameState {
223|  scene: 'boot' | 'title' | 'game' | 'gameover';
224|  lives: number;
225|  score: number;
226|  combo: number;
227|  currentLevel: number;
228|  pyramid: PyramidState;
229|  player: PlayerState;
230|  enemies: EnemyState[];
231|  powerups: PowerupState[];
232|  activeEffects: {
233|    shield: boolean;
234|    slowmo: number;        // Timestamp when expires
235|    paintbrush: number;    // Remaining charges
236|  };
237|  isPaused: boolean;
238|}
239|```
240|
241|## Level Configuration
242|
243|```typescript
244|interface LevelConfig {
245|  id: number;
246|  pyramidShape: 'classic' | 'diamond' | 'hourglass' | 'truncated';
247|  colorSteps: number;           // How many hops to reach target
248|  enemies: {
249|    type: EnemyType;
250|    spawnInterval: number;      // Seconds between spawns
251|    speed: number;              // Cubes per second
252|  }[];
253|  powerupSpawnRate: number;     // 0-1 probability per spawn check
254|  completionBonus: number;
255|}
256|
257|// Example level
258|const LEVEL_1: LevelConfig = {
259|  id: 1,
260|  pyramidShape: 'classic',
261|  colorSteps: 2,
262|  enemies: [
263|    { type: 'redball', spawnInterval: 5, speed: 1 }
264|  ],
265|  powerupSpawnRate: 0.1,
266|  completionBonus: 250
267|};
268|```
269|
270|## Entity Interfaces
271|
272|### Player
273|
274|```typescript
275|class Player {
276|  private scene: Phaser.Scene;
277|  private sprite: Phaser.GameObjects.Graphics;
278|  private state: PlayerState;
279|  
280|  constructor(scene: Phaser.Scene, startPosition: GridPosition);
281|  
282|  // Movement
283|  hop(direction: 'up-left' | 'up-right' | 'down-left' | 'down-right'): void;
284|  private animateHop(target: GridPosition): Promise<void>;
285|  private animateFall(): Promise<void>;
286|  
287|  // State
288|  getPosition(): GridPosition;
289|  getLives(): number;
290|  loseLife(): void;
291|  respawn(): void;
292|  
293|  // Power-ups
294|  activateShield(): void;
295|  hasShield(): boolean;
296|  useShield(): void;
297|  
298|  // Collision
299|  getBounds(): Phaser.Geom.Rectangle;
300|}
301|```
302|
303|### Pyramid
304|
305|```typescript
306|class Pyramid {
307|  private scene: Phaser.Scene;
308|  private cubes: Cube[][];
309|  private config: PyramidConfig;
310|  
311|  constructor(scene: Phaser.Scene, shape: PyramidShape);
312|  
313|  // Rendering
314|  render(): void;
315|  private renderCube(cube: Cube): void;
316|  
317|  // State
318|  getCube(row: number, col: number): Cube | null;
319|  changeCubeColor(row: number, col: number): boolean;
320|  isComplete(): boolean;
321|  reset(targetColorIndex: number): void;
322|  
323|  // Validation
324|  isValidPosition(row: number, col: number): boolean;
325|  getValidNeighbors(pos: GridPosition): GridPosition[];
326|}
327|```
328|
329|### Enemy (Base)
330|
331|```typescript
332|abstract class Enemy {
333|  protected scene: Phaser.Scene;
334|  protected sprite: Phaser.GameObjects.Graphics;
335|  protected state: EnemyState;
336|  
337|  constructor(scene: Phaser.Scene, startPosition: GridPosition);
338|  
339|  // Abstract methods
340|  abstract update(delta: number): void;
341|  abstract getType(): EnemyType;
342|  
343|  // Common
344|  getPosition(): GridPosition;
345|  moveTo(position: GridPosition): void;
346|  isAlive(): boolean;
347|  kill(): void;
348|  
349|  // Collision
350|  getBounds(): Phaser.Geom.Rectangle;
351|}
352|```
353|
354|### Collision System
355|
356|```typescript
357|class CollisionSystem {
358|  private player: Player;
359|  private enemies: Enemy[];
360|  private powerups: Powerup[];
361|  
362|  constructor(player: Player, enemies: Enemy[], powerups: Powerup[]);
363|  
364|  update(): CollisionResult[];
365|  
366|  private checkPlayerEnemyCollisions(): CollisionResult[];
367|  private checkPlayerPowerupCollisions(): CollisionResult[];
368|  private boundsIntersect(a: Phaser.Geom.Rectangle, b: Phaser.Geom.Rectangle): boolean;
369|}
370|
371|interface CollisionResult {
372|  type: 'enemy' | 'powerup';
373|  entity: Enemy | Powerup;
374|  action: 'death' | 'collect' | 'none';
375|}
376|```
377|
378|## Game Systems
379|
380|### Input System
381|
382|```typescript
383|class InputSystem {
384|  private scene: Phaser.Scene;
385|  private keys: { [key: string]: Phaser.Input.Keyboard.Key };
386|  private inputBuffer: Direction | null;
387|  private isLocked: boolean;
388|  
389|  constructor(scene: Phaser.Scene);
390|  
391|  // Setup
392|  private setupKeyboard(): void;
393|  private setupTouch(): void;
394|  
395|  // Input handling
396|  update(): Direction | null;
397|  lockInput(duration: number): void;
398|  unlockInput(): void;
399|  
400|  // Direction mapping
401|  private mapKeyboardToDirection(): Direction | null;
402|  private mapTouchToDirection(): Direction | null;
403|}
404|
405|type Direction = 'up-left' | 'up-right' | 'down-left' | 'down-right';
406|```
407|
408|### Score System
409|
410|```typescript
411|class ScoreSystem {
412|  private score: number;
413|  private combo: number;
414|  private highScores: number[];
415|  
416|  constructor();
417|  
418|  // Scoring
419|  addCubeScore(): void;
420|  addLevelBonus(level: number): void;
421|  addPowerupScore(): void;
422|  addEnemyDefeatScore(): void;
423|  
424|  // Combo
425|  incrementCombo(): void;
426|  resetCombo(): void;
427|  getComboMultiplier(): number;
428|  
429|  // High scores
430|  checkHighScore(): boolean;
431|  saveHighScore(): void;
432|  getHighScores(): number[];
433|  
434|  // Getters
435|  getScore(): number;
436|  getCombo(): number;
437|  
438|  // Persistence
439|  private loadHighScores(): void;
440|  private saveHighScores(): void;
441|}
442|```
443|
444|### Level System
445|
446|```typescript
447|class LevelSystem {
448|  private currentLevel: number;
449|  private config: LevelConfig;
450|  private pyramid: Pyramid;
451|  
452|  constructor();
453|  
454|  // Level management
455|  loadLevel(levelNumber: number): LevelConfig;
456|  nextLevel(): void;
457|  getCurrentLevel(): number;
458|  getConfig(): LevelConfig;
459|  
460|  // Enemy spawning
461|  shouldSpawnEnemy(delta: number): boolean;
462|  getRandomEnemyType(): EnemyType;
463|  
464|  // Power-up spawning
465|  shouldSpawnPowerup(): boolean;
466|  
467|  // Completion
468|  checkLevelComplete(): boolean;
469|}
470|```
471|
472|## Rendering Pipeline
473|
474|### Frame Update Order
475|
476|```typescript
477|// In GameScene.update(time, delta)
478|1. InputSystem.update()           // Get player input
479|2. Player.update(delta)           // Update player state/animation
480|3. Enemies.forEach(e => e.update(delta))  // Update enemies
481|4. CollisionSystem.update()       // Check collisions
482|5. ScoreSystem.update()           // Update score display
483|6. LevelSystem.update()           // Check level completion
484|7. Powerups.forEach(p => p.update(delta))  // Update power-ups
485|8. UI.update()                    // Update HUD
486|```
487|
488|### Depth Sorting
489|
490|```typescript
491|// Render order (back to front)
492|1. Background
493|2. Pyramid row 0 (top)
494|3. Pyramid row 1
495|4. ... (entities on pyramid)
496|5. Pyramid row 6 (bottom)
497|6. Enemies (sorted by Y position)
498|7. Player (sorted by Y position)
499|8. Power-ups
500|9. UI overlay
501|