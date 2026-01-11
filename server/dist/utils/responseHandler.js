"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, result) => {
    const { status, message, data, pagination, httpCode = 200 } = result;
    return res.status(httpCode).json({
        status,
        httpCode,
        message,
        data,
        pagination,
    });
};
exports.sendResponse = sendResponse;
