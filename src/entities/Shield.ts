import Phaser from 'phaser';
import { Powerup } from './Powerup';

export class Shield extends Powerup {
  private pulsePhase: number = 0;
  
  constructor(scene: Phaser.Scene, row: number, col: number) {
    super(scene, row, col);
    this.lifetime = 15000; // 15 seconds
  }
  
  /**
   * Render the shield as a glowing cyan orb
   */
  protected render(): void {
    this.graphics.clear();
    
    // Pulsing effect
    this.pulsePhase += 0.1;
    const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
    
    // Outer glow
    this.graphics.fillStyle(0x03A9F4, 0.3 * pulse);
    this.graphics.fillCircle(0, -10, 22);
    
    // Main shield orb
    this.graphics.fillStyle(0x03A9F4, 0.7);
    this.graphics.fillCircle(0, -10, 15);
    
    // Inner highlight
    this.graphics.fillStyle(0xFFFFFF, 0.6);
    this.graphics.fillCircle(-3, -13, 5);
    
    // Shield symbol (simple circle outline)
    this.graphics.lineStyle(2, 0xFFFFFF, 0.8);
    this.graphics.strokeCircle(0, -10, 8);
  }
  
  /**
   * Update shield animation and lifetime
   */
  update(): void {
    if (!this.isActive) return;
    
    // Update pulse animation
    this.render();
    
    // Check lifetime
    super.update();
  }
  
  /**
   * Animate collection (shield absorb effect)
   */
  animateCollection(onComplete: () => void): void {
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      scale: 2,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
        onComplete();
      }
    });
  }
}
