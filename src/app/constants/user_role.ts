export const USER_ROLE = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type TUserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];
