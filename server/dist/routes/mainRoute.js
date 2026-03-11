"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const vehicle_routes_1 = __importDefault(require("./vehicle.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const router = express_1.default.Router();
router.use("/api/v1/auth", auth_routes_1.default);
router.use("/api/v1/admin", admin_routes_1.default);
router.use("/api/v1/vehicles", vehicle_routes_1.default);
router.use("/api/v1/comments", comment_routes_1.default);
exports.default = router;
