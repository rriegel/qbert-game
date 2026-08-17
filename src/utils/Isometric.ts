import { CUBE_WIDTH, CUBE_HEIGHT, ORIGIN_X, ORIGIN_Y, PYRAMID_ROWS } from '../config/constants';

export interface GridPosition {
  row: number;
  col: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Convert grid coordinates to screen coordinates
 */
export function gridToScreen(row: number, col: number): ScreenPosition {
  const x = (col - row / 2) * CUBE_WIDTH + ORIGIN_X;
  const y = row * CUBE_HEIGHT + ORIGIN_Y;
  return { x, y };
}

/**
 * Convert screen coordinates to grid coordinates
 * Returns null if position is outside the pyramid
 */
export function screenToGrid(x: number, y: number): GridPosition | null {
  const row = Math.floor((y - ORIGIN_Y) / CUBE_HEIGHT);
  const col = Math.floor((x - ORIGIN_X) / CUBE_WIDTH + row / 2);
  
  // Validate
  if (!isValidPosition(row, col)) {
    return null;
  }
  
  return { row, col };
}

/**
 * Check if a grid position is valid (on the pyramid)
 */
export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < PYRAMID_ROWS && col >= 0 && col <= row;
}

/**
 * Get all valid neighbor positions for a given grid position
 */
export function getValidNeighbors(pos: GridPosition): GridPosition[] {
  const directions: GridPosition[] = [
    { row: -1, col: -1 },  // up-left
    { row: -1, col: 0 },   // up-right
    { row: 1, col: 0 },    // down-left
    { row: 1, col: 1 }     // down-right
  ];
  
  return directions
    .map(d => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(p => isValidPosition(p.row, p.col));
}
