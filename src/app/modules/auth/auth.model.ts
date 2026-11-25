import { model, Schema } from "mongoose";
import { IAuthSession } from "./auth.interface";

const authSessionSchema = new Schema<IAuthSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    currentJti: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
    absoluteExpiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },

    replacedBySessionId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    userAgent: {
      type: String,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Automatically remove expired sessions eventually.
// TTL cleanup is asynchronous; application logic must check expiresAt too.
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Useful for user session listing and management.
authSessionSchema.index({
  userId: 1,
  revokedAt: 1,
  expiresAt: 1,
});

export const AuthSession = model<IAuthSession>(
  "AuthSession",
  authSessionSchema,
);
