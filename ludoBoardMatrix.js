/**
 * ludoBoardMatrix.js
 * ---------------------------------------------------------
 * Member 4 — Game Map Matrix
 *
 * Defines the coordinate system for a standard 15x15 Ludo
 * board: the 52-tile shared track, the 8 safe (star) spots,
 * each color's 6-tile home-run lane, the center home triangle,
 * and each color's 4 yard (base) parking spots.
 *
 * Coordinates are [row, col] on a 0-indexed 15x15 grid,
 * matching the physical board layout (0,0 = top-left).
 * ---------------------------------------------------------
 */

export const BOARD_SIZE = 15;

/**
 * The 52 shared track tiles, in clockwise order starting from
 * Red's entry square. Every token (regardless of color) walks
 * along this same array — only the starting index differs.
 */
export const COMMON_TRACK = [
  // Red arm -> up the top-left column
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  // Top edge -> Green arm
  [0, 7],
  [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Right edge -> across to Yellow arm
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Bottom edge -> Blue arm
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Left edge -> back to Red arm
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

// Sanity check: COMMON_TRACK.length === 52

/**
 * Index into COMMON_TRACK where each color's tokens enter
 * the shared track after leaving their yard.
 */
export const START_INDEX = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/**
 * Safe squares (marked with a star on physical boards).
 * A token sitting here cannot be captured.
 * = each color's start tile + the tile 8 steps ahead of it.
 */
export const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * Colored home-run lanes (6 tiles each) leading from the
 * shared track into the center triangle. Order = direction
 * of travel toward the center.
 */
export const HOME_LANES = {
  red:    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green:  [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue:   [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

/** Final center square all tokens are trying to reach. */
export const HOME_CENTER = [7, 7];

/**
 * Yard (base) parking coordinates — where each color's 4
 * tokens sit before entering play. Each color's yard occupies
 * a 6x6 quadrant; these 4 points are the visual "dots" inside it.
 */
export const YARD_POSITIONS = {
  red:    [[1, 1], [1, 4], [4, 1], [4, 4]],
  green:  [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue:   [[10, 1], [10, 4], [13, 1], [13, 4]],
};

/**
 * Helper: given a color and a "steps taken" count (0-57,
 * where 0-50 = shared track, 51-56 = home lane, 57 = home center),
 * return the board coordinate for that token.
 *
 * This is the function Member 2/3 (backend + realtime) will call
 * whenever a token moves, so keep the signature stable.
 *
 * @param {"red"|"green"|"yellow"|"blue"} color
 * @param {number} steps
 * @returns {[number, number]} [row, col]
 */
export function getCoordForStep(color, steps) {
  if (steps < 0) {
    throw new Error("steps cannot be negative");
  }

  // 0-50: on the shared 51-tile stretch specific to this color
  // (51 tiles walked before turning into the home lane)
  if (steps <= 50) {
    const trackIndex = (START_INDEX[color] + steps) % COMMON_TRACK.length;
    return COMMON_TRACK[trackIndex];
  }

  // 51-56: inside the 6-tile home lane
  if (steps <= 56) {
    return HOME_LANES[color][steps - 51];
  }

  // 57: reached center / finished
  return HOME_CENTER;
}

/**
 * Quick lookup: is a given track index a safe square?
 * @param {number} trackIndex
 * @returns {boolean}
 */
export function isSafeSpot(trackIndex) {
  return SAFE_SPOTS.includes(trackIndex);
}
