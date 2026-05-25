export const sessionState: {
  sessionId: string | null;
  startedAt: number | null;
} = {
  sessionId: null,
  startedAt: null,
};

export function resetSessionState() {
  sessionState.sessionId = null;
  sessionState.startedAt = null;
}
