"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var socket_io_1 = require("socket.io");
var message_type_enum_1 = require("./models/message-type.enum");
var waiting_room_1 = require("./rooms/waiting-room");
var game_room_1 = require("./rooms/game-room");
var server = http.createServer();
var io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
    }
});
var port = process.env.PORT || 3000;
var waitingRoom = new waiting_room_1.WaitingRoom();
io.on('connect', function (socket) {
    console.log('connect ' + socket.id);
    var user = { socket: socket, name: '' };
    socket.on(message_type_enum_1.MessageType.setName, function (name) {
        user.name = name;
        tryNotifyUsers();
    });
    waitingRoom.addUser(user);
});
server.listen(port, function () { return console.log('server listening on port ' + port); });
function tryNotifyUsers() {
    var users;
    do {
        users = waitingRoom.getPreparedUsers();
        if (users) {
            new game_room_1.GameRoom(users[0], users[1]);
        }
    } while (users);
}
