import Link from 'next/link';
import fs from 'fs';
import path from 'path';

function getGalleryImages() {
  const dir = path.join(process.cwd(), 'public', 'gallery');
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.png') && !f.startsWith('_'))
      .sort();
    return files.map(f => ({
      src: `/gallery/${f}`,
      name: f.replace('.png', ''),
    }));
  } catch {
    return [];
  }
}

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center">

      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-xs tracking-[0.5em] text-neutral-700 hover:text-neutral-400
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-700 mt-2">
          Gallery — Atlas Pages
        </p>
      </header>

      {images.length === 0 ? (
        <p className="text-neutral-600 text-sm">No pages generated yet.</p>
      ) : (
        <div className="w-full max-w-6xl space-y-16">
          {images.map((img) => (
            <article key={img.name} className="flex flex-col items-center gap-4">
              <a href={img.src} target="_blank" rel="noopener noreferrer" className="w-full">
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-full border border-neutral-800 hover:border-neutral-500
                    transition-colors cursor-zoom-in"
                />
              </a>
              <p className="text-[9px] tracking-[0.3em] text-neutral-700">
                {img.name.toUpperCase()}
              </p>
            </article>
          ))}
        </div>
      )}

      <footer className="mt-24 text-center space-y-4">
        <nav className="flex gap-8 justify-center">
          <Link href="/book" className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400 transition-colors uppercase">
            The Journal
          </Link>
          <Link href="/manifesto" className="text-[10px] tracking-[0.3em] text-neutral-700 hover:text-neutral-400 transition-colors uppercase">
            Manifesto
          </Link>
        </nav>
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
