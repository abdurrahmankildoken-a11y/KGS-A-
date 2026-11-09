import React from 'react';

interface GeminiLogoProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const GeminiLogo: React.FC<GeminiLogoProps> = ({
  className = '',
  size = 28,
  animate = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 ${animate ? 'animate-pulse scale-105' : ''}`}
      >
        <defs>
          <linearGradient id="kgd_gemini_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285F4" />
            <stop offset="35%" stopColor="#9B72CF" />
            <stop offset="70%" stopColor="#D96570" />
            <stop offset="100%" stopColor="#1EA1F2" />
          </linearGradient>
          <radialGradient id="kgd_gemini_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9B72CF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer subtle glow */}
        {animate && (
          <circle cx="12" cy="12" r="10" fill="url(#kgd_gemini_glow)" className="opacity-40 animate-ping" />
        )}

        {/* Gemini 4-point curved star */}
        <path
          d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
          fill="url(#kgd_gemini_grad)"
        />
        <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" fillOpacity="0.9" />
      </svg>
    </div>
  );
};
