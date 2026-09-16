import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Axios origin: protocol + host [+ port]. No trailing slash, no `/api` path.
 * Request paths stay `/api/login`, `/api/reports`, and so on.
 *
 * Local:  'http://localhost:4000'
 * Live:   'https://www.healthtracker.com'
 *
 * Verification emails and CORS use the *web* origin on the server
 * (`CLIENT_APP_URL` in health-tracker-server `config/serverConfig.js`),
 * which is `http://localhost:8081` locally and the same https host in production.
 */
export const API_ORIGIN = 'http://localhost:4000';

export default axios.create({
  baseURL: API_ORIGIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: API_ORIGIN,
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