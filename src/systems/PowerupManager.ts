import Phaser from 'phaser';
import { Disk } from '../entities/Disk';
import { Shield } from '../entities/Shield';
import { SlowMo } from '../entities/SlowMo';
import { Paintbrush } from '../entities/Paintbrush';
import { Player } from '../entities/Player';
import { Pyramid } from '../entities/Pyramid';
import { EnemyManager } from './EnemyManager';
import { ScoreSystem } from './ScoreSystem';

export class PowerupManager {
  private scene: Phaser.Scene;
  private powerups: (Disk | Shield | SlowMo | Paintbrush)[] = [];
  private spawnTimer: number = 0;
  private pyramid: Pyramid;
  private spawnInterval: number = 10000; // 10 seconds between spawn attempts
  private enemyManager?: EnemyManager;
  private scoreSystem?: ScoreSystem;
  private extraLifeMilestone: number = 10000; // Award extra life every 10,000 points
  private lastMilestoneReached: number = 0;
  
  constructor(scene: Phaser.Scene, pyramid: Pyramid) {
    this.scene = scene;
    this.pyramid = pyramid;
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
    // Don't spawn if there's already a Disk on the board
    const hasDisk = this.powerups.some(p => p instanceof Disk);
    if (hasDisk) return;
    
    // Pick a random edge position (left or right side)
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const row = Math.floor(Math.random() * 5) + 1; // rows 1-5
    
    let col: number;
    if (side === 'left') {
      col = 0; // leftmost column
    } else {
      col = row; // rightmost column
    }
    
    // Randomly choose between Disk, Shield, SlowMo, and Paintbrush
    const powerupType = Math.random();
    if (powerupType < 0.4) {
      const disk = new Disk(this.scene, row, col);
      this.powerups.push(disk);
    } else if (powerupType < 0.7) {
      const shield = new Shield(this.scene, row, col);
      this.powerups.push(shield);
    } else if (powerupType < 0.9) {
      const slowmo = new SlowMo(this.scene, row, col);
      this.powerups.push(slowmo);
    } else {
      const paintbrush = new Paintbrush(this.scene, row, col);
      this.powerups.push(paintbrush);
    }
    
    // Show spawn notification
    const text = this.scene.add.text(400, 50, 'Powerup Spawned!', {
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
    for (const powerup of this.powerups) {
      if (powerup.isAtPosition(player.row, player.col)) {
        if (powerup instanceof Disk) {
          this.collectDisk(powerup, player);
        } else if (powerup instanceof Shield) {
          this.collectShield(powerup, player);
        } else if (powerup instanceof SlowMo) {
          this.collectSlowMo(powerup);
        } else if (powerup instanceof Paintbrush) {
          this.collectPaintbrush(powerup);
        }
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
   * Collect a shield and give player protection
   */
  private collectShield(shield: Shield, player: Player): void {
    // Animate shield collection
    shield.animateCollection(() => {
      // Give player shield
      player.activateShield();
      
      // Show notification
      const text = this.scene.add.text(400, 200, 'Shield Activated!', {
        fontSize: '24px',
        color: '#00ffff',
        fontFamily: 'monospace'
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      
      this.scene.tweens.add({
        targets: text,
        y: 150,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => text.destroy()
      });
    });
  }
  
  /**
   * Collect SlowMo powerup - slows all enemies for 10 seconds
   */
  private collectSlowMo(slowmo: SlowMo): void {
    slowmo.animateCollection(() => {
      // Slow all enemies for 10 seconds
      if (this.enemyManager) {
        this.enemyManager.slowEnemies(10000);
      }
      
      // Show notification
      const text = this.scene.add.text(400, 200, 'Slow-Mo!', {
        fontSize: '24px',
        color: '#FFEB3B',
        fontFamily: 'monospace'
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      
      this.scene.tweens.add({
        targets: text,
        y: 150,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => text.destroy()
      });
    });
  }

  /**
   * Collect Paintbrush powerup - colors 3 random uncolored cubes instantly
   */
  private collectPaintbrush(paintbrush: Paintbrush): void {
    paintbrush.animateCollection(() => {
      // Color 3 random uncolored cubes
      const uncoloredCubes: Array<{row: number, col: number}> = [];
      
      // Find all uncolored cubes (rows 1-5, all columns)
      for (let row = 1; row <= 5; row++) {
        for (let col = 0; col <= row; col++) {
          if (!this.pyramid.isCubeColored(row, col)) {
            uncoloredCubes.push({row, col});
          }
        }
      }
      
      // Shuffle and pick up to 3
      for (let i = uncoloredCubes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uncoloredCubes[i], uncoloredCubes[j]] = [uncoloredCubes[j], uncoloredCubes[i]];
      }
      
      const cubesToColor = uncoloredCubes.slice(0, 3);
      for (const cube of cubesToColor) {
        this.pyramid.colorCube(cube.row, cube.col);
      }
      
      // Show notification
      const text = this.scene.add.text(400, 200, `Paintbrush! (${cubesToColor.length} cubes)`, {
        fontSize: '24px',
        color: '#FF6B35',
        fontFamily: 'monospace'
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      
      this.scene.tweens.add({
        targets: text,
        y: 150,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => text.destroy()
      });
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

  /**
   * Check if player reached a score milestone and award extra life
   */
  checkExtraLife(score: number, onExtraLife: () => void): void {
    const currentMilestone = Math.floor(score / this.extraLifeMilestone);
    
    if (currentMilestone > this.lastMilestoneReached) {
      this.lastMilestoneReached = currentMilestone;
      onExtraLife();
      
      // Show notification
      const text = this.scene.add.text(400, 300, 'Extra Life!', {
        fontSize: '32px',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      text.setScrollFactor(0);
      
      this.scene.tweens.add({
        targets: text,
        y: 250,
        alpha: 0,
        duration: 2000,
        ease: 'Power2',
        onComplete: () => text.destroy()
      });
    }
  }
}
