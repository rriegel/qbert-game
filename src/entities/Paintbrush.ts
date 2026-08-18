import Phaser from 'phaser';
import { Powerup } from './Powerup';

export class Paintbrush extends Powerup {
  private spinPhase: number = 0;

  constructor(scene: Phaser.Scene, row: number, col: number) {
    super(scene, row, col);
    this.lifetime = 15000; // 15 seconds
  }

  protected render(): void {
    this.graphics.clear();

    this.spinPhase += 0.05;

    // Main brush body
    this.graphics.fillStyle(0x8B4513, 0.9); // Brown handle
    this.graphics.fillRect(-3, -5, 6, 15);

    // Brush tip
    this.graphics.fillStyle(0xFF6B35, 0.9); // Orange bristles
    this.graphics.fillRect(-5, -10, 10, 5);

    // Paint drip effect
    this.graphics.fillStyle(0xFF6B35, 0.7);
    this.graphics.fillCircle(-2, -12, 2);
    this.graphics.fillCircle(2, -11, 2);

    // Sparkle effect
    const sparkleAlpha = Math.sin(this.spinPhase * 3) * 0.3 + 0.5;
    this.graphics.fillStyle(0xFFFFFF, sparkleAlpha);
    this.graphics.fillCircle(0, -15, 1.5);
  }

  update(): void {
    if (!this.isActive) return;
    this.render();
    super.update();
  }

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
