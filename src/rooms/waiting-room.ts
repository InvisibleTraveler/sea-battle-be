import { User } from '../models/user';

export class WaitingRoom {
    private queue: User[] = [];

    public addUser(user: User): void {
        this.queue.push(user);
    }

    public removeUser(id: string): void {
        const index = this.queue.findIndex(user => user.socket.id === id);
        this.queue.splice(index, 1);
    }

    public getPreparedUsers(): [User, User] | null {
        let user1Index = -1;

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].name) {
                if (user1Index < 0) {
                    user1Index = i;
                } else {
                    const [user1] = this.queue.splice(i, 1);
                    const [user2] = this.queue.splice(user1Index, 1);
                    return [user1, user2];
                }
            }
        }

        return null;
    }
}
