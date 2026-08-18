import Phaser from 'phaser';

export class ScoreSystem {
  private score: number = 0;
  private combo: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  private readonly BASE_POINTS = 25;
  private readonly LEVEL_BONUS_BASE = 250;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI(): void {
    this.scoreText = this.scene.add.text(10, 10, 'Score: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.scoreText.setScrollFactor(0);

    this.comboText = this.scene.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'monospace'
    });
    this.comboText.setScrollFactor(0);
  }

  public addCubeScore(): void {
    this.combo++;
    const multiplier = Math.min(this.combo, 4); // Cap at 4x
    const points = this.BASE_POINTS * multiplier;
    this.score += points;
    this.updateUI();

    // Show floating score text
    this.showFloatingScore(points, multiplier);
  }

  public addLevelBonus(level: number): void {
    const bonus = this.LEVEL_BONUS_BASE * level;
    this.score += bonus;
    this.updateUI();

    // Show floating bonus text
    const text = this.scene.add.text(400, 300, `Level Bonus: +${bonus}`, {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'monospace'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    this.scene.tweens.add({
      targets: text,
      y: 250,
      alpha: 0,
      duration: 1500,
      ease: 'Power2'
    });
  }

  public resetCombo(): void {
    this.combo = 0;
    this.updateUI();
  }

  public getScore(): number {
    return this.score;
  }

  public getCombo(): number {
    return this.combo;
  }

  public reset(): void {
    this.score = 0;
    this.combo = 0;
    this.updateUI();
  }

  private updateUI(): void {
    this.scoreText.setText(`Score: ${this.score}`);
    
    if (this.combo > 1) {
      const multiplier = Math.min(this.combo, 4);
      this.comboText.setText(`Combo: ${this.combo}x (×${multiplier})`);
    } else {
      this.comboText.setText('');
    }
  }

  private showFloatingScore(points: number, multiplier: number): void {
    const text = this.scene.add.text(400, 100, `+${points}`, {
      fontSize: '18px',
      color: multiplier >= 3 ? '#ff00ff' : multiplier >= 2 ? '#ffff00' : '#ffffff',
      fontFamily: 'monospace'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);

    this.scene.tweens.add({
      targets: text,
      y: 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2'
    });
  }
}
