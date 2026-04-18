/**
 * The recurring symbol.
 *
 * Described in the journal as: a circle with a vertical line through it,
 * the line extending below; two small marks at the top like antennae or horns.
 * Also: like a head on a body, or a planet on an axis, or an ankh that
 * forgot its arms, or the letter φ.
 *
 * V.P.'s tentative rendering based on recurring appearances across
 * Kamikaze's pages.
 */

interface SymbolProps {
  size?: number;
  className?: string;
}

export function Symbol({ size = 24, className = '' }: SymbolProps) {
  return (
    <svg
      width={size}
      height={(size * 4) / 3}
      viewBox="0 0 24 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="10" r="6" />
      <line x1="12" y1="4" x2="12" y2="28" />
      <line x1="12" y1="4" x2="9" y2="1" />
      <line x1="12" y1="4" x2="15" y2="1" />
    </svg>
  );
}
