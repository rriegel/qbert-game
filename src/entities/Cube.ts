import Phaser from 'phaser';
import { CUBE_WIDTH, CUBE_HEIGHT, COLORS } from '../config/constants';
import { gridToScreen } from '../utils/Isometric';

export class Cube {
  public row: number;
  public col: number;
  public colorIndex: number;
  public targetColorIndex: number;
  public graphics: Phaser.GameObjects.Graphics;
  public screenX: number;
  public screenY: number;

  constructor(
    scene: Phaser.Scene,
    row: number,
    col: number,
    targetColorIndex: number
  ) {
    this.row = row;
    this.col = col;
    this.colorIndex = 0;
    this.targetColorIndex = targetColorIndex;
    
    const screenPos = gridToScreen(row, col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;
    
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(row);
    this.render();
  }

  /**
   * Render the cube as three parallelograms (top, left, right faces)
   */
  render() {
    this.graphics.clear();
    
    const color = this.getColor();
    const darkColor = this.shadeColor(color, -30);
    const darkerColor = this.shadeColor(color, -50);
    
    const w = CUBE_WIDTH / 2;
    const h = CUBE_HEIGHT;
    
    // Top face (lightest)
    this.graphics.fillStyle(color, 1);
    this.graphics.fillPoints([
      new Phaser.Geom.Point(0, -h),
      new Phaser.Geom.Point(w, -h/2),
      new Phaser.Geom.Point(0, 0),
      new Phaser.Geom.Point(-w, -h/2)
    ], true);
    
    // Left face (darker)
    this.graphics.fillStyle(darkColor, 1);
    this.graphics.fillPoints([
      new Phaser.Geom.Point(-w, -h/2),
      new Phaser.Geom.Point(0, 0),
      new Phaser.Geom.Point(0, h),
      new Phaser.Geom.Point(-w, h/2)
    ], true);
    
    // Right face (darkest)
    this.graphics.fillStyle(darkerColor, 1);
    this.graphics.fillPoints([
      new Phaser.Geom.Point(w, -h/2),
      new Phaser.Geom.Point(0, 0),
      new Phaser.Geom.Point(0, h),
      new Phaser.Geom.Point(w, h/2)
    ], true);
    
    this.graphics.setPosition(this.screenX, this.screenY);
  }

  /**
   * Get the current color based on colorIndex
   */
  private getColor(): number {
    if (this.colorIndex === 0) return COLORS.CUBE_START;
    if (this.colorIndex >= this.targetColorIndex) return COLORS.CUBE_TARGET;
    return COLORS.CUBE_MID;
  }

  /**
   * Shade a color by a percentage
   */
  private shadeColor(color: number, percent: number): number {
    const R = (color >> 16) + Math.round(255 * percent / 100);
    const G = ((color >> 8) & 0x00FF) + Math.round(255 * percent / 100);
    const B = (color & 0x0000FF) + Math.round(255 * percent / 100);
    
    return (
      (Math.max(0, Math.min(255, R)) << 16) +
      (Math.max(0, Math.min(255, G)) << 8) +
      Math.max(0, Math.min(255, B))
    );
  }

  /**
   * Increment color index
   */
  incrementColor(): boolean {
    if (this.colorIndex < this.targetColorIndex) {
      this.colorIndex++;
      this.render();
      return true;
    }
    return false;
  }

  /**
   * Check if cube is at target color
   */
  isComplete(): boolean {
    return this.colorIndex >= this.targetColorIndex;
  }

  /**
   * Reset cube to initial state
   */
  reset(targetColorIndex: number) {
    this.colorIndex = 0;
    this.targetColorIndex = targetColorIndex;
    this.render();
  }
}
