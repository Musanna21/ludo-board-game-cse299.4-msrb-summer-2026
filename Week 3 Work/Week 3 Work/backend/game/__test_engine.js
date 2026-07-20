// Quick manual smoke test - run with: node game/__test_engine.js
const LudoGame = require('./ludoEngine');

function assert(cond, msg) {
  if (!cond) throw new Error('FAILED: ' + msg);
  console.log('OK: ' + msg);
}

// Test 1: token can't leave base without a 6
const game = new LudoGame(['red', 'green'], { red: 'p1', green: 'p2' });
let forcedNoSix = null;
for (let i = 0; i < 50 && forcedNoSix === null; i += 1) {
  const original = Math.random;
  // no seeding available; just roll normally and check invariant instead
  break;
}
const roll = game.rollDice();
assert(roll.dice >= 1 && roll.dice <= 6, 'dice is within 1-6');
if (roll.dice !== 6) {
  assert(roll.legalMoves.length === 0 || game.tokens.red.some((t) => t.steps > 0), 'no legal base moves without a 6');
}

// Test 2: force a token onto the board and verify global square math
assert(LudoGame.globalSquare('red', 1) === 0, 'red enters at global square 0');
assert(LudoGame.globalSquare('green', 1) === 13, 'green enters at global square 13');
assert(LudoGame.globalSquare('red', 52) === null, 'step 52 is in home column, not on common track');

// Test 3: manually drive a capture
const g2 = new LudoGame(['red', 'green'], { red: 'p1', green: 'p2' });
g2.tokens.red[0].steps = 1; // red token on global square 0 -> wait, 0 is a safe square
g2.tokens.green[0].steps = 39; // green steps 39 -> global square (13+39-1)%52 = 51
// Instead directly test _resolveCaptures on a non-safe square
g2.tokens.red[0].steps = 5; // global square (0+5-1)%52 = 4 (not safe)
g2.tokens.green[0].steps = 44; // global square (13+44-1)%52 = 4 (should collide)
const beforeCapture = g2.tokens.green[0].steps;
const captures = g2._resolveCaptures('red', 4);
assert(captures.length === 1 && captures[0].color === 'green', 'capture detected on shared non-safe square');
assert(g2.tokens.green[0].steps === 0, 'captured token sent back to base');

// Test 4: win detection
const g3 = new LudoGame(['red', 'green'], { red: 'p1', green: 'p2' });
g3.tokens.red.forEach((t) => { t.steps = 57; });
const won = g3._checkWin('red');
assert(won === true, 'win detected when all tokens reach step 57');
assert(g3.status === 'finished', 'game status flips to finished on win');
assert(g3.winner === 'red', 'winner recorded correctly');

console.log('\nAll engine smoke tests passed.');
