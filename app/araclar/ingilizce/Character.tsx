import styles from './ingilizce.module.css';

type Look = {
  skin: string;
  hair: string;
  shirt: string;
  hairStyle: 'bun' | 'short' | 'curly';
  glasses?: boolean;
};

// Three classmates who say the prompts; drawn flat so they sit well on the dark glass
const LOOKS: Look[] = [
  { skin: '#f3c9a5', hair: '#5b3a29', shirt: '#d55181', hairStyle: 'bun' },
  { skin: '#e0ac82', hair: '#1f1a17', shirt: '#3987e5', hairStyle: 'short', glasses: true },
  { skin: '#9a6644', hair: '#2b1d14', shirt: '#199e70', hairStyle: 'curly' },
];

const CURLS = [
  [27, 41],
  [32, 31],
  [40, 24],
  [50, 21],
  [60, 24],
  [68, 31],
  [73, 41],
];

// The same sentence always gets the same speaker
function lookFor(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LOOKS[hash % LOOKS.length];
}

export function Character({ text, className = '' }: { text: string; className?: string }) {
  const look = lookFor(text);
  const ink = '#1d1a2e';
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" className={className}>
      {look.hairStyle === 'bun' && <circle cx="50" cy="17" r="11" fill={look.hair} />}
      <path d="M16 120c0-24 15-36 34-36s34 12 34 36z" fill={look.shirt} />
      <path
        d="M41 87l9 8 9-8"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="43" y="68" width="14" height="18" rx="5" fill={look.skin} />
      <rect x="43" y="73" width="14" height="5" fill="rgba(0,0,0,0.1)" />
      <circle cx="22.5" cy="51" r="5.5" fill={look.skin} />
      <circle cx="77.5" cy="51" r="5.5" fill={look.skin} />
      <circle cx="50" cy="48" r="28" fill={look.skin} />

      {look.hairStyle === 'bun' && (
        <path d="M21 50c-2-20 11-34 29-34s31 14 29 34c-5-11-14-18-29-18s-24 7-29 18z" fill={look.hair} />
      )}
      {look.hairStyle === 'short' && (
        <path
          d="M21 47c0-19 13-31 30-31 15 0 28 10 28 27-6-7-14-11-26-11-13 0-24 5-32 15zM43 19c6-7 16-7 22-1-7 0-14 1-22 1z"
          fill={look.hair}
        />
      )}
      {look.hairStyle === 'curly' && (
        <g fill={look.hair}>
          <path d="M23 45c0-16 12-27 27-27s27 11 27 27c-6-8-15-12-27-12s-21 4-27 12z" />
          {CURLS.map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="9" />
          ))}
        </g>
      )}

      <path d="M34 42q6-4 11 0M55 42q5-4 11 0" fill="none" stroke={look.hair} strokeWidth="2.4" strokeLinecap="round" />
      <g className={styles.blink}>
        <ellipse cx="40" cy="51" rx="3.3" ry="4.3" fill={ink} />
        <ellipse cx="60" cy="51" rx="3.3" ry="4.3" fill={ink} />
        <circle cx="41.2" cy="49.4" r="1.1" fill="#fff" />
        <circle cx="61.2" cy="49.4" r="1.1" fill="#fff" />
      </g>
      {look.glasses && (
        <g fill="none" stroke={ink} strokeWidth="2">
          <circle cx="40" cy="51" r="7.5" />
          <circle cx="60" cy="51" r="7.5" />
          <path d="M47.5 51h5" />
        </g>
      )}
      <circle cx="32" cy="61" r="4.2" fill="#ff7a7a" opacity="0.35" />
      <circle cx="68" cy="61" r="4.2" fill="#ff7a7a" opacity="0.35" />
      <path d="M43 62q7 7 14 0" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
