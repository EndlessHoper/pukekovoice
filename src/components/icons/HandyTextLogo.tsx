import React from "react";
import pukekoLogo from "@/assets/pukeko-logo.png";

const HandyTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  const resolvedWidth = width ?? 120;

  return (
    <img
      src={pukekoLogo}
      alt=""
      aria-hidden="true"
      className={className}
      style={{
        width: `${resolvedWidth}px`,
        height: height ? `${height}px` : "auto",
        display: "block",
      }}
    />
  );
};

export default HandyTextLogo;
