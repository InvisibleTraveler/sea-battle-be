// models
import { User } from '../models/user';
import { Game } from '../models/game';
import { MessageType } from '../models/message-type.enum';
import { Shot } from '../models/shot';
import { BattleField } from '../models/battle-field';
import { GameState } from '../models/game-state';
import { GameStatus } from '../models/game-status.enum';

// helpers
import { dataProvider } from '../helpers/data-provider';
import { DbController } from '../db-controllers/db-controller';

export class GameRoom {
    private dbController: DbController;

    private player1: User;
    private player2: User;
    private game: Game;
    private turn: string | null = null;
    private winner: string | null = null;

    constructor(player1: User, player2: User, dbController: DbController) {
        this.player1 = player1;
        this.player2 = player2;
        this.dbController = dbController;

        this.handlePlayerEvents(player1);
        this.handlePlayerEvents(player2);

        this.game = {
            player1table: [],
            player2table: []
        };

        this.sendGameState();
        this.sendGameReady();
        this.dbController.saveLog('room created');
    }

    private get gameStatus(): GameStatus {
        return this.winner
            ? GameStatus.ended
            : this.game.player1table.length && this.game.player2table.length
                ? GameStatus.playing
                : GameStatus.preparing;
    }

    private hideShips(shipsMap: BattleField[][]): BattleField[][] {
        return shipsMap.map(row => row.map(field => field.hit ? field : { haveShip: false, hit: false }));
    }

    private checkWinStatus(shipsMap: BattleField[][]): boolean {
        return !shipsMap.find(row => row.find(field => field.haveShip && !field.hit));
    }

    private handlePlayerEvents(player: User): void {
        const socket = player.socket;

        socket.on(MessageType.shot, dataProvider(this.handleShot.bind(this), socket.id));
        socket.on(MessageType.shipsReady, dataProvider(this.handleReady.bind(this), socket.id));
    }

    private handleShot(playerId: string, shot: Shot): void {
        const opponentTable = this.player1.socket.id === playerId ? this.game.player2table : this.game.player1table;
        const isPlayer1 = this.player1.socket.id === playerId;
        if (this.turn === playerId && this.gameStatus === GameStatus.playing && !opponentTable[shot.y][shot.x].hit) {
            const field = opponentTable[shot.y][shot.x];
            field.hit = true;
            this.dbController.saveLog(`user ${playerId} shot in y=${shot.y} x=${shot.x}`);

            if (this.checkWinStatus(opponentTable)) {
                this.turn = null;
                this.winner = isPlayer1 ? this.player1.name : this.player2.name;
                this.dbController.saveLog(`user ${playerId} wins`);
                this.dbController.displayLogsList();
            } else if (!field.haveShip) {
                this.turn = isPlayer1 ? this.player2.socket.id : this.player1.socket.id;
            }

            this.sendGameState();
        }
    }

    private handleReady(playerId: string, ships: BattleField[][]): void {
        const isPlayer1 = this.player1.socket.id === playerId;
        const shipsUndefined = !(isPlayer1 ? this.game.player1table.length : this.game.player2table.length);

        if (shipsUndefined) {
            this.dbController.saveLog(`user ${playerId} is ready for battle`);
            if (isPlayer1) {
                this.game.player1table = ships;
            } else {
                this.game.player2table = ships;
            }

            if (this.game.player1table.length && this.game.player2table.length) {
                this.turn = isPlayer1 ? this.player2.socket.id : this.player1.socket.id;
            }

            this.sendGameState();
        }
    }

    public sendGameReady(): void {
        this.player1.socket.emit(MessageType.waitStart, true);
        this.player2.socket.emit(MessageType.waitStart, true);
    }

    private sendGameState(): void {
        const status = this.gameStatus;
        const [table1, table2] = [this.game.player1table, this.game.player2table];

        const gameState1: GameState = {
            status: status,
            yourShips: table1,
            opponentShips: this.hideShips(table2),
            opponentName: this.player2.name,
            turn: this.turn,
            winner: this.winner
        };
        const gameState2: GameState = {
            status: status,
            yourShips: table2,
            opponentShips: this.hideShips(table1),
            opponentName: this.player1.name,
            turn: this.turn,
            winner: this.winner
        };

        this.player1.socket.emit(MessageType.gameStatus, gameState1);
        this.player2.socket.emit(MessageType.gameStatus, gameState2);
    }
}
