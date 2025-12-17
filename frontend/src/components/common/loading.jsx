import React from "react";
import tyre from "../../assets/images/tyre.png";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <img src={tyre} className="w-40 h-40 animate-spin" />
    </div>
  );
}

export default Loading;
