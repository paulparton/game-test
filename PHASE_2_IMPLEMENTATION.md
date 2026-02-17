# Phase 2 Implementation Guide

## Overview

Phase 2 transforms the MVP into a polished, feature-rich game. This guide provides step-by-step implementation plans for:

1. **Visual Polish** (GSAP animations)
2. **Audio Design** (Howler.js)
3. **Custom Attack System**
4. **Two-Player UI** (Split-screen)
5. **Mobile Optimization**

Total estimated effort: 3-4 weeks of full-time development.

---

## 1. Visual Polish with GSAP

### Goals
- Smooth piece falling
- Chain explosion animations
- Floating numbers (score pop-ups)
- Screen shake on attacks
- Particle effects

### Setup

GSAP is already installed. Create animation module:

```typescript
// src/animations/gsapAnimations.ts

import gsap from 'gsap';

export interface AnimationController {
  animatePieceFall(sprite: Phaser.GameObjects.Sprite, duration: number): Promise<void>;
  animateChainClear(positions: Position[], onComplete: () => void): void;
  animateScorePopup(text: string, x: number, y: number): void;
  screenShake(intensity: number): void;
  attackFlash(duration: number): void;
}

export function createAnimationController(scene: Phaser.Scene): AnimationController {
  return {
    // Implementation below
  };
}
```

### Implementation Steps

#### Step 1: Piece Fall Animation
```typescript
async animatePieceFall(sprite: Phaser.GameObjects.Sprite, duration: number): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(sprite, {
      y: sprite.y + 48,  // One row down
      duration,
      ease: 'linear',
      onComplete: resolve,
    });
  });
}
```

Integration in `GameScene.ts`:
```typescript
if (timeSinceLastFall > FALL_SPEED) {
  // Instead of directly updating position:
  // position.y += 1
  
  // Use animation:
  await animationController.animatePieceFall(pieceSpriteGroup, FALL_SPEED / 1000);
  
  lastFallTime = currentTime;
}
```

#### Step 2: Chain Clear Animation
```typescript
animateChainClear(positions: Position[], onComplete: () => void): void {
  const sprites = positions.map(pos => getSpriteAt(pos));
  
  gsap.to(sprites, {
    scale: 0.5,
    opacity: 0.2,
    duration: 0.3,
    ease: 'back.in',
    stagger: 0.05,
    onComplete: () => {
      onComplete();  // Clears matches from board
      gsap.set(sprites, { scale: 1, opacity: 1 });  // Reset
    },
  });
}
```

Integration in `GameScene.ts`:
```typescript
const matches = detectMatches(board);
if (matches.length > 0) {
  await animationController.animateChainClear(matches, () => {
    board = clearMatches(board);
  });
  
  // Play sound
  soundManager.play('chain');
}
```

#### Step 3: Floating Numbers
```typescript
animateScorePopup(text: string, x: number, y: number): void {
  const popup = this.scene.add.text(x, y, text, {
    fontSize: '32px',
    color: '#ffff00',
  });
  
  gsap.to(popup, {
    y: y - 100,
    opacity: 0,
    duration: 1,
    ease: 'power2.out',
    onComplete: () => {
      popup.destroy();
    },
  });
}
```

Integration:
```typescript
if (chainCount > 0) {
  const score = 100 * (2 ** chainCount);
  animationController.animateScorePopup(`+${score}`, boardCenterX, boardCenterY);
}
```

#### Step 4: Screen Shake
```typescript
screenShake(intensity: number = 10): void {
  const camera = this.scene.cameras.main;
  
  gsap.fromTo(camera,
    { shake: 0 },
    { shake: intensity, duration: 0.3, ease: 'power1.inOut' }
  );
}
```

Integration:
```typescript
// On attack hit
if (player2ReceivesAttack) {
  animationController.screenShake(15);
  soundManager.play('hit');
}
```

