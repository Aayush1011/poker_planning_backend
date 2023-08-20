import { NextFunction, Request, Response } from "express";
import { JwtPayload, decode } from "jsonwebtoken";
import { CustomError } from "../utils/error";
import Participant from "../models/participant";

export const isMod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    const userId: number = (decode(token!) as JwtPayload)["userId"];
    const moderator = await Participant.findOne({
      where: {
        sessionId: req.params.sessionId as string,
        userId,
        role: "moderator",
      },
    });
    if (!moderator) {
      throw new CustomError(403, "Forbidden");
    }
    next();
  } catch (error) {}
};
