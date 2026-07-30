import { Request, Response } from "express";
import { UserServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: result,
  });
};

export const UserControllers = {
  createUser,
};