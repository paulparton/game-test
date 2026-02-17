/**
 * Main application entry point
 */

import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

// Create Phaser game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: '#1a1a2e',
  render: {
    pixelArt: false,
    antialias: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [MenuScene, GameScene],
};

// Create and start the game
const game = new Phaser.Game(config);

// Start with menu scene
game.scene.start('MenuScene');

export default game;
