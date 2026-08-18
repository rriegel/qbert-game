import Phaser from 'phaser';
import { Disk } from '../entities/Disk';
import { Player } from '../entities/Player';
import { EnemyManager } from './EnemyManager';
import { ScoreSystem } from './ScoreSystem';

export class PowerupManager {
  private scene: Phaser.Scene;
  private powerups: Disk[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 15000; // 15 seconds between spawn attempts
  private enemyManager?: EnemyManager;
  private scoreSystem?: ScoreSystem;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Set the enemy manager (for Coily interactions)
   */
  setEnemyManager(enemyManager: EnemyManager): void {
    this.enemyManager = enemyManager;
  }

  /**
   * Set the score system (for awarding points)
   */
  setScoreSystem(scoreSystem: ScoreSystem): void {
    this.scoreSystem = scoreSystem;
  }
  
  /**
   * Update powerups and spawn logic
   */
  update(player: Player): void {
    // Update spawn timer
    this.spawnTimer += this.scene.game.loop.delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.trySpawnDisk();
    }
    
    // Update existing powerups
    for (const powerup of this.powerups) {
      powerup.update();
    }
    
    // Remove inactive powerups
    this.powerups = this.powerups.filter(p => p.isActive);
    
    // Check if player landed on a disk
    this.checkPlayerCollision(player);
  }
  
  /**
   * Try to spawn a disk on a pyramid edge
   */
  private trySpawnDisk(): void {
    // Don't spawn if there's already a disk
    if (this.powerups.length > 0) return;
    
    // Pick a random edge position (left or right side)
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const row = Math.floor(Math.random() * 5) + 1; // rows 1-5
    
    let col: number;
    if (side === 'left') {
      col = 0; // leftmost column
    } else {
      col = row; // rightmost column
    }
    
    // Create the disk
    const disk = new Disk(this.scene, row, col);
    this.powerups.push(disk);
    
    // Show spawn notification
    const text = this.scene.add.text(400, 50, 'Disk Spawned!', {
      fontSize: '18px',
      color: '#ff00ff',
      fontFamily: 'monospace'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    
    this.scene.tweens.add({
      targets: text,
      y: 20,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Check if player landed on a disk
   */
  private checkPlayerCollision(player: Player): void {
    for (const disk of this.powerups) {
      if (disk.isAtPosition(player.row, player.col)) {
        this.collectDisk(disk, player);
        break;
      }
    }
  }
  
  /**
   * Collect a disk and teleport player
   */
  private collectDisk(disk: Disk, player: Player): void {
    // Animate disk collection
    disk.animateCollection(() => {
      // Teleport player to top
      player.row = 0;
      player.col = 0;
      player.updatePosition();
      
      // Make Coily fall off if chasing
      if (this.enemyManager) {
        const defeatedCount = this.enemyManager.makeCoilyFallOff();
        // Award 500 points per Coily defeated
        if (defeatedCount > 0 && this.scoreSystem) {
          this.scoreSystem.addEnemyDefeatScore(defeatedCount);
        }
      }
    });
  }
  
  /**
   * Clear all powerups
   */
  clearAllPowerups(): void {
    for (const powerup of this.powerups) {
      powerup.destroy();
    }
    this.powerups = [];
    this.spawnTimer = 0;
  }
  
  /**
   * Pause all powerups
   */
  pause(): void {
    // Disks don't need to pause, they just stop updating
  }
  
  /**
   * Resume all powerups
   */
  resume(): void {
    // Disks resume updating
  }
}
