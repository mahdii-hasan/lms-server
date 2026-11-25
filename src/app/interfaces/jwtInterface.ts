import { JwtPayload } from "jsonwebtoken";
export interface IAccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  typ: "access";
}

export interface IRefreshTokenPayload {
  id: string;
  sid: string;
  jti: string;
  typ: "refresh";
}