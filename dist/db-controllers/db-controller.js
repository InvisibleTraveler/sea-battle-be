"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbController = void 0;
class DbController {
    constructor(db) {
        this.db = db;
        this.db.connect();
    }
    saveLog(message) {
        this.db.query(`insert into logs (message) value ('${message}')`, (err) => {
            console.log('saved');
            console.log(`errors exist: ${!!err}`);
        });
    }
    displayLogsList() {
        this.db.query('select * from logs', (err, res, fields) => {
            console.log('errors: ', err);
            console.log('result: ', res);
            console.log('fields: ', fields);
        });
    }
}
exports.DbController = DbController;
//# sourceMappingURL=db-controller.js.map