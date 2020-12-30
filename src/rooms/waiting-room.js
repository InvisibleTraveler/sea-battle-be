"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingRoom = void 0;
var WaitingRoom = /** @class */ (function () {
    function WaitingRoom() {
        this.queue = [];
    }
    WaitingRoom.prototype.addUser = function (user) {
        this.queue.push(user);
    };
    WaitingRoom.prototype.getPreparedUsers = function () {
        var user1Index = -1;
        for (var i = 0; i < this.queue.length; i++) {
            if (this.queue[i].name) {
                if (user1Index < 0) {
                    user1Index = i;
                }
                else {
                    var user1 = this.queue.splice(i, 1)[0];
                    var user2 = this.queue.splice(user1Index, 1)[0];
                    return [user1, user2];
                }
            }
        }
        return null;
    };
    return WaitingRoom;
}());
exports.WaitingRoom = WaitingRoom;
