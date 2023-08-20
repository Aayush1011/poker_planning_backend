require("dotenv").config({ path: __dirname + "/../.env" });

import { sign, Secret, Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { validationResult, Result } from "express-validator";
import { randomUUID, randomBytes } from "crypto";

import { User } from "../models/user";
import { CustomError } from "../utils/error";
import { sha256 } from "../utils/sha256";
import { JwtClaims, LogInRequestBody, SignUpRequestBody } from "../types";

export const FINGERPRINT_COOKIE_NAME = "__User-Fgp";
export const FINGERPRINT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 * 1000; // 30 days
export const REFRESH_TOKEN_COOKIE_NAME = "__User-Refr-Tok";
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 * 1000; // 30 days

export const signup = async (
  req: Request<any, {}, SignUpRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, userName, password, confirmPassword } = req.body;
    if (password === confirmPassword) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await User.create({
        email,
        hashedPassword,
        userName,
      });
      if (result) {
        res.status(201).json({ message: "user created" });
      } else {
        throw new CustomError(500, "Internal server error");
      }
    } else {
      throw new CustomError(403, "Password and confirm password don't match");
    }
  } catch (error) {
    if (error instanceof Error || error instanceof CustomError) {
      next(error);
    }
  }
};

export const login = async (
  req: Request<any, {}, LogInRequestBody, {}>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      const error = new CustomError(
        401,
        "A user with this email could not be found"
      );
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.hashedPassword);
    if (!isEqual) {
      const error = new CustomError(401, "Wrong password");
      throw error;
    }

    const refreshToken = randomUUID();
    user.set({
      refreshToken,
      refreshTokenExpiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 1
      ).toISOString(),
    });

    await user.save();

    const fingerprint = randomBytes(50).toString("hex");
    const hashedFingerprint = sha256(fingerprint);
    const claims: JwtClaims = {
      userId: user.id,
      fingerprint: hashedFingerprint,
    };

    const token = sign(claims, process.env.TOKEN_SECRET as Secret, {
      expiresIn: 60 * 10,
    });

    res
      .status(200)
      .cookie(FINGERPRINT_COOKIE_NAME, fingerprint, {
        path: "/",
        maxAge: FINGERPRINT_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        path: "/",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        message: "Logged in successfully",
        token,
        userId: user.id,
        userName: user.userName,
      });
  } catch (err) {
    if (err instanceof CustomError) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
};

export const refreshJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fingerprint: fingerprintHash }: { fingerprint: string } = req.body;

  try {
    if (fingerprintHash) {
      const fingerprintCookie = req.cookies?.[FINGERPRINT_COOKIE_NAME];
      if (!fingerprintCookie) {
        const error = new CustomError(400, "Unable to refresh JWT token");
        throw error;
      }
      const fingerprintCookieHash = sha256(fingerprintCookie);
      if (fingerprintHash !== fingerprintCookieHash) {
        const error = new CustomError(400, "Unable to refresh JWT token");
        throw error;
      }
    }

    const refreshTokenCookie = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    const user = await User.findOne({
      where: { refreshToken: refreshTokenCookie },
    });
    if (!user) {
      const error = new CustomError(401, "User not found");
      throw error;
    }

    const newRefreshToken = randomUUID();
    user.set({
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30
      ).toISOString(),
    });

    await user.save();

    const newFingerprint = randomBytes(50).toString("hex");

    res
      .cookie(FINGERPRINT_COOKIE_NAME, newFingerprint, {
        path: "/",
        maxAge: FINGERPRINT_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
        path: "/",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

    const newToken = sign(
      {
        userId: user.id,
        fingerprint: sha256(newFingerprint),
      },
      process.env.TOKEN_SECRET as Secret,
      { expiresIn: "10m" }
    );

    res.status(200).json({
      message: "refresh successful",
      token: newToken,
    });
  } catch (err) {
    if (err instanceof CustomError) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
};
