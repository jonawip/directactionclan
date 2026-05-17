export const uiCopy = {
  brand: {
    logoSrc: "/images/brand/da-logo.svg",
    clanName: "Direct Action",
    productName: "Direct Action Games",
  },
  nav: {
    postGame: "Post a game",
    profile: "Profile",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  feed: {
    title: "Upcoming games",
    subtitle: "Tap a game to see details and join.",
    emptyTitle: "No games posted yet",
    emptyBody: "Be the first to post one.",
    listLabel: "Upcoming games",
  },
  sessionCard: {
    starts: "Starts",
    hostedBy: "Hosted by",
    slotAvailable: "Free spot",
    slotFilledAria: (filled: number, max: number) =>
      `${filled} of ${max} players joined`,
  },
  status: {
    open: "Spots available",
    full: "Full",
    cancelled: "Cancelled",
    completed: "Finished",
  },
  filters: {
    legend: "Filter games",
    allGames: "All games",
    game: "Game",
    mode: "Mode",
    withSpace: "Has free spots",
    hideJoined: "Hide games I've joined",
  },
  postGame: {
    pageTitle: "Post a game",
    game: "Game",
    mode: "What are you playing?",
    title: "Title",
    titlePlaceholder: "e.g. Raid night, chill strikes",
    notes: "Notes (optional)",
    when: (timezone: string) => `When (${timezone})`,
    date: "Date",
    time: "Time",
    moreOptions: "More options",
    moreOptionsHint: (minutes: number, players: number) =>
      `${minutes} min · up to ${players} players`,
    duration: "How long (minutes)",
    playerLimit: "How many players",
    submit: "Post game",
    submitting: "Posting…",
  },
  detail: {
    hostedBy: "Hosted by",
    players: "Players",
    signInToJoin: "Sign in to join",
    join: "Join",
    leave: "Leave",
    cancel: "Cancel game",
    cancelPrompt: "Why are you cancelling? (optional)",
    duration: (minutes: number) => `${minutes} min`,
    status: (label: string) => `Status: ${label}`,
    cancelled: (reason: string) => `Cancelled: ${reason}`,
    scheduleConflict: (count: number) =>
      count === 1
        ? "You already have another game at this time."
        : `You already have ${count} other games at this time.`,
  },
  profile: {
    title: "Your profile",
    upcomingJoined: "Games you've joined",
    upcomingHosted: "Games you've posted",
    noJoined: "You're not signed up for any upcoming games.",
    noHosted: "You haven't posted any upcoming games.",
  },
  login: {
    title: "Sign in",
    body: "Use Discord or Google to sign in to Direct Action Games.",
  },
} as const;

export function statusLabel(status: string): string {
  switch (status) {
    case "open":
      return uiCopy.status.open;
    case "full":
      return uiCopy.status.full;
    case "cancelled":
      return uiCopy.status.cancelled;
    case "completed":
      return uiCopy.status.completed;
    default:
      return status;
  }
}
