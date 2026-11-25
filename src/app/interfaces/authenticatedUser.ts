import { Types } from "mongoose";

export interface IAuthenticatedUser {
  id: string;
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
}