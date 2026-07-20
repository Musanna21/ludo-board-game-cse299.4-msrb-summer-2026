const {
  COLORS,
  START_OFFSET,
  SAFE_SQUARES,
  TOKENS_PER_PLAYER,
  HOME_ENTRY_STEPS,
  FINAL_STEP,
  MAX_DICE,
} = require('./ludoConstants');

/**
 * LudoGame holds the full authoritative state for one match and exposes
 * the only operations that are allowed to mutate it: rollDice() and
 * moveToken(). Every rule check (whose turn it is, whether a move is
 * legal, captures, extra turns, win detection) lives here so the client
 * never has to be trusted.
 */
class LudoGame {
  /**
   * @param {string[]} playerColors - colors in turn order, e.g. ['red','yellow']
   * @param {Object<string,string>} colorToPlayerId - maps color -> playerId
   */
  constructor(playerColors, colorToPlayerId) {
    if (!playerColors || playerColors.length < 2 || playerColors.length > 4) {
      throw new Error('Ludo requires 2 to 4 players');
    }
    playerColors.forEach((c) => {
      if (!COLORS.includes(c)) throw new Error(`Invalid color: ${c}`);
    });

    this.playerColors = playerColors;
    this.colorToPlayerId = colorToPlayerId;
    this.currentPlayerIndex = 0;
    this.lastDice = null;
    this.consecutiveSixes = 0;
    this.status = 'in-progress'; // 'in-progress' | 'finished'
    this.winner = null;
    this.finishOrder = [];
    this.log = [];

    // tokens[color] = array of 4 token states: { steps: 0-57 }
    this.tokens = {};
    playerColors.forEach((color) => {
      this.tokens[color] = Array.from({ length: TOKENS_PER_PLAYER }, () => ({
        steps: 0,
      }));
    });
  }

  get currentColor() {
    return this.playerColors[this.currentPlayerIndex];
  }

  /** Converts a token's steps into a global board square (0-51), or null if not on common track. */
  static globalSquare(color, steps) {
    if (steps < 1 || steps > HOME_ENTRY_STEPS) return null;
    return (START_OFFSET[color] + steps - 1) % 52;
  }

  /** Returns the list of token indices (0-3) the current player may legally move with this dice value. */
  legalMoves(dice) {
    const color = this.currentColor;
    const tokens = this.tokens[color];
    const moves = [];
    tokens.forEach((token, idx) => {
      if (token.steps === FINAL_STEP) return; // already home
      if (token.steps === 0) {
        if (dice === MAX_DICE) moves.push(idx);
        return;
      }
      const newSteps = token.steps + dice;
      if (newSteps <= FINAL_STEP) moves.push(idx);
    });
    return moves;
  }

  /**
   * Rolls the dice for the current player. Returns { dice, legalMoves, turnPassed }.
   * If there are no legal moves, or three consecutive sixes were rolled,
   * the turn is passed immediately and turnPassed is true.
   */
  rollDice() {
    if (this.status !== 'in-progress') {
      throw new Error('Game is already finished');
    }
    const dice = 1 + Math.floor(Math.random() * MAX_DICE);
    this.lastDice = dice;

    if (dice === MAX_DICE) {
      this.consecutiveSixes += 1;
    } else {
      this.consecutiveSixes = 0;
    }

    // Three sixes in a row forfeits the turn entirely.
    if (this.consecutiveSixes === 3) {
      this.consecutiveSixes = 0;
      this._log(`${this.currentColor} rolled three sixes in a row - turn forfeited`);
      this._advanceTurn();
      return { dice, legalMoves: [], turnPassed: true };
    }

    const moves = this.legalMoves(dice);
    if (moves.length === 0) {
      this._log(`${this.currentColor} rolled ${dice} with no legal moves - turn passed`);
      this._advanceTurn();
      return { dice, legalMoves: [], turnPassed: true };
    }

    return { dice, legalMoves: moves, turnPassed: false };
  }

