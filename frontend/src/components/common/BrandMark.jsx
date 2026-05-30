import React from "react";
import tyre from "../../assets/images/tyre.png";

const BrandMark = ({ size = 40, className = "", spin = false, alt = "Second Auto Gear" }) => {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <img
      src={tyre}
      alt={alt}
      className={`${spin ? "animate-spin" : ""} ${className}`.trim()}
      style={{ width: dimension, height: dimension }}
    />
  );
};

export default BrandMark;