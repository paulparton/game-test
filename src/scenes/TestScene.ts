/**
 * Simple test scene to verify Phaser is working
 */

import Phaser from 'phaser';

export class TestScene extends Phaser.Scene {
  constructor() {
    super('TestScene');
  }

  preload(): void {
    console.log('🎮 TestScene: preload() called');
  }

  create(): void {
    console.log('🎮 TestScene: create() called - rendering content');
    
    const width = this.sys.game.canvas.width;
    const height = this.sys.game.canvas.height;
    
    console.log(`Canvas size: ${width}x${height}`);

    // Set background
    this.cameras.main.setBackgroundColor('#000000');
    console.log('✓ Background set');

    // Add rectangle
    this.add.rectangle(width / 2, height / 2, 400, 300, 0xff0000);
    console.log('✓ Rectangle added');

    // Add text
    const text = this.add.text(width / 2, height / 2 - 100, 'TEST DISPLAY', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    console.log('✓ Text added');

    // Button
    const button = this.add.rectangle(width / 2, height / 2 + 100, 200, 60, 0x00ff00);
    button.setInteractive();
    console.log('✓ Button added');

    const btnText = this.add.text(width / 2, height / 2 + 100, 'CLICK ME', {
      fontSize: '24px',
      color: '#000000',
    });
    btnText.setOrigin(0.5);
    console.log('✓ Button text added');

    button.on('pointerdown', () => {
      console.log('✓ Button clicked!');
      text.setText('BUTTON CLICKED!');
    });

    console.log('✓ TestScene fully rendered');
  }

  update(): void {
    // Update loop
  }
}
