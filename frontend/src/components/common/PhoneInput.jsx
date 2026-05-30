import React from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import {
  getPhoneValidationState,
} from "../../lib/phone";

const PhoneInput = ({
  id,
  label = "Phone Number",
  value = "",
  onChange,
  placeholder = "e.g., 9841234567",
  error,
  helperText,
  className,
  inputClassName,
  disabled = false,
  required = false,
  showCountryCode = true,
  showValidationIndicator = true,
  ...props
}) => {
  const phoneState = getPhoneValidationState(value);
  const displayMessage = error || (phoneState.isValid ? "" : phoneState.message) || helperText || "";
  const showMessage = Boolean(error || helperText || (phoneState.message && !phoneState.isValid));

  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label htmlFor={id} className="flex items-center gap-1.5">
          <span>{label}</span>
          {required ? <span className="text-red-500">*</span> : null}
        </Label>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="flex flex-1 items-stretch">
          {showCountryCode ? (
            <div className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-600">
              +977
            </div>
          ) : null}
          <Input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            pattern="^9[678]\d{8}$"
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={Boolean(error) || (phoneState.message && !phoneState.isValid)}
            className={cn(
              showCountryCode ? "rounded-l-none" : "",
              phoneState.isValid ? "border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500" : "",
              (error || (phoneState.message && !phoneState.isValid)) ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500" : "",
              inputClassName,
            )}
            {...props}
          />
        </div>

        {phoneState.isValid && showValidationIndicator ? (
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 sm:shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>Valid phone number</span>
          </div>
        ) : null}
      </div>

      {showMessage ? (
        <p
          className={cn(
            "text-xs min-h-[1rem]",
            error || (phoneState.message && !phoneState.isValid && phoneState.tone === "error")
              ? "text-red-600"
              : phoneState.tone === "warning"
                ? "text-amber-600"
                : "text-gray-500",
          )}
        >
          {displayMessage}
        </p>
      ) : (
        <p className="text-xs min-h-[1rem] text-transparent">.</p>
      )}
    </div>
  );
};

export default PhoneInput;