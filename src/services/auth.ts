// src/services/auth.ts
import {
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
import { firebaseService, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Get the auth instance from the Firebase service
const auth = firebaseService.auth;

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

		// Create user profile in Firestore
		const userProfile: Omit<User, 'firebaseUser'> = {
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
		};

		// Save to Firestore
		await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

		// Return the complete user object
		return {
			firebaseUser,
			...userProfile,
		};
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
		const firebaseUser = userCredential.user;

		if (!firebaseUser) {
			throw new Error('Failed to sign in');
		}

		// Get user profile from Firestore
		const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

		if (!userDoc.exists()) {
			throw new Error('User profile not found');
		}

		const userData = userDoc.data();
		return {
			firebaseUser,
			...userData,
		} as User;
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
		const firebaseUser = userCredential.user;

		if (!firebaseUser) {
			throw new Error('Failed to sign in with Google');
		}

		// Check if user profile exists
		const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

		if (!userDoc.exists()) {
			// Create new user profile
			const userProfile: Omit<User, 'firebaseUser'> = {
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
			};

			await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

			return {
				firebaseUser,
				...userProfile,
			};
		}

		// Return existing user profile
		const userData = userDoc.data();
		return {
			firebaseUser,
			...userData,
		} as User;
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
						// Get user profile from Firestore
						const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

						if (userDoc.exists()) {
							const userData = userDoc.data();
							resolve({
								firebaseUser,
								...userData,
							} as User);
						} else {
							resolve(null);
						}
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

// Update user profile
export const updateUserProfile = async (
	userId: string,
	updates: Partial<User>
): Promise<User> => {
	try {
		const userRef = doc(db, 'users', userId);
		await updateDoc(userRef, {
			...updates,
			updatedAt: new Date(),
		});

		const userDoc = await getDoc(userRef);
		if (!userDoc.exists()) {
			throw new Error('User profile not found');
		}

		const userData = userDoc.data();
		return userData as User;
	} catch (error) {
		console.error('Error updating user profile:', error);
		throw error;
	}
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

// Confirm password reset
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
