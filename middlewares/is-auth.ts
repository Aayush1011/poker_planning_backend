require("dotenv").config({ path: __dirname + "/../.env" });

import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { CustomError } from "../utils/error";
import { FINGERPRINT_COOKIE_NAME } from "../controllers/authController";
import { sha256 } from "../utils/sha256";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      const error = new CustomError(401, "Not authenticated");
      throw error;
    }

    const fingerprintCookie = req.cookies?.[FINGERPRINT_COOKIE_NAME];
    if (!fingerprintCookie) {
      const error = new CustomError(400, "Not authorized");
      throw error;
    }
    const fingerprintCookieHash = sha256(fingerprintCookie);
    const fingerprintHash: string = (jwt.decode(token) as JwtPayload)?.[
      "fingerprint"
    ];

    if (fingerprintHash !== fingerprintCookieHash) {
      const error = new CustomError(400, "Not authorized");
      throw error;
    }

    jwt.verify(token, process.env.TOKEN_SECRET as Secret, (err, decoded) => {
      if (err) {
        if (err?.name === "TokenExpiredError") {
          throw new CustomError(403, err.message);
        } else {
          throw new CustomError(401, "Not authenticated");
        }
      }
    });

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  }
};
