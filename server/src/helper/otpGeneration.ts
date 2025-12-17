export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};

export const otpExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};
