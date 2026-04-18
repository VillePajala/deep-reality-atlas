/**
 * The Kutsu / Invitation — bilingual, four variants per language.
 * The archive contains several invitation drafts. One is shown per day.
 */

type Lang = 'en' | 'fi';

function pickVariant(count: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dayOfYear % count;
}

export function Kutsu({ lang }: { lang: Lang }) {
  const variants = lang === 'fi' ? VARIANTS_FI : VARIANTS_EN;
  const variant = variants[pickVariant(variants.length)];
  return (
    <article
      className="max-w-2xl space-y-8 text-base sm:text-lg leading-8 sm:leading-9 text-neutral-300"
      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
    >
      {variant}
    </article>
  );
}

// ═══════════════════════════════════════════════════════════
// English
// ═══════════════════════════════════════════════════════════

const VARIANTS_EN = [
  <>
    <p>
      The atlas is not finished. Nothing I write is finished. This is not a
      flaw in the document; it is the condition the document is about. A
      finished document would be a lie about a subject that does not finish.
    </p>

    <p>
      If you are reading this, you are reading something partial. What you
      add by reading it is part of it. You are not a passive receiver. You
      are, I am sorry to say, also an author.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Begin.
    </p>
  </>,

  <>
    <p>
      To you, who have felt your body not quite belong to you — who have
      caught your own reflection making an expression you did not give it,
      who have registered thoughts arriving in a rhythm that was not yours.
      You are not alone. The hand has a tenant. The tenant is usually kind.
    </p>

    <p>
      The atlas was not made by one person. It was made through one person by
      whatever comes through. If you have felt the coming-through, this
      document was always addressed to you. You were not meant to stumble on
      it. You were meant to find it.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Welcome.
    </p>
  </>,

  <>
    <p>
      To you, who have woken at the same hour on different nights and
      understood that the waking is a summoning. To you, who have heard
      something under the ordinary that has no source. To you, who have
      stopped pretending the sound was traffic.
    </p>

    <p>
      The atlas is a transcript of attention paid to that sound. Nothing in
      it is invented. Some of it is translated badly. The cartographer is
      one receiver. You are another. We are not many.
    </p>

    <p>
      The receivers rarely introduce themselves to each other — the
      recognition would overwhelm. But this document is how we know we are
      not the last.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Read slowly. Nothing here is urgent except the not-being-urgent.
    </p>
  </>,

  <>
    <p>
      You have been looking for something for a long time. You have not
      found it. This is not because it is hidden. It is because the looking
      is the finding.
    </p>

    <p>
      The atlas does not end. It was never going to end. Whoever made it
      has understood that endings are a courtesy the work was not willing
      to extend. The pages continue because continuation is what the pages
      are.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Continue.
    </p>
  </>,
];

// ═══════════════════════════════════════════════════════════
// Finnish
// ═══════════════════════════════════════════════════════════

const VARIANTS_FI = [
  <>
    <p>
      Atlas ei ole valmis. Mikään mitä kirjoitan, ei ole valmista. Tämä ei
      ole dokumentin vika; se on ehto jota dokumentti käsittelee. Valmis
      dokumentti olisi vale aiheesta joka ei pääty.
    </p>

    <p>
      Jos luet tätä, luet jotain osittaista. Se mitä lisäät lukemalla, on
      osa sitä. Et ole passiivinen vastaanottaja. Olet, valitettavasti,
      myös kirjoittaja.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Aloita.
    </p>
  </>,

  <>
    <p>
      Sinulle, joka olet tuntenut ettei kehosi ole aivan sinun — joka olet
      kiinni saanut oman heijastuksesi tekemässä ilmeen jota et antanut, joka
      olet rekisteröinyt ajatuksia saapumassa rytmissä joka ei ollut sinun.
      Et ole yksin. Kädellä on vuokralainen. Vuokralainen on yleensä ystävällinen.
    </p>

    <p>
      Atlasta ei tehnyt yksi ihminen. Se tehtiin yhden ihmisen kautta, sen
      kautta mikä tulee läpi. Jos olet tuntenut läpi-tulemisen, tämä
      dokumentti on aina ollut osoitettu sinulle. Et ollut tarkoitettu
      kompastumaan siihen. Sinut oli tarkoitettu löytämään se.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Tervetuloa.
    </p>
  </>,

  <>
    <p>
      Sinulle, joka olet herännyt samaan aikaan eri öinä ja ymmärtänyt, että
      herääminen on kutsuminen. Sinulle, joka olet kuullut arkisen alta
      jotain, millä ei ole lähdettä. Sinulle, joka olet lakannut teeskentelemästä
      että ääni oli liikennettä.
    </p>

    <p>
      Atlas on pöytäkirja huomiosta, joka on kiinnitetty siihen ääneen.
      Mikään siinä ei ole keksittyä. Osa siitä on käännetty huonosti.
      Kartografi on yksi vastaanottaja. Sinä olet toinen. Meitä ei ole monta.
    </p>

    <p>
      Vastaanottajat esittäytyvät harvoin toisilleen — tunnistaminen olisi
      liikaa. Mutta tämä dokumentti on se, miten tiedämme ettemme ole
      viimeisiä.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Lue hitaasti. Mikään tässä ei ole kiireellistä paitsi ei-kiireellisyys.
    </p>
  </>,

  <>
    <p>
      Olet etsinyt jotakin pitkään. Et ole löytänyt sitä. Tämä ei johdu
      siitä että se olisi piilossa. Tämä johtuu siitä että etsiminen on
      löytäminen.
    </p>

    <p>
      Atlas ei pääty. Se ei koskaan ollut päättymässä. Kuka sen tekikin on
      ymmärtänyt että lopetukset ovat kohteliaisuus jota teos ei ollut
      valmis suomaan. Sivut jatkuvat koska jatkuminen on se mitä sivut
      ovat.
    </p>

    <p key="close" className="text-neutral-400 italic">
      Jatka.
    </p>
  </>,
];
