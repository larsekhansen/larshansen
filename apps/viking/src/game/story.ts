// The story of the glamour (order 27, ADR 0050), every line of it in one place so it can be reworded here and nowhere
// else. It comes in `feel`'s file, not the first script.
//
// It is a joke and is told as one: in the voice of a tabloid or a saga gone wrong ("Reports say", "It is told"), never as
// a claim of fact. The man who paid is named once in the opening and once on the map's sign, never drawn, never a
// character or a boss. What it laughs at is what powerful people do in public (sulking over a prize, paying for revenge,
// spectacle), never anyone's looks, health, family or supporters; and Oslo is teased as warmly as anyone (the committee's
// straight face, the sauna queue, the price of a beer, 17 May's earnestness, the scooters). The glamour is the game's word
// for the spell, the same everywhere: it is on a station, a stomp breaks it, a rune lifts it. In Norwegian it is a
// "synkverving", the old word for the illusions Loke and his kind cast. No real band, song or lyric anywhere.

export interface StoryWords {
  /** The opening card, the first time he arrives on the map (and on the map's sign after): its title, its lines, its button. */
  title: string;
  opening: string[];
  onward: string;
  /** Under the map's title the first time he arrives on it. */
  mapSub: string;
  /** The sign by Langkaia's station that tells it again. */
  signLabel: string;
  sign: string[];
  /** Under a level's name as he arrives, where the story has a line for it (the first level the first time, Rådhuset). */
  arrival: Record<string, string>;
  /** Each boss's second line as it wakes. */
  boss: { troll: string; plough: string; serpent: string };
  /** The card's last line with the tenth rune (line 1 lifted), and with the last rune of line 2 (all of Oslo). */
  endOne: string;
  endTwo: string;
}

export const STORY: Record<"nb" | "en", StoryWords> = {
  en: {
    title: "Oslo, glammed",
    opening: [
      "Reports say Donald Trump did not get the Peace Prize, and took it badly.",
      "He paid Loki to make Oslo sorry. Loki took the money and did it his own way:",
      "his Neon Invaders have put an 80s glamour on the whole city.",
      "A viking with a T-bane card is all that stands between Oslo and eternal hair spray."
    ],
    onward: "To the line",
    mapSub: "The glamour is on Oslo",
    signLabel: "The news",
    sign: ["No Peace Prize for Donald Trump.", "He sulked, and paid Loki.", "Loki glammed Oslo up instead.", "Stomp it off; the runes lift it."],
    arrival: {
      langkaia: "The glamour starts at the quay",
      radhuset: "Where the Peace Prize lives"
    },
    boss: {
      troll: "Loki gave it a mullet. It is not happy either.",
      plough: "On tour: the snow plough. Loki's headliner.",
      serpent: "Neon crest. Shades on. It still bites."
    },
    endOne: "Line 1 is plain Oslo again. A beer still costs what it costs.",
    endTwo: "The glamour lifts. Loki keeps the money. Somebody will have to explain the invoice."
  },
  nb: {
    title: "Oslo, glammet",
    opening: [
      "Ifølge avisene fikk ikke Donald Trump fredsprisen, og han tok det tungt.",
      "Han betalte Loke for å gjøre Oslo lei seg. Loke tok pengene og gjorde det på sin måte:",
      "Neoninvaderne hans har lagt en åttitallssynkverving over hele byen.",
      "En viking med T-banekort er alt som står mellom Oslo og evig hårspray."
    ],
    onward: "Til linja",
    mapSub: "Synkvervingen ligger over Oslo",
    signLabel: "Siste nytt",
    sign: ["Ingen fredspris til Donald Trump.", "Han surmulte, og betalte Loke.", "Loke glammet opp Oslo i stedet.", "Tramp det av; runene løfter det."],
    arrival: {
      langkaia: "Synkvervingen begynner på kaia",
      radhuset: "Her bor fredsprisen"
    },
    boss: {
      troll: "Loke ga det hockeysveis. Det er ikke fornøyd.",
      plough: "På turné: brøytebilen. Lokes hovednummer.",
      serpent: "Neonkam. Solbriller. Det biter likevel."
    },
    endOne: "Linje 1 er vanlige Oslo igjen. En pils koster fortsatt det den koster.",
    endTwo: "Synkvervingen letter. Loke beholder pengene. Noen må forklare fakturaen."
  }
};

/**
 * Other ways to tell the opening and the ending, for Lars to choose between (none of them is shown; swap one in above).
 * English first, then Norwegian.
 */
export const ALTERNATIVES = {
  opening: [
    [
      "It is told that a certain president was passed over for the Peace Prize, and sulked for a week in public.",
      "Then he rang Loki. Loki answered, took the money, and put an 80s glamour on Oslo.",
      "Now every rat wears shades. Somebody has to stomp it off."
    ],
    [
      "BREAKING: No Peace Prize for Donald Trump. Sources describe the mood as stormy.",
      "Loki has been paid to make Oslo sorry, and has made it fabulous instead.",
      "The committee has kept a straight face throughout."
    ],
    [
      "Det fortelles at en viss president ble forbigått til fredsprisen, og surmulte en uke i offentligheten.",
      "Så ringte han Loke. Loke svarte, tok pengene og la en åttitallssynkverving over Oslo.",
      "Nå går hver rotte med solbriller. Noen må trampe den av."
    ]
  ],
  ending: [
    ["Oslo is itself again. Loki has sent the invoice on to Oslo kommune.", "Oslo er seg selv igjen. Loke har sendt fakturaen videre til Oslo kommune."],
    ["The glamour lifts. Somewhere a man is still sulking; Oslo has gone for a sauna.", "Synkvervingen letter. Et sted surmuler en mann fortsatt; Oslo har gått i badstua."]
  ]
};

