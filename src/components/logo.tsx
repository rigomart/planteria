import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 48, ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planteria logo"
      role="img"
      {...props}
    >
      {/* Central stem/trunk */}
      <line
        x1="50"
        y1="75"
        x2="50"
        y2="20"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Branch nodes - representing plan hierarchy */}
      {/* Top node */}
      <circle cx="50" cy="25" r="5" fill="currentColor" />

      {/* Middle left branch */}
      <line
        x1="50"
        y1="45"
        x2="30"
        y2="35"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="30" cy="35" r="4" fill="currentColor" />

      {/* Middle right branch */}
      <line
        x1="50"
        y1="55"
        x2="70"
        y2="45"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="70" cy="45" r="4" fill="currentColor" />

      {/* Lower left branch */}
      <line
        x1="50"
        y1="65"
        x2="35"
        y2="60"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="35" cy="60" r="4" fill="currentColor" />

      {/* Base root node */}
      <circle cx="50" cy="75" r="4" fill="currentColor" />
    </svg>
  );
}

export function LogoWithText({
  className,
  size = 32,
  showText = true,
  ...props
}: LogoProps & { showText?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <Logo size={size} className={className} {...props} />
      {showText && (
        <span className="text-xl font-semibold tracking-tight text-foreground">
          Planteria
        </span>
      )}
    </div>
  );
}
