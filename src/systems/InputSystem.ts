import Phaser from 'phaser';

export type Direction = 'up-left' | 'up-right' | 'down-left' | 'down-right';

export class InputSystem {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene) {
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = scene.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as typeof this.wasd;
    }
  }

  /**
   * Get the direction the player wants to move, or null if no input.
   * Arrow keys and WASD both work.
   * 
   * Mapping (matches visual diamond pattern):
   * - Up arrow / W → up-right (↗)
   * - Left arrow / A → up-left (↖)
   * - Down arrow / S → down-left (↙)
   * - Right arrow / D → down-right (↘)
   */
  getDirection(): Direction | null {
    if (this.cursors.up?.isDown || this.wasd.W.isDown) return 'up-right';
    if (this.cursors.left?.isDown || this.wasd.A.isDown) return 'up-left';
    if (this.cursors.down?.isDown || this.wasd.S.isDown) return 'down-left';
    if (this.cursors.right?.isDown || this.wasd.D.isDown) return 'down-right';
    return null;
  }
}
