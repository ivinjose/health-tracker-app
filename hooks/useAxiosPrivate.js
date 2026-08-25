import { useEffect } from "react";

import { axiosPrivate, setPrivateAccessToken } from "../api/axios";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth, persist, setAuth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                if (!persist) return Promise.reject(error);
                const prevRequest = error?.config;
                const status = error?.response?.status;
                const shouldTryRefresh =
                    prevRequest &&
                    !prevRequest.sent &&
                    (status === 401 || status === 403);

                if (shouldTryRefresh) {
                    prevRequest.sent = true;
                    try {
                        const newAccessToken = await refresh();
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    } catch {
                        setAuth({});
                        // Failed refresh must clear the axios default too, or
                        // later requests keep the dead token and skip the interceptor.
                        setPrivateAccessToken(null);
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        )

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, persist, refresh, setAuth]);

    return axiosPrivate;
}

export default useAxiosPrivate;
