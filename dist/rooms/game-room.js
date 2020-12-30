"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const message_type_enum_1 = require("../models/message-type.enum");
const game_status_enum_1 = require("../models/game-status.enum");
// helpers
const data_provider_1 = require("../helpers/data-provider");
class GameRoom {
    constructor(player1, player2, dbController) {
        this.turn = null;
        this.winner = null;
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
    get gameStatus() {
        return this.winner
            ? game_status_enum_1.GameStatus.ended
            : this.game.player1table.length && this.game.player2table.length
                ? game_status_enum_1.GameStatus.playing
                : game_status_enum_1.GameStatus.preparing;
    }
    hideShips(shipsMap) {
        return shipsMap.map(row => row.map(field => field.hit ? field : { haveShip: false, hit: false }));
    }
    checkWinStatus(shipsMap) {
        return !shipsMap.find(row => row.find(field => field.haveShip && !field.hit));
    }
    handlePlayerEvents(player) {
        const socket = player.socket;
        socket.on(message_type_enum_1.MessageType.shot, data_provider_1.dataProvider(this.handleShot.bind(this), socket.id));
        socket.on(message_type_enum_1.MessageType.shipsReady, data_provider_1.dataProvider(this.handleReady.bind(this), socket.id));
    }
    handleShot(playerId, shot) {
        const opponentTable = this.player1.socket.id === playerId ? this.game.player2table : this.game.player1table;
        const isPlayer1 = this.player1.socket.id === playerId;
        if (this.turn === playerId && this.gameStatus === game_status_enum_1.GameStatus.playing && !opponentTable[shot.y][shot.x].hit) {
            const field = opponentTable[shot.y][shot.x];
            field.hit = true;
            this.dbController.saveLog(`user ${playerId} shot in y=${shot.y} x=${shot.x}`);
            if (this.checkWinStatus(opponentTable)) {
                this.turn = null;
                this.winner = isPlayer1 ? this.player1.name : this.player2.name;
                this.dbController.saveLog(`user ${playerId} wins`);
                this.dbController.displayLogsList();
            }
            else if (!field.haveShip) {
                this.turn = isPlayer1 ? this.player2.socket.id : this.player1.socket.id;
            }
            this.sendGameState();
        }
    }
    handleReady(playerId, ships) {
        const isPlayer1 = this.player1.socket.id === playerId;
        const shipsUndefined = !(isPlayer1 ? this.game.player1table.length : this.game.player2table.length);
        if (shipsUndefined) {
            this.dbController.saveLog(`user ${playerId} is ready for battle`);
            if (isPlayer1) {
                this.game.player1table = ships;
            }
            else {
                this.game.player2table = ships;
            }
            if (this.game.player1table.length && this.game.player2table.length) {
                this.turn = isPlayer1 ? this.player2.socket.id : this.player1.socket.id;
            }
            this.sendGameState();
        }
    }
    sendGameReady() {
        this.player1.socket.emit(message_type_enum_1.MessageType.waitStart, true);
        this.player2.socket.emit(message_type_enum_1.MessageType.waitStart, true);
    }
    sendGameState() {
        const status = this.gameStatus;
        const [table1, table2] = [this.game.player1table, this.game.player2table];
        const gameState1 = {
            status: status,
            yourShips: table1,
            opponentShips: this.hideShips(table2),
            opponentName: this.player2.name,
            turn: this.turn,
            winner: this.winner
        };
        const gameState2 = {
            status: status,
            yourShips: table2,
            opponentShips: this.hideShips(table1),
            opponentName: this.player1.name,
            turn: this.turn,
            winner: this.winner
        };
        this.player1.socket.emit(message_type_enum_1.MessageType.gameStatus, gameState1);
        this.player2.socket.emit(message_type_enum_1.MessageType.gameStatus, gameState2);
    }
}
exports.GameRoom = GameRoom;
//# sourceMappingURL=game-room.js.map