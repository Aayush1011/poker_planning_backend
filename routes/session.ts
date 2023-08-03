import { Router } from "express";
import { body, param } from "express-validator";

import { isAuth } from "../middlewares/is-auth";
import {
  addParticipant,
  createSession,
  getSession,
} from "../controllers/sessionController";

const sessionRoutes = Router();

sessionRoutes.get("/:sessionId", isAuth, getSession);

sessionRoutes.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .bail()
      .isLength({ max: 24, min: 5 })
      .withMessage("Name should be between 5 to 24 characters long"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty")
      .bail()
      .isLength({ max: 255, min: 10 })
      .withMessage("Description should be between 10 to 255 characters long"),
  ],
  isAuth,
  createSession
);

sessionRoutes.post(
  "/:sessionId/user/:userId",
  [
    param("sessionId").isUUID(),
    param("userId").isInt(),
    body("role").trim().toLowerCase().isIn(["moderator", "member"]),
  ],
  isAuth,
  addParticipant
);

export default sessionRoutes;
