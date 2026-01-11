import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";

const DebouncedInput = ({
  value,
  onChange,
  debounceMs = 500,
  placeholder,
  className,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs, value]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default DebouncedInput;