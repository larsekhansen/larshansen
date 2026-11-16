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
