import Bool "mo:base/Bool";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Random "mo:base/Random";

actor {
  // Game constants
  let GRID_SIZE : Nat = 10;
  let INITIAL_HEALTH : Nat = 100;
  let POTION_HEAL : Nat = 20;
  let MONSTER_DAMAGE : Nat = 10;

  // Game state
  stable var playerX : Nat = 0;
  stable var playerY : Nat = 0;
  stable var playerHealth : Nat = INITIAL_HEALTH;
  stable var monsters : [(Nat, Nat)] = [(2, 2), (7, 7)];
  stable var potions : [(Nat, Nat)] = [(4, 4), (8, 8)];

  // Helper function to generate random coordinates
  func randomCoord() : async (Nat, Nat) {
    let seed = await Random.blob();
    let rand = Random.Finite(seed);
    let x = rand.range(Nat8.fromNat(GRID_SIZE));
    let y = rand.range(Nat8.fromNat(GRID_SIZE));
    return (
      Option.get(x, 0),
      Option.get(y, 0)
    );
  };

  // Initialize the game
  public func initGame() : async () {
    playerX := 0;
    playerY := 0;
    playerHealth := INITIAL_HEALTH;
    monsters := [(await randomCoord()), (await randomCoord())];
    potions := [(await randomCoord()), (await randomCoord())];
  };

  // Move player
  public func movePlayer(dx : Int, dy : Int) : async Text {
    let newX = Nat.max(0, Nat.min(GRID_SIZE - 1, Nat.fromInt(Int.max(0, Int.min(Int.fromNat(GRID_SIZE - 1), Int.fromNat(playerX) + dx)))));
    let newY = Nat.max(0, Nat.min(GRID_SIZE - 1, Nat.fromInt(Int.max(0, Int.min(Int.fromNat(GRID_SIZE - 1), Int.fromNat(playerY) + dy)))));
    
    playerX := newX;
    playerY := newY;

    // Check for potion
    potions := Array.filter(potions, func(p : (Nat, Nat)) : Bool {
      if (p.0 == newX and p.1 == newY) {
        playerHealth := Nat.min(INITIAL_HEALTH, playerHealth + POTION_HEAL);
        false
      } else {
        true
      }
    });

    // Move monsters
    monsters := Array.map<(Nat, Nat), (Nat, Nat)>(monsters, func(m : (Nat, Nat)) : (Nat, Nat) {
      let (mx, my) = m;
      let newMx = if (mx < newX) Nat.min(mx + 1, GRID_SIZE - 1) else if (mx > newX) (if (mx == 0) 0 else mx - 1) else mx;
      let newMy = if (my < newY) Nat.min(my + 1, GRID_SIZE - 1) else if (my > newY) (if (my == 0) 0 else my - 1) else my;
      (newMx, newMy)
    });

    // Check for monster collision
    for (m in monsters.vals()) {
      if (m.0 == newX and m.1 == newY) {
        if (playerHealth > MONSTER_DAMAGE) {
          playerHealth -= MONSTER_DAMAGE;
        } else {
          playerHealth := 0;
        };
      };
    };

    if (playerHealth == 0) {
      return "Game Over";
    };

    return "Move successful";
  };

  // Get game state
  public query func getGameState() : async {
    playerX : Nat;
    playerY : Nat;
    playerHealth : Nat;
    monsters : [(Nat, Nat)];
    potions : [(Nat, Nat)];
  } {
    return {
      playerX;
      playerY;
      playerHealth;
      monsters;
      potions;
    };
  };
}
