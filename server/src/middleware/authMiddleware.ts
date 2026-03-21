import { NextFunction, Request, Response } from "express";
import { verifyToken, genAccessToken } from "../utils/tokenGen";

const extractAccessToken = (req: Request) => {
  let accessToken = req.cookies?.access_token;

  if (!accessToken) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
    }
  }

  return accessToken;
};

export const authenticationMiddeware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get token from cookies or Authorization header
  let accessToken = req.cookies?.access_token;
  let refreshToken = req.cookies?.refresh_token;
  let isHeaderAuth = false;

  // If not in cookies, check Authorization header
  if (!accessToken) {
    const authHeader = req.headers.authorization;
    console.log("🔍 Authorization header:", authHeader ? "Present" : "Missing");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7); // Remove "Bearer " prefix
      isHeaderAuth = true; // Using header-based auth (stateless)
      console.log("✅ Token extracted from Authorization header");
    }
  } else {
    console.log("✅ Token found in cookies");
  }

  if (!accessToken) {
    console.log("❌ No token found in cookies or Authorization header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Only require refresh token for cookie-based auth, not header-based
  if (!isHeaderAuth && !refreshToken) {
    console.log("❌ No refresh token found (cookie-based auth)");
    return res
      .status(401)
      .json({ message: "Session expired please login again" });
  }

  try {
    const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    console.log("✅ Token verified successfully for user:", decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error instanceof Error ? error.message : error);
    
    // If using header-based auth, don't try to refresh
    if (isHeaderAuth) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Try to refresh token only if we have a refresh token (cookie-based auth)
    if (!refreshToken) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const decodedRefresh = verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );

      const newAccessToken = genAccessToken(decodedRefresh);

      const isProd = process.env.NODE_ENV === "production";
      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });

      req.user = decodedRefresh;
      console.log("✅ Token refreshed successfully");
      next();
    } catch (refreshError) {
      console.error("❌ Refresh token failed:", refreshError instanceof Error ? refreshError.message : refreshError);
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

export const optionalAuthenticationMiddeware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const accessToken = extractAccessToken(req);

  if (!accessToken) {
    return next();
  }

  try {
    const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded;
  } catch {
    // Ignore invalid token for optional auth routes.
  }

  return next();
};