// ---------------------------------------------------------------------------------------------------------------------
// THE ENCORE (order 29, ADR 0052). Everything above this line is order 27's and stays as it is (`story.test.ts` holds it);
// the encore's words are all below. Loki is met once, on a small stage in Middelalderparken, after every rune of both lines:
// a banner as he arrives, a line as Loki wakes, a line as each piece of his glamour comes off, his leaving line, and the
// ending card; the hints say which boss's move he borrowed and how it is answered. Loki is the trickster of the old stories
// dressed as an 80s front man, and nobody real. The man who paid is not named, drawn or quoted here. Oslo is teased as
// warmly as he is (its November, its audiences who stand still), and the ending leaves it plain and content.

export interface EncoreWords {
  /** Under the place's name as he arrives at the stage. */
  arrival: string;
  /** As Loki wakes (the show starts). */
  wake: string;
  /** As each piece comes off: the hair (a wig), the shades, the jacket. */
  piece1: string;
  piece2: string;
  piece3: string;
  /** Plain, in his wool sweater with his thermos, as he shrugs and goes. */
  leaving: string;
  /** The hints, each said only when true: the opening let go by, and what hurt him (the move and its answer). */
  miss: string;
  missClub: string;
  missCharge: string;
  missBite: string;
  /** The ending card's line, after the time. */
  ending: string;
}

export const ENCORE: Record<"nb" | "en", EncoreWords> = {
  en: {
    arrival: "Loki has one more song",
    wake: "Good evening, Oslo!\nOne more, then you can all go home.",
    piece1: "That was a wig.\nYou all knew.",
    piece2: "Shades, in November.\nFair point.",
    piece3: "Careful. That jacket was rented.",
    leaving: "Lovely crowd. Nobody danced,\nbut nobody left either.",
    miss: "Between his moves he strikes a pose.\nJump on him then.",
    missClub: "The troll's club, in neon.\nJump as it comes down.",
    missCharge: "The plough's charge, on his knees.\nGet up on a speaker while he revs.",
    missBite: "The serpent's ring of foam.\nBe out of it before it bites.",
    ending: "The stage lights are just lights again. Oslo walks home, plain and quite content."
  },
  nb: {
    arrival: "Loke har ett nummer til",
    wake: "God kveld, Oslo!\nEtt nummer til, så kan dere gå hjem.",
    piece1: "Det var en parykk.\nDet visste dere.",
    piece2: "Solbriller i november.\nGreit nok.",
    piece3: "Forsiktig. Den jakka er leid.",
    leaving: "Fint publikum. Ingen danset,\nmen ingen gikk heller.",
    miss: "Mellom numrene står han i positur.\nHopp på ham da.",
    missClub: "Trollets klubbe, i neon.\nHopp når den kommer ned.",
    missCharge: "Brøytebilens rush, på knærne.\nOpp på en høyttaler mens han turer opp.",
    missBite: "Sjøormens ring av skum.\nVær ute av den før den biter.",
    ending: "Scenelysene er bare lys igjen. Oslo går hjem, vanlig og ganske fornøyd."
  }
};

/**
 * Other ways to say the encore's lines, for Lars to choose between (none of them is shown; swap one in above). Each:
 * English, then Norwegian.
 */
export const ENCORE_ALTERNATIVES = {
  arrival: [
    ["By popular demand, apparently", "Etter sigende etter stor etterspørsel"],
    ["The encore nobody asked for", "Ekstranummeret ingen ba om"]
  ],
  wake: [
    ["Oslo! Are you ready?\nNo? Fair. One more anyway.", "Oslo! Er dere klare?\nNei? Greit. Ett til likevel."],
    ["Thank you, Oslo!\nI can see two of you dancing.", "Takk, Oslo!\nJeg ser to av dere danse."]
  ],
  piece1: [["Not my real hair. Obviously.", "Ikke mitt eget hår. Selvsagt."]],
  piece2: [["Who wears shades in Oslo in winter?\nMe. Until now.", "Hvem går med solbriller i Oslo om vinteren?\nJeg. Til nå."]],
  piece3: [["The jacket goes back on Monday.", "Jakka skal tilbake på mandag."]],
  leaving: [
    ["Right. I'll get the tram.", "Greit. Jeg tar trikken."],
    ["Fine. The coffee is still hot, at least.", "Greit. Kaffen er i det minste varm."]
  ],
  ending: [
    ["The mirror ball has stopped. Oslo puts its hat back on and goes home.", "Diskokula har stoppet. Oslo tar på seg lua og går hjem."],
    ["Oslo is itself again: grey, calm, and a little pleased with itself.", "Oslo er seg selv igjen: grå, rolig og litt fornøyd med seg selv."]
  ]
};
