import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { COLORS } from '../../config/constants';

export class Slick extends Enemy {
  private moveTimer!: Phaser.Time.TimerEvent;
  private moveInterval: number = 700;
  private onRevertCube: ((row: number, col: number) => void) | null = null;

  constructor(scene: Phaser.Scene, row: number = 0, col: number = 0) {
    super(scene, row, col);
    this.hopDuration = 350;
    
    // Animate entry from bottom, then start moving
    this.enterFromBottom(() => {
      this.moveTimer = scene.time.addEvent({
        delay: this.moveInterval,
        loop: true,
        callback: () => this.move()
      });
    });
  }

  protected render(): void {
    this.graphics.clear();
    
    // Draw Slick as a green gremlin
    const radius = 14;
    
    // Body
    this.graphics.fillStyle(COLORS.SLICK_SAM, 1);
    this.graphics.fillCircle(0, -radius, radius);
    
    // Eyes
    this.graphics.fillStyle(0xFFFFFF, 1);
    this.graphics.fillCircle(-4, -radius - 2, 3);
    this.graphics.fillCircle(4, -radius - 2, 3);
    
    // Mischievous grin
    this.graphics.lineStyle(2, 0x000000, 1);
    this.graphics.strokePoints([
      new Phaser.Geom.Point(-6, -radius + 4),
      new Phaser.Geom.Point(0, -radius + 6),
      new Phaser.Geom.Point(6, -radius + 4)
    ], false);
  }

  private move(): void {
    if (this.isHopping || !this.isAlive) return;
    
    // Move up randomly (spawns from bottom)
    const goRight = Math.random() > 0.5;
    const targetRow = this.row - 1;
    const targetCol = goRight ? this.col : this.col - 1;
    
    // If off the pyramid, hop off upward
    if (targetRow < 0 || targetCol < 0 || targetCol > targetRow) {
      this.hopOff(targetRow, targetCol, () => {
        this.destroy();
      });
      return;
    }
    
    this.hop(targetRow, targetCol, () => {
      // Revert the cube color when landing
      if (this.onRevertCube) {
        this.onRevertCube(this.row, this.col);
      }
    });
  }

  /**
   * Set callback for when Slick reverts a cube
   */
  setOnRevertCube(callback: (row: number, col: number) => void): void {
    this.onRevertCube = callback;
  }

  destroy(): void {
    if (this.moveTimer) {
      this.moveTimer.destroy();
    }
    super.destroy();
  }
}
