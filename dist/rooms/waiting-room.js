"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingRoom = void 0;
class WaitingRoom {
    constructor() {
        this.queue = [];
    }
    addUser(user) {
        this.queue.push(user);
    }
    removeUser(id) {
        const index = this.queue.findIndex(user => user.socket.id === id);
        this.queue.splice(index, 1);
    }
    getPreparedUsers() {
        let user1Index = -1;
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].name) {
                if (user1Index < 0) {
                    user1Index = i;
                }
                else {
                    const [user1] = this.queue.splice(i, 1);
                    const [user2] = this.queue.splice(user1Index, 1);
                    return [user1, user2];
                }
            }
        }
        return null;
    }
}
exports.WaitingRoom = WaitingRoom;
//# sourceMappingURL=waiting-room.js.map