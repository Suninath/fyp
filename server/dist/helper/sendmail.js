"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendMail = (email, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    // ✅ Fix: Define email as string[]
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.USER_NAME,
                pass: process.env.PASSWORD,
            },
        });
        transporter === null || transporter === void 0 ? void 0 : transporter.verify((error, success) => {
            if (error) {
                console.log(error);
            }
            else {
                const mailOptions = {
                    from: process.env.USER_NAME,
                    to: email.join(", "),
                    subject: subject,
                    html: message,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("✅ Email sent: " + info.response);
                    }
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        console.log("❌ Error sending email");
    }
});
exports.default = sendMail;
