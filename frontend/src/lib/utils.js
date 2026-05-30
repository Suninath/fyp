import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Nepali Rupees
 * Uses the Nepali/Indian numbering system (lakhs, crores)
 * @param {number|string} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show Rs. symbol (default: true)
 * @returns {string} Formatted amount
 */
export function formatNPR(amount, showSymbol = true) {
  const num = parseFloat(amount);
  if (isNaN(num)) return showSymbol ? "Rs. 0" : "0";
  
  // Format using Nepali/Indian numbering system
  const formatted = num.toLocaleString('en-IN');
  return showSymbol ? `Rs. ${formatted}` : formatted;
}