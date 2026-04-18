import Link from 'next/link';
import { Suspense } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Symbol } from '@/components/Symbol';

type Lang = 'en' | 'fi';

export default async function TheFindingPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: Lang = langParam === 'fi' ? 'fi' : 'en';

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-16">

      {/* Header */}
      <header className="mb-16 text-center relative w-full max-w-xl">
        <Link
          href="/"
          className="text-[11px] tracking-[0.5em] text-neutral-600 hover:text-neutral-300
            transition-colors uppercase"
        >
          Deep Reality
        </Link>
        <p className="text-[10px] tracking-[0.3em] text-neutral-500 mt-2 uppercase font-mono">
          {lang === 'fi' ? 'Löytö — toimittajan muistiinpano' : 'The Finding — editor\u2019s note'}
        </p>
        <div className="absolute top-0 right-0">
          <Suspense fallback={null}>
            <LanguageToggle />
          </Suspense>
        </div>
      </header>

      {lang === 'fi' ? <FindingFI /> : <FindingEN />}

      {/* Footer */}
      <footer className="mt-24 flex flex-col items-center gap-4">
        <Symbol size={18} className="text-neutral-800" />
        <p className="text-[9px] tracking-[0.3em] text-neutral-800">
          I AM THE IMAGINATION OF MYSELF
        </p>
      </footer>
    </main>
  );
}

function FindingEN() {
  return (
    <article
      className="max-w-2xl w-full space-y-6 text-base sm:text-lg leading-8 text-neutral-300"
      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
    >
      <p>
        What follows is not a book and not an exhibition. It is an archive,
        partially reconstituted, assembled from material that came into my
        possession over a period I will not specify.
      </p>

      <p>
        The material is attributed to Johannes Kamikaze. I did not know him.
        The name is signed on some of the pages; it is absent from most. When
        I refer to Kamikaze I refer to the figure the archive implies.
      </p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        What is known
      </h2>

      <p>
        The material includes approximately three hundred ink drawings (the
        atlas), a large body of journal fragments, and an incomplete set of
        notes toward what appears to have been a credo.
      </p>

      <p>
        The drawings are of consistent style. The written fragments are in
        several hands — Kamikaze&apos;s, by far the most frequent, is an
        angular script with a distinct diagonal lean. Other hands are present
        in the marginalia.
      </p>

      <p>
        Kamikaze worked with ink on paper. He practised acupuncture. He
        appears to have been widely read and to have moved through several
        countries. Several of his entries are in languages other than English;
        I have not translated most of these.
      </p>

      <p>
        Some references place him in Helsinki. Others do not. The archive is
        silent on dates — his pages are rarely dated; when dated, the dates
        are not consistent with one another.
      </p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        What is not known
      </h2>

      <p>
        Where he was born. When he began the atlas. Whether he has finished.
      </p>

      <p>Whether he is still working.</p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        Why present the material
      </h2>

      <p>
        The archive is too specific to discard and too large to carry
        privately. I am presenting it because the material has, in ways I
        will not attempt to justify, been asking to be read.
      </p>

      <p>
        I have added minimal editorial marks. Gaps in the numbering are
        Kamikaze&apos;s. Strikethroughs are Kamikaze&apos;s. Where I have
        intervened, my intervention is in square brackets and signed{' '}
        <strong>[V.P.]</strong>.
      </p>

      <p>
        Several invitation drafts were found among the papers. One appears
        on the cover; the others are preserved <Link href="/kutsu" className="underline decoration-dotted underline-offset-4 hover:text-neutral-300 transition-colors">here</Link>,
        rotating by day.
      </p>

      <p>
        I draw no conclusions. The seeker is closer to the truth by travelling.
      </p>

      <p className="text-neutral-500 italic pt-6">
        — Ville Pajala
      </p>
    </article>
  );
}

function FindingFI() {
  return (
    <article
      className="max-w-2xl w-full space-y-6 text-base sm:text-lg leading-8 text-neutral-300"
      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
    >
      <p>
        Mitä tästä seuraa ei ole kirja eikä näyttely. Se on arkisto, osittain
        koottu materiaalista joka tuli haltuuni ajanjaksona, jota en
        täsmennä.
      </p>

      <p>
        Materiaali on liitetty Johannes Kamikazeen. En tuntenut häntä. Nimi on
        allekirjoitettu joillakin sivuilla; useimmilta se puuttuu. Kun
        viittaan Kamikazeen, viittaan hahmoon jonka arkisto implikoi.
      </p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        Mitä tiedetään
      </h2>

      <p>
        Materiaali sisältää noin kolmesataa mustepiirrosta (atlaksen), laajan
        kokoelman päiväkirjafragmentteja, sekä epätäydellisen joukon
        muistiinpanoja jotka vaikuttavat olleen luonnoksia credoksi.
      </p>

      <p>
        Piirrokset ovat tyyliltään yhtenäisiä. Kirjoitetut fragmentit ovat
        useassa käsialassa — Kamikazen oma, ylivoimaisesti yleisin, on
        kulmikas käsiala joka kallistuu selvästi viistoon. Muita käsialoja
        esiintyy reunamerkinnöissä.
      </p>

      <p>
        Kamikaze työskenteli musteella paperille. Hän harjoitti akupunktuuria.
        Hän näyttää olleen laajalti lukenut ja liikkuneen useissa maissa.
        Useat hänen merkinnöistään ovat muilla kielillä kuin englanniksi; en
        ole kääntänyt niistä useimpia.
      </p>

      <p>
        Jotkin viittaukset sijoittavat hänet Helsinkiin. Toiset eivät.
        Arkisto on vaitelias päivämääristä — hänen sivunsa ovat harvoin
        päivättyjä; kun päivätty, päivämäärät eivät ole keskenään
        johdonmukaisia.
      </p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        Mitä ei tiedetä
      </h2>

      <p>
        Missä hän syntyi. Milloin hän aloitti atlaksen. Onko hän lopettanut.
      </p>

      <p>Työskenteleekö hän yhä.</p>

      <h2 className="text-xs tracking-[0.3em] text-neutral-500 uppercase pt-6 font-mono">
        Miksi esittää materiaali
      </h2>

      <p>
        Arkisto on liian tarkka hylättäväksi ja liian suuri kannettavaksi
        yksityisesti. Esitän sen koska materiaali on, tavoilla joita en yritä
        perustella, pyytänyt tulla luetuksi.
      </p>

      <p>
        Olen lisännyt vähäisiä toimituksellisia merkintöjä. Numeroinnin
        puuttumiset ovat Kamikazen. Yliviivaukset ovat Kamikazen. Missä olen
        puuttunut, puuttumiseni on hakasulkeissa ja allekirjoitettu{' '}
        <strong>[V.P.]</strong>.
      </p>

      <p>
        Useita vedoksia kutsusta löytyi papereiden joukosta. Yksi on
        etusivulla; muut on säilytetty <Link href="/kutsu?lang=fi" className="underline decoration-dotted underline-offset-4 hover:text-neutral-300 transition-colors">täällä</Link>,
        kiertäen päivittäin.
      </p>

      <p>
        En tee johtopäätöksiä. Etsijä on lähempänä totuutta kulkemalla.
      </p>

      <p className="text-neutral-500 italic pt-6">
        — Ville Pajala
      </p>
    </article>
  );
}
