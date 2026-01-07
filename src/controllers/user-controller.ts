import { Request, Response } from "express";
import { prisma } from "../database/prisma.js";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError.js";
import { registerSchema, loginSchema } from "../validation/user-schema.js";
import { authConfig } from "../configs/auth.js";
import jwt from "jsonwebtoken";

export class UserController {
  /// :: Register Controller
  async register(req: Request, res: Response) {
    const isValidBody = registerSchema.safeParse(req.body);

    if (!isValidBody.success) {
      throw isValidBody.error;
    }

    const { name, email, password } = isValidBody.data;

    const isEmailAlreadyRegistred = await prisma.user.findFirst({
      where: { email },
    });

    if (isEmailAlreadyRegistred != null) {
      throw new AppError("Email already registred", 409);
    }

    if (password.length > 12) {
      throw new AppError("Password must be at most 12 characters", 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({ message: "User registered" });
  }

  /// :: Login Controller
  async login(req: Request, res: Response) {
    const isValidBody = loginSchema.safeParse(req.body);

    if (!isValidBody.success) {
      throw isValidBody.error;
    }

    const { email, password } = isValidBody.data;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user == null) {
      throw new AppError("Email or/and password not registered", 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Email or/and password not registered", 401);
    }

    const { secretKey, expiresIn } = authConfig.jwt;

    const token = jwt.sign({ role: user.role }, secretKey, {
      expiresIn,
      subject: String(user.id),
      algorithm: "HS256",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful" });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logout successful" });
  }

  async render(req: Request, res: Response) {
    return res.sendFile("login.html", { root: "src/pages" });
  }
}
