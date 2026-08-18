import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { COLORS, PYRAMID_ROWS } from '../../config/constants';

export class Coily extends Enemy {
  private isEgg: boolean = true;
  private moveTimer!: Phaser.Time.TimerEvent;
  private moveInterval: number = 600;
  private playerRow: number = 0;
  private playerCol: number = 0;

  constructor(scene: Phaser.Scene, row: number = 0, col: number = 0) {
    super(scene, row, col);
    this.hopDuration = 350;
    
    // Start moving immediately (egg bounces down from top)
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
      // Egg bounces DOWN randomly (spawns from top)
      const goRight = Math.random() > 0.5;
      const targetRow = this.row + 1; // Move DOWN
      const targetCol = goRight ? this.col + 1 : this.col;
      
      // If reached bottom of pyramid, hatch into snake
      if (targetRow >= PYRAMID_ROWS) {
        this.hatch();
        return;
      }
      
      // Validate column is on pyramid
      if (targetCol < 0 || targetCol > targetRow) {
        // Bounce off edge - try other direction
        const altCol = goRight ? this.col : this.col + 1;
        if (altCol >= 0 && altCol <= targetRow) {
          this.hop(targetRow, altCol);
        } else {
          // Can't move, just hatch here
          this.hatch();
        }
        return;
      }
      
      this.hop(targetRow, targetCol);
    } else {
      // Snake chases player aggressively
      this.chasePlayer();
    }
  }

  private hatch(): void {
    this.isEgg = false;
    this.moveInterval = 450; // Faster as snake
    this.moveTimer.reset({
      delay: this.moveInterval,
      loop: true,
      callback: () => this.move()
    });
    this.render();
  }

  private chasePlayer(): void {
    // Move toward player's position - snake is aggressive and moves every tick
    const rowDiff = this.playerRow - this.row;
    const colDiff = this.playerCol - this.col;
    
    let targetRow = this.row;
    let targetCol = this.col;
    
    // Try to match player's row first, then column
    if (rowDiff > 0) {
      // Move down toward player
      targetRow = this.row + 1;
      targetCol = this.col + (colDiff > 0 ? 1 : 0);
    } else if (rowDiff < 0) {
      // Move up toward player
      targetRow = this.row - 1;
      targetCol = this.col + (colDiff > 0 ? 0 : -1);
    } else {
      // Same row, move horizontally toward player
      if (colDiff > 0) {
        // Player is to the right - move down-right
        targetRow = this.row + 1;
        targetCol = this.col + 1;
      } else if (colDiff < 0) {
        // Player is to the left - move down-left
        targetRow = this.row + 1;
        targetCol = this.col;
      } else {
        // Same position - shouldn't happen but stay put
        return;
      }
    }
    
    // Validate move is on pyramid
    if (targetRow < 0 || targetRow >= PYRAMID_ROWS) {
      // Hop off the pyramid (fall to death)
      this.hopOff(targetRow, targetCol, () => {
        this.destroy();
      });
      return;
    }
    if (targetCol < 0 || targetCol > targetRow) {
      // Invalid position - try to stay on pyramid
      // Clamp column to valid range
      targetCol = Math.max(0, Math.min(targetRow, targetCol));
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
