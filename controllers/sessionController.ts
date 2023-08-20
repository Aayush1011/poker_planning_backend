import { Request, Response, NextFunction } from "express";

import Session from "../models/session";
import { CustomError } from "../utils/error";
import Participant from "../models/participant";
import Story from "../models/story";
import { User } from "../models/user";
import {
  AddParticipantRequestBody,
  AddStoryRequestBody,
  EditStoryRequestBody,
} from "../types";
import { io } from "../utils/websocket";
import { col } from "sequelize";

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

export const addParticipant = async (
  req: Request<any, {}, AddParticipantRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role } = req.body;
    const actualUserId = parseInt(req.params.userId as string, 10);

    const [participant, created] = await Participant.findOrCreate({
      attributes: {
        include: [[col("fk_participant_user.userName"), "username"]],
      },
      where: {
        userId: actualUserId,
        sessionId: req.params.sessionId as string,
      },
      defaults: {
        userId: actualUserId,
        sessionId: req.params.sessionId as string,
        role,
      },
      include: {
        model: User,
        as: "fk_participant_user",
        where: { id: req.params.userId as unknown as number },
        attributes: [],
        required: true,
        duplicating: false,
      },
    });

    if (!created) {
      res
        .status(200)
        .json({
          message: "user has already joined session",
          role: participant.role,
        });
    } else if (created && participant) {
      res.status(201).json({ message: "new participant added", role });
    } else {
      throw new CustomError(500, "Internal server error");
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const addStory = async (
  req: Request<any, {}, AddStoryRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, name, description } = req.body;
    const user = Participant.findOne({
      where: {
        userId,
        sessionId: req.params.sessionId as string,
        role: "moderator",
      },
    });
    if (!user) {
      throw new CustomError(403, "Forbidden");
    }
    const story = await Story.create({
      sessionId: req.params.sessionId as string,
      userId,
      name,
      description,
    });
    if (!story) {
      throw new CustomError(500, "Internal Server Error");
    }
    io.getIO().in(req.params.sessionId).emit("story", {
      action: "add",
      id: story.id,
      name,
      description,
    });
    res.status(201).json({ message: "new story added", id: story.id });
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const getStories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stories = await Story.findAll({
      where: { sessionId: req.params.sessionId },
      attributes: ["id", "name", "description"],
      order: [["updated_at", "DESC"]],
    });
    if (stories) {
      res.status(200).json({ message: "stories fetched", stories });
    } else {
      res.status(200).json({ message: "no stories found" });
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const editStory = async (
  req: Request<any, {}, EditStoryRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const story = await Story.findByPk(req.params.storyId as number);
    if (!story) {
      throw new CustomError(404, "Not Found");
    }
    story.set({ name, description });
    const editedStory = await story.save();
    if (!editedStory) {
      throw new CustomError(500, "Internal Server Error");
    }
    io.getIO().in(req.params.sessionId).emit("story", {
      action: "edit",
      id: story.id,
      name,
      description,
    });
    res.status(200).json({ message: "story edited" });
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const deleteStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedStory = await Story.destroy({
      where: {
        sessionId: req.params.sessionId,
        id: req.params.storyId as unknown as number,
      },
    });
    if (!deletedStory) {
      throw new CustomError(400, "Bad Request");
    }
    io.getIO().in(req.params.sessionId).emit("story", {
      action: "delete",
      id: req.params.storyId,
    });
    res.status(200).json({ message: "story deleted" });
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};
