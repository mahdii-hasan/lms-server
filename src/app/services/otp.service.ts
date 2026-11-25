import secretCompare from "../utils/secretCompare";
import generateOtp from "../utils/generateOtp";
import secretHash from "../utils/secretHash";

export interface TOtpPayload {
  otp: string;
  hashedOtp: string;
  expiresAt: Date;
}

class OtpService {
  generate(expireInMinutes = 10): TOtpPayload {
    const otp = generateOtp();

    const hashedOtp = secretHash(otp);

    const expiresAt = new Date(Date.now() + expireInMinutes * 60 * 1000);

    return {
      otp,
      hashedOtp,
      expiresAt,
    };
  }

  isExpired(expireAt: Date): boolean {
    return Date.now() > expireAt.getTime();
  }
  compareOtp(plainOtp: string, hashedOtp: string): boolean {
    return secretCompare(plainOtp, hashedOtp);
  }
}

const otpService = new OtpService();

export default otpService;
