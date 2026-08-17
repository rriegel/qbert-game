import Phaser from 'phaser';
import { Cube } from './Cube';
import { PYRAMID_ROWS } from '../config/constants';
import { isValidPosition } from '../utils/Isometric';

export class Pyramid {
  public cubes: Cube[][];
  public targetColorIndex: number;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, targetColorIndex: number = 1) {
    this.scene = scene;
    this.targetColorIndex = targetColorIndex;
    this.cubes = [];
    this.build();
  }

  /**
   * Build the pyramid grid
   */
  private build() {
    this.cubes = [];
    
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      this.cubes[row] = [];
      for (let col = 0; col <= row; col++) {
        const cube = new Cube(this.scene, row, col, this.targetColorIndex);
        this.cubes[row][col] = cube;
      }
    }
  }

  /**
   * Get cube at grid position
   */
  getCube(row: number, col: number): Cube | null {
    if (!isValidPosition(row, col)) {
      return null;
    }
    return this.cubes[row][col];
  }

  /**
   * Change cube color at position
   */
  changeCubeColor(row: number, col: number): boolean {
    const cube = this.getCube(row, col);
    if (cube) {
      return cube.incrementColor();
    }
    return false;
  }

  /**
   * Check if all cubes are at target color
   */
  isComplete(): boolean {
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      for (let col = 0; col <= row; col++) {
        if (!this.cubes[row][col].isComplete()) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get count of completed cubes
   */
  getCompletedCount(): number {
    let count = 0;
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      for (let col = 0; col <= row; col++) {
        if (this.cubes[row][col].isComplete()) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get total number of cubes
   */
  getTotalCubes(): number {
    let total = 0;
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      total += row + 1;
    }
    return total;
  }

  /**
   * Reset all cubes
   */
  reset(targetColorIndex?: number) {
    if (targetColorIndex !== undefined) {
      this.targetColorIndex = targetColorIndex;
    }
    
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      for (let col = 0; col <= row; col++) {
        this.cubes[row][col].reset(this.targetColorIndex);
      }
    }
  }

  /**
   * Destroy all cubes
   */
  destroy() {
    for (let row = 0; row < PYRAMID_ROWS; row++) {
      for (let col = 0; col <= row; col++) {
        this.cubes[row][col].graphics.destroy();
      }
    }
    this.cubes = [];
  }
}
