// Game dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Pyramid configuration
export const PYRAMID_ROWS = 7;
export const CUBE_WIDTH = 64;
export const CUBE_HEIGHT = 32;
export const ORIGIN_X = GAME_WIDTH / 2;
export const ORIGIN_Y = 100;

// Colors
export const COLORS = {
  BACKGROUND_TOP: 0x1a0a2e,
  BACKGROUND_BOTTOM: 0x0d0221,
  CUBE_START: 0x2196F3,      // Blue
  CUBE_MID: 0xFFC107,        // Yellow
  CUBE_TARGET: 0x4CAF50,     // Green
  QBERT: 0xFF6D00,           // Orange
  RED_BALL: 0xF44336,        // Red
  COILY: 0x9C27B0,           // Purple
  SLICK_SAM: 0x8BC34A,       // Light green
  SHIELD: 0x03A9F4,          // Cyan
  SLOW_MO: 0xFFEB3B,         // Yellow
  PAINTBRUSH: 0xE91E63,      // Pink
  UI_TEXT: 0xFFFFFF,         // White
  UI_ACCENT: 0xFF6D00        // Orange
};

// Player
export const PLAYER_HOP_DURATION = 300;
export const PLAYER_START_LIVES = 3;

// Discs (classic floating platforms beside the pyramid)
export const DISC_RIDE_DURATION = 1200; // ms to ride from edge cube to top
export const DISC_STAND_OFFSET = 15;    // px player sits above disc center
export const DISC_SPAWN = {
  leftRow: 3,   // left disc boardable from (3,0) via up-left hop
  rightRow: 4   // right disc boardable from (4,4) via up-right hop
};

// Scoring
export const SCORE_CUBE_COLOR = 25;
export const SCORE_LEVEL_BONUS = 250;
export const SCORE_POWERUP = 100;
export const SCORE_ENEMY_DEFEAT = 500;

// Level configurations - each level has different requirements
export const LEVEL_CONFIGS = [
  { targetColorIndex: 1 },  // Level 1: 1 hop per cube (blue → yellow)
  { targetColorIndex: 2 },  // Level 2: 2 hops per cube (blue → green)
  { targetColorIndex: 3 },  // Level 3: 3 hops per cube (blue → purple)
  { targetColorIndex: 1 },  // Level 4: 1 hop per cube (blue → yellow) - easier after hard level
  { targetColorIndex: 2 },  // Level 5: 2 hops per cube
];

// Cube color palette (in order of progression)
export const CUBE_COLORS = [
  0x2196F3,  // 0: Blue (start)
  0xFFC107,  // 1: Yellow
  0x4CAF50,  // 2: Green
  0x9C27B0,  // 3: Purple
];
