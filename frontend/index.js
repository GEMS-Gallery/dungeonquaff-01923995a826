import { Actor, HttpAgent } from "@dfinity/agent";

const canisterId = process.env.GAME_CANISTER_ID;
const host = "https://ic0.app";

const agent = new HttpAgent({ host });
let gameActor;

const gameGrid = document.getElementById("game-grid");
const playerHealth = document.getElementById("player-health");
const playerX = document.getElementById("player-x");
const playerY = document.getElementById("player-y");
const statusElement = document.getElementById("status");

const idlFactory = ({ IDL }) => {
  return IDL.Service({
    initGame: IDL.Func([], [], []),
    getGameState: IDL.Func([], [IDL.Record({
      playerX: IDL.Nat,
      playerY: IDL.Nat,
      playerHealth: IDL.Nat,
      monsters: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
      potions: IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))
    })], ['query']),
    movePlayer: IDL.Func([IDL.Int, IDL.Int], [IDL.Text], [])
  });
};

async function initActor() {
  gameActor = Actor.createActor(idlFactory, { agent, canisterId });
}

async function initGame() {
  setStatus("Initializing game...");
  try {
    await initActor();
    await gameActor.initGame();
    await updateGameState();
    setStatus("Game initialized");
  } catch (error) {
    console.error("Failed to initialize game:", error);
    setStatus("Failed to initialize game. Please refresh and try again.");
  }
}

async function updateGameState() {
  try {
    const state = await gameActor.getGameState();
    renderGrid(state);
    updatePlayerInfo(state);
  } catch (error) {
    console.error("Failed to update game state:", error);
    setStatus("Failed to update game state");
  }
}

function renderGrid(state) {
  gameGrid.innerHTML = "";
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (x === state.playerX && y === state.playerY) {
        cell.classList.add("player");
      } else if (state.monsters.some(m => m[0] === x && m[1] === y)) {
        cell.classList.add("monster");
      } else if (state.potions.some(p => p[0] === x && p[1] === y)) {
        cell.classList.add("potion");
      }
      gameGrid.appendChild(cell);
    }
  }
}

function updatePlayerInfo(state) {
  playerHealth.textContent = state.playerHealth;
  playerX.textContent = state.playerX;
  playerY.textContent = state.playerY;
}

function setStatus(message) {
  statusElement.textContent = message;
}

async function movePlayer(dx, dy) {
  setStatus("Moving player...");
  try {
    const result = await gameActor.movePlayer(dx, dy);
    await updateGameState();
    setStatus(result);
  } catch (error) {
    console.error("Failed to move player:", error);
    setStatus("Failed to move player");
  }
}

document.getElementById("up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("right").addEventListener("click", () => movePlayer(1, 0));

initGame();
