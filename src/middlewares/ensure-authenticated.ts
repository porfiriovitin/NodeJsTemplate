import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { authConfig } from "../configs/auth.js";

interface TokenPayload extends JwtPayload {
  role: string;
}

/// :: Middleware to ensure the user is authenticated via JWT token.
export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token;

  if (!token) {
    throw new AppError("JWT token is missing", 401);
  }

  try {
    const { secretKey } = authConfig.jwt;
    const decoded = jwt.verify(token, secretKey) as TokenPayload;
    req.user = {
      id: Number(decoded.sub!),
      role: decoded.role,
    };
    return next();
  } catch {
    throw new AppError("Invalid JWT token", 401);
  }
}
