import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	signUpWithEmail,
	signInWithEmail,
	signInWithGoogle,
	signOut as authSignOut,
	getCurrentUser,
	updateUserProfile,
	resetPassword,
} from '../../services/auth';
import { User } from '../../models/types';

interface AuthState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	isAuthenticated: boolean | null;
}

const initialState: AuthState = {
	user: null,
	isLoading: false,
	error: null,
	isAuthenticated: null,
};

// Async thunks
export const registerUser = createAsyncThunk<
	User,
	{ email: string; password: string; displayName: string },
	{ rejectValue: string }
>(
	'auth/registerUser',
	async ({ email, password, displayName }, { rejectWithValue }) => {
		try {
			const user = await signUpWithEmail(email, password, displayName);
			return user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const loginUser = createAsyncThunk<
	User,
	{ email: string; password: string },
	{ rejectValue: string }
>('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
	try {
		const user = await signInWithEmail(email, password);
		return user;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

export const loginWithGoogle = createAsyncThunk<
	User,
	void,
	{ rejectValue: string }
>('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
	try {
		const user = await signInWithGoogle();
		return user;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
	'auth/logoutUser',
	async (_, { rejectWithValue }) => {
		try {
			await authSignOut();
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const checkAuth = createAsyncThunk<
	User | null,
	void,
	{ rejectValue: string }
>('auth/checkAuth', async (_, { rejectWithValue }) => {
	try {
		const user = await getCurrentUser();
		return user;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

export const updateUser = createAsyncThunk<
	User,
	{ userId: string; updates: Partial<User> },
	{ rejectValue: string }
>('auth/updateUser', async ({ userId, updates }, { rejectWithValue }) => {
	try {
		const user = await updateUserProfile(userId, updates);
		return user;
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

export const sendPasswordResetEmail = createAsyncThunk<
	void,
	string,
	{ rejectValue: string }
>('auth/sendPasswordResetEmail', async (email, { rejectWithValue }) => {
	try {
		await resetPassword(email);
	} catch (error: any) {
		return rejectWithValue(error.message);
	}
});

// Auth slice
const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
			state.isAuthenticated = !!action.payload;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Register user
			.addCase(registerUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Login user
			.addCase(loginUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Login with Google
			.addCase(loginWithGoogle.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginWithGoogle.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = true;
				state.error = null;
			})
			.addCase(loginWithGoogle.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Logout user
			.addCase(logoutUser.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.isLoading = false;
				state.user = null;
				state.isAuthenticated = false;
				state.error = null;
			})
			.addCase(logoutUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Check auth
			.addCase(checkAuth.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(checkAuth.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.isAuthenticated = !!action.payload;
				state.error = null;
			})
			.addCase(checkAuth.rejected, (state, action) => {
				state.isLoading = false;
				state.user = null;
				state.isAuthenticated = false;
				state.error = action.payload as string;
			})

			// Update user
			.addCase(updateUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.error = null;
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Send password reset email
			.addCase(sendPasswordResetEmail.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(sendPasswordResetEmail.fulfilled, (state) => {
				state.isLoading = false;
				state.error = null;
			})
			.addCase(sendPasswordResetEmail.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

// Export actions
export const { setUser, clearError } = authSlice.actions;

// Export selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
	state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
