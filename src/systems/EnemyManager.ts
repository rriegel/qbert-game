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
  private collisionCooldown: number = 5000; // 5 second cooldown between collisions
  private framesSinceCollision: number = 999; // Frame-based cooldown
  private minFramesBetweenCollisions: number = 120; // At least 120 frames (2 seconds at 60fps)
  private isPaused: boolean = false;

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
   * Pause enemy movement (during level transition)
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume enemy movement
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Re-sync the pyramid reference after a level transition.
   * LevelSystem.advanceLevel() destroys the old pyramid; enemies (e.g. Slick
   * reverting cube colors) would otherwise touch the destroyed instance.
   */
  setPyramid(pyramid: Pyramid): void {
    this.pyramid = pyramid;
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
      // Spawn Slick from bottom (randomly left or right)
      const spawnCol = Math.random() > 0.5 ? 0 : 6;
      const slick = new Slick(this.scene, 6, spawnCol);
      slick.setOnRevertCube((row, col) => {
        this.pyramid.resetCubeColor(row, col);
      });
      this.enemies.push(slick);
    } else if (this.currentLevel >= 2 && rand < 0.6) {
      // Spawn Coily from top (row 0, col 0) - egg bounces down
      const coily = new Coily(this.scene, 0, 0);
      this.enemies.push(coily);
    } else {
      // Spawn Red Ball from top
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
    
    // Skip all updates if paused
    if (this.isPaused) {
      return;
    }
    
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
          const timeSinceLastCollision = now - this.lastCollisionTime;
          console.log(`Collision detected! Time since last: ${timeSinceLastCollision}ms, Frames since: ${this.framesSinceCollision}, Cooldown: ${this.collisionCooldown}ms, Min frames: ${this.minFramesBetweenCollisions}`);
          
          if (timeSinceLastCollision > this.collisionCooldown && this.framesSinceCollision >= this.minFramesBetweenCollisions) {
            console.log('✓ Collision accepted - triggering player death');
            this.lastCollisionTime = now;
            this.framesSinceCollision = 0;
            collisionDetected = true;
            if (this.onPlayerDeath) {
              this.onPlayerDeath();
            }
          } else {
            console.log(`✗ Collision rejected - time check: ${timeSinceLastCollision > this.collisionCooldown}, frame check: ${this.framesSinceCollision >= this.minFramesBetweenCollisions}`);
          }
        }
      }
    }
    
    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.isAlive);
  }

  /**
   * Clear all enemies without destroying the spawn timer
   */
  clearAllEnemies(): void {
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
  }

  /**
   * Destroy all enemies
   */
  destroy(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    this.clearAllEnemies();
  }

  /**
   * Make all Coily enemies fall off the pyramid (when player uses disk)
   * Returns the number of Coily enemies defeated
   */
  makeCoilyFallOff(): number {
    let defeatedCount = 0;
    
    for (const enemy of this.enemies) {
      if (enemy instanceof Coily && enemy.isAlive) {
        // Animate Coily falling off
        enemy.hopOff(enemy.row + 1, enemy.col, () => {
          enemy.destroy();
        });
        defeatedCount++;
      }
    }
    
    return defeatedCount;
  }

  /**
   * Slow down all enemies for a duration
   */
  slowEnemies(duration: number): void {
    for (const enemy of this.enemies) {
      if (enemy.isAlive) {
        enemy.setSpeedMultiplier(0.5);
        
        // Restore normal speed after duration
        this.scene.time.delayedCall(duration, () => {
          if (enemy.isAlive) {
            enemy.setSpeedMultiplier(1.0);
          }
        });
      }
    }
  }
}
