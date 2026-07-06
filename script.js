// Strict Traditional Board Game Loop Engine
const players = ['blue', 'red', 'green', 'yellow'];
let currentPlayerIndex = 0;
let diceRolled = false;
let currentDiceValue = 1;

// Starting path node tracking parameters mapping for single prototype tokens
const playerPositions = { blue: 0, red: 13, green: 26, yellow: 39 };

const diceEl = document.getElementById('dice');
const playerStatusEl = document.getElementById('current-player');
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function renderTokens() {
    // Safely drop old canvas tokens
    document.querySelectorAll('.token').forEach(el => el.remove());

    // Inject and align updated player token frames
    players.forEach(player => {
        const pos = playerPositions[player];
        const targetCell = document.getElementById(`cell-${pos}`);
        if (targetCell) {
            const token = document.createElement('div');
            token.classList.add('token', player);
            targetCell.appendChild(token);
        }
    });
}

diceEl.addEventListener('click', () => {
    if (diceRolled) return;
    diceRolled = true;
    
    let count = 0;
    const interval = setInterval(() => {
        const randomFace = Math.floor(Math.random() * 6);
        diceEl.textContent = diceFaces[randomFace];
        count++;
        
        if (count > 10) {
            clearInterval(interval);
            currentDiceValue = Math.floor(Math.random() * 6) + 1;
            diceEl.textContent = diceFaces[currentDiceValue - 1];
            
            movePlayer();
        }
    }, 60);
});

function movePlayer() {
    const player = players[currentPlayerIndex];
    
    // Cycle the tokens infinitely inside standard 52 external tracking tracks
    playerPositions[player] = (playerPositions[player] + currentDiceValue) % 52;
    
    renderTokens();

    setTimeout(() => {
        currentPlayerIndex = (currentPlayerIndex + 1) % 4;
        const nextPlayer = players[currentPlayerIndex];
        
        playerStatusEl.textContent = nextPlayer.toUpperCase();
        playerStatusEl.className = `turn-${nextPlayer}`;
        
        diceRolled = false;
    }, 700);
}

// Draw tokens on startup layout initialization
renderTokens();