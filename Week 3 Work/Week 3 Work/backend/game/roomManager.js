const LudoGame = require('./ludoEngine');
const { COLORS } = require('./ludoConstants');

/**
 * In-memory registry of all active rooms. A room goes through:
 *   waiting -> in-progress -> finished
 * Rooms are garbage collected a short while after they finish or go empty.
 */
class RoomManager {
  constructor() {
    /** @type {Map<string, Room>} */
    this.rooms = new Map();
  }

  generateRoomCode() {
    let code;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
    } while (this.rooms.has(code));
    return code;
  }

  createRoom({ hostId, hostName, isPrivate }) {
    const code = this.generateRoomCode();
    const room = {
      code,
      isPrivate: !!isPrivate,
      status: 'waiting',
      players: [
        { id: hostId, name: hostName, color: COLORS[0], connected: true, isHost: true },
      ],
      game: null,
      createdAt: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }

  listPublicRooms() {
    return Array.from(this.rooms.values()).filter(
      (r) => !r.isPrivate && r.status === 'waiting'
    );
  }

  joinRoom(code, { playerId, playerName }) {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');
    if (room.status !== 'waiting') throw new Error('Game already started');

    const existing = room.players.find((p) => p.id === playerId);
    if (existing) {
      existing.connected = true;
      return room;
    }

    if (room.players.length >= 4) throw new Error('Room is full');

    const takenColors = room.players.map((p) => p.color);
    const color = COLORS.find((c) => !takenColors.includes(c));
    room.players.push({ id: playerId, name: playerName, color, connected: true, isHost: false });
    return room;
  }

  markDisconnected(playerId) {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.connected = false;
        return room;
      }
    }
    return null;
  }

  startGame(code, requesterId) {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');
    const requester = room.players.find((p) => p.id === requesterId);
    if (!requester || !requester.isHost) throw new Error('Only the host can start the game');
    if (room.players.length < 2) throw new Error('Need at least 2 players to start');
    if (room.status !== 'waiting') throw new Error('Game already started');

    const playerColors = room.players.map((p) => p.color);
    const colorToPlayerId = {};
    room.players.forEach((p) => { colorToPlayerId[p.color] = p.id; });

    room.game = new LudoGame(playerColors, colorToPlayerId);
    room.status = 'in-progress';
    return room;
  }

  removeRoomIfEmpty(code) {
    const room = this.rooms.get(code);
    if (!room) return;
    const anyConnected = room.players.some((p) => p.connected);
    if (!anyConnected) {
      this.rooms.delete(code);
    }
  }

  roomSummary(room) {
    return {
      code: room.code,
      status: room.status,
      isPrivate: room.isPrivate,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        connected: p.connected,
        isHost: p.isHost,
      })),
      game: room.game ? room.game.toJSON() : null,
    };
  }
}

module.exports = RoomManager;
