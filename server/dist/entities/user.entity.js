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
exports.UserEntity = void 0;
const typeorm_1 = require("typeorm");
const auth_entity_1 = require("./auth.entity");
const base_entity_1 = require("../utils/base.entity");
let UserEntity = class UserEntity extends base_entity_1.BaseEntity {
};
exports.UserEntity = UserEntity;
__decorate([
    (0, typeorm_1.Column)({ name: "name", length: 100, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "store_name", length: 100, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "storeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "phonenumber", length: 50, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "phone", length: 50, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "address", type: "text", nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "profile_image", type: "text", nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pan_number", length: 50, nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "panNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "company_registration_doc", type: "text", nullable: true }),
    __metadata("design:type", String)
], UserEntity.prototype, "companyRegistrationDoc", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_status", default: false }),
    __metadata("design:type", Boolean)
], UserEntity.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => auth_entity_1.AuthEntity, (auth) => auth.user),
    __metadata("design:type", auth_entity_1.AuthEntity)
], UserEntity.prototype, "auth", void 0);
exports.UserEntity = UserEntity = __decorate([
    (0, typeorm_1.Entity)("users")
], UserEntity);
