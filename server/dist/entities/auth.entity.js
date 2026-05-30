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
exports.AuthEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../utils/base.entity");
const enums_1 = require("../constant/enums");
const user_entity_1 = require("./user.entity");
let AuthEntity = class AuthEntity extends base_entity_1.BaseEntity {
};
exports.AuthEntity = AuthEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AuthEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AuthEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: enums_1.USER_ROLE, default: enums_1.USER_ROLE.USER }),
    __metadata("design:type", String)
], AuthEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email_verified", default: false }),
    __metadata("design:type", Boolean)
], AuthEntity.prototype, "emailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "account_verified", default: false }),
    __metadata("design:type", Boolean)
], AuthEntity.prototype, "accountVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "is_blocked", default: false }),
    __metadata("design:type", Boolean)
], AuthEntity.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "verification_rejected", default: false }),
    __metadata("design:type", Boolean)
], AuthEntity.prototype, "verificationRejected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "rejection_reason", nullable: true }),
    __metadata("design:type", String)
], AuthEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.UserEntity, user => user.auth),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }) // 🔑 FK HERE
    ,
    __metadata("design:type", user_entity_1.UserEntity)
], AuthEntity.prototype, "user", void 0);
exports.AuthEntity = AuthEntity = __decorate([
    (0, typeorm_1.Entity)("auth")
], AuthEntity);
