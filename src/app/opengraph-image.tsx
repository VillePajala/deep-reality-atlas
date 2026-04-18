import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Deep Reality — Cartography of Consciousness';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ededed',
          padding: 80,
          fontFamily: 'serif',
        }}
      >
        {/* Recurring symbol */}
        <svg
          width="72"
          height="96"
          viewBox="0 0 24 32"
          fill="none"
          stroke="#ededed"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ marginBottom: 40, opacity: 0.85 }}
        >
          <circle cx="12" cy="10" r="6" />
          <line x1="12" y1="4" x2="12" y2="28" />
          <line x1="12" y1="4" x2="9" y2="1" />
          <line x1="12" y1="4" x2="15" y2="1" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            marginBottom: 30,
            color: '#f5f5f5',
          }}
        >
          Deep Reality
        </div>

        {/* Hairline divider */}
        <div
          style={{
            width: 120,
            height: 1,
            background: '#525252',
            marginBottom: 30,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#d4d4d4',
            marginBottom: 18,
          }}
        >
          Cartography of Consciousness
        </div>

        {/* Byline */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#737373',
            fontFamily: 'monospace',
          }}
        >
          pages from the atlas of Johannes Kamikaze
        </div>
        <div
          style={{
            fontSize: 13,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#525252',
            fontFamily: 'monospace',
            marginTop: 8,
          }}
        >
          found and presented by V.P.
        </div>
      </div>
    ),
    { ...size },
  );
}
