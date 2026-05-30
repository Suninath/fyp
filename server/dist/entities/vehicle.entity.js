"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleEntity = exports.VEHICLE_CATEGORY = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../utils/base.entity");
const user_entity_1 = require("./user.entity");
var VEHICLE_CATEGORY;
(function (VEHICLE_CATEGORY) {
    VEHICLE_CATEGORY["BUY_SELL"] = "Buy/Sell";
    VEHICLE_CATEGORY["RENTING"] = "Renting";
})(VEHICLE_CATEGORY || (exports.VEHICLE_CATEGORY = VEHICLE_CATEGORY = {}));
let VehicleEntity = class VehicleEntity extends base_entity_1.BaseEntity {
};
exports.VehicleEntity = VehicleEntity;
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "make", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "mileage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "fuelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "transmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "bodyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], VehicleEntity.prototype, "ownerCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", array: true, nullable: true }),
    __metadata("design:type", Array)
], VehicleEntity.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: VEHICLE_CATEGORY, default: VEHICLE_CATEGORY.BUY_SELL }),
    __metadata("design:type", String)
], VehicleEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_blocked", default: false }),
    __metadata("design:type", Boolean)
], VehicleEntity.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], VehicleEntity.prototype, "uploader", void 0);
exports.VehicleEntity = VehicleEntity = __decorate([
    (0, typeorm_1.Entity)("vehicle")
], VehicleEntity);
