import { describe, it, expect } from 'vitest';
import { gridToScreen, screenToGrid, isValidPosition, getValidNeighbors } from '../src/utils/Isometric';
import { CUBE_WIDTH, CUBE_HEIGHT, ORIGIN_X, ORIGIN_Y, PYRAMID_ROWS } from '../src/config/constants';

describe('Isometric', () => {
  describe('gridToScreen', () => {
    it('converts (0,0) to origin', () => {
      const result = gridToScreen(0, 0);
      expect(result.x).toBe(ORIGIN_X);
      expect(result.y).toBe(ORIGIN_Y);
    });

    it('converts (1,0) correctly', () => {
      const result = gridToScreen(1, 0);
      expect(result.x).toBe(ORIGIN_X - CUBE_WIDTH / 2);
      expect(result.y).toBe(ORIGIN_Y + CUBE_HEIGHT);
    });

    it('converts (1,1) correctly', () => {
      const result = gridToScreen(1, 1);
      expect(result.x).toBe(ORIGIN_X + CUBE_WIDTH / 2);
      expect(result.y).toBe(ORIGIN_Y + CUBE_HEIGHT);
    });

    it('converts (6,6) correctly', () => {
      const result = gridToScreen(6, 6);
      expect(result.x).toBe(ORIGIN_X + 3 * CUBE_WIDTH);
      expect(result.y).toBe(ORIGIN_Y + 6 * CUBE_HEIGHT);
    });
  });

  describe('screenToGrid', () => {
    it('converts origin to (0,0)', () => {
      const result = screenToGrid(ORIGIN_X, ORIGIN_Y);
      expect(result).toEqual({ row: 0, col: 0 });
    });

    it('returns null for invalid positions', () => {
      expect(screenToGrid(-100, -100)).toBeNull();
      expect(screenToGrid(0, 0)).toBeNull();
    });

    it('converts (1,0) area correctly', () => {
      const screenPos = gridToScreen(1, 0);
      const result = screenToGrid(screenPos.x, screenPos.y);
      expect(result).toEqual({ row: 1, col: 0 });
    });
  });

  describe('isValidPosition', () => {
    it('validates (0,0) as valid', () => {
      expect(isValidPosition(0, 0)).toBe(true);
    });

    it('validates (6,6) as valid', () => {
      expect(isValidPosition(6, 6)).toBe(true);
    });

    it('rejects negative row', () => {
      expect(isValidPosition(-1, 0)).toBe(false);
    });

    it('rejects row >= PYRAMID_ROWS', () => {
      expect(isValidPosition(PYRAMID_ROWS, 0)).toBe(false);
    });

    it('rejects col > row', () => {
      expect(isValidPosition(2, 3)).toBe(false);
    });

    it('rejects negative col', () => {
      expect(isValidPosition(2, -1)).toBe(false);
    });
  });

  describe('getValidNeighbors', () => {
    it('returns 2 neighbors for (0,0) - top of pyramid', () => {
      const neighbors = getValidNeighbors({ row: 0, col: 0 });
      expect(neighbors).toHaveLength(2);
      expect(neighbors).toContainEqual({ row: 1, col: 0 });
      expect(neighbors).toContainEqual({ row: 1, col: 1 });
    });

    it('returns 3 neighbors for (1,0)', () => {
      const neighbors = getValidNeighbors({ row: 1, col: 0 });
      expect(neighbors).toHaveLength(3);
    });

    it('returns 4 neighbors for (3,1)', () => {
      const neighbors = getValidNeighbors({ row: 3, col: 1 });
      expect(neighbors).toHaveLength(4);
    });

    it('returns 1 neighbor for (6,6) - bottom right corner', () => {
      const neighbors = getValidNeighbors({ row: 6, col: 6 });
      expect(neighbors).toHaveLength(1);
      expect(neighbors).toContainEqual({ row: 5, col: 5 });
    });
  });
});
