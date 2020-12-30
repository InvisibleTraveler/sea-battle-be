import { Connection } from 'mysql';

export class DbController {
    private db: Connection;

    constructor(db: Connection) {
        this.db = db;
        this.db.connect();
    }

    public saveLog(message: string): void {
        this.db.query(`insert into logs (message) value ('${message}')`, (err) => {
            console.log('saved');
            console.log(`errors exist: ${!!err}`);
        });
    }

    public displayLogsList(): void {
        this.db.query('select * from logs', (err, res) => {
            console.log('result: ', res);
        });
    }
}
