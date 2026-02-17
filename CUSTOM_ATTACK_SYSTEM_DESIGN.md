# Puyo Puyo Game - Custom Attack System Design Framework

## Overview

This document provides detailed design frameworks, implementation strategies, and balancing considerations for the custom attack system in Puyo Puyo. It includes multiple attack categories, progression mechanics, and discussion points for your team.

---

## Attack System Architecture

### Core Concepts

**Attack Trigger Models** (Choose One or Hybrid):

1. **Buildup Model** (Recommended)
   - Attacks charged via chain depth (e.g., "3-chain unlocks first attack")
   - Attack meter fills: 0-100% (with 3 tiers unlocked at 50%, 75%, 100%)
   - Player activates when ready (button press)
   - Meter resets after use
   - **Pros**: Skill-based, player control, strategic timing
   - **Cons**: Slightly more UI complexity

2. **Cooldown Model**
   - Fixed attack available every N seconds (e.g., every 45 seconds)
   - Automatic trigger or player-initiated
   - Multiple attacks cycle (rotate through 3-4 attack types)
   - **Pros**: Simpler UI, constant threat
   - **Cons**: Less reward-based, can feel arbitrary

3. **Resource Model**
   - Limited "attack tokens" per game (e.g., 3 attacks total)
   - Player must choose when to spend tokens wisely
   - Higher cost for stronger attacks
   - **Pros**: High strategy, climactic moments
   - **Cons**: Can lead to hoarding without use

4. **Hybrid Model** (Interesting)
   - Buildup meter that auto-activates at 100% (forced)
   - OR player manually triggers before 100%
   - Creates strategic tension: "Do I use now or save for bigger chain?"

**Recommended**: **Buildup Model** - rewards active play and chain building

---

### Attack Lifecycle

```
State Machine for Attack System:

IDLE
  ↓
USER_INPUT → Charge (accumulate meter via chains)
  ↓
THRESHOLD_MET (50%, 75%, 100% tiers unlocked)
  ↓
USER_ACTIVATES → EXECUTE (1-2 frame animation)
  ↓
EFFECT_APPLIED (board modified, opponent notification)
  ↓
OPPONENT_RESPONSE (counterattack possible here)
  ↓
RESET → IDLE
```

---

## Attack Categories & Design Proposals

### Category 1: Displacement Attacks
*Physically alter opponent's board state*

#### 1A. Meteor Shower ⭐
**Concept**: Random puyos on opponent's board convert to garbage blocks (inert, no chain value)

**Mechanics**:
- Converts 20-30% of colored puyos to garbage (random positions)
- Takes effect immediately
- Garbage blocks are cleared only with colored puyos (1 color = 1 garbage piece)
- Visual: Glowing meteors descend from top, impact with particles

**Balance**:
- Early game: Minimal threat (easy to clear)
- Late game: Threatens established chains
- Counterplay: Opponent can use garbage blocks as "spacers" to block incoming garbage from player

**Implementation**:
```typescript
function meteorShower(targetBoard: Puyo[][]): Puyo[][] {
  const newBoard = JSON.parse(JSON.stringify(targetBoard));
  const coloredPuyos = targetBoard
    .map((row, i) => row.map((p, j) => p !== EMPTY && p !== GARBAGE ? [i, j] : null))
    .flat()
    .filter(Boolean);
  
  const targetCount = Math.floor(coloredPuyos.length * 0.25);
  for (let i = 0; i < targetCount; i++) {
    const [row, col] = coloredPuyos[Math.floor(Math.random() * coloredPuyos.length)];
    newBoard[row][col] = GARBAGE;
  }
  return newBoard;
}
```

---

#### 1B. Gravity Flip
**Concept**: Gravity reverses for opponent for 8 seconds (pieces fall UP)

**Mechanics**:
- Pieces enter at bottom, fall upward
- Player controls invert (down arrow = up movement)
- After 8 seconds, gravity restores
- Visual: Screen flips, pieces glow upward

