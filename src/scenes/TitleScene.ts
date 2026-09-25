import Phaser from 'phaser';
import { HighScoreStorage, type HighScoreEntry } from '../utils/Storage';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x1a0a2e).setDepth(0);

    this.add
      .text(400, 110, 'Q*BERT', {
        fontSize: '72px',
        color: '#FF6D00',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(400, 175, 'A modern tribute to the arcade classic', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'Arial'
      })
      .setOrigin(0.5);

    this.renderHighScores();

    this.renderControls();

    const prompt = this.add
      .text(400, 510, 'PRESS SPACE TO START', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Small delay before accepting input so a held/queued key from the game
    // over screen does not instantly skip the title screen.
    this.time.delayedCall(400, () => {
      this.input.keyboard?.once('keydown-SPACE', () => {
        this.scene.start('GameScene');
      });
    });
  }

  private renderHighScores(): void {
    const storage = new HighScoreStorage();
    const scores: HighScoreEntry[] = storage.getHighScores();

    this.add
      .text(400, 230, 'HIGH SCORES', {
        fontSize: '22px',
        color: '#FFC107',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    if (scores.length === 0) {
      this.add
        .text(400, 265, 'No scores yet — be the first!', {
          fontSize: '16px',
          color: '#777777',
          fontFamily: 'Arial'
        })
        .setOrigin(0.5);
      return;
    }

    scores.forEach((entry, index) => {
      const rank = `${index + 1}.`.padStart(3, ' ');
      const score = entry.score.toLocaleString();
      const lineY = 265 + index * 28;
      this.add
        .text(280, lineY, rank.trim(), {
          fontSize: '16px',
          color: '#aaaaaa',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5);
      this.add
        .text(400, lineY, score, {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5);
      this.add
        .text(520, lineY, `Lvl ${entry.level}`, {
          fontSize: '14px',
          color: '#777777',
          fontFamily: 'monospace'
        })
        .setOrigin(0.5);
    });
  }

  private renderControls(): void {
    this.add
      .text(400, 440, 'CONTROLS', {
        fontSize: '18px',
        color: '#FFC107',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(
        400,
        468,
        'Move: Arrow Keys or WASD\n↑/W ↗    ←/A ↖    ↓/S ↙    →/D ↘',
        {
          fontSize: '15px',
          color: '#aaaaaa',
          fontFamily: 'monospace',
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5);
  }
}