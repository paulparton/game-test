/**
 * Ultra-minimal test scene - just solid color and text
 */

import Phaser from 'phaser';

export class MinimalScene extends Phaser.Scene {
  constructor() {
    super('MinimalScene');
  }

  create(): void {
    console.log('⭐ MinimalScene: create() called');
    
    // Set background
    this.cameras.main.setBackgroundColor(0x00ff00); // Green
    console.log('⭐ MinimalScene: Background set to green');

    // Add rectangle using add.rectangle (simpler than graphics)
    this.add.rectangle(300, 250, 400, 300, 0xff0000);
    console.log('⭐ MinimalScene: Red rectangle added');

    // Add text at top-left
    const text = this.add.text(50, 50, 'MINIMAL TEST\nIf you see this,\nPhaser is working!', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold',
      align: 'left',
    });
    console.log('⭐ MinimalScene: Text added');

    // Add centered text
    const centerText = this.add.text(600, 400, 'CENTER', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    centerText.setOrigin(0.5);
    console.log('⭐ MinimalScene: Center text added');
  }
}
