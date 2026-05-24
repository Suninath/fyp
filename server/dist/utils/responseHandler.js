"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, result) => {
    const { status, message, data, pagination, httpCode = 200 } = result, rest = __rest(result, ["status", "message", "data", "pagination", "httpCode"]);
    return res.status(httpCode).json(Object.assign({ status,
        httpCode,
        message,
        data,
        pagination }, rest));
};
exports.sendResponse = sendResponse;
