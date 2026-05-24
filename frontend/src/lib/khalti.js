export const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY || "";
export const KHALTI_API_URL = import.meta.env.VITE_KHALTI_API_URL || "https://dev.khalti.com/api/v2";

export const isKhaltiSandbox = KHALTI_PUBLIC_KEY.startsWith("test_public_key_") || KHALTI_API_URL.includes("dev.khalti.com");