  /**
   * Moves the given token index for the current player using the last dice roll.
   * Returns a result object describing what happened (capture, finished, extraTurn, winner).
   */
  moveToken(tokenIndex) {
    if (this.status !== 'in-progress') {
      throw new Error('Game is already finished');
    }
    if (this.lastDice === null) {
      throw new Error('Must roll the dice before moving');
    }
    const color = this.currentColor;
    const dice = this.lastDice;
    const legal = this.legalMoves(dice);
    if (!legal.includes(tokenIndex)) {
      throw new Error('Illegal move for the current dice roll');
    }

    const token = this.tokens[color][tokenIndex];
    const wasInBase = token.steps === 0;
    token.steps = wasInBase ? 1 : token.steps + dice;

    let captured = [];
    if (token.steps <= HOME_ENTRY_STEPS) {
      const square = LudoGame.globalSquare(color, token.steps);
      captured = this._resolveCaptures(color, square);
    }

    const reachedHome = token.steps === FINAL_STEP;
    if (reachedHome) {
      this._log(`${color} token ${tokenIndex} reached home`);
    }

    const finishedGame = this._checkWin(color);

    // A six, a capture, or reaching home grants an extra roll.
    const grantsExtraTurn = dice === MAX_DICE || captured.length > 0 || reachedHome;

    this.lastDice = null; // must roll again before the next move

    if (!finishedGame) {
      if (!grantsExtraTurn) {
        this._advanceTurn();
      } else {
        this._log(`${color} gets an extra turn`);
      }
    }

    return {
      color,
      tokenIndex,
      steps: token.steps,
      captured,
      reachedHome,
      extraTurn: grantsExtraTurn && !finishedGame,
      finishedGame,
      winner: this.winner,
    };
  }

  _resolveCaptures(movedColor, square) {
    if (square === null || SAFE_SQUARES.includes(square)) return [];
    const captured = [];
    this.playerColors.forEach((otherColor) => {
      if (otherColor === movedColor) return;
      this.tokens[otherColor].forEach((otherToken, idx) => {
        if (otherToken.steps === 0 || otherToken.steps > HOME_ENTRY_STEPS) return;
        const otherSquare = LudoGame.globalSquare(otherColor, otherToken.steps);
        if (otherSquare === square) {
          otherToken.steps = 0;
          captured.push({ color: otherColor, tokenIndex: idx });
        }
      });
    });
    if (captured.length) {
      this._log(`${movedColor} captured ${captured.map((c) => `${c.color}#${c.tokenIndex}`).join(', ')}`);
    }
    return captured;
  }

  _checkWin(color) {
    const allHome = this.tokens[color].every((t) => t.steps === FINAL_STEP);
    if (allHome && !this.finishOrder.includes(color)) {
      this.finishOrder.push(color);
      if (!this.winner) {
        this.winner = color;
        this.status = 'finished';
        this._log(`${color} wins the game!`);
        return true;
      }
    }
    return false;
  }

  _advanceTurn() {
    this.consecutiveSixes = 0;
    let next = this.currentPlayerIndex;
    for (let i = 0; i < this.playerColors.length; i += 1) {
      next = (next + 1) % this.playerColors.length;
      const color = this.playerColors[next];
      const stillPlaying = !this.finishOrder.includes(color);
      if (stillPlaying) {
        this.currentPlayerIndex = next;
        return;
      }
    }
  }

  _log(message) {
    this.log.push({ message, at: Date.now() });
    if (this.log.length > 200) this.log.shift();
  }

  /** Serializes state for sending to clients. */
  toJSON() {
    return {
      playerColors: this.playerColors,
      colorToPlayerId: this.colorToPlayerId,
      currentColor: this.currentColor,
      lastDice: this.lastDice,
      tokens: this.tokens,
      status: this.status,
      winner: this.winner,
      finishOrder: this.finishOrder,
    };
  }
}

module.exports = LudoGame;
