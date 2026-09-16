import axios from 'axios';
import { Platform } from 'react-native';

/**
 * API origin from `.env` (`EXPO_PUBLIC_API_HOST`). No trailing slash, no `/api`.
 *
 * Simulator / web: http://localhost:4000
 * Expo Go on a phone: http://<Mac LAN IP>:4000  (localhost is the phone)
 * Production: https://www.healthtracker.com
 *
 * Restart Metro after changing `.env`.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_HOST;

export default axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  ...(Platform.OS === 'web' && { withCredentials: true }),
});

/**
 * Write the access token onto axiosPrivate immediately.
 *
 * useAxiosPrivate's request interceptor closes over React `auth` state. After a
 * profile switch we invalidate queries in the same turn — before that effect
 * rebinds — so refetches would still send the *old* JWT (old `profile` claim)
 * and home would look unchanged. Putting the token on defaults means those
 * requests already have Authorization set, and the interceptor leaves it alone.
 *
 * Keep this in sync with every setAuth / clear-auth path (login, refresh,
 * switch, logout). A stale default after logout would pin later sessions to
 * the previous user's token.
 */
export function setPrivateAccessToken(token) {
  if (token) {
    axiosPrivate.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosPrivate.defaults.headers.common.Authorization;
  }
}