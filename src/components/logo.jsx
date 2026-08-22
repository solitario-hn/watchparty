import React from "react";

export default function WFillLogo({ size = 45, ring = true, className = "" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {ring && (
        <div
          className="absolute rounded-full border border-dashed border-[#33475C] opacity-55 animate-w-spin"
          style={{ width: size * 1.2, height: size * 1.2 }}
        />
      )}

      <svg
        viewBox="0 0 120 120"
        className="relative z-10"
        style={{ width: size * 0.87, height: size * 0.87, overflow: "visible" }}
      >
        <defs>
          <clipPath id="wFillClip">
            <rect x="0" y="0" width="0" height="120">
              <animate
                attributeName="width"
                values="0;130;130;0"
                keyTimes="0;0.45;0.85;1"
                dur="3s"
                repeatCount="indefinite"
              />
            </rect>
          </clipPath>
        </defs>

        <path
          d="M15,35 C22,55 28,75 35,90 C45,80 52,65 60,55 C68,65 75,80 85,90 C92,75 98,55 105,35"
          fill="none"
          stroke="#33475C"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* <polygon points="113,38 96,32 113,12" fill="#33475C" /> */}

        <g clipPath="url(#wFillClip)">
          <path
            d="M15,35 C22,55 28,75 35,90 C45,80 52,65 60,55 C68,65 75,80 85,90 C92,75 98,55 105,35"
            fill="none"
            stroke="#4FA8E8"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon
            points="113,38 96,32 113,12"
            fill="#4FA8E8"
            className="animate-w-tip-glow"
          />
        </g>
      </svg>

      <style>{`
        @keyframes w-spin { to { transform: rotate(360deg); } }
        .animate-w-spin { animation: w-spin 10s linear infinite; }

        @keyframes w-tip-glow {
          0%, 30%  { filter: drop-shadow(0 0 0 transparent); }
          45%      { filter: drop-shadow(0 0 8px rgba(79,168,232,0.55)); }
          65%      { filter: drop-shadow(0 0 8px rgba(79,168,232,0.55)); }
          85%,100% { filter: drop-shadow(0 0 0 transparent); }
        }
        .animate-w-tip-glow { animation: w-tip-glow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
