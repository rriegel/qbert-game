import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { COLORS, PYRAMID_ROWS } from '../../config/constants';

export class Coily extends Enemy {
  private isEgg: boolean = true;
  private moveTimer: Phaser.Time.TimerEvent;
  private moveInterval: number = 600;
  private playerRow: number = 0;
  private playerCol: number = 0;

  constructor(scene: Phaser.Scene, row: number = 0, col: number = 0) {
    super(scene, row, col);
    this.hopDuration = 350;
    
    // Start bouncing down as egg
    this.moveTimer = scene.time.addEvent({
      delay: this.moveInterval,
      loop: true,
      callback: () => this.move()
    });
  }

  protected render(): void {
    this.graphics.clear();
    
    if (this.isEgg) {
      // Draw egg (purple oval)
      this.graphics.fillStyle(COLORS.COILY, 1);
      this.graphics.fillEllipse(0, -12, 18, 24);
      
      // Highlight
      this.graphics.fillStyle(0xCE93D8, 1);
      this.graphics.fillCircle(-3, -16, 3);
    } else {
      // Draw snake (coiled purple snake)
      const radius = 14;
      
      // Body (coiled)
      this.graphics.fillStyle(COLORS.COILY, 1);
      this.graphics.fillCircle(0, -radius, radius);
      
      // Eyes
      this.graphics.fillStyle(0xFFFFFF, 1);
      this.graphics.fillCircle(-4, -radius - 2, 3);
      this.graphics.fillCircle(4, -radius - 2, 3);
      
      // Pupils
      this.graphics.fillStyle(0x000000, 1);
      this.graphics.fillCircle(-4, -radius - 2, 1.5);
      this.graphics.fillCircle(4, -radius - 2, 1.5);
    }
  }

  private move(): void {
    if (this.isHopping || !this.isAlive) return;
    
    if (this.isEgg) {
      // Egg bounces down randomly
      const goRight = Math.random() > 0.5;
      const targetRow = this.row + 1;
      const targetCol = goRight ? this.col + 1 : this.col;
      
      // If reached bottom, hatch
      if (targetRow >= PYRAMID_ROWS) {
        this.hatch();
        return;
      }
      
      this.hop(targetRow, targetCol, () => this.setEntered());
    } else {
      // Snake chases player
      this.chasePlayer();
    }
  }

  private hatch(): void {
    this.isEgg = false;
    this.moveInterval = 500; // Faster as snake
    this.moveTimer.reset({
      delay: this.moveInterval,
      loop: true,
      callback: () => this.move()
    });
    this.render();
  }

  private chasePlayer(): void {
    // Move toward player's position
    const rowDiff = this.playerRow - this.row;
    const colDiff = this.playerCol - this.col;
    
    let targetRow = this.row;
    let targetCol = this.col;
    
    // Try to match player's row first
    if (rowDiff > 0) {
      // Move down
      targetRow = this.row + 1;
      targetCol = this.col + (colDiff > 0 ? 1 : 0);
    } else if (rowDiff < 0) {
      // Move up
      targetRow = this.row - 1;
      targetCol = this.col + (colDiff > 0 ? 0 : -1);
    } else {
      // Same row, move horizontally
      targetCol = this.col + (colDiff > 0 ? 1 : -1);
      // Stay on same row by moving diagonally
      targetRow = this.row;
    }
    
    // Validate move is on pyramid
    if (targetRow < 0 || targetRow >= PYRAMID_ROWS) {
      return;
    }
    if (targetCol < 0 || targetCol > targetRow) {
      return;
    }
    
    this.hop(targetRow, targetCol);
  }

  /**
   * Update player position for chasing
   */
  setPlayerPosition(row: number, col: number): void {
    this.playerRow = row;
    this.playerCol = col;
  }

  /**
   * Check if this is still an egg
   */
  getIsEgg(): boolean {
    return this.isEgg;
  }

  destroy(): void {
    if (this.moveTimer) {
      this.moveTimer.destroy();
    }
    super.destroy();
  }
}
