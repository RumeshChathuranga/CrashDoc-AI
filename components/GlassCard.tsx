import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl border border-white/10 
        bg-white/5 backdrop-blur-xl shadow-2xl 
        transition-all duration-500 ease-out
        ${
          hoverEffect
            ? "hover:bg-white/10 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-1 cursor-pointer"
            : ""
        }
        ${className}
      `}
    >
      {/* Inner sheen effect */}
      <div className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine transition-opacity" />
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      {children}
    </div>
  );
};

export default GlassCard;
