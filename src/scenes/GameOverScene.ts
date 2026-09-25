import Phaser from 'phaser';
import { HighScoreStorage, type SubmitScoreResult } from '../utils/Storage';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private finalLevel: number = 1;
  private submitResult: SubmitScoreResult | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; level: number }) {
    this.finalScore = data.score;
    this.finalLevel = data.level;
    this.submitResult = null;
  }

  create() {
    const storage = new HighScoreStorage();
    this.submitResult = storage.submitScore(this.finalScore, this.finalLevel);

    // Dark overlay
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);

    // Game Over text
    this.add
      .text(400, 120, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff0000',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 8
      })
      .setOrigin(0.5);

    // Final stats
    this.add
      .text(400, 210, `Final Score: ${this.finalScore.toLocaleString()}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      })
      .setOrigin(0.5);

    this.add
      .text(400, 260, `Level Reached: ${this.finalLevel}`, {
        fontSize: '24px',
        color: '#aaaaaa',
        fontFamily: 'Arial'
      })
      .setOrigin(0.5);

    // New high score banner
    if (this.submitResult.isNewHigh) {
      const banner = this.add
        .text(400, 305, '★ NEW HIGH SCORE ★', {
          fontSize: '28px',
          color: '#FFC107',
          fontFamily: 'Arial',
          fontStyle: 'bold'
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: banner,
        scale: { from: 1.0, to: 1.15 },
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.renderHighScores();

    // Restart prompt
    const restartText = this.add
      .text(400, 520, 'SPACE: Play Again    T: Title Screen', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
      })
      .setOrigin(0.5);

    // Blinking effect
    this.tweens.add({
      targets: restartText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Input handlers
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
    this.input.keyboard?.once('keydown-T', () => {
      this.scene.start('TitleScene');
    });
  }

  private renderHighScores(): void {
    const entries = this.submitResult?.entries ?? [];
    if (entries.length === 0) return;

    this.add
      .text(400, 360, 'HIGH SCORES', {
        fontSize: '20px',
        color: '#FFC107',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    entries.forEach((entry, index) => {
      const isThisRun =
        this.submitResult?.rank !== null &&
        this.submitResult?.rank === index + 1;
      const rank = `${index + 1}.`;
      const score = entry.score.toLocaleString();

      this.add
        .text(250, 395 + index * 24, rank, {
          fontSize: '16px',
          color: isThisRun ? '#FF6D00' : '#aaaaaa',
          fontFamily: 'monospace'
        })
        .setOrigin(0, 0.5);

      const scoreText = this.add
        .text(400, 395 + index * 24, score, {
          fontSize: '16px',
          color: isThisRun ? '#FF6D00' : '#ffffff',
          fontFamily: 'monospace',
          fontStyle: isThisRun ? 'bold' : 'normal'
        })
        .setOrigin(0.5, 0.5);

      if (isThisRun) {
        scoreText.setText(`▶ ${score}`);
      }

      this.add
        .text(550, 395 + index * 24, `Lvl ${entry.level}`, {
          fontSize: '14px',
          color: isThisRun ? '#FF6D00' : '#777777',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5, 0.5);
    });
  }
}