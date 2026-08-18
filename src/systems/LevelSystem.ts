import Phaser from 'phaser';
import { Pyramid } from '../entities/Pyramid';
import { LEVEL_CONFIGS } from '../config/constants';

export class LevelSystem {
  public currentLevel: number = 1;
  public pyramid: Pyramid;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.pyramid = new Pyramid(this.scene, this.getTargetColorIndex());
  }

  /**
   * Get target color index for current level
   */
  getTargetColorIndex(): number {
    const config = LEVEL_CONFIGS[this.currentLevel - 1];
    return config ? config.targetColorIndex : 1;
  }

  /**
   * Check if level is complete
   */
  isLevelComplete(): boolean {
    return this.pyramid.isComplete();
  }

  /**
   * Advance to next level
   */
  advanceLevel(): void {
    this.currentLevel++;
    
    // Destroy old pyramid
    this.pyramid.destroy();
    
    // Create new pyramid with new target color
    this.pyramid = new Pyramid(this.scene, this.getTargetColorIndex());
  }

  /**
   * Reset to level 1
   */
  reset(): void {
    this.currentLevel = 1;
    this.pyramid.destroy();
    this.pyramid = new Pyramid(this.scene, this.getTargetColorIndex());
  }
}
