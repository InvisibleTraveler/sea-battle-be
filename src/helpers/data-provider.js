"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataProvider = void 0;
function dataProvider(func, data) {
    return function (eventData) { return func(data, eventData); };
}
exports.dataProvider = dataProvider;