**Balance**:
- High skill ceiling: Requires player adaptation
- Counterplay: Hold pieces in neutral column, wait for reversal
- Risk: Can help crafty opponent place pieces perfectly

**Difficulty to Implement**: Medium

**Code sketch**:
```typescript
function gravityFlip(duration: number) {
  gameState.gravityDirection = 'UP';
  gameState.inputAxisInverted = true;
  setTimeout(() => {
    gameState.gravityDirection = 'DOWN';
    gameState.inputAxisInverted = false;
  }, duration * 1000);
}
```

---

#### 1C. Shuffle
**Concept**: 1-3 random rows shuffle horizontally (columns randomize)

**Mechanics**:
- Affects rows 6-11 (lower third)
- Each row's puyos randomize column positions
- Breaks established line setups
- Risk-heavy attack: Can accidentally help opponent

**Balance**:
- High variance outcome
- Unique RNG element (interesting for casual play)
- Competitive players prefer deterministic attacks

**Recommendation**: Include in casual mode only, consider banning in ranked

---

### Category 2: Restriction Attacks
*Limit opponent's actions/information*

#### 2A. Color Lock ⭐ RECOMMENDED
**Concept**: Opponent cannot rotate pieces of specific color for 10 seconds

**Mechanics**:
- One color (random or strategic) becomes "locked"
- Pieces of that color arrive but cannot rotate
- Can still move left/right and soft drop
- Creates puzzle-solving challenge
- Visual: Locked color shows lock icon, darkened

**Balance**:
- Fair and reversible
- Requires skill to play around
- Counterplay: Match the locked color to clear it faster

**Implementation**:
```typescript
interface AttackColorLock {
  lockedColor: PuyoColor;
  duration: number;
  startTime: number;
}

function canRotate(piece: Piece, attack: AttackColorLock): boolean {
  if (attack.isActive) {
    return piece.color !== attack.lockedColor;
  }
  return true;
}
```

**Progression Ideas**:
- Tier 1 (50% meter): Lock for 5 seconds
- Tier 2 (75% meter): Lock 2 colors for 7 seconds
- Tier 3 (100% meter): Lock all colors except one for 10 seconds (extreme)

---

#### 2B. Freeze Field
**Concept**: Opponent's pieces fall 50% slower for 12 seconds

**Mechanics**:
- Piece descent rate: 0.5×normal
- Movement speed unaffected
- Creates time pressure (must place quickly despite slow fall)
- Visual: Icy particles on falling pieces, blue tint

**Balance**:
- More forgiving than Color Lock
- Viable counterplay: Use slower fall as advantage (more time to construct)
- Less suitable for high-level competitive

**Skill Expression**: Low

---

#### 2C. Board Obscuration (Vision Attack)
**Concept**: Opponent's board 60% opacity for 6 seconds (visual only)

**Mechanics**:
- Board still playable
- Opponent can guess positions (fuzzy visibility)
- Audio cues provided (SFX on piece placements)
- Creates tension, not punishment
- Visual: Heavy pixelation or blur filter

**Balance**:
- Psychological more than mechanical
- Accessibility concern: Must provide audio + haptic feedback
- Recommended: Opt-in only, not in competitive

---

### Category 3: Cascade Attacks
*Modify multiplier/score systems*

#### 3A. Chain Amplifier ⭐
**Concept**: Opponent's next chain worth 1.5-2× points for 20 seconds

