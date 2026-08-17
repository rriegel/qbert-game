import Phaser from 'phaser';
import { Pyramid } from '../entities/Pyramid';

export class GameScene extends Phaser.Scene {
  private pyramid!: Pyramid;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create pyramid with 2 color steps (Level 1)
    this.pyramid = new Pyramid(this, 1);
    
    // Add some debug text
    this.add.text(10, 10, 'Q*bert - Phase 1: Pyramid Rendering', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    this.add.text(10, 35, `Total cubes: ${this.pyramid.getTotalCubes()}`, {
      fontSize: '14px',
      color: '#ffffff'
    });
    
    this.add.text(10, 55, 'Press any cube to change its color', {
      fontSize: '12px',
      color: '#aaaaaa'
    });
    
    // Add click interaction for testing
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const x = pointer.x;
      const y = pointer.y;
      
      // Iterate bottom-to-top so visually-topmost cubes are checked first
      for (let row = this.pyramid.cubes.length - 1; row >= 0; row--) {
        for (let col = row; col >= 0; col--) {
          const cube = this.pyramid.cubes[row][col];
          const dx = Math.abs(x - cube.screenX);
          const dy = Math.abs(y - cube.screenY);
          
          if (dx < 32 && dy < 32) {
            cube.incrementColor();
            console.log(`Clicked cube at (${row}, ${col}), colorIndex: ${cube.colorIndex}`);
            return;
          }
        }
      }
    });
  }

  update() {
    // Game loop will go here
  }
}
