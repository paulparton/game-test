/**
 * Main Phaser game scene
 */

import Phaser from 'phaser';
import { useGameStore } from '../game/gameState';
import { createInputManager } from '../input/inputManager';
import { getAIAction } from '../game/ai';
import { canMovePieceDown } from '../game/board';
import { PUYO_SIZE, BASE_FALL_SPEED, PIECE_LOCK_DELAY, BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants';

export class GameScene extends Phaser.Scene {
  private inputManager!: ReturnType<typeof createInputManager>;
  private lastFallTime: number = 0;
  private lastLockTime: number = 0;
  private lastAIUpdateTime: number = 0;
  private isProcessing: boolean = false;
  private graphics: Phaser.GameObjects.Graphics | null = null;
  private colors: Record<string, number> = {
    red: 0xff4444,
    blue: 0x4455ff,
    green: 0x44ff44,
    yellow: 0xffff44,
    garbage: 0x888888,
    empty: 0x222222,
  };

  constructor() {
    super('GameScene');
  }

  preload(): void {
    // Assets would be loaded here
  }

  create(): void {
    // Set background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Initialize input manager
    this.inputManager = createInputManager();

    // Subscribe to input events
    this.inputManager.subscribe('move-left', () => {
      const store = useGameStore.getState();
      store.movePieceLeftAction(1);
    });

    this.inputManager.subscribe('move-right', () => {
      const store = useGameStore.getState();
      store.movePieceRightAction(1);
    });

    this.inputManager.subscribe('soft-drop', () => {
      const store = useGameStore.getState();
      store.dropPieceAction(1);
    });

    this.inputManager.subscribe('pause', () => {
      const store = useGameStore.getState();
      store.player1.gameState.isPaused = !store.player1.gameState.isPaused;
    });

    // Create initial board display
    this.drawBoard();
  }

  update(): void {
    const store = useGameStore.getState();
    const currentTime = this.time.now || 0;

    // Check for game over
    if (!store.isGameActive) {
      this.showGameOver();
      return;
    }

    if (store.player1.gameState.isPaused) {
      this.drawBoard();
      this.drawPausedOverlay();
      return;
    }

    // Update input manager
    this.inputManager.update();

    // Handle piece falling
    if (currentTime - this.lastFallTime > BASE_FALL_SPEED) {
      store.dropPieceAction(1);
      this.lastFallTime = currentTime;
    }

    // Handle piece locking
    if (
      store.player1.gameState.currentPiece &&
      !canMovePieceDown(store.player1.gameState.board, store.player1.gameState.currentPiece)
    ) {
      if (currentTime - this.lastLockTime > PIECE_LOCK_DELAY) {
        if (!this.isProcessing) {
          this.isProcessing = true;
          store.lockPieceAction(1);
          this.lastLockTime = currentTime;
          this.isProcessing = false;
        }
      }
    } else {
      this.lastLockTime = currentTime;
    }

    // AI player moves
    if (store.gameMode === 'ai') {
      const aiAction = getAIAction(
        store.player2.gameState,
        store.difficulty as string,
        this.lastAIUpdateTime,
        currentTime
      );

      switch (aiAction) {
        case 'move-left':
          store.movePieceLeftAction(2);
          this.lastAIUpdateTime = currentTime;
          break;
        case 'move-right':
          store.movePieceRightAction(2);
          this.lastAIUpdateTime = currentTime;
          break;
        case 'drop':
          store.dropPieceAction(2);
          break;
        case 'lock':
          if (!this.isProcessing) {
            this.isProcessing = true;
            store.lockPieceAction(2);
            this.isProcessing = false;
          }
          break;
      }
    }

    // Render updates
    this.drawBoard();
  }

  private drawBoard(): void {
    const store = useGameStore.getState();
    const gameState = store.player1.gameState;

    // Draw grid background
    const baseX = 50;
    const baseY = 50;

    // Clear previous graphics
    if (this.graphics) {
      this.graphics.clear();
      this.graphics.destroy();
    }

    const graphics = this.make.graphics({ x: 0, y: 0 });

    // Draw board grid
    graphics.lineStyle(2, 0x444444, 1);
    for (let i = 0; i <= BOARD_WIDTH; i++) {
      graphics.lineBetween(
        baseX + i * PUYO_SIZE,
        baseY,
        baseX + i * PUYO_SIZE,
        baseY + BOARD_HEIGHT * PUYO_SIZE
      );
    }
    for (let i = 0; i <= BOARD_HEIGHT; i++) {
      graphics.lineBetween(
        baseX,
        baseY + i * PUYO_SIZE,
        baseX + BOARD_WIDTH * PUYO_SIZE,
        baseY + i * PUYO_SIZE
      );
    }

    // Draw board puyos
    gameState.board.grid.forEach((row, rowIdx) => {
      row.forEach((puyo, colIdx) => {
        const x = baseX + colIdx * PUYO_SIZE + PUYO_SIZE / 2;
        const y = baseY + rowIdx * PUYO_SIZE + PUYO_SIZE / 2;
        const color = this.colors[puyo.color as keyof typeof this.colors] || 0x333333;

        this.drawPuyo(graphics, x, y, PUYO_SIZE / 2 - 2, color);
      });
    });

    // Draw current piece
    if (gameState.currentPiece) {
      gameState.currentPiece.positions.forEach((pos, idx) => {
        const row = gameState.currentPiece!.y + pos.row;
        const col = gameState.currentPiece!.x + pos.col;

        if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
          const x = baseX + col * PUYO_SIZE + PUYO_SIZE / 2;
          const y = baseY + row * PUYO_SIZE + PUYO_SIZE / 2;
          const color =
            this.colors[gameState.currentPiece?.colors[idx] as keyof typeof this.colors] || 0x333333;

          this.drawPuyo(graphics, x, y, PUYO_SIZE / 2 - 2, color);
        }
      });
    }

    this.graphics = graphics;

    // Draw score and stats
    this.drawUI(gameState);
  }

  private drawPuyo(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    color: number
  ): void {
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x, y, radius);
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeCircle(x, y, radius);
  }

  private drawUI(gameState: any): void {
    const baseX = 50 + BOARD_WIDTH * PUYO_SIZE + 50;
    const baseY = 50;

    // Create text displays - clear old ones first
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.destroy();
      }
    });

    const scoreText = `Score: ${gameState.score}`;
    const chainText = `Chain: ${gameState.chainCount}`;
    const levelText = `Level: ${gameState.level}`;

    this.add.text(baseX, baseY, scoreText, { color: '#fff', fontSize: '24px' });
    this.add.text(baseX, baseY + 40, chainText, { color: '#fff', fontSize: '20px' });
    this.add.text(baseX, baseY + 80, levelText, { color: '#fff', fontSize: '20px' });

    // Draw next piece preview
    this.add.text(baseX, baseY + 150, 'Next:', { color: '#fff', fontSize: '16px' });
    if (gameState.nextPiece) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      gameState.nextPiece.positions.forEach((pos: any, idx: number) => {
        const x = baseX + 20 + pos.col * (PUYO_SIZE / 2);
        const y = baseY + 180 + pos.row * (PUYO_SIZE / 2);
        const color =
          this.colors[gameState.nextPiece.colors[idx] as keyof typeof this.colors] || 0x333333;
        this.drawPuyo(graphics, x, y, PUYO_SIZE / 4 - 1, color);
      });
    }
  }

  private showGameOver(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear old text
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.destroy();
      }
    });

    const store = useGameStore.getState();

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Game Over text
    this.add.text(width / 2, height / 2 - 100, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ff4444',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Final score
    this.add.text(width / 2, height / 2, `Final Score: ${store.player1.gameState.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff44',
      align: 'center',
    }).setOrigin(0.5);

    // Return to menu button
    const btnWidth = 200;
    const btnHeight = 50;
    const btnY = height / 2 + 100;

    const btn = this.add.rectangle(width / 2, btnY, btnWidth, btnHeight, 0x44ff44, 0.2);
    btn.setStrokeStyle(2, 0x44ff44);
    btn.setInteractive();

    const btnText = this.add.text(width / 2, btnY, 'MENU', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#44ff44',
      align: 'center',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(0x44ff44, 0.3);
      btnText.setScale(1.1);
    });

    btn.on('pointerout', () => {
      btn.setFillStyle(0x44ff44, 0.2);
      btnText.setScale(1);
    });

    btn.on('pointerdown', () => {
      store.resetGame();
      this.scene.start('MenuScene');
    });
  }

  private drawPausedOverlay(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

    // Paused text
    this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial, sans-serif',
      color: '#ffff44',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, 'Press ESC to Resume', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
  }
}
