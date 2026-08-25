import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import axios, { setPrivateAccessToken } from "../api/axios";
import useAuth from "./useAuth";

const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Cross-platform refresh token flow:
 * - Web: Uses HTTP-only cookies (withCredentials)
 * - iOS/Android: Uses refresh token from SecureStore (cookies don't persist reliably)
 */
const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        let response;

        if (Platform.OS === "web") {
            // Web: cookie-based auth - browser sends HTTP-only refresh cookie
            response = await axios.get("/api/refresh", {
                withCredentials: true,
            });
        } else {
            // iOS/Android: send stored refresh token (backend must accept it in header or support both methods)
            const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (!storedRefreshToken) {
                throw new Error("No refresh token available");
            }
            response = await axios.get("/api/refresh", {
                headers: {
                    Authorization: `Bearer ${storedRefreshToken}`,
                },
            });
        }

        const { accessToken, isAdmin, name, id, refreshToken: newRefreshToken } =
            response?.data?.data ?? {};

        // Same default-header sync as login/switch so a rotated access token
        // is used on the next request, not the previous profile's JWT.
        setPrivateAccessToken(accessToken);
        setAuth((prev) => ({
            ...prev,
            accessToken,
            isAdmin,
            name,
            id,
        }));

        // Persist new refresh token if backend uses rotation (iOS/Android only)
        if (Platform.OS !== "web" && newRefreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        return response.data.data.accessToken;
    };

    return refresh;
};

/**
 * Call this after successful login to persist the refresh token on mobile.
 * No-op on web (uses cookies).
 */
async function storeRefreshToken(token) {
    if (Platform.OS !== "web" && token) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
}

export default useRefreshToken;
export { REFRESH_TOKEN_KEY, storeRefreshToken };