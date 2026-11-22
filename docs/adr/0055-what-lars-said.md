# 0055. The tenth station is Gamle Oslo; the encore has a tune; a level's difficulty and enemies follow its place

Decided 2026-11-22 by Lars, answering the questions that waited for him (relayed by his other session; his words in
`docs/games/handbook/conversations.md`, "Lars's answers, 22 November 2026"). Carried out by the order 34 implementer
(`docs/games/orders/34-what-lars-said.md`). Supersedes the name in [0038](0038-valerenga.md); amends
[0052](0052-the-encore.md) (the encore's sound and Loki's look, within its limits, which stand); within
[0014](0014-personal-details-discreetly.md) (the repository is public).

## 1. The tenth station is called Gamle Oslo, and nothing in it says "home"

Lars: "rename it Gamle Oslo". "I don't want references to home. It's more of an ode to Oslo. Oslo is my home. Not just
gamle Oslo."

- **The name a player reads is Gamle Oslo**, in both languages: the station's name (`levels/index.ts`), from which the map's
  board, the loading board, the cards, the runes' count and the screen reader's lines follow; the level's banner
  (`levels/nabolaget.ts`); line 2's gate sign ("Opens once Gamle Oslo is cleared", `levels/kart.ts`); the page's description;
  LEVELS.html and the docs that describe the game as it is.
- **The id stays `nabolaget`**, for the reasons ADR 0038 gave: stored progress, addresses, files, tests and tools.
- **Its words lose "home"** and the claim that a house is his, and are written as an ode to Oslo: the evening walk over the
  old east side, from Vålerenga's wooden houses over the hill. The banner's second line "A winter night on the east side" /
  "Vinternatt på østkanten" (was "Homeward through Gamle Oslo"); where in Oslo "From Vålerenga's wooden houses over the hill"
  / "Fra trehusene på Vålerenga, over bakken" (was "From Vålerenga home to Kværnertoppen"); the plough waking, "The last
  thing between you and a quiet evening." / "Det siste mellom deg og en rolig kveld." (was "… the door home."); the plough
  beaten, "The plough parks. / The street is clear, for once." / "Brøytebilen parkerer. / Gata er fri, for en gangs skyld."
  (was "The way home is clear."); the card with the tenth rune, "Ten of ten runes: LARS HANSEN. Oslo, end to end." / "Ti av ti
  runer: LARS HANSEN. Oslo, fra ende til annen." (was "Welcome home."). Two other ways beside each are in `conversations.md`.
- **What stays.** Vålerenga is still a place in the level (its first sign, the church, the lane behind it): it is a
  neighbourhood inside the borough Gamle Oslo, so both are true. The Pi, the cranes, the yellow house and the place names on
  plates stay as drawn, with no new words about them. The doors at the level's end and at the line map's far left keep the
  label "Hjem" / "Home": they lead to the site's front page, which the header also calls "Gamle Oslo". The story's lines in
  `game/story.ts` above the encore's block do not change ("Oslo walks home" in the encore's ending is the crowd's home).
- **Code and docs** that called the house his home call it the yellow house (`YELLOW`, `yellowHouse` in `levels/nabolaget.ts`,
  where they were `HOME`, `home`; the light census names the function).

What ADR 0038 feared happens: "Gamle Oslo" is now the header's link to the front page, Ekeberg's banner ("The hillside above
Gamle Oslo") and the tenth station. Lars chose it knowing the level is in Gamle Oslo and the front page is a walk through it.

## Not chosen

- **Renaming the id** to `gamleoslo`: it would lose everyone's stored progress for no gain a player sees (ADR 0038's reason).
- **Taking "Hjem" off the doors**: they lead to the site's home page; "Hjem" there is the site's, not his.
- **New words about the Pi, the cranes or the yellow house**: they stay as drawn, unexplained (ADR 0014).
