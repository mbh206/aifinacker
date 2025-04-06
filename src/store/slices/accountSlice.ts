import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	query,
	where,
	updateDoc,
	arrayUnion,
	arrayRemove,
	Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';

// Types
export interface AccountMember {
	uid: string;
	email: string;
	displayName: string;
	role: 'admin' | 'member' | 'viewer';
	joinedAt: Date;
}

export interface Account {
	id: string;
	name: string;
	description: string;
	baseCurrency: string;
	createdAt: Date;
	createdBy: string;
	members: AccountMember[];
	settings: {
		theme: 'light' | 'dark' | 'system';
		categories: string[];
		defaultCategory: string;
	};
}

interface AccountState {
	accounts: Account[];
	currentAccount: Account | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
}

const initialState: AccountState = {
	accounts: [],
	currentAccount: null,
	status: 'idle',
	error: null,
};

// Async thunks
export const createAccount = createAsyncThunk(
	'accounts/createAccount',
	async (
		{
			name,
			description,
			baseCurrency,
			userId,
			userEmail,
			userDisplayName,
		}: {
			name: string;
			description: string;
			baseCurrency: string;
			userId: string;
			userEmail: string;
			userDisplayName: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const newAccountRef = doc(collection(db, 'accounts'));
			const accountData: Omit<Account, 'id'> = {
				name,
				description,
				baseCurrency,
				createdAt: new Date(),
				createdBy: userId,
				members: [
					{
						uid: userId,
						email: userEmail,
						displayName: userDisplayName,
						role: 'admin',
						joinedAt: new Date(),
					},
				],
				settings: {
					theme: 'system',
					categories: [
						'Food & Drink',
						'Shopping',
						'Housing',
						'Transportation',
						'Entertainment',
						'Health',
						'Travel',
						'Education',
						'Personal',
						'Other',
					],
					defaultCategory: 'Other',
				},
			};

			await setDoc(newAccountRef, accountData);

			// Add account to user's accounts list
			await updateDoc(doc(db, 'users', userId), {
				accounts: arrayUnion(newAccountRef.id),
			});

			return {
				id: newAccountRef.id,
				...accountData,
			};
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchUserAccounts = createAsyncThunk(
	'accounts/fetchUserAccounts',
	async (userId: string, { rejectWithValue }) => {
		try {
			// Get user document to get account IDs
			const userDoc = await getDoc(doc(db, 'users', userId));
			const userData = userDoc.data();

			if (!userData || !userData.accounts || userData.accounts.length === 0) {
				return [];
			}

			// Fetch each account
			const accounts: Account[] = [];
			for (const accountId of userData.accounts) {
				const accountDoc = await getDoc(doc(db, 'accounts', accountId));
				if (accountDoc.exists()) {
					const accountData = accountDoc.data() as Omit<Account, 'id'>;
					accounts.push({
						id: accountDoc.id,
						...accountData,
						createdAt: (accountData.createdAt as unknown as Timestamp).toDate(),
						members: accountData.members.map((member) => ({
							...member,
							joinedAt: (member.joinedAt as unknown as Timestamp).toDate(),
						})),
					});
				}
			}

			return accounts;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const setCurrentAccount = createAsyncThunk(
	'accounts/setCurrentAccount',
	async (accountId: string, { getState, rejectWithValue }) => {
		try {
			const state = getState() as { accounts: AccountState };
			const account = state.accounts.accounts.find(
				(acc) => acc.id === accountId
			);

			if (account) {
				return account;
			}

			// If account not in state, fetch it from Firestore
			const accountDoc = await getDoc(doc(db, 'accounts', accountId));
			if (accountDoc.exists()) {
				const accountData = accountDoc.data() as Omit<Account, 'id'>;
				return {
					id: accountDoc.id,
					...accountData,
					createdAt: (accountData.createdAt as unknown as Timestamp).toDate(),
					members: accountData.members.map((member) => ({
						...member,
						joinedAt: (member.joinedAt as unknown as Timestamp).toDate(),
					})),
				};
			}

			return rejectWithValue('Account not found');
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const accountSlice = createSlice({
	name: 'accounts',
	initialState,
	reducers: {
		clearAccounts: (state) => {
			state.accounts = [];
			state.currentAccount = null;
			state.status = 'idle';
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		// Create account
		builder.addCase(createAccount.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(createAccount.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.accounts.push(action.payload);
			state.currentAccount = action.payload;
			state.error = null;
		});
		builder.addCase(createAccount.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Fetch user accounts
		builder.addCase(fetchUserAccounts.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(fetchUserAccounts.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.accounts = action.payload;
			if (action.payload.length > 0 && !state.currentAccount) {
				state.currentAccount = action.payload[0];
			}
			state.error = null;
		});
		builder.addCase(fetchUserAccounts.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});

		// Set current account
		builder.addCase(setCurrentAccount.pending, (state) => {
			state.status = 'loading';
		});
		builder.addCase(setCurrentAccount.fulfilled, (state, action) => {
			state.status = 'succeeded';
			state.currentAccount = action.payload;
			state.error = null;
		});
		builder.addCase(setCurrentAccount.rejected, (state, action) => {
			state.status = 'failed';
			state.error = action.payload as string;
		});
	},
});

export const { clearAccounts } = accountSlice.actions;
export default accountSlice.reducer;
