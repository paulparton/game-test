/**
 * Splash screen scene - first thing player sees
 */

import Phaser from 'phaser';

export class SplashScene extends Phaser.Scene {
  constructor() {
    super('SplashScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Add background rectangle for contrast
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);
    bg.setDepth(-10);

    // Title with outer glow
    const titleBg = this.add.rectangle(width / 2, height / 3, 600, 150, 0xff4444, 0.1);
    titleBg.setStrokeStyle(3, 0xff4444);

    const title = this.add.text(width / 2, height / 3 - 20, 'PUYO PUYO', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      align: 'center',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 3 + 60, 'A Professional Puzzle Game', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      align: 'center',
    });
    subtitle.setOrigin(0.5);

    // Create START button with visual effects
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2 + 80;

    // Button background
    const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x44ff44, 0.2);
    buttonBg.setStrokeStyle(3, 0x44ff44);
    buttonBg.setInteractive();

    // Button text
    const buttonText = this.add.text(buttonX, buttonY, 'START GAME', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#44ff44',
      align: 'center',
      fontStyle: 'bold',
    });
    buttonText.setOrigin(0.5);

    // Button hover effect
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x44ff44, 0.3);
      buttonBg.setStrokeStyle(4, 0x44ff44);
      buttonText.setScale(1.1);
      buttonText.setColor('#ffffff');
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x44ff44, 0.2);
      buttonBg.setStrokeStyle(3, 0x44ff44);
      buttonText.setScale(1);
      buttonText.setColor('#44ff44');
    });

    buttonBg.on('pointerdown', () => {
      // Fade out
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Instructions at bottom
    const instructText = this.add.text(width / 2, height - 100, 'Controls:', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffaa44',
      align: 'center',
    });
    instructText.setOrigin(0.5);

    const controlsText = this.add.text(width / 2, height - 60, 'Keyboard: Arrow Keys / WASD to Move | Space to Rotate | Enter to Drop\nGamepad: D-Pad to Move | A/X to Rotate | B/Y to Drop', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#666666',
      align: 'center',
      lineSpacing: 8,
    });
    controlsText.setOrigin(0.5);

    // Add a subtle pulsing animation to the button
    this.tweens.add({
      targets: buttonBg,
      alpha: [0.2, 0.3, 0.2],
      duration: 2000,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }
}
