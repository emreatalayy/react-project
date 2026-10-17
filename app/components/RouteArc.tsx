const route = 'M44 92 Q150 -4 256 92';

export function RouteArc({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 124"
      role="img"
      aria-label="İstanbul ile Trabzon arası yaklaşık 900 km"
      className={className}
    >
      <defs>
        <linearGradient id="route-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      <path d="M14 92 H286" stroke="rgba(255,255,255,0.08)" strokeDasharray="1 7" strokeLinecap="round" />
      <path d={route} fill="none" stroke="url(#route-gradient)" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" />
      <path
        className="dash-flow"
        d={route}
        fill="none"
        stroke="url(#route-gradient)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />

      <circle className="flight-dot" r="3.5" fill="#fff">
        <animateMotion
          dur="4.5s"
          repeatCount="indefinite"
          path={route}
          calcMode="spline"
          keyPoints="0;1"
          keyTimes="0;1"
          keySplines="0.45 0 0.55 1"
        />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur="4.5s" repeatCount="indefinite" />
      </circle>

      <circle cx="44" cy="92" r="11" fill="#60a5fa" fillOpacity="0.16" />
      <circle cx="44" cy="92" r="4.5" fill="#60a5fa" />
      <circle cx="256" cy="92" r="11" fill="#22d3ee" fillOpacity="0.16" />
      <circle cx="256" cy="92" r="4.5" fill="#22d3ee" />

      <text x="44" y="118" textAnchor="middle" className="fill-zinc-300 text-[11px] font-medium">
        İstanbul
      </text>
      <text x="256" y="118" textAnchor="middle" className="fill-zinc-300 text-[11px] font-medium">
        Trabzon
      </text>
      <text x="150" y="34" textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] tracking-[0.14em]">
        ~900 KM
      </text>
    </svg>
  );
}
