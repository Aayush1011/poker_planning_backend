import { Router } from "express";
import { body } from "express-validator";

import { isAuth } from "../middlewares/is-auth";
import { createSession } from "../controllers/sessionController";
import { handleValidatorErrors } from "../middlewares/handle-validator-errors";

const sessionRoutes = Router();

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
  handleValidatorErrors,
  isAuth,
  createSession
);

export default sessionRoutes;
