import Phaser from 'phaser';
import { gridToScreen } from '../utils/Isometric';

export class Powerup {
  public row: number;
  public col: number;
  public graphics: Phaser.GameObjects.Graphics;
  public screenX: number;
  public screenY: number;
  public isActive: boolean = true;
  
  protected scene: Phaser.Scene;
  protected lifetime: number = 10000; // 10 seconds
  protected spawnTime: number;
  
  constructor(scene: Phaser.Scene, row: number, col: number) {
    this.scene = scene;
    this.row = row;
    this.col = col;
    this.spawnTime = scene.time.now;
    
    const screenPos = gridToScreen(row, col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;
    
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(row + 1);
    this.render();
  }
  
  /**
   * Render the powerup (override in subclasses)
   */
  protected render(): void {
    // Base implementation - override in subclasses
  }
  
  /**
   * Update the powerup state
   */
  update(): void {
    if (!this.isActive) return;
    
    // Check if lifetime expired
    if (this.scene.time.now - this.spawnTime > this.lifetime) {
      this.deactivate();
    }
  }
  
  /**
   * Deactivate and destroy the powerup
   */
  deactivate(): void {
    this.isActive = false;
    this.graphics.destroy();
  }
  
  /**
   * Check if a position matches this powerup
   */
  isAtPosition(row: number, col: number): boolean {
    return this.isActive && this.row === row && this.col === col;
  }
  
  /**
   * Destroy the powerup
   */
  destroy(): void {
    this.isActive = false;
    this.graphics.destroy();
  }
}
