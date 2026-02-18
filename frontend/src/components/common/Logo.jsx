const LogoMark = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    role="img"
    aria-label="Time-Split"
  >
    <defs>
      <linearGradient id="tsg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#60a5fa" />
        <stop offset="1" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#tsg)" />
    <path
      d="M20 22h24v6H35v22h-6V28h-9v-6z"
      fill="white"
      opacity="0.95"
    />
    <path
      d="M44 22h-6v6h6a6 6 0 0 1 0 12h-6v6h6a12 12 0 0 0 0-24z"
      fill="white"
      opacity="0.85"
    />
  </svg>
);

const Logo = ({ compact = false }) => {
  if (compact) return <LogoMark />;
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">Time-Split</div>
        <div className="text-xs text-base-content/60">
          Adaptive study scheduler
        </div>
      </div>
    </div>
  );
};

export default Logo;

