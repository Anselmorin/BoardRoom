"use client";

interface UserAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function UserAvatar({
  name,
  color,
  size = "md",
  onClick,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  const classes = `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform ${
    onClick ? "hover:scale-105 cursor-pointer" : ""
  }`;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={classes}
        style={{ backgroundColor: color }}
      >
        {initials}
      </button>
    );
  }

  return (
    <div className={classes} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}