#### Step 5: Particle Effects
```typescript
// src/animations/particles.ts

export class MatchParticles {
  static explode(scene: Phaser.Scene, x: number, y: number, count: number = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const particle = scene.add.circle(x, y, 4, 0xffaa00);
      
      gsap.to(particle, {
        x: x + 200 * Math.cos(angle),
        y: y + 200 * Math.sin(angle),
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
```

### Testing Animations

```bash
# Verify animations don't block game logic
npm run dev

# Play game, create chains
# Check: Animations smooth, game responsive, no lockups
```

### Animation Timeline (Estimated)

| Task | Duration | Difficulty |
|------|----------|------------|
| Setup GSAP module | 1 hour | Easy |
| Piece fall animation | 2 hours | Medium |
| Chain clear animation | 2 hours | Medium |
| Score popups | 1 hour | Easy |
| Screen shake | 1 hour | Easy |
| Particle effects | 3 hours | Medium |
| Integration & polish | 4 hours | Medium |
| **Total** | **14 hours** | |

---

## 2. Audio Design with Howler.js

### Goals
- Sound effects for actions
- Background music
- Audio feedback for attacks
- Volume controls
- Mute button

### Setup

Howler.js is already installed. Create sound manager:

```typescript
// src/audio/soundManager.ts

import { Howl, Howler } from 'howler';

export interface SoundManager {
  play(sfx: 'move' | 'drop' | 'lock' | 'match' | 'chain' | 'attack' | 'hit' | 'gameover'): void;
  playMusic(track: 'menu' | 'gameplay'): void;
  setVolume(volume: number): void;
  mute(muted: boolean): void;
  dispose(): void;
}

export function createSoundManager(): SoundManager {
  // Implementation below
}
```

### Audio Library (Sounds Needed)

```typescript
const sounds = {
  move: 'assets/audio/sfx/move.mp3',        // ~100ms beep
  drop: 'assets/audio/sfx/drop.mp3',        // ~200ms settling sound
  lock: 'assets/audio/sfx/lock.mp3',        // ~150ms placement sound
  match: 'assets/audio/sfx/match.mp3',      // ~300ms pop sound
  chain: 'assets/audio/sfx/chain.mp3',      // ~500ms cascade sound
  attack: 'assets/audio/sfx/attack.mp3',    // ~400ms attack sound
  hit: 'assets/audio/sfx/hit.mp3',          // ~350ms impact
  gameover: 'assets/audio/sfx/gameover.mp3', // ~1s fade
  musicMenu: 'assets/audio/music/menu.mp3', // ~60s loop
  musicGame: 'assets/audio/music/game.mp3', // ~120s loop
};
```

### Implementation

```typescript
export function createSoundManager(): SoundManager {
  const audioLibrary: Record<string, Howl> = {};

  // Load all sounds
  Object.entries(sounds).forEach(([key, path]) => {
    audioLibrary[key] = new Howl({
      src: [path],
      volume: 0.8,
    });
  });

  // Start background music
  audioLibrary.musicMenu.loop(true);
  audioLibrary.musicMenu.play();

  return {
    play(sfx: string) {
      const sound = audioLibrary[sfx];
      if (sound) {
        sound.stop();  // Restart if already playing
        sound.play();
      }
    },

    playMusic(track: 'menu' | 'gameplay') {
      // Stop current music
      audioLibrary.musicMenu.stop();
      audioLibrary.musicGame.stop();

      // Play new track
      const track_key = track === 'menu' ? 'musicMenu' : 'musicGame';
      audioLibrary[track_key].loop(true);
      audioLibrary[track_key].play();
    },

    setVolume(volume: number) {
      Howler.volume(Math.max(0, Math.min(1, volume)));
    },

    mute(muted: boolean) {
      Howler.mute(muted);
    },

    dispose() {
      Object.values(audioLibrary).forEach(sound => sound.unload());
    },
  };
}
```

### Integration with Game

