const { verifyToken } = require('../middleware/auth');
const RoomManager = require('../game/roomManager');
const Match = require('../models/Match');

const roomManager = new RoomManager();

// Reconnection grace period: if a player disconnects mid-game, the room
// is kept alive for this long before being torn down.
const DISCONNECT_GRACE_MS = 2 * 60 * 1000;

function registerSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyToken(token);
      socket.user = payload; // { id, username, guest }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: playerId, username } = socket.user;

    socket.on('create-room', ({ isPrivate }, ack) => {
      const room = roomManager.createRoom({ hostId: playerId, hostName: username, isPrivate });
      socket.join(room.code);
      socket.data.roomCode = room.code;
      ack?.({ ok: true, room: roomManager.roomSummary(room) });
      io.to(room.code).emit('room-update', roomManager.roomSummary(room));
    });

    socket.on('join-room', ({ code }, ack) => {
      try {
        const room = roomManager.joinRoom(code, { playerId, playerName: username });
        socket.join(room.code);
        socket.data.roomCode = room.code;
        ack?.({ ok: true, room: roomManager.roomSummary(room) });
        io.to(room.code).emit('room-update', roomManager.roomSummary(room));
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('list-public-rooms', (_, ack) => {
      const rooms = roomManager.listPublicRooms().map((r) => ({
        code: r.code,
        players: r.players.length,
      }));
      ack?.({ ok: true, rooms });
    });

    socket.on('start-game', (_, ack) => {
      try {
        const code = socket.data.roomCode;
        const room = roomManager.startGame(code, playerId);
        io.to(code).emit('game-started', roomManager.roomSummary(room));
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('roll-dice', (_, ack) => {
      try {
        const code = socket.data.roomCode;
        const room = roomManager.getRoom(code);
        if (!room || !room.game) throw new Error('Game not in progress');
        const currentPlayerId = room.game.colorToPlayerId[room.game.currentColor];
        if (currentPlayerId !== playerId) throw new Error('Not your turn');

        const result = room.game.rollDice();
        io.to(code).emit('dice-rolled', {
          by: playerId,
          ...result,
          state: room.game.toJSON(),
        });
        ack?.({ ok: true, ...result });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('move-token', ({ tokenIndex }, ack) => {
      try {
        const code = socket.data.roomCode;
        const room = roomManager.getRoom(code);
        if (!room || !room.game) throw new Error('Game not in progress');
        const currentPlayerId = room.game.colorToPlayerId[room.game.currentColor];
        if (currentPlayerId !== playerId) throw new Error('Not your turn');

        const result = room.game.moveToken(tokenIndex);
        io.to(code).emit('token-moved', { ...result, state: room.game.toJSON() });

        if (result.finishedGame) {
          io.to(code).emit('game-over', { winner: result.winner, state: room.game.toJSON() });
          persistMatch(room).catch((err) => console.error('[match] failed to save:', err.message));
        }
        ack?.({ ok: true, ...result });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('send-message', ({ text }) => {
      const code = socket.data.roomCode;
      if (!code || !text) return;
      const clean = String(text).slice(0, 200);
      io.to(code).emit('chat-message', { from: username, text: clean, at: Date.now() });
    });

    socket.on('disconnect', () => {
      const code = socket.data.roomCode;
      if (!code) return;
      const room = roomManager.markDisconnected(playerId);
      if (room) {
        io.to(code).emit('room-update', roomManager.roomSummary(room));
        setTimeout(() => roomManager.removeRoomIfEmpty(code), DISCONNECT_GRACE_MS);
      }
    });
  });
}

async function persistMatch(room) {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) return; // no DB configured, skip silently
  await Match.create({
    roomCode: room.code,
    players: room.players.map((p) => ({
      userId: p.id && p.id.length === 24 ? p.id : null,
      name: p.name,
      color: p.color,
      isGuest: !(p.id && p.id.length === 24),
    })),
    winnerColor: room.game.winner,
    finishOrder: room.game.finishOrder,
    startedAt: new Date(room.createdAt),
    endedAt: new Date(),
  });
}

module.exports = registerSocketHandlers;
