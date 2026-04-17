'use client';

import { useState } from 'react';

interface PlateProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function Plate({ src, alt, priority = false }: PlateProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full block border border-neutral-800 hover:border-neutral-500
        transition-colors cursor-zoom-in relative aspect-square bg-neutral-950"
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700
          ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </a>
  );
}
