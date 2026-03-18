export type VerificationResult = {
  isVerified: boolean;
  provider: "PLACEHOLDER";
  reference: string;
};

export interface VerificationProvider {
  verifyPhone(phone: string): Promise<VerificationResult>;
  verifyEmail(email: string): Promise<VerificationResult>;
}

class PlaceholderVerificationProvider implements VerificationProvider {
  async verifyPhone(phone: string): Promise<VerificationResult> {
    return {
      isVerified: true,
      provider: "PLACEHOLDER",
      reference: `phone:${phone}:verified`,
    };
  }

  async verifyEmail(email: string): Promise<VerificationResult> {
    return {
      isVerified: true,
      provider: "PLACEHOLDER",
      reference: `email:${email}:verified`,
    };
  }
}

export const verificationProvider = new PlaceholderVerificationProvider();
