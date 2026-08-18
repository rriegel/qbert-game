import Phaser from 'phaser';
import { Powerup } from './Powerup';

export class Disk extends Powerup {
  private floatOffset: number = 0;
  private floatDirection: number = 1;
  
  constructor(scene: Phaser.Scene, row: number, col: number) {
    super(scene, row, col);
    this.lifetime = 10000; // 10 seconds
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
