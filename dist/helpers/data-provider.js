"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataProvider = void 0;
function dataProvider(func, data) {
    return (eventData) => func(data, eventData);
}
exports.dataProvider = dataProvider;
//# sourceMappingURL=data-provider.js.map