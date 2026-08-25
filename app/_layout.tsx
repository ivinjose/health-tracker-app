import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PersistLogin } from '@/components/PersistLogin';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/AuthProvider';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedApp() {
  const theme = useTheme();
  const baseTheme = theme.reactNavigation.dark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    dark: theme.reactNavigation.dark,
    colors: {
      ...baseTheme.colors,
      ...theme.reactNavigation.colors,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <PersistLogin>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <PortalHost />
      </PersistLogin>
      <Toast />
      <StatusBar style={theme.statusBarStyle} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider className="flex-1 bg-background">
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
