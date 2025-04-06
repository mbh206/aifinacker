// src/services/auth.ts
import firebase from 'firebase/app';
import 'firebase/auth';
import { User } from '../models/types';
import { createUserProfile, getUserProfile } from './api';

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
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Sign up with email and password
export const signUpWithEmail = async (
	email: string,
	password: string,
	displayName: string
): Promise<User> => {
	try {
		// Create the user in Firebase
		const userCredential = await auth.createUserWithEmailAndPassword(
			email,
			password
		);

		if (!userCredential.user) {
			throw new Error('Failed to create user');
		}

		// Update the user's profile with display name
		await userCredential.user.updateProfile({ displayName });

		// Create user profile in our database
		const newUser: Partial<User> = {
			id: userCredential.user.uid,
			email,
			displayName,
			photoURL: userCredential.user.photoURL || undefined,
			createdAt: new Date(),
			updatedAt: new Date(),
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
		};

		// Store the user in our database
		await createUserProfile(newUser as User);

		// Return the user object
		return newUser as User;
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
		const userCredential = await auth.signInWithEmailAndPassword(
			email,
			password
		);

		if (!userCredential.user) {
			throw new Error('Failed to sign in');
		}

		// Get the user profile from our database
		const userProfile = await getUserProfile(userCredential.user.uid);

		return userProfile;
	} catch (error) {
		console.error('Error signing in:', error);
		throw error;
	}
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
	try {
		const provider = new firebase.auth.GoogleAuthProvider();
		const userCredential = await auth.signInWithPopup(provider);

		if (!userCredential.user) {
			throw new Error('Failed to sign in with Google');
		}

		// Check if user already exists in our database
		try {
			const userProfile = await getUserProfile(userCredential.user.uid);
			return userProfile;
		} catch (error) {
			// User doesn't exist, create a new profile
			const newUser: Partial<User> = {
				id: userCredential.user.uid,
				email: userCredential.user.email as string,
				displayName: userCredential.user.displayName as string,
				photoURL: userCredential.user.photoURL || undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
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
			};

			// Store the user in our database
			await createUserProfile(newUser as User);

			return newUser as User;
		}
	} catch (error) {
		console.error('Error signing in with Google:', error);
		throw error;
	}
};

// Sign out
export const signOut = async (): Promise<void> => {
	try {
		await auth.signOut();
	} catch (error) {
		console.error('Error signing out:', error);
		throw error;
	}
};

// Get current user
export const getCurrentUser = (): Promise<User | null> => {
	return new Promise((resolve, reject) => {
		const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
			unsubscribe();

			if (firebaseUser) {
				try {
					const userProfile = await getUserProfile(firebaseUser.uid);
					resolve(userProfile);
				} catch (error) {
					console.error('Error getting user profile:', error);
					resolve(null);
				}
			} else {
				resolve(null);
			}
		}, reject);
	});
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
	try {
		await auth.sendPasswordResetEmail(email);
	} catch (error) {
		console.error('Error resetting password:', error);
		throw error;
	}
};

// Update user profile
export const updateUserProfile = async (
	userId: string,
	updates: Partial<User>
): Promise<User> => {
	try {
		// Get current user
		const currentUser = auth.currentUser;

		if (!currentUser || currentUser.uid !== userId) {
			throw new Error('Unauthorized');
		}

		// Update displayName in Firebase if provided
		if (updates.displayName) {
			await currentUser.updateProfile({ displayName: updates.displayName });
		}

		// Update email in Firebase if provided
		if (updates.email && updates.email !== currentUser.email) {
			await currentUser.updateEmail(updates.email);
		}

		// Update user profile in our database
		const updatedUser = await updateUserProfileInDb(userId, {
			...updates,
			updatedAt: new Date(),
		});

		return updatedUser;
	} catch (error) {
		console.error('Error updating user profile:', error);
		throw error;
	}
};

// Internal function to update user profile in database
const updateUserProfileInDb = async (
	userId: string,
	updates: Partial<User>
): Promise<User> => {
	// This would be implemented in the API service
	// For now, we're just returning a mock response
	const currentUser = await getUserProfile(userId);

	return {
		...currentUser,
		...updates,
		updatedAt: new Date(),
	};
};

// Auth state change listener
export const onAuthStateChanged = (
	callback: (user: User | null) => void
): (() => void) => {
	return auth.onAuthStateChanged(async (firebaseUser) => {
		if (firebaseUser) {
			try {
				const userProfile = await getUserProfile(firebaseUser.uid);
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
