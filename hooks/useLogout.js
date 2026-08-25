import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import axios, { setPrivateAccessToken } from "../api/axios";
import { PERSIST_KEY } from "../constants/auth";
import useAuth from "./useAuth";
import { REFRESH_TOKEN_KEY } from "./useRefreshToken";

const useLogout = () => {
    const { setAuth, setPersist } = useAuth();

    const logout = async () => {
        setAuth({});
        // Drop the default Authorization header. If it stays, the interceptor
        // sees Authorization already set and will not attach the next login's token.
        setPrivateAccessToken(null);
        setPersist(false);

        try {
            if (Platform.OS === "web") {
                await axios("/api/logout", { withCredentials: true });
                try {
                    localStorage.removeItem(PERSIST_KEY);
                } catch {
                    // Ignore
                }
            } else {
                await axios("/api/logout", {
                    headers: await getAuthHeadersForLogout(),
                });
                await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
                await SecureStore.deleteItemAsync(PERSIST_KEY);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return logout;
};

/** Mobile: send refresh token so backend can invalidate it */
async function getAuthHeadersForLogout() {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default useLogout;