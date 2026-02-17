/**
 * Main menu scene
 */

import Phaser from 'phaser';
import { useGameStore } from '../game/gameState';
import { GameMode, Difficulty } from '../game/types';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    this.add.text(width / 2, height / 4, 'PUYO PUYO', {
      fontSize: '64px',
      color: '#ff4444',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 4 + 80, 'A Professional Game', {
      fontSize: '20px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);

    // Menu buttons
    const buttonY = height / 2 + 50;
    const buttonSpacing = 80;

    // Single Player Button
    const singlePlayerBtn = this.add
      .text(width / 2, buttonY, 'Single Player (vs AI)', {
        fontSize: '24px',
        color: '#44ff44',
        align: 'center',
        padding: { x: 20, y: 10 },
        backgroundColor: '#334444',
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        singlePlayerBtn.setScale(1.1);
      })
      .on('pointerout', () => {
        singlePlayerBtn.setScale(1);
      })
      .on('pointerdown', () => {
        this.startGame('ai', 'normal');
      });

    // Two Player Button
    const twoPlayerBtn = this.add
      .text(width / 2, buttonY + buttonSpacing, 'Two Player Local', {
        fontSize: '24px',
        color: '#4455ff',
        align: 'center',
        padding: { x: 20, y: 10 },
        backgroundColor: '#334444',
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerover', () => {
        twoPlayerBtn.setScale(1.1);
      })
      .on('pointerout', () => {
        twoPlayerBtn.setScale(1);
      })
      .on('pointerdown', () => {
        this.startGame('two-player', 'normal');
      });

    // Difficulty selector
    this.add.text(width / 2, buttonY + buttonSpacing * 2 + 20, 'Difficulty:', {
      fontSize: '18px',
      color: '#ffff44',
      align: 'center',
    }).setOrigin(0.5);

    const diffY = buttonY + buttonSpacing * 2 + 60;
    const diffSpacing = 100;
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'extreme'];
    let selectedDifficulty: Difficulty = 'normal';

    difficulties.forEach((diff, idx) => {
      const btn = this.add
        .text(width / 2 - 150 + idx * diffSpacing, diffY, diff.toUpperCase(), {
          fontSize: '16px',
          color: diff === selectedDifficulty ? '#ffff44' : '#cccccc',
          align: 'center',
          padding: { x: 10, y: 5 },
          backgroundColor: diff === selectedDifficulty ? '#444444' : '#222222',
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          selectedDifficulty = diff as Difficulty;
          // Update button colors
          difficulties.forEach((d, i) => {
            btn.setColor(d === selectedDifficulty ? '#ffff44' : '#cccccc');
          });
        });
    });

    // Instructions
    this.add.text(width / 2, height - 100, 'Arrow Keys/WASD: Move | Space: Rotate | Enter: Drop', {
      fontSize: '14px',
      color: '#666666',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 60, 'ESC: Pause | Match 4+ to clear', {
      fontSize: '14px',
      color: '#666666',
      align: 'center',
    }).setOrigin(0.5);
  }

  private startGame(mode: GameMode, difficulty: Difficulty): void {
    const store = useGameStore.getState();
    store.initializeGame(mode, difficulty);
    this.scene.start('GameScene');
  }
}
