# Flappy Kiro Property-Based Tests

This directory contains comprehensive property-based tests for all 13 correctness properties defined in the Flappy Kiro design document.

## Overview

Property-based testing validates that certain properties hold true across a wide range of inputs, rather than testing specific examples. Each property is tested with 100+ iterations using randomly generated inputs.

## Test Framework

- **Testing Framework**: Vitest
- **Property-Based Testing Library**: @fast-check/vitest (fast-check)
- **Default Iterations**: 100 runs per property (fast-check default)

## Running Tests

```bash
# Run all property-based tests
npm test -- tests/properties.test.js

# Run with verbose output
npm test -- tests/properties.test.js --reporter=verbose

# Run in watch mode
npm run test:watch -- tests/properties.test.js
```

## Properties Tested

### Property 1: Gravity Increases Velocity Monotonically
**Validates**: Requirements 3.1, 3.2

For any frame during gameplay, the ghost's vertical velocity should increase by the gravity constant each frame.

**Tests**:
- Gravity increases velocity by gravity constant each frame (100+ iterations)
- Velocity increases monotonically over consecutive frames (100+ iterations)

---

### Property 2: Jump Velocity is Consistent
**Validates**: Requirements 4.4, 4.5

For any sequence of jump inputs, each jump should apply the same upward velocity to the ghost.

**Tests**:
- Jump applies consistent velocity regardless of number of jumps (100+ iterations)
- Jump velocity is consistent regardless of current velocity (100+ iterations)

---

### Property 3: Pipes Move Leftward
**Validates**: Requirements 5.5

For any frame during gameplay, all active pipes should move leftward by the pipe speed constant.

**Tests**:
- Pipes move leftward by pipe speed each frame (100+ iterations)
- All pipes move at the same speed (100+ iterations)

---

### Property 4: Pipe Spacing is Consistent
**Validates**: Requirements 6.3

For any two consecutive pipes created, the horizontal distance between them should be equal to the pipe spacing constant.

**Tests**:
- Consecutive pipes have consistent spacing (100+ iterations)

---

### Property 5: Gap Position is Valid
**Validates**: Requirements 5.4

For any pipe created, the gap position should be within valid bounds (not at extreme top or bottom of screen).

**Tests**:
- Gap position is always within valid bounds (100+ iterations)
- Gap positions vary across multiple pipes (100+ iterations)

---

### Property 6: Collision Detection Accuracy
**Validates**: Requirements 7.1, 7.2, 7.3

For any ghost position and pipe configuration, a collision should be detected if and only if the ghost's bounding box overlaps with a pipe section or exceeds screen boundaries.

**Tests**:
- Correctly detects collision state for any ghost and pipe position (100+ iterations)
- Detects boundary collisions correctly (100+ iterations)

---

### Property 7: Score Increments Once Per Pipe
**Validates**: Requirements 8.1, 8.4

For any pipe, the score should increment at most once when the ghost passes through the gap.

**Tests**:
- Score increments exactly once per pipe regardless of update frequency (100+ iterations)
- Score increments once per pipe for multiple pipes (100+ iterations)

---

### Property 8: High Score Update Logic
**Validates**: Requirements 12.1

For any score that exceeds the current high score, the high score should be updated to that score.

**Tests**:
- High score updates when score exceeds current high score (100+ iterations)
- High score does not update when score is lower or equal (100+ iterations)
- High score persists to localStorage (100+ iterations)

---

### Property 9: Pipe Width Consistency
**Validates**: Requirements 6.1

For any pipe created, the pipe width should equal the pipe width constant.

**Tests**:
- All pipes have consistent width (100+ iterations)

---

### Property 10: Pipe Gap Size Consistency
**Validates**: Requirements 6.2

For any pipe created, the gap size should equal the gap size constant.

**Tests**:
- All pipes have consistent gap size (100+ iterations)

---

### Property 11: Endless Pipe Generation
**Validates**: Requirements 5.1, 20.1

For any duration of gameplay without collision, new pipes should be created at regular intervals.

**Tests**:
- Pipes are created at regular intervals (100+ iterations)
- Pipes continue generating indefinitely (100+ iterations)

---

### Property 12: Difficulty Consistency
**Validates**: Requirements 20.2

For any duration of gameplay, the pipe speed and spacing should remain constant (difficulty does not increase).

**Tests**:
- Pipe speed remains constant over time (100+ iterations)
- Pipe spacing remains constant over time (100+ iterations)
- Gap size remains constant over time (100+ iterations)

---

### Property 13: Game State Reset
**Validates**: Requirements 18.1, 18.2, 18.3, 18.4, 18.5

For any game state, calling reset should clear all game objects and return the game to the Menu state.

**Tests**:
- Reset clears all pipes (100+ iterations)
- Reset resets score to 0 (100+ iterations)
- Reset resets ghost position (100+ iterations)
- Reset returns to Menu state (100+ iterations)
- Reset does NOT clear high score (100+ iterations)

---

## Test Structure

Each property test follows this structure:

```javascript
test.prop([fc.integer({ min: 1, max: 200 })])(
  'property description (100+ iterations)',
  (generatedInput) => {
    // Arrange: Set up test conditions
    const system = new System();
    
    // Act: Perform operations
    system.doSomething(generatedInput);
    
    // Assert: Verify property holds
    expect(result).toBe(expectedValue);
  }
);
```

## Key Features

1. **Randomized Inputs**: Each test uses randomly generated inputs within specified ranges
2. **Shrinking**: When a test fails, fast-check automatically finds the minimal failing case
3. **Reproducibility**: Failed tests include a seed value for reproduction
4. **Comprehensive Coverage**: Tests cover edge cases that manual testing might miss

## Test Results

All 28 property-based tests pass successfully:
- ✓ 28 tests passed
- ✓ 100+ iterations per property
- ✓ All 13 correctness properties validated

## References

- [Design Document](../.kiro/specs/flappy-kiro/design.md) - Section 8: Correctness Properties
- [Requirements Document](../.kiro/specs/flappy-kiro/requirements.md)
- [fast-check Documentation](https://fast-check.dev/)
- [Vitest Documentation](https://vitest.dev/)
