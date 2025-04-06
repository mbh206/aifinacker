import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
	onAuthStateChanged,
	User as FirebaseUser,
	signOut,
	updateProfile,
	sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNotification } from './NotificationContext';

// User interface
interface User {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	preferences?: {
		currency?: string;
		language?: string;
		darkMode?: boolean;
	};
}

// Profile update interface
interface ProfileUpdate {
	displayName?: string;
	photoURL?: string;
	preferences?: {
		currency?: string;
		language?: string;
		darkMode?: boolean;
	};
}

// Auth context interface
interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	register: (
		email: string,
		password: string,
		displayName: string
	) => Promise<boolean>;
	logout: () => Promise<void>;
	resetPassword: (email: string) => Promise<boolean>;
	updateProfile: (updates: ProfileUpdate) => Promise<boolean>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
	children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const { addNotification } = useNotification();

	// Listen for auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			if (firebaseUser) {
				const userData: User = {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName,
					photoURL: firebaseUser.photoURL,
					// In a real app, you would fetch user preferences from your database here
					preferences: {
						currency: 'USD',
						language: 'en',
						darkMode: false,
					},
				};
				setUser(userData);
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// Login function
	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			setLoading(true);
			// In a real app, you would call your auth service here
			// await signInWithEmailAndPassword(auth, email, password);
			// For development, simulate successful login
			setTimeout(() => {
				setUser({
					uid: 'test-user-id',
					email: email,
					displayName: 'Test User',
					photoURL: null,
					preferences: {
						currency: 'USD',
						language: 'en',
						darkMode: false,
					},
				});
				setLoading(false);
			}, 500);
			return true;
		} catch (error) {
			console.error('Login error:', error);
			addNotification('Failed to log in: ' + (error as Error).message, 'error');
			setLoading(false);
			return false;
		}
	};

	// Register function
	const register = async (
		email: string,
		password: string,
		displayName: string
	): Promise<boolean> => {
		try {
			setLoading(true);
			// In a real app, you would call your auth service here
			// const result = await createUserWithEmailAndPassword(auth, email, password);
			// await updateProfile(result.user, { displayName });
			// For development, simulate successful registration
			setTimeout(() => {
				setUser({
					uid: 'test-user-id',
					email: email,
					displayName: displayName,
					photoURL: null,
					preferences: {
						currency: 'USD',
						language: 'en',
						darkMode: false,
					},
				});
				setLoading(false);
			}, 500);
			return true;
		} catch (error) {
			console.error('Registration error:', error);
			addNotification(
				'Failed to register: ' + (error as Error).message,
				'error'
			);
			setLoading(false);
			return false;
		}
	};

	// Logout function
	const logout = async (): Promise<void> => {
		try {
			setLoading(true);
			// In a real app, you would call your auth service here
			// await signOut(auth);
			// For development, simulate successful logout
			setTimeout(() => {
				setUser(null);
				setLoading(false);
				navigate('/auth/login');
			}, 500);
		} catch (error) {
			console.error('Logout error:', error);
			addNotification(
				'Failed to log out: ' + (error as Error).message,
				'error'
			);
			setLoading(false);
		}
	};

	// Reset password function
	const resetPassword = async (email: string): Promise<boolean> => {
		try {
			// In a real app, you would call your auth service here
			// await sendPasswordResetEmail(auth, email);
			// For development, simulate successful password reset
			addNotification(
				'Password reset email sent. Check your inbox.',
				'success'
			);
			return true;
		} catch (error) {
			console.error('Password reset error:', error);
			addNotification(
				'Failed to send reset email: ' + (error as Error).message,
				'error'
			);
			return false;
		}
	};

	// Update profile function
	const updateUserProfile = async (
		updates: ProfileUpdate
	): Promise<boolean> => {
		try {
			if (!user) return false;

			// In a real app, you would update the Firebase profile and your database
			// For development, simulate successful profile update
			setUser({
				...user,
				displayName: updates.displayName || user.displayName,
				photoURL: updates.photoURL || user.photoURL,
				preferences: {
					...user.preferences,
					...updates.preferences,
				},
			});

			addNotification('Profile updated successfully', 'success');
			return true;
		} catch (error) {
			console.error('Profile update error:', error);
			addNotification(
				'Failed to update profile: ' + (error as Error).message,
				'error'
			);
			return false;
		}
	};

	const value = {
		user,
		loading,
		login,
		register,
		logout,
		resetPassword,
		updateProfile: updateUserProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
