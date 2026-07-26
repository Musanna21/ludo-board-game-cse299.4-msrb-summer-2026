// Ludo board layout constants
//
// Common track: 52 squares shared by all players, indexed 0-51.
// Each color enters the common track at its own offset, travels 51 steps
// around the board, then peels off into its own private 6-square home
// column (steps 52-57). Step 57 means the token has reached home/finished.
//
// steps === 0   -> token is still in the base/yard (not on the board)
// 1 <= steps <= 51 -> token is on the shared track
// 52 <= steps <= 57 -> token is in this color's private home column
// steps === 57  -> token has finished (reached home)

const COLORS = ['red', 'green', 'yellow', 'blue'];

const START_OFFSET = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Squares where tokens cannot be captured (entry squares + star squares).
const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

const TOKENS_PER_PLAYER = 4;
const HOME_ENTRY_STEPS = 51; // steps needed to complete the common track
const FINAL_STEP = 57; // steps needed total to reach home
const MAX_DICE = 6;

module.exports = {
  COLORS,
  START_OFFSET,
  SAFE_SQUARES,
  TOKENS_PER_PLAYER,
  HOME_ENTRY_STEPS,
  FINAL_STEP,
  MAX_DICE,
};
