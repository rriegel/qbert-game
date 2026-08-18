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
  public hasShield: boolean = false;
  public powerupManager: any = null; // Will be set by GameScene
  
  private scene: Phaser.Scene;
  private shieldGraphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, startRow: number = 0, startCol: number = 0) {
    this.scene = scene;
    this.row = startRow;
    this.col = startCol;

    const screenPos = gridToScreen(this.row, this.col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(this.row + 1);
    this.render();
  }

  /**
   * Activate shield (protects from one enemy hit)
   */
  activateShield(): void {
    this.hasShield = true;
    
    // Create shield glow effect
    if (this.shieldGraphics) {
      this.shieldGraphics.destroy();
    }
    this.shieldGraphics = this.scene.add.graphics();
    this.shieldGraphics.setDepth(this.row + 1.5);
    
    // Pulsing cyan glow around player
    this.scene.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: 1000,
      repeat: -1,
      onUpdate: (tween) => {
        if (!this.hasShield || !this.shieldGraphics) return;
        
        const phase = tween.getValue() ?? 0;
        const alpha = Math.sin(phase) * 0.3 + 0.5;
        
        this.shieldGraphics.clear();
        this.shieldGraphics.fillStyle(0x03A9F4, alpha);
        this.shieldGraphics.fillCircle(0, -20, 22);
        this.shieldGraphics.lineStyle(2, 0xFFFFFF, 0.8);
        this.shieldGraphics.strokeCircle(0, -20, 22);
        
        this.shieldGraphics.setPosition(this.screenX, this.screenY);
      }
    });
  }

  /**
   * Consume shield (called when hit by enemy)
   */
  consumeShield(): void {
    this.hasShield = false;
    if (this.shieldGraphics) {
      this.shieldGraphics.destroy();
      this.shieldGraphics = undefined;
    }
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
    
    // Update shield position if active
    if (this.shieldGraphics && this.hasShield) {
      this.shieldGraphics.setPosition(this.screenX, this.screenY);
    }
  }

  /**
   * Update screen position from grid coordinates
   */
  updatePosition() {
    const screenPos = gridToScreen(this.row, this.col);
    this.screenX = screenPos.x;
    this.screenY = screenPos.y;
    this.graphics.setDepth(this.row + 1);
    this.graphics.setPosition(this.screenX, this.screenY);
    
    // Update shield position if active
    if (this.shieldGraphics && this.hasShield) {
      this.shieldGraphics.setPosition(this.screenX, this.screenY);
    }
  }

  /**
   * Check if a grid position is valid (on the pyramid)
   */
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 7 && col >= 0 && col <= row;
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
    
    // Check if target is valid
    if (!this.isValidPosition(targetRow, targetCol)) {
      // Check if there's a disk to land on
      if (this.powerupManager) {
        const disk = this.powerupManager.checkDiskLanding(this.row, this.col, direction);
        if (disk) {
          // Hop to the disk and teleport to top
          this.hopToDisk(disk, onComplete);
          return true;
        }
      }
      // Fall off the edge
      this.fall(direction, onComplete);
      return true;
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
   * Hop to a disk and teleport to top
   */
  private hopToDisk(disk: any, onComplete?: () => void) {
    this.isHopping = true;
    
    // Get disk screen position
    const targetScreen = { x: disk.screenX, y: disk.screenY };
    const startX = this.screenX;
    const startY = this.screenY;
    const dx = targetScreen.x - startX;
    const dy = targetScreen.y - startY;
    
    // Parabolic hop animation
    const duration = 300;
    const hopHeight = 60;
    
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        const x = startX + dx * t;
        const arcOffset = -4 * hopHeight * t * (1 - t);
        const y = startY + dy * t + arcOffset;
        
        this.graphics.setPosition(x, y);
      },
      onComplete: () => {
        // Collect the disk and teleport to top
        this.powerupManager.collectDisk(disk, this);
        this.isHopping = false;
        onComplete?.();
      }
    });
  }

  /**
   * Fall off the edge of the pyramid
   */
  private fall(direction: Direction, onComplete?: () => void) {
    // Continue in the direction but fall downward
    const fallDistance = 200;
    const startX = this.screenX;
    const startY = this.screenY;
    
    // Determine fall direction offset
    let offsetX = 0;
    let offsetY = fallDistance;
    
    switch (direction) {
      case 'up-left':
        offsetX = -40;
        break;
      case 'up-right':
        offsetX = 40;
        break;
      case 'down-left':
        offsetX = -40;
        break;
      case 'down-right':
        offsetX = 40;
        break;
    }
    
    this.scene.tweens.add({
      targets: this.graphics,
      x: startX + offsetX,
      y: startY + offsetY,
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.isHopping = false;
        onComplete?.();
      }
    });
  }

  /**
   * Reset player to starting position
   */
  reset() {
    this.row = 0;
    this.col = 0;
    this.graphics.setAlpha(1);
    this.updatePosition();
  }

  /**
   * Destroy the player graphics
   */
  destroy() {
    this.graphics.destroy();
  }
}
