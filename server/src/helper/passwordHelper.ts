import bcrytp from "bcryptjs";

//generating the hash password
const hashPassword = async (password: string) => {
  const salt = await bcrytp.genSalt(10);
  return await bcrytp.hash(password, salt);
};

const comparePassword = async (password: string, hashPassword: string) => {
  return await bcrytp.compare(password, hashPassword);
};

export { comparePassword, hashPassword };
