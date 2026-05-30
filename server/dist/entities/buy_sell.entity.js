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
exports.BuySellEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../utils/base.entity");
const user_entity_1 = require("./user.entity");
const vehicle_entity_1 = require("./vehicle.entity");
let BuySellEntity = class BuySellEntity extends base_entity_1.BaseEntity {
};
exports.BuySellEntity = BuySellEntity;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], BuySellEntity.prototype, "buyer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "buyer_id" }),
    __metadata("design:type", Number)
], BuySellEntity.prototype, "buyerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], BuySellEntity.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "seller_id" }),
    __metadata("design:type", Number)
], BuySellEntity.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", vehicle_entity_1.VehicleEntity)
], BuySellEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "vehicle_id" }),
    __metadata("design:type", Number)
], BuySellEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BuySellEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "transaction_id", length: 255, nullable: true }),
    __metadata("design:type", String)
], BuySellEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], BuySellEntity.prototype, "status", void 0);
exports.BuySellEntity = BuySellEntity = __decorate([
    (0, typeorm_1.Entity)("buy_sell")
], BuySellEntity);
