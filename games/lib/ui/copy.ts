export const uiCopy = {
  brand: {
    logoSrc: "/images/brand/da-logo.svg",
    clanName: "Direct Action",
    productName: "Direct Action Games",
  },
  nav: {
    postGame: "Post a game",
    leaderboard: "Leaderboard",
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
    fromDate: "From",
    toDate: "To",
    clearDates: "Clear dates",
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
    edit: "Edit game",
    editTitle: "Edit game",
    saveEdits: "Save changes",
    savingEdits: "Saving…",
    cancel: "Cancel game",
    cancelDialogTitle: "Cancel this game?",
    cancelDialogBody:
      "Players who joined will see it as cancelled. You can add an optional reason below.",
    cancelReasonLabel: "Reason (optional)",
    cancelConfirm: "Yes, cancel game",
    cancelBack: "Keep game",
    cancelling: "Cancelling…",
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
    memberTitle: (name: string) => `${name}'s profile`,
    upcomingJoined: "Games you've joined",
    upcomingHosted: "Games you've posted",
    memberJoined: "Upcoming games",
    memberHosted: "Games they've posted",
    noJoined: "You're not signed up for any upcoming games.",
    noHosted: "You haven't posted any upcoming games.",
    memberNoJoined: "No upcoming games joined.",
    memberNoHosted: "No upcoming games posted.",
    editOwn: "Edit your profile",
  },
  login: {
    title: "Sign in",
    body: "Use Discord or Google to sign in to Direct Action Games.",
  },
  leaderboard: {
    title: "Hall of chronically online",
    metaDescription:
      "Direct Action Games leaderboards — most sessions joined and posted.",
    subtitle:
      "Official ranks plus completely unserious titles. Cancelled games do not count. Touch grass optional.",
    joinedHeading: "Most sessions joined",
    hostedHeading: "Most sessions posted",
    sessionsJoined: "sessions joined",
    sessionsPosted: "sessions posted",
    empty: "No one on the board yet. Post a game or join one.",
  },
  ranks: {
    cardLabel: (title: string) => `Rank: ${title}`,
    joined: "Sessions joined",
    hosted: "Sessions posted",
    progress: (remaining: number, nextTitle: string) =>
      remaining === 1
        ? `1 more session to reach ${nextTitle}.`
        : `${remaining} more sessions to reach ${nextTitle}.`,
    ladderTitle: "Rank ladder",
    ladderJoined: "Participation",
    ladderHosted: "Hosting",
    ladderReqJoined: (min: number) =>
      min === 0 ? "Starting rank" : `${min}+ sessions joined`,
    ladderReqHosted: (min: number) => `${min}+ sessions posted`,
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
