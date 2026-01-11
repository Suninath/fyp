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
exports.UserOtpEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../utils/base.entity");
const user_entity_1 = require("./user.entity");
let UserOtpEntity = class UserOtpEntity extends base_entity_1.BaseEntity {
};
exports.UserOtpEntity = UserOtpEntity;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserOtpEntity.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], UserOtpEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: "CASCADE" }),
    __metadata("design:type", user_entity_1.UserEntity)
], UserOtpEntity.prototype, "user", void 0);
exports.UserOtpEntity = UserOtpEntity = __decorate([
    (0, typeorm_1.Entity)("user_otps")
], UserOtpEntity);
