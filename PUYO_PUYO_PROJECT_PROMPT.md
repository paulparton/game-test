# Puyo Puyo Game - Professional Development Prompt

## Executive Summary

You are tasked with developing a **production-quality Puyo Puyo game** in TypeScript that serves as the flagship title for a future game hub platform. This first iteration focuses on creating a feature-complete, locally-multiplayer puzzle game with professional-grade visuals, performance, and code architecture. The codebase must be architected to seamlessly integrate with a backend platform (profiles, matchmaking, chat) in Phase 2.

**Target**: Free, web-based game playable immediately; future mobile/desktop ports via cross-platform architecture.

---

## Project Objectives

### Phase 1: Core Game (MVP - Fully Featured)
- **Local 2-player multiplayer** with full Puyo Puyo mechanics
- **AI opponent** (single-player mode)
- **Feature-complete gameplay** including chain bonuses, garbage attacks, special mechanics
- **Professional UI/UX** with responsive layout
- **AAA-quality visual polish** (animations, particle effects, sound design)
- **Performance**: 60 FPS consistently, <50ms input latency
- **Cross-browser compatible** (Chrome, Firefox, Safari, Edge)

### Phase 2: Platform Integration (Future)
- Backend API integration
- Multiplayer matchmaking
- Player profiles & stats
- Chat system
- Game hub integration

---

## Gameplay Specifications

### Core Mechanics (Classic Puyo Puyo)
1. **Board**: 6 columns × 12 rows
2. **Puyos Group Colors**: 4 standard colors (red, blue, green, yellow) + bonus mechanics
3. **Falling Mechanics**: 
   - Players alternate or simultaneous play (configurable)
   - Soft drop (faster descent)
   - Hard drop (instant placement)
   - Rotation (CW/CCW with wall kicks)
4. **Matching**: 4+ connected Puyos (same color, orthogonal adjacency) = chain
5. **Garbage System**: Rows of single-color puyos sent to opponent on chain
6. **Score Multipliers**: 
   - Position multiplier (chains increase exponentially)
   - Color bonus (matching 4+ colors)
   - Speed bonus (time-based)
7. **Win Condition**: Opponent's board fills (stack overflow)

### Custom Attack Types (To Be Designed)
- **Framework ready for custom attack implementations**:
  - Meteor attacks (random board disruption)
  - Color locks (freeze specific colors temporarily)
  - Cascade amplifiers (increase chain values)
  - Gravity shifts (alter falling mechanics)
  - "Hazard zones" (designated areas deal extra damage)
  - Custom attack UI with cooldown/activation feedback
- **Design flexibility**: Attacks triggered by combos, special piece events, or progression milestones
- **Balancing**: All custom attacks must maintain competitive fairness

### Difficulty Levels
- **Easy**: AI plays slowly, few chains
- **Normal**: Strategic AI with defense/offense balance
- **Hard**: Aggressive AI, complex chain predictions
- **Extreme**: Perfect play simulation with minimal delays

---

## Technical Architecture

### Core Principles
1. **Game Logic ≠ Rendering**: Complete separation of concerns
   - Pure game logic in isolated modules (no DOM dependencies)
   - Rendering layer consumes game state for display
   - Enables easy testing, platform porting, and replay systems

2. **Immutable Game State**: Game board/piece state treated immutably
   - Enables undo, replay, networking synchronization
   - Predictable state transitions

3. **Tick-Based Simulation**: Fixed timestep game loop
   - Ensures deterministic behavior for networking
   - 60 FPS rendering decoupled from 60 Hz game ticks
   - Smooth client prediction for multiplayer readiness

4. **Input Buffering**: Non-blocking input capture with debouncing
   - Prevents input latency perception
   - Supports simultaneous inputs (keyboard + gamepad)

### Recommended Tech Stack

#### Core Framework
- **Primary Choice**: **Phaser 3** (v3.60+)
  - Industry-standard for 2D games
  - Excellent input/animation systems
  - Active community, strong documentation
  - Easy cross-platform packaging via Phaser + Capacitor
  
- **Alternative**: Custom Canvas-based engine (if lower-level control preferred)
  - Direct `canvas` context with `requestAnimationFrame`
  - PixiJS for rendering layer (extreme performance optimization)
  - Gives maximum flexibility for competitive mechanics