**In `GameScene.ts`:**
```typescript
export class GameScene extends Phaser.Scene {
  private soundManager: SoundManager;

  create() {
    this.soundManager = createSoundManager();
  }

  // When piece moves:
  movePiece() {
    this.soundManager.play('move');
  }

  // When piece locks:
  lockPiece() {
    this.soundManager.play('lock');
  }

  // When chain detected:
  onChainDetected(chainCount: number) {
    if (chainCount > 1) {
      this.soundManager.play('chain');
    } else {
      this.soundManager.play('match');
    }
  }

  // When attack received:
  onAttackReceived() {
    this.soundManager.play('hit');
  }
}
```

**In `MenuScene.ts`:**
```typescript
create() {
  const soundManager = createSoundManager();
  soundManager.playMusic('menu');

  // Add volume slider
  const volumeSlider = this.add.slider(600, 750, 150, 25, 0, 1, 0.8);
  volumeSlider.on('input', (value: number) => {
    soundManager.setVolume(value);
  });

  // Add mute button
  const muteButton = this.add.text(750, 750, '🔊', { fontSize: '32px' });
  muteButton.setInteractive();
  muteButton.on('pointerdown', () => {
    const isMuted = !document.hidden;  // Use a proper state var
    soundManager.mute(isMuted);
    muteButton.setText(isMuted ? '🔇' : '🔊');
  });
}
```

### Creating Audio Assets

**Option 1: Use Free Sound Effects**
- Freesound.org
- Zapsplat
- Pixabay

**Option 2: Generate Synthetically**
```typescript
// Using Tone.js (add if needed)
import * as Tone from 'tone';

async function generateBeep() {
  await Tone.start();
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  synth.triggerAttackRelease('C4', '8n');
}
```

### Audio Timeline (Estimated)

| Task | Duration | Difficulty |
|------|----------|------------|
| Setup Howler.js module | 1 hour | Easy |
| Create sound effects (8) | 3 hours | Medium |
| Create background music (2) | 4 hours | Medium |
| Integration | 2 hours | Easy |
| Volume controls | 1 hour | Easy |
| **Total** | **11 hours** | |

---

## 3. Custom Attack System

### Detailed Design

Per `CUSTOM_ATTACK_SYSTEM_DESIGN.md`, implement 5 MVP attacks:

#### Attack 1: Color Lock
```typescript
// src/game/attacks/colorLock.ts

export const colorLockAttack = {
  id: 'color-lock',
  tier: 'basic',
  duration: 4000,
  
  execute(board: Board, targetColor?: PuyoColor): Board {
    const color = targetColor || randomColor();
    
    return {
      ...board,
      grid: board.grid.map(row =>
        row.map(puyo =>
          puyo.color === color
            ? { ...puyo, isLocked: true }
            : puyo
        )
      ),
    };
  },
};
```

Integration:
```typescript
// In gameState.ts lockPieceAction:
if (player.attackMeter >= TIER_1_THRESHOLD) {
  opponent.activeAttacks.push(colorLockAttack);
  player.attackMeter = 0;
}

// In board.ts when placing pieces:
for (const attack of player.activeAttacks) {
  board = attack.execute(board);
}

// Update UI to show locked status
```

#### Attack 2: Meteor Shower
```typescript
// src/game/attacks/meteorShower.ts

export const meteorShowerAttack = {
  id: 'meteor-shower',
  tier: 'intermediate',
  duration: 5000,
  
  execute(board: Board): Board {
    // Add garbage puyos in random columns
    const garbageRow = createGarbageRow(board.width);
    
    return {
      ...board,
      grid: [garbageRow, ...board.grid.slice(0, -1)],
    };
  },
};
```

#### Attack 3: Hot Zone
```typescript
// src/game/attacks/hotZone.ts

export const hotZoneAttack = {
  id: 'hot-zone',
  tier: 'intermediate',
  duration: 6000,
  
  execute(board: Board, column: number = 2): Board {
    // Prevent piece placement in column
    return {
      ...board,
      hotZoneColumn: column,
    };
  },
};

// In movement logic:
if (board.hotZoneColumn !== undefined) {
  if (piece.x === board.hotZoneColumn) {
    // Cannot move into this column
    return null;  // Move blocked
  }
}
```

