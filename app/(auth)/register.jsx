import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Check, CircleCheckBig, X } from 'lucide-react-native';
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
import axios from '@/api/axios';

const PROFILE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9 ]{3,10}$/;
const USER_EMAIL_REGEX = /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
const PASSWORD_REGEX = /^[a-zA-Z][a-zA-Z0-9]{3,10}$/;
const REGISTER_URL = '/api/register';

function ValidationIcon({ value, isValid }) {
	if (!value) return null;
	return isValid ? <Check size={18} color="#46A758" /> : <X size={18} color="#E54D2E" />;
}

export default function RegisterScreen() {
	const profileNameRef = useRef(null);

	const [profileName, setProfileName] = useState('');
	const [validProfileName, setValidProfileName] = useState(false);
	const [username, setUsername] = useState('');
	const [validUsername, setValidUsername] = useState(false);
	const [password, setPassword] = useState('');
	const [validPassword, setValidPassword] = useState(false);
	const [matchPassword, setMatchPassword] = useState('');
	const [validMatchPassword, setValidMatchPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		profileNameRef.current?.focus();
	}, []);

	useEffect(() => {
		setValidProfileName(PROFILE_NAME_REGEX.test(profileName));
	}, [profileName]);

	useEffect(() => {
		setValidUsername(USER_EMAIL_REGEX.test(username));
	}, [username]);

	useEffect(() => {
		setValidPassword(PASSWORD_REGEX.test(password));
		setValidMatchPassword(password === matchPassword && password.length > 0);
	}, [password, matchPassword]);

	useEffect(() => {
		setErrorMessage('');
	}, [profileName, username, password, matchPassword]);

	const canSubmit =
		validProfileName && validUsername && validPassword && validMatchPassword && !isLoading;

	const handleSubmit = async () => {
		if (!canSubmit) return;

		setIsLoading(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const response = await axios.post(
				REGISTER_URL,
				JSON.stringify({ name: profileName, username, password }),
				{
					headers: { 'Content-Type': 'application/json' },
					...(Platform.OS === 'web' && { withCredentials: true }),
				}
			);

			setIsSuccess(true);
			setProfileName('');
			setUsername('');
			setPassword('');
			setMatchPassword('');
			setSuccessMessage(response?.data?.message ?? 'Account created successfully');
		} catch (err) {
			if (!err?.response) {
				setErrorMessage('No server response');
			} else {
				setErrorMessage(err.response?.data?.message ?? 'Registration failed');
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<CircleCheckBig size={50} color="green" />
				<Text className="mt-4 text-center text-lg font-semibold text-foreground">
					Account has been created successfully.
				</Text>
				<Text className="mt-2 text-center text-muted-foreground">
					Please check your email for the verification email.
				</Text>
				{successMessage ? (
					<Text className="mt-2 text-center text-muted-foreground">{successMessage}</Text>
				) : null}
				<Link href="/(auth)/login" asChild>
					<Pressable className="mt-6">
						<Text className="font-medium text-primary">Go to Login</Text>
					</Pressable>
				</Link>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			className="flex-1"
		>
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
				<View className="rounded-lg border border-border bg-card p-6 shadow-sm">
					<Text variant="h1" className="mb-2">
						Hello, {profileName || 'new user'}!
					</Text>
					<Text className="mb-6 text-muted-foreground">Create your account</Text>

					{errorMessage ? (
						<Text
							className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive"
							accessibilityLiveRegion="assertive"
						>
							{errorMessage}
						</Text>
					) : null}

					<View className="gap-4">
						<View>
							<Text className="mb-2 font-medium text-foreground">Profile Name</Text>
							<View className="flex-row items-center rounded-md border border-input bg-background px-4 py-3">
								<TextInput
									ref={profileNameRef}
									value={profileName}
									onChangeText={setProfileName}
									autoCapitalize="words"
									autoCorrect={false}
									editable={!isLoading}
									className="flex-1 text-foreground"
									placeholder="Your name"
									placeholderTextColor="#9ca3af"
								/>
								<ValidationIcon value={profileName} isValid={validProfileName} />
							</View>
						</View>

						<View>
							<Text className="mb-2 font-medium text-foreground">Email</Text>
							<View className="flex-row items-center rounded-md border border-input bg-background px-4 py-3">
								<TextInput
									value={username}
									onChangeText={setUsername}
									autoCapitalize="none"
									autoCorrect={false}
									keyboardType="email-address"
									editable={!isLoading}
									className="flex-1 text-foreground"
									placeholder="me@example.com"
									placeholderTextColor="#9ca3af"
								/>
								<ValidationIcon value={username} isValid={validUsername} />
							</View>
						</View>

						<View>
							<Text className="mb-2 font-medium text-foreground">Password</Text>
							<View className="flex-row items-center rounded-md border border-input bg-background px-4 py-3">
								<TextInput
									value={password}
									onChangeText={setPassword}
									secureTextEntry
									editable={!isLoading}
									className="flex-1 text-foreground"
									placeholder="Enter password"
									placeholderTextColor="#9ca3af"
								/>
								<ValidationIcon value={password} isValid={validPassword} />
							</View>
						</View>

						<View>
							<Text className="mb-2 font-medium text-foreground">Confirm password</Text>
							<View className="flex-row items-center rounded-md border border-input bg-background px-4 py-3">
								<TextInput
									value={matchPassword}
									onChangeText={setMatchPassword}
									secureTextEntry
									editable={!isLoading}
									className="flex-1 text-foreground"
									placeholder="Confirm password"
									placeholderTextColor="#9ca3af"
								/>
								<ValidationIcon value={matchPassword} isValid={validMatchPassword} />
							</View>
						</View>

						<Button onPress={handleSubmit} disabled={!canSubmit} className="mt-2">
							{isLoading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<Text className="font-medium text-primary-foreground">Create account</Text>
							)}
						</Button>
					</View>

					<View className="mt-6 flex-row items-center justify-center gap-1">
						<Text className="text-muted-foreground">Already have an account? </Text>
						<Link href="/(auth)/login" asChild>
							<Pressable>
								<Text className="font-medium text-primary">Sign in!</Text>
							</Pressable>
						</Link>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
