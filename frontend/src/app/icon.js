import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#080c14',
          color: '#f0f4ff',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          borderRadius: '8px',
        }}
      >
        K
      </div>
    ),
    { ...size }
  );
}
