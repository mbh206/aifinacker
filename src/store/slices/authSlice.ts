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
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	user: null,
	isLoading: false,
	error: null,
	isAuthenticated: false,
};

// Async thunks
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
			const user = await signUpWithEmail(email, password, displayName);
			return user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const loginUser = createAsyncThunk(
	'auth/loginUser',
	async (
		{ email, password }: { email: string; password: string },
		{ rejectWithValue }
	) => {
		try {
			const user = await signInWithEmail(email, password);
			return user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const loginWithGoogle = createAsyncThunk(
	'auth/loginWithGoogle',
	async (_, { rejectWithValue }) => {
		try {
			const user = await signInWithGoogle();
			return user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const logoutUser = createAsyncThunk(
	'auth/logoutUser',
	async (_, { rejectWithValue }) => {
		try {
			await authSignOut();
			return null;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const checkAuth = createAsyncThunk(
	'auth/checkAuth',
	async (_, { rejectWithValue }) => {
		try {
			const user = await getCurrentUser();
			return user;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateUser = createAsyncThunk(
	'auth/updateUser',
	async (
		{ userId, updates }: { userId: string; updates: Partial<User> },
		{ rejectWithValue }
	) => {
		try {
			const updatedUser = await updateUserProfile(userId, updates);
			return updatedUser;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const sendPasswordReset = createAsyncThunk(
	'auth/sendPasswordReset',
	async (email: string, { rejectWithValue }) => {
		try {
			await resetPassword(email);
			return email;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

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
			});
	},
});

export const { setUser, clearError } = authSlice.actions;

export default authSlice.reducer;
