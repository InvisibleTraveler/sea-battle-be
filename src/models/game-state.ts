import { GameStatus } from './game-status.enum';
import { BattleField } from './battle-field';

export interface GameState {
  status: GameStatus;
  yourShips: BattleField[][];
  opponentShips: BattleField[][];
  opponentName: string;
  turn: string | null;
  winner: string | null;
}
