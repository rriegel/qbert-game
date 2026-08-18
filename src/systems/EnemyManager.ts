import Phaser from 'phaser';
import { Enemy } from '../entities/enemies/Enemy';
import { RedBall } from '../entities/enemies/RedBall';
import { Coily } from '../entities/enemies/Coily';
import { Slick } from '../entities/enemies/Slick';
import { Pyramid } from '../entities/Pyramid';

export class EnemyManager {
  private scene: Phaser.Scene;
  private pyramid: Pyramid;
  private enemies: Enemy[] = [];
  private spawnTimer: Phaser.Time.TimerEvent;
  private spawnInterval: number = 5000;
  private currentLevel: number = 1;
  private onPlayerDeath: (() => void) | null = null;
  private lastCollisionTime: number = 0;
  private collisionCooldown: number = 2000; // 2 second cooldown between collisions
  private framesSinceCollision: number = 999; // Frame-based cooldown
  private minFramesBetweenCollisions: number = 60; // At least 60 frames (1 second at 60fps)

  constructor(scene: Phaser.Scene, pyramid: Pyramid) {
    this.scene = scene;
    this.pyramid = pyramid;
    
    // Start spawning enemies
    this.spawnTimer = scene.time.addEvent({
      delay: this.spawnInterval,
      loop: true,
      callback: () => this.spawnEnemy()
    });
  }

  /**
   * Set callback for when player collides with enemy
   */
  setOnPlayerDeath(callback: () => void): void {
    this.onPlayerDeath = callback;
  }

  /**
   * Reset collision cooldown (called when player becomes invulnerable)
   */
  resetCollisionCooldown(): void {
    this.lastCollisionTime = this.scene.time.now;
    this.framesSinceCollision = 0;
  }

  /**
   * Update level to adjust spawn rates
   */
  setLevel(level: number): void {
    this.currentLevel = level;
    // Spawn faster at higher levels
    this.spawnInterval = Math.max(2000, 5000 - (level - 1) * 500);
    this.spawnTimer.reset({
      delay: this.spawnInterval,
      loop: true,
      callback: () => this.spawnEnemy()
    });
  }

  /**
   * Update all enemies without checking collisions (during invulnerability)
   */
  updateWithoutCollision(): void {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        enemy.update();
      }
    }
    this.enemies = this.enemies.filter(e => e.isAlive);
  }

  /**
   * Spawn a random enemy
   */
  private spawnEnemy(): void {
    const rand = Math.random();
    
    if (this.currentLevel >= 3 && rand < 0.3) {
      // Spawn Slick (from level 3+)
      const slick = new Slick(this.scene, 0, 0);
      slick.setOnRevertCube((row, col) => {
        this.pyramid.resetCubeColor(row, col);
      });
      this.enemies.push(slick);
    } else if (this.currentLevel >= 2 && rand < 0.6) {
      // Spawn Coily (from level 2+)
      const coily = new Coily(this.scene, 0, 0);
      this.enemies.push(coily);
    } else {
      // Spawn Red Ball
      const redBall = new RedBall(this.scene, 0, 0);
      this.enemies.push(redBall);
    }
  }

  /**
   * Update all enemies and check collisions
   */
  update(playerRow: number, playerCol: number, isInvulnerable: boolean = false): void {
    let collisionDetected = false;
    this.framesSinceCollision++;
    
    // Skip collision detection if player is invulnerable
    if (isInvulnerable) {
      // Still update enemies
      for (const enemy of this.enemies) {
        if (enemy.isAlive) {
          enemy.update();
          if (enemy instanceof Coily) {
            enemy.setPlayerPosition(playerRow, playerCol);
          }
        }
      }
      this.enemies = this.enemies.filter(e => e.isAlive);
      return;
    }
    
    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        enemy.update();
        
        // Update Coily with player position
        if (enemy instanceof Coily) {
          enemy.setPlayerPosition(playerRow, playerCol);
        }
        
        // Check collision with player (only if no collision this frame and enough frames have passed)
        if (!collisionDetected && enemy.isAtPosition(playerRow, playerCol)) {
          const now = this.scene.time.now;
          if (now - this.lastCollisionTime > this.collisionCooldown && this.framesSinceCollision >= this.minFramesBetweenCollisions) {
            this.lastCollisionTime = now;
            this.framesSinceCollision = 0;
            collisionDetected = true;
            if (this.onPlayerDeath) {
              this.onPlayerDeath();
            }
          }
        }
      }
    }
    
    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.isAlive);
  }

  /**
   * Destroy all enemies
   */
  destroy(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
  }
}
