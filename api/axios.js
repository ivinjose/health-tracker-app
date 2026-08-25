import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Base URL for API requests. Uses platform-specific defaults for local dev:
 * - Web / iOS Simulator: http://localhost:4000
 * - Android Emulator: http://10.0.2.2:4000 (10.0.2.2 = host machine's localhost)
 * - Physical devices: Set EXPO_PUBLIC_API_URL in .env (e.g. http://192.168.1.x:4000)
 */
const getBaseURL = () => {
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }
  return 'http://localhost:4000';
};

const BASE_URL = getBaseURL();

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