#### State Management
- **Zustand** (primary): Lightweight, TypeScript-first, minimal overhead
- **Redux Toolkit** (if complex time-travel debugging needed): More verbose but excellent DevTools

#### Animation & Effects
- **GSAP** (v3.12+): Industry standard, exceptional for UI and easing
- **Web Animations API**: Native browser animations, lighter footprint
- **Particle Effects**: Establish custom particle system for chain explosions, garbage impacts
  - Consider: PixiJS Particle Container for high volume

#### Audio
- **Howler.js** (v2.2+): Cross-browser audio with spatial sound
- **Web Audio API**: Direct access for advanced DSP (optional)
- Professional sound design: UI clicks, chain reactions, victory fanfares, background loops

#### Input Handling
- **Native keyboard events**: KeyboardEvent API (fully sufficient for puzzle games)
- **Gamepad API**: Full support for controllers (future-proofing)
- **Touch Events**: Full mobile gesture support (swipe, long-press for rotate)
- **Debouncing library**: Minor input smoothing without frame-skipping

#### Graphics & UI
- **SVG + CSS**: 
  - **SVG for**: Initial menu backgrounds, vector UI icons (use as sprites via `<svg>` or convert to sprite sheets)
  - **CSS for**: Responsive container layouts, animated transitions
  - **Canvas/WebGL for**: Real-time game board rendering (for performance)
- **CSS Framework**: Tailwind CSS or custom grid (minimal, production-ready)
- **Icon Library**: Use open-source SVG icons (Feather Icons, Heroicons) or create custom set
- **Sprite Sheet Generation**: Tool like Texture Packer or free alternatives (SpriteSmith, GraphicsMagick)

#### Build & Development
- **Bundler**: **Vite** (v5+) - exceptional for TypeScript games
  - Hot module replacement for rapid iteration
  - Optimized production builds (code splitting, tree-shaking)
  - Native TypeScript support
  - ~1-2 second dev build times
- **Package Manager**: **pnpm** (faster, uses lockfile by default, saves disk space)
- **Linting**: ESLint + Prettier (strict configuration for team consistency)
- **Pre-commit Hooks**: Husky + lint-staged (prevent unformatted commits)

#### Testing
- **Unit Tests**: **Vitest** (Vite-native, TypeScript-first)
  - Game logic, AI algorithms, state transitions
  - Mock heavy dependencies (canvas, audio)
  - Target: 80%+ coverage on core game logic

- **E2E Tests**: **Playwright** or **Cypress**
  - Full game scenarios: win/loss conditions, UI flows
  - Visual regression testing

- **Performance Testing**: Custom benchmarks with `performance.mark()` and `performance.measure()`
  - Board evaluation speed (critical for AI)
  - Rendering frame times, memory profiling

#### Deployment
- **Hosting**: Vercel, Netlify, or GitHub Pages (all support Vite perfectly)
  - Static file hosting sufficient for Phase 1
  - Estimated: <2MB gzipped for full game
- **CDN**: Automatic with Vercel/Netlify
- **Analytics**: Plausible or privacy-focused alternative (not Google Analytics)

---

## Recommended Project Structure

