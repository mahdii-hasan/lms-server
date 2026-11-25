import { z } from "zod";
import {AuthValidation} from "./auth.validation";
import { Types } from "mongoose";

const {loginValidationSchema} = AuthValidation;

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export type ILoginPayload = z.infer<typeof loginValidationSchema>["body"];

export interface IAuthSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  currentJti: string;
  expiresAt: Date;
  absoluteExpiresAt: Date;
  revokedAt: Date | null;
  replacedBySessionId: Types.ObjectId | null;
  userAgent?: string;
  ipAddress?: string;
}
export interface ILoginMetadata {
  userAgent?: string;
  ipAddress?: string;
}