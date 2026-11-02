import styles from './ingilizce.module.css';

export type Mood = 'idle' | 'happy' | 'sad' | 'cheer';

const INK = '#2a1a10';
const SHELL = '#c07a3e';
const ARM = '#9b6233';

// A sparkle: a four-pointed star centred on (x, y)
function sparkle(x: number, y: number, r: number) {
  return `M${x} ${y - r}Q${x + r * 0.2} ${y - r * 0.2} ${x + r} ${y}Q${x + r * 0.2} ${y + r * 0.2} ${x} ${y + r}Q${x - r * 0.2} ${y + r * 0.2} ${x - r} ${y}Q${x - r * 0.2} ${y - r * 0.2} ${x} ${y - r}Z`;
}

/** Fındık, the hazelnut who hosts the course; the mood sets the face, the arms and the motion */
export function Mascot({ mood = 'idle', className = '' }: { mood?: Mood; className?: string }) {
  const armsUp = mood === 'happy' || mood === 'cheer';
  const motion = armsUp ? styles.hop : styles.float;
  return (
    <svg viewBox="0 0 120 140" aria-hidden="true" className={`${motion} overflow-visible ${className}`}>
      <ellipse cx="60" cy="134" rx="30" ry="5" fill="rgba(15,40,80,0.12)" />
      <ellipse cx="46" cy="128" rx="10" ry="6" fill="#8a5426" />
      <ellipse cx="74" cy="128" rx="10" ry="6" fill="#8a5426" />
      <g fill="none" stroke={ARM} strokeWidth="7" strokeLinecap="round">
        {armsUp ? <path d="M25 82q-14-10-12-27M95 82q14-10 12-27" /> : <path d="M24 86q-12 6-10 18M96 86q12 6 10 18" />}
      </g>

      <path d="M60 34C88 34 103 58 102 86C101 113 83 128 60 128C37 128 19 113 18 86C17 58 32 34 60 34Z" fill={SHELL} />
      <ellipse cx="42" cy="62" rx="9" ry="16" fill="#dda064" opacity="0.7" transform="rotate(-20 42 62)" />
      <ellipse cx="60" cy="122" rx="20" ry="6" fill="#e6c08f" />

      <path d="M58 20C56 12 60 6 66 3" fill="none" stroke="#5a8f32" strokeWidth="4" strokeLinecap="round" />
      <path d="M64 7C72 0 81 4 83 9C75 13 68 11 64 7Z" fill="#8fd35a" />
      <path
        d="M25 56C27 31 43 19 60 19C77 19 93 31 95 56L87 48L80 57L72 48L64 57L56 48L48 57L40 48L33 57Z"
        fill="#78c043"
      />
      <path d="M40 34Q48 28 58 27" fill="none" stroke="#a6dc78" strokeWidth="3" strokeLinecap="round" />

      {mood === 'happy' || mood === 'cheer' ? (
        <path d="M39 81q8-9 16 0M65 81q8-9 16 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <g className={styles.blink}>
          <ellipse cx="47" cy="79" rx="8" ry="9" fill="#fff" />
          <ellipse cx="73" cy="79" rx="8" ry="9" fill="#fff" />
          <circle cx="48" cy={mood === 'sad' ? 83 : 80} r="4.6" fill={INK} />
          <circle cx="74" cy={mood === 'sad' ? 83 : 80} r="4.6" fill={INK} />
          <circle cx="49.6" cy={mood === 'sad' ? 81.4 : 78.4} r="1.6" fill="#fff" />
          <circle cx="75.6" cy={mood === 'sad' ? 81.4 : 78.4} r="1.6" fill="#fff" />
        </g>
      )}
      {mood === 'sad' && (
        <path d="M38 68L52 64M82 68L68 64" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      )}

      <ellipse cx="36" cy="93" rx="6" ry="4" fill="#ff8f8f" opacity="0.5" />
      <ellipse cx="84" cy="93" rx="6" ry="4" fill="#ff8f8f" opacity="0.5" />

      {mood === 'sad' ? (
        <path d="M53 101q7-6 14 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      ) : armsUp ? (
        <>
          <path d="M49 93q11 16 22 0z" fill="#5a2a14" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="60" cy="99.5" rx="5" ry="2.6" fill="#ff7a8a" />
        </>
      ) : (
        <path d="M52 94q8 8 16 0" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      )}

      {mood === 'cheer' && (
        <g fill="#ffc531">
          <path d={sparkle(10, 34, 7)} />
          <path d={sparkle(110, 28, 8)} />
          <path d={sparkle(108, 104, 5)} />
          <path d={sparkle(12, 108, 5)} />
        </g>
      )}
    </svg>
  );
}
