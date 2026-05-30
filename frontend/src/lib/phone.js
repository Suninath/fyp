export const NEPALI_MOBILE_PHONE_REGEX = /^9[678]\d{8}$/;

export function sanitizePhoneNumber(value = "") {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);
}

export function isValidNepaliPhoneNumber(value = "") {
  return NEPALI_MOBILE_PHONE_REGEX.test(String(value || "").trim());
}

export function getPhoneValidationState(value = "") {
  const rawValue = String(value || "").trim();
  const phoneNumber = sanitizePhoneNumber(value);

  if (!rawValue) {
    return {
      isValid: false,
      message: "",
      tone: "empty",
    };
  }

  if (!phoneNumber) {
    return {
      isValid: false,
      message: "Invalid phone number",
      tone: "error",
    };
  }

  if (phoneNumber.length < 10) {
    return {
      isValid: false,
      message: `Phone number must be 10 digits (${phoneNumber.length}/10)`,
      tone: "warning",
    };
  }

  if (!isValidNepaliPhoneNumber(phoneNumber)) {
    return {
      isValid: false,
      message: "Invalid phone number",
      tone: "error",
    };
  }

  return {
    isValid: true,
    message: "Valid phone number",
    tone: "success",
  };
}

export function formatPhoneNumber(value = "") {
  const trimmedValue = String(value || "").trim();
  const phoneNumber = sanitizePhoneNumber(trimmedValue);

  if (!isValidNepaliPhoneNumber(phoneNumber)) {
    return trimmedValue;
  }

  return `+977 ${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
}