import { NextFunction, Request, Response } from "express";
import { verifyToken, genAccessToken } from "../utils/tokenGen";

export const authenticationMiddeware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;
  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Session expired please login again" });
  }

  try {
    const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);

    req.user = decoded;
    next();
  } catch (error) {
    // Try to refresh token
    try {
      const decodedRefresh = verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );

      const newAccessToken = genAccessToken(decodedRefresh);

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      req.user = decodedRefresh;
      next();
    } catch (refreshError) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

export const authorizationMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
