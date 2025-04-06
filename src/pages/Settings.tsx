import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
	User,
	CreditCard,
	Settings as SettingsIcon,
	Bell,
	Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Settings: React.FC = () => {
	const { user, updateProfile } = useAuth();
	const { theme, setTheme } = useTheme();
	const { addNotification } = useNotification();

	// State for form inputs
	const [displayName, setDisplayName] = useState(user?.displayName || '');
	const [email, setEmail] = useState(user?.email || '');
	const [currency, setCurrency] = useState(
		user?.preferences?.currency || 'USD'
	);
	const [language, setLanguage] = useState(user?.preferences?.language || 'en');

	// Notification settings
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(false);

	// Handle profile update
	const handleUpdateProfile = async () => {
		try {
			await updateProfile({
				displayName,
				preferences: {
					currency,
					language,
				},
			});
			addNotification('Profile updated successfully', 'success');
		} catch (error) {
			addNotification('Failed to update profile', 'error');
		}
	};

	// Render settings sections
	const renderProfileSection = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<User className='mr-2' /> Profile Settings
				</CardTitle>
				<CardDescription>Manage your personal information</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<Label htmlFor='displayName'>Display Name</Label>
					<Input
						id='displayName'
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						placeholder='Enter your display name'
					/>
				</div>
				<div>
					<Label htmlFor='email'>Email</Label>
					<Input
						id='email'
						type='email'
						value={email}
						disabled
						placeholder='Your email address'
					/>
				</div>
			</CardContent>
		</Card>
	);

	const renderPreferencesSection = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<SettingsIcon className='mr-2' /> Preferences
				</CardTitle>
				<CardDescription>Customize your app experience</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div>
					<Label>App Theme</Label>
					<Select
						value={theme}
						onValueChange={(value) =>
							setTheme(value as 'light' | 'dark' | 'system')
						}>
						<SelectTrigger>
							<SelectValue placeholder='Select theme' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='light'>Light</SelectItem>
							<SelectItem value='dark'>Dark</SelectItem>
							<SelectItem value='system'>System</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Currency</Label>
					<Select
						value={currency}
						onValueChange={setCurrency}>
						<SelectTrigger>
							<SelectValue placeholder='Select currency' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='USD'>US Dollar (USD)</SelectItem>
							<SelectItem value='EUR'>Euro (EUR)</SelectItem>
							<SelectItem value='GBP'>British Pound (GBP)</SelectItem>
							<SelectItem value='JPY'>Japanese Yen (JPY)</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label>Language</Label>
					<Select
						value={language}
						onValueChange={setLanguage}>
						<SelectTrigger>
							<SelectValue placeholder='Select language' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='en'>English</SelectItem>
							<SelectItem value='es'>Spanish</SelectItem>
							<SelectItem value='fr'>French</SelectItem>
							<SelectItem value='de'>German</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);

	const renderNotificationSection = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<Bell className='mr-2' /> Notification Settings
				</CardTitle>
				<CardDescription>Manage how you receive notifications</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex items-center justify-between'>
					<Label htmlFor='email-notifications'>Email Notifications</Label>
					<Switch
						id='email-notifications'
						checked={emailNotifications}
						onCheckedChange={setEmailNotifications}
					/>
				</div>
				<div className='flex items-center justify-between'>
					<Label htmlFor='push-notifications'>Push Notifications</Label>
					<Switch
						id='push-notifications'
						checked={pushNotifications}
						onCheckedChange={setPushNotifications}
					/>
				</div>
			</CardContent>
		</Card>
	);

	const renderSecuritySection = () => (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center'>
					<Lock className='mr-2' /> Security
				</CardTitle>
				<CardDescription>Manage your account security</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				<Button variant='outline'>Change Password</Button>
				<Button variant='destructive'>Delete Account</Button>
			</CardContent>
		</Card>
	);

	return (
		<div className='container mx-auto p-4 space-y-6'>
			<h1 className='text-3xl font-bold'>Account Settings</h1>

			<div className='grid md:grid-cols-2 gap-6'>
				<div className='space-y-6'>
					{renderProfileSection()}
					{renderPreferencesSection()}
				</div>
				<div className='space-y-6'>
					{renderNotificationSection()}
					{renderSecuritySection()}
				</div>
			</div>

			<div className='flex justify-end'>
				<Button onClick={handleUpdateProfile}>Save Changes</Button>
			</div>
		</div>
	);
};
