export const NEPALI_MOBILE_PHONE_REGEX = /^9[678]\d{8}$/;

export function isValidNepaliPhoneNumber(value?: string | null) {
  return NEPALI_MOBILE_PHONE_REGEX.test(String(value || "").trim());
}

export function getInvalidPhoneMessage() {
  return "Invalid phone number";
}