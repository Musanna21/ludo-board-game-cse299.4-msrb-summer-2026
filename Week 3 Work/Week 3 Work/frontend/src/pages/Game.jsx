import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSocket } from '../socket.js';
import Board from '../components/Board.jsx';
import Dice from '../components/Dice.jsx';
import { PlayerPanel, ChatPanel } from '../components/PlayerPanel.jsx';

export default function Game({ session }) {
  const { code } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [rolling, setRolling] = useState(false);
  const [messages, setMessages] = useState([]);
  const [banner, setBanner] = useState('');
  const [gameOver, setGameOver] = useState(null);

  const myPlayer = room?.players.find((p) => p.id === session.user.id);
  const myColor = myPlayer?.color;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      navigate('/lobby');
      return;
    }

    function handleRoomUpdate(updatedRoom) {
      if (updatedRoom.code !== code) return;
      setRoom(updatedRoom);
      if (updatedRoom.game) setGameState(updatedRoom.game);
    }
    function handleGameStarted(updatedRoom) {
      setRoom(updatedRoom);
      setGameState(updatedRoom.game);
    }
    function handleDiceRolled({ by, dice, legalMoves: moves, turnPassed, state }) {
      setGameState(state);
      setRolling(false);
      setLegalMoves(turnPassed ? [] : moves);
      setBanner(
        turnPassed ? `Rolled a ${dice} - no moves available, turn passed.` : `Rolled a ${dice}.`
      );
    }
    function handleTokenMoved({ color, captured, reachedHome, extraTurn, state }) {
      setGameState(state);
      setLegalMoves([]);
      if (captured.length) {
        setBanner(`${color} captured ${captured.length} token(s)!`);
      } else if (reachedHome) {
        setBanner(`${color} got a token home!`);
      } else if (extraTurn) {
        setBanner(`${color} rolled a 6 - go again.`);
      } else {
        setBanner('');
      }
    }
    function handleGameOver({ winner }) {
      setGameOver(winner);
    }
    function handleChat(msg) {
      setMessages((prev) => [...prev, msg]);
    }

    socket.on('room-update', handleRoomUpdate);
    socket.on('game-started', handleGameStarted);
    socket.on('dice-rolled', handleDiceRolled);
    socket.on('token-moved', handleTokenMoved);
    socket.on('game-over', handleGameOver);
    socket.on('chat-message', handleChat);

    return () => {
      socket.off('room-update', handleRoomUpdate);
      socket.off('game-started', handleGameStarted);
      socket.off('dice-rolled', handleDiceRolled);
      socket.off('token-moved', handleTokenMoved);
      socket.off('game-over', handleGameOver);
      socket.off('chat-message', handleChat);
    };
  }, [code, navigate]);

  const rollDice = useCallback(() => {
    const socket = getSocket();
    setRolling(true);
    setBanner('');
    socket.emit('roll-dice', {}, (res) => {
      if (!res.ok) {
        setRolling(false);
        setBanner(res.error);
      }
    });
  }, []);

  const moveToken = useCallback((tokenIndex) => {
    const socket = getSocket();
    socket.emit('move-token', { tokenIndex }, (res) => {
      if (!res.ok) setBanner(res.error);
    });
  }, []);

  const sendMessage = useCallback((text) => {
    const socket = getSocket();
    socket.emit('send-message', { text });
  }, []);

  if (!room || !gameState) {
    return <p className="text-board-cream/60">Loading game…</p>;
  }

  const isMyTurn = gameState.currentColor === myColor;

  return (
    <div className="w-full max-w-5xl grid md:grid-cols-[1fr_280px] gap-6">
      <div className="bg-board-panel rounded-2xl shadow-panel p-4 flex flex-col items-center gap-4">
        <Board
          tokens={gameState.tokens}
          myColor={myColor}
          currentColor={gameState.currentColor}
          legalMoves={isMyTurn ? legalMoves : []}
          onMoveToken={moveToken}
        />
        <Dice
          value={gameState.lastDice}
          rolling={rolling}
          disabled={!isMyTurn || gameState.lastDice !== null || gameState.status === 'finished'}
          onRoll={rollDice}
        />
        {banner && <p className="text-sm text-ludo-yellow text-center">{banner}</p>}
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-board-panel rounded-2xl shadow-panel p-4">
          <p className="text-xs uppercase tracking-wide text-board-cream/50 mb-2">Players</p>
          <PlayerPanel players={room.players} currentColor={gameState.currentColor} />
        </div>
        <div className="bg-board-panel rounded-2xl shadow-panel p-4">
          <p className="text-xs uppercase tracking-wide text-board-cream/50 mb-2">Chat</p>
          <ChatPanel messages={messages} onSend={sendMessage} />
        </div>
      </div>

      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-board-panel rounded-2xl shadow-panel p-8 text-center max-w-sm">
            <h2 className="font-display text-2xl font-bold mb-2">
              {gameOver === myColor ? 'You won! 🎉' : `${gameOver} wins!`}
            </h2>
            <button
              onClick={() => navigate('/lobby')}
              className="mt-4 rounded-lg bg-ludo-yellow text-board-bg font-display font-bold py-2.5 px-6"
            >
              Back to lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
