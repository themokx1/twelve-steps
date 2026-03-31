export type AcaStep = {
  number: number;
  title: string;
  subtitle: string;
  purpose: string;
  meetingLens: string;
  prayer: string;
  questions: string[];
  practices: Array<{
    label: string;
    hint: string;
  }>;
  affirmation: string;
  celebration: string;
};

export const ACA_OPENING_LINES = [
  "Itt nem kell bizonyítanod. Elég, hogy megérkeztél.",
  "Megérdemled, hogy jó történjen veled, és azt is, hogy ebben támogatást kapj.",
  "Ma nem az egész utat kell végigjárnod, csak a következő igaz lépést."
];

export const ACA_MEETING_FLOW = [
  {
    title: "Megérkezés",
    body: "Lassíts le. Ne teljesíteni próbálj, hanem megérkezni saját magadhoz."
  },
  {
    title: "Becsekkolás",
    body: "Mondd ki, mi van most benned: érzés, testi állapot, szükséglet."
  },
  {
    title: "Mai lépés",
    body: "A kiválasztott lépésből egy kérdésre, egy gyakorlatra és egy őszinte mondatra figyelünk."
  },
  {
    title: "Lezárás",
    body: "Egy apró vállalással zárunk, nem maximalizmussal."
  }
];

export const ACA_AFFIRMATIONS = [
  "Megérdemled, hogy jó történjen veled.",
  "Megérdemled a szeretetteljes határokat.",
  "Megérdemled, hogy komolyan vegyék az érzéseidet.",
  "Megérdemled, hogy lassan is haladhass."
];

export const ACA_QUICK_PROMPTS = [
  "Segíts megfogalmazni, mit érzek most.",
  "Adj egy pici következő lépést a mai munkámhoz.",
  "Állíts meg finoman, ha kerülöm a lényeget.",
  "Fogalmazd át szeretetteljesen, de őszintén a jegyzetemet."
];

