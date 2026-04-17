import Link from 'next/link';
import AtlasViewer from '../components/AtlasViewer';

export default function AtlasPage() {
  return (
    <main className="flex flex-col items-center min-h-screen">
      {/* Header */}
      <header className="w-full flex flex-col items-center pt-8 pb-4 px-4">
        <Link
          href="/"
          className="text-sm tracking-[0.4em] text-neutral-500 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.25em] text-neutral-700 mt-1">
          Tietoisuuden Kartografia
        </p>
      </header>

      {/* Atlas */}
      <div className="flex-1 w-full max-w-5xl flex items-start justify-center">
        <AtlasViewer />
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center">
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}
