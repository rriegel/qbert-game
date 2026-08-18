import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputSystem } from '../systems/InputSystem';
import { LevelSystem } from '../systems/LevelSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { EnemyManager } from '../systems/EnemyManager';
import { PowerupManager } from '../systems/PowerupManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputSystem!: InputSystem;
  private levelSystem!: LevelSystem;
  private scoreSystem!: ScoreSystem;
  private enemyManager!: EnemyManager;
  private powerupManager!: PowerupManager;
  private isLevelTransitioning: boolean = false;
  private isInvulnerable: boolean = false;
  private levelText!: Phaser.GameObjects.Text;
  private lives: number = 3;
  private livesText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Reset game state
    this.lives = 3;
    this.isLevelTransitioning = false;
    this.isInvulnerable = false;
    
    // Create systems
    this.levelSystem = new LevelSystem(this);
    this.scoreSystem = new ScoreSystem(this);
    
    // Create player at top of pyramid
    this.player = new Player(this, 0, 0);
    
    // Set up input system
    this.inputSystem = new InputSystem(this);
    
    // Set up enemy manager
    this.enemyManager = new EnemyManager(this, this.levelSystem.pyramid);
    this.enemyManager.setOnPlayerDeath(() => this.handlePlayerDeath());
    
    // Set up powerup manager
    this.powerupManager = new PowerupManager(this, this.levelSystem.pyramid);
    this.powerupManager.setEnemyManager(this.enemyManager);
    this.powerupManager.setScoreSystem(this.scoreSystem);
    
    // UI
    this.add.text(10, 70, 'Q*bert - Phase 4: Enemies', {
      fontSize: '18px',
      color: '#ffffff'
    });
    
    this.add.text(10, 95, 'Use arrow keys to hop diagonally', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
    
    this.levelText = this.add.text(10, 120, 'Level: 1', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
    
    this.livesText = this.add.text(10, 145, 'Lives: 3', {
      fontSize: '14px',
      color: '#ff6666'
    });
  }

  update() {
    // Skip input during level transition
    if (this.isLevelTransitioning) {
      return;
    }
    
    // Visual indicator for invulnerability (flash player)
    if (this.isInvulnerable) {
      this.player.graphics.alpha = Math.sin(this.time.now / 100) > 0 ? 1 : 0.3;
    } else {
      this.player.graphics.alpha = 1;
    }
    
    // Update enemies (pass invulnerability flag to skip collision detection)
    this.enemyManager.update(this.player.row, this.player.col, this.isInvulnerable);
    
    // Update powerups
    this.powerupManager.update(this.player);
    
    // Check for input and initiate hop if not already hopping
    if (!this.player.isHopping) {
      const direction = this.inputSystem.getDirection();
      if (direction) {
        this.player.hop(direction, () => {
          // After hop completes, check if player fell off (alpha = 0)
          if (this.player.graphics.alpha === 0) {
            // Player fell off - lose a life and reset combo
            this.lives = Math.max(0, this.lives - 1);
            this.livesText.setText(`Lives: ${this.lives}`);
            this.scoreSystem.resetCombo();
            
            if (this.lives <= 0) {
              // Game over
              this.time.delayedCall(500, () => {
                this.scene.start('GameOverScene', { 
                  score: this.scoreSystem.getScore(), 
                  level: this.levelSystem.currentLevel 
                });
              });
            } else {
              // Reset player after a short delay
              this.time.delayedCall(500, () => {
                this.player.reset();
              });
            }
          } else {
            // Landed on pyramid - change cube color and add score
            const changed = this.levelSystem.pyramid.changeCubeColor(this.player.row, this.player.col);
            if (changed) {
              this.scoreSystem.addCubeScore();
            }
            
            // Check if level is complete
            if (this.levelSystem.isLevelComplete()) {
              this.handleLevelComplete();
            }
          }
        });
      }
    }
  }
  
  private handlePlayerDeath() {
    // Prevent multiple deaths from same collision
    if (this.isInvulnerable) {
      return;
    }
    
    // Set invulnerability immediately
    this.isInvulnerable = true;
    
    // Lose a life (prevent going negative)
    this.lives = Math.max(0, this.lives - 1);
    this.livesText.setText(`Lives: ${this.lives}`);
    this.scoreSystem.resetCombo();
    
    if (this.lives <= 0) {
      // Game over
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', { 
          score: this.scoreSystem.getScore(), 
          level: this.levelSystem.currentLevel 
        });
      });
    } else {
      // Reset player after a short delay
      this.time.delayedCall(500, () => {
        this.player.reset();
        
        // Remove invulnerability after 1.5 seconds
        this.time.delayedCall(1500, () => {
          this.isInvulnerable = false;
        });
      });
    }
  }
  
  private handleLevelComplete() {
    this.isLevelTransitioning = true;
    
    // Pause enemies during level transition
    this.enemyManager.pause();
    
    // Add level bonus
    this.scoreSystem.addLevelBonus(this.levelSystem.currentLevel);
    
    // Show level complete message
    const completeText = this.add.text(400, 300, 'Level Complete!', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    completeText.setDepth(1000);
    
    // Advance to next level after delay
    this.time.delayedCall(2000, () => {
      completeText.destroy();
      this.levelSystem.advanceLevel();
      this.player.reset();
      
      // Clear all enemies and powerups from previous level
      this.enemyManager.clearAllEnemies();
      this.powerupManager.clearAllPowerups();
      this.enemyManager.setLevel(this.levelSystem.currentLevel);
      this.enemyManager.resume();
      this.isLevelTransitioning = false;
      
      // Update level display
      this.levelText.setText(`Level: ${this.levelSystem.currentLevel}`);
    });
  }
}
