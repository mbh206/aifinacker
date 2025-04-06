// src/features/accounts/accountsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
	createAccount,
	getAccount,
	updateAccount,
	getUserAccounts,
	addAccountMember,
	removeAccountMember,
	updateAccountMemberRole,
} from '../../services/api';
import { Account, AccountMember } from '../../models/types';

interface AccountsState {
	accounts: Account[];
	currentAccount: Account | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: AccountsState = {
	accounts: [],
	currentAccount: null,
	isLoading: false,
	error: null,
};

// Async thunks
export const fetchUserAccounts = createAsyncThunk(
	'accounts/fetchUserAccounts',
	async (userId: string, { rejectWithValue }) => {
		try {
			const accounts = await getUserAccounts(userId);
			return accounts;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const fetchAccount = createAsyncThunk(
	'accounts/fetchAccount',
	async (accountId: string, { rejectWithValue }) => {
		try {
			const account = await getAccount(accountId);
			return account;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const createNewAccount = createAsyncThunk(
	'accounts/createNewAccount',
	async (accountData: Partial<Account>, { rejectWithValue }) => {
		try {
			const account = await createAccount(accountData);
			return account;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateExistingAccount = createAsyncThunk(
	'accounts/updateExistingAccount',
	async (
		{ accountId, updates }: { accountId: string; updates: Partial<Account> },
		{ rejectWithValue }
	) => {
		try {
			const account = await updateAccount(accountId, updates);
			return account;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const inviteAccountMember = createAsyncThunk(
	'accounts/inviteAccountMember',
	async (
		{
			accountId,
			email,
			role,
		}: {
			accountId: string;
			email: string;
			role: 'admin' | 'member' | 'viewer';
		},
		{ rejectWithValue }
	) => {
		try {
			const result = await addAccountMember(accountId, email, role);
			return result;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const removeMember = createAsyncThunk(
	'accounts/removeMember',
	async (
		{ accountId, userId }: { accountId: string; userId: string },
		{ rejectWithValue }
	) => {
		try {
			await removeAccountMember(accountId, userId);
			return userId;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateMemberRole = createAsyncThunk(
	'accounts/updateMemberRole',
	async (
		{
			accountId,
			userId,
			role,
		}: {
			accountId: string;
			userId: string;
			role: 'admin' | 'member' | 'viewer';
		},
		{ rejectWithValue }
	) => {
		try {
			await updateAccountMemberRole(accountId, userId, role);
			return { userId, role };
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

// Accounts slice
const accountsSlice = createSlice({
	name: 'accounts',
	initialState,
	reducers: {
		setCurrentAccount: (state, action: PayloadAction<Account>) => {
			state.currentAccount = action.payload;
		},
		clearCurrentAccount: (state) => {
			state.currentAccount = null;
		},
		clearError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch user accounts
			.addCase(fetchUserAccounts.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchUserAccounts.fulfilled, (state, action) => {
				state.isLoading = false;
				state.accounts = action.payload;
				// If there are accounts and no current account is set, set the first one as current
				if (action.payload.length > 0 && !state.currentAccount) {
					state.currentAccount = action.payload[0];
				}
			})
			.addCase(fetchUserAccounts.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Fetch single account
			.addCase(fetchAccount.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchAccount.fulfilled, (state, action) => {
				state.isLoading = false;
				state.currentAccount = action.payload;

				// Update this account in the accounts array if it exists
				const index = state.accounts.findIndex(
					(account) => account.id === action.payload.id
				);
				if (index !== -1) {
					state.accounts[index] = action.payload;
				} else {
					state.accounts.push(action.payload);
				}
			})
			.addCase(fetchAccount.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Create new account
			.addCase(createNewAccount.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(createNewAccount.fulfilled, (state, action) => {
				state.isLoading = false;
				state.accounts.push(action.payload);
				state.currentAccount = action.payload;
			})
			.addCase(createNewAccount.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Update existing account
			.addCase(updateExistingAccount.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateExistingAccount.fulfilled, (state, action) => {
				state.isLoading = false;

				// Update the account in the accounts array
				const index = state.accounts.findIndex(
					(account) => account.id === action.payload.id
				);
				if (index !== -1) {
					state.accounts[index] = action.payload;
				}

				// Update current account if it's the same one
				if (
					state.currentAccount &&
					state.currentAccount.id === action.payload.id
				) {
					state.currentAccount = action.payload;
				}
			})
			.addCase(updateExistingAccount.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Invite account member
			.addCase(inviteAccountMember.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(inviteAccountMember.fulfilled, (state) => {
				state.isLoading = false;
				// We'll need to fetch the updated account to get the new member
			})
			.addCase(inviteAccountMember.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Remove member
			.addCase(removeMember.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(removeMember.fulfilled, (state, action) => {
				state.isLoading = false;

				if (state.currentAccount) {
					// Remove the member from the current account
					state.currentAccount.members = state.currentAccount.members.filter(
						(member) => member.userId !== action.payload
					);

					// Also update the account in the accounts array
					const index = state.accounts.findIndex(
						(account) => account.id === state.currentAccount?.id
					);
					if (index !== -1) {
						state.accounts[index] = { ...state.currentAccount };
					}
				}
			})
			.addCase(removeMember.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})

			// Update member role
			.addCase(updateMemberRole.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(updateMemberRole.fulfilled, (state, action) => {
				state.isLoading = false;

				if (state.currentAccount) {
					// Update the member role in the current account
					state.currentAccount.members = state.currentAccount.members.map(
						(member) =>
							member.userId === action.payload.userId
								? {
										...member,
										role: action.payload.role as 'admin' | 'member' | 'viewer',
								  }
								: member
					);

					// Also update the account in the accounts array
					const index = state.accounts.findIndex(
						(account) => account.id === state.currentAccount?.id
					);
					if (index !== -1) {
						state.accounts[index] = { ...state.currentAccount };
					}
				}
			})
			.addCase(updateMemberRole.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setCurrentAccount, clearCurrentAccount, clearError } =
	accountsSlice.actions;

export default accountsSlice.reducer;