#### Attack 4: Time Pressure
```typescript
// src/game/attacks/timePressure.ts

export const timePressureAttack = {
  id: 'time-pressure',
  tier: 'advanced',
  duration: 5000,
  falSpeedMultiplier: 2.5,  // 2.5× faster fall
};

// In GameScene update loop:
let effectiveFallSpeed = BASE_FALL_SPEED;
for (const attack of player.activeAttacks) {
  if (attack.id === 'time-pressure') {
    effectiveFallSpeed *= attack.falSpeedMultiplier;
  }
}
```

#### Attack 5: Chain Amplifier
```typescript
// src/game/attacks/chainAmplifier.ts

export const chainAmplifierAttack = {
  id: 'chain-amplifier',
  tier: 'advanced',
  duration: 6000,
  scoreMultiplier: 3,  // 3× score and damage
};

// In lockPieceAction:
let chainBonus = 2 ** chainCount * 100;
for (const attack of player.activeAttacks) {
  if (attack.id === 'chain-amplifier') {
    chainBonus *= attack.scoreMultiplier;
  }
}
```

### UI Implementation

Create attack UI component:

```typescript
// src/scenes/AttackUI.ts

export class AttackUI {
  private attackMeterBar: Phaser.GameObjects.Graphics;
  private activeAttacksList: Phaser.GameObjects.Text;

  update(player: PlayerState, scene: Phaser.Scene) {
    // Draw meter
    this.attackMeterBar.clear();
    const meterWidth = 200;
    const meterHeight = 20;
    const fillWidth = (player.attackMeter / 100) * meterWidth;

    this.attackMeterBar.fillStyle(0x444444);
    this.attackMeterBar.fillRect(10, 10, meterWidth, meterHeight);

    this.attackMeterBar.fillStyle(0xff4444);
    this.attackMeterBar.fillRect(10, 10, fillWidth, meterHeight);

    // Draw active attacks
    if (player.activeAttacks.length > 0) {
      const attackText = player.activeAttacks
        .map(a => a.id.toUpperCase())
        .join(', ');
      this.activeAttacksList.setText(`🔥 ${attackText}`);
    }
  }
}
```

### State Management Updates

```typescript
// In gameState.ts

interface PlayerState {
  // ... existing fields
  activeAttacks: Attack[];
  attackDurations: Record<string, number>;  // Track time remaining
}

// Add action
expireAttacks: (playerNum: number, deltaTime: number) => {
  const player = playerNum === 1 ? state.player1 : state.player2;
  
  player.activeAttacks = player.activeAttacks.filter(attack => {
    const timeRemaining = player.attackDurations[attack.id] - deltaTime;
    player.attackDurations[attack.id] = timeRemaining;
    return timeRemaining > 0;
  });
}
```

### Attack Timeline (Estimated)

| Task | Duration | Difficulty |
|------|----------|------------|
| Implement Color Lock | 2 hours | Easy |
| Implement Meteor Shower | 1.5 hours | Easy |
| Implement Hot Zone | 2 hours | Medium |
| Implement Time Pressure | 1.5 hours | Easy |
| Implement Chain Amplifier | 1.5 hours | Easy |
| Create Attack UI | 3 hours | Medium |
| State management updates | 2 hours | Medium |
| Testing & polish | 3 hours | Medium |
| **Total** | **16.5 hours** | |

---

## 4. Two-Player Split-Screen UI

### Layout Design

```
┌─────────────────────────────────────────────┐
│ SCORE: 1000    vs    SCORE: 2000            │
├──────────────┬─────────────────────────────┤
│ PLAYER 1     │     PLAYER 2                │
│              │                             │
│   Board      │        Board                │
│   6x12       │        6x12                 │
│              │                             │
│              │                             │
│ Attack Meter │   Attack Meter              │
│ Next: [PCS]  │   Next: [PCS]               │
└──────────────┴─────────────────────────────┘
```

