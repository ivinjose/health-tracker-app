import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";

/**
 * PersistLogin silently verifies/refreshes the auth token on app start when
 * "Trust this device" is enabled. It never unmounts children — the (tabs)
 * layout handles the loading state via isLoading from AuthContext.
 */
export function PersistLogin({ children }: { children: React.ReactNode }) {
	const refresh = useRefreshToken();
	const { auth, persist, persistLoaded, setAuth, setIsLoading } = useAuth();

	useEffect(() => {
		if (!persistLoaded) return;

		const verifyRefreshToken = async () => {
			try {
				await refresh();
			} catch (err) {
				console.warn("Refresh token verification failed:", err);
				setAuth({});
			} finally {
				setIsLoading(false);
			}
		};

		if (persist && !auth?.accessToken) {
			verifyRefreshToken();
		} else {
			setIsLoading(false);
		}
	}, [persist, persistLoaded, auth?.accessToken, refresh, setAuth, setIsLoading]);

	return <>{children}</>;
}
