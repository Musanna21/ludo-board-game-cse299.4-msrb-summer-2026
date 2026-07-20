// All board coordinates are computed parametrically (never hand-typed as a long list)
// so there's no room for off-by-one mistakes in a 52-square ring.
//
// The board is a 600x600 square. A square "ring" track sits between the four
// corner yards and the center hub. Each side of the ring holds 13 cells,
// 4 sides x 13 = 52, matching the engine's common track exactly. Each color's
// start offset (0, 13, 26, 39) lands precisely at the first cell of its own
// side, by construction - not by coincidence.

export const BOARD_SIZE = 600;
const RING_MIN = 120;
const RING_MAX = 480;
const RING_SPAN = RING_MAX - RING_MIN; // 360
const CELLS_PER_SIDE = 13;
const STEP = RING_SPAN / CELLS_PER_SIDE;

export const COLOR_ORDER = ['red', 'green', 'yellow', 'blue'];

// side 0 = top (red), 1 = right (green), 2 = bottom (yellow), 3 = left (blue)
function ringPoint(globalIndex) {
  const side = Math.floor(globalIndex / CELLS_PER_SIDE);
  const t = globalIndex % CELLS_PER_SIDE;
  switch (side) {
    case 0: // top, left -> right
      return { x: RING_MIN + STEP * t, y: RING_MIN };
    case 1: // right, top -> bottom
      return { x: RING_MAX, y: RING_MIN + STEP * t };
    case 2: // bottom, right -> left
      return { x: RING_MAX - STEP * t, y: RING_MAX };
    default: // left, bottom -> top
      return { x: RING_MIN, y: RING_MAX - STEP * t };
  }
}

export const RING_POINTS = Array.from({ length: 52 }, (_, i) => ringPoint(i));

export const SAFE_RING_INDEXES = [0, 8, 13, 21, 26, 34, 39, 47];

// Each color's private home column: 5 cells in a straight line from the
// middle of that color's own side inward to the center.
const CENTER = { x: 300, y: 300 };
function homeColumn(color) {
  const points = [];
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 6; // 1/6 .. 5/6 of the way from the ring edge to center
    let x, y;
    if (color === 'red') {
      x = CENTER.x;
      y = RING_MIN + (CENTER.y - RING_MIN) * t;
    } else if (color === 'yellow') {
      x = CENTER.x;
      y = RING_MAX - (RING_MAX - CENTER.y) * t;
    } else if (color === 'blue') {
      x = RING_MIN + (CENTER.x - RING_MIN) * t;
      y = CENTER.y;
    } else {
      // green
      x = RING_MAX - (RING_MAX - CENTER.x) * t;
      y = CENTER.y;
    }
    points.push({ x, y });
  }
  return points;
}

export const HOME_COLUMNS = Object.fromEntries(COLOR_ORDER.map((c) => [c, homeColumn(c)]));

// Yard (base) token slot positions - a 2x2 arrangement inside each color's corner.
const YARD_CENTER = {
  red: { x: 60, y: 60 },
  green: { x: 540, y: 60 },
  yellow: { x: 540, y: 540 },
  blue: { x: 60, y: 540 },
};
const YARD_SLOT_OFFSETS = [
  { dx: -25, dy: -25 },
  { dx: 25, dy: -25 },
  { dx: -25, dy: 25 },
  { dx: 25, dy: 25 },
];
export const YARD_SLOTS = Object.fromEntries(
  COLOR_ORDER.map((color) => [
    color,
    YARD_SLOT_OFFSETS.map((o) => ({ x: YARD_CENTER[color].x + o.dx, y: YARD_CENTER[color].y + o.dy })),
  ])
);

export const YARD_BOUNDS = {
  red: { x: 0, y: 0 },
  green: { x: RING_MAX, y: 0 },
  yellow: { x: RING_MAX, y: RING_MAX },
  blue: { x: 0, y: RING_MAX },
};
export const YARD_SIZE = RING_MIN; // 120

/** Given a color and its steps (0-57), return the {x,y} pixel position for a token. */
export function tokenPosition(color, steps) {
  if (steps === 0) return null; // caller falls back to a yard slot
  if (steps >= 1 && steps <= 51) {
    const globalIndex = (START_OFFSET[color] + steps - 1) % 52;
    return RING_POINTS[globalIndex];
  }
  if (steps >= 52 && steps <= 56) {
    return HOME_COLUMNS[color][steps - 52];
  }
  return CENTER; // steps === 57, finished
}

export const START_OFFSET = { red: 0, green: 13, yellow: 26, blue: 39 };
