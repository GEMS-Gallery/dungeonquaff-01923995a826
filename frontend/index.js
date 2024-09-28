import { backend } from 'declarations/backend';

const gameBoard = document.getElementById('game-board');
const healthDisplay = document.getElementById('health');
const messageDisplay = document.getElementById('message');

const GRID_SIZE = 10;

async function initGame() {
    await backend.initGame();
    updateGameState();
}

async function updateGameState() {
    const state = await backend.getGameState();
    renderGameBoard(state);
    healthDisplay.textContent = state.playerHealth;
}

function renderGameBoard(state) {
    gameBoard.innerHTML = '';
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (x === state.playerX && y === state.playerY) {
                cell.classList.add('player');
                cell.textContent = '@';
            } else if (state.monsters.some(m => m[0] === x && m[1] === y)) {
                cell.classList.add('monster');
                cell.textContent = 'M';
            } else if (state.potions.some(p => p[0] === x && p[1] === y)) {
                cell.classList.add('potion');
                cell.textContent = 'P';
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

async function movePlayer(dx, dy) {
    const result = await backend.movePlayer(dx, dy);
    messageDisplay.textContent = result;
    updateGameState();
}

document.addEventListener('keydown', async (event) => {
    switch (event.key) {
        case 'ArrowUp':
            await movePlayer(0, -1);
            break;
        case 'ArrowDown':
            await movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            await movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            await movePlayer(1, 0);
            break;
    }
});

initGame();
