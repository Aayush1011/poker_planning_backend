import { Router } from "express";
import { body, param, query } from "express-validator";

import {
  signup,
  login,
  refreshJwt,
  getUserSessions,
} from "../controllers/userController";

const userRoutes = Router();

const passwordValidator = () =>
  body("password")
    .notEmpty()
    .withMessage("Password must be provided")
    .bail()
    .isLength({ min: 5, max: 16 })
    .withMessage("Password has to be between 5 to 16 characters in length");

userRoutes.put("/signup", [passwordValidator()], signup);

userRoutes.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email cannot be empty")
      .bail()
      .isEmail()
      .withMessage("Enter a valid email address"),
    passwordValidator(),
  ],
  login
);

userRoutes.post("/refresh-jwt", refreshJwt);

userRoutes.get(
  "/:userId/sessions",
  [param("userId").isInt(), query(["fetchLimit", "fetchOffset"]).isInt()],
  getUserSessions
);

export default userRoutes;
