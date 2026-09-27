import Phaser from 'phaser';
import { Powerup } from './Powerup';
import { gridToScreen } from '../utils/Isometric';
import { CUBE_WIDTH, CUBE_HEIGHT } from '../config/constants';

/**
 * Classic Q*bert disc: a floating platform beside the pyramid that Q*bert
 * hops onto, rides to the top, and is consumed. Spawns at level start and
 * persists until used or the level ends (no random expiry).
 */
export class Disk extends Powerup {
  private floatOffset: number = 0;
  private floatDirection: number = 1;
  public side: 'left' | 'right';
  /** True while the ride tween owns this disc's position (bob suspended). */
  public riding: boolean = false;

  constructor(scene: Phaser.Scene, row: number, col: number, side: 'left' | 'right') {
    super(scene, row, col);
    this.side = side;
    this.lifetime = Infinity; // persists until used or cleared at level end

    // Position OUTSIDE the pyramid silhouette. 1.1 cube-widths clears the
    // cube faces of the rows below the edge cube (0.7 overlapped them, making
    // the disc look like it sat ON the pyramid).
    const edgePos = gridToScreen(row, col);
    if (side === 'left') {
      this.screenX = edgePos.x - CUBE_WIDTH * 1.1;
      this.screenY = edgePos.y - CUBE_HEIGHT * 0.4;
    } else {
      this.screenX = edgePos.x + CUBE_WIDTH * 1.1;
      this.screenY = edgePos.y - CUBE_HEIGHT * 0.4;
    }
    this.graphics.setPosition(this.screenX, this.screenY);
  }

  /**
   * Render the disc as a floating elliptical platform with rotating hue.
   */
  protected render(): void {
    this.graphics.clear();

    // Rotating rainbow hue
    const hue = (this.scene.time.now / 12) % 360;
    const color = Phaser.Display.Color.HSVToRGB(hue / 360, 0.9, 1).color;
    const darker = Phaser.Display.Color.HSVToRGB(hue / 360, 0.9, 0.45).color;

    // Base/rim (thickness below the top face → reads as a 3D platform)
    this.graphics.fillStyle(darker, 0.9);
    this.graphics.fillEllipse(0, -4, 56, 18);

    // Top face
    this.graphics.fillStyle(color, 0.95);
    this.graphics.fillEllipse(0, -10, 56, 18);

    // Highlight sweep
    this.graphics.fillStyle(0xFFFFFF, 0.25);
    this.graphics.fillEllipse(-8, -14, 24, 8);
  }

  /**
   * Update disc animation. Lifetime never expires (see constructor) —
   * the disc persists until ridden or cleared at level end.
   */
  update(): void {
    if (!this.isActive) return;
    if (this.riding) return; // ride tween owns position during the ride

    // Gentle bob
    this.floatOffset += 0.5 * this.floatDirection;
    if (this.floatOffset > 5 || this.floatOffset < -5) {
      this.floatDirection *= -1;
    }
    this.graphics.y = this.screenY + this.floatOffset;

    this.render();
  }

  /**
   * Move the disc during the ride (called by PowerupManager's ride tween).
   * Suspends the bob so the tween and update() don't fight over position.
   */
  setRidePosition(x: number, y: number): void {
    this.riding = true;
    this.screenY = y;
    this.graphics.setPosition(x, y);
  }

  /**
   * Consume the disc after a ride: quick dissolve at the top.
   */
  consume(): void {
    this.riding = false;
    this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      scale: 0.5,
      duration: 250,
      ease: 'Cubic.easeIn',
      onComplete: () => this.destroy()
    });
  }

  /**
   * Check if a player hopping off this edge in this direction should land
   * on this disc. Only the genuinely outward hop counts — the other two
   * directions land on valid cubes inside the pyramid and must NOT catch.
   * Left edge (col=0): outward = up-left. Right edge (col=row): outward =
   * up-right (down-right lands on (row+1, col+1), a valid cube).
   */
  isTargetForHop(fromRow: number, fromCol: number, direction: 'up-left' | 'up-right' | 'down-left' | 'down-right'): boolean {
    if (this.side === 'left') {
      return fromCol === 0 && fromRow === this.row && direction === 'up-left';
    }
    return fromCol === fromRow && fromRow === this.row && direction === 'up-right';
  }
}