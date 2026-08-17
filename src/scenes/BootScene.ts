import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // For now, just transition to GameScene
    // Later we'll load assets here
    this.scene.start('GameScene');
  }
}
