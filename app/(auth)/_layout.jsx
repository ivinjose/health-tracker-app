import { Redirect, Stack } from 'expo-router';
import useAuth from '../../hooks/useAuth';

/**
 * Auth layout: redirect to main app when already logged in.
 * Shows login/register/verify when not authenticated.
 */
export default function AuthLayout() {
  const { auth } = useAuth();

  if (auth?.id) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify/[emailToken]" />
    </Stack>
  );
}
