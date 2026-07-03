interface UnishipLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  lightText?: boolean;
}

export default function UnishipLogo({
  className = "",
  size = "md",
  showText = true,
  lightText = false,
}: UnishipLogoProps) {
  const dimensions = {
    sm: { height: 28, fontSize: "1.1rem" },
    md: { height: 34, fontSize: "1.35rem" },
    lg: { height: 46, fontSize: "1.8rem" },
    xl: { height: 60, fontSize: "2.3rem" },
  }[size];

  const textColor = lightText ? "#FFFFFF" : "var(--text-primary)";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        height={dimensions.height}
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="u-blue-grad" x1="20" y1="40" x2="90" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E65A6" />
            <stop offset="100%" stopColor="#0E2746" />
          </linearGradient>

          <linearGradient id="arrow-orange-grad" x1="10" y1="120" x2="140" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F27A17" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          <linearGradient id="box-grad" x1="85" y1="50" x2="110" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFA726" />
            <stop offset="100%" stopColor="#F27A17" />
          </linearGradient>
        </defs>

        {/* U Body in Navy Blue Gradient */}
        <path
          d="M 38 35 C 38 25, 52 25, 52 35 L 52 82 C 52 105, 78 105, 78 82 L 78 68 C 78 60, 92 60, 92 68 L 92 82 C 92 120, 38 120, 38 82 Z"
          fill="url(#u-blue-grad)"
        />

        {/* Orange Swoosh Arrow wrapping around the U */}
        <path
          d="M 12 110 C 10 75, 30 50, 60 46 C 75 44, 95 40, 142 22 L 126 48 L 142 42 L 132 20 Z"
          fill="url(#arrow-orange-grad)"
        />

        {/* Shipping Box on the Arrow */}
        <polygon points="82,50 98,42 114,50 98,58" fill="url(#box-grad)" />
        <polygon points="82,50 98,58 98,72 82,64" fill="#E65100" opacity="0.9" />
        <polygon points="114,50 98,58 98,72 114,64" fill="#F27A17" />
        <line x1="98" y1="42" x2="98" y2="58" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {showText && (
        <span
          className="font-black tracking-tight italic select-none"
          style={{
            fontSize: dimensions.fontSize,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: textColor,
          }}
        >
          UNISHIP
        </span>
      )}
    </div>
  );
}
