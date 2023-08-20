import { Router } from "express";
import { param, query } from "express-validator";

import { getUserSessions } from "../controllers/userController";
import { handleValidatorErrors } from "../middlewares/handle-validator-errors";
import { isAuth } from "../middlewares/is-auth";

const usersRoutes = Router();

usersRoutes.get(
  "/:userId/sessions",
  [param("userId").isInt(), query(["fetchLimit", "fetchOffset"]).isInt()],
  handleValidatorErrors,
  isAuth,
  getUserSessions
);

export default usersRoutes;
