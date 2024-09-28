import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

const isLocalNetwork = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1');
const canisterId = isLocalNetwork ? process.env.LOCAL_GAME_CANISTER_ID : process.env.GAME_CANISTER_ID;

let gameActor;

// Define the interface for the game canister
const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'initGame': IDL.Func([], [], []),
    'getGameState': IDL.Func([], [IDL.Record({
      'playerX': IDL.Nat,
      'playerY': IDL.Nat,
      'playerHealth': IDL.Nat,
      'monsters': IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
      'potions': IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat))
    })], ['query']),
    'movePlayer': IDL.Func([IDL.Int, IDL.Int], [IDL.Text], [])
  });
};

async function initActor() {
  try {
    const agent = new HttpAgent({ host: isLocalNetwork ? "http://localhost:8000" : "https://ic0.app" });
    
    if (isLocalNetwork) {
      await agent.fetchRootKey();
    }

    if (!canisterId) {
      throw new Error("Canister ID not found");
    }

    gameActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });

    console.log("Actor created successfully");
  } catch (error) {
    console.error("Failed to create actor:", error);
    throw error;
  }
}

const gridSize = 10;
const gridElement = document.getElementById("game-grid");
const playerHealthElement = document.getElementById("player-health");
const playerXElement = document.getElementById("player-x");
const playerYElement = document.getElementById("player-y");
const statusElement = document.getElementById("status");

async function initGame() {
  setStatus("Initializing game...");
  try {
    await initActor();
    await gameActor.initGame();
    setStatus("Game initialized");
    await updateGameState();
  } catch (error) {
    console.error("Failed to initialize game:", error);
    setStatus("Failed to initialize game. Please refresh and try again.");
  }
}

async function updateGameState() {
  if (gameActor) {
    try {
      const gameState = await gameActor.getGameState();
      renderGrid(gameState);
      updatePlayerInfo(gameState);
      setStatus("Game state updated");
    } catch (error) {
      console.error("Failed to update game state:", error);
      setStatus("Failed to update game state");
    }
  }
}

function renderGrid(gameState) {
  gridElement.innerHTML = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (x === gameState.playerX && y === gameState.playerY) {
        cell.classList.add("player");
      } else if (gameState.monsters.some(m => m[0] === x && m[1] === y)) {
        cell.classList.add("monster");
      } else if (gameState.potions.some(p => p[0] === x && p[1] === y)) {
        cell.classList.add("potion");
      }
      gridElement.appendChild(cell);
    }
  }
}

function updatePlayerInfo(gameState) {
  playerHealthElement.textContent = gameState.playerHealth;
  playerXElement.textContent = gameState.playerX;
  playerYElement.textContent = gameState.playerY;
}

function setStatus(message) {
  statusElement.textContent = message;
}

async function movePlayer(dx, dy) {
  if (gameActor) {
    try {
      setStatus("Moving player...");
      const result = await gameActor.movePlayer(dx, dy);
      if (result === "Game Over") {
        setStatus("Game Over!");
        await initGame();
      } else {
        await updateGameState();
        setStatus("Move successful");
      }
    } catch (error) {
      console.error("Failed to move player:", error);
      setStatus("Failed to move player");
    }
  }
}

document.getElementById("up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("right").addEventListener("click", () => movePlayer(1, 0));

initGame();
