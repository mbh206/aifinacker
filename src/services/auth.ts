// src/services/auth.ts
import { initializeApp } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	signOut as authSignOut,
	onAuthStateChanged as firebaseOnAuthStateChanged,
	sendPasswordResetEmail,
	confirmPasswordReset as firebaseConfirmPasswordReset,
	User as FirebaseUser,
	updateProfile as firebaseUpdateProfile,
	updateEmail as firebaseUpdateEmail,
} from 'firebase/auth';
import { User } from '../models/types';
import { apiService } from './api';

// Initialize Firebase (values would be replaced with environment variables in production)
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase if it hasn't been initialized yet
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign up with email and password
export const signUpWithEmail = async (
	email: string,
	password: string,
	displayName: string
): Promise<User> => {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const firebaseUser = userCredential.user;

		if (!firebaseUser) {
			throw new Error('Failed to create user');
		}

		// Update the user's display name
		await firebaseUpdateProfile(firebaseUser, { displayName });

		// Create user profile in our database
		const userProfile = await apiService.createUserProfile({
			firebaseUser,
			preferences: {
				darkMode: false,
				language: 'en',
				currencyDisplay: 'USD',
				notificationSettings: {
					email: true,
					push: true,
					budgetAlerts: true,
					expenseReminders: true,
				},
			},
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return userProfile;
	} catch (error) {
		console.error('Error signing up:', error);
		throw error;
	}
};

// Sign in with email and password
export const signInWithEmail = async (
	email: string,
	password: string
): Promise<User> => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);

		if (!userCredential.user) {
			throw new Error('Failed to sign in');
		}

		// Get the user profile from our database
		const userProfile = await apiService.getUserProfile(
			userCredential.user.uid
		);

		return userProfile;
	} catch (error) {
		console.error('Error signing in:', error);
		throw error;
	}
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
	try {
		const provider = new GoogleAuthProvider();
		const userCredential = await signInWithPopup(auth, provider);

		if (!userCredential.user) {
			throw new Error('Failed to sign in with Google');
		}

		// Check if user already exists in our database
		try {
			const userProfile = await apiService.getUserProfile(
				userCredential.user.uid
			);
			return userProfile;
		} catch (error) {
			// If user doesn't exist, create a new profile
			const newUser = await apiService.createUserProfile({
				firebaseUser: userCredential.user,
				preferences: {
					darkMode: false,
					language: 'en',
					currencyDisplay: 'USD',
					notificationSettings: {
						email: true,
						push: true,
						budgetAlerts: true,
						expenseReminders: true,
					},
				},
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			return newUser;
		}
	} catch (error) {
		console.error('Error signing in with Google:', error);
		throw error;
	}
};

// Sign out
export const signOut = async (): Promise<void> => {
	try {
		await authSignOut(auth);
	} catch (error) {
		console.error('Error signing out:', error);
		throw error;
	}
};

// Get current user
export const getCurrentUser = (): Promise<User | null> => {
	return new Promise((resolve, reject) => {
		const unsubscribe = firebaseOnAuthStateChanged(
			auth,
			async (firebaseUser) => {
				unsubscribe();
				if (firebaseUser) {
					try {
						const userProfile = await apiService.getUserProfile(
							firebaseUser.uid
						);
						resolve(userProfile);
					} catch (error) {
						console.error('Error getting user profile:', error);
						reject(error);
					}
				} else {
					resolve(null);
				}
			}
		);
	});
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		console.error('Error sending password reset email:', error);
		throw error;
	}
};

export const confirmPasswordReset = async (
	oobCode: string,
	newPassword: string
): Promise<void> => {
	try {
		await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
	} catch (error) {
		console.error('Error confirming password reset:', error);
		throw error;
	}
};

// Update user profile
export const updateUserProfile = async (
	user: FirebaseUser,
	displayName: string
): Promise<void> => {
	try {
		await firebaseUpdateProfile(user, { displayName });
	} catch (error) {
		console.error('Error updating user profile:', error);
		throw error;
	}
};

export const updateUserEmail = async (
	user: FirebaseUser,
	newEmail: string
): Promise<void> => {
	try {
		await firebaseUpdateEmail(user, newEmail);
	} catch (error) {
		console.error('Error updating user email:', error);
		throw error;
	}
};

// Auth state change listener
export const onAuthStateChanged = (
	callback: (user: User | null) => void
): (() => void) => {
	return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
		if (firebaseUser) {
			try {
				const userProfile = await apiService.getUserProfile(firebaseUser.uid);
				callback(userProfile);
			} catch (error) {
				console.error('Error getting user profile:', error);
				callback(null);
			}
		} else {
			callback(null);
		}
	});
};
