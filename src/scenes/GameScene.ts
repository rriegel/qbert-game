import Phaser from 'phaser';
import { Pyramid } from '../entities/Pyramid';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';

export class GameScene extends Phaser.Scene {
  private pyramid!: Pyramid;
  private player!: Player;
  private inputSystem!: InputSystem;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create pyramid with 2 color steps (Level 1)
    this.pyramid = new Pyramid(this, 1);
    
    // Create player at top of pyramid
    this.player = new Player(this, 0, 0);
    
    // Set up input system
    this.inputSystem = new InputSystem(this);
    
    // Add some debug text
    this.add.text(10, 10, 'Q*bert - Phase 2: Player Movement', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    this.add.text(10, 35, 'Use arrow keys to hop diagonally', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  update() {
    // Check for input and initiate hop if not already hopping
    if (!this.player.isHopping) {
      const direction = this.inputSystem.getDirection();
      if (direction) {
        this.player.hop(direction, () => {
          // After hop completes, check if player fell off (alpha = 0)
          if (this.player.graphics.alpha === 0) {
            // Reset after a short delay
            this.time.delayedCall(500, () => {
              this.player.reset();
            });
          } else {
            // Landed on pyramid - change cube color
            this.pyramid.changeCubeColor(this.player.row, this.player.col);
          }
        });
      }
    }
  }
}
