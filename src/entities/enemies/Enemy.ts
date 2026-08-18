import Phaser from 'phaser';
import { gridToScreen } from '../../utils/Isometric';

export type EnemyDirection = 'down-left' | 'down-right';

export abstract class Enemy {
  public row: number;
  public col: number;
  public graphics: Phaser.GameObjects.Graphics;
  public screenX: number;
  public screenY: number;
  public isAlive: boolean = true;
  
  protected scene: Phaser.Scene;
  protected hopDuration: number = 400;
  protected isHopping: boolean = false;

  constructor(scene: Phaser.Scene, row: number, col: number) {
    this.scene = scene;
    this.row = row;
    this.col = col;
    
    const screenPos = gridToScreen(row, col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;
    
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(row + 1);
    this.render();
  }

  /**
   * Render the enemy - must be implemented by subclasses
   */
  protected abstract render(): void;

  /**
   * Update enemy position and state
   */
  update(): void {
    // Override in subclasses
  }

  /**
   * Hop to a new position with animation
   */
  protected hop(targetRow: number, targetCol: number, onComplete?: () => void): void {
    if (this.isHopping) return;
    
    this.isHopping = true;
    this.row = targetRow;
    this.col = targetCol;
    
    const targetPos = gridToScreen(targetRow, targetCol);
    const startX = this.screenX;
    const startY = this.screenY;
    
    // Update depth for proper layering
    this.graphics.setDepth(targetRow + 1);
    
    // Animate hop with arc
    this.scene.tweens.add({
      targets: this.graphics,
      x: targetPos.x,
      y: targetPos.y,
      duration: this.hopDuration,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        const progress = tween.progress;
        // Add arc (jump up and down)
        const arcHeight = -30;
        const arc = arcHeight * Math.sin(progress * Math.PI);
        this.graphics.y = targetPos.y + arc;
      },
      onComplete: () => {
        this.screenX = targetPos.x;
        this.screenY = targetPos.y;
        this.graphics.setPosition(this.screenX, this.screenY);
        this.isHopping = false;
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Check if enemy is at the same position as another entity
   */
  isAtPosition(row: number, col: number): boolean {
    return this.row === row && this.col === col;
  }

  /**
   * Destroy the enemy
   */
  destroy(): void {
    this.isAlive = false;
    this.graphics.destroy();
  }
}
