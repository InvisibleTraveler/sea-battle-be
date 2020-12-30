"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
var message_type_enum_1 = require("../models/message-type.enum");
var game_status_enum_1 = require("../models/game-status.enum");
// helpers
var data_provider_1 = require("../helpers/data-provider");
var GameRoom = /** @class */ (function () {
    function GameRoom(player1, player2) {
        this.turn = null;
        this.winner = null;
        this.player1 = player1;
        this.player2 = player2;
        this.handlePlayerEvents(player1);
        this.handlePlayerEvents(player2);
        this.game = {
            player1table: [],
            player2table: []
        };
    }
    Object.defineProperty(GameRoom.prototype, "gameStatus", {
        get: function () {
            return this.winner
                ? game_status_enum_1.GameStatus.ended
                : this.game.player1table.length && this.game.player2table.length
                    ? game_status_enum_1.GameStatus.playing
                    : game_status_enum_1.GameStatus.preparing;
        },
        enumerable: false,
        configurable: true
    });
    GameRoom.prototype.hideShips = function (shipsMap) {
        return shipsMap.map(function (row) { return row.map(function (field) { return field.hit ? field : { haveShip: false, hit: false }; }); });
    };
    GameRoom.prototype.checkWinStatus = function (shipsMap) {
        return !shipsMap.find(function (row) { return row.find(function (field) { return field.haveShip && !field.hit; }); });
    };
    GameRoom.prototype.handlePlayerEvents = function (player) {
        var socket = player.socket;
        socket.on(message_type_enum_1.MessageType.shot, data_provider_1.dataProvider(this.handleShot, socket.id));
        socket.on(message_type_enum_1.MessageType.shipsReady, data_provider_1.dataProvider(this.handleReady, socket.id));
    };
    GameRoom.prototype.handleShot = function (playerId, shot) {
        var opponentTable = this.player1.socket.id === playerId ? this.game.player2table : this.game.player1table;
        if (this.turn === playerId && this.gameStatus === game_status_enum_1.GameStatus.playing && !opponentTable[shot.y][shot.x].hit) {
            var field = opponentTable[shot.y][shot.x];
            field.hit = true;
            if (this.checkWinStatus(opponentTable)) {
                this.turn = null;
                this.winner = playerId;
            }
            this.sendGameState();
        }
    };
    GameRoom.prototype.handleReady = function (playerId, ships) {
        var isPlayer1 = this.player1.socket.id === playerId;
        var shipsUndefined = !(isPlayer1 ? this.game.player1table.length : this.game.player2table.length);
        if (shipsUndefined) {
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
    };
    GameRoom.prototype.sendGameState = function () {
        var status = this.gameStatus;
        var _a = [this.game.player1table, this.game.player2table], table1 = _a[0], table2 = _a[1];
        var gameState1 = {
            status: status,
            yourShips: table1,
            opponentShips: this.hideShips(table2),
            opponentName: this.player2.name,
            turn: this.turn,
            winner: this.winner
        };
        var gameState2 = {
            status: status,
            yourShips: table2,
            opponentShips: this.hideShips(table1),
            opponentName: this.player1.name,
            turn: this.turn,
            winner: this.winner
        };
        this.player1.socket.emit(message_type_enum_1.MessageType.gameStatus, gameState1);
        this.player2.socket.emit(message_type_enum_1.MessageType.gameStatus, gameState2);
    };
    return GameRoom;
}());
exports.GameRoom = GameRoom;
