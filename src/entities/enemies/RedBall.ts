import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { COLORS, PYRAMID_ROWS } from '../../config/constants';

export class RedBall extends Enemy {
  private moveTimer: Phaser.Time.TimerEvent;
  private moveInterval: number = 800;

  constructor(scene: Phaser.Scene, row: number = 0, col: number = 0) {
    super(scene, row, col);
    this.hopDuration = 350;
    
    // Start moving after a brief delay
    this.moveTimer = scene.time.addEvent({
      delay: this.moveInterval,
      loop: true,
      callback: () => this.move()
    });
  }

  protected render(): void {
    this.graphics.clear();
    
    // Draw red ball as a circle with shading
    const radius = 14;
    
    // Main body
    this.graphics.fillStyle(COLORS.RED_BALL, 1);
    this.graphics.fillCircle(0, -radius, radius);
    
    // Highlight
    this.graphics.fillStyle(0xFF8A80, 1);
    this.graphics.fillCircle(-4, -radius - 4, 4);
  }

  private move(): void {
    if (this.isHopping || !this.isAlive) return;
    
    // Randomly choose down-left or down-right
    const goRight = Math.random() > 0.5;
    const targetRow = this.row + 1;
    const targetCol = goRight ? this.col + 1 : this.col;
    
    // If off the pyramid, destroy self
    if (targetRow >= PYRAMID_ROWS) {
      this.destroy();
      return;
    }
    
    this.hop(targetRow, targetCol, () => this.setEntered());
  }

  destroy(): void {
    if (this.moveTimer) {
      this.moveTimer.destroy();
    }
    super.destroy();
  }
}
