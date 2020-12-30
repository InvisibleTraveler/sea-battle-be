"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const socket_io_1 = require("socket.io");
const message_type_enum_1 = require("./models/message-type.enum");
const waiting_room_1 = require("./rooms/waiting-room");
const game_room_1 = require("./rooms/game-room");
const play_room_1 = require("./rooms/play-room");
const mysql_1 = require("mysql");
const db_controller_1 = require("./db-controllers/db-controller");
const db = mysql_1.createConnection({
    host: 'localhost',
    user: 'root',
    password: '52Olehhh',
    database: 'battleshipLogs'
});
const dbController = new db_controller_1.DbController(db);
const server = http.createServer();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
    }
});
const port = process.env.PORT || 3000;
const waitingRoom = new waiting_room_1.WaitingRoom();
const playRoom = new play_room_1.PlayRoom();
io.on('connect', socket => {
    console.log('connect ' + socket.id);
    const user = { socket, name: '' };
    socket.on(message_type_enum_1.MessageType.setName, (name) => {
        user.name = name;
        console.log(`set name for user ${socket.id}: ${name}`);
        tryNotifyUsers();
    });
    socket.on('disconnect', () => {
        waitingRoom.removeUser(socket.id);
    });
    waitingRoom.addUser(user);
});
server.listen(port, () => console.log('server listening on port ' + port));
function tryNotifyUsers() {
    let users;
    do {
        users = waitingRoom.getPreparedUsers();
        if (users) {
            playRoom.addRoom(new game_room_1.GameRoom(users[0], users[1], dbController));
            console.log('created new room');
        }
    } while (users);
}
//# sourceMappingURL=index.js.map