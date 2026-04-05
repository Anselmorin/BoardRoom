"use client";

interface UserAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  photo?: string;
  onClick?: () => void;
}

export default function UserAvatar({
  name,
  color,
  size = "md",
  photo,
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

  const borderStyle = { borderColor: color, borderWidth: 2, borderStyle: "solid" as const };

  const classes = `${sizeClasses[size]} rounded-full shadow-md transition-transform overflow-hidden ${
    onClick ? "hover:scale-105 cursor-pointer" : ""
  }`;

  const inner = photo ? (
    <img src={photo} alt={name} className="w-full h-full object-cover" />
  ) : (
    <span className="font-bold text-white flex items-center justify-center w-full h-full" style={{ fontSize: "inherit" }}>{initials}</span>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={classes}
        style={{ backgroundColor: photo ? undefined : color, ...borderStyle }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={classes} style={{ backgroundColor: photo ? undefined : color, ...borderStyle }}>
      {inner}
    </div>
  );
}
