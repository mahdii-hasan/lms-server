import crypto from "crypto";


export const generateToken = (): string => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return resetToken;
};