### Implementation

```typescript
// src/scenes/GameScene.ts - Modified for 2P

export class GameScene extends Phaser.Scene {
  private player1UI: GameBoardUI;
  private player2UI: GameBoardUI;

  create() {
    const boardWidth = 300;  // Each board gets half width

    // Left player
    this.player1UI = new GameBoardUI(this, 50, 50, boardWidth);

    // Right player
    this.player2UI = new GameBoardUI(this, 400, 50, boardWidth);
  }

  update(time: number, delta: number) {
    const gameState = useGameStore.getState();

    // Update both players
    this.updatePlayerBoard(
      gameState.player1,
      this.player1UI,
      delta
    );

    this.updatePlayerBoard(
      gameState.player2,
      this.player2UI,
      delta
    );
  }

  private updatePlayerBoard(
    player: PlayerState,
    ui: GameBoardUI,
    delta: number
  ) {
    // Render board
    ui.drawBoard(player.gameState.board);

    // Render pieces
    ui.drawCurrentPiece(player.gameState.currentPiece);
    ui.drawNextPiece(player.gameState.nextPiece);

    // Render stats
    ui.drawScore(player.gameState.score);
    ui.drawChainCount(player.gameState.chainCount);
    ui.drawAttackMeter(player.attackMeter);

    // Render active attacks
    ui.drawActiveAttacks(player.activeAttacks);
  }
}
```

### GameBoardUI Component

```typescript
// src/ui/GameBoardUI.ts

export class GameBoardUI {
  private x: number;
  private y: number;
  private width: number;
  private cellSize: number;
  private graphics: Phaser.GameObjects.Graphics;
  private texts: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    width: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.cellSize = width / 6;  // 6 columns
    this.graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  }

  drawBoard(board: Board) {
    this.graphics.clear();

    // Draw grid
    this.graphics.lineStyle(1, 0x444444);
    for (let x = 0; x <= board.width; x++) {
      this.graphics.lineBetween(
        this.x + x * this.cellSize,
        this.y,
        this.x + x * this.cellSize,
        this.y + board.height * this.cellSize
      );
    }

    for (let y = 0; y <= board.height; y++) {
      this.graphics.lineBetween(
        this.x,
        this.y + y * this.cellSize,
        this.x + this.width,
        this.y + y * this.cellSize
      );
    }

    // Draw puyos
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const puyo = board.grid[y][x];
        if (puyo.color !== PuyoColor.Empty) {
          const color = this.colorToHex(puyo.color);
          this.drawPuyo(x, y, color);
        }
      }
    }
  }

  drawCurrentPiece(piece: Piece) {
    piece.positions.forEach((pos, i) => {
      const color = this.colorToHex(piece.colors[i]);
      this.drawPuyo(piece.x + pos.x, piece.y + pos.y, color, true);
    });
  }

  drawNextPiece(piece: Piece) {
    const previewX = this.x + this.width + 20;
    const previewY = this.y + 20;

    piece.positions.forEach((pos, i) => {
      const color = this.colorToHex(piece.colors[i]);
      // Draw at preview position
    });
  }

  drawScore(score: number) {
    this.setText('score', `SCORE: ${score}`, this.x + this.width / 2, this.y - 30);
  }

  drawChainCount(count: number) {
    if (count > 0) {
      this.setText('chain', `${count} CHAIN`, this.x + 50, this.y - 10);
    }
  }

  drawAttackMeter(meter: number) {
    const barWidth = 80;
    const barHeight = 12;
    const x = this.x;
    const y = this.y + (12 * this.cellSize) + 20;

    // Background
    this.graphics.fillStyle(0x333333);
    this.graphics.fillRect(x, y, barWidth, barHeight);

    // Fill
    this.graphics.fillStyle(0xff4444);
    this.graphics.fillRect(x, y, (meter / 100) * barWidth, barHeight);

    this.setText('meter', `ATTACK`, x, y - 15);
  }

  drawActiveAttacks(attacks: Attack[]) {
    if (attacks.length === 0) return;

    const text = attacks.map(a => a.id.toUpperCase()).join(', ');
    this.setText('attacks', `🔥 ${text}`, this.x, this.y + (13 * this.cellSize));
  }

  private drawPuyo(x: number, y: number, color: number, highlight: boolean = false) {
    const radius = this.cellSize / 2 - 2;
    const px = this.x + x * this.cellSize + this.cellSize / 2;
    const py = this.y + y * this.cellSize + this.cellSize / 2;

    this.graphics.fillStyle(color);
    this.graphics.fillCircle(px, py, radius);

    if (highlight) {
      this.graphics.lineStyle(2, 0xffffff);
      this.graphics.strokeCircle(px, py, radius);
    }
  }

  private setText(key: string, text: string, x: number, y: number) {
    if (!this.texts.has(key)) {
      this.texts.set(key, this.scene.add.text(x, y, text));
    }
    this.texts.get(key)!.setText(text).setX(x).setY(y);
  }

  private colorToHex(color: PuyoColor): number {
    const map: Record<PuyoColor, number> = {
      [PuyoColor.Red]: 0xff4444,
      [PuyoColor.Blue]: 0x4444ff,
      [PuyoColor.Green]: 0x44ff44,
      [PuyoColor.Yellow]: 0xffff44,
      [PuyoColor.Garbage]: 0x888888,
      [PuyoColor.Empty]: 0x000000,
    };
    return map[color];
  }
}
```

