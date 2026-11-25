import crypto from "crypto";

const secretHash = (secret: string): string => {
  return crypto.createHash("sha256").update(secret).digest("hex");
};

export default secretHash;