**Mechanics**:
- Doesn't prevent opponent scoring, just boosts it
- Cannot stack with themselves (multiple uses don't multiply)
- Resets if timer expires unused
- Visual: Golden aura around board when active

**Why this balances**: 
- Seems like enemy helping themselves
- Actually strategic: Forces player to commit to aggressive play
- Meta: Player must decide: attack opponent or boost own score via this

**Variant: Chain Drain**
- Opponent's chains worth 0.5× temporarily
- More punishing, consider for hard difficulty

---

#### 3B. Combo Counter Cascade
**Concept**: Opponent's next 2 matches cascade bonus resets (back to base damage)

**Mechanics**:
- Removes position multiplier bonus (2× for 3-chain, 4× for 4-chain, etc.)
- Creates frustration: "I had a great setup but lost multiplier"
- Visual: Red "RESET" notification

**Competitiveness**: High (skill-based counter)

**Implementation**:
```typescript
let comboResetCharges = 0;
function calculateChainDamage(chainDepth: number) {
  if (comboResetCharges > 0) {
    comboResetCharges--;
    return (chainDepth * 100); // Base damage only, no multiplier
  }
  return (chainDepth * 100) * (2 + chainDepth * 1.5); // Normal multiplier
}
```

---

### Category 4: Hazard Attacks
*Modify board layout with persistent threats*

#### 4A. Hot Zone ⭐
**Concept**: Central column (column 3) becomes "hot" - deals +1 extra garbage per piece for 15 seconds

**Mechanics**:
- Column 3 highlights red
- Any puyo placed/matched in that column adds bonus garbage to player's board
- Forces opponent to adapt strategy
- Can be exploited by clever players (intentionally avoid column 3)
- Visual: Column 3 glows red, danger indicator

**Balance**:
- Moderate threat
- Creates spatial strategy puzzle
- Reversible and learnable

---

#### 4B. Spike Trap
**Concept**: Designate a 2×2 zone as "trap" - landing there pre-adds garbage to attacking player's board

**Mechanics**:
- Player chooses trap location (strategic)
- When opponent places in trap zone, opponent gets garbage
- Trap persists until triggered or 20 seconds expire
- Visual: Pulsing zone on opponent's board with danger indicator

**Twist**: Player sees own board with trap zone visible, opponent doesn't know exact location initially

**Skill Expression**: Very high (trap placement strategy)

---

#### 4C. Time Pressure (Cascade Accelerant)
**Concept**: Opponent's piece drop speed increases 1.5× for 15 seconds

**Mechanics**:
- Pieces fall faster (higher gravity constant)
- Soft drop still works (double-speed available)
- Hard drop even more useful for survival
- Creates time pressure without restrictions
- Visual: Particles trail pieces, urgent SFX

**Counterplay**: Conservative positioning, avoid overambitious placements

---

### Category 5: Hybrid/Complex Attacks

#### 5A. Chaos Eruption
**Concept**: Random combination of effects (50% meta) - player discovers what happens

**Effects (Random)**:
1. Column shuffle (3 random columns reorder)
2. Piece speed spike for 5 seconds
3. Temporary board size reduction (play area → 5 columns)
4. Random color puyos appear at top (bonus!)
5. Opponent's score temporarily set to 0 (visual only, resets)

**Pros**:
- Exciting, unpredictable
- Meme potential ("RNG god")
- Interesting for streaming/casual

**Cons**:
- Unfair feeling for competitive
- Not tournament-suitable

**Recommendation**: Fun attack for casual mode / difficulties, ban in ranked

---

#### 5B. Tidal Wave
**Concept**: All puyos on opponent's board "float up" one row, then crash down with double gravity

**Mechanics**:
1. All puyos rise 1 row simultaneously (animation: 0.5 seconds)
2. Any puyos at top vanish (row 11 → garbage)
3. Remaining puyos crash down with 2× gravity for 3 seconds
4. High likelihood of creating accidental chains (good!)
5. Visual: Wave animation, dramatic particle effects

**Balance**:
- Moderate disruption
- Can help or hurt (chains = good)
- Visually spectacular (good for streaming)

**Implementation Complexity**: Medium-High

---

## Attack Progression Tiers

### Proposed Progression System

**Player builds attack meter via chain depth:**

```
Meter Charging:
- 2-chain: +20% meter
- 3-chain: +35% meter
- 4-chain: +50% meter
- 5+ chain: +75% meter

Unlocked Attacks (Tier gates):
├─ 50% meter: Attack tier 1 (weak)
│  └─ Options: Color Lock (3 sec), Freeze Field (5 sec), or Meteor (10%)
│
├─ 75% meter: Attack tier 2 (medium)
│  └─ Options: Hot Zone, Time Pressure, or Shuffle
│
└─ 100% meter: Attack tier 3 (strong)
   └─ Options: Tidal Wave, Gravity Flip, or Chain Amplifier
```

**Design Choice Point for Team**:
Should players:
1. **Choose attack type ONCE per game** (locked to one attack progression)?
2. **Choose attack dynamically** (select from available tier on each activation)?
3. **Randomized attacks** (RNG determines which attack is available)?

Recommendation: **Dynamic selection** - maximum player agency

---

## Attack Balancing Framework

### Design Principles

1. **Reversibility**: All attacks should be reversible or time-limited
   - No permanent board damage
   - All effects expire (5-20 seconds)
   - Counterplay always exists

2. **Skill Expression**: Better players should be able to overcome attacks
   - Color Lock: Skilled players adjust strategy
   - Time Pressure: Expert input handling may minimize impact
   - Shuffle: Random, but skill still matters in recovery

3. **Counter-Symmetry**: Each attack should have a playstyle counter
   ```
   Color Lock       → Solution: match the locked color ASAP
   Meteor Shower    → Solution: use garbage as spacers
   Gravity Flip     → Solution: master upside-down controls
   Time Pressure    → Solution: preemptive placement skill
   ```

4. **Risk/Reward Balance**:
   ```
   Low Risk, Low Reward: Color Lock (straightforward, limited impact)
   High Risk, High Reward: Chaos Eruption (unpredictable, fun)
   Medium Risk/Reward: Everything else
   ```

5. **Visual Feedback**: Every attack must have clear UI/audio communication
   - Opponent MUST see attack coming (1-2 second warning)
   - Sound effect mandatory
   - On-screen text notification ("Color Lock: RED")

---

## Competition Balancing

### For Casual Play
- All attacks allowed
- Chaos Eruption enabled (RNG fun)
- Shorter cooldowns (attacks more frequent)
- Lower skill requirement to counterplay

### For Ranked/Competitive
- Deterministic attacks only (no Chaos Eruption, no Shuffle)
- Longer cooldowns (10-15 seconds between meter resets)
- Balance pass: nerf high-variance attacks
- All attacks visible to both players (no hidden traps)

### For AI Difficulty

**Easy AI**:
- Uses attacks rarely
- Predictable attack timing
- Attacks don't counter player effectively

**Normal AI**:
- Uses attacks strategically (when player threatens to win)
- Good counterplay reading
- Well-timed but telegraphed attacks

**Hard AI**:
- Optimal attack timing
- Reads player strategy and adapts
- Chains + attacks together (combo threats)

**Extreme AI**:
- Perfect information (theoretically)
- Attacks whenever meter filled (no wasted potential)
- Optimal counterattack patterns
- May feel unfair but teaches player to defend

---

## Implementation Considerations

### Code Architecture

```typescript
// Attacks as first-class entities
interface Attack {
  id: string;
  name: string;
  tier: 'basic' | 'intermediate' | 'advanced';
  duration: number;
  execute: (boardState: Board) => Board; // Apply effect
  canActivate: (playerState: PlayerState) => boolean;
  icon: string;
  description: string;
}

// Attack system state
interface AttackSystem {
  currentAttacks: Map<PlayerId, Attack[]>; // Active attacks
  meterCharge: Map<PlayerId, number>; // 0-100%
  attackHistory: AttackEvent[]; // For replay/balance analysis
  
  damageAttack: (from: PlayerId, to: PlayerId, attack: Attack) => void;
  updateMeter: (playerId: PlayerId, chainDepth: number) => void;
}

// Usage
if (chainDetected === 4) {
  attackSystem.updateMeter(currentPlayer.id, 4); // Depth 4 = big charge
  if (attackSystem.meterCharge[currentPlayer.id] >= 0.75) {
    // Unlock tier 2+ attacks
  }
}
```

### Network Considerations (Phase 2)

Attacks must be deterministic and synchronized:

```
Frame-perfect synchronization:
1. Player A: inputs (frame 240)
2. Server: validates input (frame 241)
3. Server: broadcasts "attack executed" (frame 241)
4. All clients: simulate attack effect (frame 242, synchronized)

Recommendation: Use frame-based sync (not wall-clock time)
Each client ticks at 60 Hz: frame N always == same game state
```

---

## Testing & Iteration Plan

### Playtesting Phases

**Phase 1: Internal (Week 6-7)**
- Devs test attack balance
- Measure: Which attacks feel unfair/overpowered?
- Adjust: HP/duration/effect magnitude
- Target: No attack should gurantee a win, all should seem beatable

**Phase 2: Closed Beta (Week 8)**
- 10-20 external testers
- Track: Which attacks used most? Least?
- Collect: Player feedback on "feels broken" attacks
- Adjust: Remove/buff unused attacks, nerf perceived overpoweredness

**Phase 3: Public Beta (Post-MVP)**
- Full player base
- Data: Win rates per attack, usage frequency
- Balance pass v2: Make sure meta doesn't fixate on 1-2 attacks
- Adjust: Monthly patches with seasonal meta shifts possible

### Metrics to Track

```typescript
interface AttackMetrics {
  activationRate: number; // % of games where used
  winRateWhenUsed: number; // Win % when this attack used
  playerBacklash: number; // Community feedback sentiment (1-5)
  counterplaySuccessRate: number; // % opponents overcome it
  avgChainDepth: number; // Average chain size when attack triggers
}
```

---

## Vanilla Game Balancing (Without Custom Attacks)

If you want Phase 1 focus on **classic Puyo only** (attacks in Phase 2):

**Recommend still designing attack system architecture** (even if disabled):
- Build `AttackSystem` class
- Write unit tests
- Enable attacks via config flag: `enableCustomAttacks: false`
- This prevents rewriting core after Phase 1

---

## Discussion Questions for Your Team

Before locking in attack design, discuss:

1. **Progression Model**:
   - Buildup meter (recommended) vs. Cooldown vs. Resource?
   - Should players choose their attack type once or dynamically?

2. **Attack Pool**:
   - How many total attacks? (Recommend 8-12 for variety)
   - Which attacks MUST be included (vanilla feel)?
   - Which attacks risk feeling unfair?

3. **Competitive vs. Casual**:
   - Same attacks for all difficulties or different pools?
   - Ranked mode considerations (disable RNG attacks)?

4. **Skill Expression Priority**:
   - Value counterplay (attacks beatable by skill)?
   - Or value simplicity (attacks just happen)?

5. **Visual Identity**:
   - Attack theme: Magical? Sci-fi? Cute? Chaotic?
   - Does your art style support proposed attacks?

6. **Phase 1 MVP Scope**:
   - Include custom attacks now or Phase 2?
   - If now: 3-4 attacks sufficient? Or 8-10?

---

## Conclusion

A well-designed attack system:
- ✅ Rewards skilled chain building
- ✅ Creates decisive moments (high stakes)
- ✅ Remains fair and learnable
- ✅ Pushes game toward emergent strategy
- ✅ Stays fun for casual and competitive players

The framework provided allows for **13+ attack types**, multiple progression systems, and scalable balancing. Your team should pick 1-2 hours to discuss the above questions and lock in attack mechanics before Week 1 development begins.

**Recommended Starting Set (MVP)**:
1. Color Lock (skill-based, fair)
2. Meteor Shower (unique puzzle element)
3. Hot Zone (spatial strategy)
4. Time Pressure (challenging but learnable)
5. Chain Amplifier (psychological, higher-level play)

These 5 attacks provide variety, require skill to overcome, and are individually distinct (different playstyle counters). Easy to add 3-4 more in Phase 1.5 based on playtesting feedback.
