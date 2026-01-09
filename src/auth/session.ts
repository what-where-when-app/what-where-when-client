import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { HostSession, HostUser } from "../dto/auth.dto";

const KEY = "host_session_v1";

export type StoredHostSession = {
    user: HostUser;
    session: HostSession;
};

export async function getStoredSession(): Promise<StoredHostSession | null> {
    const raw =
        Platform.OS === "web"
            ? localStorage.getItem(KEY)
            : await SecureStore.getItemAsync(KEY);

    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredHostSession;
    } catch {
        return null;
    }
}

export async function setStoredSession(value: StoredHostSession): Promise<void> {
    const raw = JSON.stringify(value);
    if (Platform.OS === "web") {
        localStorage.setItem(KEY, raw);
        return;
    }
    await SecureStore.setItemAsync(KEY, raw);
}

export async function clearStoredSession(): Promise<void> {
    if (Platform.OS === "web") {
        localStorage.removeItem(KEY);
        return;
    }
    await SecureStore.deleteItemAsync(KEY);
}

export async function getAccessToken(): Promise<string | null> {
    const s = await getStoredSession();
    return s?.session?.access_token ?? null;
}
