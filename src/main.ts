/**
 * Main application entry point
 */

import Phaser from 'phaser';
import { SplashScene } from './scenes/SplashScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const msg = (window as any).addStatus || console.log;

msg('main.ts: Module loading...');

// Try to get the app container
const appDiv = document.getElementById('app');
if (appDiv) {
  msg(`📦 App container ready`);
} else {
  msg('ERROR: App container not found!', true);
}

// Create Phaser game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: '#1a1a2e',
  parent: 'app',
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
  scene: [SplashScene, MenuScene, GameScene],
};

msg('🎮 Creating Phaser game...');

let game: Phaser.Game;

// Create and start the game
try {
  game = new Phaser.Game(config);
  msg('✅ Phaser.Game created');
  
  // Give it a moment to create the canvas
  setTimeout(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      msg(`🎨 Canvas ready (${canvas.width}x${canvas.height})`);
    }
    
    // Start with splash scene
    msg('▶️  Starting SplashScene...');
    game.scene.start('SplashScene');
    msg('✅ SplashScene started - you should see the title and START GAME button!');
  }, 50);
  
  // Make game available globally for debugging
  (window as any).game = game;
  
} catch (error: any) {
  msg(`❌ ERROR: ${error?.message}`, true);
  throw error;
}

export default game;
