import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import { connectSocket, disconnectSocket } from './socket.js';

export default function App() {
  const [session, setSession] = useState(null); // { token, user }

  const handleAuthenticated = useCallback((token, user) => {
    connectSocket(token);
    setSession({ token, user });
  }, []);

  const handleLogout = useCallback(() => {
    disconnectSocket();
    setSession(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-wide">
          <span className="text-ludo-red">L</span>
          <span className="text-ludo-green">u</span>
          <span className="text-ludo-yellow">d</span>
          <span className="text-ludo-blue">o</span>
          <span className="ml-3 text-board-cream/90">Online</span>
        </h1>
        <p className="text-board-cream/60 mt-2 font-body text-sm">
          Real-time multiplayer, right in your browser
        </p>
      </header>

      <main className="w-full flex-1 flex justify-center">
        <Routes>
          <Route
            path="/"
            element={
              session ? (
                <Navigate to="/lobby" replace />
              ) : (
                <Home onAuthenticated={handleAuthenticated} />
              )
            }
          />
          <Route
            path="/lobby"
            element={
              session ? (
                <Lobby session={session} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/game/:code"
            element={
              session ? (
                <Game session={session} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
