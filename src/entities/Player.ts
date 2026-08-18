import Phaser from 'phaser';
import { gridToScreen } from '../utils/Isometric';

export class Player {
  public row: number;
  public col: number;
  public graphics: Phaser.GameObjects.Graphics;
  public screenX: number;
  public screenY: number;

  constructor(scene: Phaser.Scene, startRow: number = 0, startCol: number = 0) {
    this.row = startRow;
    this.col = startCol;

    const screenPos = gridToScreen(this.row, this.col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;

    this.graphics = scene.add.graphics();
    this.render();
  }

  /**
   * Render Q*bert as a simple orange circle (geometric placeholder)
   */
  render() {
    this.graphics.clear();

    // Body - orange circle
    this.graphics.fillStyle(0xff6600, 1);
    this.graphics.fillCircle(0, -20, 16);

    // Eyes - white circles
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(-6, -24, 5);
    this.graphics.fillCircle(6, -24, 5);

    // Pupils - black dots
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillCircle(-5, -23, 2);
    this.graphics.fillCircle(7, -23, 2);

    // Nose/snout - small orange triangle
    this.graphics.fillStyle(0xff6600, 1);
    this.graphics.fillTriangle(-4, -18, 4, -18, 0, -12);

    this.graphics.setPosition(this.screenX, this.screenY);
  }

  /**
   * Update screen position from grid coordinates
   */
  updatePosition() {
    const screenPos = gridToScreen(this.row, this.col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;
    this.graphics.setPosition(this.screenX, this.screenY);
  }

  /**
   * Destroy the player graphics
   */
  destroy() {
    this.graphics.destroy();
  }
}
