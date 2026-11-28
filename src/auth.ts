import { createAuthClient } from "better-auth/react";
import { onUnauthorized } from "./api";

// notes-web proxies /api/* to notes-api, so auth is same-origin: cookies just work.
export const authClient = createAuthClient({ baseURL: window.location.origin });

export const { useSession, signIn, signUp, signOut } = authClient;

// Any API 401 means the session is gone: re-check it so App falls back to the sign-in form.
onUnauthorized(() => authClient.$store.notify("$sessionSignal"));
