import { verifyToken } from "./auth";
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: unknown;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: unknown) {
    return res.status(401).json({ error: "Token invalide" });
  }
}
