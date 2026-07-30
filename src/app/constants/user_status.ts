export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type TUserStatus =
  (typeof USER_STATUS)[keyof typeof USER_STATUS];