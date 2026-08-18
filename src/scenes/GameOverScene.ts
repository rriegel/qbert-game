import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private finalLevel: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; level: number }) {
    this.finalScore = data.score;
    this.finalLevel = data.level;
  }

  create() {
    // Dark overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    // Game Over text
    this.add.text(400, 200, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Final stats
    this.add.text(400, 300, `Final Score: ${this.finalScore}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(400, 350, `Level Reached: ${this.finalLevel}`, {
      fontSize: '24px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Restart prompt
    const restartText = this.add.text(400, 450, 'Press SPACE to Play Again', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Blinking effect
    this.tweens.add({
      targets: restartText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Input handler
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