```
puyo-game/
├── src/
│   ├── game/                    # Pure game logic (no dependencies on DOM/rendering)
│   │   ├── board.ts             # Board state, piece placement logic
│   │   ├── piece.ts             # Tetromino-like piece definitions
│   │   ├── physics.ts           # Gravity, collision, falling mechanics
│   │   ├── chain.ts             # Chain detection, scoring
│   │   ├── ai/                  # AI algorithms
│   │   │   ├── evaluator.ts     # Board evaluation function
│   │   │   ├── minimax.ts       # Decision tree search
│   │   │   └── levelDifficulty.ts
│   │   ├── gameState.ts         # Global state machine (using Zustand)
│   │   ├── types.ts             # TypeScript interfaces (Color, Board, GameState, etc.)
│   │   └── constants.ts         # Game constants (board dimensions, scoring rules)
│   │
│   ├── rendering/               # Rendering layer (Canvas/Phaser)
│   │   ├── renderer.ts          # Main renderer class
│   │   ├── sprites.ts           # Sprite management, texture loading
│   │   ├── animations.ts        # GSAP animation orchestration
│   │   ├── effects/             # Particle systems, visual effects
│   │   │   ├── chainExplosion.ts
│   │   │   ├── garbageImpact.ts
│   │   │   └── scorePopups.ts
│   │   └── ui/                  # UI components
│   │       ├── mainMenu.ts
│   │       ├── gameUI.ts
│   │       ├── scoreDisplay.ts
│   │       └── pauseMenu.ts
│   │
│   ├── input/                   # Input handling
│   │   ├── keyboardInput.ts
│   │   ├── gamepadInput.ts
│   │   ├── touchInput.ts
│   │   └── inputManager.ts      # Unified interface
│   │
│   ├── audio/                   # Sound management
│   │   ├── soundManager.ts      # Howler.js wrapper
│   │   ├── musicManager.ts
│   │   └── sfxRegistry.ts       # Audio file preloading
│   │
│   ├── utils/                   # Utilities
│   │   ├── mathUtils.ts
│   │   ├── debugUtils.ts
│   │   └── performanceMonitor.ts
│   │
│   ├── components/              # React/Vue-like UI components (optional if using framework)
│   │   ├── GameBoard.tsx
│   │   ├── ScoreBoard.tsx
│   │   └── Menu.tsx
│   │
│   ├── App.ts                   # Main entry point
│   └── index.html               # Static HTML
│
├── assets/
│   ├── sprites/                 # Sprite sheets, puyos, UI elements
│   ├── svg/                     # SVG sources (converted to PNG for sprites)
│   ├── audio/
│   │   ├── sfx/                 # Sound effects (.wav, .mp3)
│   │   └── music/               # Background tracks
│   └── fonts/                   # Custom fonts (if any)
│
├── tests/
│   ├── game/                    # Game logic tests
│   ├── rendering/               # Rendering tests
│   └── ai/                      # AI algorithm tests
│
├── vite.config.ts               # Vite configuration
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc.json
└── package.json
```

---

## Key Open-Source Libraries & Tools

### Highly Recommended
1. **Phaser 3** (v3.60+): Game framework - unmatched for 2D puzzle games
2. **Zustand**: State management - minimal overhead, perfect for game state
3. **GSAP**: Animations - industry standard, exceptional easing functions
4. **Howler.js**: Audio - reliable cross-browser sound playback
5. **Vite**: Build tool - exceptional dev experience, fast builds
6. **TypeScript**: Language - type safety critical for complex game logic
7. **Vitest**: Testing - TypeScript-native, incredibly fast
8. **PixiJS** (if custom rendering): GPU-accelerated 2D rendering

### Supporting Tools
- **ESLint + Prettier**: Code quality
- **Husky**: Git hooks for automated linting
- **Turborepo** (if monorepo needed later): Task orchestration for multi-game projects
- **Sentry**: Error tracking (free tier generous)
- **Canvas Debugger**: Chrome DevTools for rendering optimization

### Graphics/Design Tools (Free & Open-Source)
- **Aseprite** (paid but affordable for pixel art) or **LibreSprite** (free fork)
- **Krita**: Professional open-source digital painting
- **Inkscape**: SVG design and manipulation
- **ImageMagick/GraphicsMagick**: CLI sprite sheet generation
- **PISKEL**: Free online pixel art tool
- **Font creation**: **FontForge** (open-source)

### Audio Tools
- **Audacity**: Free audio editing and mastering
- **FMOD Studio**: Free tier available (procedural audio ideal for game SFX)
- **Bfxr**: Retro pixel art sound generator
- **Freesound.org**: Royalty-free sound effects

---

## Development Best Practices

### Code Quality
1. **Strict TypeScript**: `"strict": true` in tsconfig - catch errors at compile time
2. **No `any` type**: Enforce explicit types throughout
3. **Pre-commit linting**: Husky + lint-staged prevents bad commits
4. **Code review checklist**: Frame rate impact, memory leaks, accessibility
5. **Performance profiling**: Use Chrome DevTools regularly

### Asset Pipeline
1. **Sprite sheets**: Consolidate all puyos, UI, effects into single sheet (reduce draw calls)
2. **SVG optimization**: Run through SVGO before embedding
3. **Audio compression**: MP3 or OGG Vorbis for background music, WAV for tight SFX timing
4. **Image formats**: PNG for sprites (lossless), WebP with fallback for backgrounds

