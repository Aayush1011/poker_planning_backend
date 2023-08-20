import { Router } from "express";
import { body, param, query } from "express-validator";

import { signup, login, refreshJwt } from "../controllers/authController";
import { handleValidatorErrors } from "../middlewares/handle-validator-errors";

const authRoutes = Router();

const passwordValidator = () =>
  body("password")
    .notEmpty()
    .withMessage("Password must be provided")
    .bail()
    .isLength({ min: 5, max: 16 })
    .withMessage("Password has to be between 5 to 16 characters in length");

authRoutes.put("/signup", [passwordValidator()], handleValidatorErrors, signup);

authRoutes.post(
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
  handleValidatorErrors,
  login
);

authRoutes.post("/refresh-jwt", refreshJwt);

export default authRoutes;
