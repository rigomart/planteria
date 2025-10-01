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
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Planteria logo"
      role="img"
      {...props}
    >
      <line x1="32" y1="52" x2="32" y2="12" stroke="currentColor" strokeWidth="4" />

      {/* Branch nodes - representing plan hierarchy */}
      <circle cx="32" cy="16" r="4.5" fill="currentColor" />

      <line x1="32" y1="28" x2="15" y2="20" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="15" cy="20" r="4" fill="currentColor" />

      <line x1="32" y1="34" x2="49" y2="25" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="49" cy="25" r="4" fill="currentColor" />

      <line x1="32" y1="42" x2="22" y2="40" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="22" cy="40" r="4" fill="currentColor" />

      <circle cx="32" cy="52" r="4.5" fill="currentColor" />
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
        <span className="text-xl font-semibold tracking-tight text-foreground">Planteria</span>
      )}
    </div>
  );
}