export const STEPS: AcaStep[] = [
  {
    number: 1,
    title: "Beismerem, hogy egyedül nem bírom kontrollálni a régi mintákat",
    subtitle: "A tagadás helyett valóság.",
    purpose: "Az első lépésben megengedem magamnak, hogy kimondjam: a túlélési mintáim valóban kifárasztanak, és már nem akarok úgy tenni, mintha minden rendben lenne.",
    meetingLens: "Nem gyengeség belátni, hogy segítség kell, hanem a gyógyulás kezdete.",
    prayer: "Ma nem bizonyítok. Ma igazat mondok arról, ami túl sok.",
    questions: [
      "Hol feszülök meg attól, hogy mindent kézben akarok tartani?",
      "Milyen visszatérő helyzetben érzem azt, hogy elveszítem önmagam?",
      "Mitől félek, ha tényleg elismerem a tehetetlenségemet?"
    ],
    practices: [
      {
        label: "Nevezd meg a mintát",
        hint: "Írj le egy konkrét mondatot arról, mi az, amit újra és újra csinálsz."
      },
      {
        label: "Mondd ki a költségét",
        hint: "Írd mellé, mibe kerül neked ez a minta érzelmileg vagy kapcsolatilag."
      },
      {
        label: "Kérj külső támaszt",
        hint: "Jelöld meg, kitől kérsz ma emberi vagy közösségi támogatást."
      }
    ],
    affirmation: "Megérdemled, hogy ne egyedül cipeld azt, ami túl nehéz.",
    celebration: "Bátorság pont: ma valóságot mondtál a túlélés helyett."
  },
  {
    number: 2,
    title: "Megnyílok annak, hogy a segítség valóban megtarthat",
    subtitle: "Remény a merevség helyett.",
    purpose: "Megengedem, hogy a gyógyulás ne csak rajtam múljon. Az ACA közösség, a felsőbb erő és a józan kapcsolódás hordozhat engem.",
    meetingLens: "A remény nem naivitás, hanem a bezáródás felengedése.",
    prayer: "Mutasd meg, hogy nem vagyok egyedül, és hogy tarthat valami nálam nagyobb is.",
    questions: [
      "Mikor tapasztaltam meg utoljára, hogy valaki vagy valami valóban megtartott?",
      "Mi gátol abban, hogy segítséget befogadjak?",
      "Hogyan nézne ki számomra egy szeretetteljesebb erő?"
    ],
    practices: [
      {
        label: "Reménylista",
        hint: "Sorolj fel három dolgot, ami ma mégis megtart."
      },
      {
        label: "Segítség befogadása",
        hint: "Engedj be egy apró támogatást anélkül, hogy azonnal viszonoznád."
      },
      {
        label: "Biztonságmondat",
        hint: "Írj egy mondatot arról, milyen lenne, ha nem kéne mindig egyedül megoldani mindent."
      }
    ],
    affirmation: "Megérdemled, hogy jó történjen veled támogatás formájában is.",
    celebration: "Fény pont: ma nem csak kibírtad, hanem befogadtál valamit."
  },
  {
    number: 3,
    title: "Rábízom magam a gyógyulás útjára",
    subtitle: "Elengedem a kényszeres önirányítást.",
    purpose: "A harmadik lépés nem passzivitás, hanem annak gyakorlása, hogy nem a félelmem diktál minden döntést.",
    meetingLens: "A kontroll helyett kapcsolatot választok.",
    prayer: "Segíts ma azt tenni, ami helyes, ne csak azt, ami megszokott.",
    questions: [
      "Milyen döntéseimet vezeti ma is a félelem?",
      "Hol lenne felszabadítóbb, ha nem nekem kellene mindent kézben tartanom?",
      "Mit jelent nekem ma a bizalom cselekvésben?"
    ],
    practices: [
      {
        label: "Elengedés-lista",
        hint: "Írj le egy dolgot, amit ma nem akarsz túlkontrollálni."
      },
      {
        label: "Iránytűkérdés",
        hint: "Mielőtt döntesz, kérdezd meg: ez félelemből jön, vagy szeretetből?"
      },
      {
        label: "Kis átadás",
        hint: "Adj át egy ma nyomasztó ügyet imában vagy rövid csendben."
      }
    ],
    affirmation: "Megérdemled, hogy ne a rettegés vezesse az életedet.",
    celebration: "Lágy erő: ma nem ráfeszültél, hanem ráhagyatkoztál."
  },
  {
    number: 4,
    title: "Őszinte és gyengéd leltárt készítek magamról",
    subtitle: "Tisztánlátás szégyen nélkül.",
    purpose: "A negyedik lépésben nem bántani akarom magam, hanem pontosabban látni a sebeimet, a mintáimat és a kapcsolati mozgásaimat.",
    meetingLens: "Az önismeret nem vádirat, hanem tiszta tükör.",
    prayer: "Adj nekem bátorságot az őszinteséghez és gyengédséget ahhoz, amit találok.",
    questions: [
      "Milyen ismétlődő sérüléseket hordozok kapcsolatokban?",
      "Hol tanultam meg letagadni a valódi érzéseimet?",
      "Milyen szerepekkel próbálom elnyerni a biztonságot vagy szeretetet?"
    ],
    practices: [
      {
        label: "Mintatérkép",
        hint: "Válassz ki egy visszatérő konfliktust, és bontsd szét érzésre, félelemre, reakcióra."
      },
      {
        label: "Szégyen helyett tény",
        hint: "Minden állításod mellé írd oda: ez egy megfigyelés, nem ítélet."
      },
      {
        label: "Belső gyermek figyelése",
        hint: "Jelöld meg, hol érezhető az a részed, aki régen próbált túlélni."
      }
    ],
    affirmation: "Megérdemled, hogy igazat mondj magadról anélkül, hogy bántanád magad.",
    celebration: "Tükörfény: ma közelebb mentél az igazsághoz."
  },
  {
    number: 5,
    title: "Kimondom az igazat egy megtartó kapcsolatban is",
    subtitle: "A titok helyett kapcsolódás.",
    purpose: "Az ötödik lépésben megosztom a leltáram lényegét valakivel, akiben van tartás és szeretet. A gyógyulásban hangot kap az igazság.",
    meetingLens: "A kimondott igazság csökkenti a szégyen erejét.",
    prayer: "Adj biztonságot, hogy kimondjam azt is, amit eddig elrejtettem.",
    questions: [
      "Mit tartok még mindig túl veszélyesnek kimondani?",
      "Kinek tudok ma úgy beszélni, hogy közben nem kell védekeznem?",
      "Mi változik bennem, ha a titok helyett kapcsolatba viszem az igazat?"
    ],
    practices: [
      {
        label: "Válassz megtartó tanút",
        hint: "Ne akárkinek nyiss meg, hanem annak, aki bírja a valóságot."
      },
      {
        label: "Mondd röviden és igazán",
        hint: "Egyetlen fontos részt oszd meg a leltáradból sallang nélkül."
      },
      {
        label: "Figyeld a tested",
        hint: "Észleld, hogyan reagál a tested arra, hogy végre kimondod."
      }
    ],
    affirmation: "Megérdemled, hogy a valóságoddal együtt is kapcsolatban maradjanak veled.",
    celebration: "Kapcsolódás pont: ma az igazságod nem maradt egyedül."
  },
  {
    number: 6,
    title: "Készen állok elengedni, ami már nem szolgál",
    subtitle: "Készség a kapaszkodás helyett.",
    purpose: "Nem kell már ragaszkodnom a túlélő működéseimhez csak azért, mert ismerősek. Kész lehetek valami tisztábbra.",
    meetingLens: "A készség sokszor megelőzi az érzést.",
    prayer: "Adj készséget elengedni azt, ami ugyan védett, de ma már bánt.",
    questions: [
      "Melyik mintámhoz ragaszkodom úgy, mintha még mindig életmentő lenne?",
      "Mit veszítek, ha ezt tovább őrzöm?",
      "Mi lenne felszabadítóbb nélküle?"
    ],
    practices: [
      {
        label: "Régi védelem azonosítása",
        hint: "Nevezd meg, mi volt a haszna régen ennek a működésnek."
      },
      {
        label: "Mai ára",
        hint: "Írd le, hogyan árt ma ugyanez neked."
      },
      {
        label: "Készségmondat",
        hint: "Mondd ki: még ha félek is, kész vagyok másképp élni."
      }
    ],
    affirmation: "Megérdemled, hogy a túlélésnél több jusson neked.",
    celebration: "Oldódás pont: ma meglazult egy régi páncél."
  },
  {
    number: 7,
    title: "Alázattal kérek segítséget a változáshoz",
    subtitle: "Nem erőből, hanem kapcsolatból.",
    purpose: "Ebben a lépésben nem önmagam megjavítását erőltetem, hanem segítséget kérek ahhoz, amihez egyedül kevés vagyok.",
    meetingLens: "Az alázat nem megalázkodás, hanem valós kapcsolódás a segítséghez.",
    prayer: "Kérlek, vedd el tőlem azt, ami eltakarja a valódi önmagamat.",
    questions: [
      "Miért nehéz nekem kérni, nem csak teljesíteni?",
      "Milyen hibámat próbálom még mindig akaraterőből megoldani?",
      "Hogyan nézne ki az alázat a mai napomban?"
    ],
    practices: [
      {
        label: "Kérés gyakorlása",
        hint: "Kérj ma egy konkrét, mérhető segítséget."
      },
      {
        label: "Nem önostorozás",
        hint: "Írd le, hogy a változás nem attól lesz valós, hogy megalázod magad."
      },
      {
        label: "Egy mondatos ima",
        hint: "Használj rövid, saját szavaiddal megfogalmazott segítségkérést."
      }
    ],
    affirmation: "Megérdemled, hogy segítséget kapj a változáshoz is.",
    celebration: "Alázat pont: ma nem keményebb lettél, hanem nyitottabb."
  },
  {
    number: 8,
    title: "Összegyűjtöm, hol okoztam kárt, és hajlandó leszek helyrehozni",
    subtitle: "Felelősség szeretettel.",
    purpose: "A nyolcadik lépésben nem önbüntetésből, hanem tisztulásból tekintek rá a kapcsolataimra és a saját részemre bennük.",
    meetingLens: "A felelősségvállalás nem törli a múltat, de visszaadja a tartást.",
    prayer: "Mutasd meg, hol tartozom igazsággal és helyreállító szándékkal.",
    questions: [
      "Kivel szemben hordozok még rendezetlenséget?",
      "Hol voltam én is bántó, távolságtartó vagy elérhetetlen?",
      "Mi lenne a jóvátétel valódi szándéka a bizonyítás helyett?"
    ],
    practices: [
      {
        label: "Kapcsolati lista",
        hint: "Írj össze neveket ítélkezés nélkül, csak valóságosan."
      },
      {
        label: "Saját rész kimondása",
        hint: "Minden név mellé csak azt írd, ami tényleg a te részed."
      },
      {
        label: "Szándék tisztázása",
        hint: "Kérdezd meg: a megkönnyebbülésemért csinálom, vagy a helyreállításért?"
      }
    ],
    affirmation: "Megérdemled, hogy tisztább, egyenesebb kapcsolatokban élj.",
    celebration: "Tartás pont: ma nem elfordultál, hanem szembenéztél."
  },
  {
    number: 9,
    title: "Ahol lehet és nem árt, jóvátételt teszek",
    subtitle: "Helyreállítás bölcs határokkal.",
    purpose: "A kilencedik lépésben cselekszem, de nem vakon. A jóvátétel nem újabb kár, hanem körültekintő helyreállítás.",
    meetingLens: "Az igaz jóvátétel egyszerre bátor és fegyelmezett.",
    prayer: "Adj tisztánlátást, hogy ott tegyek jóvát, ahol az valóban gyógyító.",
    questions: [
      "Melyik kapcsolatban lenne valódi helye a jóvátételnek?",
      "Hol okozna több kárt a túl gyors vagy öncélú megkeresés?",
      "Milyen jóvátétel nem szóban, hanem viselkedésben valósul meg?"
    ],
    practices: [
      {
        label: "Szűrő kérdés",
        hint: "Vizsgáld meg: biztonságos-e, időszerű-e, szolgálja-e a másik javát is."
      },
      {
        label: "Rövid tervezet",
        hint: "Fogalmazd meg előre a jóvátételt egyszerűen, védekezés nélkül."
      },
      {
        label: "Viselkedéses jóvátétel",
        hint: "Ne csak mondj valamit, hanem válassz tartósan más működést."
      }
    ],
    affirmation: "Megérdemled, hogy a múltad ne uralja örökké a kapcsolataidat.",
    celebration: "Helyreállítás pont: ma a felelősségből cselekvés lett."
  },
  {
    number: 10,
    title: "Naponta figyelem magam, és gyorsan korrigálok",
    subtitle: "Folyamatos őszinteség.",
    purpose: "A tizedik lépés a mindennapi tisztaság gyakorlata. Nem gyűjtöm fel hetekig a torzulást, hanem időben észlelem és javítom.",
    meetingLens: "A napi őszinteség megkímél a nagy összeomlásoktól.",
    prayer: "Segíts észrevenni ma is gyorsan, ha letértem arról, ami igaz.",
    questions: [
      "Hol csúsztam ma védekezésbe, elkerülésbe vagy túlalkalmazkodásba?",
      "Mit kellene még ma tisztáznom vagy beismernem?",
      "Mi segít abban, hogy ne halogassam a korrekciót?"
    ],
    practices: [
      {
        label: "Napi mini leltár",
        hint: "Este három sorban írd le: mi volt tiszta, mi volt zavaros, mi a korrekció."
      },
      {
        label: "Gyors jóvátétel",
        hint: "Ha ma mellélőttél, ne várj napokig a rendezéssel."
      },
      {
        label: "Pihenő kérdés",
        hint: "Tedd fel magadnak: most mire van igazán szükségem, nem csak mit szoktam csinálni?"
      }
    ],
    affirmation: "Megérdemled a mindennapi tisztulást, nem csak a ritka nagy áttöréseket.",
    celebration: "Ritmus pont: ma időben észrevetted magad."
  },
  {
    number: 11,
    title: "Elmélyítem a kapcsolatomat a vezetéssel és a csenddel",
    subtitle: "Kapcsolódás napi alapokon.",
    purpose: "Az imádság, a csend, a meditáció vagy a figyelmes jelenlét által közelebb kerülök ahhoz a vezetéshez, ami nem a félelmemből szól.",
    meetingLens: "A csend nem üresjárat, hanem ráhangolódás.",
    prayer: "Adj nyitott szívet, tisztább hallást és bátorságot követni a jót.",
    questions: [
      "Mikor tudok leginkább lelassulni úgy, hogy valóban halljak is?",
      "Mi az, amit a belső csendben már tudok, csak napközben túlkiabálom?",
      "Hogyan szól hozzám a vezetés békésebb pillanatokban?"
    ],
    practices: [
      {
        label: "Három perc csend",
        hint: "Csak lélegezz és figyeld, mi emelkedik fel benned erőltetés nélkül."
      },
      {
        label: "Iránykérdés",
        hint: "Kérdezd meg: mi a következő szeretetteljes és igaz lépés?"
      },
      {
        label: "Rövid lejegyzés",
        hint: "Írd le a csendből jött egy mondatot, hogy később se veszítsd el."
      }
    ],
    affirmation: "Megérdemled, hogy ne csak túlélj, hanem belső vezetést is kapj.",
    celebration: "Csend pont: ma nem csak reagáltál, hanem figyeltél."
  },
  {
    number: 12,
    title: "Továbbadom, amit kaptam, és napi gyakorlatként élem ezt az utat",
    subtitle: "Megosztott gyógyulás.",
    purpose: "A tizenkettedik lépésben az út már nem csak rólam szól. Amit kaptam, azt életté és kapcsolattá formálom, és mások felé is továbbadom.",
    meetingLens: "A gyógyulás megszilárdul, amikor megosztássá válik.",
    prayer: "Segíts úgy élni ezt az utat, hogy abból mások is reményt kapjanak.",
    questions: [
      "Milyen tapasztalatot tudok ma tisztán és alázattal továbbadni?",
      "Hol látszik már az életemben, hogy ez az út formál?",
      "Hogyan tudok jelen lenni másoknak megmentés nélkül, mégis szeretettel?"
    ],
    practices: [
      {
        label: "Tapasztalat megosztása",
        hint: "Mondd ki valakinek, mi segített neked ma vagy a héten."
      },
      {
        label: "Szolgálat aprón",
        hint: "Tegyél valami egyszerű, tiszta szolgálatot a közösségedért vagy egy társadért."
      },
      {
        label: "Életben tartás",
        hint: "Válassz egy napi rutint, amivel a lépések nem csak gondolatok maradnak."
      }
    ],
    affirmation: "Megérdemled, hogy a gyógyulásod ne csak túlélés, hanem ajándék legyen.",
    celebration: "Fáklya pont: ma abból adtál, amit te is kaptál."
  }
];

export function getStepByNumber(stepNumber: number | undefined) {
  return STEPS.find((step) => step.number === stepNumber) ?? STEPS[0];
}

