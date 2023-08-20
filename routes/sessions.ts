import { Router } from "express";
import { body, param } from "express-validator";

import { isAuth } from "../middlewares/is-auth";
import {
  addParticipant,
  addStory,
  deleteStory,
  editStory,
  getSession,
  getStories,
} from "../controllers/sessionController";
import { isMod } from "../middlewares/is-mod";
import { handleValidatorErrors } from "../middlewares/handle-validator-errors";

const sessionsRoutes = Router();

const storyValidator = () => [
  param("sessionId").isUUID(),
  body(["name", "description"])
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Please provide complete story details"),
];

sessionsRoutes.get(
  "/:sessionId",
  [param("sessionId").isUUID()],
  handleValidatorErrors,
  isAuth,
  getSession
);

sessionsRoutes.post(
  "/:sessionId/users/:userId",
  [
    param("sessionId").isUUID(),
    param("userId").isInt(),
    body("role").trim().toLowerCase().isIn(["moderator", "member"]),
  ],
  handleValidatorErrors,
  isAuth,
  addParticipant
);

sessionsRoutes.post(
  "/:sessionId/story",
  storyValidator(),
  [body("userId").notEmpty().isInt()],
  handleValidatorErrors,
  isAuth,
  isMod,
  addStory
);

sessionsRoutes.get(
  "/:sessionId/stories",
  [param("sessionId").isUUID()],
  handleValidatorErrors,
  isAuth,
  getStories
);

sessionsRoutes.put(
  "/:sessionId/stories/:storyId",
  storyValidator(),
  [param("storyId").isInt()],
  handleValidatorErrors,
  isAuth,
  isMod,
  editStory
);

sessionsRoutes.delete(
  "/:sessionId/stories/:storyId",
  [param("sessionId").isUUID(), param("storyId").isInt()],
  handleValidatorErrors,
  isAuth,
  isMod,
  deleteStory
);

export default sessionsRoutes;
