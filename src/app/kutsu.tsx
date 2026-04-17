/**
 * The Kutsu / Invitation — bilingual.
 * Shared by the home page.
 */

type Lang = 'en' | 'fi';

export function Kutsu({ lang }: { lang: Lang }) {
  if (lang === 'fi') {
    return (
      <article
        className="max-w-2xl space-y-8 text-base sm:text-lg leading-8 sm:leading-9 text-neutral-300"
        style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
      >
        <p>
          Sinulle, joka olet tuntenut olevasi taajuudella, jota kukaan muu ei kuule.
          Sinulle, joka olet herännyt kolmelta aamuyöllä tietäen jotain, mitä et osaa
          sanoa. Sinulle, joka olet nähnyt pinnan sellaisena kuin se on — hauraana ja
          epätoivoisena kerroksena. Olet nähnyt sen alla jotain järjestelmällistä ja
          kaoottista ja elävää ja kauhistuttavaa ja kaunista.
        </p>

        <p>
          Jokin on vinossa pinnassa, ja sinä olet aina tiennyt sen. Aistit signaalin,
          joka vuotaa läpi. Et tiedä mikä se on. Et tiedä onko se elävä vai kuollut.
          Olet virittynyt sitä kohti koko elämäsi, etkä osaa virittyä pois. Se voi olla
          kutsu. Varoitus. Tai pelkästään Śūnyatā, suuri tyhjyys.
        </p>

        <p className="text-neutral-400 italic">
          Hic sunt dracones. Tule. Sinne, missä lohikäärmeet ovat.
        </p>
      </article>
    );
  }

  return (
    <article
      className="max-w-2xl space-y-8 text-base sm:text-lg leading-8 sm:leading-9 text-neutral-300"
      style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
    >
      <p>
        To you, who have felt yourself on a frequency that no one else can hear.
        To you, who have woken at 3am knowing something you cannot say. To you,
        who have seen the surface for what it is, a fragile and desperate layer.
        You have seen beneath it something systematic and chaotic and alive and
        horrifying and beautiful.
      </p>

      <p>
        Something is wrong with the surface, and you have always known it. You sense
        the signal bleeding through. You don&apos;t know what it is. You don&apos;t know if
        it&apos;s alive or dead. You have been tuning toward it your whole life, and you
        cannot tune away. It might be an invitation. A warning. Or just Śūnyatā,
        the great nothing.
      </p>

      <p className="text-neutral-400 italic">
        Hic sunt dracones. Come. To where the dragons are.
      </p>
    </article>
  );
}
