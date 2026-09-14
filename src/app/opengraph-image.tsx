import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TypeForge – Master Typing with Precision';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #02050b 0%, #0a1628 50%, #02050b 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '30%',
            width: '40%',
            height: '60%',
            background:
              'radial-gradient(ellipse, rgba(79,141,253,0.20) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '20%',
            width: '35%',
            height: '50%',
            background:
              'radial-gradient(ellipse, rgba(57,212,191,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background:
                'linear-gradient(135deg, #4f8dfd 0%, #39d4bf 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 900,
              color: '#fff',
            }}
          >
            T
          </div>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            TypeForge
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '52px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: '80%',
            background:
              'linear-gradient(135deg, #ffffff 0%, #a0b4d4 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Master Typing with Precision
        </p>

        {/* Sub-tagline */}
        <p
          style={{
            marginTop: '12px',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Lessons · Practice · Analytics · Games
        </p>
      </div>
    ),
    { ...size }
  );
}
