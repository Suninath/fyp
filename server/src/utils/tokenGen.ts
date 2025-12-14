import jwt from "jsonwebtoken";

const accessToken = process.env.ACCESS_TOKEN;
const refreshToken = process.env.REFRESH_TOKEN;

if (!accessToken || !refreshToken) {
  throw new Error("Not token enviroment variable set");
}

export const genAcccessToken = (payload: Object) => {
  const token = jwt.sign(payload, accessToken, {
    expiresIn: "1h",
  });
  return token;
};

export const genRefreshToken = (payload: Object) => {
  const token = jwt.sign(payload, refreshToken, {
    expiresIn: "1h",
  });
  return token;
};

export const verifyToken = (token: string, secret: string) => {
  if (!secret) {
    return {
      status: false,
      code: 500,
      message: "SECRET_KEY is not define int he environment",
    };
  }

  return jwt.sign(token, secret);
};
