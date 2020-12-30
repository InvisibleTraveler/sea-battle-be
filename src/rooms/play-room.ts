import { GameRoom } from './game-room';

export class PlayRoom {
    private list: GameRoom[] = [];

    public addRoom(room: GameRoom): void {
        this.list.push(room);
    }
}
