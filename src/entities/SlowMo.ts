import Phaser from 'phaser';
import { Powerup } from './Powerup';

export class SlowMo extends Powerup {
  private pulsePhase: number = 0;

  constructor(scene: Phaser.Scene, row: number, col: number) {
    super(scene, row, col);
    this.lifetime = 15000; // 15 seconds
  }

  protected render(): void {
    this.graphics.clear();

    this.pulsePhase += 0.1;
    const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;

    // Outer glow
    this.graphics.fillStyle(0xFFEB3B, 0.3 * pulse);
    this.graphics.fillCircle(0, -10, 22);

    // Main orb
    this.graphics.fillStyle(0xFFEB3B, 0.7);
    this.graphics.fillCircle(0, -10, 15);

    // Inner highlight
    this.graphics.fillStyle(0xFFFFFF, 0.6);
    this.graphics.fillCircle(-3, -13, 5);

    // Clock symbol (simple lines)
    this.graphics.lineStyle(2, 0x000000, 0.8);
    this.graphics.strokeCircle(0, -10, 8);
    this.graphics.lineBetween(0, -10, 0, -14);
    this.graphics.lineBetween(0, -10, 3, -10);
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
