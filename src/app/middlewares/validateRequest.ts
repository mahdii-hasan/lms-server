import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const validateRequest =
  (schema: z.ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    });

    next();
  };

export default validateRequest;
