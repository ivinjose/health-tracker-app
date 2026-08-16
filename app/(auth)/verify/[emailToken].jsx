import { useTheme } from '@/components/ThemeProvider';
import { Text } from '@/components/ui/text';
import { Link, useLocalSearchParams } from 'expo-router';
import { CircleCheckBig } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import axios from '@/api/axios';

const VERIFY_URL = '/api/verify';

export default function VerifyScreen() {
	const theme = useTheme();
	const { emailToken } = useLocalSearchParams();
	const token = Array.isArray(emailToken) ? emailToken[0] : emailToken;

	const [isLoading, setIsLoading] = useState(true);
	const [isSuccess, setIsSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (!token) {
			setIsLoading(false);
			setErrorMessage('Invalid verification link');
			return;
		}

		let isMounted = true;

		const verifyEmailToken = async () => {
			try {
				await axios.post(
					VERIFY_URL,
					JSON.stringify({ token }),
					{
						headers: { 'Content-Type': 'application/json' },
					}
				);

				if (isMounted) {
					setIsSuccess(true);
				}
			} catch (err) {
				if (!isMounted) return;

				if (!err?.response) {
					setErrorMessage('No server response');
				} else {
					setErrorMessage(err.response?.data?.message ?? 'Verification failed');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		verifyEmailToken();

		return () => {
			isMounted = false;
		};
	}, [token]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color={theme.colors.tint} />
				<Text className="mt-4 text-muted-foreground">Verifying your account…</Text>
			</View>
		);
	}

	if (isSuccess) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<CircleCheckBig size={50} color={theme.colors.tint} />
				<Text className="mt-4 text-center text-lg font-semibold text-foreground">
					Account has been verified successfully!
				</Text>
				<Link href="/(auth)/login" asChild>
					<Pressable className="mt-6">
						<Text className="font-medium text-primary">Go to Login</Text>
					</Pressable>
				</Link>
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Text
				className="rounded-md bg-destructive/10 p-3 text-center text-destructive"
				accessibilityLiveRegion="assertive"
			>
				{errorMessage}
			</Text>
			<Link href="/(auth)/login" asChild>
				<Pressable className="mt-6">
					<Text className="font-medium text-primary">Back to Login</Text>
				</Pressable>
			</Link>
		</View>
	);
}
