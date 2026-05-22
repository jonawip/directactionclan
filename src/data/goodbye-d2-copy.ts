/** Edit all Goodbye D2 homepage wording here. */
export const goodbyeD2Copy = {
  seo: {
    title: 'Goodbye, Guardians - Direct Action Clan',
    description:
      'Direct Action marks the end of Destiny 2 active development with a week of fireteam sessions, 9-15 June 2026, on games.directaction.monster.',
    ogImageAlt: "Direct Action Destiny 2 collage: thank you for all of the memories"
  },
  heroLead:
    'Active development ends 9 June 2026 with Monument of Triumph. Get the fireteam back together.',
  sections: {
    finalOp: { code: '01', label: 'Final op', title: 'One last', titleAccent: 'fireteam.' },
    week: { code: '02', label: 'The week', title: 'Seven days.', titleAccent: 'Two tracks.' },
    wire: { code: '03', label: 'Live feed', title: 'On the', titleAccent: 'wire.' },
    rotation: { code: '04', label: 'Also playing', title: "What's", titleAccent: 'next.' }
  },
  about: {
    stamp: 'FINAL OP',
    tag: 'LAST LIGHT',
    game: 'DESTINY 2',
    tagline: 'Live service sunset // Bungie // 2017-2026',
    rows: [
      { label: 'Location', value: 'The Last City' },
      { label: 'Schedule', value: '9-15 June, UK time' },
      { label: 'Squad', value: 'Fireteam (six for raids, three for strikes)' }
    ] as const,
    body: [
      'Destiny 2 has been in our rotation for years. This week we run what we still love while we can.',
      'Any skill level is fine. Post a session on the board or join one already up.'
    ] as const,
    coords: 'COORDS 40.808°N // 73.923°W // SIG FADING',
    classes: [
      { num: 'CL/01', name: 'Titan' as const },
      { num: 'CL/02', name: 'Hunter' as const },
      { num: 'CL/03', name: 'Warlock' as const }
    ] as const
  },
  week: {
    code: '// THE WEEK',
    intro: 'Seven days. Two tracks. One last fireteam.',
    boardLine: 'Sessions live on games.directaction.monster. Post one, claim a slot, or just turn up.',
    rituals: {
      title: 'Rituals',
      tag: "For the parts we'll miss most.",
      items: [
        { text: 'Final raid runs (Vault of Glass, King\'s Fall, Last Wish)', icon: 'raid' as const },
        { text: 'Last patrol on the EDZ', icon: 'ghost' as const },
        { text: 'Walk the Tower one more time', icon: 'ghost' as const }
      ] as const
    },
    sendoff: {
      title: 'Send-off',
      tag: 'For the parts that made us laugh.',
      items: [
        { text: 'Silly loadout night', icon: 'ammoSpecial' as const },
        { text: 'Meme subclass strikes', icon: 'damageVoid' as const },
        { text: 'One more dungeon before lights out', icon: 'engram' as const }
      ] as const
    },
    empty: 'No sessions yet',
    post: 'Post one'
  },
  rotation: {
    intro:
      'When the lights go out on D2, Marathon stays in the mix alongside the rest of the rotation.',
    games: [
      { num: '/01', name: 'Marathon', tag: 'Extraction' },
      { num: '/02', name: 'Arc Raiders', tag: 'Extraction' },
      { num: '/03', name: 'Slay the Spire 2', tag: 'Deckbuilder' },
      { num: '/04', name: 'Friendslop', tag: 'Casual' }
    ] as const
  }
} as const;
