import { uuidv4 } from "../../utils/uuid";
import storage from "../storage/storage";
import { sessionState } from "../../core/state/sessionState";

const KEY = "session";

export function createSession() {
  const id = uuidv4();
  const startedAt = Date.now();
  const sess = { sessionId: id, startedAt };
  sessionState.sessionId = id;
  sessionState.startedAt = startedAt;
  storage.storageSet(KEY, sess);
  return sess;
}

export function restoreSession() {
  const s = storage.storageGet<{ sessionId: string; startedAt: number }>(KEY);
  if (!s) return null;
  sessionState.sessionId = s.sessionId;
  sessionState.startedAt = s.startedAt;
  return s;
}

export function clearSession() {
  storage.storageRemove(KEY);
  sessionState.sessionId = null;
  sessionState.startedAt = null;
}

export default { createSession, restoreSession, clearSession };
