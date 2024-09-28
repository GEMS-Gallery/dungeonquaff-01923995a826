import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'getGameState' : ActorMethod<
    [],
    {
      'playerX' : bigint,
      'playerY' : bigint,
      'potions' : Array<[bigint, bigint]>,
      'monsters' : Array<[bigint, bigint]>,
      'playerHealth' : bigint,
    }
  >,
  'initGame' : ActorMethod<[], undefined>,
  'movePlayer' : ActorMethod<[bigint, bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
