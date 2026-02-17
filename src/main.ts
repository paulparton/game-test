/**
 * Main application entry point
 */

import Phaser from 'phaser';
import { SplashScene } from './scenes/SplashScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const msg = (window as any).addStatus || console.log;

msg('main.ts: Module loading...');

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

try {
  game = new Phaser.Game(config);
  msg('✅ Phaser.Game created');
  
  setTimeout(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      msg(`🎨 Canvas ready (${canvas.width}x${canvas.height})`);
    }
    
    msg('▶️  Starting SplashScene...');
    game.scene.start('SplashScene');
  }, 50);
  
  (window as any).game = game;
  
} catch (error: any) {
  msg(`❌ ERROR: ${error?.message}`, true);
  throw error;
}

export default game;
