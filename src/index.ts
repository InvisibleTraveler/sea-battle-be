import * as http from 'http';
import { Server } from 'socket.io';
import { MessageType } from './models/message-type.enum';
import { WaitingRoom } from './rooms/waiting-room';
import { User } from './models/user';
import { GameRoom } from './rooms/game-room';
import { PlayRoom } from './rooms/play-room';
import { createConnection } from 'mysql';
import { DbController } from './db-controllers/db-controller';

const db = createConnection({
    host: 'localhost',
    user: 'root',
    password: '52Olehhh',
    database: 'battleshipLogs'
});

const dbController = new DbController(db);

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
    }
});

const port = process.env.PORT || 3000;

const waitingRoom = new WaitingRoom();
const playRoom = new PlayRoom();

io.on('connect', socket => {
    console.log('connect ' + socket.id);

    const user: User = { socket, name: '' };

    socket.on(MessageType.setName, (name: string) => {
        user.name = name;
        console.log(`set name for user ${socket.id}: ${name}`);
        tryNotifyUsers()
    });

    socket.on('disconnect', () => {
        waitingRoom.removeUser(socket.id);
    })

    waitingRoom.addUser(user);
});

server.listen(port, () => console.log('server listening on port ' + port));

function tryNotifyUsers(): void {
    let users: [User, User] | null;
    do {
        users = waitingRoom.getPreparedUsers();
        if (users) {
            playRoom.addRoom(new GameRoom(users[0], users[1], dbController));
            console.log('created new room');
        }
    } while (users);
}
