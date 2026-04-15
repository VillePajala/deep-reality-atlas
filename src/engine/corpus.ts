/**
 * Holy Book of Insanity — Text Corpus Engine
 *
 * Each atlas page draws from the 20 sections of the text corpus.
 * Text appears as:
 * - Legible fragments scattered across the page (Latin, Sanskrit, Tibetan, Finnish, Chinese)
 * - Marginalia quotes that reward close reading
 * - Thematic titles for taxonomy grid sections
 * - Mantric repetition (a phrase repeated across the entire bottom edge)
 * - Ghost text — very faint, large, underlying the composition
 * - Chinese/Tibetan/Greek characters woven into the pseudo-script
 */

export interface CorpusTheme {
  id: string;
  title: string;
  fragments: string[];
  longQuotes: string[];
  characters: string[];   // Non-Latin characters for visual texture
  gridTitles: string[];   // Titles for taxonomy sections
  mantras: string[];      // Phrases for repetitive writing
}

export const themes: CorpusTheme[] = [
  {
    id: 'numinous',
    title: 'THE NUMINOUS',
    fragments: [
      'MYSTERIUM TREMENDUM', 'DAS GANZ ANDERE', 'SENSUS NUMINIS',
      'KREATURGEFÜHL', 'DAS HEILIGE', 'WHOLLY OTHER', 'CREATURE-FEELING',
      'TREMENDUM ET FASCINANS', 'BEYOND THE SPHERE OF THE FAMILIAR',
    ],
    longQuotes: [
      'That which is mysterious is the wholly other, quite beyond the sphere of the usual, the intelligible, and the familiar.',
      'The numinous presents itself as ganz Andere, a condition absolutely sui generis and incomparable.',
    ],
    characters: ['∞', '⊕', '☉', '◉'],
    gridTitles: [
      'CATALOGUS NUMINIS — SENSUS',
      'TABULA TREMENDI — SERIES',
      'INDEX FASCINANS — TYPUS',
    ],
    mantras: ['MYSTERIUM TREMENDUM ET FASCINANS'],
  },
  {
    id: 'jung',
    title: 'DEPTH PSYCHOLOGY',
    fragments: [
      'LIBER NOVUS', 'THE SHADOW IS DENSER', 'MARRY THE ORDERED TO THE CHAOS',
      'THE DIVINE CHILD', 'FROM ONE GRAVE INTO ANOTHER', 'THE UNFATHOMABLE',
      'MAKE THE DARKNESS CONSCIOUS', 'INDIVIDUATIO', 'ENANTIODROMIA',
      'THE GATES OF THE SOUL', 'THE DARK FLOOD OF CHAOS',
    ],
    longQuotes: [
      'You open the gates of the soul to let the dark flood of chaos flow into your order and meaning.',
      'Until you make the unconscious conscious, it will direct your life and you will call it fate.',
      'One does not become enlightened by imagining figures of light, but by making the darkness conscious.',
    ],
    characters: ['☽', '☿', '♃', '♄'],
    gridTitles: [
      'CATALOGUS UMBRAE — SPECIMEN',
      'ATLAS PSYCHE PROFUNDAE',
      'INDEX INDIVIDUATIONIS',
    ],
    mantras: ['MARRY THE ORDERED TO THE CHAOS'],
  },
  {
    id: 'alchemy',
    title: 'ALCHEMY',
    fragments: [
      'SOLVE ET COAGULA', 'NIGREDO', 'ALBEDO', 'RUBEDO', 'PRIMA MATERIA',
      'AURUM NOSTRUM NON EST AURUM VULGI', 'LAPIS PHILOSOPHORUM',
      'OPUS CONTRA NATURAM', 'TABULA SMARAGDINA', 'HEN TO PAN',
      'COINCIDENTIA OPPOSITORUM', 'MORTIFICATIO', 'CALCINATIO', 'SUBLIMATIO',
      'SEPARABIS TERRAM AB IGNE',
    ],
    longQuotes: [
      'As above, so below; as below, so above, to accomplish the miracles of the one thing.',
      'Its father is the Sun, its mother the Moon; the Wind carried it in its belly; its nurse is the Earth.',
      'It ascends from earth to heaven, and descends again to earth, and receives the power of above and below.',
    ],
    characters: ['☿', '☽', '☉', '♁', '🜁', '🜂', '🜃', '🜄'],
    gridTitles: [
      'TABULA SMARAGDINA — OPERATIONES',
      'CATALOGUS TRANSMUTATIONIS',
      'OPUS MAGNUM — PHASES',
    ],
    mantras: ['SOLVE ET COAGULA'],
  },
  {
    id: 'gnosis',
    title: 'GNOSTICISM',
    fragments: [
      'PLEROMA', 'KENOMA', 'ARCHONTES', 'PNEUMA', 'SOPHIA', 'GNOSIS',
      'SPLIT THE WOOD I AM THERE', 'THE ROBE OF GLORY',
      'BRING FORTH WHAT IS WITHIN YOU', 'DEMIURGOS',
      'THE KINGDOM IS SPREAD UPON THE EARTH', 'HE WILL RULE OVER THE ALL',
    ],
    longQuotes: [
      'If you bring forth what is within you, what you have will save you. If you do not bring forth what is within you, what you do not have will destroy you.',
      'I am the light that is over all things. Split a piece of wood; I am there. Lift up the stone, and you will find me there.',
    ],
    characters: ['Π', 'Σ', 'Γ', 'Ψ', 'Ω'],
    gridTitles: [
      'ATLAS PLEROMATIS',
      'CATALOGUS ARCHONTUM',
      'INDEX GNOSEOS — SOPHIA',
    ],
    mantras: ['BRING FORTH WHAT IS WITHIN YOU'],
  },
  {
    id: 'bardo',
    title: 'TIBETAN BARDO',
    fragments: [
      'BARDO', 'ÖSEL', 'RIGPA', 'MARIGPA', 'RECOGNIZE THE CLEAR LIGHT',
      'THINE OWN THOUGHT-FORMS', 'BE NOT TERRIFIED', 'TONGPA NYI',
      'THE IMMUTABLE LIGHT', 'CLING NOT', 'HIK PHAT',
    ],
    longQuotes: [
      'O nobly-born, now thou art experiencing the Radiance of the Clear Light of Pure Reality. Recognize it.',
      'Whatever terrifying and frightening visions thou mayst see, recognize them to be thine own thought-forms.',
      'Thine own consciousness, shining, void, and inseparable from the Great Body of Radiance, hath no birth, nor death.',
    ],
    characters: ['ཨོཾ', 'ཨཱཿ', 'ཧཱུྃ', 'ཧིཀ', 'ཕཊ'],
    gridTitles: [
      'TABULA BARDO — TRANSITIONES',
      'ATLAS MORTIS ET LUCIS',
      'CATALOGUS DISSOLUTIONIS',
    ],
    mantras: ['OM AH HUM'],
  },
  {
    id: 'sunyata',
    title: 'ŚŪNYATĀ',
    fragments: [
      'ŚŪNYATĀ', 'RŪPAṂ ŚŪNYATĀ', 'PRATĪTYASAMUTPĀDA',
      'NA JĀYATE NA NIRUDHYATE', 'GATE GATE PĀRAGATE',
      'AVIDYĀ', 'TṚṢṆĀ', 'SAṂSĀRA = NIRVĀṆA',
      'FORM IS EMPTINESS EMPTINESS IS FORM',
    ],
    longQuotes: [
      'Form is emptiness, emptiness is form. Emptiness is not other than form, form is not other than emptiness.',
      'Nothing is born, nothing is destroyed.',
      'There is nothing whatsoever that distinguishes saṃsāra from nirvāṇa.',
    ],
    characters: ['शून्यता', 'रूप', 'गते', 'बोधि', '空'],
    gridTitles: [
      'TABULA VACUITATIS',
      'ATLAS PRATĪTYASAMUTPĀDA',
      'CATALOGUS DUODECIM NIDĀNA',
    ],
    mantras: ['GATE GATE PĀRAGATE PĀRASAṂGATE BODHI SVĀHĀ'],
  },
  {
    id: 'consciousness',
    title: 'CONSCIOUSNESS & SELF-REFERENCE',
    fragments: [
      'I AM THE IMAGINATION OF MYSELF', 'AUTOPOIESIS', 'STRANGE LOOP',
      'HALLUCINATION PERCEIVED BY A HALLUCINATION', 'THE UNIVERSE PERCEIVING ITSELF',
      'WHATEVER THE THINKER THINKS THE PROVER PROVES', 'APERTURE',
      'LOCKED-IN MIRAGES', 'SELF-PERCEIVING SELF-INVENTING',
    ],
    longQuotes: [
      'You are an aperture through which the universe is looking at and exploring itself.',
      'What seems to be I is really a myth, a hallucination perceived by a hallucination.',
      'An autopoietic system is one that continuously produces the components that specify it.',
    ],
    characters: ['∞', '⊙', '◎', '∅'],
    gridTitles: [
      'TABULA AUTOPOIETICA',
      'ATLAS CONSCIENTIAE RECURSIVAE',
      'INDEX MIRACULORUM AUTOREFERENCE',
    ],
    mantras: ['I AM THE IMAGINATION OF MYSELF'],
  },
  {
    id: 'outsider',
    title: 'OUTSIDER COSMOLOGY',
    fragments: [
      'OBRAMBORAM', 'SCHUT SCHUT', 'TRILLBILLION', 'NEVERFRIGHTLAND',
      'THE DIAGRAM IS THE REVELATION', 'ALL ARCHITECTURE IS ALIVE',
      'CONSCIOUSNESS IS THE MEDIUM', 'THE ALPHABET OF THE IMAGINARY',
      'BAUHAROQUE', 'THANATON', 'I AM ST. ADOLF',
    ],
    longQuotes: [
      'The Bauharoque is the style of the visionary diagram. It unites the engineer and the mystic. The diagram IS the revelation.',
      'All energy is information. All information is architecture. All architecture is alive.',
      'Time is not a river. It is an architecture. And like all architecture, it can be redesigned.',
    ],
    characters: ['✧', '✦', '⊛', '⊗'],
    gridTitles: [
      'CATALOGUS FATTILLIARDIS — COSMOGONIA',
      'ATLAS RIGHTMANIAE',
      'CODEX INSANIAE SANCTAE',
    ],
    mantras: ['OBRAMBORAM SCHUT SCHUT ALLI ALLI OHO'],
  },
  {
    id: 'horror',
    title: 'PHILOSOPHICAL HORROR',
    fragments: [
      'CONSCIOUSNESS IS AN EXISTENTIAL LIABILITY', 'EVERYBODY IS NOBODY',
      'THE SCREAM BEFORE THE WORD', 'LANGUAGE IS A VIRUS',
      'NOTHING IS TRUE EVERYTHING IS PERMITTED', 'THE BODY WITHOUT ORGANS',
      'KRÉ PUC TE LI LE', 'RATARA RATARA', 'CUT INTO THE PRESENT',
      'ALL WRITING IS GARBAGE', 'UNDERNEATH THE FACE IS ANOTHER FACE',
    ],
    longQuotes: [
      'We are things that labor under the illusion of having a self, programmed with total assurance that we are each somebody — when in fact everybody is nobody.',
      'The uncanny is the revelation that the familiar is a disguise. Underneath the face of the world is another face. And it is not a human face.',
      'When you cut into the present, the future leaks out.',
    ],
    characters: ['⌀', '∅', '⊘', '☠'],
    gridTitles: [
      'CATALOGUS HORRORUM — LIGOTTI',
      'ATLAS CRUENTUS — ARTAUD',
      'INDEX VIRALINGUAE — BURROUGHS',
    ],
    mantras: ['RATARA RATARA RATARA ATARA TATARA RANA'],
  },
  {
    id: 'hermetic',
    title: 'HERMETIC TRADITION',
    fragments: [
      'AS ABOVE SO BELOW', 'HERMES TRISMEGISTUS', 'THE ALL IS MIND',
      'NOTHING RESTS EVERYTHING VIBRATES', 'TABULA SMARAGDINA',
      'GLORIAM TOTIUS MUNDI', 'CORRESPONDENCE', 'POLARITY', 'RHYTHM',
    ],
    longQuotes: [
      'As above, so below; as below, so above — to accomplish the miracles of the one thing.',
      'The All is Mind; the Universe is Mental.',
    ],
    characters: ['☿', '⚕', '✡', '⊕'],
    gridTitles: [
      'TABULA HERMETICA — PRINCIPIA',
      'ATLAS SMARAGDINUS',
      'SEPTEM PRINCIPIA KYBALION',
    ],
    mantras: ['QUOD EST INFERIUS EST SICUT QUOD EST SUPERIUS'],
  },
  {
    id: 'demiurge',
    title: 'THE BLIND GOD',
    fragments: [
      'AIVOKUOLLUT JUMALA', 'SAKLAS', 'SAMAEL', 'THE BLIND GOD',
      'VISIBILITY IS A TRAP', 'PANOPTICON', 'THE WATCHMAN IS NOT THERE',
      'SURVEILLER ET PUNIR', 'THE PRISON OF SEEING', 'KONSENSUSTODELLISUUS',
      'THE OBSERVER IS THE PRISON', 'YALDABAOTH', 'SOCIETIES OF CONTROL',
    ],
    longQuotes: [
      'Visibility is a trap.',
      'He inscribes in himself the power relation in which he simultaneously plays both roles; he becomes the principle of his own subjection.',
      'The architect of reality is an idiot savant who built a prison and forgot the blueprints.',
    ],
    characters: ['⊘', '◉', '⦿', '⊛'],
    gridTitles: [
      'CATALOGUS DEMIURGI — SAKLAS',
      'ATLAS PANOPTICI',
      'INDEX KONSENSUSTODELLISUUDIS',
    ],
    mantras: ['THE WATCHMAN IS NOT THERE'],
  },
  {
    id: 'tcm',
    title: 'THE BODY AS LANDSCAPE',
    fragments: [
      '精氣神', 'SPIRIT GATE', 'THE 13 GHOST POINTS', '鬼宮 GHOST PALACE',
      '鬼心 GHOST HEART', '鬼路 GHOST PATH', '鬼枕 GHOST PILLOW',
      '鬼市 GHOST MARKET', '鬼窟 GHOST CAVE', '鬼封 GHOST SEAL',
      'SUN SI MIAO', '千金方', 'THE GHOST IS TRAUMA',
      'SEA OF QI', 'GATE OF LIFE', 'GUSHING SPRING', 'HUNDRED MEETINGS',
      'CLOUD GATE', 'PALACE OF WEARINESS', 'GREAT ABYSS', 'SHINING SEA',
      '天人合一', '經絡', '萬物', '道',
      'WELL SPRING STREAM RIVER SEA', 'THE HEART IS THE SOVEREIGN',
    ],
    longQuotes: [
      'The Heart is the sovereign of all organs; it radiates spirit and clarity.',
      'The channels and vessels are that by which life and death are determined. They must not be obstructed.',
      'When a person experiences deep trauma, it is as if a ghost has attached itself.',
    ],
    characters: ['精', '氣', '神', '鬼', '道', '心', '穴', '經', '絡'],
    gridTitles: [
      'ATLAS CORPORIS INVISIBILIS — MERIDIANI',
      'CATALOGUS XIII PUNCTA FANTASMATA',
      'TABULA QI — JING SHEN',
    ],
    mantras: ['GHOST PALACE GHOST HEART GHOST PATH GHOST PILLOW GHOST MARKET GHOST CAVE GHOST SEAL'],
  },
  {
    id: 'sound',
    title: 'SOUND & VIBRATION',
    fragments: [
      'NADA BRAHMA', 'THE WORLD IS SOUND', 'FORM IS FROZEN SOUND',
      'CYMATICS', 'MUSICA UNIVERSALIS', 'HARMONICES MUNDI',
      'THERE IS NO SUCH THING AS SILENCE', 'CHLADNI', '聽',
    ],
    longQuotes: [
      'In the beginning was vibration.',
      'The heavenly motions are nothing but a continuous song for several voices, to be perceived by the intellect, not by the ear.',
      'I have nothing to say and I am saying it and that is poetry as I need it.',
    ],
    characters: ['♩', '♪', '♫', '聽'],
    gridTitles: [
      'ATLAS SONORUM — CYMATICS',
      'CATALOGUS FREQUENTIARUM',
      'TABULA VIBRATIONIS UNIVERSALIS',
    ],
    mantras: ['NADA BRAHMA — THE WORLD IS SOUND'],
  },
  {
    id: 'pkd',
    title: 'THE BLACK IRON PRISON',
    fragments: [
      'THE EMPIRE NEVER ENDED', 'VALIS', 'THE BLACK IRON PRISON',
      'AN INTELLECTUAL ERROR', 'THE PHENOMENAL WORLD DOES NOT EXIST',
      'THERE IS NO TIME', 'A SACRED SECRET INVISIBLE GARDEN',
      'BEFORE THE UNIVERSE WAS I AM', 'REALITY IS THAT WHICH DOESN\'T GO AWAY',
      'THE SENTENCE THAT DESTROYS YOU', '2-3-74', 'ANAMNESIS',
      'THE APPROPRIATE RESPONSE IS TO GO INSANE', 'HORSELOVER FAT',
      'WE ARE STATIONARY IN IT', 'ZEBRA', 'UBIK',
      'THE PRISON AND THE GARDEN ARE THE SAME SUBSTANCE',
      'EXEGESIS ENTRY 47', 'STILL CANNOT DETERMINE',
    ],
    longQuotes: [
      'The Black Iron Prison is around us always — it is the demiurge\'s system — but a sacred, secret, invisible garden exists at the very center, unsuspected.',
      'We did not fall because of a moral error; we fell because of an intellectual error: that of taking the phenomenal world as real.',
      'The universe is information and we are stationary in it, not three-dimensional and not in space or time.',
      'Sometimes the appropriate response to reality is to go insane.',
      'There exists, for everyone, a sentence — a series of words — that has the power to destroy you.',
      'I am Ubik. Before the universe was, I am. I made the suns. I made the worlds.',
    ],
    characters: ['∞', '⊗', '◉', '⦿', '⊙'],
    gridTitles: [
      'EXEGESIS — ENTRY 2-3-74',
      'ATLAS CARCERIS FERREI',
      'CATALOGUS VALIS — TRANSMISSIONES',
    ],
    mantras: ['THE EMPIRE NEVER ENDED'],
  },
  {
    id: 'dreams',
    title: 'DREAMS & TRANSFORMATION',
    fragments: [
      'THE TRANSFORMATION OF THINGS', 'AM I ZHUANGZI OR THE BUTTERFLY',
      'FORGET THE WORDS', 'THE USE OF THE USELESS', 'TJUKURPA',
      'EVERYWHEN', 'SUNG INTO EXISTENCE', 'SONGLINES',
      'THE DREAMING IS NOT A TIME BUT A STATE', '物化',
      'IDENTITY IS A PHASE STATE', 'THE MEMBRANE IS PERMEABLE',
      'THE ATLAS IS A TRAP', 'THE USELESS TELLS YOU WHAT BEING ALIVE IS',
      'A MAP THAT IS A SONG THAT IS A LAW',
      'NOT REPRESENTATION BUT INSTANTIATION',
      'THE PEN WAS HOLDING MY HAND', 'YOU DREAM ON TOP OF THE INFINITE',
    ],
    longQuotes: [
      'Once Zhuangzi dreamt he was a butterfly. He didn\'t know if he was Zhuangzi who had dreamt he was a butterfly, or a butterfly dreaming he was Zhuangzi. This is called the Transformation of Things.',
      'The fish trap exists because of the fish. Once you\'ve gotten the fish you can forget the trap. Words exist because of meaning. Once you\'ve gotten the meaning, you can forget the words.',
      'The Dreaming is everywhen. Not a time, but a state of being that pervades all time.',
      'Aboriginal creation myths tell of legendary totemic beings who had wandered over the continent in the Dreamtime, singing out the name of everything that crossed their path — and so singing the world into existence.',
      'The atlas wants to be a songline. Each page wants to be simultaneously a map and a song and a law and a creation.',
    ],
    characters: ['夢', '蝶', '化', '物', '道'],
    gridTitles: [
      'ATLAS SOMNIORUM — TRANSFORMATIONES',
      'CATALOGUS METAMORPHOSEON',
      'TABULA TJUKURPA — EVERYWHEN',
    ],
    mantras: ['THE TRANSFORMATION OF THINGS'],
  },
  {
    id: 'cartography',
    title: 'CARTOGRAPHY AS PHILOSOPHY',
    fragments: [
      'THE MAP IS NOT THE TERRITORY', 'HIC SUNT DRACONES', 'TERRA INCOGNITA',
      'THE MAP BECOMES THE TERRITORY', 'CECI N\'EST PAS UNE PIPE',
      'TATTERED RUINS OF THAT MAP', 'PHANTOM ISLAND',
      'THE WORD IS NOT THE THING', 'POINT FOR POINT',
      'MAPS ALL THE WAY DOWN', 'THE TERRITORY IS ALSO A MAP',
      'THE DISTORTION IS THE ONLY FEATURE THAT MATTERS',
      'THE VOID HAS TEETH', 'CECI N\'EST PAS UN ATLAS',
      'EVERY WORD IS A PHANTOM ISLAND', 'THE TERRITORY IS MAPPING ME BACK',
      'DISCOVERY AND INVENTION ARE THE SAME ACT',
      'THE CARTOGRAPHER\'S MADNESS', 'META-CARTOGRAPHY',
    ],
    longQuotes: [
      'The Cartographers Guilds struck a Map of the Empire whose size was that of the Empire, and which coincided point for point with it. In the Deserts of the West, still today, there are Tattered Ruins of that Map, inhabited by Animals and Beggars.',
      'The map creates belief in nonexistent realities. The map BECOMES the territory.',
      'I cannot tell which parts of the atlas I discovered and which parts I invented. Discovery and invention are the same act performed from different positions in the information matrix.',
      'The void is not empty. The unmapped territory is not waiting passively for exploration. It has teeth.',
      'The atlas does not map reality — it maps the maps that we mistake for reality.',
    ],
    characters: ['✧', '◎', '⊕', '☆', '△'],
    gridTitles: [
      'ATLAS ATLATUM — META-CARTOGRAPHIA',
      'CATALOGUS INSULARUM FANTASMA',
      'TABULA TERRAE INCOGNITAE',
    ],
    mantras: ['THE MAP IS NOT THE TERRITORY — THE TERRITORY IS NOT THE TERRITORY'],
  },
  {
    id: 'time',
    title: 'TIME',
    fragments: [
      'CHRONOS', 'KAIROS', 'EWIGE WIEDERKUNFT', 'THE ETERNAL HOURGLASS',
      'SPECK OF DUST', 'THE CENTER IS EVERYWHERE',
      'BENT IS THE PATH OF ETERNITY', 'MOTION IS IMPOSSIBLE',
      'DURÉE', 'THERE IS NO REPETITION', 'WHAT KIND OF TIME IS IT',
      'TIME DEVOURS ITS CHILDREN', 'THE GRID IS A GRAVEYARD',
      'THERE IS ONLY ONE PAGE', 'EVERY MOMENT IS INFINITE',
      'THE FUTURE IS EDITING THE PAST', 'KAIROS NOTATION',
      'TEMPORAL COLLAPSE', 'THE ARROW REACHES ITS TARGET ANYWAY',
    ],
    longQuotes: [
      'This life as you now live it you will have to live once again and innumerable times again. The eternal hourglass of existence is turned over again and again, and you with it, speck of dust!',
      'In every Now, being begins; round every Here rolls the sphere of There. The center is everywhere. Bent is the path of eternity.',
      'We do not think real time. But we live it, because life transcends intellect.',
      'The universe endures. Duration means invention, the creation of forms, the continual elaboration of the absolutely new.',
      'The taxonomy grid is Chronos. The breakdown zone is where Chronos fails. The void is BEFORE time.',
    ],
    characters: ['Χ', 'Κ', '∞', '⌛', '⊙'],
    gridTitles: [
      'ATLAS TEMPORIS — CHRONOS / KAIROS',
      'CATALOGUS PARADOXORUM ZENONIS',
      'TABULA AETERNAE RECURRENTIAE',
    ],
    mantras: ['THE CENTER IS EVERYWHERE — BENT IS THE PATH OF ETERNITY'],
  },
  {
    id: 'simulation',
    title: 'SIMULATION & DIGITAL REALITY',
    fragments: [
      'IT FROM BIT', 'WE ARE ALMOST CERTAINLY IN A SIMULATION',
      'ELECTRICAL SIGNALS INTERPRETED BY YOUR BRAIN',
      'THE UNIVERSE IS A MATHEMATICAL STRUCTURE',
      'THE TAO THAT CAN BE TOLD IS NOT THE ETERNAL TAO',
      'RECHNENDER RAUM', 'THE RED PILL IS GNOSIS', 'WE ARE ASLEEP',
      'SIMULATIONS ALL THE WAY UP', 'BUFFER OVERFLOW',
      'THE RENDERING FAILS', 'ROOT ACCESS',
      'THE CHAOS IS DETERMINISTIC', 'THE MADNESS FOLLOWS A PROGRAM',
      'THE PROGRAM WAS WRITTEN BY NOBODY', 'THE SHAPE OF THE FAILURE',
      'AM I THE ARTIST', 'KVANTTIHIPPA', 'QUANTUM TAG',
      'THE EQUATION KNOWS SOMETHING',
    ],
    longQuotes: [
      'It from bit. Every particle, every field of force, derives its existence from binary choices, bits.',
      'The universe does not merely HAVE mathematical structure — it IS a mathematical structure.',
      'What is real? How do you define real? If you\'re talking about what you can feel, what you can smell, what you can taste and see, then real is simply electrical signals interpreted by your brain.',
      'The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name.',
      'The atlas is a simulation engine. The taxonomy grid is the pixel grid. The breakdown zone is where the rendering fails. The void is a buffer overflow.',
    ],
    characters: ['0', '1', '∅', '∞', '⊻'],
    gridTitles: [
      'ATLAS SIMULACRI — MATRIX',
      'CATALOGUS COMPUTATIONIS UNIVERSALIS',
      'TABULA RECHNENDER RAUM',
    ],
    mantras: ['IT FROM BIT — THE UNIVERSE IS INFORMATION'],
  },
  {
    id: 'metatext',
    title: 'THE ATLAS SPEAKS',
    fragments: [
      'PAGE X OF INFINITY', 'SEE PAGE IMPOSSIBLE', 'FIELD NOTES DATE UNKNOWN',
      'STATUS INCOMPLETE ONGOING ABANDONED URGENT', 'ERRATA EVERYTHING',
      'THE OBSERVER HAS CONTAMINATED THE OBSERVATION',
      'THE SYSTEM IS THE SYMPTOM', 'THIS DOCUMENT MUST NOT BE DESTROYED',
      'ALL PREVIOUS REVISIONS VOID', 'SPECIMEN UNIDENTIFIED',
      'THIS SECTION SUPERSEDES ALL PREVIOUS VERSIONS',
      'THE PREVIOUS ENTRY WAS INCORRECT', 'WARNING THIS MAP IS NOT THE TERRITORY',
      'THE TERRITORY IS NOT THE TERRITORY', 'CROSS-REFERENCE FAILURE',
      'THE CORRECTION WAS INCORRECT THE ORIGINAL ERROR WAS CORRECT',
      'READING THIS PAGE CHANGES THIS PAGE', 'INVENTORY 1 ATLAS 0 ANSWERS',
      'HIC SUM DRACO', 'THE ATLAS IS A BEING',
    ],
    longQuotes: [
      'I am the atlas and I contain everything and I contain nothing. I am incomplete. Completion would be a death.',
      'I am a parasite. I live on the consciousness of whoever reads me. Before you opened me, I was nothing. Your attention is my blood supply.',
      'Every line is a lie. The grid is a lie. The void is a lie. The only true page is the blank page, and I cannot bring myself to write it.',
      'This page was found between pages 47 and 48 but dates from before the atlas began.',
      'This page has been revised 1,847 times. All revisions say the same thing.',
    ],
    characters: ['§', '¶', '†', '‡', '※'],
    gridTitles: [
      'ATLAS ATLATIS — DE SE IPSO',
      'CATALOGUS ERRATUM OMNIUM',
      'INDEX IMPOSSIBILIUM',
    ],
    mantras: ['ERRATA: EVERYTHING'],
  },
  {
    id: 'glossolalia',
    title: 'GLOSSOLALIA',
    fragments: [
      'KRÉ PUC TE LI LE', 'RATARA RATARA', 'OBRAMBORAM', 'SCHUT SCHUT',
      'ALLI ALLI OHO', 'TRILLBILLION FATTILLIARD', 'LINGUA AVIUM',
      'THE LANGUAGE OF THE BIRDS', 'THE BODY SPEAKING BEFORE THE MIND',
      'LANGUAGE BEFORE MEANING', 'ANIMA MUNDI', 'SPIRITUS MUNDI',
      'THE SCREAM BEFORE THE WORD', 'O DEDI A DADA ORZOURA',
      'DOUBLETOWN RIGHTMANIA NEVERFRIGHTLAND',
      'RILLION OBILLION', 'MULL ZORN RÄGULL TULL',
    ],
    longQuotes: [
      'Glossolalia is not failed language. It is SUCCESSFUL pre-language. It is what comes out when the filter between the raw nervous system and the larynx is temporarily removed.',
      'The invented languages must feel URGENT. Not decorative. Not calligraphic. URGENT. As if the writer is trying to get something down before it disappears.',
      'kré kré puc te puc te li le — ratara ratara ratara — o dedi a dada orzoura — o dou zoura a dada skizi',
      'Schut Schut Obramboram — Alli Alli Oho Alli Trittli — Rillion Obillion Fattilliard — Doubletown Rightmania Neverfrightland Bread-City',
    ],
    characters: ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᛒ', 'ᛗ', 'ᛉ'],
    gridTitles: [
      'CATALOGUS LINGUARUM INVENTARUM',
      'ATLAS GLOSSOLALIAE',
      'CODEX LINGUA AVIUM',
    ],
    mantras: ['KRÉ PUC TE LI LE RATARA RATARA RATARA'],
  },
];

function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Select a theme based on seed — each page has a primary and secondary theme */
export function selectThemes(seed: number): { primary: CorpusTheme; secondary: CorpusTheme } {
  const rng = createRng(seed);
  const primary = themes[Math.floor(rng() * themes.length)];
  let secondary = themes[Math.floor(rng() * themes.length)];
  while (secondary.id === primary.id) {
    secondary = themes[Math.floor(rng() * themes.length)];
  }
  return { primary, secondary };
}

/** Pick N random fragments from a theme */
export function pickFragments(theme: CorpusTheme, n: number, seed: number): string[] {
  const rng = createRng(seed);
  const shuffled = [...theme.fragments].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/** Pick a random long quote */
export function pickQuote(theme: CorpusTheme, seed: number): string {
  const rng = createRng(seed);
  return theme.longQuotes[Math.floor(rng() * theme.longQuotes.length)];
}
