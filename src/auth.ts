import { createAuthClient } from "better-auth/react";
import { onUnauthorized } from "./api";

export const authClient = createAuthClient({ baseURL: window.location.origin });

export const { useSession, signIn, signUp, signOut } = authClient;

onUnauthorized(() => authClient.$store.notify("$sessionSignal"));
