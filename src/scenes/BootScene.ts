import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // For now, no assets to load — transition straight to the title screen.
    // Asset loading will be added here later.
    this.scene.start('TitleScene');
  }
}