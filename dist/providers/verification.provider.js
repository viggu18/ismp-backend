"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationProvider = void 0;
class PlaceholderVerificationProvider {
    async verifyPhone(phone) {
        return {
            isVerified: true,
            provider: "PLACEHOLDER",
            reference: `phone:${phone}:verified`,
        };
    }
    async verifyEmail(email) {
        return {
            isVerified: true,
            provider: "PLACEHOLDER",
            reference: `email:${email}:verified`,
        };
    }
}
exports.verificationProvider = new PlaceholderVerificationProvider();
