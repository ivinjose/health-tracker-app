import axios from '@/api/axios';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	TextInput,
	View,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import { storeRefreshToken } from '../../hooks/useRefreshToken';

const LOGIN_URL = '/api/login';

export default function LoginScreen() {
	return (
		<ThemeProvider appearance="iosDark" className="flex-1 bg-background">
			<LoginView />
		</ThemeProvider>
	);
}

function LoginView() {
	const theme = useTheme();
	const { setAuth, persist, setPersist } = useAuth();
	const router = useRouter();

	const usernameRef = useRef(null);
	const [username, setUsername] = useState('ivinjose@gmail.com');
	const [password, setPassword] = useState('test');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [shouldPersist, setShouldPersist] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		usernameRef?.current?.focus();
	}, []);

	useEffect(() => {
		setErrorMessage('');
	}, [username, password]);

	const togglePersist = () => {
		setShouldPersist((prev) => !prev);
	};

	const handleSubmit = async () => {
		if (!username || !password) return;

		setIsLoading(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const response = await axios.post(
				LOGIN_URL,
				JSON.stringify({ username, password }),
				{
					headers: { 'Content-Type': 'application/json' },
					...(Platform.OS === 'web' && { withCredentials: true }),
				}
			);

			const { accessToken, isAdmin, name, id, refreshToken } = response?.data?.data ?? {};

			setAuth({ accessToken, isAdmin, name, id });
			setPersist(shouldPersist);
			await storeRefreshToken(refreshToken);
			setUsername('');
			setPassword('');
			setSuccessMessage(response?.data?.message ?? 'Login successful');
			router.replace('/');
		} catch (err) {
			if (!err?.response) {
				setErrorMessage('No server response');
			} else {
				setErrorMessage(err.response?.data?.message ?? 'Login failed');
			}
			usernameRef?.current?.focus();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1 bg-background"
		>
			<StatusBar style={theme.statusBarStyle} />
			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: 'center',
					paddingHorizontal: 24,
					paddingVertical: 48,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View className="rounded-[10px] border border-border bg-card p-6">
					<Text variant="h1" className="mb-6 text-foreground">
						Login
					</Text>

					{errorMessage ? (
						<Text
							className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive"
							accessibilityLiveRegion="assertive"
						>
							{errorMessage}
						</Text>
					) : null}

					{successMessage ? (
						<Text
							className="mb-4 rounded-md bg-primary/10 p-3 text-primary"
							accessibilityLiveRegion="assertive"
						>
							{successMessage}
						</Text>
					) : null}

					<View className="gap-4">
						<View>
							<Text className="mb-2 text-sm font-medium text-muted-foreground">
								Email
							</Text>
							<TextInput
								ref={usernameRef}
								value={username}
								onChangeText={setUsername}
								placeholder="me@example.com"
								placeholderTextColor={theme.colors.placeholder}
								autoCapitalize="none"
								autoCorrect={false}
								keyboardType="email-address"
								keyboardAppearance={theme.keyboardAppearance}
								selectionColor={theme.colors.tint}
								editable={!isLoading}
								className="rounded-[10px] border border-input bg-background px-4 py-3 text-foreground"
							/>
						</View>

						<View>
							<Text className="mb-2 text-sm font-medium text-muted-foreground">
								Password
							</Text>
							<TextInput
								value={password}
								onChangeText={setPassword}
								placeholder="Enter password"
								placeholderTextColor={theme.colors.placeholder}
								secureTextEntry
								keyboardAppearance={theme.keyboardAppearance}
								selectionColor={theme.colors.tint}
								editable={!isLoading}
								className="rounded-[10px] border border-input bg-background px-4 py-3 text-foreground"
							/>
						</View>

						<Pressable
							onPress={togglePersist}
							disabled={isLoading}
							className="flex-row items-center gap-2 py-2"
						>
							<View
								className={`h-5 w-5 items-center justify-center rounded border-2 ${
									shouldPersist || persist
										? 'border-primary bg-primary'
										: 'border-muted-foreground'
								}`}
							>
								{shouldPersist || persist ? (
									<Text className="text-xs text-primary-foreground">✓</Text>
								) : null}
							</View>
							<Text className="text-muted-foreground">Trust this device?</Text>
						</Pressable>

						<Button
							onPress={handleSubmit}
							disabled={!username || !password || isLoading}
							className="mt-2 h-11 rounded-[10px] shadow-none"
						>
							{isLoading ? (
								<ActivityIndicator color={theme.colors.primaryForeground} />
							) : (
								<Text className="font-medium text-primary-foreground">Login</Text>
							)}
						</Button>
					</View>

					<View className="mt-6 flex-row items-center justify-center gap-1">
						<Text className="text-muted-foreground">Don&apos;t have an account? </Text>
						<Link href="/(auth)/register" asChild>
							<Pressable>
								<Text className="font-medium text-primary">Sign up!</Text>
							</Pressable>
						</Link>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
