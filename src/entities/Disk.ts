import Phaser from 'phaser';
import { Powerup } from './Powerup';
import { gridToScreen } from '../utils/Isometric';
import { CUBE_WIDTH, CUBE_HEIGHT } from '../config/constants';

export class Disk extends Powerup {
  private floatOffset: number = 0;
  private floatDirection: number = 1;
  public side: 'left' | 'right';
  
  constructor(scene: Phaser.Scene, row: number, col: number, side: 'left' | 'right') {
    super(scene, row, col);
    this.side = side;
    this.lifetime = 15000; // 15 seconds
    
    // Override screen position to be offset OUTSIDE the pyramid edge
    const edgePos = gridToScreen(row, col);
    if (side === 'left') {
      // Offset to the left of the left edge
      this.screenX = edgePos.x - CUBE_WIDTH * 0.7;
      this.screenY = edgePos.y - CUBE_HEIGHT * 0.2;
    } else {
      // Offset to the right of the right edge
      this.screenX = edgePos.x + CUBE_WIDTH * 0.7;
      this.screenY = edgePos.y - CUBE_HEIGHT * 0.2;
    }
    this.graphics.setPosition(this.screenX, this.screenY);
  }
  
  /**
   * Render the disk as a floating rainbow platform
   */
  protected render(): void {
    this.graphics.clear();
    
    // Rainbow disk (simplified as colorful circle)
    const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082];
    const colorIndex = Math.floor((this.scene.time.now / 100) % colors.length);
    
    // Outer glow
    this.graphics.fillStyle(colors[colorIndex], 0.3);
    this.graphics.fillCircle(0, -10, 24);
    
    // Main disk
    this.graphics.fillStyle(colors[colorIndex], 0.8);
    this.graphics.fillCircle(0, -10, 18);
    
    // Inner highlight
    this.graphics.fillStyle(0xFFFFFF, 0.5);
    this.graphics.fillCircle(-4, -14, 6);
  }
  
  /**
   * Update disk animation and lifetime
   */
  update(): void {
    if (!this.isActive) return;
    
    // Float animation
    this.floatOffset += 0.5 * this.floatDirection;
    if (this.floatOffset > 5 || this.floatOffset < -5) {
      this.floatDirection *= -1;
    }
    
    this.graphics.y = this.screenY + this.floatOffset;
    
    // Update rainbow colors
    this.render();
    
    // Check lifetime
    super.update();
  }
  
  /**
   * Check if a player hopping off this edge in this direction should land on this disk
   */
  isTargetForHop(fromRow: number, fromCol: number, direction: 'up-left' | 'up-right' | 'down-left' | 'down-right'): boolean {
    if (this.side === 'left') {
      // Player is on left edge (col=0) and hops up-left or down-left
      if (fromCol === 0 && fromRow === this.row) {
        return direction === 'up-left' || direction === 'down-left';
      }
    } else {
      // Player is on right edge (col=row) and hops up-right or down-right
      if (fromCol === fromRow && fromRow === this.row) {
        return direction === 'up-right' || direction === 'down-right';
      }
    }
    return false;
  }
  
  /**
   * Animate collection (teleport effect)
   */
  animateCollection(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
        onComplete();
      }
    });
  }
}
