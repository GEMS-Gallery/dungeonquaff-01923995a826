export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getGameState' : IDL.Func(
        [],
        [
          IDL.Record({
            'playerX' : IDL.Nat,
            'playerY' : IDL.Nat,
            'potions' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
            'monsters' : IDL.Vec(IDL.Tuple(IDL.Nat, IDL.Nat)),
            'playerHealth' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'initGame' : IDL.Func([], [], []),
    'movePlayer' : IDL.Func([IDL.Int, IDL.Int], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