### Input Handling for 2P

```typescript
// In inputManager.ts

// Player 2 controls: IJKL for movement, U/O for rotate, P for drop
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.code) {
    // Player 1 (Arrow keys)
    case 'ArrowLeft':
      this.emitEvent('player1-move-left');
      break;
    case 'ArrowRight':
      this.emitEvent('player1-move-right');
      break;

    // Player 2 (IJKL)
    case 'KeyJ':
      this.emitEvent('player2-move-left');
      break;
    case 'KeyL':
      this.emitEvent('player2-move-right');
      break;
    case 'KeyI':
      this.emitEvent('player2-move-up');
      break;
    case 'KeyK':
      this.emitEvent('player2-move-down');
      break;
  }
};
```

### Two-Player Timeline (Estimated)

| Task | Duration | Difficulty |
|------|----------|------------|
| UI refactor for split-screen | 3 hours | Medium |
| GameBoardUI component | 4 hours | Medium |
| Dual input handling | 2 hours | Easy |
| Layout & responsive sizing | 2 hours | Medium |
| Player 2 AI/input toggle | 2 hours | Easy |
| Testing & refinement | 3 hours | Easy |
| **Total** | **16 hours** | |

---

## 5. Mobile Optimization

### Responsive Layout

```typescript
// src/utils/responsive.ts

export function getGameDimensions() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < 768) {
    // Mobile: Vertical layout
    return {
      gameWidth: width,
      gameHeight: height - 100,
      boardScale: 0.8,
      layout: 'vertical' as const,
    };
  } else if (width < 1024) {
    // Tablet: Stacked layout
    return {
      gameWidth: width,
      gameHeight: height,
      boardScale: 1,
      layout: 'stacked' as const,
    };
  } else {
    // Desktop: Side-by-side
    return {
      gameWidth: width,
      gameHeight: height,
      boardScale: 1,
      layout: 'horizontal' as const,
    };
  }
}
```

### Touch Controls

```typescript
// src/input/touchControls.ts

export function createTouchControls(scene: Phaser.Scene) {
  // Left zone for movement
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    if (pointer.x < window.innerWidth / 2) {
      if (pointer.y < window.innerHeight / 3) {
        emitEvent('rotate');
      } else if (pointer.y > (2 * window.innerHeight) / 3) {
        emitEvent('drop');
      } else if (pointer.x < window.innerWidth / 4) {
        emitEvent('move-left');
      } else {
        emitEvent('move-right');
      }
    }
  });

  // Swipe support
  let startX = 0;
  scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    startX = pointer.x;
  });

  scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
    const diff = pointer.x - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) emitEvent('move-right');
      else emitEvent('move-left');
    }
  });
}
```

