import Phaser from 'phaser';
import { Pyramid } from '../entities/Pyramid';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private pyramid!: Pyramid;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create pyramid with 2 color steps (Level 1)
    this.pyramid = new Pyramid(this, 1);
    
    // Create player at top of pyramid (will be used in next commit)
    new Player(this, 0, 0);
    
    // Add some debug text
    this.add.text(10, 10, 'Q*bert - Phase 2: Player Movement', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    this.add.text(10, 35, 'Use arrow keys to hop diagonally', {
      fontSize: '14px',
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
