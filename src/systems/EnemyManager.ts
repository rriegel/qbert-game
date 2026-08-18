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
  private collisionCooldown: number = 1000; // 1 second cooldown between collisions

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
  update(playerRow: number, playerCol: number): void {
    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        enemy.update();
        
        // Update Coily with player position
        if (enemy instanceof Coily) {
          enemy.setPlayerPosition(playerRow, playerCol);
        }
        
        // Check collision with player (respect cooldown)
        if (enemy.isAtPosition(playerRow, playerCol)) {
          const now = this.scene.time.now;
          if (now - this.lastCollisionTime > this.collisionCooldown) {
            this.lastCollisionTime = now;
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
