import { Request, Response, NextFunction } from "express";
import { fn, col } from "sequelize";

import Participant from "../models/participant";
import Session from "../models/session";

export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fetchLimit, fetchOffset } = req.query;
    const actualUserId = parseInt(req.params.userId as string, 10);
    const actualFetchLimit = parseInt(fetchLimit as string, 10);
    const actualFetchOffset = parseInt(fetchOffset as string, 10);
    const { rows, count } = await Session.findAndCountAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
        include: [
          [
            fn("COUNT", col("fk_session_participants.user_id")),
            "participantCount",
          ],
        ],
      },
      limit: actualFetchLimit,
      offset: actualFetchOffset > 0 ? actualFetchLimit * actualFetchOffset : 0,
      order: [["updatedAt", "DESC"]],
      group: ["sessions.id"],
      include: [
        {
          model: Participant,
          as: "participants",
          where: { userId: actualUserId },
          attributes: [],
          required: true,
          duplicating: false,
        },
        {
          model: Participant,
          as: "fk_session_participants",
          attributes: [],
          required: true,
          duplicating: false,
        },
      ],
    });
    if (count.length > 0) {
      res.status(200).json({ rows, count: count.length });
    } else {
      res.status(200).json({ count });
    }
  } catch (err) {
    if (err instanceof Error) {
      next(err);
    }
  }
};