### Game Loop Architecture
```
FIXED TIMESTEP (60 Hz):
- Input polling
- Physics/gravity update
- Piece collision detection
- Chain detection & scoring
- AI decision making
- State transitions

RENDER LOOP (60 FPS, decoupled):
- Poll game state
- Calculate interpolation
- Render board + pieces
- Update UI displays
- Animate effects
```

### Networking Readiness (Phase 2)
- **Deterministic game logic**: Same inputs = same board state always
- **Input recording**: Store move sequence (frame #, action type, direction)
- **Replay system**: Reconstruct game from move log
- **Frame-perfect networking**: Send only input events, not full state
- **Compression**: Reduced bandwidth for matchmaking service

### Accessibility
- **Color blindness**: Adjustable color palettes (deuteranopia, protanopia, tritanopia)
- **Keyboard shortcuts**: Full game playable without mouse
- **Screen reader support**: Semantic HTML for menus, labels for audio
- **Contrast**: WCAG AA compliance minimum for UI
- **Audio cues**: Sound effects provide game feedback (not just visuals)

---

## Quality Standards & Testing

### Performance Targets
- **Frame rate**: 60 FPS minimum, 144 FPS capable
- **Input latency**: <50ms from keypress to on-screen response
- **Memory usage**: <50 MB in typical gameplay
- **Bundle size**: <2 MB gzipped
- **Load time**: <3 seconds on 4G connection

### Testing Coverage
- **Unit tests**: 80%+ coverage on game logic modules
- **AI testing**: Validate AI doesn't freeze on edge cases, evaluates boards consistently
- **Visual regression**: Screenshot comparison on UI changes
- **Load testing**: Ensure no memory leaks over 1-hour play session
- **Cross-browser**: Chrome, Firefox, Safari, Edge on desktop; mobile browsers

### Continuous Integration
- Automated linting on PR
- Test suite runs on every commit
- Performance regression detection
- Pre-deployment bundle size checks

---

## Graphics & UI Strategy

### Game Board Rendering
- **Primary render mode**: HTML5 Canvas with WebGL acceleration (via Phaser/PixiJS)
- **Why Canvas vs SVG**: Better performance for real-time, pixel-perfect animations
- **Sprite composition**:
  - Puyo sprites: 64×64px base, scaled to fit board
  - Smooth rotation/bounce animations using GSAP
  - Particle effects (chain explosions, debris)

### UI & Menu Design
- **Approach**: Vue/React components for menu screens + Canvas for game board
- **SVG usage**: 
  - Menu backgrounds (procedurally drawn or static SVG)
  - Icon assets (buttons, status indicators)
  - Dynamic UI elements that don't need high FPS (score displays with CSS transitions)
- **CSS animations**: UI transitions, menu slides, score pop-ups
- **Responsive design**: Flexbox/Grid layout that adapts from mobile to desktop

### Visual Polish Elements
1. **Particle effects**:
   - Chain explosions (on 4-match detection)
   - Floating score indicators (+100, +500, etc.)
   - Garbage block impact dust clouds
   - Victory confetti burst

2. **Smooth animations**:
   - Piece falling (easing: ease-in)
   - Piece rotation (fast snap or smooth 90° arc)
   - Board shake on large chains
   - Piece lock flash before clearing
   - Score counter rolling/ticking animation

3. **Visual feedback**:
   - Highlight matched pieces before deletion
   - Pulse/glow on potential moves (optional AI hint)
   - Color change on garbage pile accumulation (red warning)
   - Screen flash on enemy attack received

4. **Sound design**:
   - Distinct SFX for: piece placement, piece rotation, match, chain, garbage arrival, warning, victory
   - Dynamic audio: Chain depth increases pitch/intensity
   - Looped background music (composed or royalty-free)

---

## Development Checklist & Milestones

### Week 1-2: Foundation
- [ ] Project scaffolding (Vite + TypeScript + Phaser setup)
- [ ] Game state and board logic
- [ ] Piece spawning and placement logic
- [ ] Basic rendering (canvas board, simple puyos)
- [ ] Input handling (keyboard)

### Week 3-4: Core Gameplay
- [ ] Chain detection and scoring
- [ ] Gravity and physics
- [ ] Garbage attack system
- [ ] Animations for piece movement and clearing
- [ ] Basic sound effects

### Week 5-6: Polish & AI
- [ ] AI opponent with difficulty levels
- [ ] Visual effects (particles, screen shake, polish)
- [ ] Menu system (main menu, pause, game over)
- [ ] UI animations and transitions
- [ ] Music and comprehensive sound design

### Week 7-8: Refinement
- [ ] Performance optimization (profiling and bottleneck fixes)
- [ ] Cross-browser testing and bug fixes
- [ ] Accessibility review and fixes
- [ ] Mobile responsiveness
- [ ] Unit and E2E tests

### Week 9-10: Features & Polish
- [ ] Difficulty selection
- [ ] Color blind modes
- [ ] Replay system (if time permits)
- [ ] Settings (volume, difficulty, game speed)
- [ ] Final visual polish pass

### Week 11-12: Launch Prep
- [ ] Performance regression tests
- [ ] Final bug pass
- [ ] Deployment setup (Vercel/Netlify)
- [ ] Documentation + README
- [ ] Marketing assets (screenshots, demo video)

---

## Custom Attack Types - Design Framework

### Proposed Attack Categories (Examples)
1. **Displacement Attacks**:
   - "Meteor Shower": Random Puyos converted to garbage blocks
   - "Gravity Flip": Briefly reverse gravity direction
   - "Shuffle": Randomize board layout (rare, balanced)

2. **Restriction Attacks**:
   - "Color Lock": Specific colors cannot be rotated for 5 seconds
   - "Freeze Field": Movement slowed by 50% for 10 seconds
   - "Blur": Opponent's board partially obscured (visual only)

3. **Cascade Attacks**:
   - "Chain Amplifier": Next chain worth 1.5× points
   - "Combo Counter Reset": Opponent's combo meter resets
   - "Double Drop": Next two pieces fall simultaneously

4. **Hazard Attacks**:
   - "Hot Zone": Central column deals +1 damage per puyo
   - "Spike Trap": Landing in designated area adds garbage pre-emptively
   - "Time Pressure": Piece drop speed increases for 15 seconds

### Implementation Plan
- **Attack Cooldown System**: Attacks usable every 30-60 seconds
- **Trigger Mechanics**: 
  - Earned via chain streak (chain-based progression)
  - Triggered manually by player (button press)
  - Time-based automatic triggers (every N seconds of play)
- **Balancing**: 
  - All attacks removable via counterplay (combos clear effects)
  - No single attack should guarantee victory
  - Team discussion: Which trigger model feels most fun?

---

## Questions for Team Discussion

Before development starts, align on:

1. **Attack System**: 
   - Should custom attacks be manual abilities or automatic chain rewards?
   - Maximum attacks a single player can have active simultaneously?
   - Do attacks deal damage directly or modify board state?

2. **Game Feel**:
   - Desired piece fall speed (classic Puyo is ~0.5 squares/second baseline)?
   - Should perfect play reward extrapolation (see incoming garbage)?
   - Lock delay system: Infinite rotation or limited?

3. **Difficulty Balancing**:
   - Should AI play human-like mistakes or optimal strategy?
   - How to balance beginner vs. expert players?

4. **Cross-Platform Prep**:
   - Should we pre-architect for Capacitor (Ionic) now?
   - Mobile-first or desktop-first design?
   - Touch controls: On-screen buttons or swipe gestures?

5. **Monetization Preparation**:
   - Should Phase 1 include reward systems (daily login, achievement system)?
   - Any telemetry/analytics foundation for future hub integration?

---

## Conclusion

This prompt defines a **professional-grade Puyo Puyo game** using modern TypeScript tooling, battle-tested open-source libraries, and architectural best practices. The project is scoped to deliver a feature-complete, locally-multiplayer game with AAA-quality polish while maintaining clean code that integrates seamlessly into a future game hub platform.

**Success metrics**: 60 FPS on standard hardware, <3 second load time, engaging AI opponents, feature-complete with custom attack system, accessibility standards met, and a codebase ready for backend integration.

**Most critical dependency**: Team alignment on attack system mechanics and game feel preferences before Week 1 begins.
