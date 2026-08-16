import "../global.css";

import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PersistLogin } from '@/components/PersistLogin';
import { ThemeProvider } from '@/components/ThemeProvider';
import { APP_APPEARANCE, getAppearance } from '@/lib/appearance';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/AuthProvider';

const queryClient = new QueryClient();
const appTheme = getAppearance(APP_APPEARANCE);
const navigationTheme = {
  ...DarkTheme,
  dark: appTheme.reactNavigation.dark,
  colors: {
    ...DarkTheme.colors,
    ...appTheme.reactNavigation.colors,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationThemeProvider value={navigationTheme}>
          <ThemeProvider appearance={APP_APPEARANCE} className="flex-1 bg-background">
            <PersistLogin>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              </Stack>
              <PortalHost />
            </PersistLogin>
            <Toast />
            <StatusBar style={appTheme.statusBarStyle} />
          </ThemeProvider>
        </NavigationThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
