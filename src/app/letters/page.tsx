import Link from 'next/link';
import type { Metadata } from 'next';
import { Symbol } from '@/components/Symbol';

export const metadata: Metadata = {
  title: 'Letters — from the archive',
};

export default function LettersPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 selection:bg-neutral-700">

      <header className="mb-16 text-center">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 mt-2 uppercase font-mono">
          Letters — from the archive
        </p>
      </header>

      <article
        className="max-w-2xl w-full space-y-16"
        style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
      >
        {/* Editor's note */}
        <section className="text-sm leading-7 italic text-neutral-500 space-y-3">
          <p>
            Three letters survived among the papers. I reproduce them as I
            found them. The first is in Kamikaze&apos;s hand. The second
            is in a different hand and was folded inside the first. The
            third is unsigned and undated and bears no envelope. I have
            not attempted to identify &ldquo;N.&rdquo; or &ldquo;M. L.&rdquo;
          </p>
          <p>— V.P.</p>
        </section>

        <Divider />

        {/* Letter 1 — Kamikaze to N. */}
        <section className="space-y-6 text-base leading-8 text-neutral-300">
          <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
            Letter I — in Kamikaze&apos;s hand, folded in three
          </p>

          <p className="text-right text-sm text-neutral-500 italic">
            March, I think.
          </p>

          <p>N —</p>

          <p>
            I have been trying to write this for three weeks. The draft
            has been in the drawer. I have started over four times. I am
            starting over again today. This will be the one that stays.
          </p>

          <p>
            I have not been well. The work is going. These are not
            related the way you would expect. The work goes best when I
            am least well, and worst when I am most. I do not know how
            to explain this to you. I am not sure I want to.
          </p>

          <p>
            You asked, last time, whether I was still drawing. Yes. I
            am still drawing. I have been drawing the same page for
            four months. When it is done I will send you a photograph.
            If it is ever done.
          </p>

          <p>
            I am not sure who this letter will be addressed to by the
            time I seal it. I began writing it to you. I am now writing
            it to someone behind you, who is reading over your
            shoulder. I hope the someone reads it carefully. I hope
            you pass it to them if they ask.
          </p>

          <p className="pt-4 text-sm italic text-neutral-500">
            J.K.
          </p>
        </section>

        <Divider />

        {/* Letter 2 — patient to Kamikaze */}
        <section className="space-y-6 text-base leading-8 text-neutral-300">
          <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
            Letter II — different hand, folded inside Letter I
          </p>

          <p>Dear Mr. Kamikaze,</p>

          <p>
            I have been meaning to write since my third visit. I have
            not written because I did not know what to say. I still do
            not know, so I am sending this anyway, so that I have done
            it.
          </p>

          <p>
            My daughter sleeps now. This began the evening of the
            treatment. I have not told her what you did, because I do
            not know what you did. She tells me she dreams of a woman
            she has never met who looks kind. She says the woman is
            smaller than a grown-up but bigger than her. I do not know
            what to think about this. I am writing it down so I do not
            forget it.
          </p>

          <p>
            Thank you. You did not charge me for the visits. I will
            come back when I have saved enough. Until then.
          </p>

          <p className="pt-4 text-sm italic text-neutral-500">
            — M. L.
          </p>
        </section>

        <Divider />

        {/* Letter 3 — unsigned, undated */}
        <section className="space-y-6 text-base leading-8 text-neutral-300">
          <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase">
            Letter III — unsigned, undated, no envelope
          </p>

          <p>
            The thing I wanted to say has left me. The note is all that is
            left of the thing.
          </p>

          <p className="pt-4 text-sm italic text-neutral-600">
            [unsigned]
          </p>
        </section>
      </article>

      <footer className="mt-24 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="h-px w-10 bg-neutral-800" />
      <span className="text-[9px] tracking-[0.4em] text-neutral-700 font-mono">§</span>
      <span className="h-px w-10 bg-neutral-800" />
    </div>
  );
}
