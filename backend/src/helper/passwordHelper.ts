import bycrypt from "bcryptjs";

export const hasdPassword = async (passowrd: string) => {
  const salt = await bycrypt.genSalt(24);
  return await bycrypt.hash(passowrd, salt);
};

export const comaprePassowrd = async (
  password: string,
  hashPassword: string
) => {
  return await bycrypt.compare(password, hashPassword);
};
