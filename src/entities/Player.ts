import Phaser from 'phaser';
import { gridToScreen } from '../utils/Isometric';
import { Direction } from '../systems/InputSystem';

export class Player {
  public row: number;
  public col: number;
  public graphics: Phaser.GameObjects.Graphics;
  public screenX: number;
  public screenY: number;
  public isHopping: boolean = false;
  
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, startRow: number = 0, startCol: number = 0) {
    this.scene = scene;
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
   * Hop in the given direction with a parabolic arc animation.
   * Returns true if hop started, false if already hopping.
   */
  hop(direction: Direction, onComplete?: () => void): boolean {
    if (this.isHopping) return false;
    
    this.isHopping = true;
    
    // Calculate target grid position
    let targetRow = this.row;
    let targetCol = this.col;
    
    switch (direction) {
      case 'up-left':
        targetRow--;
        targetCol--;
        break;
      case 'up-right':
        targetRow--;
        break;
      case 'down-left':
        targetRow++;
        break;
      case 'down-right':
        targetRow++;
        targetCol++;
        break;
    }
    
    // Get target screen position
    const targetScreen = gridToScreen(targetRow, targetCol);
    const startX = this.screenX;
    const startY = this.screenY;
    const dx = targetScreen.x - startX;
    const dy = targetScreen.y - startY;
    
    // Parabolic hop animation (300ms)
    const duration = 300;
    const hopHeight = 60; // pixels up at peak
    
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        // Horizontal: linear interpolation
        const x = startX + dx * t;
        // Vertical: parabolic arc (goes up then down)
        const arcOffset = -4 * hopHeight * t * (1 - t);
        const y = startY + dy * t + arcOffset;
        
        this.graphics.setPosition(x, y);
      },
      onComplete: () => {
        // Update grid position
        this.row = targetRow;
        this.col = targetCol;
        this.updatePosition();
        this.isHopping = false;
        onComplete?.();
      }
    });
    
    return true;
  }

  /**
   * Destroy the player graphics
   */
  destroy() {
    this.graphics.destroy();
  }
}
