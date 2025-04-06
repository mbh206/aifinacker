import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	User as FirebaseUser,
	updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

// Define user type
interface User {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
}

// Define auth state
interface AuthState {
	user: User | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	status: 'idle',
	error: null,
};

// Create async thunks for auth operations
export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async (
		{
			email,
			password,
			displayName,
		}: { email: string; password: string; displayName: string },
		{ rejectWithValue }
	) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			await updateProfile(userCredential.user, { displayName });

			// Create user document in Firestore
			await setDoc(doc(db, 'users', userCredential.user.uid), {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				displayName,
				photoURL: null,
				createdAt: new Date(),
			});

			return {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				displayName,
				photoURL: null,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const signIn = createAsyncThunk(
	'auth/signIn',
	async (
		{ email, password }: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

			return {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				displayName: userCredential.user.displayName,
				photoURL: userCredential.user.photoURL,
				...userDoc.data(),
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const signOut = createAsyncThunk(
	'auth/signOut',
	async (_, { rejectWithValue }) => {
		try {
			await firebaseSignOut(auth);
			return null;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<FirebaseUser | null>) => {
			if (action.payload) {
				state.user = {
					uid: action.payload.uid,
					email: action.payload.email,
					displayName: action.payload.displayName,
					photoURL: action.payload.photoURL,
				};
			} else {
				state.user = null;
			}
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Register user
		builder.addCase(registerUser.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(registerUser.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.user = action.payload;
			state.error = null;
		});
		builder.addCase(registerUser.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Sign in
		builder.addCase(signIn.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(signIn.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.user = action.payload as User;
			state.error = null;
		});
		builder.addCase(signIn.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Sign out
		builder.addCase(signOut.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(signOut.fulfilled, (state) => {
			state.status = 'succeeded';
			state.user = null;
			state.error = null;
		});
		builder.addCase(signOut.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});
	},
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
