import crypto from "crypto";


export const createResetToken = () => {

  const token = crypto
    .randomBytes(32)
    .toString("hex");


  return token;

};