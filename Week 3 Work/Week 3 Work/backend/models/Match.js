const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        name: { type: String, required: true },
        color: { type: String, required: true },
        isGuest: { type: Boolean, default: false },
      },
    ],
    winnerColor: { type: String, default: null },
    finishOrder: [{ type: String }],
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', MatchSchema);
