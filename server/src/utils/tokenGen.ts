import jwt from "jsonwebtoken";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error("Token environment variables not set");
}

export const genAccessToken = (payload: Object) => {
  const token = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "1h",
  });
  return token;
};

export const genRefreshToken = (payload: Object) => {
  const token = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "7d",
  });
  return token;
};

export const verifyToken = (token: string, secret: string) => {
  if (!secret) {
    throw new Error("SECRET_KEY is not defined in the environment");
  }

  return jwt.verify(token, secret);
};
