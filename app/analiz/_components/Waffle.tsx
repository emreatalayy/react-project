import { DRAW_COLOR } from '../_lib/format';

const cellColor = (i: number, [w, d]: [number, number, number], colors: [string, string]) =>
  i < w ? colors[0] : i < w + d ? DRAW_COLOR : colors[1];

// 100 squares, one per replayed match: home wins first, then draws, then away wins.
// `order` and `revealed` let the simulator fill them in a random order.
export function Waffle({
  counts,
  colors,
  columns = 20,
  order,
  revealed = 100,
  className = '',
  label,
}: {
  counts: [number, number, number];
  colors: [home: string, away: string];
  columns?: number;
  order?: number[];
  revealed?: number;
  className?: string;
  label?: string;
}) {
  const shown = new Set((order ?? []).slice(0, revealed));
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`grid gap-[3px] ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: 100 }, (_, i) => (
        <i
          key={i}
          className="aspect-square rounded-[3px]"
          style={{ background: !order || shown.has(i) ? cellColor(i, counts, colors) : 'rgba(255,255,255,0.08)' }}
        />
      ))}
    </div>
  );
}
