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
exports.AppointmentEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../utils/base.entity");
const user_entity_1 = require("./user.entity");
const vehicle_entity_1 = require("./vehicle.entity");
let AppointmentEntity = class AppointmentEntity extends base_entity_1.BaseEntity {
};
exports.AppointmentEntity = AppointmentEntity;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], AppointmentEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id" }),
    __metadata("design:type", Number)
], AppointmentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], AppointmentEntity.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "seller_id" }),
    __metadata("design:type", Number)
], AppointmentEntity.prototype, "sellerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vehicle_entity_1.VehicleEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", vehicle_entity_1.VehicleEntity)
], AppointmentEntity.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "vehicle_id" }),
    __metadata("design:type", Number)
], AppointmentEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "appointment_date", type: "date" }),
    __metadata("design:type", Date)
], AppointmentEntity.prototype, "appointmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "appointment_time", type: "time" }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "appointmentTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AppointmentEntity.prototype, "status", void 0);
exports.AppointmentEntity = AppointmentEntity = __decorate([
    (0, typeorm_1.Entity)("appointment")
], AppointmentEntity);
