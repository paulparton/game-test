/**
 * Game Scene - Improved with better graphics and full gameplay
 * Supports both single-player and two-player modes
 */

import Phaser from 'phaser';
import { useGameStore } from '../game/gameState';
import { createInputManager } from '../input/inputManager';
import { canMovePieceDown } from '../game/board';
import { PUYO_SIZE, BASE_FALL_SPEED, PIECE_LOCK_DELAY, BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants';
import { soundManager } from '../audio/soundManager';
import type { GameState } from '../game/types';

export class GameScene extends Phaser.Scene {
  private inputManager!: ReturnType<typeof createInputManager>;
  private lastFallTime: number = 0;
  private lastLockTime: number = 0;
  private lastRotateTime: number = 0;
  private boardGraphics: Phaser.GameObjects.Graphics | null = null;
  private uiTexts: Phaser.GameObjects.Text[] = [];

  // Color mapping with better colors
  private colorMap: Record<string, number> = {
    red: 0xff2d2d,
    blue: 0x2d5aff,
    green: 0x2dff2d,
    yellow: 0xffff2d,
    garbage: 0x666666,
    empty: 0x0a0a1a,
  };

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    this.inputManager = createInputManager();
    this.setupInputHandlers();

    // Add diagnostic text
    const store = useGameStore.getState();
    const text = this.add.text(10, 10, `Mode: ${store.gameMode}`, {
      fontSize: '16px',
      color: '#00ff00',
    });
    this.uiTexts.push(text);
  }

  private setupInputHandlers(): void {
    const store = useGameStore.getState();
    
    // ========== PLAYER 1 CONTROLS (Arrow Keys) ==========
    this.inputManager.subscribe('p1-move-left', () => {
      store.movePieceLeftAction(1);
    });

    this.inputManager.subscribe('p1-move-right', () => {
      store.movePieceRightAction(1);
    });

    this.inputManager.subscribe('p1-soft-drop', () => {
      store.dropPieceAction(1);
    });

    this.inputManager.subscribe('p1-rotate', () => {
      const now = this.time.now || 0;

      // Debounce rotation
      if (now - this.lastRotateTime > 100) {
        store.rotatePieceAction(1);
        soundManager.playRotate();
        this.lastRotateTime = now;
      }
    });

    this.inputManager.subscribe('p1-hard-drop', () => {
      while (store.player1.gameState.currentPiece && canMovePieceDown(store.player1.gameState.board, store.player1.gameState.currentPiece)) {
        store.dropPieceAction(1);
      }
    });

    // ========== PLAYER 2 CONTROLS (WASD) ==========
    this.inputManager.subscribe('p2-move-left', () => {
      if (store.gameMode === 'two-player') {
        store.movePieceLeftAction(2);
      }
    });

    this.inputManager.subscribe('p2-move-right', () => {
      if (store.gameMode === 'two-player') {
        store.movePieceRightAction(2);
      }
    });

    this.inputManager.subscribe('p2-soft-drop', () => {
      if (store.gameMode === 'two-player') {
        store.dropPieceAction(2);
      }
    });

    this.inputManager.subscribe('p2-rotate', () => {
      if (store.gameMode === 'two-player') {
        const now = this.time.now || 0;

        // Debounce rotation
        if (now - this.lastRotateTime > 100) {
          store.rotatePieceAction(2);
          soundManager.playRotate();
          this.lastRotateTime = now;
        }
      }
    });

    this.inputManager.subscribe('p2-hard-drop', () => {
      if (store.gameMode === 'two-player') {
        while (store.player2.gameState.currentPiece && canMovePieceDown(store.player2.gameState.board, store.player2.gameState.currentPiece)) {
          store.dropPieceAction(2);
        }
      }
    });

    // ========== SHARED CONTROLS ==========
    this.inputManager.subscribe('pause', () => {
      store.player1.gameState.isPaused = !store.player1.gameState.isPaused;
      if (store.gameMode === 'two-player') {
        store.player2.gameState.isPaused = store.player1.gameState.isPaused;
      }
    });
  }

  update(): void {
    const store = useGameStore.getState();
    const gameState1 = store.player1.gameState;
    const now = this.time.now || 0;

    if (!store.isGameActive || gameState1.isGameOver) {
      this.showGameOver();
      return;
    }

    if (gameState1.isPaused) {
      this.renderGame();
      this.showPauseMessage();
      return;
    }

    // Check if player 2 game over (two-player mode)
    if (store.gameMode === 'two-player' && store.player2.gameState.isGameOver) {
      this.showGameOver();
      return;
    }

    this.inputManager.update();

    // Piece falling for both players
    if (now - this.lastFallTime > BASE_FALL_SPEED) {
      store.dropPieceAction(1);
      if (store.gameMode === 'two-player') {
        store.dropPieceAction(2);
      }
      this.lastFallTime = now;
    }
    // Piece locking for player 1
    if (gameState1.currentPiece && !canMovePieceDown(gameState1.board, gameState1.currentPiece)) {
      if (now - this.lastLockTime > PIECE_LOCK_DELAY) {
        try {
          store.lockPieceAction(1);
          soundManager.playPieceLock();
          this.lastLockTime = now;
        } catch (e) {
          // Error handled silently
        }
      }
    }

    // Piece locking for player 2 (if two-player)
    if (store.gameMode === 'two-player') {
      const gameState2 = store.player2.gameState;
      if (gameState2.currentPiece && !canMovePieceDown(gameState2.board, gameState2.currentPiece)) {
        if (now - this.lastLockTime > PIECE_LOCK_DELAY) {
          try {
            store.lockPieceAction(2);
            this.lastLockTime = now;
          } catch (e) {
            // Error handled silently
          }
        }
      }
    }

    this.renderGame();
  }

  private renderGame(): void {
    const store = useGameStore.getState();
    const gameState1 = store.player1.gameState;

    // Create graphics object only once
    if (!this.boardGraphics) {
      this.boardGraphics = this.add.graphics();
    }

    // Clear the previous frame's drawing
    this.boardGraphics.clear();

    if (store.gameMode === 'two-player') {
      // Render both players side by side
      const boardX1 = 80;
      const boardX2 = 600;
      const boardY = 80;

      this.renderBoard(boardX1, boardY, gameState1, 'Player 1');

      const gameState2 = store.player2.gameState;
      this.renderBoard(boardX2, boardY, gameState2, 'Player 2');

      this.renderTwoPlayerUI();
    } else {
      // Single player mode - center the board
      const boardX = 80;
      const boardY = 80;
      this.renderBoard(boardX, boardY, gameState1, '');
      this.renderSinglePlayerUI(gameState1);
    }
  }

  private renderBoard(boardX: number, boardY: number, gameState: GameState, playerLabel: string): void {
    // Draw board background with gradient effect
    this.boardGraphics!.fillStyle(0x0f0f1f, 1);
    this.boardGraphics!.fillRect(
      boardX - 5,
      boardY - 5,
      BOARD_WIDTH * PUYO_SIZE + 10,
      BOARD_HEIGHT * PUYO_SIZE + 10
    );

    // Draw board border (glowing yellow)
    this.boardGraphics!.lineStyle(4, 0xffff00, 1);
    this.boardGraphics!.strokeRect(
      boardX,
      boardY,
      BOARD_WIDTH * PUYO_SIZE,
      BOARD_HEIGHT * PUYO_SIZE
    );

    // Draw inner highlight
    this.boardGraphics!.lineStyle(1, 0xffff88, 0.5);
    this.boardGraphics!.strokeRect(
      boardX + 2,
      boardY + 2,
      BOARD_WIDTH * PUYO_SIZE - 4,
      BOARD_HEIGHT * PUYO_SIZE - 4
    );

    // Draw subtle grid
    this.boardGraphics!.lineStyle(1, 0x1a1a3a, 0.3);
    for (let i = 1; i < BOARD_WIDTH; i++) {
      this.boardGraphics!.lineBetween(
        boardX + i * PUYO_SIZE,
        boardY,
        boardX + i * PUYO_SIZE,
        boardY + BOARD_HEIGHT * PUYO_SIZE
      );
    }
    for (let i = 1; i < BOARD_HEIGHT; i++) {
      this.boardGraphics!.lineBetween(
        boardX,
        boardY + i * PUYO_SIZE,
        boardX + BOARD_WIDTH * PUYO_SIZE,
        boardY + i * PUYO_SIZE
      );
    }

    // Draw board puyos
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const puyo = gameState.board.grid[row][col];
        if (puyo.color !== 'empty') {
          this.drawPuyo(boardX, boardY, row, col, this.colorMap[puyo.color] || 0x666666, false);
        }
      }
    }

    // Draw current falling piece - with glow effect
    if (gameState.currentPiece) {
      gameState.currentPiece.positions.forEach((pos: { row: number; col: number }, idx: number) => {
        const row = gameState.currentPiece!.y + pos.row;
        const col = gameState.currentPiece!.x + pos.col;

        if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
          const color = gameState.currentPiece!.colors[idx];
          this.drawPuyo(boardX, boardY, row, col, this.colorMap[color] || 0x666666, true);
        }
      });
    }

    // Draw player label above board
    if (playerLabel) {
      const text = this.add.text(boardX + BOARD_WIDTH * PUYO_SIZE / 2, boardY - 30, playerLabel, {
        fontSize: '20px',
        color: '#ffff88',
        fontStyle: 'bold',
        align: 'center',
      });
      text.setOrigin(0.5, 0.5);
      this.uiTexts.push(text);
    }
  }

  private drawPuyo(boardX: number, boardY: number, row: number, col: number, color: number, isActive: boolean = false): void {
    const x = boardX + col * PUYO_SIZE + PUYO_SIZE / 2;
    const y = boardY + row * PUYO_SIZE + PUYO_SIZE / 2;
    const radius = PUYO_SIZE / 2 - 3;

    // Draw glow for active piece
    if (isActive) {
      this.boardGraphics!.fillStyle(color, 0.2);
      this.boardGraphics!.fillCircle(x, y, radius + 4);
    }

    // Draw main circle with gradient-like effect
    this.boardGraphics!.fillStyle(color, 1);
    this.boardGraphics!.fillCircle(x, y, radius);

    // Draw highlight (lighter shade)
    const lighterColor = this.lightenColor(color);
    this.boardGraphics!.fillStyle(lighterColor, 0.4);
    this.boardGraphics!.fillCircle(x - 2, y - 2, radius / 3);

    // Draw border
    this.boardGraphics!.lineStyle(2, 0xffffff, 0.8);
    this.boardGraphics!.strokeCircle(x, y, radius);

    // Draw shadow
    this.boardGraphics!.lineStyle(1, 0x000000, 0.4);
    this.boardGraphics!.strokeCircle(x, y, radius - 1);
  }

  private lightenColor(color: number): number {
    const r = Math.min(255, ((color >> 16) & 255) + 80);
    const g = Math.min(255, ((color >> 8) & 255) + 80);
    const b = Math.min(255, (color & 255) + 80);
    return (r << 16) | (g << 8) | b;
  }

  private renderSinglePlayerUI(gameState: GameState): void {
    // Clear old text only if needed
    if (this.uiTexts.length > 0) {
      this.uiTexts.forEach(text => text.destroy());
      this.uiTexts = [];
    }

    const uiX = 680;
    const uiY = 80;

    // Title
    let text = this.add.text(uiX, uiY, 'PUYO PUYO', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold',
      fontFamily: 'Arial Black',
    });
    text.setShadow(3, 3, '#000000', 5);
    this.uiTexts.push(text);

    // Score - with color
    text = this.add.text(uiX, uiY + 80, `SCORE`, {
      fontSize: '14px',
      color: '#ffaa44',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(uiX, uiY + 105, `${gameState.score}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    // Chain
    text = this.add.text(uiX, uiY + 160, `CHAIN`, {
      fontSize: '14px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(uiX, uiY + 185, `${gameState.chainCount}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    // Level
    text = this.add.text(uiX, uiY + 230, `LEVEL`, {
      fontSize: '14px',
      color: '#44ff44',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(uiX, uiY + 255, `${gameState.level}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    // Controls
    text = this.add.text(uiX, uiY + 340, 'CONTROLS', {
      fontSize: '12px',
      color: '#ffaa44',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(uiX, uiY + 365,
      '← → Move\nSpace Rotate\n↓ Soft Drop\nEnter Hard Drop\nP Pause',
      {
        fontSize: '11px',
        color: '#cccccc',
        lineSpacing: 5,
        fontFamily: 'monospace',
      });
    this.uiTexts.push(text);
  }

  private renderTwoPlayerUI(): void {
    // Clear old text
    this.uiTexts.forEach(text => text.destroy());
    this.uiTexts = [];

    const store = useGameStore.getState();
    const gameState1 = store.player1.gameState;
    const gameState2 = store.player2.gameState;

    // Player 1 stats
    let text = this.add.text(85, 450, 'SCORE', {
      fontSize: '12px',
      color: '#ffaa44',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(85, 470, `${gameState1.score}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(85, 510, 'CHAIN', {
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(85, 530, `${gameState1.chainCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    // Player 2 stats
    text = this.add.text(600, 450, 'SCORE', {
      fontSize: '12px',
      color: '#ffaa44',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(600, 470, `${gameState2.score}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(600, 510, 'CHAIN', {
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    text = this.add.text(600, 530, `${gameState2.chainCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.uiTexts.push(text);

    // Controls at bottom
    text = this.add.text(600, 700, '← → Move | Space Rotate | ↓ Drop | Enter Hard Drop | P Pause', {
      fontSize: '12px',
      color: '#666666',
      align: 'center',
    });
    text.setOrigin(0.5);
    this.uiTexts.push(text);
  }

  private showPauseMessage(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    let text = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '64px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setShadow(5, 5, '#000000', 8);
    this.uiTexts.push(text);

    text = this.add.text(width / 2, height / 2 + 80, 'Press P to Resume', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center',
    });
    text.setOrigin(0.5);
    this.uiTexts.push(text);
  }

  private showGameOver(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.uiTexts.forEach(t => t.destroy());
    this.uiTexts = [];

    let text = this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0000',
      align: 'center',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setShadow(5, 5, '#000000', 8);
    this.uiTexts.push(text);

    const gameState = useGameStore.getState().player1.gameState;
    text = this.add.text(width / 2, height / 2 + 50, `Final Score: ${gameState.score}`, {
      fontSize: '28px',
      color: '#ffff00',
      align: 'center',
    });
    text.setOrigin(0.5);
    this.uiTexts.push(text);
  }
}