### Mobile Timeline (Estimated)

| Task | Duration | Difficulty |
|------|----------|------------|
| Responsive dimensions | 1.5 hours | Easy |
| Touch controls | 2 hours | Medium |
| Mobile UI layout | 2 hours | Medium |
| On-screen buttons | 2 hours | Easy |
| Testing on devices | 2 hours | Medium |
| **Total** | **9.5 hours** | |

---

## Implementation Priority

### Week 1: Visual Polish
1. ✅ Setup GSAP animations module
2. ✅ Piece fall animations
3. ✅ Chain clear animations
4. ✅ Score popup floating text
5. ✅ Screen shake effects

### Week 2: Audio Design
1. ✅ Setup Howler.js module
2. ✅ Create/source sound effects
3. ✅ Create background music (looping)
4. ✅ Integrate into game events
5. ✅ Volume controls

### Week 2-3: Custom Attacks
1. ✅ Implement 5 MVP attacks
2. ✅ Create attack UI
3. ✅ State management integration
4. ✅ Attack triggering on chains
5. ✅ Visual effects for attack application

### Week 3: Two-Player UI
1. ✅ Split-screen layout
2. ✅ Dual board rendering
3. ✅ Dual input handling
4. ✅ Player 2 controls
5. ✅ Attack meter display

### Week 4: Polish
1. ✅ Mobile optimization
2. ✅ Touch controls
3. ✅ Accessibility (colorblind modes)
4. ✅ Performance optimization
5. ✅ Bug fixes and testing

## Success Criteria

Phase 2 is complete when:

- ✅ Animations smooth and non-blocking (60 FPS maintained)
- ✅ Audio plays correctly with proper volume/mute
- ✅ All 5 attacks implemented and balanced
- ✅ Two-player split-screen fully functional
- ✅ Mobile plays smoothly on iOS/Android
- ✅ No console errors or warnings
- ✅ npm run lint passes
- ✅ npm run type-check passes
- ✅ Game is fun and engaging to play

## Testing Checklist

### Animations
- [ ] Pieces fall smoothly
- [ ] Chains explode visually
- [ ] Score text floats up and fades
- [ ] Screen shake feels right
- [ ] No frame rate drops during effects

### Audio
- [ ] Sounds play on expected events
- [ ] Volume slider works
- [ ] Mute button works
- [ ] Music loops without gaps
- [ ] No audio glitches

### Attacks
- [ ] Color Lock prevents matching
- [ ] Meteor Shower adds garbage
- [ ] Hot Zone blocks column
- [ ] Time Pressure speeds up pieces
- [ ] Chain Amplifier multiplies score

### Two-Player
- [ ] Both boards render correctly
- [ ] Player 1 and 2 can play simultaneously
- [ ] Attacks cross between boards
- [ ] Input doesn't interfere between players
- [ ] Layout responsive to window size

### Mobile
- [ ] Responsive on 375px (iPhone SE)
- [ ] Responsive on 768px (iPad)
- [ ] Touch controls responsive
- [ ] No overflow or layout breaks
- [ ] Performance acceptable on older devices

---

## Summary

Phase 2 transforms the MVP into a polished, feature-complete game:

- **14-16 hours**: Visual animations (smooth, professional feel)
- **11 hours**: Audio design (immersive sound + music)
- **16.5 hours**: Custom attack system (strategic depth)
- **16 hours**: Two-player split-screen (multiplayer ready)
- **9.5 hours**: Mobile optimization (platform agnostic)

**Total**: ~67 hours of development (2-3 weeks full-time)

This brings the game from functional MVP to **AAA-quality experience** as specified in the original prompt.

Next phases (Phase 3+) would include online multiplayer, leaderboards, platform integration, and desktop/mobile app releases.
