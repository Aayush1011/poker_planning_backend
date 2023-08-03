import { Request, Response, NextFunction } from "express";
import { validationResult, Result } from "express-validator";

import Session from "../models/session";
import { CustomError } from "../utils/error";
import Participant from "../models/participant";

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionId = req.params.sessionId;
  try {
    const session = await Session.findOne({
      where: { id: sessionId, status: "active" },
    });
    if (session) {
      res.status(200).json({
        message: "session retrieved",
        name: session.name,
        description: session.description,
        status: "active",
      });
    } else {
      throw new CustomError(404, "Session not found");
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("create session");
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Result<string> = errors.formatWith(
      (err) => err.msg as string
    );
    const error = new CustomError(
      422,
      "Validation failed",
      formattedErrors.array()
    );
    next(error);
    return;
  }
  const { name, description }: { name: string; description: string } = req.body;
  try {
    const result = await Session.create({ name, description });
    if (result) {
      res.status(201).json({ message: "new session created", id: result.id });
    } else {
      throw new CustomError(500, "Internal server error");
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export interface AddParticipantRequestBody {
  role: string;
}

export const addParticipant = async (
  req: Request<any, {}, AddParticipantRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.body;
    const actualUserId = parseInt(req.params.userId as string, 10);
    const [participant, created] = await Participant.findOrCreate({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        userId: actualUserId,
        sessionId: req.params.sessionId as string,
      },
      defaults: {
        userId: actualUserId,
        sessionId: req.params.sessionId as string,
        role,
      },
    });
    console.log(participant, created);

    if (!created) {
      throw new CustomError(409, "user has already joined session");
    }
    if (participant && created) {
      res.status(201).json({ message: "new participant added" });
    } else {
      throw new CustomError(500, "Internal server error");
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};
