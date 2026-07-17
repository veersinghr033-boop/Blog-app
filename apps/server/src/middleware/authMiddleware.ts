import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { normalizeRoles } from "../utils/roles";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const label = `verifyToken-${Date.now()}-${Math.random()}`;

    console.time(label);

    // verify logic

    let token: string | undefined;
    
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    
    req.user = decoded;
    
    next();
    console.timeEnd(label);
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = normalizeRoles(
      typeof req.user === "object" && req.user !== null
        ? (req.user as JwtPayload).roles ?? (req.user as JwtPayload).role
        : undefined,
    );

    const userRole = userRoles[0];

    if (!userRoles.some((role) => roles.includes(role))) {
      return res.status(403).json({
        message: `Role (${userRole ?? "unknown"}) is not allowed`,
      });
    }

    next();
  };
};
