/* eslint-disable react/no-unknown-property -- Tailwind CSS `tw` property */
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const bold = fetch(new URL('./inter-bold.woff', import.meta.url)).then((res) =>
  res.arrayBuffer(),
);

const bgImage = fetch(new URL('/public/docs-og-image.jpg', import.meta.url)).then((res) =>
  res.arrayBuffer(),
);

export async function GET(
  request: NextRequest,
): Promise<ImageResponse> {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title'),
    description = searchParams.get('description');

  return new ImageResponse(
    OG({
      title: title ?? 'Avalanche Docs',
      description: description ?? 'Developer documentation for everything related to the Avalanche ecosystem.',
      bgImageData: await bgImage,
    }),
    {
      width: 767,
      height: 414,
      fonts: [{ name: 'Inter', data: await bold, weight: 700 }],
    },
  );
}

function OG({
  title,
  description,
  bgImageData,
}: {
  title: string;
  description: string;
  bgImageData: ArrayBuffer;
}): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '-.02em',
        fontWeight: 700,
        background: `url(data:image/jpeg;base64,${Buffer.from(bgImageData).toString('base64')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        style={{
          left: 42,
          top: 42,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 1503 1504" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          {/* SVG paths remain the same */}
        </svg>
        <span
          style={{
            marginLeft: 8,
            fontSize: 20,
          }}
        >
          Documentation 
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          padding: '20px 50px',
          margin: '0 42px',
          fontSize: 20,
          width: 'auto',
          maxWidth: 560,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', // Semi-transparent background
          color: '#737373',
          lineHeight: 1.4,
          backdropFilter: 'blur(8px)', // Add blur effect
        }}
      >  
        <span style={{
          margin: '0 0 20px 0',
          color: '#fff',
          fontSize: 26,
        }}>
          {title}
        </span>
        {description}
        <br/>
      </div>
    </div>
  );
}