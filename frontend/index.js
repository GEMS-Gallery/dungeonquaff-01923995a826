import { Actor, HttpAgent } from "@dfinity/agent";

const agent = new HttpAgent();
let gameActor;

async function initActor() {
  try {
    const canisterId = process.env.GAME_CANISTER_ID;
    if (!canisterId) {
      throw new Error("Canister ID not found");
    }
    gameActor = Actor.createActor(
      // Since we don't have the idlFactory, we'll use a minimal interface
      ({ IDL }) => {
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
      },
      { agent, canisterId }
    );
  } catch (error) {
    console.error("Failed to create actor:", error);
    alert("Failed to initialize the game. Please refresh and try again.");
  }
}

const gridSize = 10;
const gridElement = document.getElementById("game-grid");
const playerHealthElement = document.getElementById("player-health");
const playerXElement = document.getElementById("player-x");
const playerYElement = document.getElementById("player-y");

async function initGame() {
  await initActor();
  if (gameActor) {
    await gameActor.initGame();
    updateGameState();
  }
}

async function updateGameState() {
  if (gameActor) {
    const gameState = await gameActor.getGameState();
    renderGrid(gameState);
    updatePlayerInfo(gameState);
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

async function movePlayer(dx, dy) {
  if (gameActor) {
    const result = await gameActor.movePlayer(dx, dy);
    if (result === "Game Over") {
      alert("Game Over!");
      initGame();
    } else {
      updateGameState();
    }
  }
}

document.getElementById("up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("right").addEventListener("click", () => movePlayer(1, 0));

initGame();
