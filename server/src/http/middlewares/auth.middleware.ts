import { Response, NextFunction } from "express";
import { verifyJwt } from "../../util/jwt-auth.util.js";
import { AuthRequest } from "../types/auth-request.type.js";

export const isAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: "Missing token" });
  const token = hdr.replace("Bearer ", "");
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
